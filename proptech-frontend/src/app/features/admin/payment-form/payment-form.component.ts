import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  Observable,
  of,
  map,
  startWith,
  debounceTime,
  switchMap,
  catchError,
} from 'rxjs';
import {
  Payment,
  PaymentStatus,
  PaymentType,
} from '../../../core/models/payment.model';
import { User } from '../../../core/models/user.model';
import {
  PaymentService,
  PaymentRequest,
} from '../../../core/services/payment.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class PaymentFormComponent implements OnInit {
  paymentForm: FormGroup; // Biểu mẫu thanh toán
  isNew: boolean; // Kiểm tra xem đây là thanh toán mới hay chỉnh sửa
  loading = false; // Trạng thái đang tải

  // Danh sách để lưu trữ người dùng được tìm kiếm
  users: User[] = [];

  // Danh sách người dùng đã được lọc
  filteredUsers: Observable<User[]> = of([]);

  // Các loại thanh toán
  paymentTypes = [
    { value: PaymentType.SALE_COMMISSION, label: 'Hoa Hồng Bán Hàng' },
    { value: PaymentType.RENTAL_COMMISSION, label: 'Hoa Hồng Cho Thuê' },
    { value: PaymentType.DEPOSIT, label: 'Tiền Đặt Cọc' },
    { value: PaymentType.MONTHLY_RENT, label: 'Tiền Thuê Hàng Tháng' },
  ];

  // Các trạng thái thanh toán
  paymentStatuses = [
    { value: PaymentStatus.PENDING, label: 'Đang Chờ Xử Lý' },
    { value: PaymentStatus.COMPLETED, label: 'Hoàn Thành' },
    { value: PaymentStatus.FAILED, label: 'Thất Bại' },
    { value: PaymentStatus.REFUNDED, label: 'Đã Hoàn Tiền' },
  ];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private userService: UserService,
    private dialogRef: MatDialogRef<PaymentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isNew: boolean; payment?: Payment }
  ) {
    this.isNew = data.isNew;

    // Khởi tạo biểu mẫu với giá trị mặc định hoặc dữ liệu thanh toán được cung cấp
    this.paymentForm = this.fb.group({
      paymentType: [data.payment?.paymentType || '', Validators.required],
      user: ['', Validators.required], // Sẽ được điền với đối tượng User
      amount: [
        data.payment?.amount || '',
        [Validators.required, Validators.min(0.01)],
      ],
      commission: [data.payment?.commission || 0, [Validators.min(0)]],
      referenceId: [data.payment?.referenceId || '', Validators.required],
      paymentMethod: [data.payment?.paymentMethod || '', Validators.required],
      transactionId: [data.payment?.transactionId || ''],
      notes: [data.payment?.notes || ''],
      status: [
        data.payment?.status || PaymentStatus.PENDING,
        Validators.required,
      ],
    });

    // Nếu đang chỉnh sửa thanh toán hiện có, thiết lập trường người dùng
    if (!this.isNew && data.payment && data.payment.user) {
      this.paymentForm.get('user')?.setValue(data.payment.user);
    }
  }

  ngOnInit(): void {
    // Thiết lập tự động hoàn thành tìm kiếm người dùng với các lệnh gọi API
    this.filteredUsers = this.paymentForm.get('user')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap((value) => {
        const query = typeof value === 'string' ? value : value?.fullName || '';
        if (query.length < 2) {
          return of([]);
        }

        return this.userService.searchUsers(query).pipe(
          map((response) => (response.success ? response.data : [])),
          catchError(() => of([]))
        );
      })
    );
  }

  // Hiển thị tên người dùng
  displayUser(user: User): string {
    return user ? user.fullName : '';
  }

  // Xử lý khi gửi biểu mẫu
  onSubmit(): void {
    if (this.paymentForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.paymentForm.value;

    if (this.isNew) {
      // Tạo thanh toán mới
      const paymentRequest: PaymentRequest = {
        paymentType: formValue.paymentType,
        referenceId: formValue.referenceId,
        userId: formValue.user.id,
        amount: formValue.amount,
        commission: formValue.commission,
        paymentMethod: formValue.paymentMethod,
        transactionId: formValue.transactionId || undefined,
        notes: formValue.notes || undefined,
      };

      this.paymentService.createPayment(paymentRequest).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.dialogRef.close(response.data);
          } else {
            // Xử lý phản hồi lỗi API
            console.error('Lỗi khi tạo thanh toán:', response.message);
            // Trong ứng dụng thực tế, bạn sẽ hiển thị lỗi này cho người dùng
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Lỗi khi tạo thanh toán:', err);
          // Trong ứng dụng thực tế, bạn sẽ hiển thị lỗi này cho người dùng
        },
      });
    } else {
      // Cập nhật thanh toán hiện có
      // Đối với việc cập nhật, chúng ta chỉ sử dụng hàm updatePaymentStatus
      // Trong ứng dụng thực tế, bạn sẽ có một hàm cập nhật chuyên dụng
      this.paymentService
        .updatePaymentStatus(
          this.data.payment!.id,
          formValue.status,
          formValue.transactionId,
          formValue.notes
        )
        .subscribe({
          next: (response) => {
            this.loading = false;
            if (response.success) {
              this.dialogRef.close(response.data);
            } else {
              // Xử lý phản hồi lỗi API
              console.error('Lỗi khi cập nhật thanh toán:', response.message);
              // Trong ứng dụng thực tế, bạn sẽ hiển thị lỗi này cho người dùng
            }
          },
          error: (err) => {
            this.loading = false;
            console.error('Lỗi khi cập nhật thanh toán:', err);
            // Trong ứng dụng thực tế, bạn sẽ hiển thị lỗi này cho người dùng
          },
        });
    }
  }
}