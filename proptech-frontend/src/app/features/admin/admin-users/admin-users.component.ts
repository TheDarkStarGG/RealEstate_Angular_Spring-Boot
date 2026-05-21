import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
} from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
  ],
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);

  displayedColumns: string[] = [
    'id',
    'fullName',
    'username',
    'email',
    'roles',
    'actions',
  ];

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  loading = false;
  errorMessage = '';
  searchQuery = '';
  deleteItemId: number | null = null;
  deleteInProgress = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // Thêm dòng này
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
  
  /**
   * Xác nhận xóa người dùng
   */
  confirmDelete(userId: number): void {
    this.deleteItemId = userId;
  }

  /**
   * Hủy thao tác xóa
   */
  cancelDelete(): void {
    this.deleteItemId = null;
  }

  /**
   * Xóa người dùng với ID được chỉ định
   */
  deleteUser(userId: number): void {
    this.deleteInProgress = true;

    this.userService.deleteUser(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('Xóa người dùng thành công', 'success');
          this.loadUsers(); // Tải lại danh sách người dùng
        } else {
          this.errorMessage = response.message || 'Không thể xóa người dùng';
          this.showNotification('Lỗi khi xóa người dùng', 'error');
        }
        this.deleteInProgress = false;
        this.deleteItemId = null;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Đã xảy ra lỗi khi xóa người dùng';
        this.showNotification('Lỗi khi xóa người dùng', 'error');
        this.deleteInProgress = false;
        this.deleteItemId = null;
      },
    });
  }

  /**
   * Hiển thị thông báo snackbar
   */
  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass:
        type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
    });
  }
  
  /**
   * Tải danh sách người dùng
   */
  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getAllUsers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data.content;
          this.dataSource = new MatTableDataSource(this.users);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.currentPage = response.data.page;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
        } else {
          this.errorMessage = response.message || 'Không thể tải danh sách người dùng';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Đã xảy ra lỗi khi tải danh sách người dùng';
        this.loading = false;
      },
    });
  }

  /**
   * Áp dụng bộ lọc tìm kiếm
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue.trim().toLowerCase();

    if (this.searchQuery.length > 2) {
      this.searchUsers();
    } else if (this.searchQuery.length === 0) {
      this.loadUsers();
    }
  }

  /**
   * Tìm kiếm người dùng
   */
  searchUsers(): void {
    this.loading = true;

    this.userService.searchUsers(this.searchQuery).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data;
          this.dataSource = new MatTableDataSource(this.users);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        } else {
          this.errorMessage = response.message || 'Không thể tìm kiếm người dùng';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Đã xảy ra lỗi khi tìm kiếm người dùng';
        this.loading = false;
      },
    });
  }

  /**
   * Xóa tìm kiếm
   */
  clearSearch(): void {
    this.searchQuery = '';
    const input = document.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
    this.loadUsers();
  }

  /**
   * Xử lý khi thay đổi trang
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  /**
   * Xem chi tiết người dùng
   */
  viewUser(userId: number): void {
    this.router.navigate(['/admin/users', userId]);
  }

  /**
   * Chỉnh sửa người dùng
   */
  editUser(userId: number): void {
    this.router.navigate(['/admin/users/edit', userId]);
  }

  /**
   * Lấy màu chip cho vai trò
   */
  getRoleChipColor(role: any): string {
    // Xử lý role như một đối tượng với thuộc tính name
    const roleName = typeof role === 'object' && role?.name ? role.name : role;

    switch (roleName) {
      case 'ROLE_ADMIN':
        return 'primary';
      case 'ROLE_REALTOR':
        return 'accent';
      case 'ROLE_USER':
        return 'warn';
      default:
        return '';
    }
  }

  /**
   * Lấy nhãn vai trò đã sửa trong AdminUsersComponent
   */
  getRoleLabel(role: any): string {
    // Kiểm tra nếu role là một đối tượng với thuộc tính name (định dạng phổ biến trong Spring Security)
    if (role && typeof role === 'object' && 'name' in role) {
      return role.name.replace('ROLE_', '');
    }
    // Nếu role là một chuỗi
    else if (typeof role === 'string') {
      return role.replace('ROLE_', '');
    }
    // Giá trị mặc định
    return String(role).replace('ROLE_', '') || 'User';
  }

  /**
   * Bỏ qua thông báo lỗi
   */
  dismissError(): void {
    this.errorMessage = '';
  }
}