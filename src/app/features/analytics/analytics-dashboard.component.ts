// src/app/features/analytics/analytics-dashboard.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AnalyticsService } from './analytics.service';
import { PeakHoursDataService } from './services/peak-hours-data.service';
import { 
  DashboardSummary, 
  TopSellingItem, 
  DailyRevenue, 
  AverageOrderValue, 
  TableOccupancy,
  PeakHour,
  OrderFulfillmentTime,
  CustomerReturnRate,
  CategoryPerformance,
  PaymentMethodDistribution,
  HourlyData
} from './models/analytics.model';

// Import chart components
import { RevenueChartComponent } from './charts/revenue-chart.component';
import { TopItemsChartComponent } from './charts/top-items-chart.component';
import { CategoryPieChartComponent } from './charts/category-pie-chart.component';
import { PaymentMethodChartComponent } from './charts/payment-method-chart.component';
import { PeakHoursChartComponent } from './charts/peak-hours-chart.component';
import { TableOccupancyChartComponent } from './charts/table-occupancy-chart.component';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    // Chart components
    RevenueChartComponent,
    TopItemsChartComponent,
    CategoryPieChartComponent,
    PaymentMethodChartComponent,
    PeakHoursChartComponent,
    TableOccupancyChartComponent
  ],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss']
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private analyticsService = inject(AnalyticsService);
  private peakHoursService = inject(PeakHoursDataService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  
  filterForm!: FormGroup;
  isLoading = false;
  
  // Analytics data
  dashboardSummary: DashboardSummary | null = null;
  topSellingItems: TopSellingItem[] = [];
  dailyRevenue: DailyRevenue[] = [];
  averageOrderValues: AverageOrderValue[] = [];
  tableOccupancy: TableOccupancy | null = null;
  peakHours: PeakHour[] = [];
  hourlyData: HourlyData[] = [];
  orderFulfillmentTime: OrderFulfillmentTime | null = null;
  customerReturnRate: CustomerReturnRate | null = null;
  categoryPerformance: CategoryPerformance[] = [];
  paymentMethodDistribution: PaymentMethodDistribution[] = [];
  
  // Selected day for peak hours view
  selectedDayOfWeek: number | 'all' = 'all';
  
  // Tab navigation
  activeTab: 'revenue' | 'operations' = 'revenue';
  
  // Date filter options
  dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];
  
  // Error tracking
  errors: { [key: string]: string } = {};
  
  private subscriptions = new Subscription();
  
  ngOnInit(): void {
    this.initFilterForm();
    this.loadAnalyticsData();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  initFilterForm(): void {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    this.filterForm = this.fb.group({
      dateRange: ['last7days', Validators.required],
      startDate: [lastWeek, Validators.required],
      endDate: [today, Validators.required]
    });
  }
  
  onDateRangeChange(): void {
    const dateRange = this.filterForm.get('dateRange')?.value;
    const today = new Date();
    
    let startDate = new Date();
    let endDate = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        endDate = new Date();
        break;
      case 'last30days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        endDate = new Date();
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date();
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'custom':
        // Leave the existing dates in the form
        return;
    }
    
    this.filterForm.patchValue({
      startDate,
      endDate
    });
  }
  
  applyFilters(): void {
    if (this.filterForm.valid) {
      this.loadAnalyticsData();
    } else {
      this.snackBar.open('Please select valid date range', 'Close', { duration: 3000 });
    }
  }
  
  resetFilters(): void {
    this.initFilterForm();
    this.loadAnalyticsData();
  }
  
  onDayOfWeekChange(day: number | 'all'): void {
    this.selectedDayOfWeek = day;
  }
  
  // Method to change active tab
  setActiveTab(tab: 'revenue' | 'operations'): void {
    this.activeTab = tab;
  }
  
  loadAnalyticsData(): void {
    this.isLoading = true;
    this.errors = {};
    
    const startDate = this.formatDate(this.filterForm.get('startDate')?.value);
    const endDate = this.formatDate(this.filterForm.get('endDate')?.value);
    
    // Create an array of API calls with error handling
    const apiCalls = [
      this.analyticsService.getDashboardSummary().pipe(
        catchError(error => {
          this.errors['dashboard'] = 'Failed to load dashboard summary';
          return of(null);
        })
      ),
      this.analyticsService.getTopSellingItems(startDate, endDate).pipe(
        catchError(error => {
          this.errors['topItems'] = 'Failed to load top selling items';
          return of(null);
        })
      ),
      this.analyticsService.getDailyRevenue(startDate, endDate).pipe(
        catchError(error => {
          this.errors['revenue'] = 'Failed to load revenue data';
          return of(null);
        })
      ),
      this.analyticsService.getAverageOrderValue(startDate, endDate).pipe(
        catchError(error => {
          this.errors['avgOrder'] = 'Failed to load average order values';
          return of(null);
        })
      ),
      this.analyticsService.getTableOccupancy().pipe(
        catchError(error => {
          this.errors['occupancy'] = 'Failed to load table occupancy data';
          return of(null);
        })
      ),
      this.analyticsService.getPeakHours(startDate, endDate).pipe(
        catchError(error => {
          this.errors['peakHours'] = 'Failed to load peak hours data';
          return of(null);
        })
      ),
      this.analyticsService.getOrderFulfillmentTime(startDate, endDate).pipe(
        catchError(error => {
          this.errors['fulfillment'] = 'Failed to load order fulfillment data';
          return of(null);
        })
      ),
      this.analyticsService.getCustomerReturnRate(startDate, endDate).pipe(
        catchError(error => {
          this.errors['customerRate'] = 'Failed to load customer return rate data';
          return of(null);
        })
      ),
      this.analyticsService.getCategoryPerformance(startDate, endDate).pipe(
        catchError(error => {
          this.errors['category'] = 'Failed to load category performance data';
          return of(null);
        })
      ),
      this.analyticsService.getPaymentMethodDistribution(startDate, endDate).pipe(
        catchError(error => {
          this.errors['payment'] = 'Failed to load payment method distribution data';
          return of(null);
        })
      )
    ];
    
    // Use forkJoin to execute all API calls in parallel
    const subscription = forkJoin(apiCalls).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (responses: any[]) => {
        const [
          summaryResponse,
          topItemsResponse,
          revenueResponse,
          avgOrderResponse,
          tableOccupancyResponse,
          peakHoursResponse,
          fulfillmentTimeResponse,
          customerReturnResponse,
          categoryResponse,
          paymentResponse
        ] = responses;

        
        // Process responses and update component properties
        if (summaryResponse) {
          this.dashboardSummary = summaryResponse.data.summary;
        }
        
        if (topItemsResponse) {
          this.topSellingItems = topItemsResponse.data.topItems;
        }
        
        if (revenueResponse) {
          this.dailyRevenue = revenueResponse.data.dailyRevenue;
        }
        
        if (avgOrderResponse) {
          this.averageOrderValues = avgOrderResponse.data.averageOrderValues;
        }
        
        if (tableOccupancyResponse) {
          this.tableOccupancy = tableOccupancyResponse.data.occupancy;
        }
        
        if (peakHoursResponse) {
          // Extract peak hours data for visualization
          this.peakHours = peakHoursResponse?.data?.peakHours || [];
          this.hourlyData = peakHoursResponse?.data?.hourlyData || [];
          
          // Sort peak hours data by hour for better visualization
          this.peakHours = this.peakHours.sort((a, b) => a.hour - b.hour);
        }
        
        if (fulfillmentTimeResponse) {
          this.orderFulfillmentTime = fulfillmentTimeResponse.data.fulfillmentTime;
        }
        
        if (customerReturnResponse) {
          this.customerReturnRate = customerReturnResponse.data.customerMetrics;
        }
        
        if (categoryResponse) {
          this.categoryPerformance = categoryResponse.data.categories;
        }
        
        if (paymentResponse) {
          this.paymentMethodDistribution = paymentResponse.data.paymentMethods;
        }
        
        // Show errors if any
        const errorCount = Object.keys(this.errors).length;
        if (errorCount > 0) {
          this.snackBar.open(`${errorCount} error(s) loading analytics data. Some charts may not display correctly.`, 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        console.error('Critical error loading analytics data:', error);
        this.snackBar.open('Failed to load analytics data', 'Close', { duration: 5000 });
      }
    });
    
    this.subscriptions.add(subscription);
  }
  
  // Helper methods
  formatDate(date: Date): string {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  calculatePercentage(current: number, previous: number): number {
    if (!previous) return 0;
    
    const percentChange = ((current - previous) / previous) * 100;
    return Math.round(percentChange);
  }
  
  getAverageOrderValue(): number {
    if (!this.averageOrderValues || this.averageOrderValues.length === 0) {
      return 0;
    }
    
    // Calculate the average of all average order values
    const sum = this.averageOrderValues.reduce((acc, item) => acc + item.averageValue, 0);
    return sum / this.averageOrderValues.length;
  }
  
  getAverageOrderTrend(): number {
    if (!this.averageOrderValues || this.averageOrderValues.length < 2) {
      return 0;
    }
    
    // Calculate the trend from the first to the last average order value
    const firstValue = this.averageOrderValues[0].averageValue;
    const lastValue = this.averageOrderValues[this.averageOrderValues.length - 1].averageValue;
    
    return this.calculatePercentage(lastValue, firstValue);
  }
  
  formatFulfillmentTime(minutes?: number): string {
    if (!minutes) return '0m';
    
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    
    return `${hours}h ${remainingMinutes}m`;
  }
  
  // Methods for peak hours data
  getFilteredPeakHoursData(): PeakHour[] {
    if (this.selectedDayOfWeek === 'all') {
      return this.peakHours;
    } else {
      // Create aggregated data for the selected day
      const dayData = this.hourlyData.filter(item => item.dayOfWeekNum === this.selectedDayOfWeek);
      
      // Group data by hour
      const hourMap = new Map<number, PeakHour>();
      
      dayData.forEach(item => {
        hourMap.set(item.hour, {
          hour: item.hour,
          orderCount: item.orderCount,
          totalRevenue: item.totalRevenue
        });
      });
      
      return Array.from(hourMap.values()).sort((a, b) => a.hour - b.hour);
    }
  }
  
  getBusiestHour(): string {
    const peakData = this.getFilteredPeakHoursData();
    
    if (!peakData || peakData.length === 0) {
      return 'N/A';
    }
    
    const busiestHour = peakData.reduce((prev, current) => 
      (prev.orderCount > current.orderCount) ? prev : current
    );
    
    return `${this.formatHour(busiestHour.hour)} (${busiestHour.orderCount} orders)`;
  }
  
  getHighestRevenueHour(): string {
    const peakData = this.getFilteredPeakHoursData();
    
    if (!peakData || peakData.length === 0) {
      return 'N/A';
    }
    
    const highestHour = peakData.reduce((prev, current) => 
      (prev.totalRevenue > current.totalRevenue) ? prev : current
    );
    
    return `${this.formatHour(highestHour.hour)} (₹${highestHour.totalRevenue.toLocaleString()})`;
  }
  
  formatHour(hour: number): string {
    const displayHour = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${displayHour} ${ampm}`;
  }
  
  getBusiestDay(): { day: string, count: number } | null {
    if (!this.hourlyData || this.hourlyData.length === 0) {
      return null;
    }
    
    const busiest = this.peakHoursService.getBusiestDay(this.hourlyData);
    
    if (!busiest) {
      return null;
    }
    
    return {
      day: busiest.dayOfWeek,
      count: busiest.totalOrders
    };
  }
  
  // Method to check for API error
  hasError(key: string): boolean {
    return Object.keys(this.errors).includes(key);
  }
  
  // Method to get error message
  getErrorMessage(key: string): string {
    return this.errors[key] || 'Error loading data';
  }
}