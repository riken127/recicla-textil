import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { DonationsService } from '../../services/donations.service';
import { BenefactorsService } from '../../services/benefactors.service';
import { AuthenticationService } from '../../services/authentication.service';
import { Donation } from '../../models/donation';
import { Benefactor } from '../../models/benefactor';
import { Pickpoint } from '../../models/pickpoint';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatExpansionModule,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListDonationsComponent implements OnInit {
  constructor(
    private authenticationService: AuthenticationService,
    private donationsService: DonationsService,
    private benefactorsService: BenefactorsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  donations: Donation[] = [];
  dataSource = new MatTableDataSource<Donation>(this.donations);
  displayedColumns: string[] = [
    'expand',
    'benefactorName',
    'pickpointAddress',
    'items',
    'weight',
    'timeStamp',
    'status',
  ];
  expandedElement: Donation | null = null;

  ngOnInit() {
    this.getDonations();
  }

  getDonations() {
    this.donationsService.getAllDonations()?.subscribe(
      (response: any) => {
        this.donations = response.data;

        let donationsTableContent = [];

        this.donations.forEach((donation, index) => {
          if (!donation.details.benefactorId || !donation.details.pickpointId) {
            this.snackBar.open(
              'Benefactor or Pickpoint not defined for donation.',
              'Close',
              {
                duration: 5000,
              }
            );
            return;
          }

          this.benefactorsService
            .getBenefactor(donation.details.benefactorId)
            ?.subscribe(
              (benefactor: Benefactor) => {
                this.benefactorsService
                  .getPickpoint(
                    donation.details.benefactorId,
                    donation.details.pickpointId
                  )
                  ?.subscribe(
                    (pickpoint: Pickpoint) => {
                      donationsTableContent.push({
                        ...donation,
                        benefactorName: benefactor.name,
                        pickpointAddress: `${pickpoint.street}, ${pickpoint.city}, ${pickpoint.country}, ${pickpoint.postalCode}`,
                      });

                      if (
                        donationsTableContent.length === this.donations.length
                      ) {
                        this.dataSource = new MatTableDataSource<Donation>(
                          donationsTableContent
                        );
                      }
                    },
                    (error) => {
                      this.snackBar.open(
                        'Error getting pickpoint: ' + error.message,
                        'Close',
                        {
                          duration: 5000,
                        }
                      );
                    }
                  );
              },
              (error) => {
                this.snackBar.open(
                  'Error getting benefactor: ' + error.message,
                  'Close',
                  {
                    duration: 5000,
                  }
                );
              }
            );
        });
      },
      (error) => {
        this.snackBar.open('Error: ' + error.message, 'Close', {
          duration: 5000,
        });
      }
    );
  }

  formatTimestamp(timestamp: string): string {
    return format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss');
  }
}
