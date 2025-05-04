// src/app/features/kds/kds-order-card.component.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { KitchenDisplayService } from './kds.service';
import { Order, OrderItem } from './models/kds.model';
import { KdsPrintService } from './kds-print.service';

@Component({
  selector: 'app-kds-order-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatExpansionModule,
    MatMenuModule,
  ],
  template: `
    <mat-card class="order-card" [ngClass]="getStatusClass()">
      <mat-card-header>
        <div class="header-content">
          <div class="order-info">
            <div class="table-badge">Table {{ order.table.tableNumber }}</div>
            <span
              class="time-info"
              matTooltip="{{ getFullTimeString(order.createdAt) }}"
            >
              {{ getTimeSince(order.createdAt) }}
            </span>
          </div>

          <div class="order-status">
            <mat-chip [color]="getStatusColor()" selected>
              {{ getStatusLabel(order.status) }}
            </mat-chip>
          </div>
        </div>
      </mat-card-header>

      <mat-divider></mat-divider>

      <mat-card-content>
        <div class="items-list">
          <div
            *ngFor="let item of order.items"
            class="order-item"
            [ngClass]="getItemStatusClass(item.status)"
          >
            <div class="item-header">
              <div class="item-quantity">{{ item.quantity }}x</div>
              <div class="item-name">{{ item.product.name }}</div>
              <div class="item-status">
                <button
                  mat-icon-button
                  [matMenuTriggerFor]="itemMenu"
                  matTooltip="Change Status"
                  class="status-button"
                >
                  <mat-icon class="material-symbols-outlined">more_vert</mat-icon>
                </button>
                <mat-menu #itemMenu="matMenu">
                  <button
                    mat-menu-item
                    *ngIf="item.status === 'ordered'"
                    (click)="updateItemStatus(item._id, 'preparing')"
                  >
                    <mat-icon class="material-symbols-outlined">restaurant</mat-icon>
                    <span>Start Preparing</span>
                  </button>
                  <button
                    mat-menu-item
                    *ngIf="item.status === 'preparing'"
                    (click)="updateItemStatus(item._id, 'ready')"
                  >
                    <mat-icon class="material-symbols-outlined">check_circle</mat-icon>
                    <span>Mark as Ready</span>
                  </button>
                  <button
                    mat-menu-item
                    *ngIf="item.status === 'ready'"
                    (click)="updateItemStatus(item._id, 'delivered')"
                  >
                    <mat-icon class="material-symbols-outlined">room_service</mat-icon>
                    <span>Mark as Delivered</span>
                  </button>
                </mat-menu>
              </div>
            </div>

            <div class="item-instructions" *ngIf="item.specialInstructions">
              <mat-icon class="material-symbols-outlined" matTooltip="Special Instructions" color="warn"
                >priority_high</mat-icon
              >
              <span class="instruction-text">{{
                item.specialInstructions
              }}</span>
            </div>

            <div
              class="addons-list"
              *ngIf="item.selectedAddons && item.selectedAddons.length > 0"
            >
              <div
                *ngFor="let addonSelection of item.selectedAddons"
                class="addon-item"
              >
                <span
                  >• {{ addonSelection.addon.name }}:
                  {{ addonSelection.subAddon.name }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="order-notes" *ngIf="order.specialInstructions">
          <mat-icon class="material-symbols-outlined" color="warn">info</mat-icon>
          <span>{{ order.specialInstructions }}</span>
        </div>
      </mat-card-content>

      <mat-divider></mat-divider>

      <mat-card-actions>
        <div class="action-buttons">
          <button
            mat-icon-button
            color="basic"
            matTooltip="Print Ticket"
            (click)="printOrderTicket()"
          >
            <mat-icon class="material-symbols-outlined">print</mat-icon>
          </button>

          <span class="spacer"></span>

          <button
            mat-button
            color="primary"
            *ngIf="order.status === 'placed'"
            (click)="updateOrderStatus('preparing')"
          >
            <mat-icon class="material-symbols-outlined">restaurant</mat-icon> Start Preparing
          </button>

          <button
            mat-button
            color="accent"
            *ngIf="order.status === 'preparing'"
            (click)="updateOrderStatus('ready')"
          >
            <mat-icon class="material-symbols-outlined">check_circle</mat-icon> Mark as Ready
          </button>

          <button
            mat-button
            color="warn"
            *ngIf="order.status === 'ready'"
            (click)="updateOrderStatus('delivered')"
          >
            <mat-icon class="material-symbols-outlined">room_service</mat-icon> Mark as Delivered
          </button>

          <button
            mat-button
            *ngIf="order.status === 'delivered'"
            (click)="updateOrderStatus('completed')"
          >
            <mat-icon class="material-symbols-outlined">done_all</mat-icon> Complete Order
          </button>
        </div>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      .order-card {
        margin-bottom: 16px;
        border-left: 5px solid #ccc;
        transition: all 0.3s ease;
      }

      .status-placed {
        border-left-color: #f44336; /* Red */
      }

      .status-preparing {
        border-left-color: #ff9800; /* Orange */
      }

      .status-ready {
        border-left-color: #4caf50; /* Green */
      }

      .status-delivered {
        border-left-color: #2196f3; /* Blue */
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .spacer {
        flex: 1;
      }

      .order-info {
        display: flex;
        align-items: center;
      }

      .table-badge {
        background-color: #673ab7;
        color: white;
        padding: 4px 12px;
        border-radius: 16px;
        font-weight: 500;
        margin-right: 12px;
      }

      .time-info {
        color: #666;
        font-size: 14px;
      }

      .items-list {
        margin-top: 16px;
      }

      .order-item {
        margin-bottom: 12px;
        padding: 12px;
        background-color: #f5f5f5;
        border-radius: 4px;
        border-left: 4px solid #ccc;
      }

      .item-ordered {
        border-left-color: #9e9e9e; /* Grey */
      }

      .item-preparing {
        border-left-color: #ff9800; /* Orange */
      }

      .item-ready {
        border-left-color: #4caf50; /* Green */
      }

      .item-delivered {
        border-left-color: #2196f3; /* Blue */
        opacity: 0.7;
      }

      .item-header {
        display: flex;
        align-items: center;
      }

      .item-quantity {
        font-weight: 700;
        margin-right: 8px;
        min-width: 28px;
      }

      .item-name {
        flex: 1;
        font-weight: 500;
      }

      .item-status {
        display: flex;
        align-items: center;
      }

      .status-button {
        height: 28px;
        width: 28px;
        line-height: 28px;
      }

      .status-button mat-icon {
        font-size: 18px;
        height: 18px;
        width: 18px;
      }

      .item-instructions {
        display: flex;
        align-items: flex-start;
        margin-top: 8px;
        padding: 4px 8px;
        background-color: rgba(255, 152, 0, 0.1);
        border-radius: 4px;
      }

      .instruction-text {
        margin-left: 8px;
        font-size: 14px;
        font-style: italic;
      }

      .addons-list {
        margin-top: 8px;
        font-size: 14px;
        color: #555;
      }

      .addon-item {
        margin-left: 8px;
        margin-bottom: 4px;
      }

      .order-notes {
        display: flex;
        align-items: flex-start;
        margin-top: 16px;
        padding: 8px 12px;
        background-color: rgba(255, 152, 0, 0.1);
        border-radius: 4px;
      }

      .order-notes mat-icon {
        margin-right: 8px;
      }

      .action-buttons {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        gap: 8px;
      }
    `,
  ],
})
export class KdsOrderCardComponent {
  @Input() order!: Order;
  @Output() statusChanged = new EventEmitter<void>();

  private kdsService = inject(KitchenDisplayService);
  private snackBar = inject(MatSnackBar);
  private printService = inject(KdsPrintService);

  getStatusClass(): string {
    return `status-${this.order.status}`;
  }

  getItemStatusClass(status: string): string {
    return `item-${status}`;
  }

  printOrderTicket(): void {
    this.printService.printOrderTicket(this.order);
  }

  getStatusColor(): string {
    switch (this.order.status) {
      case 'placed':
        return 'warn';
      case 'preparing':
        return 'accent';
      case 'ready':
        return 'primary';
      case 'delivered':
        return '';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getTimeSince(timestamp: string): string {
    return this.kdsService.getTimeSinceOrder(timestamp);
  }

  getFullTimeString(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  updateOrderStatus(status: string): void {
    this.kdsService
      .updateOrderStatus(this.order._id, { status: status as any })
      .subscribe({
        next: () => {
          this.snackBar.open(`Order status updated to ${status}`, 'Close', {
            duration: 3000,
          });
          this.statusChanged.emit();
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || 'Failed to update order status',
            'Close',
            { duration: 5000 }
          );
        },
      });
  }

  updateItemStatus(itemId: string, status: string): void {
    this.kdsService
      .updateOrderItemStatus(this.order._id, itemId, { status: status as any })
      .subscribe({
        next: () => {
          this.snackBar.open(`Item status updated to ${status}`, 'Close', {
            duration: 3000,
          });
          this.statusChanged.emit();
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || 'Failed to update item status',
            'Close',
            { duration: 5000 }
          );
        },
      });
  }
}
