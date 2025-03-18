// app/features/users/invite-dialog.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UsersService } from '../user.service';

@Component({
  selector: 'app-invite-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Invite Admin</h2>
    <form [formGroup]="inviteForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" placeholder="Enter email address">
          <mat-error *ngIf="inviteForm.controls.email.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="inviteForm.controls.email.hasError('email')">Please enter a valid email</mat-error>
        </mat-form-field>
      </div>
      <div mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="inviteForm.invalid || isLoading">
          {{ isLoading ? 'Sending...' : 'Send Invitation' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
  `]
})
export class InviteDialogComponent {
  private dialogRef = inject(MatDialogRef<InviteDialogComponent>);
  private usersService = inject(UsersService);

  inviteForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  isLoading = false;

  onSubmit(): void {
    if (this.inviteForm.valid) {
      this.isLoading = true;
      
      this.usersService.inviteAdmin(this.inviteForm.value.email || '').subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error inviting admin:', error);
          // You might want to show an error message here
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}