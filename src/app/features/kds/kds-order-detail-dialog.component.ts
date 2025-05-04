// src/app/features/kds/kds-order-detail-dialog.component.ts
import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { KitchenDisplayService } from './kds.service';
import { Order, OrderItem } from './models/kds.model';
import { MatSnackBar } from '@angular/material/snack-bar';

interface OrderDetailData {
  orderId: string;
}

@Component({
  selector: 'app-kds-order-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatSelectModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Order Details</h2>
    <div mat-dialog-content *ngIf="order">
      <div class="order-header">
        <div class="order-meta">
          <div class="meta-item">
            <span class="label">Order ID:</span>
            <span class="value">{{ order._id }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Table:</span>
            <span class="value">{{ order.table.tableNumber }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Time:</span>
            <span class="value">{{ formatDateTime(order.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Status:</span>
            <mat-chip [color]="getStatusColor(order.status)" selected>
              {{ order.status | titlecase }}
            </mat-chip>
          </div>
        </div>

        <div class="customer-info" *ngIf="isCustomerObject()">
          <h3>Customer Info</h3>
          <div class="meta-item">
            <span class="label">Name:</span>
            <span class="value">{{ getCustomerName() }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Phone:</span>
            <span class="value">{{ getCustomerPhone() }}</span>
          </div>
        </div>
      </div>

      <mat-divider class="section-divider"></mat-divider>

      <div class="order-items">
        <h3>Order Items</h3>

        <div class="item-card" *ngFor="let item of order.items">
          <div class="item-header">
            <div class="item-title">
              <span class="quantity">{{ item.quantity }}x</span>
              <span class="name">{{ item.product.name }}</span>
            </div>
            <div class="item-status">
              <span class="label">Status:</span>
              <mat-select
                [(ngModel)]="item.status"
                (selectionChange)="updateItemStatus(item._id, item.status)"
                [disabled]="isUpdating"
              >
                <mat-option value="ordered">Ordered</mat-option>
                <mat-option value="preparing">Preparing</mat-option>
                <mat-option value="ready">Ready</mat-option>
                <mat-option value="delivered">Delivered</mat-option>
              </mat-select>
            </div>
          </div>

          <div
            class="item-addons"
            *ngIf="item.selectedAddons && item.selectedAddons.length"
          >
            <div
              class="addon"
              *ngFor="let addonSelection of item.selectedAddons"
            >
              <span class="addon-name">{{ addonSelection.addon.name }}:</span>
              <span class="addon-value">{{
                addonSelection.subAddon.name
              }}</span>
              <span class="addon-price"
                >(+{{ addonSelection.subAddon.price | currency }})</span
              >
            </div>
          </div>

          <div class="item-instructions" *ngIf="item.specialInstructions">
            <mat-icon class="material-symbols-outlined" color="warn"
              >priority_high</mat-icon
            >
            <span>{{ item.specialInstructions }}</span>
          </div>

          <div class="item-price">
            <span>{{ item.price * item.quantity | currency }}</span>
          </div>
        </div>
      </div>

      <mat-divider class="section-divider"></mat-divider>

      <div class="order-notes" *ngIf="order.specialInstructions">
        <h3>Special Instructions</h3>
        <div class="note-box">
          <mat-icon class="material-symbols-outlined" color="warn"
            >info</mat-icon
          >
          <span>{{ order.specialInstructions }}</span>
        </div>
      </div>

      <div class="order-summary">
        <div class="total-amount">
          <span class="label">Total Amount:</span>
          <span class="value">{{ order.totalAmount | currency }}</span>
        </div>
      </div>
    </div>

    <div class="loading-content" *ngIf="isLoading && !order">
      <p>Loading order details...</p>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Close</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="isUpdating || !canUpdateStatus()"
        *ngIf="order"
        (click)="updateOrderStatus()"
      >
        {{ getNextStatusButtonText() }}
      </button>
    </div>
  `,
  styles: [
    `
      .order-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 24px;
      }

      .order-meta,
      .customer-info {
        flex: 1;
      }

      .meta-item {
        margin-bottom: 8px;
        display: flex;
        align-items: center;
      }

      .label {
        font-weight: 500;
        margin-right: 8px;
        min-width: 70px;
      }

      .section-divider {
        margin: 16px 0;
      }

      h3 {
        margin-bottom: 16px;
        color: #333;
      }

      .item-card {
        background-color: #f5f5f5;
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 12px;
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .item-title {
        display: flex;
        align-items: center;
      }

      .quantity {
        font-weight: 700;
        margin-right: 8px;
      }

      .name {
        font-weight: 500;
      }

      .item-status {
        display: flex;
        align-items: center;
      }

      .item-status .mat-select {
        min-width: 120px;
      }

      .item-addons {
        margin: 8px 0;
        padding-left: 16px;
      }

      .addon {
        margin-bottom: 4px;
        font-size: 14px;
      }

      .addon-name {
        font-weight: 500;
        margin-right: 4px;
      }

      .addon-price {
        color: #666;
        margin-left: 4px;
      }

      .item-instructions {
        display: flex;
        align-items: flex-start;
        background-color: rgba(255, 152, 0, 0.1);
        padding: 8px;
        border-radius: 4px;
        margin-top: 8px;
      }

      .item-instructions mat-icon {
        margin-right: 8px;
      }

      .item-price {
        text-align: right;
        margin-top: 8px;
        font-weight: 500;
      }

      .note-box {
        background-color: rgba(255, 152, 0, 0.1);
        padding: 12px;
        border-radius: 4px;
        display: flex;
        align-items: flex-start;
      }

      .note-box mat-icon {
        margin-right: 8px;
        margin-top: 2px;
      }

      .order-summary {
        margin-top: 24px;
        display: flex;
        justify-content: flex-end;
      }

      .total-amount {
        font-size: 18px;
      }

      .total-amount .value {
        font-weight: 700;
      }

      .loading-content {
        padding: 24px;
        text-align: center;
      }
    `,
  ],
})
export class KdsOrderDetailDialogComponent implements OnInit {
  private kdsService = inject(KitchenDisplayService);
  private snackBar = inject(MatSnackBar);

  order: Order | null = null;
  isLoading = true;
  isUpdating = false;

  constructor(
    public dialogRef: MatDialogRef<KdsOrderDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderDetailData
  ) {}

  ngOnInit(): void {
    if (this.data.orderId) {
      this.loadOrderDetails(this.data.orderId);
    }
  }

  loadOrderDetails(orderId: string): void {
    this.isLoading = true;
    this.kdsService.getOrderById(orderId).subscribe({
      next: (response) => {
        this.order = response.data.order;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(
          error.error?.message || 'Failed to load order details',
          'Close',
          { duration: 5000 }
        );
        this.isLoading = false;
        this.dialogRef.close();
      },
    });
  }

  formatDateTime(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'placed':
        return 'warn';
      case 'preparing':
        return 'accent';
      case 'ready':
        return 'primary';
      default:
        return '';
    }
  }

  updateItemStatus(itemId: string, newStatus: string): void {
    if (!this.order) return;

    this.isUpdating = true;
    this.kdsService
      .updateOrderItemStatus(this.order._id, itemId, {
        status: newStatus as any,
      })
      .subscribe({
        next: () => {
          this.snackBar.open(`Item status updated to ${newStatus}`, 'Close', {
            duration: 3000,
          });
          this.isUpdating = false;
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || 'Failed to update item status',
            'Close',
            { duration: 5000 }
          );
          this.isUpdating = false;
          // Reload to get current state
          this.loadOrderDetails(this.order!._id);
        },
      });
  }

  canUpdateStatus(): boolean {
    if (!this.order) return false;

    // Can't update completed orders
    return this.order.status !== 'completed';
  }

  getNextStatus(): string {
    if (!this.order) return '';

    switch (this.order.status) {
      case 'placed':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'delivered';
      case 'delivered':
        return 'completed';
      default:
        return '';
    }
  }

  getNextStatusButtonText(): string {
    if (!this.order) return '';

    switch (this.order.status) {
      case 'placed':
        return 'Start Preparing';
      case 'preparing':
        return 'Mark as Ready';
      case 'ready':
        return 'Mark as Delivered';
      case 'delivered':
        return 'Complete Order';
      default:
        return '';
    }
  }

  isCustomerObject(): boolean {
    return Boolean(this.order?.customer && typeof this.order.customer !== 'string');
  }
  
  getCustomerName(): string {
    return this.isCustomerObject() ? (this.order!.customer as any).name : 'N/A';
  }
  
  getCustomerPhone(): string {
    return this.isCustomerObject() ? (this.order!.customer as any).phoneNumber : 'N/A';
  }

  updateOrderStatus(): void {
    if (!this.order) return;

    const nextStatus = this.getNextStatus();
    if (!nextStatus) return;

    this.isUpdating = true;
    this.kdsService
      .updateOrderStatus(this.order._id, { status: nextStatus as any })
      .subscribe({
        next: (response) => {
          this.order = response.data.order;
          this.snackBar.open(`Order status updated to ${nextStatus}`, 'Close', {
            duration: 3000,
          });
          this.isUpdating = false;

          if (nextStatus === 'completed') {
            // Close dialog if order is completed
            this.dialogRef.close(true);
          }
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || 'Failed to update order status',
            'Close',
            { duration: 5000 }
          );
          this.isUpdating = false;
        },
      });
  }
}
