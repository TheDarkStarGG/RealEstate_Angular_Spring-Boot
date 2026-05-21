import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { Appointment } from '../../../core/models/appointment.model';
import { Listing } from '../../../core/models/listing.model';
import {
  AppointmentRequest,
  AppointmentService,
} from '../../../core/services/appointment.service';
import { ListingService } from '../../../core/services/listing.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
})
export class AppointmentFormComponent implements OnInit {
  @Input() appointment: Appointment | null = null;
  @Input() listingId: number | null = null;
  @Output() formSubmitted = new EventEmitter<Appointment>();
  @Output() formCancelled = new EventEmitter<void>();

  appointmentForm: FormGroup;
  isLoading = false;
  listings: Listing[] = [];
  currentUser: any;
  minDate = new Date();
  isEditMode = false;
  selectedListing: Listing | null = null;
  timeOptions: string[] = [];
  durationOptions: number[] = [15, 30, 45, 60, 90, 120];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private listingService: ListingService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    // Khởi tạo form với giá trị trống
    this.appointmentForm = this.createForm();

    // Tạo các tùy chọn thời gian (khoảng 30 phút)
    for (let hour = 8; hour < 18; hour++) {
      for (let minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        this.timeOptions.push(`${formattedHour}:${formattedMinute}`);
      }
    }
  }

  ngOnInit(): void {
    this.loadInitialData();

    if (this.appointment) {
      this.isEditMode = true;
      this.populateForm(this.appointment);
    } else if (this.listingId) {
      // Nếu một ID bất động sản cụ thể được cung cấp, khóa phần chọn bất động sản
      this.appointmentForm.get('listingId')?.setValue(this.listingId);
      this.appointmentForm.get('listingId')?.disable();
      // Tải thông tin chi tiết của bất động sản
      this.onListingChange();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      listingId: [null, Validators.required],
      appointmentDate: [null, Validators.required],
      appointmentTime: [null, Validators.required],
      durationMinutes: [30, Validators.required],
      notes: [''],
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;

    // Lấy thông tin người dùng hiện tại
    const userProfile$ = this.userService.getMyProfile();

    // Lấy tất cả các bất động sản
    const listings$ = this.listingService.getListings(0, 100);

    forkJoin([userProfile$, listings$])
      .pipe(
        finalize(() => {
          this.isLoading = false;

          // Nếu listingId được cung cấp, đặt nó vào form
          if (this.listingId) {
            this.appointmentForm.get('listingId')?.setValue(this.listingId);
            this.onListingChange();
          }
        })
      )
      .subscribe({
        next: ([userResp, listingsResp]) => {
          this.currentUser = userResp.data;
          this.listings = listingsResp.data.content;
        },
        error: (error) => {
          this.snackBar.open(
            'Không thể tải dữ liệu cần thiết. Vui lòng thử lại.',
            'Đóng',
            {
              duration: 3000,
            }
          );
          console.error('Lỗi khi tải dữ liệu ban đầu:', error);
        },
      });
  }

  populateForm(appointment: Appointment): void {
    // Trích xuất ngày và giờ từ thời gian cuộc hẹn
    const appointmentDateTime = new Date(appointment.appointmentDateTime);
    const date = appointmentDateTime;

    // Định dạng thời gian theo HH:MM
    const hours = appointmentDateTime.getHours().toString().padStart(2, '0');
    const minutes = appointmentDateTime
      .getMinutes()
      .toString()
      .padStart(2, '0');
    const time = `${hours}:${minutes}`;

    this.appointmentForm.patchValue({
      listingId: appointment.listing.id,
      appointmentDate: date,
      appointmentTime: time,
      durationMinutes: appointment.durationMinutes,
      notes: appointment.notes || '',
    });

    // Tải thông tin chi tiết của bất động sản đã chọn
    this.onListingChange();
  }

  onListingChange(): void {
    const listingId = this.appointmentForm.get('listingId')?.value;
    if (listingId) {
      this.isLoading = true;
      this.listingService
        .getListing(listingId)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            this.selectedListing = response.data;
          },
          error: (error) => {
            console.error(
              'Lỗi khi tải thông tin chi tiết của bất động sản:',
              error
            );
            this.snackBar.open(
              'Không thể tải thông tin chi tiết của bất động sản. Vui lòng thử lại.',
              'Đóng',
              {
                duration: 3000,
              }
            );
          },
        });
    } else {
      this.selectedListing = null;
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      // Đánh dấu tất cả các trường đã chạm vào để kích hoạt thông báo xác thực
      this.markFormGroupTouched(this.appointmentForm);
      return;
    }

    if (!this.currentUser) {
      this.snackBar.open(
        'Thông tin người dùng không khả dụng. Vui lòng thử lại hoặc đăng nhập.',
        'Đóng',
        {
          duration: 3000,
        }
      );
      return;
    }

    // Sử dụng getRawValue để lấy giá trị từ cả các điều khiển đã bật và tắt
    const formValues = this.appointmentForm.getRawValue();

    // Kết hợp ngày và giờ
    const date = new Date(formValues.appointmentDate);
    const [hours, minutes] = formValues.appointmentTime.split(':').map(Number);

    date.setHours(hours, minutes, 0, 0);

    const appointmentRequest: AppointmentRequest = {
      listingId: formValues.listingId,
      clientId: this.currentUser.id, // Sử dụng ID của người dùng hiện tại
      appointmentDateTime: date.toISOString(),
      durationMinutes: formValues.durationMinutes,
      notes: formValues.notes,
    };

    this.isLoading = true;

    if (this.isEditMode && this.appointment) {
      // Cập nhật cuộc hẹn hiện có
      this.appointmentService
        .rescheduleAppointment(
          this.appointment.id,
          appointmentRequest.appointmentDateTime,
          appointmentRequest.durationMinutes
        )
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            this.snackBar.open('Đã cập nhật lịch hẹn thành công!', 'Đóng', {
              duration: 3000,
            });
            this.formSubmitted.emit(response.data);
          },
          error: (error) => {
            this.snackBar.open(
              error.error?.message || 'Không thể cập nhật lịch hẹn',
              'Đóng',
              {
                duration: 3000,
              }
            );
            console.error('Lỗi khi cập nhật lịch hẹn:', error);
          },
        });
    } else {
      // Tạo cuộc hẹn mới
      this.appointmentService
        .createAppointment(appointmentRequest)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            this.snackBar.open('Đã tạo lịch hẹn thành công!', 'Đóng', {
              duration: 3000,
            });
            this.formSubmitted.emit(response.data);
          },
          error: (error) => {
            this.snackBar.open(
              error.error?.message || 'Không thể tạo lịch hẹn',
              'Đóng',
              {
                duration: 3000,
              }
            );
            console.error('Lỗi khi tạo lịch hẹn:', error);
          },
        });
    }
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}
