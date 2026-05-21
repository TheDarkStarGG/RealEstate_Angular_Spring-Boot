import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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

import { finalize } from 'rxjs';
import {
  Listing,
  ListingType,
  PropertyType,
} from '../../../core/models/listing.model';
import { ListingService } from '../../../core/services/listing.service';

@Component({
  selector: 'app-realtor-listings',
  templateUrl: './realtor-listings.component.html',
  styleUrls: ['./realtor-listings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
  ],
})
export class RealtorListingsComponent implements OnInit {
  dataSource = new MatTableDataSource<Listing>([]);
  displayedColumns: string[] = [
    'image',
    'title',
    'listingType',
    'propertyType',
    'price',
    'active',
    'actions',
  ];

  // Cho lọc
  propertyTypeFilter: string = '';
  listingTypeFilter: string = '';
  activeFilter: string = '';

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
    private listingService: ListingService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.loading = true;
    this.listingService
      .getMyListings(this.currentPage, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dataSource.data = response.data.content;
            this.totalElements = response.data.totalElements;
            this.currentPage = response.data.page;
          } else {
            this.errorMessage = response.message || 'Không thể tải danh sách';
          }
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách', error);
          this.errorMessage =
            error.error?.message || 'Đã xảy ra lỗi khi tải danh sách';
        },
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByPropertyType(propertyType: string): void {
    this.propertyTypeFilter = propertyType;
    this.applyFilters();
  }

  filterByListingType(listingType: string): void {
    this.listingTypeFilter = listingType;
    this.applyFilters();
  }

  filterByStatus(active: string): void {
    this.activeFilter = active;
    this.applyFilters();
  }

  applyFilters(): void {
    // Đặt lại phân trang
    this.currentPage = 0;

    // Áp dụng bộ lọc
    this.loadFilteredListings();
  }

  loadFilteredListings(): void {
    this.loading = true;

    // Sử dụng phương thức searchMyListings mới thay vì searchListings
    this.listingService
      .searchMyListings(
        (this.propertyTypeFilter as PropertyType) || undefined,
        (this.listingTypeFilter as ListingType) || undefined,
        undefined, // thành phố
        undefined, // giá tối thiểu
        undefined, // giá tối đa
        this.currentPage,
        this.pageSize
      )
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Lọc bổ sung theo trạng thái hoạt động (vì API có thể không hỗ trợ)
            let filteredData = response.data.content;

            if (this.activeFilter !== '') {
              const isActive = this.activeFilter === 'true';
              filteredData = filteredData.filter(
                (listing) => listing.active === isActive
              );
            }

            this.dataSource.data = filteredData;
            this.totalElements = response.data.totalElements;
          } else {
            this.errorMessage = response.message || 'Không thể lọc danh sách';
          }
        },
        error: (error) => {
          console.error('Lỗi khi lọc danh sách', error);
          this.errorMessage =
            error.error?.message || 'Đã xảy ra lỗi khi lọc danh sách';
        },
      });
  }
  clearSearch(): void {
    // Xóa ô tìm kiếm
    const input = document.querySelector('input[matInput]') as HTMLInputElement;
    if (input) {
      input.value = '';
    }

    // Xóa bộ lọc
    this.propertyTypeFilter = '';
    this.listingTypeFilter = '';
    this.activeFilter = '';

    // Đặt lại bộ lọc datasource
    this.dataSource.filter = '';

    // Tải lại danh sách
    this.loadListings();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    if (
      this.propertyTypeFilter ||
      this.listingTypeFilter ||
      this.activeFilter
    ) {
      this.loadFilteredListings();
    } else {
      this.loadListings();
    }
  }

  createNewListing(): void {
    this.router.navigate(['/listings/create']);
  }

  viewListing(id: number): void {
    this.router.navigate(['/listings', id]);
  }

  editListing(id: number): void {
    this.router.navigate(['/listings/edit', id]);
  }

  confirmDelete(id: number): void {
    this.deleteItemId = id;
  }

  cancelDelete(): void {
    this.deleteItemId = null;
  }

  deleteListing(id: number): void {
    this.deleteInProgress = true;

    this.listingService
      .deleteListing(id)
      .pipe(
        finalize(() => {
          this.deleteInProgress = false;
          this.deleteItemId = null;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Đã xóa danh sách thành công', 'Đóng', {
              duration: 3000,
            });

            // Làm mới dữ liệu danh sách
            this.loadListings();
          } else {
            this.errorMessage = response.message || 'Không thể xóa danh sách';
          }
        },
        error: (error) => {
          console.error('Lỗi khi xóa danh sách', error);
          this.errorMessage =
            error.error?.message || 'Đã xảy ra lỗi khi xóa danh sách';
        },
      });
  }

  dismissError(): void {
    this.errorMessage = '';
  }

  // Phương thức hỗ trợ cho giao diện
  getListingTypeLabel(type: string): string {
    switch (type) {
      case 'SALE':
        return 'Để Bán';
      case 'RENT':
        return 'Cho Thuê';
      default:
        return type;
    }
  }

  getPropertyTypeLabel(type: string): string {
    switch (type) {
      case 'HOUSE':
        return 'Nhà';
      case 'APARTMENT':
        return 'Căn Hộ';
      case 'CONDO':
        return 'Chung Cư';
      case 'OFFICE':
        return 'Văn Phòng';
      case 'LAND':
        return 'Đất';
      case 'OTHER':
        return 'Khác';
      default:
        return type;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  getActiveListingsCount(): number {
    return this.dataSource.data.filter((listing) => listing.active).length;
  }

  getInactiveListingsCount(): number {
    return this.dataSource.data.filter((listing) => !listing.active).length;
  }
}
