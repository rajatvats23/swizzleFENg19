import { Component, Input, OnChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeakHour } from '../models/analytics.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-peak-hours-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <div class="chart-title">
          <h3>Hourly Distribution</h3>
          <span class="chart-subtitle">Order count and revenue by hour of day</span>
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color" style="background-color: rgba(54, 162, 235, 0.5)"></div>
            <span>Orders</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: rgba(255, 99, 132, 0.5)"></div>
            <span>Revenue</span>
          </div>
        </div>
      </div>
      <canvas #peakHoursCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .chart-title {
      display: flex;
      flex-direction: column;
    }
    
    .chart-title h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .chart-subtitle {
      font-size: 12px;
      color: #666;
    }
    
    .chart-legend {
      display: flex;
      gap: 16px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }
    
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
    
    canvas {
      flex: 1;
      max-height: 300px; /* Set a maximum height to prevent excessive growth */
    }
  `]
})
export class PeakHoursChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() peakHoursData: PeakHour[] = [];
  @ViewChild('peakHoursCanvas') peakHoursCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | undefined;
  
  ngAfterViewInit(): void {
    if (this.peakHoursData.length > 0) {
      this.createChart();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['peakHoursData'] && !changes['peakHoursData'].firstChange && this.peakHoursCanvas) {
      if (this.chart) {
        this.chart.destroy();
      }
      
      if (this.peakHoursData.length > 0) {
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
    const ctx = this.peakHoursCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    
    // Safety check - ensure we have valid data
    if (!this.peakHoursData || this.peakHoursData.length === 0) {
      console.warn('No peak hours data available');
      return;
    }
    
    try {
      // Sort data by hour for better visualization
      const sortedData = [...this.peakHoursData].sort((a, b) => a.hour - b.hour);
      
      // Format hours for display (12-hour format with AM/PM)
      const hourLabels = sortedData.map(item => this.formatHour(item.hour));
      
      // Prepare datasets with data validation
      const orderCountData = sortedData.map(item => Number(item.orderCount) || 0);
      
      // Scale down revenue values to prevent excessive y-axis scaling
      // We'll divide by 100 to show in hundreds
      const revenueScale = 100;
      const revenueData = sortedData.map(item => (Number(item.totalRevenue) || 0) / revenueScale);
      
      // Calculate max values for better chart scaling
      const maxOrderCount = Math.max(...orderCountData, 1);
      const maxRevenue = Math.max(...revenueData, 1);
      
      // Create chart configuration with proper scaling
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: hourLabels,
          datasets: [
            {
              type: 'bar',
              label: 'Orders',
              data: orderCountData,
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgb(54, 162, 235)',
              borderWidth: 1,
              yAxisID: 'y',
            },
            {
              type: 'line',
              label: 'Revenue (₹ hundreds)',
              data: revenueData,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 2,
              pointBackgroundColor: 'rgb(255, 99, 132)',
              tension: 0.1,
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
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Order Count'
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              min: 0,
              // Set a reasonable max
              suggestedMax: Math.min(Math.ceil(maxOrderCount * 1.2), 20) // Cap at 20 or 120% of max, whichever is lower
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Revenue (₹ hundreds)'
              },
              grid: {
                drawOnChartArea: false
              },
              min: 0,
              // Set a reasonable max
              suggestedMax: Math.min(Math.ceil(maxRevenue * 1.2), 100) // Cap at 100 or 120% of max, whichever is lower
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  if (label === 'Revenue (₹ hundreds)') {
                    return `Revenue: ₹${(value * revenueScale).toLocaleString()}`;
                  }
                  return `${label}: ${value}`;
                }
              }
            }
          }
        }
      };
      
      this.chart = new Chart(ctx, config);
    } catch (error) {
      console.error('Error creating peak hours chart:', error);
    }
  }

  formatHour(hour: number): string {
    // Format hour as 12-hour format with AM/PM
    const displayHour = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${displayHour} ${ampm}`;
  }
}