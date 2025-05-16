import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';

import { TableService } from './table.service';
import { Table } from './models/table.model';
import { AuthService } from '../auth/auth.service';
import { QrCodeDialogComponent } from './qr-code-dialog.component';
import { GenericTableComponent, TableColumn } from '../../shared/generics/table/table.component';
import { ConfirmDialogComponent } from '../../shared/generics/cofirm-dialog.component';

interface SortEvent {
  active: string;
  direction: 'asc' | 'desc' | '';
}

interface PageEvent {
  pageIndex: number;
  pageSize: number;
}

interface FilterEvent {
  column: string;
  value: string;
}

@Component({
  selector: 'app-table-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GenericTableComponent,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatSelectModule
  ],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="search-container">
          <mat-form-field appearance="outline">
            <mat-icon class="material-symbols-outlined" matPrefix>search</mat-icon>
            <input matInput placeholder="Search tables" 
                   [ngModel]="searchQuery()"
                   (ngModelChange)="onSearchChange($event)">
          </mat-form-field>
        </div>
        
        <div class="actions-container">
          <button mat-raised-button color="primary" (click)="onAddTable()" *ngIf="isManager()">
            <mat-icon class="material-symbols-outlined">add_circle</mat-icon>
            Add Table
          </button>
          
          <button mat-icon-button [matMenuTriggerFor]="columnsMenu">
            <mat-icon class="material-symbols-outlined">view_column</mat-icon>
          </button>
          
          <button mat-icon-button [matMenuTriggerFor]="filterMenu">
            <mat-icon class="material-symbols-outlined">filter_list</mat-icon>
          </button>
        </div>
        
        <!-- Columns Menu -->
        <mat-menu #columnsMenu="matMenu">
          @for (column of columnsConfig(); track column.key) {
            <div class="column-option" (click)="$event.stopPropagation()">
              <mat-checkbox 
                [checked]="column.visible" 
                (change)="toggleColumn(column.key)">
                {{ column.header }}
              </mat-checkbox>
            </div>
          }
        </mat-menu>
        
        <!-- Advanced Filter Menu -->
        <mat-menu #filterMenu="matMenu">
          <div class="filter-container" (click)="$event.stopPropagation()">
            <h3>Advanced Filters</h3>
            
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [ngModel]="queryParams().status" (ngModelChange)="onStatusFilterChange($event)">
                <mat-option value="">All Statuses</mat-option>
                <mat-option value="Available">Available</mat-option>
                <mat-option value="Reserved">Reserved</mat-option>
                <mat-option value="Occupied">Occupied</mat-option>
                <mat-option value="Cleaning">Cleaning</mat-option>
                <mat-option value="Out of Service">Out of Service</mat-option>
              </mat-select>
            </mat-form-field>
            
            <div class="filter-actions">
              <button mat-button (click)="clearFilters()">Clear All</button>
              <button mat-raised-button color="primary" (click)="applyFilters()">Apply</button>
            </div>
          </div>
        </mat-menu>
      </div>
      
      <!-- Progress Bar -->
      @if (isLoading()) {
        <mat-progress-bar mode="indeterminate" color="primary"></mat-progress-bar>
      }
      
      <!-- Table Component -->
      <app-generic-table 
        [columns]="visibleColumns()"
        [data]="tables()"
        [totalItems]="totalItems()"
        [pageSize]="queryParams().limit"
        [trackBy]="'_id'"
        [noDataMessage]="'No tables available'"
        [showPagination]="true"
        [showActions]="true"
        [actionsTemplate]="actionsTemplate"
        (sortChange)="onSortChange($event)"
        (pageChange)="onPageChange($event)"
        (filterChange)="onFilterChange($event)"
        (rowClick)="onViewTable($event)">
      </app-generic-table>
    </div>
    
    <ng-template #actionsTemplate let-table>
      <div class="actions">
        <button 
          class="action-btn" 
          (click)="onViewTable(table); $event.stopPropagation()">
          <mat-icon class="material-symbols-outlined">visibility</mat-icon>
        </button>
        <button 
          class="action-btn" 
          (click)="showQRCode(table); $event.stopPropagation()">
          <mat-icon class="material-symbols-outlined">qr_code</mat-icon>
        </button>
        <button 
          class="action-btn" 
          (click)="onEditTable(table); $event.stopPropagation()"
          *ngIf="isManager()">
          <mat-icon class="material-symbols-outlined">edit</mat-icon>
        </button>
        <button 
          class="action-btn delete" 
          (click)="confirmDelete(table); $event.stopPropagation()"
          *ngIf="isManager()">
          <mat-icon class="material-symbols-outlined">delete</mat-icon>
        </button>
      </div>
    </ng-template>
  `,
  styles: [`
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .search-container {
      width: 300px;
    }
    
    .actions-container {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    .column-option {
      padding: 8px 16px;
    }
    
    .filter-container {
      padding: 16px;
      width: 300px;
    }
    
    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
    
    .actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    
    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #555;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      transition: background-color 0.2s;
    }
    
    .action-btn:hover {
      background-color: rgba(0, 156, 76, 0.1);
    }
    
    .action-btn.delete:hover {
      background-color: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }
  `]
})
export class TableListComponent {
  private tableService = inject(TableService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // Table data signals
  tables = signal<Table[]>([]);
  isLoading = signal<boolean>(false);
  totalItems = signal<number>(0);
  searchQuery = signal<string>('');
  
  // Query parameters signal
  queryParams = signal({
    page: 0,
    limit: 10,
    sort: 'tableNumber',
    direction: 'asc' as 'asc' | 'desc',
    search: '',
    status: ''
  });

  // Column definitions with visibility flag
  columnsConfig = signal<Array<TableColumn<Table> & { visible: boolean }>>([
    { 
      key: 'tableNumber', 
      header: 'TABLE NUMBER', 
      sortable: true,
      filterable: true,
      visible: true
    },
    { 
      key: 'capacity', 
      header: 'CAPACITY', 
      sortable: true,
      filterable: true,
      visible: true
    },
    { 
      key: 'status', 
      header: 'STATUS', 
      sortable: true,
      filterable: true,
      visible: true
    },
    { 
      key: 'occupancy', 
      header: 'OCCUPANCY', 
      sortable: false,
      filterable: false,
      visible: true,
      render: (table: Table) => `${table.currentOccupancy} / ${table.capacity}` 
    },
    { 
      key: 'updatedAt', 
      header: 'LAST UPDATED', 
      sortable: true,
      filterable: false,
      visible: true,
      render: (table: Table) => new Date(table.updatedAt).toLocaleString() 
    }
  ]);

  // Computed signal for visible columns
  visibleColumns = computed(() => {
    return this.columnsConfig().filter(col => col.visible);
  });

  constructor() {
    this.loadTables();
  }

  loadTables(): void {
    this.isLoading.set(true);
    
    this.tableService.getTables(this.queryParams()).subscribe({
      next: (response) => {
        this.tables.set(response.data.tables);
        this.totalItems.set(response.data.total || response.data.tables.length);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tables:', error);
        this.snackBar.open(error.error?.message || 'Failed to load tables', 'Close', { duration: 5000 });
        this.isLoading.set(false);
      }
    });
  }

  // Search, filter, and column visibility methods
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.queryParams.update(params => ({
      ...params,
      search: query,
      page: 0 // Reset to first page
    }));
    this.loadTables();
  }

  toggleColumn(key: string): void {
    this.columnsConfig.update(columns => 
      columns.map(col => 
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  }

  onStatusFilterChange(status: string): void {
    this.queryParams.update(params => ({
      ...params,
      status,
      page: 0
    }));
  }

  clearFilters(): void {
    this.queryParams.update(params => ({
      ...params,
      status: '',
      page: 0
    }));
    this.searchQuery.set('');
  }

  applyFilters(): void {
    this.loadTables();
  }

  // Sort and pagination event handlers
  onSortChange(sort: SortEvent): void {
    this.queryParams.update(params => ({
      ...params,
      sort: sort.active,
      direction: sort.direction as 'asc' | 'desc'
    }));
    
    this.loadTables();
  }

  onPageChange(event: PageEvent): void {
    this.queryParams.update(params => ({
      ...params,
      page: event.pageIndex,
      limit: event.pageSize
    }));
    
    this.loadTables();
  }

  onFilterChange(event: FilterEvent): void {
    this.queryParams.update(params => {
      const updatedParams = { ...params, page: 0 }; // Reset to first page
      
      if (event.column === 'status') {
        updatedParams.status = event.value;
      } else if (event.column === 'tableNumber') {
        updatedParams.search = event.value;
      }
      
      return updatedParams;
    });
    
    this.loadTables();
  }

  // Action handlers
  onAddTable(): void {
    if (this.isManager()) {
      this.router.navigate(['/tables/create']);
    } else {
      this.snackBar.open('Only managers can add tables', 'Close', { duration: 3000 });
    }
  }

  onEditTable(table: Table): void {
    if (this.isManager()) {
      this.router.navigate(['/tables/edit', table._id]);
    } else {
      this.snackBar.open('Only managers can edit tables', 'Close', { duration: 3000 });
    }
  }

  onViewTable(table: Table): void {
    this.router.navigate(['/tables', table._id]);
  }

  showQRCode(table: Table): void {
    this.dialog.open(QrCodeDialogComponent, {
      data: { table },
      width: '400px'
    });
  }

  isManager(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager';
  }

  confirmDelete(table: Table): void {
    if (!this.isManager()) {
      this.snackBar.open('Only managers can delete tables', 'Close', { duration: 3000 });
      return;
    }
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Table',
        message: `Are you sure you want to delete table "${table.tableNumber}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteTable(table._id);
      }
    });
  }

  deleteTable(id: string): void {
    this.tableService.deleteTable(id).subscribe({
      next: () => {
        this.snackBar.open('Table deleted successfully', 'Close', { duration: 3000 });
        this.loadTables();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Error deleting table', 'Close', { duration: 5000 });
      }
    });
  }
}