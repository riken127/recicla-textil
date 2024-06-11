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
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { EditOfferComponent } from '../edit-offer/edit-offer.component';

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
    MatIconModule,
    MatExpansionModule,
    EditOfferComponent
  ],
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.css'],
})
export class CreateOfferComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
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
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CreateOfferComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
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

  ngOnInit() {
    this.form = this.formBuilder.group(
      {
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        title: ['', [Validators.required, Validators.minLength(6)]],
        description: ['', [Validators.required]], 
        points: ['', [Validators.required, Validators.min(1)]], 
        benefactor: [''],
      },
      { validators: this.MustBeGreater('endDate', 'startDate') }
    );
  }

  onSubmit() {
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

    this.benefactorsService.addOffer(this.benefactorId, newOffer).subscribe(
      (result) => {
        const offerId = result.result;

        if (offerId && this.fileToUpload) {
          this.fileUploadService
            .uploadOfferImage(this.fileToUpload, this.benefactorId, offerId)
            .subscribe(
              (uploadResult) => {
                this.snackBar
                  .open('Offer and image have been created!', 'Close', {
                    duration: 3000,
                  })
                  .afterDismissed()
                  .subscribe(() => {
                    this.dialogRef.close();
                  });
              },
              (uploadError) => {
                this.snackBar.open(
                  'Offer created, but image upload failed.',
                  'Close',
                  {
                    duration: 3000,
                  }
                );
              }
            );
        } else {
          this.snackBar
            .open('Offer has been created!', 'Close', {
              duration: 3000,
            })
            .afterDismissed()
            .subscribe(() => {
              this.dialogRef.close();
            });
        }
      },
      (error) => {
        this.snackBar.open(error.error.message, 'Close', {
          duration: 3000,
        });
      }
    );
  }

  onFileSelected(event: any) {
    this.fileToUpload = event.target.files[0];
    this.imageUploaded = true;
  }
}
