import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BenefactorsService } from '../../services/benefactors.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Offer } from '../../models/offer';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUploadService } from '../../services/file-upload.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

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
    MatIconModule,
    MatExpansionModule,
  ],
  templateUrl: './edit-offer.component.html',
  styleUrls: ['./edit-offer.component.css'],
})
export class EditOfferComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  current: string = '';
  fileToUpload: File | null = null;
  benefactorId: string;
  imageUploaded = false;

  constructor(
    private benefactorsService: BenefactorsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private fileUploadService: FileUploadService,
    public dialogRef: MatDialogRef<EditOfferComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { offer: Offer; benefactorId: string }
  ) {
    this.form = this.formBuilder.group(
      {
        startDate: [data.offer.startDate, Validators.required],
        endDate: [data.offer.endDate, Validators.required],
        title: [
          data.offer.title,
          [Validators.required, Validators.minLength(6)],
        ],
        description: [data.offer.description, Validators.required],
        points: [data.offer.points, [Validators.required, Validators.min(1)]],
      },
      { validators: this.MustBeGreater('endDate', 'startDate') }
    );
    this.benefactorId = data.benefactorId;
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
        greater.setErrors({ mustBeGreater: true });
      } else {
        greater.setErrors(null);
      }

      return null;
    };
  }

  ngOnInit(): void {}

  allFieldsFilled(): boolean {
    return (
      this.form.get('startDate')?.value &&
      this.form.get('endDate')?.value &&
      this.form.get('title')?.value &&
      this.form.get('description')?.value &&
      this.form.get('points')?.value
    );
  }

  onSave() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const updatedOffer: Offer = {
      ...this.data.offer,
      startDate: this.form.value.startDate,
      endDate: this.form.value.endDate,
      title: this.form.value.title,
      description: this.form.value.description,
      points: this.form.value.points,
      image: this.data.offer.image,
    };

    if (!updatedOffer) return;

    this.benefactorsService
      .updateOffer(this.benefactorId, updatedOffer)
      .subscribe(
        (result) => {
          if (this.fileToUpload) {
            this.fileUploadService
              .uploadOfferImage(
                this.fileToUpload,
                this.benefactorId,
                this.data.offer._id
              )
              .subscribe(
                (uploadResult) => {
                  this.snackBar
                    .open('Offer has been updated!', 'Close', {
                      duration: 3000,
                    })
                    .afterDismissed()
                    .subscribe(() => {
                      this.dialogRef.close();
                    });
                },
                (uploadError) => {
                  this.snackBar.open(
                    'Offer has been updated, but image upload failed.',
                    'Close',
                    { duration: 3000 }
                  );
                }
              );
          } else {
            this.snackBar
              .open('Offer has been updated!', 'Close', { duration: 3000 })
              .afterDismissed()
              .subscribe(() => {
                this.dialogRef.close();
              });
          }
        },
        (error) => {
          this.snackBar.open(error.error.message, 'Close', { duration: 3000 });
        }
      );
  }

  onFileSelected(event: any) {
    this.fileToUpload = event.target.files[0];
    this.imageUploaded = true;
  }
}
