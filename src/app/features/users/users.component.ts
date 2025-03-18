// app/features/users/users.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { UsersService } from './user.service';
import { InviteDialogComponent } from './invite-dialog/invite-dialog.component';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  countryCode: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule
  ],
  template: `
    <div class="users-container">
      <div class="header-actions">
        <h1>Users Management</h1>
        <button mat-raised-button color="primary" (click)="openInviteDialog()">
          <mat-icon class="material-symbols-outlined">person_add</mat-icon> Invite Admin
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="users" class="users-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let user">{{user.firstName}} {{user.lastName}}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let user">{{user.email}}</td>
            </ng-container>

            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let user">{{user.countryCode}} {{user.phoneNumber}}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let user">{{user.role}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button color="warn" (click)="deleteUser(user)" *ngIf="user.role !== 'superadmin'">
                  <mat-icon class="material-symbols-outlined">delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .users-container {
      width: 100%;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .users-table {
      width: 100%;
    }
  `]
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private dialog = inject(MatDialog);

  users: User[] = [];
  displayedColumns: string[] = ['name', 'email', 'phone', 'role', 'actions'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (response) => {
        this.users = response.data.users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  openInviteDialog(): void {
    const dialogRef = this.dialog.open(InviteDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.usersService.deleteUser(user._id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }
}