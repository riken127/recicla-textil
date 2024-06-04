import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BenefactorsService} from '../../services/benefactors.service';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Offer} from '../../models/offer';
import {ActivatedRoute, Router} from '@angular/router';
import {FileUploadService} from "../../services/file-upload.service";

@Component({
  selector: 'app-edit-offer',
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
  ],
  templateUrl: './edit-offer.component.html',
  styleUrl: './edit-offer.component.css'
})

export class EditOfferComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  current: string = '';
  fileToUpload: File | null = null;

  constructor(
    private benefactorsService: BenefactorsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private fileUploadService: FileUploadService
    ) {

  }

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
        greater.setErrors({mustBeGreater: true});
      } else {
        greater.setErrors(null);
      }

      return null;
    };
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.form = this.formBuilder.group({
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        benefactor: [params.get('benefactor')],
        title: ['', [Validators.required, Validators.minLength(6)]],
        description: ['']
      }, {
        validators: this.MustBeGreater('endDate', 'startDate')
      });

      this.benefactorsService.getOffers(params.get('benefactor') || '')
        ?.subscribe(
          result => {
            const matchingOffer = result?.find(offer => offer?._id === params.get('offer'));

            if (matchingOffer) {
              this.current = matchingOffer!._id;
              this.form.setValue({
                startDate: new Date(matchingOffer!.startDate).toISOString().slice(0, 10),
                endDate: new Date(matchingOffer!.endDate).toISOString().slice(0, 10),
                benefactor: params.get('benefactor'),
                title: matchingOffer!.title || '',
                description: matchingOffer!.description || ''
              });
            }
          },
          error => {
            this.snackBar.open(error?.error?.message || 'An error occurred', 'Close', {
              duration: 3000
            });
          }
        );
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const updatedOffer = new Offer(
      this.current,
      this.f['startDate'].value,
      this.f['endDate'].value,
      this.f['benefactor'].value,
      this.f['title'].value,
      this.f['description'].value,
      this.fileToUpload ? 'y' : '',
      true
    );

    if (!updatedOffer)
      return;
    this.benefactorsService.updateOffer(
      updatedOffer!.benefactor, updatedOffer
    )
      .subscribe(
        result => {
          if (this.fileToUpload) {
            this.fileUploadService.uploadOfferImage(this.fileToUpload, this.f['benefactor'].value, this.current)
              .subscribe(
                uploadResult => {
                  this.snackBar.open('Offer has been updated!', 'Close', {
                    duration: 3000
                  }).afterDismissed().subscribe(() => {
                    this.router.navigate(['/']);
                  });
                },
                uploadError => {
                  this.snackBar.open('Offer has been updated, but image upload failed.', 'Close', {
                    duration: 3000
                  });
                }
              );
          } else {
            this.snackBar.open('Offer has been updated!', 'Close', {
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
    this.route.paramMap.subscribe(params => {
      this.submitted = false;
      this.form.reset();
      this.form.patchValue({benefactor: params.get('benefactor')});
    });
  }

  onFileSelected(event: any) {
    this.fileToUpload = event.target.files[0];
  }
}

