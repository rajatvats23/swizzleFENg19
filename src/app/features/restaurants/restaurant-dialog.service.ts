// src/app/features/restaurants/restaurant-dialog/restaurant-dialog.service.ts
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { RestaurantDialogComponent, RestaurantDialogData } from './restaurant-dialog.component';
import { Restaurant } from './models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantDialogService {
  private dialog = inject(MatDialog);
  
  /**
   * Open restaurant dialog for creating a new restaurant
   * @returns Observable that resolves when dialog is closed
   */
  openCreateDialog(): Observable<boolean | undefined> {
    const dialogData: RestaurantDialogData = { 
      isEditMode: false 
    };
    
    const dialogRef = this.dialog.open<RestaurantDialogComponent, RestaurantDialogData, boolean>(
      RestaurantDialogComponent,
      {
        data: dialogData,
        disableClose: true,
        // width: '800px',
        maxHeight: '90vh' // Ensure it doesn't go off screen
      }
    );
    
    return dialogRef.afterClosed();
  }
  
  /**
   * Open restaurant dialog for editing an existing restaurant
   * @param restaurant The restaurant to edit
   * @returns Observable that resolves when dialog is closed
   */
  openEditDialog(restaurant: Restaurant): Observable<boolean | undefined> {
    if (!restaurant) {
      console.error('Restaurant object is required for editing');
      return new Observable(observer => observer.next(false));
    }
    
    const dialogData: RestaurantDialogData = { 
      restaurant,
      isEditMode: true
    };
    
    const dialogRef = this.dialog.open<RestaurantDialogComponent, RestaurantDialogData, boolean>(
      RestaurantDialogComponent,
      {
        data: dialogData,
        disableClose: true,
        // width: '800px',
        maxHeight: '90vh' // Ensure it doesn't go off screen
      }
    );
    
    return dialogRef.afterClosed();
  }
}