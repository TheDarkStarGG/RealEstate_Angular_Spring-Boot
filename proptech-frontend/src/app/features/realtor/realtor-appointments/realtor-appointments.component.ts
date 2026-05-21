import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { finalize } from 'rxjs';
import {
  Appointment,
  AppointmentStatus,
} from '../../../core/models/appointment.model';
import { AppointmentService } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-realtor-appointments',
  templateUrl: './realtor-appointments.component.html',
  styleUrls: ['./realtor-appointments.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class RealtorAppointmentsComponent implements OnInit {
  dataSource = new MatTableDataSource<Appointment>([]);
  displayedColumns: string[] = [
    'id',
    'property',
    'client',
    'dateTime',
    'duration',
    'status',
    'actions',
  ];

  // Cho lọc
  fromDate: Date | null = null;
  toDate: Date | null = null;

  // Cho phân trang
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  // Cho trạng thái UI
  loading = false;
  errorMessage = '';
  selectedAppointmentId: number | null = null;
  selectedStatus: AppointmentStatus | null = null;
  statusUpdateInProgress = false;
  cancelInProgress = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService
      .getMyRealtorAppointments()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dataSource.data = response.data;
            this.totalElements = response.data.length;
          } else {
            this.errorMessage =
              response.message || 'Không thể tải danh sách lịch hẹn';
          }
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách lịch hẹn', error);
          this.errorMessage =
            error.error?.message || 'Đã xảy ra lỗi khi tải danh sách lịch hẹn';
        },
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByStatus(status: string): void {
    if (status) {
      this.appointmentService
        .getMyAppointmentsByStatus(status as AppointmentStatus)
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
            console.error('Lỗi khi lọc lịch hẹn', error);
            this.errorMessage =
              error.error?.message || 'Đã xảy ra lỗi khi lọc lịch hẹn';
          },
        });
    } else {
      this.loadAppointments(); // Đặt lại về tất cả lịch hẹn
    }
  }

  filterByDateRange(): void {
    if (this.fromDate && this.toDate) {
      const startDateTime = new Date(this.fromDate);
      startDateTime.setHours(0, 0, 0, 0);

      const endDateTime = new Date(this.toDate);
      endDateTime.setHours(23, 59, 59, 999);

      this.appointmentService
        .getMyAppointmentsByDateRange(
          startDateTime.toISOString(),
          endDateTime.toISOString()
        )
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
            console.error('Lỗi khi lọc lịch hẹn theo ngày', error);
            this.errorMessage =
              error.error?.message ||
              'Đã xảy ra lỗi khi lọc lịch hẹn theo ngày';
          },
        });
    }
  }

  clearSearch(): void {
    // Xóa ô tìm kiếm
    const input = document.querySelector('input[matInput]') as HTMLInputElement;
    if (input) {
      input.value = '';
    }

    // Xóa bộ lọc
    this.fromDate = null;
    this.toDate = null;

    // Đặt lại bộ lọc datasource
    this.dataSource.filter = '';

    // Tải lại danh sách lịch hẹn
    this.loadAppointments();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  viewAppointment(id: number): void {
    this.router.navigate(['/realtor/appointments', id]);
  }

  isChangingStatus(id: number): boolean {
    return this.selectedAppointmentId === id && this.selectedStatus !== null;
  }

  isCancelling(id: number): boolean {
    return this.selectedAppointmentId === id && this.selectedStatus === null;
  }

  openStatusUpdateMenu(appointment: Appointment): void {
    this.selectedAppointmentId = appointment.id;
    this.selectedStatus = appointment.status;
  }

  updateAppointmentStatus(id: number): void {
    if (!this.selectedStatus) return;

    this.statusUpdateInProgress = true;
    this.appointmentService
      .updateAppointmentStatus(id, this.selectedStatus)
      .pipe(
        finalize(() => {
          this.statusUpdateInProgress = false;
          this.selectedAppointmentId = null;
          this.selectedStatus = null;
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

            // Cập nhật lịch hẹn trong nguồn dữ liệu
            const index = this.dataSource.data.findIndex((a) => a.id === id);
            if (index !== -1) {
              this.dataSource.data[index] = response.data;
              this.dataSource._updateChangeSubscription();
            }
          } else {
            this.errorMessage =
              response.message || 'Không thể cập nhật trạng thái lịch hẹn';
          }
        },
        error: (error) => {
          console.error('Lỗi khi cập nhật trạng thái lịch hẹn', error);
          this.errorMessage =
            error.error?.message ||
            'Đã xảy ra lỗi khi cập nhật trạng thái lịch hẹn';
        },
      });
  }

  cancelStatusUpdate(): void {
    this.selectedAppointmentId = null;
    this.selectedStatus = null;
  }

  rescheduleAppointment(id: number): void {
    this.router.navigate(['/realtor/appointments/reschedule', id]);
  }

  confirmCancel(id: number): void {
    this.selectedAppointmentId = id;
    this.selectedStatus = null;
  }

  cancelCancelConfirmation(): void {
    this.selectedAppointmentId = null;
  }

  cancelAppointment(id: number): void {
    this.cancelInProgress = true;
    this.appointmentService
      .updateAppointmentStatus(id, AppointmentStatus.CANCELLED)
      .pipe(
        finalize(() => {
          this.cancelInProgress = false;
          this.selectedAppointmentId = null;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Đã hủy lịch hẹn thành công', 'Đóng', {
              duration: 3000,
            });

            // Cập nhật lịch hẹn trong nguồn dữ liệu
            const index = this.dataSource.data.findIndex((a) => a.id === id);
            if (index !== -1) {
              this.dataSource.data[index] = response.data;
              this.dataSource._updateChangeSubscription();
            }
          } else {
            this.errorMessage = response.message || 'Không thể hủy lịch hẹn';
          }
        },
        error: (error) => {
          console.error('Lỗi khi hủy lịch hẹn', error);
          this.errorMessage =
            error.error?.message || 'Đã xảy ra lỗi khi hủy lịch hẹn';
        },
      });
  }

  dismissError(): void {
    this.errorMessage = '';
  }

  // Các phương thức trợ giúp cho UI
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
