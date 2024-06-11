import { Component, OnInit, Inject } from '@angular/core';
import { BenefactorsService } from '../../services/benefactors.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Offer } from '../../models/offer';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateOfferComponent } from '../create-offer/create-offer.component';
import { EditOfferComponent } from '../edit-offer/edit-offer.component';

@Component({
  selector: 'app-offers-table',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    CreateOfferComponent,
  ],
  templateUrl: './offers-table.component.html',
  styleUrls: ['./offers-table.component.css'],
})
export class OffersTableComponent implements OnInit {
  benefactorId: string;
  offers: Offer[] = [];
  displayedColumns: string[] = [
    'title',
    'description',
    'startDate',
    'endDate',
    'points',
    'active',
    'actions',
  ];

  constructor(
    private benefactorService: BenefactorsService,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.benefactorId = data.benefactorId;
  }

  ngOnInit() {
    this.loadOffers();
  }

  loadOffers() {
    this.benefactorService.getOffers(this.benefactorId)?.subscribe(
      (offers) => {
        this.offers = offers;
      },
      (error) => {
        this.snackBar.open('Error fetching offers: ' + error.message, 'Close');
      }
    );
  }

  editOffer(offer: Offer) {
    const dialogRef = this.dialog.open(EditOfferComponent, {
      data: {
        offer: offer,
        benefactorId: this.benefactorId,
      },
      width: '35vw',
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.loadOffers();
    });
  }

  toggleOffer(offer: Offer) {
    this.benefactorService
      .toggleOfferActiveStatus(this.benefactorId, offer)
      ?.subscribe(
        (success) => {
          if (success) {
            this.snackBar.open('Offer status updated successfully', 'Close');
          } else {
            this.snackBar.open('Error updating offer status', 'Close');
          }
        },
        (error) => {
          this.snackBar.open(
            'Error updating offer status: ' + error.message,
            'Close'
          );
        }
      );
  }

  navigateToCreateOffers() {
    const dialogRef = this.dialog.open(CreateOfferComponent, {
      data: {
        benefactorId: this.benefactorId,
      },
      width: '35vw',
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.loadOffers();
    });
  }

  formatDate(date: string | Date): string {
    const parsedDate = new Date(date);
    const day = ('0' + parsedDate.getDate()).slice(-2);
    const month = ('0' + (parsedDate.getMonth() + 1)).slice(-2);
    const year = parsedDate.getFullYear();

    return `${day}-${month}-${year}`;
  }
}
