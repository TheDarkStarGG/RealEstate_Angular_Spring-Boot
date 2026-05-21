import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminRealtorsComponent } from './admin-realtors/admin-realtors.component';
import { AdminListingsComponent } from './admin-listings/admin-listings.component';
import { AdminSalesComponent } from './admin-sales/admin-sales.component';
import { AdminRentalsComponent } from './admin-rentals/admin-rentals.component';
import { AdminPaymentsComponent } from './admin-payments/admin-payments.component';
import { UserFormComponent } from './user-form/user-form.component';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { SaleFormComponent } from './sale-form/sale-form.component';
import { AdminAppointmentsComponent } from './admin-appointments/admin-appointments.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';



@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminRealtorsComponent,
    AdminListingsComponent,
    AdminSalesComponent,
    AdminRentalsComponent,
    AdminPaymentsComponent,
    UserFormComponent,
    PaymentFormComponent,
    SaleFormComponent,
    AdminAppointmentsComponent,
    AppointmentFormComponent
  ],
  imports: [
    CommonModule
  ]
})
export class AdminModule { }
