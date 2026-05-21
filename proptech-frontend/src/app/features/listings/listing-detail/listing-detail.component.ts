import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import {
  Listing,
  ListingType,
  PropertyType,
} from '../../../core/models/listing.model';
import { ListingService } from '../../../core/services/listing.service';
import { AuthService } from '../../../core/authentication/auth.service';
import { ListingCardComponent } from '../../../shared/components/listing-card/listing-card.component';
import { Appointment } from '../../../core/models/appointment.model';
import { ScheduleAppointmentDialogComponent } from '../../appointments/schedule-appointment-dialog/schedule-appointment-dialog.component';

@Component({
  selector: 'app-listing-detail',
  templateUrl: './listing-detail.component.html',
  styleUrls: ['./listing-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    ListingCardComponent,
  ],
})
export class ListingDetailComponent implements OnInit {
  listing: Listing | null = null;
  relatedListings: Listing[] = [];
  loading = false;
  isFavorite = false;

  // Cho thư viện hình ảnh
  currentImageIndex = 0;
  get currentImage(): string {
    if (this.listing?.images && this.listing.images.length > 0) {
      return this.listing.images[this.currentImageIndex];
    }
    return 'assets/images/property-placeholder.jpg';
  }

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = +params['id'];
      if (id) {
        this.loadListing(id);
      }
    });
  }

  loadListing(id: number) {
    this.loading = true;

    this.listingService.getListing(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.listing = response.data;
          this.loadRelatedListings(
            this.listing.propertyType,
            this.listing.listingType
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải thông tin bất động sản', error);
        this.loading = false;
        this.snackBar.open(
          'Lỗi khi tải thông tin chi tiết bất động sản',
          'Đóng',
          {
            duration: 5000,
            panelClass: 'error-snackbar',
          }
        );
      },
    });
  }

  loadRelatedListings(propertyType: PropertyType, listingType: ListingType) {
    this.listingService
      .searchListings(
        propertyType,
        listingType,
        undefined,
        undefined,
        undefined,
        0,
        3
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Lọc ra bất động sản hiện tại
            this.relatedListings = response.data.content
              .filter((l) => l.id !== this.listing?.id)
              .slice(0, 3);
          }
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách bất động sản liên quan', error);
        },
      });
  }

  // Điều hướng thư viện hình ảnh
  prevImage() {
    if (!this.listing?.images || this.listing.images.length === 0) return;

    this.currentImageIndex =
      this.currentImageIndex === 0
        ? this.listing.images.length - 1
        : this.currentImageIndex - 1;
  }

  nextImage() {
    if (!this.listing?.images || this.listing.images.length === 0) return;

    this.currentImageIndex =
      (this.currentImageIndex + 1) % this.listing.images.length;
  }

  setCurrentImage(index: number) {
    this.currentImageIndex = index;
  }

  openContactDialog() {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open(
        'Vui lòng đăng nhập để liên hệ với môi giới',
        'Đăng nhập',
        {
          duration: 5000,
        }
      );
      return;
    }

    // Triển khai tạm thời không có hộp thoại
    this.snackBar.open('Tính năng liên hệ sẽ sớm ra mắt!', 'Đóng', {
      duration: 3000,
    });
  }

  isMultipleImages(): boolean {
    return (
      Array.isArray(this.listing?.images) && this.listing!.images.length > 1
    );
  }

  openScheduleDialog() {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open(
        'Vui lòng đăng nhập để đặt lịch xem nhà',
        'Đăng nhập',
        {
          duration: 5000,
        }
      );
      return;
    }

    if (!this.listing) {
      this.snackBar.open('Không thể đặt lịch cho bất động sản này', 'Đóng', {
        duration: 3000,
      });
      return;
    }

    // Mở hộp thoại đặt lịch hẹn với bất động sản hiện tại
    const dialogRef = this.dialog.open(ScheduleAppointmentDialogComponent, {
      width: '700px',
      data: { listing: this.listing },
    });

    dialogRef.afterClosed().subscribe((result: Appointment | undefined) => {
      if (result) {
        // Lịch hẹn đã được tạo thành công
        this.snackBar.open('Đặt lịch hẹn thành công!', 'Đóng', {
          duration: 5000,
        });
      }
    });
  }

  toggleFavorite() {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open(
        'Vui lòng đăng nhập để lưu bất động sản',
        'Đăng nhập',
        {
          duration: 5000,
        }
      );
      return;
    }

    this.isFavorite = !this.isFavorite;

    const message = this.isFavorite
      ? 'Đã lưu bất động sản vào danh sách yêu thích!'
      : 'Đã xóa bất động sản khỏi danh sách yêu thích';

    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
    });

    // Ở đây bạn sẽ triển khai lưu vào danh sách yêu thích trong backend
  }

  shareListing() {
    if (navigator.share && this.listing) {
      navigator
        .share({
          title: this.listing.title,
          text: `Xem bất động sản này: ${this.listing.title}`,
          url: window.location.href,
        })
        .catch((error) => {
          console.error('Lỗi khi chia sẻ', error);
          this.copyToClipboard(window.location.href);
        });
    } else {
      this.copyToClipboard(window.location.href);
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.snackBar.open('Đã sao chép liên kết vào clipboard!', 'Đóng', {
          duration: 3000,
        });
      })
      .catch((err) => {
        console.error('Không thể sao chép văn bản: ', err);
        this.snackBar.open('Không thể sao chép liên kết', 'Đóng', {
          duration: 3000,
        });
      });
  }

  formatPropertyType(type: PropertyType | undefined): string {
    if (!type) return 'Bất động sản';

    const types: { [key in PropertyType]: string } = {
      HOUSE: 'Nhà',
      APARTMENT: 'Căn hộ',
      CONDO: 'Chung cư',
      OFFICE: 'Văn phòng',
      LAND: 'Đất',
      OTHER: 'Khác',
    };

    return types[type] || type.toString();
  }
}
