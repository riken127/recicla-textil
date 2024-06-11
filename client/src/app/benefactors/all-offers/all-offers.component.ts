import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import {
  MatGridList,
  MatGridListModule,
  MatGridTile,
} from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { BenefactorsService } from '../../services/benefactors.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Offer } from '../../models/offer';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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
  styleUrls: ['./all-offers.component.css'],
})
export class AllOffersComponent implements OnInit {
  offers: Offer[] = [];
  benefactorId: string;

  constructor(
    private benefactorService: BenefactorsService,
    private router: Router,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.benefactorId = data.benefactorId;
  }

  ngOnInit() {
    this.getOffers(this.benefactorId);
  }

  getOffers(benefactorId: string) {
    this.benefactorService.getOffers(benefactorId)?.subscribe(
      (offers) => {
        const currentDate = new Date();
        this.offers = offers.filter(
          (offer) =>
            offer.active &&
            new Date(offer.startDate) <= currentDate &&
            new Date(offer.endDate) >= currentDate
        );
      },
      (error) => {
        this.snackBar.open('Error fetching offers: ' + error.message, 'Close');
      }
    );
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

  formatDate(date: string | Date): string {
    const parsedDate = new Date(date);
    const day = ('0' + parsedDate.getDate()).slice(-2);
    const month = ('0' + (parsedDate.getMonth() + 1)).slice(-2);
    const year = parsedDate.getFullYear();
    return `${day}-${month}-${year}`;
  }

  calculateLeafMultiplier(): number {
    if (this.offers.length === 0) return 0;
    const totalPoints = this.offers.reduce((sum, offer) => sum + offer.points, 0);
    return totalPoints;
  }
}
