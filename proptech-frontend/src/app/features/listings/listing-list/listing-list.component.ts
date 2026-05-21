import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import {
  Listing,
  ListingType,
  PropertyType,
} from '../../../core/models/listing.model';
import { ListingService } from '../../../core/services/listing.service';
import { ListingCardComponent } from '../../../shared/components/listing-card/listing-card.component';

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    ListingCardComponent,
  ],
  templateUrl: './listing-list.component.html',
  styleUrls: ['./listing-list.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state(
        'collapsed',
        style({
          height: '0',
          opacity: '0',
          overflow: 'hidden',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
          opacity: '1',
        })
      ),
      transition('collapsed <=> expanded', animate('300ms ease-in-out')),
    ]),
  ],
})
export class ListingListComponent implements OnInit {
  listings: Listing[] = [];
  loading = false;
  showFilters = false;

  currentPage = 0;
  pageSize = 6;
  totalItems = 0;
  totalPages = 0;

  sortBy = 'createdAt,desc';
  filterForm: FormGroup;

  constructor(
    private listingService: ListingService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.filterForm = this.formBuilder.group({
      propertyType: [''],
      listingType: [''],
      city: [''],
      minPrice: [''],
      maxPrice: [''],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      // Đặt lại form với các giá trị từ URL nếu chúng tồn tại
      if (params['propertyType']) {
        this.filterForm.get('propertyType')?.setValue(params['propertyType']);
      }
      if (params['listingType']) {
        this.filterForm.get('listingType')?.setValue(params['listingType']);
      }
      if (params['city']) {
        this.filterForm.get('city')?.setValue(params['city']);
      }
      if (params['minPrice']) {
        this.filterForm.get('minPrice')?.setValue(params['minPrice']);
      }
      if (params['maxPrice']) {
        this.filterForm.get('maxPrice')?.setValue(params['maxPrice']);
      }
      if (params['page']) {
        this.currentPage = parseInt(params['page']);
      }
      if (params['sort']) {
        this.sortBy = params['sort'];
      }

      this.loadListings();
    });
  }

  loadListings() {
    this.loading = true;
    const filters = this.filterForm.value;

    const propertyType = filters.propertyType
      ? (filters.propertyType as PropertyType)
      : undefined;
    const listingType = filters.listingType
      ? (filters.listingType as ListingType)
      : undefined;
    const city = filters.city || undefined;
    const minPrice = filters.minPrice || undefined;
    const maxPrice = filters.maxPrice || undefined;

    this.listingService
      .searchListings(
        propertyType,
        listingType,
        city,
        minPrice,
        maxPrice,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.listings = response.data.content;
            this.totalItems = response.data.totalElements;
            this.totalPages = response.data.totalPages;
            this.currentPage = response.data.page;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách', error);
          this.loading = false;
        },
      });
  }

  onPageEvent(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateUrlParams();
    this.loadListings();
  }

  sortListings() {
    this.currentPage = 0;
    this.updateUrlParams();
    this.loadListings();
  }

  filterListings() {
    this.currentPage = 0;
    this.updateUrlParams();
    this.loadListings();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  hasActiveFilters(): boolean {
    const formValues = this.filterForm.value;
    return Object.values(formValues).some(
      (value) => value !== null && value !== undefined && value !== ''
    );
  }

  clearFilter(controlName: string): void {
    this.filterForm.get(controlName)?.setValue('');
    this.filterListings();
  }

  clearPriceFilters(): void {
    this.filterForm.get('minPrice')?.setValue('');
    this.filterForm.get('maxPrice')?.setValue('');
    this.filterListings();
  }

  clearAllFilters(): void {
    this.filterForm.reset({
      propertyType: '',
      listingType: '',
      city: '',
      minPrice: '',
      maxPrice: '',
    });
    this.filterListings();
  }

  getListingTypeLabel(value: string): string {
    const types: { [key: string]: string } = {
      SALE: 'Để Bán',
      RENT: 'Cho Thuê',
    };
    return types[value] || value;
  }

  getPropertyTypeLabel(value: string): string {
    const types: { [key: string]: string } = {
      HOUSE: 'Nhà',
      APARTMENT: 'Căn Hộ',
      CONDO: 'Chung Cư',
      OFFICE: 'Văn Phòng',
      LAND: 'Đất',
      OTHER: 'Khác',
    };
    return types[value] || value;
  }

  getPriceRangeLabel(): string {
    const min = this.filterForm.get('minPrice')?.value;
    const max = this.filterForm.get('maxPrice')?.value;

    if (min && max) {
      return `$${min} - $${max}`;
    } else if (min) {
      return `$${min}+`;
    } else if (max) {
      return `Tối đa $${max}`;
    }
    return '';
  }

  private updateUrlParams() {
    const filters = this.filterForm.value;
    const queryParams: any = {
      page: this.currentPage,
      sort: this.sortBy,
    };

    if (filters.propertyType) queryParams.propertyType = filters.propertyType;
    if (filters.listingType) queryParams.listingType = filters.listingType;
    if (filters.city) queryParams.city = filters.city;
    if (filters.minPrice) queryParams.minPrice = filters.minPrice;
    if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
