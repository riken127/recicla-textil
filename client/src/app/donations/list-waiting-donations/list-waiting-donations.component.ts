import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonModule} from '@angular/material/button';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import {DonationsService} from '../../services/donations.service';
import {BenefactorsService} from '../../services/benefactors.service';
import {UsersService} from '../../services/users.service';
import {AuthenticationService} from '../../services/authentication.service';
import {Donation} from '../../models/donation';
import {Benefactor} from '../../models/benefactor';
import {User} from '../../models/user';
import {Pickpoint} from '../../models/pickpoint';
import {ActivatedRoute, Router} from '@angular/router';
import {format} from 'date-fns';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';
import { MatCard } from '@angular/material/card';

interface DecoratedDonation extends Donation {
  username: string;
  pickpointAddress: string;
}

@Component({
  selector: 'app-list-waiting-donations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatExpansionModule,
    MatSlideToggleModule,
    FormsModule,
  ],
  templateUrl: './list-waiting-donations.component.html',
  styleUrl: './list-waiting-donations.component.css',
})
export class ListWaitingDonationsComponent implements OnInit {
  donations: Donation[] = [];
  decoratedDonations: DecoratedDonation[] = [];
  dataSource = new MatTableDataSource<DecoratedDonation>(
    this.decoratedDonations
  );
  displayedColumns: string[] = [
    'expand',
    'username',
    'pickpointAddress',
    'items',
    'weight',
    'timeStamp',
    'status',
    'actions',
  ];
  expandedElement: Donation | null = null;
  onlyWaiting: boolean = false;
  isDisabled = false;

  constructor(
    private authenticationService: AuthenticationService,
    private donationsService: DonationsService,
    private benefactorsService: BenefactorsService,
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private changeDetector: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.getDonations();
    this.updateDisplayedColumns();
  }

  getDonations() {
    this.route.paramMap.subscribe((params) => {
      const benefactorId = '' + params.get('id') || '';
      this.donationsService.getAllDonations()?.subscribe(
        (response: any) => {
          this.donations = response.data;
          this.decoratedDonations = [];

          this.donations.forEach((donation) => {
            if (!donation.details.benefactorId || !donation.details.pickpointId) {
              this.snackBar.open(
                'BenefactorId or PickpointId is not defined for donation',
                'Close',
                {
                  duration: 3000,
                }
              );
              return;
            }

            if (
              donation.details.benefactorId === benefactorId &&
              (this.onlyWaiting
                ? donation.status === 'Waiting Approval' ||
                donation.status === 'On Going'
                : true)
            ) {
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
                          this.usersService.getUser(donation.userId)?.subscribe(
                            (user: User) => {
                              this.decoratedDonations.push({
                                ...donation,
                                username: user.username,
                                pickpointAddress: `${pickpoint.street}, ${pickpoint.city}, ${pickpoint.country}, ${pickpoint.postalCode}`,
                              });

                              this.dataSource =
                                new MatTableDataSource<DecoratedDonation>(
                                  this.decoratedDonations
                                );
                            },
                            (error) => {
                              this.snackBar.open(
                                'Error getting user: ' + error.message,
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
            }
          });
        },
        (error) => {
          this.snackBar.open('Error: ' + error.message, 'Close', {
            duration: 5000,
          });
        }
      );
    });
  }

  formatTimestamp(timestamp: string): string {
    return format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss');
  }

  onToggleChange(event: any) {
    this.isDisabled = true;
    this.onlyWaiting = event.checked;
    this.getDonations();
    this.updateDisplayedColumns();
    this.changeDetector.detectChanges();

    setTimeout(() => {
      this.isDisabled = false;
    }, 500);
  }

  updateDisplayedColumns() {
    this.displayedColumns = [
      'expand',
      'username',
      'pickpointAddress',
      'items',
      'weight',
      'timeStamp',
      'status',
    ];

    if (this.onlyWaiting) {
      this.displayedColumns.push('actions');
    }
  }

  acceptDonation(donation: Donation) {
    let updatedStatus = '';

    if (donation.status === 'Waiting Approval') {
      updatedStatus = 'On Going';
    } else if (donation.status === 'On Going') {
      updatedStatus = 'Delivered';
    }

    const updatedDonation = {
      ...donation,
      status: updatedStatus,
    };
    this.donationsService.updateDonation(updatedDonation)?.subscribe(
      (response) => {
        if (response) {
          this.snackBar.open('Donation status updated successfully', 'Close', {
            duration: 5000,
          });
          this.getDonations();
        } else {
          this.snackBar.open('Error updating donation status', 'Close', {
            duration: 5000,
          });
        }
      },
      (error) => {
        this.snackBar.open('Error: ' + error.message, 'Close', {
          duration: 5000,
        });
      }
    );
  }

  cancelDonation(donation: Donation) {
    const updatedDonation = {
      ...donation,
      status: 'Canceled',
    };
    this.donationsService.updateDonation(updatedDonation)?.subscribe(
      (response) => {
        if (response) {
          this.snackBar.open('Donation status updated successfully', 'Close', {
            duration: 5000,
          });
          this.getDonations();
        } else {
          this.snackBar.open('Error updating donation status', 'Close', {
            duration: 5000,
          });
        }
      },
      (error) => {
        this.snackBar.open('Error: ' + error.message, 'Close', {
          duration: 5000,
        });
      }
    );
  }
}
