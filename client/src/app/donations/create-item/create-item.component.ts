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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Item, Weight } from '../../models/item';
import { DonationsService } from '../../services/donations.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import {FileUploadService} from "../../services/file-upload.service";

@Component({
  selector: 'app-create-item',
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
  ],
  templateUrl: './create-item.component.html',
  styleUrl: './create-item.component.css',
})
export class CreateItemComponent {
  itemForm: FormGroup = this.formBuilder.group({
    brand: ['', Validators.required],
    weightValue: ['', [Validators.required, Validators.min(1)]],
    weightUnit: ['', Validators.required],
    size: ['', Validators.required],
    type: ['', Validators.required],
    photo: [''],
  });
  donationId: string;
  fileToUpload: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private donationsService: DonationsService,
    public dialogRef: MatDialogRef<CreateItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fileUploadService: FileUploadService
  ) {
    this.donationId = data.donationId;
  }

  onSubmit() {
    if (this.itemForm.valid && this.donationId) {
      const { brand, weightValue, weightUnit, size, type, photo } =
        this.itemForm.value;
      const weight = new Weight(weightValue, weightUnit);
      const item = new Item('', brand, weight, size, type, this.fileToUpload ? 'y' : '');

      this.donationsService
        .addItem(this.donationId, item)
        ?.subscribe((success) => {
          if (success.id) {
            if (!this.fileToUpload) {
              this.snackBar.open('Item added successfully', 'Close', {
                duration: 2000,
              });
            } else {
              this.fileUploadService.uploadItemImage(this.fileToUpload,this.donationId, success.id)
                .subscribe(
                  uploadResult => {
                    this.snackBar.open('Item created and image uploaded successfully', 'Close', {
                      duration: 3000
                    });
                  },
                  error => {
                    this.snackBar.open('Error while uploading the image.', 'Close', {
                      duration: 3000
                    });
                  }
                )
            }

            this.router.navigate([this.donationId, 'list-items']);
            this.dialogRef.close();
          } else {
            this.snackBar.open('Error adding item', 'Close', { duration: 2000 });
          }
        });
    }
  }

  onFileSelected(event: any) {
    this.fileToUpload = event.target.files[0];
  }
}
