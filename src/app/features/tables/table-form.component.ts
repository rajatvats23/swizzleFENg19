// src/app/features/tables/table-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TableService } from './table.service';

@Component({
  selector: 'app-table-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <span class="top-label">{{ isEditMode ? 'Edit' : 'Create' }} Table</span>
        <button mat-button color="primary" routerLink="/tables">
          <mat-icon class="material-symbols-outlined">arrow_back</mat-icon> Back to List
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="tableForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Table Number</mat-label>
              <input matInput formControlName="tableNumber" placeholder="Enter table number">
              <mat-error *ngIf="tableForm.get('tableNumber')?.hasError('required')">Table number is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Capacity</mat-label>
              <input matInput formControlName="capacity" type="number" min="1" placeholder="Enter capacity">
              <mat-error *ngIf="tableForm.get('capacity')?.hasError('required')">Capacity is required</mat-error>
              <mat-error *ngIf="tableForm.get('capacity')?.hasError('min')">Capacity must be at least 1</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width" *ngIf="isEditMode">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="Available">Available</mat-option>
                <mat-option value="Reserved">Reserved</mat-option>
                <mat-option value="Occupied">Occupied</mat-option>
                <mat-option value="Cleaning">Cleaning</mat-option>
                <mat-option value="Out of Service">Out of Service</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width" *ngIf="isEditMode">
              <mat-label>Current Occupancy</mat-label>
              <input matInput formControlName="currentOccupancy" type="number" min="0">
              <mat-error *ngIf="tableForm.get('currentOccupancy')?.hasError('min')">Occupancy cannot be negative</mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/tables">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="tableForm.invalid || isSubmitting">
                {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      width: 100%;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
  `]
})
export class TableFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tableService = inject(TableService);
  private snackBar = inject(MatSnackBar);

  tableForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  tableId = '';

  ngOnInit(): void {
    alert()
    this.initForm();
    
    this.tableId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.tableId;
    
    if (this.isEditMode) {
      this.loadTableData();
    }
  }

  initForm(): void {
    this.tableForm = this.fb.group({
      tableNumber: ['', Validators.required],
      capacity: [1, [Validators.required, Validators.min(1)]],
      status: ['Available'],
      currentOccupancy: [0, Validators.min(0)]
    });
  }

  loadTableData(): void {
    this.tableService.getTableById(this.tableId).subscribe({
      next: (response) => {
        const table = response.data.table;
        
        this.tableForm.patchValue({
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          status: table.status,
          currentOccupancy: table.currentOccupancy
        });
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load table', 'Close', { duration: 5000 });
        this.router.navigate(['/tables']);
      }
    });
  }

  onSubmit(): void {
    if (this.tableForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.tableForm.value;

    if (this.isEditMode) {
      this.tableService.updateTable(this.tableId, formData).subscribe({
        next: () => {
          this.snackBar.open('Table updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/tables']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(error.error?.message || 'Failed to update table', 'Close', { duration: 5000 });
        }
      });
    } else {
      this.tableService.createTable(formData).subscribe({
        next: () => {
          this.snackBar.open('Table created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/tables']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(error.error?.message || 'Failed to create table', 'Close', { duration: 5000 });
        }
      });
    }
  }
}