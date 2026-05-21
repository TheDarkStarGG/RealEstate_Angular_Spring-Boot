import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { SaleService } from '../../../core/services/sale.service';
import { PaymentService } from '../../../core/services/payment.service';
import { RentalService } from '../../../core/services/rental.service';
import { Sale, SaleStatus } from '../../../core/models/sale.model';
import {
  Payment,
  PaymentStatus,
  PaymentType,
} from '../../../core/models/payment.model';
import { Rental, RentalStatus } from '../../../core/models/rental.model';

interface TransactionItem {
  id: number;
  type: 'sale' | 'payment' | 'rental';
  date: Date;
  status: string;
  statusColor: string;
  amount: number;
  description: string;
  property?: string;
  counterparty?: string;
  icon: string;
  rawData: any; // Original data object
}

@Component({
  selector: 'app-user-transactions',
  templateUrl: './user-transactions.component.html',
  styleUrls: ['./user-transactions.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatBadgeModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
})
export class UserTransactionsComponent implements OnInit {
  isLoading = true;
  transactions = new MatTableDataSource<TransactionItem>([]);
  salesCount = 0;
  paymentsCount = 0;
  rentalsCount = 0;
  filterControl = new FormControl('');

  displayedColumns: string[] = [
    'icon',
    'date',
    'description',
    'property',
    'counterparty',
    'amount',
    'status',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private saleService: SaleService,
    private paymentService: PaymentService,
    private rentalService: RentalService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.filterControl.valueChanges.subscribe((value) => {
      this.transactions.filter = value?.trim().toLowerCase() || '';

      // Custom filter predicate to search across multiple properties
      this.transactions.filterPredicate = (
        data: TransactionItem,
        filter: string
      ) => {
        const searchStr =
          (data.description || '') +
          (data.property || '') +
          (data.counterparty || '') +
          (data.status || '') +
          this.formatCurrency(data.amount);
        return searchStr.toLowerCase().includes(filter);
      };
    });
  }
  ngAfterViewInit() {
    this.transactions.paginator = this.paginator;
    this.transactions.sort = this.sort;

    // Custom sort for the amount column to ensure proper numeric sorting
    this.transactions.sortingDataAccessor = (
      item: TransactionItem,
      property: string
    ) => {
      switch (property) {
        case 'amount':
          return item.amount;
        case 'date':
          return new Date(item.date).getTime();
        case 'description':
          return item.description.toLowerCase();
        case 'property':
          return item.property ? item.property.toLowerCase() : '';
        case 'counterparty':
          return item.counterparty ? item.counterparty.toLowerCase() : '';
        case 'status':
          return item.status.toLowerCase();
        default:
          return '';
      }
    };
  }
  loadTransactions(): void {
    this.isLoading = true;

    // Lấy ID người dùng hiện tại
    const currentUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
    const userId = currentUser.id;

    // Create observables for each type of transaction using userId
    const salesObservable = this.saleService
      .getUserPurchases(userId)
      .pipe(map((response) => this.processSales(response.data)));

    const paymentsObservable = this.paymentService
      .getUserPayments(userId)
      .pipe(map((response) => this.processPayments(response.data)));

    const rentalsObservable = this.rentalService
      .getUserRentals(userId)
      .pipe(map((response) => this.processRentals(response.data)));

    // Combine all observables
    forkJoin([
      salesObservable,
      paymentsObservable,
      rentalsObservable,
    ]).subscribe({
      next: ([sales, payments, rentals]) => {
        // Combine and sort all transactions by date (newest first)
        const allTransactions = [...sales, ...payments, ...rentals].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        this.salesCount = sales.length;
        this.paymentsCount = payments.length;
        this.rentalsCount = rentals.length;

        this.transactions.data = allTransactions;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions', error);
        this.snackBar.open(
          'Không thể tải giao dịch. Vui lòng thử lại sau.',
          'Đóng',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
        this.isLoading = false;
      },
    });
  }
  processSales(sales: Sale[]): TransactionItem[] {
    return sales.map((sale) => {
      let statusColor: string;
      switch (sale.status) {
        case SaleStatus.PENDING:
          statusColor = 'warning';
          break;
        case SaleStatus.PROCESSING:
          statusColor = 'accent';
          break;
        case SaleStatus.COMPLETED:
          statusColor = 'success';
          break;
        case SaleStatus.CANCELLED:
          statusColor = 'error';
          break;
        default:
          statusColor = 'default';
      }

      return {
        id: sale.id,
        type: 'sale',
        date: new Date(sale.closingDate || sale.createdAt),
        status: this.formatStatus(sale.status),
        statusColor,
        amount: sale.salePrice,
        description: 'Mua bất động sản',
        property: sale.listing?.title || 'Bất động sản #' + sale.listing?.id,
        counterparty: sale.buyer?.fullName || 'Khách hàng #' + sale.buyer?.id,
        icon: 'home',
        rawData: sale,
      };
    });
  }

  processPayments(payments: Payment[]): TransactionItem[] {
    return payments.map((payment) => {
      let statusColor: string;
      switch (payment.status) {
        case PaymentStatus.PENDING:
          statusColor = 'warning';
          break;
        case PaymentStatus.COMPLETED:
          statusColor = 'success';
          break;
        case PaymentStatus.FAILED:
          statusColor = 'error';
          break;
        case PaymentStatus.REFUNDED:
          statusColor = 'accent';
          break;
        default:
          statusColor = 'default';
      }

      // Create description based on payment type
      let description = 'Thanh toán';
      switch (payment.paymentType) {
        case PaymentType.SALE_COMMISSION:
          description = 'Hoa hồng mua bán';
          break;
        case PaymentType.RENTAL_COMMISSION:
          description = 'Hoa hồng cho thuê';
          break;
        case PaymentType.DEPOSIT:
          description = 'Đặt cọc';
          break;
        case PaymentType.MONTHLY_RENT:
          description = 'Tiền thuê hàng tháng';
          break;
      }

      return {
        id: payment.id,
        type: 'payment',
        date: new Date(payment.createdAt),
        status: this.formatStatus(payment.status),
        statusColor,
        amount: payment.amount,
        description,
        counterparty:
          payment.user?.fullName || 'Người dùng #' + payment.user?.id,
        icon: 'payments',
        rawData: payment,
      };
    });
  }

  processRentals(rentals: Rental[]): TransactionItem[] {
    return rentals.map((rental) => {
      let statusColor: string;
      switch (rental.status) {
        case RentalStatus.ACTIVE:
          statusColor = 'success';
          break;
        case RentalStatus.PENDING:
          statusColor = 'warning';
          break;
        case RentalStatus.COMPLETED:
          statusColor = 'accent';
          break;
        case RentalStatus.CANCELLED:
          statusColor = 'error';
          break;
        default:
          statusColor = 'default';
      }

      return {
        id: rental.id,
        type: 'rental',
        date: new Date(rental.startDate),
        status: this.formatStatus(rental.status),
        statusColor,
        amount: rental.monthlyRate,
        description: 'Thuê bất động sản',
        property:
          rental.listing?.title || 'Bất động sản #' + rental.listing?.id,
        counterparty:
          rental.tenant?.fullName || 'Người thuê #' + rental.tenant?.id,
        icon: 'apartment',
        rawData: rental,
      };
    });
  }
  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      PENDING: 'Chờ xử lý',
      PROCESSING: 'Đang xử lý',
      COMPLETED: 'Hoàn tất',
      CANCELLED: 'Đã hủy',
      ACTIVE: 'Đang hoạt động',
      FAILED: 'Thất bại',
      REFUNDED: 'Đã hoàn tiền',
    };

    return statusMap[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  viewDetails(transaction: TransactionItem): void {
    // Implement navigation to detail page based on transaction type
    console.log('View details for transaction:', transaction);
    // Example: this.router.navigate([`/${transaction.type}s`, transaction.id]);
  }

  getStatusClass(statusColor: string): string {
    return `status-${statusColor}`;
  }

  refreshTransactions(): void {
    this.loadTransactions();
  }
}
