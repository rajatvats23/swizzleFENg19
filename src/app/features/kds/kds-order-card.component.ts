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
    <div class="order-card" [ngClass]="getStatusClass()" (click)="$event.stopPropagation()">
  <!-- Card Status Header -->
  <div class="card-status-header">
    <div class="status-badge" [ngClass]="'status-' + order.status">
      {{getStatusLabel(order.status)}}
    </div>
  </div>
  
  <!-- Card Header -->
  <div class="card-header">
    <div class="table-badge">
      <span class="table-icon"><mat-icon class="material-symbols-outlined">table_restaurant</mat-icon></span>
      <span class="table-number">{{order.table.tableNumber}}</span>
    </div>
    
    <div class="order-time">
      <div class="time-label">Ordered</div>
      <div class="time-value" [matTooltip]="getFullTimeString(order.createdAt)">
        {{getTimeSince(order.createdAt)}}
      </div>
    </div>
  </div>
  
  <!-- Card Content -->
  <div class="card-content">
    <!-- Item List -->
    <div class="items-container">
      <div class="item" *ngFor="let item of order.items; trackBy: trackByItemId" 
           [ngClass]="getItemStatusClass(item.status)">
        <div class="item-header">
          <div class="item-main">
            <div class="item-quantity">{{item.quantity}}×</div>
            <div class="item-name">{{item.product.name}}</div>
          </div>
          
          <div class="item-actions">
            <div class="item-status-indicator" [ngClass]="'status-indicator-' + item.status">
              <mat-icon *ngIf="item.status === 'ready'" class="material-symbols-outlined">check_circle</mat-icon>
              <mat-icon *ngIf="item.status === 'preparing'" class="material-symbols-outlined">restaurant</mat-icon>
              <mat-icon *ngIf="item.status === 'ordered'" class="material-symbols-outlined">schedule</mat-icon>
              <mat-icon *ngIf="item.status === 'delivered'" class="material-symbols-outlined">done_all</mat-icon>
            </div>
            
            <button mat-icon-button class="item-menu-button" [matMenuTriggerFor]="itemMenu" (click)="$event.stopPropagation()">
              <mat-icon class="material-symbols-outlined">more_horiz</mat-icon>
            </button>
            
            <mat-menu #itemMenu="matMenu" class="item-status-menu">
              <button mat-menu-item *ngIf="item.status === 'ordered'" (click)="updateItemStatus(item._id, 'preparing')">
                <mat-icon class="material-symbols-outlined">restaurant</mat-icon>
                <span>Start Preparing</span>
              </button>
              <button mat-menu-item *ngIf="item.status === 'preparing'" (click)="updateItemStatus(item._id, 'ready')">
                <mat-icon class="material-symbols-outlined">check_circle</mat-icon>
                <span>Mark as Ready</span>
              </button>
              <button mat-menu-item *ngIf="item.status === 'ready'" (click)="updateItemStatus(item._id, 'delivered')">
                <mat-icon class="material-symbols-outlined">room_service</mat-icon>
                <span>Mark as Delivered</span>
              </button>
            </mat-menu>
          </div>
        </div>
        
        <div class="item-details" *ngIf="item.selectedAddons?.length || item.specialInstructions">
          <div class="addons" *ngIf="item.selectedAddons?.length">
            <div class="addon" *ngFor="let addon of item.selectedAddons">
              <span class="addon-name">{{addon.addon.name}}:</span>
              <span class="addon-value">{{addon.subAddon.name}}</span>
            </div>
          </div>
          
          <div class="special-instructions" *ngIf="item.specialInstructions">
            <mat-icon class="material-symbols-outlined warning-icon">priority_high</mat-icon>
            <span class="instruction-text">{{item.specialInstructions}}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="order-notes" *ngIf="order.specialInstructions">
      <div class="note-header">
        <mat-icon class="material-symbols-outlined">info</mat-icon>
        <span>Special Instructions</span>
      </div>
      <div class="note-text">{{order.specialInstructions}}</div>
    </div>
  </div>
  
  <!-- Card Footer -->
  <div class="card-footer">
    <div class="footer-actions">
      <button class="action-button print-button" (click)="printOrderTicket(); $event.stopPropagation()">
        <mat-icon class="material-symbols-outlined">print</mat-icon>
      </button>
      
      <div class="action-spacer"></div>
      
      <button *ngIf="order.status === 'placed'" class="action-button primary-action" 
              (click)="updateOrderStatus('preparing'); $event.stopPropagation()">
        <mat-icon class="material-symbols-outlined">restaurant</mat-icon>
        <span>Start Preparing</span>
      </button>
      
      <button *ngIf="order.status === 'preparing'" class="action-button ready-action" 
              (click)="updateOrderStatus('ready'); $event.stopPropagation()">
        <mat-icon class="material-symbols-outlined">check_circle</mat-icon>
        <span>Mark Ready</span>
      </button>
      
      <button *ngIf="order.status === 'ready'" class="action-button deliver-action" 
              (click)="updateOrderStatus('delivered'); $event.stopPropagation()">
        <mat-icon class="material-symbols-outlined">room_service</mat-icon>
        <span>Deliver</span>
      </button>
      
      <button *ngIf="order.status === 'delivered'" class="action-button complete-action" 
              (click)="updateOrderStatus('completed'); $event.stopPropagation()">
        <mat-icon class="material-symbols-outlined">done_all</mat-icon>
        <span>Complete</span>
      </button>
    </div>
  </div>
</div>
  `,
  styles: [
    `
   // High-end design styles for KDS order card

// Color Variables
$color-white: #ffffff;
$color-black: #1a1a1a;
$color-gray-50: #fafafa;
$color-gray-100: #f5f5f5;
$color-gray-200: #eeeeee;
$color-gray-300: #e0e0e0;
$color-gray-400: #bdbdbd;
$color-gray-500: #9e9e9e;
$color-gray-600: #757575;
$color-gray-700: #616161;
$color-gray-800: #424242;
$color-gray-900: #212121;

$color-primary: #2c3e50;
$color-secondary: #34495e;
$color-accent: #3498db;

$color-placed: #e74c3c;
$color-preparing: #f39c12;
$color-ready: #27ae60;
$color-delivered: #3498db;
$color-completed: #9b59b6;

// Base Card Styles
.order-card {
  position: relative;
  border-radius: 16px;
  background-color: $color-white;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  }
  
  &.status-placed {
    border-top: 5px solid $color-placed;
  }
  
  &.status-preparing {
    border-top: 5px solid $color-preparing;
  }
  
  &.status-ready {
    border-top: 5px solid $color-ready;
  }
  
  &.status-delivered {
    border-top: 5px solid $color-delivered;
  }
  
  &.status-completed {
    border-top: 5px solid $color-completed;
  }
}

// Card Status Header
.card-status-header {
  padding: 0 16px;
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.status-badge {
  font-size: 14px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  color: $color-white;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  
  &.status-placed {
    background-color: $color-placed;
  }
  
  &.status-preparing {
    background-color: $color-preparing;
  }
  
  &.status-ready {
    background-color: $color-ready;
  }
  
  &.status-delivered {
    background-color: $color-delivered;
  }
  
  &.status-completed {
    background-color: $color-completed;
  }
}

// Card Header
.card-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: $color-primary;
  color: $color-white;
  padding: 8px 16px;
  border-radius: 10px;
  
  .table-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    
    mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
    }
  }
  
  .table-number {
    font-size: 16px;
    font-weight: 600;
  }
}

.order-time {
  text-align: right;
  
  .time-label {
    font-size: 12px;
    color: $color-gray-500;
    margin-bottom: 2px;
  }
  
  .time-value {
    font-size: 14px;
    font-weight: 500;
    color: $color-gray-700;
  }
}

// Card Content
.card-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  background-color: $color-gray-50;
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item {
  background-color: $color-white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
  
  &.item-ordered {
    border-left-color: $color-gray-400;
    
    &:hover {
      background-color: rgba($color-gray-400, 0.05);
    }
  }
  
  &.item-preparing {
    border-left-color: $color-preparing;
    
    &:hover {
      background-color: rgba($color-preparing, 0.05);
    }
  }
  
  &.item-ready {
    border-left-color: $color-ready;
    
    &:hover {
      background-color: rgba($color-ready, 0.05);
    }
  }
  
  &.item-delivered {
    border-left-color: $color-delivered;
    opacity: 0.8;
    
    &:hover {
      background-color: rgba($color-delivered, 0.05);
    }
  }
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-main {
  display: flex;
  align-items: center;
}

.item-quantity {
  font-size: 16px;
  font-weight: 700;
  margin-right: 8px;
  color: $color-gray-800;
}

.item-name {
  font-size: 16px;
  font-weight: 500;
  color: $color-gray-900;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-status-indicator {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 4px;
  
  mat-icon {
    font-size: 18px;
    height: 18px;
    width: 18px;
  }
  
  &.status-indicator-ordered {
    background-color: rgba($color-gray-400, 0.12);
    color: $color-gray-600;
  }
  
  &.status-indicator-preparing {
    background-color: rgba($color-preparing, 0.12);
    color: $color-preparing;
  }
  
  &.status-indicator-ready {
    background-color: rgba($color-ready, 0.12);
    color: $color-ready;
  }
  
  &.status-indicator-delivered {
    background-color: rgba($color-delivered, 0.12);
    color: $color-delivered;
  }
}

.item-menu-button {
  width: 28px;
  height: 28px;
  line-height: 28px;
  
  mat-icon {
    font-size: 18px;
    color: $color-gray-600;
  }
}

.item-details {
  margin-top: 8px;
}

.addons {
  margin-bottom: 10px;
}

.addon {
  display: flex;
  font-size: 14px;
  color: $color-gray-700;
  margin-bottom: 4px;
  padding-left: 10px;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    width: 4px;
    height: 4px;
    background-color: $color-gray-400;
    border-radius: 50%;
  }
  
  .addon-name {
    font-weight: 500;
    margin-right: 4px;
  }
  
  .addon-value {
    color: $color-gray-600;
  }
}

.special-instructions {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background-color: rgba($color-preparing, 0.08);
  padding: 10px 12px;
  border-radius: 8px;
  
  .warning-icon {
    color: $color-preparing;
    font-size: 18px;
    height: 18px;
    width: 18px;
  }
  
  .instruction-text {
    font-size: 14px;
    color: $color-gray-800;
    line-height: 1.4;
  }
}

.order-notes {
  margin-top: 16px;
  background-color: rgba($color-accent, 0.06);
  border-radius: 12px;
  padding: 16px;
  
  .note-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: $color-accent;
    font-weight: 500;
    font-size: 14px;
    
    mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
    }
  }
  
  .note-text {
    font-size: 14px;
    color: $color-gray-800;
    line-height: 1.5;
    padding-left: 26px;
  }
}

// Card Footer
.card-footer {
  padding: 16px;
  background-color: $color-gray-100;
  border-top: 1px solid $color-gray-200;
}

.footer-actions {
  display: flex;
  align-items: center;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  mat-icon {
    font-size: 18px;
    height: 18px;
    width: 18px;
  }
  
  &.print-button {
    background-color: transparent;
    color: $color-gray-700;
    padding: 8px;
    
    &:hover {
      background-color: $color-gray-200;
    }
  }
  
  &.primary-action {
    background-color: $color-primary;
    color: $color-white;
    
    &:hover {
      background-color: darken($color-primary, 5%);
    }
  }
  
  &.ready-action {
    background-color: $color-ready;
    color: $color-white;
    
    &:hover {
      background-color: darken($color-ready, 5%);
    }
  }
  
  &.deliver-action {
    background-color: $color-delivered;
    color: $color-white;
    
    &:hover {
      background-color: darken($color-delivered, 5%);
    }
  }
  
  &.complete-action {
    background-color: $color-completed;
    color: $color-white;
    
    &:hover {
      background-color: darken($color-completed, 5%);
    }
  }
}

.action-spacer {
  flex: 1;
}

// Media Queries
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-time {
    text-align: left;
  }
  
  .action-button {
    span {
      display: none;
    }
    
    padding: 8px;
  }
}
    `
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
  trackByItemId(index: number, item: OrderItem): string {
    return item._id;
  }
  
  // Helper method for item status class
  
}
