import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserFavoritesComponent } from './user-favorites/user-favorites.component';
import { UserInquiriesComponent } from './user-inquiries/user-inquiries.component';
import { UserTransactionsComponent } from './user-transactions/user-transactions.component';
import { UserAppointmentsComponent } from './user-appointments/user-appointments.component';



@NgModule({
  declarations: [
    UserProfileComponent,
    UserFavoritesComponent,
    UserInquiriesComponent,
    UserTransactionsComponent,
    UserAppointmentsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class UserModule { }
