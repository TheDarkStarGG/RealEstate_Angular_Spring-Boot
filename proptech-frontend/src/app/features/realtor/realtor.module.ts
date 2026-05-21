import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealtorDashboardComponent } from './realtor-dashboard/realtor-dashboard.component';
import { RealtorListingsComponent } from './realtor-listings/realtor-listings.component';
import { RealtorSalesComponent } from './realtor-sales/realtor-sales.component';
import { RealtorRentalsComponent } from './realtor-rentals/realtor-rentals.component';
import { RealtorAppointmentsComponent } from './realtor-appointments/realtor-appointments.component';



@NgModule({
  declarations: [
    RealtorDashboardComponent,
    RealtorListingsComponent,
    RealtorSalesComponent,
    RealtorRentalsComponent,
    RealtorAppointmentsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class RealtorModule { }
