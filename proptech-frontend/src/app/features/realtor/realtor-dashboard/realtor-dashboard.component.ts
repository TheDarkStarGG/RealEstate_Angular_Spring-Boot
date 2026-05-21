import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

// Import Chart.js
import Chart from 'chart.js/auto';
import { Listing } from '../../../core/models/listing.model';
import {
  Appointment,
  AppointmentStatus,
} from '../../../core/models/appointment.model';
import { ListingService } from '../../../core/services/listing.service';
import { SaleService } from '../../../core/services/sale.service';
import { RentalService } from '../../../core/services/rental.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Sale, SaleStatus } from '../../../core/models/sale.model';
import { Rental, RentalStatus } from '../../../core/models/rental.model';

@Component({
  selector: 'app-realtor-dashboard',
  templateUrl: './realtor-dashboard.component.html',
  styleUrls: ['./realtor-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatChipsModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
})
export class RealtorDashboardComponent implements OnInit, AfterViewInit {
  // Thống kê
  stats = {
    listings: 0,
    completedSales: 0,
    activeRentals: 0,
    upcomingAppointments: 0,
  };

  // Dữ liệu bảng
  recentListings: Listing[] = [];
  upcomingAppointments: Appointment[] = [];

  // Trạng thái đang tải
  isLoadingListings = true;
  isLoadingAppointments = true;

  // Cột bảng
  listingColumns: string[] = ['title', 'price', 'type', 'status'];

  // Biểu đồ
  salesPerformanceChart: Chart | undefined;
  listingTypeChart: Chart | undefined;

  // Bộ lọc thời gian (mặc định: tháng)
  timeFilter: 'day' | 'week' | 'month' | 'year' = 'month';

  constructor(
    private listingService: ListingService,
    private saleService: SaleService,
    private rentalService: RentalService,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 500);
  }

  loadDashboardData(): void {
    // Lấy danh sách của tôi
    const myListings$ = this.listingService.getMyListings().pipe(
      map((response) => {
        if (response.success && response.data) {
          this.stats.listings = response.data.totalElements;
          this.recentListings = response.data.content.slice(0, 5);
          return response.data.content;
        }
        return [];
      }),
      catchError((error) => {
        console.error('Lỗi khi tải danh sách', error);
        return of([]);
      }),
      finalize(() => {
        this.isLoadingListings = false;
      })
    );

    // Lấy doanh số bán của tôi
    const mySales$ = this.saleService.getMySales().pipe(
      map((response) => {
        if (response.success && response.data) {
          this.stats.completedSales = response.data.filter(
            (sale) => sale.status === SaleStatus.COMPLETED
          ).length;
          return response.data;
        }
        return [];
      }),
      catchError((error) => {
        console.error('Lỗi khi tải doanh số bán', error);
        return of([]);
      })
    );

    // Lấy cho thuê của tôi
    const myRentals$ = this.rentalService
      .getMyRentalsByStatus(RentalStatus.ACTIVE, 0, 100)
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            this.stats.activeRentals = response.data.totalElements;
            return response.data.content;
          }
          return [];
        }),
        catchError((error) => {
          console.error('Lỗi khi tải cho thuê', error);
          return of([]);
        })
      );

    // Lấy lịch hẹn sắp tới
    const upcomingAppointments$ = this.appointmentService
      .getMyRealtorAppointments()
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            // Lọc lịch hẹn sắp tới (trong tương lai và chưa bị hủy)
            const now = new Date();
            const upcoming = response.data.filter((appointment) => {
              const appointmentDate = new Date(appointment.appointmentDateTime);
              return (
                appointmentDate > now &&
                appointment.status !== AppointmentStatus.CANCELLED
              );
            });

            this.stats.upcomingAppointments = upcoming.length;

            // Sắp xếp theo ngày (gần nhất trước) và lấy 5 cái đầu tiên
            this.upcomingAppointments = upcoming
              .sort((a, b) => {
                return (
                  new Date(a.appointmentDateTime).getTime() -
                  new Date(b.appointmentDateTime).getTime()
                );
              })
              .slice(0, 5);

            return upcoming;
          }
          return [];
        }),
        catchError((error) => {
          console.error('Lỗi khi tải lịch hẹn', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoadingAppointments = false;
        })
      );

    // Kết hợp tất cả các yêu cầu
    forkJoin([
      myListings$,
      mySales$,
      myRentals$,
      upcomingAppointments$,
    ]).subscribe({
      next: ([listings, sales, rentals, appointments]) => {
        // Dữ liệu đã được xử lý trong các toán tử map
        // Chúng ta có thể sử dụng dữ liệu kết hợp cho xử lý bổ sung nếu cần
        this.prepareChartData(listings, sales, rentals);
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu bảng điều khiển', error);
        this.snackBar.open(
          'Không thể tải một số dữ liệu bảng điều khiển',
          'Đóng',
          {
            duration: 5000,
          }
        );
      },
    });
  }

  prepareChartData(
    listings: Listing[],
    sales: Sale[],
    rentals: Rental[]
  ): void {
    // Phương thức này chuẩn bị dữ liệu cho biểu đồ dựa trên dữ liệu đã tải
    // Nó sẽ được sử dụng bởi phương thức initializeCharts()
  }

  initializeCharts(): void {
    this.initSalesPerformanceChart();
    this.initListingTypeChart();
  }

  initSalesPerformanceChart(): void {
    const canvas = document.getElementById(
      'salesPerformanceChart'
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dữ liệu mẫu - trong ứng dụng thực tế, sẽ lấy từ API
    const labels = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ];
    const salesData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const rentalsData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Điền với dữ liệu ngẫu nhiên cho demo
    for (let i = 0; i < 12; i++) {
      salesData[i] = Math.floor(Math.random() * 5);
      rentalsData[i] = Math.floor(Math.random() * 3);
    }

    this.salesPerformanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Bán',
            data: salesData,
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Cho Thuê',
            data: rentalsData,
            borderColor: '#ff9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
      },
    });
  }

  initListingTypeChart(): void {
    const canvas = document.getElementById(
      'listingTypeChart'
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dữ liệu mẫu - trong ứng dụng thực tế, sẽ lấy từ API
    this.listingTypeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Nhà', 'Căn Hộ', 'Chung Cư', 'Văn Phòng', 'Đất'],
        datasets: [
          {
            data: [5, 3, 2, 1, 1],
            backgroundColor: [
              '#2196f3',
              '#4caf50',
              '#ff9800',
              '#9c27b0',
              '#f44336',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
        },
      },
    });
  }

  filterByTimeRange(range: 'day' | 'week' | 'month' | 'year'): void {
    this.timeFilter = range;
    this.snackBar.open(`Đã lọc theo: ${this.getTimeRangeText(range)}`, 'Đóng', {
      duration: 3000,
    });

    // Trong ứng dụng thực tế, bạn sẽ tải lại dữ liệu dựa trên khoảng thời gian
    // Đối với demo này, chúng tôi chỉ hiển thị một thông báo
  }

  getTimeRangeText(range: 'day' | 'week' | 'month' | 'year'): string {
    switch (range) {
      case 'day':
        return 'Hôm nay';
      case 'week':
        return 'Tuần này';
      case 'month':
        return 'Tháng này';
      case 'year':
        return 'Năm nay';
      default:
        return range;
    }
  }

  viewListing(id: number): void {
    this.router.navigate(['/listings', id]);
  }

  viewAppointment(id: number): void {
    this.router.navigate(['/realtor/appointments', id]);
  }

  // Phương thức hỗ trợ định dạng ngày
  getMonthFromDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { month: 'short' });
  }
  getDayFromDate(dateString: string): string {
    const date = new Date(dateString);
    return date.getDate().toString();
  }

  getTimeFromDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
