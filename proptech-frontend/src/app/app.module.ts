import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { authInterceptorProviders } from './core/authentication/auth.interceptor';

// Shared components
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ListingCardComponent } from './shared/components/listing-card/listing-card.component';
import { PaginationComponent } from './shared/components/pagination/pagination.component';

// Feature components
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ListingListComponent } from './features/listings/listing-list/listing-list.component';
import { ListingDetailComponent } from './features/listings/listing-detail/listing-detail.component';
import { ListingFormComponent } from './features/listings/listing-form/listing-form.component';
import { ListingSearchComponent } from './features/listings/listing-search/listing-search.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './features/admin/admin-users/admin-users.component';
import { AdminRealtorsComponent } from './features/admin/admin-realtors/admin-realtors.component';
import { AdminListingsComponent } from './features/admin/admin-listings/admin-listings.component';
import { AdminSalesComponent } from './features/admin/admin-sales/admin-sales.component';
import { AdminRentalsComponent } from './features/admin/admin-rentals/admin-rentals.component';
import { AdminPaymentsComponent } from './features/admin/admin-payments/admin-payments.component';
import { RealtorDashboardComponent } from './features/realtor/realtor-dashboard/realtor-dashboard.component';
import { RealtorListingsComponent } from './features/realtor/realtor-listings/realtor-listings.component';
import { RealtorSalesComponent } from './features/realtor/realtor-sales/realtor-sales.component';
import { RealtorRentalsComponent } from './features/realtor/realtor-rentals/realtor-rentals.component';
import { UserProfileComponent } from './features/user/user-profile/user-profile.component';

import { UserTransactionsComponent } from './features/user/user-transactions/user-transactions.component';
import { SaleListComponent } from './features/sales/sale-list/sale-list.component';
import { SaleDetailComponent } from './features/sales/sale-detail/sale-detail.component';
import { SaleFormComponent } from './features/sales/sale-form/sale-form.component';
import { RentalListComponent } from './features/rentals/rental-list/rental-list.component';
import { RentalDetailComponent } from './features/rentals/rental-detail/rental-detail.component';
import { RentalFormComponent } from './features/rentals/rental-form/rental-form.component';
import { AccessDeniedComponent } from './shared/components/access-denied/access-denied.component';
import { CommonModule } from '@angular/common';
import { AppointmentFormComponent } from './features/appointments/appointment-form/appointment-form.component';
import { ScheduleAppointmentDialogComponent } from './features/appointments/schedule-appointment-dialog/schedule-appointment-dialog.component';
import { RealtorAppointmentsComponent } from './features/realtor/realtor-appointments/realtor-appointments.component';
import { UserAppointmentsComponent } from './features/user/user-appointments/user-appointments.component';
@NgModule({
  declarations: [
    AppComponent,
    SaleListComponent,
    SaleDetailComponent,
    RentalListComponent,
    RentalDetailComponent,

    // ❌ Bỏ các component standalone ở đây
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    UserAppointmentsComponent,

    FormsModule,
    UserTransactionsComponent,
    UserProfileComponent,
    RealtorAppointmentsComponent,
    RealtorSalesComponent,
    AppointmentFormComponent,
    ScheduleAppointmentDialogComponent,
    RealtorDashboardComponent,
    RealtorListingsComponent,
    RealtorRentalsComponent,
    ReactiveFormsModule,
    CommonModule,
    AdminPaymentsComponent,
    AdminRealtorsComponent,
    ListingFormComponent,
    AdminSalesComponent,
    SaleFormComponent,
    AdminRentalsComponent,
    RentalFormComponent,
    ListingSearchComponent,
    AdminUsersComponent,
    ListingDetailComponent,
    AdminListingsComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    ListingCardComponent,
    PaginationComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    AccessDeniedComponent,
    ListingListComponent,
    AdminDashboardComponent,
  ],
  providers: [authInterceptorProviders],
  bootstrap: [AppComponent],
})
export class AppModule {}
