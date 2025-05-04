// src/app/features/kds/kds-print.service.ts
import { Injectable } from '@angular/core';
import { Order } from './models/kds.model';

@Injectable({
  providedIn: 'root'
})
export class KdsPrintService {
  
  printOrderTicket(order: Order): void {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups for this website');
      return;
    }
    
    // Format date and time
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString();
    const formattedTime = orderDate.toLocaleTimeString();
    
    // Generate HTML content for the print window
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order #${order._id.slice(-6)}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 0.5cm;
            width: 8cm;
          }
          .ticket-header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .restaurant-name {
            font-size: 18px;
            font-weight: bold;
          }
          .order-info {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
          }
          .order-details {
            margin: 16px 0;
          }
          .item {
            margin-bottom: 12px;
          }
          .item-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
          }
          .addon {
            padding-left: 16px;
            font-size: 14px;
          }
          .special-instructions {
            font-style: italic;
            border: 1px solid #000;
            padding: 4px;
            margin-top: 4px;
          }
          .summary {
            margin-top: 16px;
            border-top: 1px dashed #000;
            padding-top: 8px;
            text-align: center;
          }
          .footer {
            margin-top: 24px;
            text-align: center;
            font-size: 12px;
          }
          
          @media print {
            body {
              width: 8cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="ticket-header">
          <div class="restaurant-name">KITCHEN ORDER</div>
          <div>Table: ${order.table.tableNumber}</div>
        </div>
        
        <div class="order-info">
          <div>Order #: ${order._id.slice(-6)}</div>
          <div>Status: ${order.status.toUpperCase()}</div>
        </div>
        
        <div class="order-info">
          <div>Date: ${formattedDate}</div>
          <div>Time: ${formattedTime}</div>
        </div>
        
        <div class="order-details">
          ${order.items.map(item => `
            <div class="item">
              <div class="item-header">
                <div>${item.quantity}x ${item.product.name}</div>
                <div>${(item.price * item.quantity).toFixed(2)}</div>
              </div>
              ${item.selectedAddons && item.selectedAddons.length > 0 ? 
                item.selectedAddons.map(addon => `
                  <div class="addon">+ ${addon.addon.name}: ${addon.subAddon.name}</div>
                `).join('') : ''}
              ${item.specialInstructions ? 
                `<div class="special-instructions">NOTE: ${item.specialInstructions}</div>` : ''}
            </div>
          `).join('')}
        </div>
        
        ${order.specialInstructions ? `
          <div class="special-instructions">
            <strong>ORDER NOTES:</strong> ${order.specialInstructions}
          </div>
        ` : ''}
        
        <div class="summary">
          <div><strong>TOTAL: ${order.totalAmount.toFixed(2)}</strong></div>
        </div>
        
        <div class="footer">
          *** KITCHEN COPY ***
        </div>
      </body>
      </html>
    `;
    
    // Write the content to the print window
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to be loaded before printing
    printWindow.onload = () => {
      printWindow.print();
      // Close the window after printing (optional, some browsers may do this automatically)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  }
}