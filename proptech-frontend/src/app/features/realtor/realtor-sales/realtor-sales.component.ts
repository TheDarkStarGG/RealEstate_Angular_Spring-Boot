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
import { Sale, SaleStatus } from '../../../core/models/sale.model';
import { SaleService } from '../../../core/services/sale.service';

@Component({
  selector: 'app-realtor-sales',
  templateUrl: './realtor-sales.component.html',
  styleUrls: ['./realtor-sales.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Thêm vào để hỗ trợ ngModel
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
export class RealtorSalesComponent implements OnInit {
  dataSource = new MatTableDataSource<Sale>([]);
  displayedColumns: string[] = [
    'id',
    'property',
    'buyer',
    'salePrice',
    'commission',
    'closingDate',
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
    private saleService: SaleService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.loading = true;
    this.saleService
      .getMySales()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dataSource.data = response.data;
            this.totalElements = response.data.length;
          } else {
            this.errorMessage = response.message || 'Không thể tải doanh số';
          }
        },
        error: (error) => {
          console.error('Lỗi khi tải doanh số', error);
          this.errorMessage =
            error.error?.message || 'Đã xảy ra lỗi khi tải doanh số';
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
        (sale) => sale.status === status
      );
    } else {
      this.loadSales(); // Đặt lại tất cả doanh số
    }
  }

  filterByDateRange(): void {
    if (this.fromDate && this.toDate) {
      this.dataSource.data = this.dataSource.data.filter((sale) => {
        const closingDate = sale.closingDate
          ? new Date(sale.closingDate)
          : null;
        return (
          closingDate &&
          closingDate >= this.fromDate! &&
          closingDate <= this.toDate!
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

    // Tải lại doanh số
    this.loadSales();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  createNewSale(): void {
    this.router.navigate(['/sales/create']);
  }

  viewSale(id: number): void {
    this.router.navigate(['/realtor/sales', id]);
  }

  editSale(id: number): void {
    this.router.navigate(['/sales/edit', id]);
  }

  confirmDelete(id: number): void {
    this.deleteItemId = id;
  }

  cancelDelete(): void {
    this.deleteItemId = null;
  }

  deleteSale(id: number): void {
    this.deleteInProgress = true;

    this.saleService
      .deleteSale(id)
      .pipe(
        finalize(() => {
          this.deleteInProgress = false;
          this.deleteItemId = null;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Đã xóa doanh số thành công', 'Đóng', {
              duration: 3000,
            });

            // Làm mới dữ liệu doanh số
            this.loadSales();
          } else {
            this.errorMessage = response.message || 'Không thể xóa doanh số';
          }
        },
        error: (error) => {
          console.error('Lỗi khi xóa doanh số', error);
          this.errorMessage =
            error.error?.message || 'Đã xảy ra lỗi khi xóa doanh số';
        },
      });
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
      case 'PROCESSING':
        return 'Đang Xử Lý';
      case 'COMPLETED':
        return 'Đã Hoàn Thành';
      case 'CANCELLED':
        return 'Đã Hủy';
      default:
        return status;
    }
  }

  getCompletedSalesCount(): number {
    return this.dataSource.data.filter((sale) => sale.status === 'COMPLETED')
      .length;
  }

  getPendingSalesCount(): number {
    return this.dataSource.data.filter((sale) => sale.status === 'PENDING')
      .length;
  }
}
