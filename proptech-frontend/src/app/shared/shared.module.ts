import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ListingCardComponent } from './components/listing-card/listing-card.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    ListingCardComponent,
    PaginationComponent,
    AccessDeniedComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
