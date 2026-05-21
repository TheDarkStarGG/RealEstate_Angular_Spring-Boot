import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentalListComponent } from './rental-list/rental-list.component';
import { RentalDetailComponent } from './rental-detail/rental-detail.component';
import { RentalFormComponent } from './rental-form/rental-form.component';



@NgModule({
  declarations: [
    RentalListComponent,
    RentalDetailComponent,
    RentalFormComponent
  ],
  imports: [
    CommonModule
  ]
})
export class RentalsModule { }
