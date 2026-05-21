import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingListComponent } from './listing-list/listing-list.component';
import { ListingDetailComponent } from './listing-detail/listing-detail.component';
import { ListingFormComponent } from './listing-form/listing-form.component';
import { ListingSearchComponent } from './listing-search/listing-search.component';



@NgModule({
  declarations: [
    ListingListComponent,
    ListingDetailComponent,
    ListingFormComponent,
    ListingSearchComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ListingsModule { }
