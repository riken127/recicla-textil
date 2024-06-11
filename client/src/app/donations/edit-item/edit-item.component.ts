import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DonationsService } from '../../services/donations.service';
import { Item } from '../../models/item';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {FileUploadService} from "../../services/file-upload.service";

@Component({
  selector: 'app-edit-item',
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
    MatIcon,
  ],
  templateUrl: './edit-item.component.html',
  styleUrl: './edit-item.component.css',
})
export class EditItemComponent {
  itemForm: FormGroup;
  donationId: string;
  fileToUpload: File | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: Item; donationId: string },
    private formBuilder: FormBuilder,
    private donationsService: DonationsService,
    private snackBar: MatSnackBar,
    private router: Router,
    private fileUploadService: FileUploadService
  ) {
    this.itemForm = this.formBuilder.group({
      brand: [data.item.brand, Validators.required],
      weightValue: [data.item.weight.value, Validators.required],
      weightUnit: [data.item.weight.unit, Validators.required],
      size: [data.item.size, Validators.required],
      type: [data.item.type, Validators.required],
    });
    this.donationId = data.donationId;
  }

  onSave(): void {
    if (this.itemForm.valid) {
      const updatedItem: Item = {
        ...this.data,
        _id: this.data.item._id,
        photo: this.fileToUpload ? 'y' : '',
        brand: this.itemForm.value.brand,
        weight: {
          value: this.itemForm.value.weightValue,
          unit: this.itemForm.value.weightUnit,
        },
        size: this.itemForm.value.size,
        type: this.itemForm.value.type,
      };

      this.donationsService
        .updateItem(this.data.donationId, this.data.item._id, updatedItem)
        ?.subscribe((success: boolean) => {
          if (success) {
            if (!this.fileToUpload) {
              this.snackBar.open('Item updated successfully', 'Close', {
                duration: 3000,
              });
            } else {
              this.fileUploadService.uploadItemImage(this.fileToUpload, this.data.donationId, this.data.item._id)
                .subscribe(
                  result => {
                    this.snackBar.open('Item updated successfully, image updated.', 'Close', {
                      duration: 3000,
                    })
                  },
                  error => {
                    this.snackBar.open('Error while uploading the new image.', 'Close', {
                      duration: 3000
                    });
                  }
                );
            }

            this.dialogRef.close('updated');
          } else {
            this.snackBar.open('Failed to update item', 'Close', {
              duration: 3000,
            });
          }
        });
    }
  }

  onDelete(): void {
    this.donationsService
      .deleteItem(this.donationId, this.data.item._id)
      ?.subscribe(
        (success: boolean) => {
          if (success) {
            this.snackBar.open('Item deleted successfully', 'Close', {
              duration: 3000,
            });
            this.dialogRef.close('deleted');
          } else {
            this.snackBar.open('Failed to delete item', 'Close', {
              duration: 3000,
            });
            this.dialogRef.close('failed');
          }
        },
        (error) => {
          this.snackBar.open(`Error: ${error.message}`, 'Close', {
            duration: 5000,
          });
          this.dialogRef.close('error');
        }
      );
  }

  onFileSelected(event: any) {
    this.fileToUpload = event.target.files[0];
  }
}
