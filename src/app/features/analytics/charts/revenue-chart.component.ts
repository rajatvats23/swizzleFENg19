import { Component, Input, OnChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyRevenue } from '../models/analytics.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div *ngIf="!dailyRevenue || dailyRevenue.length === 0" class="no-data">
        <p>No revenue data available for the selected period</p>
      </div>
      <canvas #revenueCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    canvas {
      width: 100% !important;
      height: 100% !important;
      max-height: 300px;
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
export class RevenueChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() dailyRevenue: DailyRevenue[] = [];
  @ViewChild('revenueCanvas') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | undefined;
  
  ngAfterViewInit(): void {
    if (this.dailyRevenue && this.dailyRevenue.length > 0) {
      this.createChart();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dailyRevenue'] && !changes['dailyRevenue'].firstChange && this.revenueCanvas) {
      if (this.chart) {
        this.chart.destroy();
      }
      
      if (this.dailyRevenue && this.dailyRevenue.length > 0) {
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
      const ctx = this.revenueCanvas.nativeElement.getContext('2d');
      if (!ctx) return;
      
      // Sort data by date
      const sortedData = [...this.dailyRevenue].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      
      // Prepare the data
      const labels = sortedData.map(item => this.formatDate(item.date));
      const revenueData = sortedData.map(item => item.totalRevenue);
      const orderCountData = sortedData.map(item => item.orderCount);
      
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              type: 'bar',
              label: 'Revenue (₹)',
              data: revenueData,
              backgroundColor: 'rgba(0, 156, 76, 0.7)',
              borderColor: 'rgb(0, 156, 76)',
              borderWidth: 1,
              yAxisID: 'y',
            },
            {
              type: 'line',
              label: 'Orders',
              data: orderCountData,
              backgroundColor: 'rgba(52, 152, 219, 0.2)',
              borderColor: 'rgb(52, 152, 219)',
              borderWidth: 2,
              pointBackgroundColor: 'rgb(52, 152, 219)',
              pointRadius: 4,
              tension: 0.4,
              yAxisID: 'y1',
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Revenue (₹)'
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              min: 0
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Order Count'
              },
              grid: {
                drawOnChartArea: false
              },
              min: 0
            }
          },
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false
            },
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 12,
                usePointStyle: true
              }
            }
          }
        }
      };
      
      this.chart = new Chart(ctx, config);
    } catch (error) {
      console.error('Error creating revenue chart:', error);
    }
  }
  
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric'
    });
  }
}