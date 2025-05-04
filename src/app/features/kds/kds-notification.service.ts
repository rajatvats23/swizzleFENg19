import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Order } from './models/kds.model';

@Injectable({
  providedIn: 'root'
})
export class KdsNotificationService {
  private notificationsSubject = new BehaviorSubject<Order[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  
  private soundEnabled = true;
  
  addNotification(order: Order): void {
    const currentNotifications = this.notificationsSubject.value;
    
    // Check if this order is already in the notifications
    if (!currentNotifications.some(o => o._id === order._id)) {
      this.notificationsSubject.next([...currentNotifications, order]);
      
      // Play sound if enabled
      if (this.soundEnabled) {
        this.playNotificationSound();
      }
    }
  }
  
  removeNotification(orderId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(
      currentNotifications.filter(order => order._id !== orderId)
    );
  }
  
  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
  }
  
  playNotificationSound(): void {
    try {
      // Create simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      
      // Stop after 0.3 seconds
      setTimeout(() => {
        oscillator.stop();
      }, 300);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }
  
  toggleSound(enabled: boolean): void {
    this.soundEnabled = enabled;
  }
  
  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
}