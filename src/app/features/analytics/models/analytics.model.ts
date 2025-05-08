// src/app/features/analytics/models/analytics.model.ts
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface DashboardSummary {
  todayRevenue: number;
  todayOrders: number;
  weeklyRevenue: number;
  weeklyOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  activeTables: number;
  totalTables: number;
  tableOccupancyRate: number;
  pendingOrders: number;
  yesterdayRevenue: number;
  yesterdayOrders: number;
  revenueChangeDaily: number;
  ordersChangeDaily: number;
}

export interface TopSellingItem {
  _id: string;
  productName: string;
  productImage?: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  averageOrderQuantity: number;
}

export interface DailyRevenue {
  date: string;
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  paymentMethods: {
    cash: number;
    card: number;
    online: number;
    [key: string]: number;
  };
}

export interface AverageOrderValue {
  date: string;
  averageValue: number;
  orderCount: number;
  totalRevenue: number;
}

export interface TableOccupancy {
  date: string;
  totalTables: number;
  tablesUsed: number;
  occupancyRate: number;
  hourlyOccupancy: HourlyOccupancy[];
}

export interface HourlyOccupancy {
  hour: number;
  occupiedTables: number;
  occupancyRate: number;
}

export interface PeakHour {
  hour: number;
  orderCount: number;
  totalRevenue: number;
}

export interface HourlyData {
  hour: number;
  dayOfWeek: string;
  dayOfWeekNum: number;
  orderCount: number;
  totalRevenue: number;
}

export interface PeakHoursAnalysis {
  hourlyData: HourlyData[];
  peakHours: PeakHour[];
}

export interface OrderTimeData {
  _id: string;
  orderId: string;
  placedAt: string;
  completedAt: string;
  fulfillmentTime: number;
}

export interface DailyFulfillmentTime {
  _id: string;
  averageFulfillmentTime: number;
  orderCount: number;
}

export interface OrderFulfillmentTime {
  averageFulfillmentTime: number;
  totalOrders: number;
  orderTimes: OrderTimeData[];
  dailyFulfillmentTimes: DailyFulfillmentTime[];
}

export interface VisitCountDistribution {
  visitCount: number;
  customerCount: number;
  percentage: number;
}

export interface CustomerInfo {
  id: string;
  phoneNumber: string;
  name: string;
  visitCount: number;
}

export interface CustomerReturnRate {
  totalCustomers: number;
  returningCustomers: number;
  returnRate: number;
  visitCountDistribution: VisitCountDistribution[];
  customerList: CustomerInfo[];
}

export interface CategoryPerformance {
  _id: string;
  categoryName: string;
  totalRevenue: number;
  orderCount: number;
  itemCount: number;
  percentage: number;
}

export interface CategoryAnalysis {
  totalRevenue: number;
  categories: CategoryPerformance[];
}

export interface DailyPaymentTrend {
  date: string;
  methods: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
}

export interface PaymentMethod {
  method: string;
  count: number;
  totalAmount: number;
  orderPercentage: number;
  amountPercentage: number;
}

export interface PaymentMethodDistribution {
  totalOrders: number;
  totalAmount: number;
  paymentMethods: PaymentMethod[];
  dailyTrend: DailyPaymentTrend[];
}