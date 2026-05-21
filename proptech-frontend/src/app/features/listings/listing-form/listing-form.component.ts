import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';

import { ListingService } from '../../../core/services/listing.service';
import { AuthService } from '../../../core/authentication/auth.service';

@Component({
  selector: 'app-listing-form',
  templateUrl: './listing-form.component.html',
  styleUrls: ['./listing-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatMenuModule,
  ],
})
export class ListingFormComponent implements OnInit {
  listingForm!: FormGroup;
  isEditMode = false;
  listingId?: number;
  submitted = false;
  submitting = false;
  errorMessage = '';
  isAdmin = false; // Thuộc tính kiểm tra người dùng có phải admin không

  constructor(
    private formBuilder: FormBuilder,
    private listingService: ListingService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    this.initForm();

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.listingId = +params['id'];
        this.loadListing(this.listingId);
      } else {
        // Nếu đang tạo tin mới và người dùng không phải admin, đặt active thành false
        if (!this.isAdmin) {
          this.listingForm.get('active')?.setValue(false);
        }
      }
    });
  }

  initForm() {
    const defaultActive = this.isAdmin;

    this.listingForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
      address: ['', Validators.required],
      city: [''],
      state: [''],
      zipCode: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      bedrooms: [''],
      bathrooms: [''],
      area: [''],
      propertyType: ['', Validators.required],
      listingType: ['', Validators.required],
      imageUrls: this.formBuilder.array([this.formBuilder.control('')]),
      active: [defaultActive],
    });
  }

  loadListing(id: number) {
    this.submitting = true;
    this.listingService.getListing(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const listing = response.data;

          // Cập nhật form với dữ liệu tin
          this.listingForm.patchValue({
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
            active: listing.active,
          });

          // Cập nhật URL hình ảnh
          if (listing.images && listing.images.length > 0) {
            // Xóa URL hình ảnh trống mặc định
            this.imageUrlsFormArray.clear();

            // Thêm mỗi URL hình ảnh
            listing.images.forEach((url) => {
              this.imageUrlsFormArray.push(this.formBuilder.control(url));
            });
          }
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải tin', error);
        this.errorMessage = 'Không thể tải tin. Vui lòng thử lại.';
        this.submitting = false;
        this.showNotification('Lỗi khi tải tin', 'error');
      },
    });
  }

  get f() {
    return this.listingForm.controls;
  }

  get imageUrlsFormArray() {
    return this.listingForm.get('imageUrls') as FormArray;
  }

  get imageUrlsControls() {
    return this.imageUrlsFormArray.controls as FormControl[];
  }

  addImageUrl() {
    this.imageUrlsFormArray.push(this.formBuilder.control(''));
  }

  removeImageUrl(index: number) {
    if (this.imageUrlsFormArray.length > 1) {
      this.imageUrlsFormArray.removeAt(index);
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.listingForm.invalid) {
      // Cuộn đến trường không hợp lệ đầu tiên
      this.scrollToFirstInvalidControl();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    // Lọc bỏ URL hình ảnh trống
    const imageUrls = this.imageUrlsFormArray.value.filter(
      (url: string) => url.trim() !== ''
    );

    const listingData = {
      ...this.listingForm.value,
      images: imageUrls,
    };
    if (!this.isAdmin) {
      listingData.active = false;
    }

    if (this.isEditMode && this.listingId) {
      this.updateListing(this.listingId, listingData);
    } else {
      this.createListing(listingData);
    }
  }

  createListing(listingData: any) {
    this.listingService.createListing(listingData).subscribe({
      next: (response) => {
        this.submitting = false;

        if (response.success) {
          const createdListing = response.data;
          this.showNotification('Đã tạo tin thành công', 'success');
          this.router.navigate(['/listings', createdListing.id]);
        }
        if (this.isAdmin) {
          this.router.navigate(['/admin/listings']);
        } else {
          this.router.navigate(['/realtor/listings']);
        }
      },
      error: (error) => {
        this.submitting = false;
        this.errorMessage =
          error.error?.message || 'Không thể tạo tin. Vui lòng thử lại.';
        this.showNotification('Không thể tạo tin', 'error');
      },
    });
  }

  updateListing(id: number, listingData: any) {
    this.listingService.updateListing(id, listingData).subscribe({
      next: (response) => {
        this.submitting = false;

        if (response.success) {
          const updatedListing = response.data;
          this.showNotification('Đã cập nhật tin thành công', 'success');
          this.router.navigate(['/listings', updatedListing.id]);
        }
        if (this.isAdmin) {
          this.router.navigate(['/admin/listings']);
        } else {
          this.router.navigate(['/realtor/listings']);
        }
      },
      error: (error) => {
        this.submitting = false;
        this.errorMessage =
          error.error?.message || 'Không thể cập nhật tin. Vui lòng thử lại.';
        this.showNotification('Không thể cập nhật tin', 'error');
      },
    });
  }

  cancel() {
    this.location.back();
  }

  showNotification(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass:
        type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
    });
  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl = document.querySelector(
      'mat-form-field.ng-invalid'
    );
    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }
}
