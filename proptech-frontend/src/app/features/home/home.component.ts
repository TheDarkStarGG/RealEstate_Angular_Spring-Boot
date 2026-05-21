import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { ListingCardComponent } from '../../shared/components/listing-card/listing-card.component';
import { ListingService } from '../../core/services/listing.service';
import { Listing } from '../../core/models/listing.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ListingCardComponent,
  ],
})
export class HomeComponent implements OnInit {
  featuredListings: Listing[] = [];
  loading = false;

  constructor(private listingService: ListingService, private router: Router) {}

  ngOnInit(): void {
    this.loadFeaturedListings();
  }

  loadFeaturedListings(): void {
    this.loading = true;

    this.listingService.getListings(0, 6).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.featuredListings = response.data.content;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải bất động sản nổi bật:', error);
        this.loading = false;
      },
    });
  }

  goToCategory(propertyType: string, listingType: string): void {
    this.router.navigate(['/listings/search'], {
      queryParams: {
        propertyType,
        listingType,
      },
    });
  }
}
