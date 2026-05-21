import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ProfileUpdateRequest,
  UserProfile,
  UserService,
} from '../../../core/services/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    // Thêm các module mới vào đây
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  userProfile: UserProfile | null = null;
  isLoading = false;
  isEditing = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.userService.getMyProfile().subscribe({
      next: (response) => {
        this.userProfile = response.data;
        this.profileForm.patchValue({
          fullName: this.userProfile.fullName,
          email: this.userProfile.email,
          phoneNumber: this.userProfile.phoneNumber || '',
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải hồ sơ người dùng', error);
        this.snackBar.open(
          'Không thể tải hồ sơ. Vui lòng thử lại sau.',
          'Đóng',
          {
            duration: 5000,
            panelClass: ['error-snackbar'],
          }
        );
        this.isLoading = false;
      },
    });
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Đặt lại giá trị form khi hủy chỉnh sửa
      this.profileForm.patchValue({
        fullName: this.userProfile?.fullName,
        email: this.userProfile?.email,
        phoneNumber: this.userProfile?.phoneNumber || '',
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    const updateRequest: ProfileUpdateRequest = {
      fullName: this.profileForm.get('fullName')?.value,
      email: this.profileForm.get('email')?.value,
      phoneNumber: this.profileForm.get('phoneNumber')?.value || undefined,
    };

    this.isLoading = true;
    this.userService.updateProfile(updateRequest).subscribe({
      next: (response) => {
        this.userProfile = response.data;
        this.isEditing = false;
        this.isLoading = false;
        this.snackBar.open('Cập nhật hồ sơ thành công!', 'Đóng', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      },
      error: (error) => {
        console.error('Lỗi khi cập nhật hồ sơ', error);
        this.snackBar.open(
          'Không thể cập nhật hồ sơ. Vui lòng thử lại.',
          'Đóng',
          {
            duration: 5000,
            panelClass: ['error-snackbar'],
          }
        );
        this.isLoading = false;
      },
    });
  }
}
