import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { QRCodeComponent } from 'angularx-qrcode';
import { environment } from '../../../environment/environment';
import { Table } from './models/table.model';

interface DialogData {
  table: Table;
}

@Component({
  selector: 'app-qr-code-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    QRCodeComponent
  ],
  template: `
    <h2 mat-dialog-title>QR Code for Table {{data.table.tableNumber}}</h2>
    <div mat-dialog-content class="qr-content">
      <qrcode 
        [qrdata]="qrCodeData" 
        [width]="250" 
        [errorCorrectionLevel]="'M'"
      ></qrcode>
      <p class="qr-info">Scan to access table menu</p>
      <p class="qr-url">{{qrCodeData}}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="printQRCode()">Print</button>
      <button mat-button (click)="dialogRef.close()">Close</button>
    </div>
  `,
  styles: [`
    .qr-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
    }
    .qr-info {
      margin-top: 16px;
      color: #666;
    }
    .qr-url {
      margin-top: 8px;
      font-size: 12px;
      color: #999;
      word-break: break-all;
    }
  `]
})
export class QrCodeDialogComponent implements OnInit {
  qrCodeData = '';

  constructor(
    public dialogRef: MatDialogRef<QrCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    const apiBaseUrl =  'http://localhost:3000';
    
    // Create the URL for the QR code
    this.qrCodeData = `${apiBaseUrl}/table/${this.data.table.qrCodeIdentifier}`;
  }

  printQRCode(): void {
    window.print();
  }
}