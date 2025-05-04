// src/app/features/kds/kds-notification-overlay.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { KdsNotificationService } from './kds-notification.service';
import { Order } from './models/kds.model';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { KdsPrintService } from './kds-print.service';
import { MatDialog } from '@angular/material/dialog';
import { KdsOrderDetailDialogComponent } from './kds-order-detail-dialog.component';

@Component({
  selector: 'app-kds-notification-overlay',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
  ],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('300ms ease-out', style({ transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(-100%)' })),
      ]),
    ]),
  ],
  template: `
    <div class="notification-container" *ngIf="notifications.length > 0">
      <div
        class="notification-card"
        @slideIn
        *ngFor="let order of notifications"
      >
        <div class="notification-header">
          <div class="notification-title">
            <mat-icon class="material-symbols-outlined"
              >notifications_active</mat-icon
            >
            <div class="title-text">
              New Order: Table {{ order.table.tableNumber }}
            </div>
          </div>
          <div class="notification-time">
            {{ formatTime(order.createdAt) }}
          </div>
        </div>

        <div class="notification-content">
          <div class="items-summary">
            <span *ngFor="let item of order.items; let last = last">
              {{ item.quantity }}× {{ item.product.name
              }}{{ !last ? ', ' : '' }}
            </span>
          </div>
        </div>

        <div class="notification-actions">
          <button
            mat-icon-button
            matTooltip="Print Ticket"
            (click)="printOrder(order)"
          >
            <mat-icon class="material-symbols-outlined">print</mat-icon>
          </button>
          <button
            mat-icon-button
            matTooltip="View Details"
            (click)="viewOrderDetails(order)"
          >
            <mat-icon class="material-symbols-outlined">visibility</mat-icon>
          </button>
          <button
            mat-icon-button
            matTooltip="Dismiss"
            (click)="dismissNotification(order._id)"
          >
            <mat-icon class="material-symbols-outlined">close</mat-icon>
          </button>
        </div>
      </div>
    </div>

    <div
      class="sound-toggle"
      [matBadge]="notifications.length"
      [matBadgeHidden]="notifications.length === 0"
      matBadgeColor="warn"
      matBadgeOverlap="true"
    >
      <button mat-fab color="white" (click)="toggleSound()">
        <mat-icon class="material-symbols-outlined">
          {{ soundEnabled ? 'volume_up' : 'volume_off' }}
        </mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .notification-container {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 360px;
      }

      .notification-card {
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        border-left: 4px solid #f44336;
      }

      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        background-color: #fff8f8;
      }

      .notification-title {
        display: flex;
        align-items: center;

        mat-icon {
          color: #f44336;
          margin-right: 10px;
        }

        .title-text {
          font-weight: 500;
          color: #d32f2f;
        }
      }

      .notification-time {
        font-size: 12px;
        color: #757575;
      }

      .notification-content {
        padding: 16px;
      }

      .items-summary {
        font-size: 14px;
        line-height: 1.5;
      }

      .notification-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 10px 16px;
        background-color: #fafafa;
        border-top: 1px solid #f0f0f0;
      }

      .sound-toggle {
        position: fixed;
        bottom: 32px;
        right: 32px;
        z-index: 1000;

        button {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class KdsNotificationOverlayComponent implements OnInit, OnDestroy {
  private notificationService = inject(KdsNotificationService);
  private printService = inject(KdsPrintService);
  private dialog = inject(MatDialog);

  notifications: Order[] = [];
  soundEnabled = true;

  private subscription = new Subscription();

  ngOnInit(): void {
    this.soundEnabled = this.notificationService.isSoundEnabled();

    this.subscription.add(
      this.notificationService.notifications$.subscribe((notifications) => {
        this.notifications = notifications;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  dismissNotification(orderId: string): void {
    this.notificationService.removeNotification(orderId);
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  printOrder(order: Order): void {
    this.printService.printOrderTicket(order);
  }

  viewOrderDetails(order: Order): void {
    this.dialog.open(KdsOrderDetailDialogComponent, {
      data: { orderId: order._id },
      width: '800px',
    });
  }

  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    this.notificationService.toggleSound(this.soundEnabled);
  }
}
