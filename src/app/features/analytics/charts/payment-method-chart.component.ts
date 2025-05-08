import { Component, Input, OnChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethodDistribution, PaymentMethod } from '../models/analytics.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-payment-method-chart',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="chart-container">
      <div *ngIf="!paymentData || !paymentData.length" class="no-data">
        <p>No payment method data available</p>
      </div>
      <div *ngIf="paymentData && paymentData.length > 0" class="chart-content">
        <div class="chart-row">
          <div class="chart-col">
            <h4>By Order Count</h4>
            <div class="canvas-container">
              <canvas #orderCountCanvas></canvas>
            </div>
          </div>
          <div class="chart-col">
            <h4>By Amount</h4>
            <div class="canvas-container">
              <canvas #amountCanvas></canvas>
            </div>
          </div>
        </div>

        <div class="payment-summary">
          <div *ngFor="let method of paymentData; let i = index" class="payment-method-item">
            <div class="method-icon" [ngClass]="'method-' + method.method.toLowerCase()">
              <mat-icon class="material-symbols-outlined">{{ getPaymentIcon(method.method) }}</mat-icon>
            </div>
            <div class="method-details">
              <div class="method-name">{{ formatMethodName(method.method) }}</div>
              <div class="method-stats">
                <span>{{ method.count }} orders</span>
                <span>₹{{ method.totalAmount | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    
    .chart-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .chart-row {
      display: flex;
      flex-wrap: wrap;
      height: 150px;
      margin-bottom: 16px;
    }
    
    .chart-col {
      flex: 1;
      min-width: 120px;
      padding: 0 8px;
    }
    
    .chart-col h4 {
      margin: 0 0 8px;
      font-size: 14px;
      text-align: center;
      color: #555;
    }
    
    .canvas-container {
      position: relative;
      height: 120px;
    }
    
    .payment-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .payment-method-item {
      display: flex;
      align-items: center;
      background-color: #f9f9f9;
      padding: 8px 12px;
      border-radius: 8px;
      flex: 1;
      min-width: 120px;
    }
    
    .method-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      color: white;
    }
    
    .method-cash {
      background-color: #27ae60;
    }
    
    .method-card {
      background-color: #3498db;
    }
    
    .method-online {
      background-color: #9b59b6;
    }
    
    .method-details {
      flex: 1;
    }
    
    .method-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .method-stats {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
    }
    
    .no-data {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
      color: #666;
      font-size: 14px;
      text-align: center;
      padding: 20px;
    }
  `]
})
export class PaymentMethodChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() paymentData: PaymentMethod[] = [];
  
  @ViewChild('orderCountCanvas') orderCountCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('amountCanvas') amountCanvas!: ElementRef<HTMLCanvasElement>;
  
  private orderCountChart: Chart | undefined;
  private amountChart: Chart | undefined;
  
  // Color palette for payment methods
  private colors = {
    cash: {
      backgroundColor: 'rgba(39, 174, 96, 0.7)',
      borderColor: '#27ae60'
    },
    card: {
      backgroundColor: 'rgba(52, 152, 219, 0.7)',
      borderColor: '#3498db'
    },
    online: {
      backgroundColor: 'rgba(155, 89, 182, 0.7)',
      borderColor: '#9b59b6'
    },
    upi: {
      backgroundColor: 'rgba(241, 196, 15, 0.7)', 
      borderColor: '#f1c40f'
    },
    default: {
      backgroundColor: 'rgba(149, 165, 166, 0.7)',
      borderColor: '#95a5a6'
    }
  };
  
  ngAfterViewInit(): void {
    if (this.paymentData && this.paymentData.length > 0) {
      this.createCharts();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paymentData'] && !changes['paymentData'].firstChange) {
      if (this.orderCountChart) {
        this.orderCountChart.destroy();
      }
      if (this.amountChart) {
        this.amountChart.destroy();
      }
      
      if (this.paymentData && this.paymentData.length > 0 && 
          this.orderCountCanvas && this.amountCanvas) {
        this.createCharts();
      }
    }
  }
  
  ngOnDestroy(): void {
    if (this.orderCountChart) {
      this.orderCountChart.destroy();
    }
    if (this.amountChart) {
      this.amountChart.destroy();
    }
  }
  
  private createCharts(): void {
    this.createOrderCountChart();
    this.createAmountChart();
  }
  
  private createOrderCountChart(): void {
    try {
      const ctx = this.orderCountCanvas.nativeElement.getContext('2d');
      if (!ctx) return;
      
      // Sort by count descending
      const sortedData = [...this.paymentData].sort((a, b) => b.count - a.count);
      
      // Prepare the data
      const labels = sortedData.map(item => this.formatMethodName(item.method));
      const data = sortedData.map(item => item.count);
      const backgroundColors = sortedData.map(item => this.getBackgroundColor(item.method));
      
      const config: ChartConfiguration = {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: backgroundColors,
              borderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const item = sortedData[context.dataIndex];
                  const percent = item.orderPercentage.toFixed(1);
                  return `${item.count} orders (${percent}%)`;
                }
              }
            }
          },
          // cutout: '65%'
        }
      };
      
      this.orderCountChart = new Chart(ctx, config);
    } catch (error) {
      console.error('Error creating order count chart:', error);
    }
  }
  
  private createAmountChart(): void {
    try {
      const ctx = this.amountCanvas.nativeElement.getContext('2d');
      if (!ctx) return;
      
      // Sort by amount descending
      const sortedData = [...this.paymentData].sort((a, b) => b.totalAmount - a.totalAmount);
      
      // Prepare the data
      const labels = sortedData.map(item => this.formatMethodName(item.method));
      const data = sortedData.map(item => item.totalAmount);
      const backgroundColors = sortedData.map(item => this.getBackgroundColor(item.method));
      
      const config: ChartConfiguration = {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: backgroundColors,
              borderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const item = sortedData[context.dataIndex];
                  const percent = item.amountPercentage.toFixed(1);
                  return `₹${item.totalAmount.toLocaleString()} (${percent}%)`;
                }
              }
            }
          },
          // cutout: '65%'
        }
      };
      
      this.amountChart = new Chart(ctx, config);
    } catch (error) {
      console.error('Error creating amount chart:', error);
    }
  }
  
  private getBackgroundColor(method: string): string {
    const key = method.toLowerCase() as keyof typeof this.colors;
    return this.colors[key]?.backgroundColor || this.colors.default.backgroundColor;
  }
  
  formatMethodName(method: string): string {
    // Capitalize first letter of each word
    return method.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  getPaymentIcon(method: string): string {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'payments';
      case 'card':
        return 'credit_card';
      case 'online':
        return 'account_balance';
      case 'upi':
        return 'smartphone';
      default:
        return 'payment';
    }
  }
}