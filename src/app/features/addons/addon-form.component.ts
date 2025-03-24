// src/app/features/addons/addon-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddonService } from './addon.service';
import { SubAddon } from './models/addon.model';

@Component({
  selector: 'app-addon-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <span class="top-label">{{ isEditMode ? 'Edit' : 'Create' }} Addon</span>
        <button mat-button color="primary" routerLink="/dashboard/addons">
          <mat-icon class="material-symbols-outlined">arrow_back</mat-icon> Back to List
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="addonForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Addon Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter addon name">
              <mat-error *ngIf="addonForm.get('name')?.hasError('required')">Name is required</mat-error>
            </mat-form-field>

            <div class="form-row toggle-row">
              <mat-slide-toggle formControlName="isMultiSelect" color="primary">
                Allow Multiple Selections
              </mat-slide-toggle>
              <span class="toggle-hint">{{ addonForm.get('isMultiSelect')?.value ? 'Customers can select multiple options' : 'Customers can select only one option' }}</span>
            </div>

            <div class="sub-addons-container">
              <div class="sub-addons-header">
                <h3>Options</h3>
                <button mat-mini-fab color="primary" type="button" (click)="addSubAddon()" aria-label="Add option">
                  <mat-icon class="material-symbols-outlined">add</mat-icon>
                </button>
              </div>

              <div formArrayName="subAddons" class="sub-addons-list">
                <div *ngFor="let subAddon of subAddonsArray.controls; let i = index" [formGroupName]="i" class="sub-addon-item">
                  <mat-form-field appearance="outline">
                    <mat-label>Option Name</mat-label>
                    <input matInput formControlName="name" placeholder="Enter option name">
                    <mat-error *ngIf="subAddon.get('name')?.hasError('required')">Name is required</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Price</mat-label>
                    <input matInput formControlName="price" type="number" min="0" step="0.01" placeholder="Enter price">
                    <span matTextSuffix>$</span>
                    <mat-error *ngIf="subAddon.get('price')?.hasError('required')">Price is required</mat-error>
                    <mat-error *ngIf="subAddon.get('price')?.hasError('min')">Price cannot be negative</mat-error>
                  </mat-form-field>

                  <button mat-icon-button color="warn" type="button" (click)="removeSubAddon(i)" aria-label="Remove option">
                    <mat-icon class="material-symbols-outlined">delete</mat-icon>
                  </button>
                </div>

                <div *ngIf="subAddonsArray.length === 0" class="no-options">
                  <p>No options added. Click the + button to add options.</p>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/dashboard/addons">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="addonForm.invalid || isSubmitting">
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
    .form-row {
      margin-bottom: 16px;
    }
    .toggle-row {
      display: flex;
      align-items: center;
    }
    .toggle-hint {
      margin-left: 12px;
      font-size: 12px;
      color: #666;
    }
    .sub-addons-container {
      margin-top: 24px;
      margin-bottom: 24px;
    }
    .sub-addons-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .sub-addons-header h3 {
      margin: 0;
    }
    .sub-addons-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .sub-addon-item {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .sub-addon-item mat-form-field:first-child {
      flex: 2;
    }
    .sub-addon-item mat-form-field:nth-child(2) {
      flex: 1;
    }
    .no-options {
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
      text-align: center;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }
  `]
})
export class AddonFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private addonService = inject(AddonService);
  private snackBar = inject(MatSnackBar);

  addonForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  addonId = '';

  get subAddonsArray() {
    return this.addonForm.get('subAddons') as FormArray;
  }

  ngOnInit(): void {
    this.initForm();
    
    this.addonId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.addonId;
    
    if (this.isEditMode) {
      this.loadAddonData();
    }
  }

  initForm(): void {
    this.addonForm = this.fb.group({
      name: ['', Validators.required],
      isMultiSelect: [false],
      subAddons: this.fb.array([])
    });
  }

  createSubAddonForm(subAddon?: SubAddon): FormGroup {
    return this.fb.group({
      _id: [subAddon?._id || ''],
      name: [subAddon?.name || '', Validators.required],
      price: [subAddon?.price || 0, [Validators.required, Validators.min(0)]]
    });
  }

  addSubAddon(subAddon?: SubAddon): void {
    this.subAddonsArray.push(this.createSubAddonForm(subAddon));
  }

  removeSubAddon(index: number): void {
    this.subAddonsArray.removeAt(index);
  }

  loadAddonData(): void {
    this.addonService.getAddonById(this.addonId).subscribe({
      next: (response) => {
        const addon = response.data.addon;
        
        this.addonForm.patchValue({
          name: addon.name,
          isMultiSelect: addon.isMultiSelect
        });
        
        // Clear existing sub-addons and add from response
        this.subAddonsArray.clear();
        
        if (addon.subAddons && addon.subAddons.length) {
          addon.subAddons.forEach(subAddon => {
            this.addSubAddon(subAddon);
          });
        }
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load addon', 'Close', { duration: 5000 });
        this.router.navigate(['/dashboard/addons']);
      }
    });
  }

  onSubmit(): void {
    if (this.addonForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.addonForm.value;

    if (this.isEditMode) {
      this.addonService.updateAddon(this.addonId, formData).subscribe({
        next: () => {
          this.snackBar.open('Addon updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard/addons']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(error.error?.message || 'Failed to update addon', 'Close', { duration: 5000 });
        }
      });
    } else {
      this.addonService.createAddon(formData).subscribe({
        next: () => {
          this.snackBar.open('Addon created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard/addons']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(error.error?.message || 'Failed to create addon', 'Close', { duration: 5000 });
        }
      });
    }
  }
}