import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import {
  Appointment,
  AppointmentStatus,
} from '../../../core/models/appointment.model';

interface AppointmentViewModel extends Appointment {
  formattedDate: string;
  formattedTime: string;
  formattedDuration: string;
  statusText: string;
  statusClass: string;
}

@Component({
  selector: 'app-user-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './user-appointments.component.html',
  styleUrls: ['./user-appointments.component.scss'],
})
export class UserAppointmentsComponent implements OnInit {
  isLoading = false;
  appointments = new MatTableDataSource<AppointmentViewModel>([]);
  filterControl = new FormControl('');
  totalAppointments = 0;

  displayedColumns: string[] = [
    'date',
    'time',
    'duration',
    'property',
    'realtor',
    'status',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAppointments();

    this.filterControl.valueChanges.subscribe((value) => {
      this.appointments.filter = value?.trim().toLowerCase() || '';

      this.appointments.filterPredicate = (
        data: AppointmentViewModel,
        filter: string
      ) => {
        const searchStr =
          (data.listing?.title || '') +
          (data.realtor?.fullName || '') +
          (data.formattedDate || '') +
          (data.statusText || '');

        return searchStr.toLowerCase().includes(filter);
      };
    });
  }

  ngAfterViewInit() {
    this.appointments.paginator = this.paginator;
    this.appointments.sort = this.sort;

    this.appointments.sortingDataAccessor = (
      item: AppointmentViewModel,
      property: string
    ) => {
      switch (property) {
        case 'date':
          return new Date(item.appointmentDateTime).getTime();
        case 'property':
          return item.listing?.title?.toLowerCase() || '';
        case 'realtor':
          return item.realtor?.fullName?.toLowerCase() || '';
        case 'status':
          return item.status;
        case 'duration':
          return item.durationMinutes;
        default:
          return '';
      }
    };
  }

  loadAppointments(): void {
    this.isLoading = true;

    const currentUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
    const userId = currentUser.id;

    if (!userId) {
      this.snackBar.open(
        'Không thể xác định người dùng. Vui lòng đăng nhập lại.',
        'Đóng',
        {
          duration: 5000,
        }
      );
      this.isLoading = false;
      return;
    }

    this.appointmentService.getAppointmentsByClient(userId).subscribe({
      next: (response) => {
        // Biến đổi dữ liệu
        const viewModels = response.data.map((appointment) =>
          this.mapToViewModel(appointment)
        );
        this.appointments.data = viewModels;
        this.totalAppointments = response.data.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải lịch hẹn:', error);
        this.snackBar.open(
          'Không thể tải lịch hẹn. Vui lòng thử lại sau.',
          'Đóng',
          {
            duration: 5000,
          }
        );
        this.isLoading = false;
      },
    });
  }

  mapToViewModel(appointment: Appointment): AppointmentViewModel {
    const date = new Date(appointment.appointmentDateTime);
    return {
      ...appointment,
      formattedDate: this.formatDate(date),
      formattedTime: this.formatTime(date),
      formattedDuration: this.formatDuration(appointment.durationMinutes),
      statusText: this.formatStatus(appointment.status),
      statusClass: this.getStatusClass(appointment.status),
    };
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} phút`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} giờ`;
      } else {
        return `${hours} giờ ${remainingMinutes} phút`;
      }
    }
  }

  formatStatus(status: AppointmentStatus): string {
    const statusMap: { [key: string]: string } = {
      REQUESTED: 'Đã yêu cầu',
      CONFIRMED: 'Đã xác nhận',
      CANCELLED: 'Đã hủy',
      COMPLETED: 'Đã hoàn thành',
    };

    return statusMap[status] || status;
  }

  getStatusClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.REQUESTED:
        return 'status-requested';
      case AppointmentStatus.CONFIRMED:
        return 'status-confirmed';
      case AppointmentStatus.CANCELLED:
        return 'status-cancelled';
      case AppointmentStatus.COMPLETED:
        return 'status-completed';
      default:
        return '';
    }
  }

  cancelAppointment(appointment: Appointment): void {
    if (confirm('Bạn có chắc chắn muốn hủy lịch hẹn này không?')) {
      this.appointmentService
        .updateAppointmentStatus(appointment.id, AppointmentStatus.CANCELLED)
        .subscribe({
          next: () => {
            this.snackBar.open('Đã hủy lịch hẹn thành công', 'Đóng', {
              duration: 3000,
            });
            this.loadAppointments();
          },
          error: (error) => {
            console.error('Lỗi khi hủy lịch hẹn:', error);
            this.snackBar.open(
              'Không thể hủy lịch hẹn. Vui lòng thử lại.',
              'Đóng',
              {
                duration: 5000,
              }
            );
          },
        });
    }
  }

  refreshAppointments(): void {
    this.loadAppointments();
  }
}
