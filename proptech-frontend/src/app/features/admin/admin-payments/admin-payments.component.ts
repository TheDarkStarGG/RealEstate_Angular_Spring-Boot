import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Material Imports
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  PageEvent,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PaymentFormComponent } from '../payment-form/payment-form.component';
import { PaymentService } from '../../../core/services/payment.service';
import {
  Payment,
  PaymentStatus,
  PaymentType,
} from '../../../core/models/payment.model';

@Component({
  selector: 'app-admin-payments',
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    // Add PaymentFormComponent if it's also a standalone component
    // PaymentFormComponent
  ],
})
export class AdminPaymentsComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'user',
    'paymentType',
    'amount',
    'status',
    'date',
    'actions',
  ];
  dataSource = new MatTableDataSource<Payment>([]);
  loading = false;
  errorMessage = '';
  deleteItemId: number | null = null;
  deleteInProgress = false;

  // Pagination variables
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  sortBy = 'createdAt';
  sortDir = 'desc';

  // Date Range form
  dateRange: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private paymentService: PaymentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.dateRange = this.fb.group({
      start: [null],
      end: [null],
    });
  }

  ngOnInit(): void {
    this.loadPayments();

    // Subscribe to date range changes
    this.dateRange.valueChanges.subscribe((range) => {
      if (range.start && range.end) {
        this.filterByDateRange(range.start, range.end);
      }
    });
  }

  loadPayments(
    type?: PaymentType,
    status?: PaymentStatus,
    page: number = 0,
    size: number = this.pageSize
  ): void {
    this.loading = true;
    this.errorMessage = '';

    if (type) {
      this.paymentService.getPaymentsByType(type, page, size).subscribe({
        next: (response) => {
          if (response.success) {
            this.dataSource.data = response.data.content;
            this.totalElements = response.data.totalElements;
            this.currentPage = response.data.page;
          } else {
            this.errorMessage =
              response.message || 'Không thể tải danh sách thanh toán';
          }
          this.loading = false;
          this.setupTableData();
        },
        error: (err) => {
          this.errorMessage =
            'Lỗi khi tải thanh toán: ' +
            (err.error?.message || err.message || 'Lỗi không xác định');
          this.loading = false;
        },
      });
    } else if (status) {
      this.paymentService.getPaymentsByStatus(status, page, size).subscribe({
        next: (response) => {
          if (response.success) {
            this.dataSource.data = response.data.content;
            this.totalElements = response.data.totalElements;
            this.currentPage = response.data.page;
          } else {
            this.errorMessage =
              response.message || 'Không thể tải danh sách thanh toán';
          }
          this.loading = false;
          this.setupTableData();
        },
        error: (err) => {
          this.errorMessage =
            'Lỗi khi tải thanh toán: ' +
            (err.error?.message || err.message || 'Lỗi không xác định');
          this.loading = false;
        },
      });
    } else {
      // Fetch all payments using our new getAllPayments endpoint
      this.paymentService
        .getAllPayments(page, size, this.sortBy, this.sortDir)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.dataSource.data = response.data.content;
              this.totalElements = response.data.totalElements;
              this.currentPage = response.data.page;
            } else {
              this.errorMessage =
                response.message || 'Không thể tải danh sách thanh toán';
            }
            this.loading = false;
            this.setupTableData();
          },
          error: (err) => {
            this.errorMessage =
              'Lỗi khi tải thanh toán: ' +
              (err.error?.message || err.message || 'Lỗi không xác định');
            this.loading = false;
          },
        });
    }
  }

  setupTableData(): void {
    this.dataSource.sort = this.sort;
    setTimeout(() => {
      if (this.paginator) {
        this.paginator.pageIndex = this.currentPage;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByPaymentType(type: string): void {
    if (type) {
      this.loadPayments(type as PaymentType);
    } else {
      this.loadPayments();
    }
  }

  filterByStatus(status: string): void {
    if (status) {
      this.loadPayments(undefined, status as PaymentStatus);
    } else {
      this.loadPayments();
    }
  }

  filterByDateRange(startDate: Date, endDate: Date): void {
    this.loading = true;
    this.errorMessage = '';

    // Convert to ISO strings
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();

    this.paymentService
      .getPaymentsByDateRange(startStr, endStr, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dataSource.data = response.data.content;
            this.totalElements = response.data.totalElements;
            this.currentPage = response.data.page;
          } else {
            this.errorMessage =
              response.message || 'Không thể tải danh sách thanh toán';
          }
          this.loading = false;
          this.setupTableData();
        },
        error: (err) => {
          this.errorMessage =
            'Lỗi khi tải thanh toán: ' +
            (err.error?.message || err.message || 'Lỗi không xác định');
          this.loading = false;
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.loadPayments(undefined, undefined, event.pageIndex, event.pageSize);
  }

  onSortChange(): void {
    if (this.sort) {
      this.sortBy = this.sort.active || 'createdAt';
      this.sortDir = this.sort.direction || 'desc';
      this.loadPayments(undefined, undefined, this.currentPage, this.pageSize);
    }
  }

  createNewPayment(): void {
    const dialogRef = this.dialog.open(PaymentFormComponent, {
      width: '600px',
      data: { isNew: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPayments();
        this.snackBar.open('Đã tạo thanh toán thành công', 'Đóng', {
          duration: 3000,
        });
      }
    });
  }

  editPayment(id: number): void {
    this.loading = true;
    this.paymentService.getPayment(id).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          const dialogRef = this.dialog.open(PaymentFormComponent, {
            width: '600px',
            data: {
              isNew: false,
              payment: response.data,
            },
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.loadPayments();
              this.snackBar.open('Đã cập nhật thanh toán thành công', 'Đóng', {
                duration: 3000,
              });
            }
          });
        } else {
          this.errorMessage =
            response.message || 'Không thể tải thông tin chi tiết thanh toán';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          'Lỗi khi tải thanh toán: ' +
          (err.error?.message || err.message || 'Lỗi không xác định');
      },
    });
  }

  viewPayment(id: number): void {
    this.router.navigate(['/admin/payments', id]);
  }

  confirmDelete(id: number): void {
    this.deleteItemId = id;
  }

  cancelDelete(): void {
    this.deleteItemId = null;
  }
  // Replace the existing deletePayment method with this implementation

  deletePayment(id: number): void {
    this.deleteInProgress = true;
    this.paymentService.deletePayment(id).subscribe({
      next: (response) => {
        this.deleteInProgress = false;
        this.deleteItemId = null;

        // Remove the item from the data source
        this.dataSource.data = this.dataSource.data.filter(
          (item) => item.id !== id
        );

        this.snackBar.open('Đã xóa thanh toán thành công', 'Đóng', {
          duration: 3000,
        });
      },
      error: (err) => {
        this.deleteInProgress = false;
        this.deleteItemId = null;
        this.errorMessage =
          'Lỗi khi xóa thanh toán: ' +
          (err.error?.message || err.message || 'Lỗi không xác định');
      },
    });
  }
  clearSearch(): void {
    // Clear the search input
    const input = document.querySelector(
      '.search-field input'
    ) as HTMLInputElement;
    if (input) {
      input.value = '';
      this.dataSource.filter = '';
    }

    // Reset date range
    this.dateRange.reset();

    // Reload data
    this.loadPayments();
  }

  dismissError(): void {
    this.errorMessage = '';
  }

  // Helper methods for statistics
  getCompletedPaymentsCount(): number {
    return this.dataSource.data.filter(
      (p) => p.status === PaymentStatus.COMPLETED
    ).length;
  }

  getPendingPaymentsCount(): number {
    return this.dataSource.data.filter(
      (p) => p.status === PaymentStatus.PENDING
    ).length;
  }

  // Helper methods for display
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  getPaymentTypeLabel(type: PaymentType): string {
    switch (type) {
      case PaymentType.SALE_COMMISSION:
        return 'Hoa Hồng Bán';
      case PaymentType.RENTAL_COMMISSION:
        return 'Hoa Hồng Thuê';
      case PaymentType.DEPOSIT:
        return 'Đặt Cọc';
      case PaymentType.MONTHLY_RENT:
        return 'Tiền Thuê Hàng Tháng';
      default:
        return type;
    }
  }

  getPaymentTypeColor(type: PaymentType): 'primary' | 'accent' | 'warn' {
    switch (type) {
      case PaymentType.SALE_COMMISSION:
        return 'primary';
      case PaymentType.RENTAL_COMMISSION:
        return 'primary';
      case PaymentType.DEPOSIT:
        return 'accent';
      case PaymentType.MONTHLY_RENT:
        return 'accent';
      default:
        return 'primary';
    }
  }

  getStatusClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'status-completed';
      case PaymentStatus.PENDING:
        return 'status-pending';
      case PaymentStatus.FAILED:
        return 'status-failed';
      case PaymentStatus.REFUNDED:
        return 'status-refunded';
      default:
        return '';
    }
  }
}
