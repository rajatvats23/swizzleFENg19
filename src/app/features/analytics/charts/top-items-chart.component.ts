import { Component, Input, OnChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopSellingItem } from '../models/analytics.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-top-items-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div *ngIf="!topItems || topItems.length === 0" class="no-data">
        <p>No top selling items data available</p>
      </div>
      <div *ngIf="topItems && topItems.length > 0" class="chart-content">
        <canvas #topItemsCanvas></canvas>
        
        <div class="top-items-list">
          <div *ngFor="let item of topItems; let i = index" class="list-item">
            <div class="rank">{{i + 1}}</div>
            <div class="item-details">
              <div class="item-name">{{item.productName}}</div>
              <div class="item-metrics">
                <span class="quantity">{{item.totalQuantity}} items</span>
                <span class="separator">•</span>
                <span class="revenue">₹{{item.totalRevenue | number:'1.0-0'}}</span>
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
    
    canvas {
      flex: 1;
      min-height: 180px;
      max-height: 200px;
    }
    
    .top-items-list {
      margin-top: 16px;
      overflow-y: auto;
    }
    
    .list-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .rank {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border-radius: 50%;
      margin-right: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .item-details {
      flex: 1;
    }
    
    .item-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .item-metrics {
      font-size: 12px;
      color: #666;
      display: flex;
      align-items: center;
    }
    
    .separator {
      margin: 0 6px;
      color: #ccc;
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
export class TopItemsChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() topItems: TopSellingItem[] = [];
  @ViewChild('topItemsCanvas') topItemsCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | undefined;
  
  ngAfterViewInit(): void {
    if (this.topItems && this.topItems.length > 0) {
      this.createChart();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topItems'] && !changes['topItems'].firstChange && this.topItemsCanvas) {
      if (this.chart) {
        this.chart.destroy();
      }
      
      if (this.topItems && this.topItems.length > 0) {
        this.createChart();
      }
    }
  }
  
  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
  
  private createChart(): void {
    try {
      const ctx = this.topItemsCanvas.nativeElement.getContext('2d');
      if (!ctx) return;
      
      // Prepare the data (limit to top 6 items for better visualization)
      const limitedItems = this.topItems.slice(0, 6);
      
      // Generate colors for each item
      const backgroundColors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
      ];
      
      const labels = limitedItems.map(item => item.productName);
      const quantities = limitedItems.map(item => item.totalQuantity);
      
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Quantity Sold',
              data: quantities,
              backgroundColor: backgroundColors.slice(0, limitedItems.length),
              borderWidth: 0,
              borderRadius: 4,
              maxBarThickness: 40
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',  // Horizontal bar chart
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                precision: 0  // Show only integers
              }
            },
            y: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const item = limitedItems[context.dataIndex];
                  return [
                    `Quantity: ${item.totalQuantity}`,
                    `Revenue: ₹${item.totalRevenue.toLocaleString()}`,
                    `Orders: ${item.orderCount}`
                  ];
                }
              }
            }
          }
        }
      };
      
      this.chart = new Chart(ctx, config);
    } catch (error) {
      console.error('Error creating top items chart:', error);
    }
  }
}