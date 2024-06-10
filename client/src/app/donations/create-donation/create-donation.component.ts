import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Benefactor } from '../../models/benefactor';
import { Pickpoint } from '../../models/pickpoint';
import { Donation, ItemContainer } from '../../models/donation';
import { AuthenticationService } from '../../services/authentication.service';
import { DonationsService } from '../../services/donations.service';
import { BenefactorsService } from '../../services/benefactors.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatOption } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-create-donation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatButtonModule,
    MatAccordion,
    MatExpansionModule,
    MatCardModule,
    MatOption,
    MatSelectModule,
  ],
  templateUrl: './create-donation.component.html',
  styleUrls: ['./create-donation.component.css'],
})
export class CreateDonationComponent implements OnInit {
  donationForm: FormGroup;
  benefactor: Benefactor | null = null;
  pickpoints: Pickpoint[] = [];
  userId: string | null = null;
  benefactorId: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private donationsService: DonationsService,
    private benefactorsService: BenefactorsService,
    private authenticationService: AuthenticationService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CreateDonationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.donationForm = this.fb.group({
      pickpoint: [null, Validators.required],
      items: this.fb.array([]),
    });
    this.benefactorId = data.benefactorId;
  }

  ngOnInit() {
    if (this.benefactorId) {
      this.loadBenefactorAndPickpoints(this.benefactorId);
    }

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
        this.pickpoints = response;
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
      'Waiting Approval',
      [],
      0
    );

    this.donationsService.addDonation(donation)?.subscribe(
      (donationId) => {
        if (donationId) {
          this.snackBar.open('Donation created successfully!', 'Close', {
            duration: 5000,
          });

          this.dialogRef.close();
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
