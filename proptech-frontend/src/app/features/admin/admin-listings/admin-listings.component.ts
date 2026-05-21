import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

import { ListingService } from '../../../core/services/listing.service';
import { Listing } from '../../../core/models/listing.model';
import { AuthService } from '../../../core/authentication/auth.service';

@Component({
  selector: 'app-admin-listings',
  templateUrl: './admin-listings.component.html',
  styleUrls: ['./admin-listings.component.scss'],
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
    MatSlideToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatMenuModule,
  ],
})
export class AdminListingsComponent implements OnInit {
  listings: Listing[] = [];
  dataSource: MatTableDataSource<Listing> = new MatTableDataSource<Listing>([]);

  displayedColumns: string[] = [
    'image',
    'title',
    'listingType',
    'propertyType',
    'price',
    'active',
    'actions',
  ];

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  loading = false;
  errorMessage = '';
  deleteInProgress = false;
  deleteItemId: number | null = null;

  // Filters
  propertyTypeFilter: string = '';
  listingTypeFilter: string = '';
  statusFilter: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private listingService: ListingService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadListings();
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
  loadListings(): void {
    this.loading = true;
    this.errorMessage = '';

    this.listingService
      .getAllListings(
        this.currentPage,
        this.pageSize,
        this.propertyTypeFilter,
        this.listingTypeFilter,
        this.statusFilter
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.listings = response.data.content.map((listing: Listing) => {
              return {
                ...listing,
                location: `${listing.address ?? ''} ${listing.city ?? ''} ${
                  listing.state ?? ''
                }`.trim(),
              };
            });
            this.dataSource = new MatTableDataSource(this.listings);

            // Configure dataSource
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;

            this.currentPage = response.data.page;
            this.totalPages = response.data.totalPages;
            this.totalElements = response.data.totalElements;
          } else {
            this.errorMessage =
              response.message || 'Không thể tải danh sách bất động sản';
          }
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Đã xảy ra lỗi khi tải danh sách bất động sản';
          this.loading = false;
        },
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByPropertyType(value: string): void {
    this.propertyTypeFilter = value;
    this.currentPage = 0;
    this.loadListings();
  }

  filterByListingType(value: string): void {
    this.listingTypeFilter = value;
    this.currentPage = 0;
    this.loadListings();
  }

  filterByStatus(value: string): void {
    this.statusFilter = value;
    this.currentPage = 0;
    this.loadListings();
  }

  clearSearch(): void {
    // Reset search input
    const input = document.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = '';
      this.dataSource.filter = '';
    }

    // Reset filters
    this.propertyTypeFilter = '';
    this.listingTypeFilter = '';
    this.statusFilter = '';

    // Reload listings
    this.currentPage = 0;
    this.loadListings();
  }

  createNewListing(): void {
    this.router.navigate(['listings/create']);
  }

  editListing(id: number): void {
    this.router.navigate(['listings/edit', id]);
  }

  viewListing(id: number): void {
    this.router.navigate(['/listings', id]);
  }

  confirmDelete(id: number): void {
    this.deleteItemId = id;
  }

  cancelDelete(): void {
    this.deleteItemId = null;
  }

  deleteListing(id: number): void {
    this.deleteInProgress = true;

    this.listingService.deleteListing(id).subscribe({
      next: (response) => {
        if (response.success) {
          // Show success notification
          this.snackBar.open('Xóa bất động sản thành công', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });

          // Remove listing from array
          this.listings = this.listings.filter((listing) => listing.id !== id);
          this.dataSource.data = this.listings;

          // If current page is empty and not the first page, go to previous page
          if (this.listings.length === 0 && this.currentPage > 0) {
            this.currentPage--;
            this.loadListings();
          } else if (this.totalElements > 0) {
            this.totalElements--;
          }
        } else {
          this.errorMessage = response.message || 'Không thể xóa bất động sản';
        }
        this.deleteItemId = null;
        this.deleteInProgress = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Đã xảy ra lỗi khi xóa bất động sản';
        this.deleteItemId = null;
        this.deleteInProgress = false;
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadListings();
  }

  getListingTypeLabel(type: string): string {
    switch (type) {
      case 'SALE':
        return 'Bán';
      case 'RENT':
        return 'Cho Thuê';
      default:
        return type;
    }
  }

  getPropertyTypeLabel(type: string): string {
    switch (type) {
      case 'HOUSE':
        return 'Nhà Riêng';
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
    }).format(price);
  }

  toggleListingStatus(listing: Listing): void {
    const updatedListing = {
      title: listing.title,
      description: listing.description,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      zipCode: listing.zipCode,
      price: listing.price,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      area: listing.area,
      propertyType: listing.propertyType,
      listingType: listing.listingType,
      images: listing.images,
      active: !listing.active,
    };
    this.listingService.updateListing(listing.id, updatedListing).subscribe({
      next: (response) => {
        if (response.success) {
          listing.active = updatedListing.active;

          // Show success notification
          const status = listing.active ? 'kích hoạt' : 'ngừng hoạt động';
          this.snackBar.open(
            `Bất động sản đã được ${status} thành công`,
            'Đóng',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['info-snackbar'],
            }
          );
        } else {
          this.errorMessage =
            response.message || 'Không thể cập nhật trạng thái bất động sản';
          // Revert toggle state
          listing.active = !updatedListing.active;
        }
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Đã xảy ra lỗi khi cập nhật trạng thái bất động sản';
        // Revert toggle state
        listing.active = !updatedListing.active;
      },
    });
  }

  dismissError(): void {
    this.errorMessage = '';
  }

  // Stats helper methods
  getActiveListingsCount(): number {
    return this.listings.filter((listing) => listing.active).length;
  }

  getInactiveListingsCount(): number {
    return this.listings.filter((listing) => !listing.active).length;
  }
}
