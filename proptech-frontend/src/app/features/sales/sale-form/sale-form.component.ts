// Component quản lý biểu mẫu bán bất động sản
// Cho phép tạo mới và chỉnh sửa giao dịch bán

import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  Observable,
  of,
  map,
  startWith,
  switchMap,
  catchError,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Sale, SaleStatus } from '../../../core/models/sale.model';
import { SaleRequest, SaleService } from '../../../core/services/sale.service';
import { ListingService } from '../../../core/services/listing.service';
import { UserService } from '../../../core/services/user.service';
import { Listing } from '../../../core/models/listing.model';
import { User } from '../../../core/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.scss'],
})
export class SaleFormComponent implements OnInit {
  saleForm!: FormGroup;
  isNew = true; // Cờ để xác định nếu đây là tạo mới hay chỉnh sửa
  loading = false;
  listingLoading = false; // Đang tìm kiếm bất động sản
  buyerLoading = false; // Đang tìm kiếm người mua
  saleId: number | null = null;
  sale: Sale | null = null;

  // Event emitters cho component sử dụng ngoài dialog
  @Output() saleCreated = new EventEmitter<Sale>();
  @Output() saleUpdated = new EventEmitter<Sale>();
  @Output() formCancelled = new EventEmitter<void>();

  // Services và dữ liệu dialog
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private dialogRef = inject(MatDialogRef<SaleFormComponent>, {
    optional: true,
  });
  private saleService = inject(SaleService);
  private listingService = inject(ListingService);
  private userService = inject(UserService);
  private data = inject(MAT_DIALOG_DATA, { optional: true });

  // Thuộc tính cho form
  filteredListings!: Observable<Listing[]>;
  filteredBuyers!: Observable<User[]>;

  // Trạng thái giao dịch bán cho dropdown
  saleStatuses = [
    { value: SaleStatus.PENDING, label: 'Đang Chờ' },
    { value: SaleStatus.PROCESSING, label: 'Đang Xử Lý' },
    { value: SaleStatus.COMPLETED, label: 'Đã Hoàn Thành' },
    { value: SaleStatus.CANCELLED, label: 'Đã Hủy' },
  ];

  ngOnInit(): void {
    // Kiểm tra nếu có dữ liệu dialog
    if (this.data && this.data.sale) {
      this.isNew = false;
      this.sale = this.data.sale;
      this.initForm();
      this.setupAutoComplete();
    } else {
      // Kiểm tra nếu có tham số route cho việc chỉnh sửa
      this.route.params.subscribe((params) => {
        if (params['id']) {
          this.saleId = +params['id'];
          this.isNew = false;
          this.loadSale(this.saleId);
        } else {
          // Đây là một giao dịch bán mới
          this.isNew = true;
          this.initForm();
          this.setupAutoComplete();
        }
      });
    }
  }

  private loadSale(id: number): void {
    this.loading = true;
    this.saleService.getSale(id).subscribe({
      next: (response) => {
        this.sale = response.data;
        this.initForm();
        this.setupAutoComplete();
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải giao dịch bán:', error);
        this.loading = false;
      },
    });
  }

  private initForm(): void {
    this.saleForm = this.fb.group({
      listing: [this.isNew ? null : this.sale?.listing, Validators.required],
      buyer: [this.isNew ? null : this.sale?.buyer, Validators.required],
      salePrice: [
        this.isNew ? null : this.sale?.salePrice,
        [Validators.required, Validators.min(0.01)],
      ],
      commission: [
        this.isNew ? null : this.sale?.commission,
        [Validators.required, Validators.min(0)],
      ],
      closingDate: [
        this.isNew
          ? null
          : this.sale?.closingDate
          ? new Date(this.sale.closingDate)
          : null,
      ],
      notes: [this.isNew ? null : this.sale?.notes],
      status: [
        this.isNew ? SaleStatus.PENDING : this.sale?.status,
        Validators.required,
      ],
    });
  }

  private setupAutoComplete(): void {
    // Tự động hoàn thành cho bất động sản
    this.filteredListings = this.saleForm.get('listing')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        const searchTerm =
          typeof value === 'string' ? value : value?.title || '';
        if (searchTerm.length < 2) {
          return of([]);
        }

        // Hiển thị loading riêng cho listing
        this.listingLoading = true;

        return this.searchListings(searchTerm).pipe(
          map((results) => {
            this.listingLoading = false;
            return results;
          }),
          catchError(() => {
            this.listingLoading = false;
            return of([]);
          })
        );
      })
    );

    // Tự động hoàn thành cho người mua
    this.filteredBuyers = this.saleForm.get('buyer')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        const searchTerm =
          typeof value === 'string' ? value : value?.fullName || '';
        if (searchTerm.length < 2) {
          return of([]);
        }

        // Hiển thị loading riêng cho người mua
        this.buyerLoading = true;

        return this.searchBuyers(searchTerm).pipe(
          map((results) => {
            this.buyerLoading = false;
            return results;
          }),
          catchError(() => {
            this.buyerLoading = false;
            return of([]);
          })
        );
      })
    );
  }

  private searchListings(query: string): Observable<Listing[]> {
    // Nếu truy vấn rỗng hoặc quá ngắn, trả về mảng rỗng
    if (!query || query.length < 2) {
      return of([]);
    }

    console.log('Đang tìm kiếm bất động sản với từ khóa:', query);

    // Chuyển đổi truy vấn thành propertyType nếu có thể, nếu không thì tìm kiếm theo văn bản
    let propertyType = null;

    // Kiểm tra nếu truy vấn khớp với một propertyType
    if (
      query.toUpperCase().includes('HOUSE') ||
      query.toUpperCase().includes('NHÀ')
    ) {
      propertyType = 'HOUSE';
    } else if (
      query.toUpperCase().includes('APARTMENT') ||
      query.toUpperCase().includes('CĂN HỘ')
    ) {
      propertyType = 'APARTMENT';
    } else if (
      query.toUpperCase().includes('LAND') ||
      query.toUpperCase().includes('ĐẤT')
    ) {
      propertyType = 'LAND';
    } else if (
      query.toUpperCase().includes('COMMERCIAL') ||
      query.toUpperCase().includes('THƯƠNG MẠI')
    ) {
      propertyType = 'COMMERCIAL';
    }

    // Sử dụng API tìm kiếm từ ListingService
    return this.listingService
      .searchListings(
        propertyType as any, // Ép kiểu thành PropertyType
        undefined, // listingType
        undefined, // city (bạn có thể trích xuất từ truy vấn nếu cần)
        undefined, // minPrice
        undefined // maxPrice
      )
      .pipe(
        map((response) => {
          console.log('Phản hồi API Bất động sản:', response);
          return response.data.content;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(
            'Lỗi khi tìm kiếm bất động sản:',
            error.status,
            error.message
          );
          if (error.error) {
            console.error('Chi tiết lỗi:', error.error);
          }
          return of([]);
        })
      );
  }

  private searchBuyers(query: string): Observable<User[]> {
    // Nếu truy vấn rỗng hoặc quá ngắn, trả về mảng rỗng
    if (!query || query.length < 2) {
      return of([]);
    }

    console.log('Đang tìm kiếm người mua với từ khóa:', query);

    // Sử dụng API tìm kiếm từ UserService
    return this.userService.searchUsers(query).pipe(
      map((response) => {
        console.log('Phản hồi API Người mua:', response);
        // Trả về tất cả users, không lọc theo vai trò nữa
        return response.success ? response.data : [];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(
          'Lỗi khi tìm kiếm người mua:',
          error.status,
          error.message
        );
        if (error.error) {
          console.error('Chi tiết lỗi:', error.error);
        }
        return of([]);
      })
    );
  }

  // Hàm hiển thị cho tự động hoàn thành
  displayListing(listing: Listing): string {
    if (!listing) return '';
    return `${listing.title} (${listing.address}, ${listing.city}, ${listing.state})`;
  }

  displayUser(user: User): string {
    return user ? user.fullName : '';
  }

  onCancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.formCancelled.emit();
    }
  }

  onSubmit(): void {
    if (this.saleForm.invalid) {
      return;
    }

    this.loading = true;
    const formValues = this.saleForm.value;

    // Tạo đối tượng yêu cầu giao dịch bán
    const saleRequest: SaleRequest = {
      listingId: formValues.listing.id,
      buyerId: formValues.buyer.id,
      salePrice: formValues.salePrice,
      commission: formValues.commission,
      notes: formValues.notes,
      closingDate: formValues.closingDate
        ? formValues.closingDate.toISOString()
        : undefined,
      status: this.isNew ? SaleStatus.PENDING : formValues.status, // Luôn sử dụng PENDING cho giao dịch bán mới
    };

    console.log('Dữ liệu yêu cầu giao dịch bán:', saleRequest);

    if (this.isNew) {
      // Tạo giao dịch bán mới
      this.saleService.createSale(saleRequest).subscribe({
        next: (response) => {
          this.loading = false;
          if (this.dialogRef) {
            this.dialogRef.close({ success: true, data: response.data });
          } else {
            console.log('Tạo giao dịch bán thành công:', response.data);
            this.saleCreated.emit(response.data);
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Lỗi khi tạo giao dịch bán:', error);
          // Tại đây bạn có thể thêm xử lý lỗi, chẳng hạn như hiển thị thông báo snackbar
        },
      });
    } else {
      // Cập nhật giao dịch bán hiện có với TẤT CẢ các trường
      const saleId = this.saleId || (this.sale?.id as number);
      this.saleService.updateSale(saleId, saleRequest).subscribe({
        next: (response) => {
          this.loading = false;
          if (this.dialogRef) {
            this.dialogRef.close({ success: true, data: response.data });
          } else {
            console.log('Cập nhật giao dịch bán thành công:', response.data);
            this.saleUpdated.emit(response.data);
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Lỗi khi cập nhật giao dịch bán:', error);
        },
      });
    }
  }
}
