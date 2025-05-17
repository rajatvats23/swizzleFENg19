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
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
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