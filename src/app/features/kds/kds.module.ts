import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';

import { KdsDashboardComponent } from './kds-dashboard.component';
import { KdsOrderCardComponent } from './kds-order-card.component';
import { KdsOrderDetailDialogComponent } from './kds-order-detail-dialog.component';
import { KdsNotificationOverlayComponent } from './kds-notification-overlay.component';

import { KitchenDisplayService } from './kds.service';
import { KdsPrintService } from './kds-print.service';
import { KdsNotificationService } from './kds-notification.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatInputModule,
    MatDividerModule,
    MatDialogModule,
    MatExpansionModule,
    MatMenuModule,
    KdsDashboardComponent,
    KdsOrderCardComponent,
    KdsOrderDetailDialogComponent,
    KdsNotificationOverlayComponent
  ],
  exports: [
    KdsDashboardComponent,
    KdsOrderCardComponent,
    KdsOrderDetailDialogComponent,
    KdsNotificationOverlayComponent
  ],
  providers: [
    KitchenDisplayService,
    KdsPrintService,
    KdsNotificationService
  ]
})
export class KdsModule { }