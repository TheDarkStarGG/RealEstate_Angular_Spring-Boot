import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
} from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import {
  Appointment,
  AppointmentStatus,
} from '../../../core/models/appointment.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-appointments',
  templateUrl: './admin-appointments.component.html',
  styleUrls: ['./admin-appointments.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
})
export class AdminAppointmentsComponent implements OnInit {
  dataSource = new MatTableDataSource<Appointment>([]);
  displayedColumns: string[] = [
    'id',
    'property',
    'client',
    'realtor',
    'dateTime',
    'duration',
    'status',
    'actions',
  ];

  loading = false;
  errorMessage = '';
  deleteItemId: number | null = null;
  deleteInProgress = false;
  statusUpdateItemId: number | null = null;
  statusUpdateInProgress = false;
  selectedStatus: AppointmentStatus | null = null;

  // For pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  // For filtering
  statusFilter: AppointmentStatus | '' = '';
  fromDateFilter: Date | null = null;
  toDateFilter: Date | null = null;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.appointmentService
      .getAllAppointments(
        this.currentPage,
        this.pageSize,
        'appointmentDateTime',
        'desc'
      )
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dataSource.data = response.data.content;
            this.totalElements = response.data.totalElements;
            this.currentPage = response.data.page;
          } else {
            this.errorMessage =
              response.message || 'Không thể tải danh sách lịch hẹn';
          }
        },
        error: (error) => {
          console.error('Lỗi khi tải lịch hẹn:', error);
          this.errorMessage =
            error.error?.message || 'Đã xảy ra lỗi khi tải danh sách lịch hẹn';
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAppointments();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByStatus(status: AppointmentStatus | ''): void {
    this.statusFilter = status;

    if (status) {
      this.appointmentService
        .getAppointmentsByStatus(
          status as AppointmentStatus,
          this.currentPage,
          this.pageSize
        )
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.dataSource.data = response.data.content;
              this.totalElements = response.data.totalElements;
            } else {
              this.errorMessage = response.message || 'Không thể lọc lịch hẹn';
            }
          },
          error: (error) => {
            this.errorMessage =
              error.error?.message || 'Đã xảy ra lỗi khi lọc lịch hẹn';
          },
        });
    } else {
      this.loadAppointments();
    }
  }

  filterByDateRange(): void {
    if (this.fromDateFilter && this.toDateFilter) {
      // Xử lý lọc theo khoảng thời gian
      this.loading = true;

      // Set time to beginning and end of day
      const start = new Date(this.fromDateFilter);
      start.setHours(0, 0, 0, 0);

      const end = new Date(this.toDateFilter);
      end.setHours(23, 59, 59, 999);

      this.appointmentService
        .getAppointmentsByDateRange(start, end)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.dataSource.data = response.data;
              this.totalElements = response.data.length;
            } else {
              this.errorMessage =
                response.message || 'Không thể lọc lịch hẹn theo ngày';
            }
          },
          error: (error) => {
            this.errorMessage =
              error.error?.message || 'Đã xảy ra lỗi khi lọc lịch hẹn';
          },
        });
    }
  }

  clearSearch(): void {
    this.loadAppointments();
    // Clear input field
    const input = document.querySelector('input[matInput]') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
    this.dataSource.filter = '';
  }

  dismissError(): void {
    this.errorMessage = '';
  }

  viewAppointment(id: number): void {
    // Navigate to appointment detail page or open dialog
    this.snackBar.open('Xem lịch hẹn: ' + id, 'Đóng', {
      duration: 3000,
    });
  }

  rescheduleAppointment(id: number): void {
    // Open reschedule dialog or navigate to reschedule page
    this.snackBar.open('Đổi lịch hẹn: ' + id, 'Đóng', {
      duration: 3000,
    });
  }

  confirmDelete(id: number): void {
    this.deleteItemId = id;
  }

  cancelDelete(): void {
    this.deleteItemId = null;
  }

  cancelAppointment(id: number): void {
    this.deleteInProgress = true;

    this.appointmentService
      .updateAppointmentStatus(
        id,
        AppointmentStatus.CANCELLED,
        'Đã hủy bởi quản trị viên'
      )
      .pipe(
        finalize(() => {
          this.deleteInProgress = false;
          this.deleteItemId = null;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Đã hủy lịch hẹn thành công', 'Đóng', {
              duration: 3000,
            });

            // Cập nhật status trong danh sách hiện tại
            const index = this.dataSource.data.findIndex(
              (item) => item.id === id
            );
            if (index !== -1) {
              this.dataSource.data[index].status = AppointmentStatus.CANCELLED;
              this.dataSource.data = [...this.dataSource.data]; // Trigger change detection
            }
          } else {
            this.errorMessage = response.message || 'Không thể hủy lịch hẹn';
          }
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || 'Đã xảy ra lỗi khi hủy lịch hẹn';
        },
      });
  }

  openStatusUpdateMenu(appointment: Appointment): void {
    this.statusUpdateItemId = appointment.id;
    this.selectedStatus = appointment.status;
  }

  cancelStatusUpdate(): void {
    this.statusUpdateItemId = null;
    this.selectedStatus = null;
  }

  isChangingStatus(id: number): boolean {
    return this.statusUpdateItemId === id;
  }

  updateAppointmentStatus(id: number): void {
    if (!this.selectedStatus) {
      this.snackBar.open('Vui lòng chọn trạng thái', 'Đóng', {
        duration: 3000,
      });
      return;
    }

    this.statusUpdateInProgress = true;

    this.appointmentService
      .updateAppointmentStatus(
        id,
        this.selectedStatus,
        'Trạng thái đã cập nhật bởi quản trị viên'
      )
      .pipe(
        finalize(() => {
          this.statusUpdateInProgress = false;
          this.statusUpdateItemId = null;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open(
              'Đã cập nhật trạng thái lịch hẹn thành công',
              'Đóng',
              {
                duration: 3000,
              }
            );

            // Cập nhật status trong danh sách hiện tại
            const index = this.dataSource.data.findIndex(
              (item) => item.id === id
            );
            if (index !== -1) {
              this.dataSource.data[index].status = this
                .selectedStatus as AppointmentStatus;
              this.dataSource.data = [...this.dataSource.data]; // Trigger change detection
            }
          } else {
            this.errorMessage =
              response.message || 'Không thể cập nhật trạng thái lịch hẹn';
          }
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Đã xảy ra lỗi khi cập nhật trạng thái lịch hẹn';
        },
      });
  }

  formatStatus(status: AppointmentStatus): string {
    const statusMap: { [key: string]: string } = {
      REQUESTED: 'Đã yêu cầu',
      CONFIRMED: 'Đã xác nhận',
      COMPLETED: 'Đã hoàn thành',
      CANCELLED: 'Đã hủy',
    };

    return statusMap[status] || status;
  }

  getConfirmedAppointmentsCount(): number {
    return this.dataSource.data.filter(
      (appointment) => appointment.status === AppointmentStatus.CONFIRMED
    ).length;
  }

  getPendingAppointmentsCount(): number {
    return this.dataSource.data.filter(
      (appointment) => appointment.status === AppointmentStatus.REQUESTED
    ).length;
  }
}
