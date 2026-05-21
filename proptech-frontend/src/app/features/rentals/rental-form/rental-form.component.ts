// Component quản lý biểu mẫu cho thuê bất động sản
// Cho phép tạo mới và chỉnh sửa hợp đồng thuê

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
import { Rental, RentalStatus } from '../../../core/models/rental.model';
import {
  RentalRequest,
  RentalService,
} from '../../../core/services/rental.service';
import { ListingService } from '../../../core/services/listing.service';
import { UserService } from '../../../core/services/user.service';
import { Listing } from '../../../core/models/listing.model';
import { User } from '../../../core/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-rental-form',
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
  templateUrl: './rental-form.component.html',
  styleUrls: ['./rental-form.component.scss'],
})
export class RentalFormComponent implements OnInit {
  rentalForm!: FormGroup;
  isNew = true; // Cờ để xác định nếu đây là tạo mới hay chỉnh sửa
  loading = false;
  listingLoading = false; // Đang tìm kiếm bất động sản
  tenantLoading = false; // Đang tìm kiếm người thuê
  rentalId: number | null = null;
  rental: Rental | null = null;

  // Event emitters cho component sử dụng ngoài dialog
  @Output() rentalCreated = new EventEmitter<Rental>();
  @Output() rentalUpdated = new EventEmitter<Rental>();
  @Output() formCancelled = new EventEmitter<void>();

  // Các service và dữ liệu dialog
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private dialogRef = inject(MatDialogRef<RentalFormComponent>, {
    optional: true,
  });
  private rentalService = inject(RentalService);
  private listingService = inject(ListingService);
  private userService = inject(UserService);
  private data = inject(MAT_DIALOG_DATA, { optional: true });

  // Thuộc tính cho form
  filteredListings!: Observable<Listing[]>;
  filteredTenants!: Observable<User[]>;

  // Trạng thái cho thuê cho dropdown
  rentalStatuses = [
    { value: RentalStatus.PENDING, label: 'Đang Chờ' },
    { value: RentalStatus.ACTIVE, label: 'Đang Hoạt Động' },
    { value: RentalStatus.COMPLETED, label: 'Đã Hoàn Thành' },
    { value: RentalStatus.CANCELLED, label: 'Đã Hủy' },
  ];

  ngOnInit(): void {
    // Kiểm tra nếu có dữ liệu dialog
    if (this.data && this.data.rental) {
      this.isNew = false;
      this.rental = this.data.rental;
      this.initForm();
      this.setupAutoComplete();
    } else {
      // Kiểm tra nếu có tham số route cho việc chỉnh sửa
      this.route.params.subscribe((params) => {
        if (params['id']) {
          this.rentalId = +params['id'];
          this.isNew = false;
          this.loadRental(this.rentalId);
        } else {
          // Đây là một hợp đồng thuê mới
          this.isNew = true;
          this.initForm();
          this.setupAutoComplete();
        }
      });
    }
  }

  private loadRental(id: number): void {
    this.loading = true;
    this.rentalService.getRental(id).subscribe({
      next: (response) => {
        this.rental = response.data;
        this.initForm();
        this.setupAutoComplete();
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải hợp đồng thuê:', error);
        this.loading = false;
      },
    });
  }

  private initForm(): void {
    this.rentalForm = this.fb.group({
      listing: [this.isNew ? null : this.rental?.listing, Validators.required],
      tenant: [this.isNew ? null : this.rental?.tenant, Validators.required],
      monthlyRate: [
        this.isNew ? null : this.rental?.monthlyRate,
        [Validators.required, Validators.min(0.01)],
      ],
      securityDeposit: [
        this.isNew ? null : this.rental?.securityDeposit,
        [Validators.required, Validators.min(0)],
      ],
      commission: [
        this.isNew ? null : this.rental?.commission,
        [Validators.required, Validators.min(0)],
      ],
      startDate: [
        this.isNew
          ? null
          : this.rental?.startDate
          ? new Date(this.rental.startDate)
          : null,
        Validators.required,
      ],
      endDate: [
        this.isNew
          ? null
          : this.rental?.endDate
          ? new Date(this.rental.endDate)
          : null,
        Validators.required,
      ],
      notes: [this.isNew ? null : this.rental?.notes],
      status: [
        this.isNew ? RentalStatus.PENDING : this.rental?.status,
        Validators.required,
      ],
    });
  }

  private setupAutoComplete(): void {
    // Tự động hoàn thành cho bất động sản
    this.filteredListings = this.rentalForm.get('listing')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        const searchTerm =
          typeof value === 'string' ? value : value?.title || '';
        if (searchTerm.length < 2) {
          return of([]);
        }

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

    // Tự động hoàn thành cho người thuê
    this.filteredTenants = this.rentalForm.get('tenant')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        const searchTerm =
          typeof value === 'string' ? value : value?.fullName || '';
        if (searchTerm.length < 2) {
          return of([]);
        }

        this.tenantLoading = true;

        return this.searchTenants(searchTerm).pipe(
          map((results) => {
            this.tenantLoading = false;
            return results;
          }),
          catchError(() => {
            this.tenantLoading = false;
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

  private searchTenants(query: string): Observable<User[]> {
    // Nếu truy vấn rỗng hoặc quá ngắn, trả về mảng rỗng
    if (!query || query.length < 2) {
      return of([]);
    }

    console.log('Đang tìm kiếm người thuê với từ khóa:', query);

    // Sử dụng API tìm kiếm từ UserService
    return this.userService.searchUsers(query).pipe(
      map((response) => {
        console.log('Phản hồi API Người thuê:', response);
        return response.success ? response.data : [];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(
          'Lỗi khi tìm kiếm người thuê:',
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
    if (this.rentalForm.invalid) {
      return;
    }

    this.loading = true;
    const formValues = this.rentalForm.value;

    // Tạo đối tượng yêu cầu cho thuê
    const rentalRequest: RentalRequest = {
      listingId: formValues.listing.id,
      tenantId: formValues.tenant.id,
      monthlyRate: formValues.monthlyRate,
      securityDeposit: formValues.securityDeposit,
      commission: formValues.commission,
      startDate: formValues.startDate.toISOString().split('T')[0], // Định dạng thành YYYY-MM-DD
      endDate: formValues.endDate.toISOString().split('T')[0], // Định dạng thành YYYY-MM-DD
      notes: formValues.notes,
      status: this.isNew ? RentalStatus.PENDING : formValues.status,
    };

    console.log('Dữ liệu yêu cầu cho thuê:', rentalRequest);

    if (this.isNew) {
      // Tạo hợp đồng cho thuê mới
      this.rentalService.createRental(rentalRequest).subscribe({
        next: (response) => {
          this.loading = false;
          if (this.dialogRef) {
            this.dialogRef.close({ success: true, data: response.data });
          } else {
            console.log('Tạo hợp đồng cho thuê thành công:', response.data);
            this.rentalCreated.emit(response.data);
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Lỗi khi tạo hợp đồng cho thuê:', error);
          // Tại đây bạn có thể thêm xử lý lỗi, chẳng hạn như hiển thị thông báo snackbar
        },
      });
    } else {
      // Cập nhật hợp đồng cho thuê hiện có
      const rentalId = this.rentalId || (this.rental?.id as number);
      this.rentalService.updateRental(rentalId, rentalRequest).subscribe({
        next: (response) => {
          this.loading = false;
          if (this.dialogRef) {
            this.dialogRef.close({ success: true, data: response.data });
          } else {
            console.log(
              'Cập nhật hợp đồng cho thuê thành công:',
              response.data
            );
            this.rentalUpdated.emit(response.data);
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Lỗi khi cập nhật hợp đồng cho thuê:', error);
        },
      });
    }
  }
}
