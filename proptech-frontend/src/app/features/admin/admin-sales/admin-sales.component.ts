import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
} from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { Sale, SaleStatus } from '../../../core/models/sale.model';
import { SaleService } from '../../../core/services/sale.service';

@Component({
  selector: 'app-admin-sales',
  templateUrl: './admin-sales.component.html',
  styleUrls: ['./admin-sales.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class AdminSalesComponent implements OnInit {
  sales: Sale[] = [];
  dataSource: MatTableDataSource<Sale> = new MatTableDataSource<Sale>([]);

  displayedColumns: string[] = [
    'id',
    'property',
    'buyer',
    'realtor',
    'salePrice',
    'commission',
    'closingDate',
    'status',
    'actions',
  ];

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  loading = false;
  errorMessage = '';
  searchQuery = '';
  selectedStatus: SaleStatus | '' = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  deleteItemId: number | null = null;
  deleteInProgress = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private saleService: SaleService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadSales(): void {
    this.loading = true;
    this.errorMessage = '';

    // Có thể cần điều chỉnh dựa trên cấu trúc API của bạn
    // Giả định bạn có phương thức để lấy tất cả giao dịch bán hàng với phân trang
    this.saleService.getAllSales(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success) {
          this.sales = response.data.content;
          this.dataSource = new MatTableDataSource(this.sales);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.currentPage = response.data.page;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
        } else {
          this.errorMessage =
            response.message || 'Không thể tải dữ liệu bán hàng';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Đã xảy ra lỗi khi tải dữ liệu bán hàng';
        this.loading = false;
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue.trim().toLowerCase();
    this.dataSource.filter = this.searchQuery;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByStatus(status: SaleStatus | ''): void {
    this.selectedStatus = status;

    if (status) {
      this.loading = true;
      this.saleService
        .getSalesByStatus(status as SaleStatus, this.currentPage, this.pageSize)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.sales = response.data.content;
              this.dataSource = new MatTableDataSource(this.sales);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              this.currentPage = response.data.page;
              this.totalPages = response.data.totalPages;
              this.totalElements = response.data.totalElements;
            } else {
              this.errorMessage =
                response.message || 'Không thể lọc dữ liệu buôn bán nhà đất';
            }
            this.loading = false;
          },
          error: (error) => {
            this.errorMessage =
              error.error?.message ||
              'Đã xảy ra lỗi khi lọc dữ liệu buôn bán nhà đất';
            this.loading = false;
          },
        });
    } else {
      this.loadSales();
    }
  }

  filterByDateRange(): void {
    if (this.fromDate || this.toDate) {
      this.dataSource.filterPredicate = (data: Sale, filter: string) => {
        // Kiểm tra nếu closingDate tồn tại trước khi tạo đối tượng Date
        if (!data.closingDate) {
          // Nếu không có ngày kết thúc và chúng ta đang lọc theo ngày, không bao gồm trong kết quả
          return false;
        }

        const closingDate = new Date(data.closingDate);
        const fromDateValid = !this.fromDate || closingDate >= this.fromDate;
        const toDateValid = !this.toDate || closingDate <= this.toDate;
        return fromDateValid && toDateValid;
      };
      this.dataSource.filter = 'dateFilter'; // Kích hoạt bộ lọc
    } else {
      this.dataSource.filter = this.searchQuery;
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.fromDate = null;
    this.toDate = null;
    this.dataSource.filter = '';

    const input = document.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = '';
    }

    this.loadSales();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    if (this.selectedStatus) {
      this.filterByStatus(this.selectedStatus);
    } else {
      this.loadSales();
    }
  }

  viewSale(saleId: number): void {
    this.router.navigate(['/admin/sales', saleId]);
  }

  editSale(saleId: number): void {
    this.router.navigate(['/sales/edit', saleId]);
  }

  createNewSale(): void {
    this.router.navigate(['/sales/create']);
  }

  confirmDelete(saleId: number): void {
    this.deleteItemId = saleId;
  }

  cancelDelete(): void {
    this.deleteItemId = null;
  }

  deleteSale(saleId: number): void {
    this.deleteInProgress = true;

    // Giả định bạn có phương thức deleteSale trong service
    this.saleService.deleteSale(saleId).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification(
            'Đã xóa giao dịch buôn bán nhà đất thành công',
            'success'
          );
          this.loadSales();
        } else {
          this.errorMessage =
            response.message || 'Không thể xóa giao dịch buôn bán nhà đất';
          this.showNotification('Lỗi khi xóa giao dịch bán hàng', 'error');
        }
        this.deleteInProgress = false;
        this.deleteItemId = null;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Đã xảy ra lỗi khi xóa giao dịch buôn bán nhà đất';
        this.showNotification(
          'Lỗi khi xóa giao dịch buôn bán nhà đất',
          'error'
        );
        this.deleteInProgress = false;
        this.deleteItemId = null;
      },
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  getCompletedSalesCount(): number {
    return this.sales.filter((sale) => sale.status === 'COMPLETED').length;
  }

  getPendingSalesCount(): number {
    return this.sales.filter(
      (sale) => sale.status === 'PENDING' || sale.status === 'PROCESSING'
    ).length;
  }

  dismissError(): void {
    this.errorMessage = '';
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass:
        type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
    });
  }
}
