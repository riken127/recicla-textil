import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Benefactor} from '../../models/benefactor';
import {Pickpoint} from '../../models/pickpoint';
import {Donation, ItemContainer} from '../../models/donation';
import {AuthenticationService} from '../../services/authentication.service';
import {DonationsService} from '../../services/donations.service';
import {BenefactorsService} from '../../services/benefactors.service';

@Component({
  selector: 'app-create-donation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-donation.component.html',
  styleUrls: ['./create-donation.component.css'],
})
export class CreateDonationComponent implements OnInit {
  donationForm: FormGroup;
  benefactor: Benefactor | null = null;
  pickpoints: Pickpoint[] = [];
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private donationsService: DonationsService,
    private benefactorsService: BenefactorsService,
    private authenticationService: AuthenticationService,
    private snackBar: MatSnackBar
  ) {
    this.donationForm = this.fb.group({
      pickpoint: [null, Validators.required],
      items: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const benefactorId = '' + params.get('id') || '';

      if (benefactorId) {
        this.loadBenefactorAndPickpoints(benefactorId);
      }
    });
    this.authenticationService
      .getDecodedToken(true, false, false)
      .subscribe((result) => {
        this.userId = result.id;
      });
  }

  loadBenefactorAndPickpoints(benefactorId: string) {
    this.benefactorsService.getBenefactor(benefactorId)?.subscribe(
      (benefactor: Benefactor) => {
        this.benefactor = benefactor;
        this.loadPickpoints(benefactorId);
      },
      (error) => {
        this.snackBar.open(
          'Error loading benefactor: ' + error.message,
          'Close',
          {
            duration: 5000,
          }
        );
      }
    );
  }

  loadPickpoints(benefactorId: string) {
    this.benefactorsService.getAllPickpoints(benefactorId)?.subscribe(
      (response: any) => {
        this.pickpoints = response.data;
      },
      (error) => {
        this.snackBar.open(
          'Error loading pickpoints: ' + error.message,
          'Close',
          {
            duration: 5000,
          }
        );
      }
    );
  }

  onSubmit() {
    if (this.donationForm.invalid) {
      return;
    }

    const formValue = this.donationForm.value;
    const selectedPickpointId = formValue.pickpoint;
    const itemContainer = new ItemContainer(
      this.benefactor!._id,
      selectedPickpointId,
      [],
      0,
      0
    );
    const donation = new Donation(
      '',
      this.userId!,
      'donation',
      new Date().toISOString(),
      itemContainer,
      '',
      0,
      'Waiting Approval'
    );

    this.donationsService.addDonation(donation)?.subscribe(
      (donationId) => {
        if (donationId) {
          this.snackBar.open('Donation created successfully!', 'Close', {
            duration: 5000,
          });

          this.router.navigate([donationId, 'list-items']);
        } else {
          this.snackBar.open(
            'Error creating donation: ID not returned',
            'Close',
            {
              duration: 5000,
            }
          );
        }
      },
      (error) => {
        this.snackBar.open(
          'Error creating donation: ' + error.message,
          'Close',
          {
            duration: 5000,
          }
        );
      }
    );
  }
}
