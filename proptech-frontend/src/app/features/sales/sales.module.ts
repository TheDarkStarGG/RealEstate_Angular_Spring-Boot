import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleListComponent } from './sale-list/sale-list.component';
import { SaleDetailComponent } from './sale-detail/sale-detail.component';
import { SaleFormComponent } from './sale-form/sale-form.component';



@NgModule({
  declarations: [
    SaleListComponent,
    SaleDetailComponent,
    SaleFormComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SalesModule { }
