import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material Modules
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
} from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Rental, RentalStatus } from '../../../core/models/rental.model';
import { RentalService } from '../../../core/services/rental.service';

@Component({
  selector: 'app-admin-rentals',
  templateUrl: './admin-rentals.component.html',
  styleUrls: ['./admin-rentals.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatCardModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
})
export class AdminRentalsComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'property',
    'tenant',
    'realtor',
    'monthlyRate',
    'rentalPeriod',
    'status',
    'actions',
  ];

  dataSource = new MatTableDataSource<Rental>([]);
  rentals: Rental[] = [];

  // Pagination variables
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;

  // UI state variables
  loading: boolean = false;
  errorMessage: string = '';
  deleteItemId: number | null = null;
  deleteInProgress: boolean = false;

  // Date filter variables
  fromDate: Date | null = null;
  toDate: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private rentalService: RentalService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRentals();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadRentals() {
    this.loading = true;
    this.errorMessage = '';

    this.rentalService
      .getActiveRentals(this.currentPage, this.pageSize)
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((error) => {
          this.errorMessage = 'Failed to load rentals. Please try again.';
          return of({
            success: false,
            message: '',
            data: {
              content: [],
              page: 0,
              size: 10,
              totalElements: 0,
              totalPages: 0,
              last: true,
              first: true,
            },
            timestamp: '',
          });
        })
      )
      .subscribe((response) => {
        if (response.success) {
          this.rentals = response.data.content;
          this.dataSource.data = this.rentals;
          this.totalElements = response.data.totalElements;
        } else {
          this.errorMessage = response.message || 'Failed to load rentals';
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByStatus(status: string) {
    if (!status) {
      this.loadRentals();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.rentalService
      .getRentalsByStatus(
        status as RentalStatus,
        this.currentPage,
        this.pageSize
      )
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((error) => {
          this.errorMessage = 'Failed to filter rentals. Please try again.';
          return of({
            success: false,
            message: '',
            data: {
              content: [],
              page: 0,
              size: 10,
              totalElements: 0,
              totalPages: 0,
              last: true,
              first: true,
            },
            timestamp: '',
          });
        })
      )
      .subscribe((response) => {
        if (response.success) {
          this.rentals = response.data.content;
          this.dataSource.data = this.rentals;
          this.totalElements = response.data.totalElements;
        } else {
          this.errorMessage = response.message || 'Failed to filter rentals';
        }
      });
  }

  filterByDateRange() {
    // Get dates from the date pickers
    // This implementation assumes the date pickers in HTML template have references like
    // fromPicker.startAt and toPicker.startAt

    // For now, simple filter on the client side
    if (this.fromDate || this.toDate) {
      this.dataSource.data = this.rentals.filter((rental) => {
        const rentalStartDate = new Date(rental.startDate);
        const rentalEndDate = new Date(rental.endDate);

        if (this.fromDate && this.toDate) {
          return (
            rentalStartDate >= this.fromDate && rentalEndDate <= this.toDate
          );
        } else if (this.fromDate) {
          return rentalStartDate >= this.fromDate;
        } else if (this.toDate) {
          return rentalEndDate <= this.toDate;
        }

        return true;
      });
    } else {
      this.dataSource.data = this.rentals;
    }
  }

  clearSearch() {
    const input = document.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = '';
      this.dataSource.filter = '';
    }
    this.loadRentals();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadRentals();
  }

  getActiveRentalsCount(): number {
    return this.rentals.filter(
      (rental) => rental.status === RentalStatus.ACTIVE
    ).length;
  }

  getPendingRentalsCount(): number {
    return this.rentals.filter(
      (rental) => rental.status === RentalStatus.PENDING
    ).length;
  }

  viewRental(id: number) {
    this.router.navigate(['/rentals', id]);
  }

  editRental(id: number) {
    this.router.navigate(['/rentals/edit', id]);
  }

  createNewRental() {
    this.router.navigate(['/rentals/create']);
  }

  confirmDelete(id: number) {
    this.deleteItemId = id;
  }

  cancelDelete() {
    this.deleteItemId = null;
  }

  deleteRental(id: number) {
    this.deleteInProgress = true;

    // Sử dụng updateRentalStatus thay vì deleteRental vì service của bạn không có phương thức xóa
    this.rentalService
      .updateRentalStatus(id, RentalStatus.CANCELLED, 'Cancelled by admin')
      .pipe(
        finalize(() => {
          this.deleteInProgress = false;
          this.deleteItemId = null;
        }),
        catchError((error) => {
          this.errorMessage = 'Failed to cancel rental. Please try again.';
          return of({ success: false, message: '', data: null, timestamp: '' });
        })
      )
      .subscribe((response) => {
        if (response.success) {
          // Cập nhật trạng thái của hợp đồng đã hủy trong danh sách
          const index = this.rentals.findIndex((rental) => rental.id === id);
          if (index !== -1) {
            this.rentals[index].status = RentalStatus.CANCELLED;
            this.dataSource.data = [...this.rentals]; // Cập nhật lại dataSource

            this.snackBar.open(
              'Rental has been cancelled successfully',
              'Close',
              {
                duration: 3000,
                panelClass: 'success-snackbar',
              }
            );
          }
        } else {
          this.errorMessage = response.message || 'Failed to cancel rental';
          this.snackBar.open('Failed to cancel rental', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar',
          });
        }
      });
  }

  dismissError() {
    this.errorMessage = '';
  }
}
