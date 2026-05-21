import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../../environments/environment';

// Angular Material Imports
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';

Chart.register(...registerables);

interface DashboardStats {
  users: number;
  realtors: number;
  listings: number;
  sales: number;
  rentals: number;
  payments: number;
}

interface Activity {
  icon: string;
  title: string;
  description: string;
  time: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  stats: DashboardStats = {
    users: 0,
    realtors: 0,
    listings: 0,
    sales: 0,
    rentals: 0,
    payments: 0,
  };

  recentActivities: Activity[] = [];

  salesChart: any;
  propertyTypeChart: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadRecentActivities();

    setTimeout(() => {
      this.initSalesChart();
      this.initPropertyTypeChart();
    }, 500);
  }

  loadDashboardStats() {
    this.http
      .get<any>(`${environment.apiUrl}/admin/dashboard/stats`)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.stats = response.data;
          }
        },
        error: (error) => {
          console.error('Lỗi khi tải thống kê bảng điều khiển', error);
          this.loadMockStats();
        },
      });
  }

  loadMockStats() {
    this.stats = {
      users: 152,
      realtors: 28,
      listings: 87,
      sales: 34,
      rentals: 56,
      payments: 112,
    };
  }

  loadRecentActivities() {
    this.recentActivities = [
      {
        icon: 'bi-house-add text-success',
        title: 'Bất động sản mới',
        description:
          'Nguyễn Văn A đã thêm một bất động sản mới tại Quận 2, Tp.HCM.',
        time: '10 phút trước',
      },
      {
        icon: 'bi-cash-coin text-primary',
        title: 'Giao dịch hoàn tất',
        description: 'Giao dịch mua #1234 đã được hoàn tất thành công.',
        time: '2 giờ trước',
      },
      {
        icon: 'bi-person-add text-info',
        title: 'Môi giới mới tham gia',
        description: 'Trần Thị B đã tham gia với vai trò môi giới.',
        time: '5 giờ trước',
      },
      {
        icon: 'bi-key text-warning',
        title: 'Hợp đồng thuê',
        description: 'Hợp đồng thuê mới đã được ký cho bất động sản #5678.',
        time: 'Hôm qua',
      },
    ];
  }

  // Map Bootstrap icons to Material icons
  mapIconClass(bootstrapIcon: string): string {
    const iconMap: { [key: string]: string } = {
      'bi-house-add': 'home',
      'bi-cash-coin': 'payments',
      'bi-person-add': 'person_add',
      'bi-key': 'key',
    };

    // Extract the icon name without the prefix and modifier classes
    const iconName = bootstrapIcon.split(' ')[0];
    return iconMap[iconName] || 'circle';
  }

  initSalesChart() {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [
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
        ],
        datasets: [
          {
            label: 'Mua bán',
            data: [12, 19, 3, 5, 2, 3, 20, 33, 23, 12, 15, 18],
            backgroundColor: 'rgba(103, 58, 183, 0.1)', // Primary color for Angular Material
            borderColor: 'rgba(103, 58, 183, 1)',
            pointBackgroundColor: 'rgba(103, 58, 183, 1)',
            tension: 0.3,
            fill: true,
          },
          {
            label: 'Cho thuê',
            data: [8, 12, 5, 8, 14, 9, 17, 19, 20, 22, 25, 18],
            backgroundColor: 'rgba(76, 175, 80, 0.1)', // Success color for Angular Material
            borderColor: 'rgba(76, 175, 80, 1)',
            pointBackgroundColor: 'rgba(76, 175, 80, 1)',
            tension: 0.3,
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
          },
        },
      },
    });
  }

  initPropertyTypeChart() {
    const ctx = document.getElementById(
      'propertyTypeChart'
    ) as HTMLCanvasElement;
    if (!ctx) return;

    this.propertyTypeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Nhà riêng', 'Căn hộ', 'Chung cư', 'Văn phòng', 'Đất'],
        datasets: [
          {
            data: [45, 25, 15, 10, 5],
            backgroundColor: [
              'rgba(103, 58, 183, 0.8)', // Primary
              'rgba(76, 175, 80, 0.8)', // Success
              'rgba(255, 193, 7, 0.8)', // Warning
              'rgba(244, 67, 54, 0.8)', // Danger
              'rgba(3, 169, 244, 0.8)', // Info
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
}
