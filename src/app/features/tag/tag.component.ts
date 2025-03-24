// src/app/features/tags/tag-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/generics/cofirm-dialog.component';
import { AuthService } from '../auth/auth.service';
import { TagService } from './tag.service';
import { Tag } from '../products/product.model';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ],
  template: `
    <div class="tag-container">
      <div class="header-actions">
        <span class="header-title">Tag Management</span>
      </div>

      <div class="tag-grid">
        <mat-card class="tag-form-card">
          <mat-card-header>
            <mat-card-title>{{ isEditMode ? 'Edit Tag' : 'Add New Tag' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tag Name</mat-label>
                <input matInput [formControl]="tagNameControl" placeholder="Enter tag name">
                <mat-error *ngIf="tagNameControl.hasError('required')">Tag name is required</mat-error>
              </mat-form-field>
              
              <div class="form-actions">
                <button mat-button type="button" *ngIf="isEditMode" (click)="cancelEdit()">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="tagNameControl.invalid || isSubmitting">
                  {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Tags</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="tags" class="tag-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let tag">{{tag.name}}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let tag">
                  <button mat-icon-button color="accent" (click)="editTag(tag)" *ngIf="canManageTags()" matTooltip="Edit">
                    <mat-icon class="material-symbols-outlined">edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="confirmDelete(tag)" *ngIf="canManageTags()" matTooltip="Delete">
                    <mat-icon class="material-symbols-outlined">delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="2" style="text-align: center; padding: 16px;">
                  No tags found
                </td>
              </tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .tag-container {
      width: 100%;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .tag-grid {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 20px;
    }
    .tag-form-card {
      position: sticky;
      top: 20px;
    }
    .full-width {
      width: 100%;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 16px;
    }
    .tag-table {
      width: 100%;
    }
    @media (max-width: 767px) {
      .tag-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TagListComponent implements OnInit {
  private tagService = inject(TagService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  tags: Tag[] = [];
  displayedColumns: string[] = ['name', 'actions'];
  isLoading = false;
  isSubmitting = false;
  isEditMode = false;
  editTagId = '';

  tagNameControl = new FormControl('', [Validators.required]);

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.isLoading = true;
    this.tagService.getTags().subscribe({
      next: (response) => {
        this.tags = response.data.tags;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tags:', error);
        this.snackBar.open(error.error?.message || 'Failed to load tags', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.tagNameControl.invalid) {
      return;
    }

    this.isSubmitting = true;
    const tagName = this.tagNameControl.value || '';

    if (this.isEditMode) {
      this.tagService.updateTag(this.editTagId, { name: tagName }).subscribe({
        next: () => {
          this.snackBar.open('Tag updated successfully', 'Close', { duration: 3000 });
          this.resetForm();
          this.loadTags();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(error.error?.message || 'Failed to update tag', 'Close', { duration: 5000 });
        }
      });
    } else {
      this.tagService.createTag({ name: tagName }).subscribe({
        next: () => {
          this.snackBar.open('Tag created successfully', 'Close', { duration: 3000 });
          this.resetForm();
          this.loadTags();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(error.error?.message || 'Failed to create tag', 'Close', { duration: 5000 });
        }
      });
    }
  }

  editTag(tag: Tag): void {
    this.isEditMode = true;
    this.editTagId = tag._id;
    this.tagNameControl.setValue(tag.name);
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.isEditMode = false;
    this.editTagId = '';
    this.tagNameControl.reset();
    this.isSubmitting = false;
  }

  confirmDelete(tag: Tag): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Tag',
        message: `Are you sure you want to delete the tag "${tag.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteTag(tag._id);
      }
    });
  }

  deleteTag(id: string): void {
    this.tagService.deleteTag(id).subscribe({
      next: () => {
        this.snackBar.open('Tag deleted successfully', 'Close', { duration: 3000 });
        this.loadTags();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Error deleting tag', 'Close', { duration: 5000 });
      }
    });
  }

  canManageTags(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'manager';
  }
}