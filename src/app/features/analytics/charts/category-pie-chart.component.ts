import { Component, Input, OnChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryPerformance } from '../models/analytics.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-category-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div *ngIf="!categoryData || categoryData.length === 0" class="no-data">
        <p>No category data available</p>
      </div>
      <div *ngIf="categoryData && categoryData.length > 0" class="chart-content">
        <div class="pie-container">
          <canvas #categoryCanvas></canvas>
        </div>
        
        <div class="category-legend">
          <div *ngFor="let category of categoryData; let i = index" class="legend-item">
            <div class="legend-color" [style.background-color]="getColorForIndex(i)"></div>
            <div class="legend-details">
              <div class="legend-name">{{category.categoryName}}</div>
              <div class="legend-metric">₹{{category.totalRevenue | number:'1.0-0'}} ({{category.percentage | number:'1.1-1'}}%)</div>
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
    
    .pie-container {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      min-height: 180px;
    }
    
    canvas {
      max-height: 180px;
    }
    
    .category-legend {
      margin-top: 16px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
    }
    
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      margin-right: 8px;
      flex-shrink: 0;
    }
    
    .legend-details {
      flex: 1;
      min-width: 0;
    }
    
    .legend-name {
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .legend-metric {
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
export class CategoryPieChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() categoryData: CategoryPerformance[] = [];
  @ViewChild('categoryCanvas') categoryCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | undefined;
  private colorPalette = [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(40, 167, 69, 0.8)',
    'rgba(220, 53, 69, 0.8)',
    'rgba(253, 126, 20, 0.8)',
    'rgba(23, 162, 184, 0.8)'
  ];
  
  ngAfterViewInit(): void {
    if (this.categoryData && this.categoryData.length > 0) {
      this.createChart();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryData'] && !changes['categoryData'].firstChange && this.categoryCanvas) {
      if (this.chart) {
        this.chart.destroy();
      }
      
      if (this.categoryData && this.categoryData.length > 0) {
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
      const ctx = this.categoryCanvas.nativeElement.getContext('2d');
      if (!ctx) return;
      
      // Sort data by revenue (descending)
      const sortedData = [...this.categoryData].sort((a, b) => b.totalRevenue - a.totalRevenue);
      
      // Prepare the data
      const labels = sortedData.map(item => item.categoryName);
      const data = sortedData.map(item => item.totalRevenue);
      const backgroundColors = sortedData.map((_, index) => this.getColorForIndex(index));
      
      const config: ChartConfiguration = {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: backgroundColors,
              borderWidth: 0,
              hoverOffset: 4
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
                  const category = sortedData[context.dataIndex];
                  const percent = category.percentage.toFixed(1);
                  return [
                    `${category.categoryName}`,
                    `Revenue: ₹${category.totalRevenue.toLocaleString()}`,
                    `Percentage: ${percent}%`,
                    `Orders: ${category.orderCount}`
                  ];
                }
              }
            }
          },
          // cutout: '60%',
          layout: {
            padding: 10
          }
        }
      };
      
      this.chart = new Chart(ctx, config);
    } catch (error) {
      console.error('Error creating category pie chart:', error);
    }
  }
  
  getColorForIndex(index: number): string {
    return this.colorPalette[index % this.colorPalette.length];
  }
}