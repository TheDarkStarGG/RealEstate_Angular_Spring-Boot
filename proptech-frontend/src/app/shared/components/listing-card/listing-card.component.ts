import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Listing, PropertyType } from '../../../core/models/listing.model';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './listing-card.component.html',
  styleUrls: ['./listing-card.component.scss'],
})
export class ListingCardComponent {
  @Input() listing!: Listing;

  formatPropertyType(propertyType: PropertyType): string {
    const types: { [key in PropertyType]: string } = {
      HOUSE: 'Nhà',
      APARTMENT: 'Căn Hộ',
      CONDO: 'Chung Cư',
      OFFICE: 'Văn Phòng',
      LAND: 'Đất',
      OTHER: 'Khác',
    };

    return types[propertyType] || propertyType;
  }
}
