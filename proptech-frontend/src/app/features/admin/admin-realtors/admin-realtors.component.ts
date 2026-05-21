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
import { MatDialogModule } from '@angular/material/dialog';

import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-admin-realtors',
  templateUrl: './admin-realtors.component.html',
  styleUrls: ['./admin-realtors.component.scss'],
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
export class AdminRealtorsComponent implements OnInit {
  realtors: User[] = [];
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);

  displayedColumns: string[] = [
    'id',
    'fullName',
    'username',
    'email',
    'phoneNumber',
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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRealtors();
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadRealtors(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getRealtors().subscribe({
      next: (response) => {
        if (response.success) {
          this.realtors = response.data;
          this.dataSource = new MatTableDataSource(this.realtors);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.totalElements = this.realtors.length;
        } else {
          this.errorMessage =
            response.message || 'Không thể tải danh sách môi giới';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Đã xảy ra lỗi khi tải danh sách môi giới';
        this.loading = false;
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue.trim().toLowerCase();

    this.dataSource.filter = this.searchQuery;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.dataSource.filter = '';

    const input = document.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  viewRealtor(realtorId: number): void {
    this.router.navigate(['/admin/realtors', realtorId]);
  }

  editRealtor(realtorId: number): void {
    this.router.navigate(['/admin/users/edit', realtorId]);
  }

  createRealtor(): void {
    this.router.navigate(['/admin/users/create']);
  }

  confirmDelete(realtorId: number): void {
    this.deleteItemId = realtorId;
  }

  cancelDelete(): void {
    this.deleteItemId = null;
  }

  deleteRealtor(realtorId: number): void {
    this.deleteInProgress = true;

    this.userService.deleteUser(realtorId).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('Đã xóa môi giới thành công', 'success');
          this.loadRealtors();
        } else {
          this.errorMessage = response.message || 'Không thể xóa môi giới';
          this.showNotification('Lỗi khi xóa môi giới', 'error');
        }
        this.deleteInProgress = false;
        this.deleteItemId = null;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Đã xảy ra lỗi khi xóa môi giới';
        this.showNotification('Lỗi khi xóa môi giới', 'error');
        this.deleteInProgress = false;
        this.deleteItemId = null;
      },
    });
  }

  dismissError(): void {
    this.errorMessage = '';
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

  getTotalRealtors(): number {
    return this.realtors.length;
  }
}
