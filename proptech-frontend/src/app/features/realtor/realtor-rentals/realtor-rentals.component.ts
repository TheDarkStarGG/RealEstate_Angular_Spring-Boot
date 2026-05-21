import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
} from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { finalize } from 'rxjs';
import { Rental, RentalStatus } from '../../../core/models/rental.model';
import { RentalService } from '../../../core/services/rental.service';

@Component({
  selector: 'app-realtor-rentals',
  templateUrl: './realtor-rentals.component.html',
  styleUrls: ['./realtor-rentals.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class RealtorRentalsComponent implements OnInit {
  dataSource = new MatTableDataSource<Rental>([]);
  displayedColumns: string[] = [
    'id',
    'property',
    'tenant',
    'monthlyRate',
    'startDate',
    'endDate',
    'status',
    'actions',
  ];

  // Cho lọc
  statusFilter: string = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;

  // Cho phân trang
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  // Cho trạng thái giao diện
  loading = false;
  errorMessage = '';
  deleteItemId: number | null = null;
  deleteInProgress = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private rentalService: RentalService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRentals();
  }

  loadRentals(): void {
    this.loading = true;
    this.rentalService
      .getMyRentals()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dataSource.data = response.data;
            this.totalElements = response.data.length;
          } else {
            this.errorMessage =
              response.message || 'Không thể tải hợp đồng thuê';
          }
        },
        error: (error) => {
          console.error('Lỗi khi tải hợp đồng thuê', error);
          this.errorMessage =
            error.error?.message || 'Đã xảy ra lỗi khi tải hợp đồng thuê';
        },
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;

    if (status) {
      this.dataSource.data = this.dataSource.data.filter(
        (rental) => rental.status === status
      );
    } else {
      this.loadRentals(); // Đặt lại tất cả hợp đồng thuê
    }
  }

  filterByDateRange(): void {
    if (this.fromDate && this.toDate) {
      this.dataSource.data = this.dataSource.data.filter((rental) => {
        const startDate = rental.startDate ? new Date(rental.startDate) : null;
        return (
          startDate && startDate >= this.fromDate! && startDate <= this.toDate!
        );
      });
    }
  }

  clearSearch(): void {
    // Xóa ô tìm kiếm
    const input = document.querySelector('input[matInput]') as HTMLInputElement;
    if (input) {
      input.value = '';
    }

    // Xóa bộ lọc
    this.statusFilter = '';
    this.fromDate = null;
    this.toDate = null;

    // Đặt lại bộ lọc datasource
    this.dataSource.filter = '';

    // Tải lại hợp đồng thuê
    this.loadRentals();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  createNewRental(): void {
    this.router.navigate(['/rentals/create']);
  }

  viewRental(id: number): void {
    this.router.navigate(['/realtor/rentals', id]);
  }

  editRental(id: number): void {
    this.router.navigate(['/rentals/edit', id]);
  }

  confirmDelete(id: number): void {
    this.deleteItemId = id;
  }

  cancelDelete(): void {
    this.deleteItemId = null;
  }

  deleteRental(id: number): void {
    // TODO: Triển khai xóa hợp đồng thuê khi điểm cuối API có sẵn
    this.deleteInProgress = true;

    // Mô phỏng xóa với một thời gian chờ
    setTimeout(() => {
      this.snackBar.open('Đã xóa hợp đồng thuê thành công', 'Đóng', {
        duration: 3000,
      });

      // Xóa hợp đồng thuê khỏi nguồn dữ liệu
      this.dataSource.data = this.dataSource.data.filter(
        (rental) => rental.id !== id
      );
      this.totalElements = this.dataSource.data.length;

      this.deleteInProgress = false;
      this.deleteItemId = null;
    }, 1000);
  }

  dismissError(): void {
    this.errorMessage = '';
  }

  // Phương thức hỗ trợ cho giao diện
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Đang Chờ Xử Lý';
      case 'ACTIVE':
        return 'Đang Hoạt Động';
      case 'EXPIRED':
        return 'Đã Hết Hạn';
      case 'TERMINATED':
        return 'Đã Chấm Dứt';
      default:
        return status;
    }
  }

  getActiveRentalsCount(): number {
    return this.dataSource.data.filter((rental) => rental.status === 'ACTIVE')
      .length;
  }

  getPendingRentalsCount(): number {
    return this.dataSource.data.filter((rental) => rental.status === 'PENDING')
      .length;
  }
}
