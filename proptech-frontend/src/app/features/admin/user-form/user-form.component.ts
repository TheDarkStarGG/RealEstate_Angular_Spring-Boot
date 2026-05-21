import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';

import {
  UserService,
  UserCreateRequest,
  ApiResponse,
} from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
  ],
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId?: number;
  submitting = false;
  errorMessage = '';
  availableRoles = [
    { value: 'ROLE_USER', label: 'Người dùng' },
    { value: 'ROLE_REALTOR', label: 'Môi giới' },
    { value: 'ROLE_ADMIN', label: 'Quản trị viên' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
        this.loadUser(this.userId);
      }
    });
  }

  initForm(): void {
    this.userForm = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
      password: [
        '',
        this.isEditMode
          ? []
          : [
              Validators.required,
              Validators.minLength(6),
              Validators.maxLength(40),
            ],
      ],
      phoneNumber: [''],
      roles: [['ROLE_USER'], Validators.required],
    });

    // Nếu đang ở chế độ chỉnh sửa, vô hiệu hóa trường tên đăng nhập vì không được phép thay đổi
    if (this.isEditMode) {
      this.userForm.get('username')?.disable();
    }
  }

  loadUser(id: number): void {
    this.submitting = true;
    this.userService.getUserDetails(id).subscribe({
      next: (response) => {
        if (response.success) {
          const user = response.data;

          // Cập nhật form với dữ liệu người dùng
          this.userForm.patchValue({
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            roles: user.roles.map((role: any) =>
              typeof role === 'string' ? role : role.name || ''
            ),
          });

          // Trường mật khẩu không bắt buộc trong chế độ chỉnh sửa
          this.userForm
            .get('password')
            ?.setValidators(
              this.isEditMode
                ? []
                : [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(40),
                  ]
            );
          this.userForm.get('password')?.updateValueAndValidity();
        } else {
          this.errorMessage =
            response.message || 'Không thể tải thông tin người dùng';
          this.showNotification('Lỗi khi tải thông tin người dùng', 'error');
        }
        this.submitting = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Đã xảy ra lỗi khi tải thông tin người dùng';
        this.showNotification('Lỗi khi tải thông tin người dùng', 'error');
        this.submitting = false;
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      // Đánh dấu tất cả các trường để hiển thị lỗi
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const userData: UserCreateRequest = {
      username: this.userForm.get('username')?.value,
      fullName: this.userForm.get('fullName')?.value,
      email: this.userForm.get('email')?.value,
      password: this.userForm.get('password')?.value,
      phoneNumber: this.userForm.get('phoneNumber')?.value,
      roles: this.userForm.get('roles')?.value,
    };

    if (this.isEditMode && this.userId) {
      this.updateUser(this.userId, userData);
    } else {
      this.createUser(userData);
    }
  }
  createUser(userData: UserCreateRequest): void {
    // Xác định API endpoint dựa trên vai trò
    let request$: Observable<ApiResponse<User>>;

    if (userData.roles?.includes('ROLE_ADMIN')) {
      request$ = this.userService.createAdmin(userData);
    } else if (userData.roles?.includes('ROLE_REALTOR')) {
      request$ = this.userService.createRealtor(userData);
    } else {
      request$ = this.userService.createUser(userData);
    }

    request$.subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('Tạo người dùng thành công', 'success');
          this.router.navigate(['/admin/users']);
        } else {
          this.errorMessage = response.message || 'Không thể tạo người dùng';
          this.showNotification('Lỗi khi tạo người dùng', 'error');
        }
        this.submitting = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Đã xảy ra lỗi khi tạo người dùng';
        this.showNotification('Lỗi khi tạo người dùng', 'error');
        this.submitting = false;
      },
    });
  }

  updateUser(id: number, userData: UserCreateRequest): void {
    this.userService.updateUser(id, userData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('Cập nhật người dùng thành công', 'success');
          this.router.navigate(['/admin/users']);
        } else {
          this.errorMessage =
            response.message || 'Không thể cập nhật người dùng';
          this.showNotification('Lỗi khi cập nhật người dùng', 'error');
        }
        this.submitting = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Đã xảy ra lỗi khi cập nhật người dùng';
        this.showNotification('Lỗi khi cập nhật người dùng', 'error');
        this.submitting = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass:
        type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
    });
  }

  get f() {
    return this.userForm.controls;
  }
}
