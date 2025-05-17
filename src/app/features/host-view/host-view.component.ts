import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { TableService } from '../tables/table.service';
import { ReservationService } from '../reservations/reservation.service';
import { Table } from '../tables/models/table.model';
import { ReservationCreateDto } from '../reservations/models/reservation.model';

@Component({
  selector: 'app-host-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './host-view.component.html',
  styleUrls: ['./host-view.component.scss']
})
export class HostViewComponent implements OnInit {
  private tableService = inject(TableService);
  private reservationService = inject(ReservationService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Table data
  tables: Table[] = [];
  filteredTables: Table[] = [];
  selectedTable: Table | null = null;
  isLoading = true;
  
  // Table view mode
  viewMode: 'grid' | 'list' = 'grid';
  
  // Table filtering
  availableCapacities: number[] = [0]; // 0 means "All"
  selectedCapacityFilter = 0;
  tablesByCapacity: Map<number, Table[]> = new Map();

  // Form
  guestForm: FormGroup;
  isSubmitting = false;

  // Current date for reservations
  currentDate = new Date();
  
  // Math for template
  Math = Math;

  constructor() {
    this.guestForm = this.fb.group({
      customerName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.email],
      partySize: [2, [Validators.required, Validators.min(1)]]
    });

    // When party size changes, filter tables
    this.guestForm.get('partySize')?.valueChanges.subscribe(size => {
      this.filterTablesBySize(size);
    });
  }

  ngOnInit(): void {
    this.loadTables();
  }

  // Load all tables from the service
  loadTables(): void {
    this.isLoading = true;
    this.tableService.getTables().subscribe({
      next: (response) => {
        this.tables = response.data.tables;
        this.processTableData();
        this.filterTablesBySize(this.guestForm.get('partySize')?.value || 2);
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load tables', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }
  
  // Process table data to extract available capacities and group tables
  processTableData(): void {
    // Extract unique capacities
    const capacities = new Set<number>();
    capacities.add(0); // Add "All" option
    
    // Group tables by capacity
    this.tablesByCapacity.clear();
    
    this.tables.forEach(table => {
      capacities.add(table.capacity);
      
      // Group tables by capacity
      if (!this.tablesByCapacity.has(table.capacity)) {
        this.tablesByCapacity.set(table.capacity, []);
      }
      this.tablesByCapacity.get(table.capacity)?.push(table);
    });
    
    // Sort capacities
    this.availableCapacities = Array.from(capacities).sort((a, b) => a - b);
  }

  // Set the view mode (grid or list)
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }
  
  // Filter tables by capacity
  filterByCapacity(capacity: number): void {
    this.selectedCapacityFilter = capacity;
    this.filterTablesBySize(this.guestForm.get('partySize')?.value || 2);
  }

  // Filter tables based on capacity and availability
  filterTablesBySize(partySize: number): void {
    // If a specific capacity filter is selected (not "All")
    if (this.selectedCapacityFilter > 0) {
      this.filteredTables = this.tables.filter(table => 
        table.capacity === this.selectedCapacityFilter && 
        table.capacity >= partySize
      );
    } else {
      // "All" capacities filter
      this.filteredTables = this.tables.filter(table => 
        table.capacity >= partySize
      );
    }
    
    // Re-process table data for the list view
    this.updateTablesByCapacity();
  }
  
  // Update tables by capacity for list view
  updateTablesByCapacity(): void {
    this.tablesByCapacity.clear();
    
    this.filteredTables.forEach(table => {
      if (!this.tablesByCapacity.has(table.capacity)) {
        this.tablesByCapacity.set(table.capacity, []);
      }
      this.tablesByCapacity.get(table.capacity)?.push(table);
    });
  }

  // Select a table
  selectTable(table: Table): void {
    this.selectedTable = table;
  }

  // Create a reservation for the selected table
  createReservation(): void {
    if (this.guestForm.invalid || !this.selectedTable) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.guestForm.value;
    
    // Format date for API
    const reservationDate = new Date();
    
    const reservationData: ReservationCreateDto = {
      customerName: formValue.customerName,
      phoneNumber: formValue.phoneNumber,
      email: formValue.email || '',
      partySize: formValue.partySize,
      reservationDate: reservationDate.toISOString(),
      specialRequests: ''
    };

    this.reservationService.createReservation(reservationData).subscribe({
      next: (response) => {
        // Assign table to the new reservation
        this.reservationService.assignTable(response.data.reservation._id, {
          tableId: this.selectedTable!._id
        }).subscribe({
          next: () => {
            // Update table status locally
            if (this.selectedTable) {
              this.selectedTable.status = 'Occupied';
              this.selectedTable.currentOccupancy = formValue.partySize;
            }
            
            // Update table status on server
            this.tableService.updateTableStatus(this.selectedTable!._id, {
              status: 'Occupied',
              currentOccupancy: formValue.partySize
            }).subscribe();
            
            this.snackBar.open('Guest seated successfully', 'Close', { duration: 3000 });
            this.isSubmitting = false;
            
            // Reset form and selection
            this.guestForm.reset({
              customerName: '',
              phoneNumber: '',
              email: '',
              partySize: 2
            });
            this.selectedTable = null;
            
            // Reload tables to refresh status
            this.loadTables();
          },
          error: (error) => {
            this.snackBar.open(error.error?.message || 'Failed to assign table', 'Close', { duration: 5000 });
            this.isSubmitting = false;
          }
        });
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to create reservation', 'Close', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }
}