import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BenefactorsService } from '../../services/benefactors.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Offer } from '../../models/offer';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUploadService } from "../../services/file-upload.service";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-create-offer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatGridListModule,
    MatDatepickerModule,
    MatIconModule
  ],
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.css']
})

export class CreateOfferComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  fileToUpload: File | null = null;

  constructor(
    private benefactorsService: BenefactorsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private fileUploadService: FileUploadService,
  ) { }

  get f() {
    return this.form.controls;
  }

  MustBeGreater(greaterDateControl: string, smallerDateControl: string) {
    return (group: AbstractControl) => {
      const greater = group.get(greaterDateControl);
      const smaller = group.get(smallerDateControl);

      if (!smaller || !greater) {
        return null;
      }

      if (greater.errors && !greater.errors['mustBeGreater']) {
        return null;
      }

      if (greater.value <= smaller.value) {
        greater.setErrors({ mustBeGreater: true });
      } else {
        greater.setErrors(null);
      }

      return null;
    };
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.form = this.formBuilder.group({
        startDate: [new Date(Date.now()), Validators.required],
        endDate: [new Date(Date.now()), Validators.required],
        benefactor: [params.get('id')],
        title: ['', [Validators.required, Validators.minLength(6)]],
        description: [''],
        points: ['']
      }, {
        validators: this.MustBeGreater('endDate', 'startDate')
      });
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const newOffer = new Offer(
      '',
      this.f['startDate'].value,
      this.f['endDate'].value,
      this.f['benefactor'].value,
      this.f['title'].value,
      this.f['description'].value,
      this.fileToUpload ? 'y' : '',
      this.f['points'].value,
      true
    );

    this.benefactorsService.addOffer(this.f['benefactor'].value, newOffer)
      .subscribe(
        result => {
          const offerId = result.result;

          if (offerId && this.fileToUpload) {
            this.fileUploadService.uploadOfferImage(this.fileToUpload, this.f['benefactor'].value, offerId)
              .subscribe(
                uploadResult => {
                  this.snackBar.open('Offer and image have been created!', 'Close', {
                    duration: 3000,
                  }).afterDismissed().subscribe(() => {
                    this.router.navigate(['/']);
                  });
                },
                uploadError => {
                  this.snackBar.open('Offer created, but image upload failed.', 'Close', {
                    duration: 3000
                  });
                }
              );
          } else {
            this.snackBar.open('Offer has been created!', 'Close', {
              duration: 3000,
            }).afterDismissed().subscribe(() => {
              this.router.navigate(['/']);
            });
          }
        },
        error => {
          this.snackBar.open(error.error.message, 'Close', {
            duration: 3000
          });
        }
      );
    this.onReset();
  }

  onReset() {
    this.route.paramMap.subscribe((params) => {
      this.submitted = false;
      this.form.reset();
      this.form.patchValue({ benefactor: params.get('id') });
    });
  }

  onFileSelected(event: any) {
    this.fileToUpload = event.target.files[0];
  }
}
