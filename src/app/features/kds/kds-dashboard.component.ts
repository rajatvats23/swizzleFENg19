// src/app/features/kds/kds-dashboard.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { KitchenDisplayService } from './kds.service';
import { Order } from './models/kds.model';
import { Subscription } from 'rxjs';
import { KdsOrderCardComponent } from './kds-order-card.component';
import { KdsNotificationService } from './kds-notification.service';
import { MatDialog } from '@angular/material/dialog';
import { KdsOrderDetailDialogComponent } from './kds-order-detail-dialog.component';
import { KdsNotificationOverlayComponent } from './kds-notification-overlay.component';

@Component({
  selector: 'app-kds-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    KdsOrderCardComponent,
    KdsNotificationOverlayComponent
  ],
  template: `
    <div class="kds-container">
  <div class="kds-header">
    <h1>Kitchen Display System</h1>
    
    <div class="header-actions">
      <mat-form-field appearance="outline">
        <mat-label>Sort By</mat-label>
        <mat-select [(ngModel)]="sortBy" (selectionChange)="applyFilters()">
          <mat-option value="time">Time (Oldest First)</mat-option>
          <mat-option value="time-desc">Time (Newest First)</mat-option>
          <mat-option value="table">Table Number</mat-option>
        </mat-select>
      </mat-form-field>

      <button mat-raised-button color="primary" class="refresh-button" (click)="refreshOrders()">
        <mat-icon class="material-symbols-outlined">refresh</mat-icon> Refresh
      </button>
    </div>
  </div>

  <mat-tab-group mat-stretch-tabs="false" class="order-tabs" animationDuration="200ms">
    <mat-tab>
      <ng-template mat-tab-label>
        <div class="tab-label">
          All Orders
          <div class="badge">{{filteredOrders.length}}</div>
        </div>
      </ng-template>

      <div class="orders-grid">
        <ng-container *ngIf="filteredOrders.length > 0; else noOrders">
          <app-kds-order-card
            *ngFor="let order of filteredOrders; trackBy: trackById"
            [order]="order"
            (statusChanged)="refreshOrders()"
            (click)="viewOrderDetails(order._id)"
            class="order-item"
          ></app-kds-order-card>
        </ng-container>
        
        <ng-template #noOrders>
          <div class="no-orders">
            <mat-icon class="material-symbols-outlined">restaurant</mat-icon>
            <p>No active orders at the moment</p>
          </div>
        </ng-template>
      </div>
    </mat-tab>

    <mat-tab>
      <ng-template mat-tab-label>
        <div class="tab-label">
          Placed
          <div class="badge urgent">{{getOrdersByStatus('placed').length}}</div>
        </div>
      </ng-template>
      
      <!-- Similar content structure as the first tab, filtered for placed orders -->
      <div class="orders-grid">
        <ng-container *ngIf="getOrdersByStatus('placed').length > 0; else noPlacedOrders">
          <app-kds-order-card
            *ngFor="let order of getOrdersByStatus('placed'); trackBy: trackById"
            [order]="order"
            (statusChanged)="refreshOrders()"
            (click)="viewOrderDetails(order._id)"
            class="order-item"
          ></app-kds-order-card>
        </ng-container>
        
        <ng-template #noPlacedOrders>
          <div class="no-orders">
            <mat-icon class="material-symbols-outlined">check_circle</mat-icon>
            <p>No new orders waiting to be prepared</p>
          </div>
        </ng-template>
      </div>
    </mat-tab>

    <mat-tab>
      <ng-template mat-tab-label>
        <div class="tab-label">
          Preparing
          <div class="badge warning">{{getOrdersByStatus('preparing').length}}</div>
        </div>
      </ng-template>
      
      <!-- Similar content for preparing orders -->
    </mat-tab>

    <mat-tab>
      <ng-template mat-tab-label>
        <div class="tab-label">
          Ready
          <div class="badge success">{{getOrdersByStatus('ready').length}}</div>
        </div>
      </ng-template>
      
      <!-- Similar content for ready orders -->
    </mat-tab>
  </mat-tab-group>
  
  <app-kds-notification-overlay></app-kds-notification-overlay>
</div>
  `,
  styles: [
    `.kds-container {
      width: 100%;
      max-width: 1800px;
      margin: 0 auto;
      padding: 24px;
      background-color: #f8f9fa;
    }
    
    .kds-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      
      h1 {
        font-size: 28px;
        font-weight: 500;
        color: #212529;
        margin: 0;
      }
    }
    
    .header-actions {
      display: flex;
      gap: 16px;
      align-items: center;
      
      mat-form-field {
        width: 220px;
        margin-bottom: 0;
      }
      
      .refresh-button {
        height: 44px;
      }
    }
    
    .order-tabs {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      overflow: hidden;
      
      ::ng-deep .mat-mdc-tab-header {
        border-bottom: 1px solid #eee;
      }
    }
    
    .tab-label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 8px;
      border-radius: 12px;
      background-color: #5c6bc0;
      color: white;
      font-size: 12px;
      font-weight: 500;
      
      &.urgent {
        background-color: #f44336;
      }
      
      &.warning {
        background-color: #ff9800;
      }
      
      &.success {
        background-color: #4caf50;
      }
    }
    
    .orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 24px;
      padding: 24px;
      
      .order-item {
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
      }
    }
    
    .no-orders {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 0;
      color: #6c757d;
      
      mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 16px;
        opacity: 0.7;
      }
      
      p {
        font-size: 18px;
        margin: 0;
      }
    }
    
    @media (max-width: 768px) {
      .kds-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .header-actions {
        width: 100%;
      }
      
      .orders-grid {
        grid-template-columns: 1fr;
      }
    }
    `,
  ],
})
export class KdsDashboardComponent implements OnInit, OnDestroy {
  private kdsService = inject(KitchenDisplayService);
  private snackBar = inject(MatSnackBar);
  private notificationService = inject(KdsNotificationService);
  private dialog = inject(MatDialog);
  private lastOrderCount = 0;

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  sortBy: 'time' | 'time-desc' | 'table' = 'time';

  private subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      this.kdsService.activeOrders$.subscribe((orders) => {
        // Check for new orders
        if (this.lastOrderCount > 0 && orders.length > this.lastOrderCount) {
          // Find new orders (those not in the previous set)
          const previousOrders = this.orders;
          const newOrders = orders.filter(
            (order) =>
              !previousOrders.some(
                (prevOrder) => prevOrder._id === order._id
              ) && order.status === 'placed'
          );

          // Add notifications for new orders
          newOrders.forEach((order) => {
            this.notificationService.addNotification(order);
          });
        }

        this.lastOrderCount = orders.length;
        this.orders = orders;
        this.applyFilters();
      })
    );

    // Start polling for updates
    this.kdsService.startPolling();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.kdsService.stopPolling();
  }

  refreshOrders(): void {
    this.kdsService.refreshOrders();
    this.snackBar.open('Orders refreshed', 'Close', { duration: 3000 });
  }

  viewOrderDetails(orderId: string): void {
    this.dialog
      .open(KdsOrderDetailDialogComponent, {
        data: { orderId },
        width: '800px',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.refreshOrders();
        }
      });
  }

  applyFilters(): void {
    let sorted = [...this.orders];

    // Apply sorting
    switch (this.sortBy) {
      case 'time':
        sorted = sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'time-desc':
        sorted = sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'table':
        sorted = sorted.sort((a, b) =>
          a.table.tableNumber.localeCompare(b.table.tableNumber)
        );
        break;
    }

    this.filteredOrders = sorted;
  }

  countOrdersByStatus(status: string): number {
    return this.orders.filter((order) => order.status === status).length;
  }

  getOrdersByStatus(status: string): Order[] {
    return this.filteredOrders.filter((order) => order.status === status);
  }

  trackById(index: number, order: Order): string {
    return order._id;
  }
}


