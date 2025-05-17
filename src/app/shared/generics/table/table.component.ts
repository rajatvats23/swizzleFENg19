import { Component, input, output, inject, model, computed, signal, InputSignal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T) => string;
}

export interface SortEvent {
  active: string;
  direction: 'asc' | 'desc' | '';
}

export interface PageEvent {
  pageIndex: number;
  pageSize: number;
}

export interface FilterEvent {
  column: string;
  value: string;
}

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule
  ],
  template: `
    <div class="generic-table-container">
      <table class="generic-table">
        <!-- Header Row -->
        <thead>
          <tr>
            @for (column of columns(); track column.key) {
              <th>
                <div class="header-cell">
                  <span class="header-text">{{ column.header }}</span>
                  @if (column.sortable) {
                    <button 
                      class="sort-button"
                      (click)="onSortClicked(column.key)">
                      <mat-icon class="material-symbols-outlined" >{{ getSortIcon(column.key) }}</mat-icon>
                    </button>
                  }
                  @if (column.filterable) {
                    <button 
                      class="filter-button"
                      [matMenuTriggerFor]="filterMenu">
                      <mat-icon class="material-symbols-outlined" >filter_list</mat-icon>
                    </button>
                    <mat-menu #filterMenu="matMenu" class="filter-menu">
                      <div class="filter-container" (click)="$event.stopPropagation()">
                        <mat-form-field appearance="outline" class="filter-input">
                          <input matInput 
                            placeholder="Filter value..." 
                            [(ngModel)]="filterValues()[column.key]"
                            (keyup.enter)="applyFilter(column.key)">
                        </mat-form-field>
                        <div class="filter-actions">
                          <button mat-button (click)="clearFilter(column.key)">Clear</button>
                          <button mat-raised-button 
                            color="primary" 
                            (click)="applyFilter(column.key)">Apply</button>
                        </div>
                      </div>
                    </mat-menu>
                  }
                </div>
              </th>
            }
            @if (showActions()) {
              <th class="actions-column">Actions</th>
            }
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody>
          @for (row of data(); track row[trackBy()]) {
            <tr [class.alternate-row]="isAlternateRow($index)" (click)="onRowClick(row)">
              @for (column of columns(); track column.key) {
                <td>
                  @if (column.render) {
                    {{ column.render(row) }}
                  } @else {
                    {{ getPropertyValue(row, column.key) }}
                  }
                </td>
              }
              @if (showActions()) {
                <td class="actions-column">
                  <ng-container *ngTemplateOutlet="actionsTemplate(); context: { $implicit: row }"></ng-container>
                </td>
              }
            </tr>
          }
          @if (data().length === 0) {
            <tr class="empty-row">
              <td [attr.colspan]="columns().length + (showActions() ? 1 : 0)">
                {{ noDataMessage() }}
              </td>
            </tr>
          }
        </tbody>
      </table>

      <!-- Pagination -->
      @if (showPagination()) {
        <div class="pagination">
          <div class="pagination-info">
            Showing {{ getPaginationInfo() }}
          </div>
          <div class="pagination-controls">
            <button mat-icon-button 
              [disabled]="currentPage() === 0"
              (click)="onPageChange(currentPage() - 1)">
              <mat-icon class="material-symbols-outlined" >chevron_left</mat-icon>
            </button>
            <span class="pagination-page">{{ currentPage() + 1 }}</span>
            <button mat-icon-button 
              [disabled]="isLastPage()"
              (click)="onPageChange(currentPage() + 1)">
              <mat-icon class="material-symbols-outlined" >chevron_right</mat-icon>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .generic-table-container {
      width: 100%;
      background-color: #fff;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .generic-table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      text-align: left;
      padding: 16px;
      background-color: #009C4C;
      color: white;
      font-weight: 500;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .header-cell {
      display: flex;
      align-items: center;
    }

    .header-text {
      flex: 1;
    }

    .sort-button, .filter-button {
      background: none;
      border: none;
      cursor: pointer;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      margin-left: 4px;
    }

    td {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    tr:hover {
      background-color: rgba(0, 156, 76, 0.04);
    }

    .alternate-row {
      background-color: #FFF8EB;
    }

    .empty-row td {
      text-align: center;
      padding: 24px;
      color: rgba(0, 0, 0, 0.54);
    }

    .actions-column {
      width: 120px;
      text-align: right;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }

    .pagination-info {
      color: rgba(0, 0, 0, 0.54);
      font-size: 12px;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
    }

    .pagination-page {
      margin: 0 8px;
    }

    .filter-container {
      padding: 16px;
      width: auto;
      min-width: 250px;
    }

    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class GenericTableComponent<T> {
  // Input signals
  columns = input<TableColumn<T>[]>([]);
  data = input<T[]>([]);
  totalItems = input<number>(0);
  pageSize = input<number>(10);
  trackBy = input<keyof T>('id' as keyof T);
  noDataMessage = input<string>('No data available');
  showPagination = input<boolean>(true);
  showActions = input<boolean>(false);
  actionsTemplate = input<any>(null);

  // Output signals
  sortChange = output<SortEvent>();
  pageChange = output<PageEvent>();
  filterChange = output<FilterEvent>();
  rowClick = output<T>();

  // Internal signals
  currentPage = signal<number>(0);
  currentSort = signal<SortEvent>({ active: '', direction: '' });
  filterValues = signal<Record<string, string>>({});

  // Computed values
  displayedColumns = computed(() => {
    const cols = this.columns().map(col => col.key);
    if (this.showActions()) {
      cols.push('actions');
    }
    return cols;
  });

  isLastPage = computed(() => {
    return (this.currentPage() + 1) * this.pageSize() >= this.totalItems();
  });

  constructor() {
    // Initialize filters for each filterable column
    effect(() => {
      const filterableColumns = this.columns().filter(col => col.filterable);
      const values: Record<string, string> = {};

      filterableColumns.forEach(col => {
        values[col.key] = '';
      });

      this.filterValues.set(values);
    });
  }

  // Event handlers
  onSortClicked(column: string): void {
    const currentSort = this.currentSort();
    let direction: 'asc' | 'desc' | '' = 'asc';

    if (currentSort.active === column) {
      direction = currentSort.direction === 'asc' ? 'desc' :
        currentSort.direction === 'desc' ? '' : 'asc';
    }

    const sortEvent: SortEvent = { active: column, direction };
    this.currentSort.set(sortEvent);
    this.sortChange.emit(sortEvent);
  }

  onPageChange(page: number): void {
    if (page < 0 || (page * this.pageSize() >= this.totalItems())) {
      return;
    }

    this.currentPage.set(page);
    this.pageChange.emit({
      pageIndex: page,
      pageSize: this.pageSize()
    });
  }

  applyFilter(column: string): void {
    const value = this.filterValues()[column];
    this.filterChange.emit({ column, value });
  }

  clearFilter(column: string): void {
    const values = { ...this.filterValues() };
    values[column] = '';
    this.filterValues.set(values);
    this.filterChange.emit({ column, value: '' });
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  // Helper methods
  getSortIcon(column: string): string {
    const currentSort = this.currentSort();
    if (currentSort.active !== column) {
      return 'unfold_more';
    }

    switch (currentSort.direction) {
      case 'asc': return 'arrow_upward';
      case 'desc': return 'arrow_downward';
      default: return 'unfold_more';
    }
  }

  isAlternateRow(index: number): boolean {
    return index % 2 === 1;
  }

  getPropertyValue(row: T, key: string): any {
    return (row as any)[key];
  }

  getPaginationInfo(): string {
    const start = this.currentPage() * this.pageSize() + 1;
    const end = Math.min((this.currentPage() + 1) * this.pageSize(), this.totalItems());
    return `${start}-${end} of ${this.totalItems()}`;
  }
}