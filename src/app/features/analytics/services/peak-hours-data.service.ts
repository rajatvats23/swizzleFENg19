// src/app/features/analytics/services/peak-hours-data.service.ts
import { Injectable } from '@angular/core';
import { HourlyData, PeakHour } from '../models/analytics.model';

interface DayOfWeekData {
  dayOfWeek: string;
  dayOfWeekNum: number;
  data: HourlyData[];
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class PeakHoursDataService {
  
  /**
   * Groups hourly data by day of the week
   * @param hourlyData Array of hourly data points
   * @returns Array of data grouped by day of week
   */
  groupByDayOfWeek(hourlyData: HourlyData[]): DayOfWeekData[] {
    // Create a map to store data by day of week
    const dayMap = new Map<number, DayOfWeekData>();
    
    // Group data
    hourlyData.forEach(item => {
      if (!dayMap.has(item.dayOfWeekNum)) {
        dayMap.set(item.dayOfWeekNum, {
          dayOfWeek: item.dayOfWeek,
          dayOfWeekNum: item.dayOfWeekNum,
          data: [],
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0
        });
      }
      
      const dayData = dayMap.get(item.dayOfWeekNum)!;
      dayData.data.push(item);
      dayData.totalOrders += item.orderCount;
      dayData.totalRevenue += item.totalRevenue;
    });
    
    // Calculate average order value for each day
    dayMap.forEach(day => {
      day.avgOrderValue = day.totalOrders > 0 ? day.totalRevenue / day.totalOrders : 0;
    });
    
    // Convert map to array and sort by day of week
    return Array.from(dayMap.values())
      .sort((a, b) => a.dayOfWeekNum - b.dayOfWeekNum);
  }
  
  /**
   * Gets the busiest day of the week
   * @param hourlyData Array of hourly data points
   * @returns The busiest day of the week
   */
  getBusiestDay(hourlyData: HourlyData[]): DayOfWeekData | null {
    const dayData = this.groupByDayOfWeek(hourlyData);
    
    if (dayData.length === 0) {
      return null;
    }
    
    return dayData.reduce((prev, current) => 
      prev.totalOrders > current.totalOrders ? prev : current);
  }
  
  /**
   * Gets the highest revenue day of the week
   * @param hourlyData Array of hourly data points
   * @returns The highest revenue day of the week
   */
  getHighestRevenueDay(hourlyData: HourlyData[]): DayOfWeekData | null {
    const dayData = this.groupByDayOfWeek(hourlyData);
    
    if (dayData.length === 0) {
      return null;
    }
    
    return dayData.reduce((prev, current) => 
      prev.totalRevenue > current.totalRevenue ? prev : current);
  }
  
  /**
   * Gets top peak hours aggregated over time
   * @param peakHours Array of peak hour data
   * @param count Number of top peak hours to return
   * @returns Array of top peak hours
   */
  getTopPeakHours(peakHours: PeakHour[], count: number = 3): PeakHour[] {
    if (!peakHours || peakHours.length === 0) {
      return [];
    }
    
    // Sort by order count descending
    return [...peakHours]
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, count);
  }
  
  /**
   * Gets top revenue hours
   * @param peakHours Array of peak hour data
   * @param count Number of top hours to return
   * @returns Array of top revenue hours
   */
  getTopRevenueHours(peakHours: PeakHour[], count: number = 3): PeakHour[] {
    if (!peakHours || peakHours.length === 0) {
      return [];
    }
    
    // Sort by revenue descending
    return [...peakHours]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, count);
  }
  
  /**
   * Gets performance by hour of day across all days
   * @param hourlyData Array of hourly data
   * @returns Object with hourly performance data
   */
  getHourlyPerformance(hourlyData: HourlyData[]): { [hour: number]: { orderCount: number, totalRevenue: number, days: number } } {
    const hourlyPerformance: { [hour: number]: { orderCount: number, totalRevenue: number, days: number } } = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyPerformance[i] = { orderCount: 0, totalRevenue: 0, days: 0 };
    }
    
    // Aggregate data
    hourlyData.forEach(item => {
      hourlyPerformance[item.hour].orderCount += item.orderCount;
      hourlyPerformance[item.hour].totalRevenue += item.totalRevenue;
      hourlyPerformance[item.hour].days += 1;
    });
    
    return hourlyPerformance;
  }
  
  /**
   * Gets peak hours data for a specific day of week
   * @param hourlyData Array of hourly data
   * @param dayOfWeek Day of week number (0-6)
   * @returns Array of peak hour data for the specified day
   */
  getPeakHoursForDay(hourlyData: HourlyData[], dayOfWeek: number): PeakHour[] {
    const dayData = hourlyData.filter(item => item.dayOfWeekNum === dayOfWeek);
    
    // Group data by hour
    const hourMap = new Map<number, PeakHour>();
    
    dayData.forEach(item => {
      if (!hourMap.has(item.hour)) {
        hourMap.set(item.hour, {
          hour: item.hour,
          orderCount: 0,
          totalRevenue: 0
        });
      }
      
      const hourData = hourMap.get(item.hour)!;
      hourData.orderCount += item.orderCount;
      hourData.totalRevenue += item.totalRevenue;
    });
    
    // Convert map to array and sort by hour
    return Array.from(hourMap.values())
      .sort((a, b) => a.hour - b.hour);
  }
  
  /**
   * Gets busiest hour for a specific day
   * @param hourlyData Array of hourly data
   * @param dayOfWeek Day of week number (0-6)
   * @returns The busiest hour for the specified day
   */
  getBusiestHourForDay(hourlyData: HourlyData[], dayOfWeek: number): PeakHour | null {
    const peakHours = this.getPeakHoursForDay(hourlyData, dayOfWeek);
    
    if (peakHours.length === 0) {
      return null;
    }
    
    return peakHours.reduce((prev, current) => 
      prev.orderCount > current.orderCount ? prev : current);
  }
  
  /**
   * Gets insight about the best days to promote business based on order volume
   * @param hourlyData Array of hourly data
   * @returns Array of days sorted by promotion potential
   */
  getPromotionInsights(hourlyData: HourlyData[]): { dayOfWeek: string, potential: 'high' | 'medium' | 'low', reason: string }[] {
    const dayData = this.groupByDayOfWeek(hourlyData);
    
    if (dayData.length === 0) {
      return [];
    }
    
    // Calculate the average orders per day
    const totalOrders = dayData.reduce((sum, day) => sum + day.totalOrders, 0);
    const avgOrdersPerDay = totalOrders / dayData.length;
    
    // Determine promotion potential for each day
    return dayData.map(day => {
      let potential: 'high' | 'medium' | 'low';
      let reason: string;
      
      if (day.totalOrders < avgOrdersPerDay * 0.7) {
        potential = 'high';
        reason = 'Low traffic day, high potential for promotions to increase customers';
      } else if (day.totalOrders < avgOrdersPerDay * 0.9) {
        potential = 'medium';
        reason = 'Below average traffic, moderate potential for promotions';
      } else {
        potential = 'low';
        reason = 'Already a busy day, focus on customer experience instead of promotions';
      }
      
      return {
        dayOfWeek: day.dayOfWeek,
        potential,
        reason
      };
    }).sort((a, b) => {
      // Sort by promotion potential (high first)
      const potentialOrder = { high: 0, medium: 1, low: 2 };
      return potentialOrder[a.potential] - potentialOrder[b.potential];
    });
  }
  
  /**
   * Formats hour number to AM/PM format
   * @param hour Hour number (0-23)
   * @returns Formatted hour string
   */
  formatHourAmPm(hour: number): string {
    const hourNum = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${hourNum} ${ampm}`;
  }
  
  /**
   * Get peak hour time range (start and end hour)
   * @param hour Hour number
   * @returns Time range string
   */
  getHourRange(hour: number): string {
    const startHour = this.formatHourAmPm(hour);
    const endHour = this.formatHourAmPm(hour + 1);
    return `${startHour} - ${endHour}`;
  }
  
  /**
   * Get name of day from day number
   * @param dayNum Day number (0-6, Sunday to Saturday)
   * @returns Day name
   */
  getDayName(dayNum: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum % 7];
  }
}