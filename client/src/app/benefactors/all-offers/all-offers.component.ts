import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import {
  MatCard, MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import { MatGridList, MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { Benefactor } from '../../models/benefactor';
import { Router } from '@angular/router';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { BenefactorsService } from "../../services/benefactors.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Offer } from "../../models/offer";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-all-offers',
  templateUrl: './all-offers.component.html',
  standalone: true,
  imports: [
    MatFormField,
    MatIcon,
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardHeader,
    NgStyle,
    MatCardTitle,
    MatCardContent,
    MatCardSubtitle,
    MatCardActions,
    MatProgressSpinner,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  styleUrls: ['./all-offers.component.css']
})
export class AllOffersComponent implements OnInit {
  offers: Offer[] = [];
  page = 0;
  pageSize = 20;
  loading = false;
  allLoaded = false;
  searchQuery = '';

  constructor(
    private benefactorService: BenefactorsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.getOffers();
  }

  getOffers() {
    if (this.loading || this.allLoaded) {
      return;
    }
    this.loading = true;
    this.benefactorService.getLastOffers(this.page, this.pageSize, this.searchQuery)?.subscribe(offers => {
      if (offers.length > 0) {
        this.offers = [...this.offers, ...offers];
        this.page++;
      } else {
        this.allLoaded = true;
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      this.showErrorMessage('An error occurred: ' + error.message);
    });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100)) {
      this.getOffers();
    }
  }

  onClick(id: string) {
    if (!id) {
      return;
    }
    this.router.navigate(['/benefactors/profile/', id]);
  }

  onSearch() {
    this.offers = [];
    this.page = 0;
    this.allLoaded = false;
    this.getOffers();
  }

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
    });
  }

  getImageUrl(offer: Offer): string {
    return offer.image
      ? this.parseImageUrl(offer.image)
      : `url(https://api.dicebear.com/8.x/shapes/svg?seed=${offer.image})`;
  }

  parseImageUrl(url: string): string {
    return `url(http://localhost:3000/${url.replace(/\\/g, '/')})`;
  }
}
