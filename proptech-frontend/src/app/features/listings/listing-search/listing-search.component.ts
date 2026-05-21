import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

import { ListingService } from '../../../core/services/listing.service';
import {
  Listing,
  PropertyType,
  ListingType,
} from '../../../core/models/listing.model';
import { ListingCardComponent } from '../../../shared/components/listing-card/listing-card.component';

@Component({
  selector: 'app-listing-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    ListingCardComponent,
  ],
  templateUrl: './listing-search.component.html',
  styleUrls: ['./listing-search.component.scss'],
})
export class ListingSearchComponent implements OnInit {
  searchForm!: FormGroup;
  listings: Listing[] = [];
  loading = false;
  totalListings = 0;
  pageSize = 9;
  currentPage = 0;
  activeFilters: number = 0;

  propertyTypes = [
    { value: PropertyType.HOUSE, label: 'Nhà' },
    { value: PropertyType.APARTMENT, label: 'Căn hộ' },
    { value: PropertyType.CONDO, label: 'Chung cư' },
    { value: PropertyType.OFFICE, label: 'Văn phòng' },
    { value: PropertyType.LAND, label: 'Đất' },
    { value: PropertyType.OTHER, label: 'Khác' },
  ];

  listingTypes = [
    { value: ListingType.SALE, label: 'Mua bán' },
    { value: ListingType.RENT, label: 'Cho thuê' },
  ];

  constructor(
    private fb: FormBuilder,
    private listingService: ListingService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.searchListings();

    // Khi form thay đổi, cập nhật số lượng filter đang áp dụng
    this.searchForm.valueChanges.subscribe((values) => {
      this.countActiveFilters(values);
    });
  }

  initForm(): void {
    this.searchForm = this.fb.group({
      propertyType: [''],
      listingType: [''],
      city: [''],
      minPrice: [''],
      maxPrice: [''],
    });
  }

  countActiveFilters(values: any): void {
    this.activeFilters = Object.values(values).filter(
      (value) => value !== null && value !== '' && value !== undefined
    ).length;
  }

  searchListings(resetPage: boolean = true): void {
    if (resetPage) {
      this.currentPage = 0;
    }

    this.loading = true;
    const formValues = this.searchForm.value;

    this.listingService
      .searchListings(
        formValues.propertyType,
        formValues.listingType,
        formValues.city,
        formValues.minPrice,
        formValues.maxPrice,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (response) => {
          this.listings = response.data.content;
          this.totalListings = response.data.totalElements;
          this.loading = false;
        },
        error: (error) => {
          console.error('Lỗi khi tìm kiếm listings:', error);
          this.loading = false;
        },
      });
  }

  resetFilters(): void {
    this.searchForm.reset();
    this.activeFilters = 0;
    this.searchListings();
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.searchListings(false);
  }

  getMinMaxPriceText(): string {
    const formValues = this.searchForm.value;
    if (formValues.minPrice && formValues.maxPrice) {
      return `${formValues.minPrice.toLocaleString(
        'vi-VN'
      )} - ${formValues.maxPrice.toLocaleString('vi-VN')} VNĐ`;
    } else if (formValues.minPrice) {
      return `Từ ${formValues.minPrice.toLocaleString('vi-VN')} VNĐ`;
    } else if (formValues.maxPrice) {
      return `Đến ${formValues.maxPrice.toLocaleString('vi-VN')} VNĐ`;
    }
    return 'Tất cả mức giá';
  }

  getPropertyTypeLabel(type: PropertyType): string {
    const found = this.propertyTypes.find((pt) => pt.value === type);
    return found ? found.label : 'Loại bất động sản';
  }

  getListingTypeLabel(type: ListingType): string {
    const found = this.listingTypes.find((lt) => lt.value === type);
    return found ? found.label : 'Hình thức';
  }
}
