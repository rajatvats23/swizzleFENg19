import { Component, Input, OnChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableOccupancy, HourlyOccupancy } from '../models/analytics.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-table-occupancy-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div *ngIf="!occupancyData" class="no-data">
        <p>No table occupancy data available</p>
      </div>
      
      <div *ngIf="occupancyData" class="occupancy-content">
        <div class="occupancy-gauge">
          <div class="gauge-container">
            <div class="gauge-value" [style.transform]="'rotate(' + calculateRotation() + 'deg)'"></div>
            <div class="gauge-center">
              <div class="gauge-percentage">{{ occupancyData.occupancyRate | number:'1.0-0' }}%</div>
              <div class="gauge-label">Occupancy</div>
            </div>
          </div>
          
          <div class="gauge-details">
            <div class="detail-item">
              <div class="detail-label">Active Tables:</div>
              <div class="detail-value">{{ occupancyData.tablesUsed }} / {{ occupancyData.totalTables }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Date:</div>
              <div class="detail-value">{{ formatDate(occupancyData.date) }}</div>
            </div>
          </div>
        </div>
        
        <div *ngIf="occupancyData.hourlyOccupancy && occupancyData.hourlyOccupancy.length > 0" class="hourly-occupancy">
          <h4>Hourly Occupancy</h4>
          <canvas #hourlyCanvas></canvas>
        </div>
        
        <div *ngIf="!occupancyData.hourlyOccupancy || occupancyData.hourlyOccupancy.length === 0" class="no-hourly-data">
          <p>No hourly occupancy data available for this date</p>
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
    
    .occupancy-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 12px 0;
    }
    
    .occupancy-gauge {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .gauge-container {
      position: relative;
      width: 180px;
      height: 90px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    
    .gauge-value {
      position: absolute;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: conic-gradient(
        #27ae60 0%,
        #f1c40f 50%,
        #e74c3c 80%,
        #e74c3c 100%
      );
      bottom: 0;
      transform-origin: 50% 100%;
      transform: rotate(0deg);
      transition: transform 1s ease-out;
    }
    
    .gauge-center {
      position: absolute;
      width: 140px;
      height: 70px;
      background-color: white;
      border-radius: 70px 70px 0 0;
      bottom: 0;
      left: 20px;
      text-align: center;
      padding-top: 12px;
    }
    
    .gauge-percentage {
      font-size: 24px;
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .gauge-label {
      font-size: 12px;
      color: #666;
    }
    
    .gauge-details {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
    }
    
    .detail-item {
      display: flex;
      align-items: center;
    }
    
    .detail-label {
      font-size: 13px;
      color: #666;
      margin-right: 8px;
    }
    
    .detail-value {
      font-size: 14px;
      font-weight: 500;
    }
    
    .hourly-occupancy {
      flex: 1;
      min-height: 120px;
    }
    
    .hourly-occupancy h4 {
      margin: 0 0 12px;
      font-size: 14px;
      text-align: center;
      color: #555;
    }
    
    .no-hourly-data {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
      color: #666;
      font-size: 14px;
      padding: 24px;
      border-radius: 4px;
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
export class TableOccupancyChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() occupancyData: TableOccupancy | null = null;
  @ViewChild('hourlyCanvas') hourlyCanvas!: ElementRef<HTMLCanvasElement>;
  
  private hourlyChart: Chart | undefined;
  
  ngAfterViewInit(): void {
    if (this.occupancyData && this.occupancyData.hourlyOccupancy && 
        this.occupancyData.hourlyOccupancy.length > 0) {
      this.createHourlyChart();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['occupancyData'] && !changes['occupancyData'].firstChange) {
      if (this.hourlyChart) {
        this.hourlyChart.destroy();
      }
      
      if (this.occupancyData && this.occupancyData.hourlyOccupancy && 
          this.occupancyData.hourlyOccupancy.length > 0 && this.hourlyCanvas) {
        this.createHourlyChart();
      }
    }
  }
  
  ngOnDestroy(): void {
    if (this.hourlyChart) {
      this.hourlyChart.destroy();
    }
  }
  
  calculateRotation(): number {
    if (!this.occupancyData) return 0;
    
    // Calculate rotation angle based on occupancy rate
    // 0% = -90deg, 100% = 90deg
    const rate = this.occupancyData.occupancyRate;
    return (rate / 100) * 180 - 90;
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  private createHourlyChart(): void {
    try {
      const ctx = this.hourlyCanvas.nativeElement.getContext('2d');
      if (!ctx || !this.occupancyData || !this.occupancyData.hourlyOccupancy) return;
      
      // Sort data by hour
      const sortedData = [...this.occupancyData.hourlyOccupancy].sort((a, b) => a.hour - b.hour);
      
      // Generate hours array (0-23) to ensure all hours are displayed
      const hours = Array.from({ length: 24 }, (_, i) => i);
      
      // Prepare data array with all hours
      const hourlyData: HourlyOccupancy[] = hours.map(hour => {
        const existingData = sortedData.find(data => data.hour === hour);
        if (existingData) {
          return existingData;
        } else {
          return {
            hour,
            occupiedTables: 0,
            occupancyRate: 0
          };
        }
      });
      
      // Prepare the data
      const labels = hourlyData.map(item => this.formatHour(item.hour));
      const occupancyRates = hourlyData.map(item => item.occupancyRate);
      
      // Generate gradient colors based on occupancy rate
      const getGradientColor = (rate: number): string => {
        if (rate >= 80) return 'rgba(231, 76, 60, 0.7)';
        if (rate >= 50) return 'rgba(241, 196, 15, 0.7)';
        return 'rgba(39, 174, 96, 0.7)';
      };
      
      const backgroundColors = occupancyRates.map(rate => getGradientColor(rate));
      
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Occupancy Rate',
              data: occupancyRates,
              backgroundColor: backgroundColors,
              borderWidth: 0,
              borderRadius: 4,
              maxBarThickness: 16
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
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 12
              }
            },
            y: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                callback: (value) => `${value}%`
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
                  const hourData = hourlyData[context.dataIndex];
                  return [
                    `Occupancy: ${hourData.occupancyRate.toFixed(1)}%`,
                    `Tables: ${hourData.occupiedTables}/${this.occupancyData?.totalTables || 0}`
                  ];
                }
              }
            }
          }
        }
      };
      
      this.hourlyChart = new Chart(ctx, config);
    } catch (error) {
      console.error('Error creating hourly occupancy chart:', error);
    }
  }
  
  private formatHour(hour: number): string {
    // Format hour as 12-hour format with AM/PM
    const displayHour = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${displayHour} ${ampm}`;
  }
}