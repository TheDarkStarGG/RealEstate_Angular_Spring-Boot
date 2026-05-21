import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/authentication/auth.guard';

import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ListingListComponent } from './features/listings/listing-list/listing-list.component';
import { ListingDetailComponent } from './features/listings/listing-detail/listing-detail.component';
import { ListingFormComponent } from './features/listings/listing-form/listing-form.component';
import { ListingSearchComponent } from './features/listings/listing-search/listing-search.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './features/admin/admin-users/admin-users.component';
import { UserFormComponent } from './features/admin/user-form/user-form.component'; // Add this import
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
import { SaleDetailComponent } from './features/sales/sale-detail/sale-detail.component';
import { SaleFormComponent } from './features/sales/sale-form/sale-form.component';
import { RentalDetailComponent } from './features/rentals/rental-detail/rental-detail.component';
import { RentalFormComponent } from './features/rentals/rental-form/rental-form.component';
import { AccessDeniedComponent } from './shared/components/access-denied/access-denied.component';
import { AdminAppointmentsComponent } from './features/admin/admin-appointments/admin-appointments.component';
import { RealtorAppointmentsComponent } from './features/realtor/realtor-appointments/realtor-appointments.component';
import { UserAppointmentsComponent } from './features/user/user-appointments/user-appointments.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'listings', component: ListingListComponent },
  { path: 'listings/search', component: ListingSearchComponent },
  {
    path: 'listings/create',
    component: ListingFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REALTOR', 'ROLE_ADMIN'] },
  },
  {
    path: 'listings/edit/:id',
    component: ListingFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REALTOR', 'ROLE_ADMIN'] },
  },
  { path: 'listings/:id', component: ListingDetailComponent },

  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'users/create', component: UserFormComponent }, // Add this route
      { path: 'users/edit/:id', component: UserFormComponent }, // Add this route
      { path: 'realtors', component: AdminRealtorsComponent },
      { path: 'listings', component: AdminListingsComponent },
      { path: 'sales', component: AdminSalesComponent },
      { path: 'rentals', component: AdminRentalsComponent },
      { path: 'payments', component: AdminPaymentsComponent },
      { path: 'appointments', component: AdminAppointmentsComponent },
    ],
  },
  {
    path: 'realtor',
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REALTOR'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: RealtorDashboardComponent },
      { path: 'listings', component: RealtorListingsComponent },
      { path: 'sales', component: RealtorSalesComponent },
      { path: 'rentals', component: RealtorRentalsComponent },
      { path: 'appointments', component: RealtorAppointmentsComponent },
    ],
  },
  {
    path: 'user',
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_USER', 'ROLE_REALTOR', 'ROLE_ADMIN'] },
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: UserProfileComponent },
      { path: 'transactions', component: UserTransactionsComponent },
      { path: 'appointments', component: UserAppointmentsComponent },
    ],
  },
  {
    path: 'sales',
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REALTOR', 'ROLE_ADMIN'] },
    children: [
      { path: 'create', component: SaleFormComponent },
      { path: 'edit/:id', component: SaleFormComponent },
      { path: ':id', component: SaleDetailComponent },
    ],
  },
  {
    path: 'rentals',
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_REALTOR', 'ROLE_ADMIN'] },
    children: [
      { path: 'create', component: RentalFormComponent },
      { path: 'edit/:id', component: RentalFormComponent },
      { path: ':id', component: RentalDetailComponent },
    ],
  },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
