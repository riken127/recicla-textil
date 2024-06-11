import {Component, Inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {BenefactorsService} from "../../services/benefactors.service";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Prize} from "../../models/prize";
import {ActivatedRoute, Router} from "@angular/router";
import {FileUploadService} from "../../services/file-upload.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-edit-prize',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatGridListModule,
    MatDatepickerModule,
    MatIcon
  ],
  templateUrl: './edit-prize.component.html',
  styleUrl: './edit-prize.component.css'
})
export class EditPrizeComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  fileToUpload: File | null = null;
  benefactorId: string;
  prize: Prize;

  constructor(
    private benefactorsService: BenefactorsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private fileUploadService: FileUploadService,
    public dialogRef: MatDialogRef<EditPrizeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.benefactorId = data.benefactorId;
    this.prize = data.prize
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.form = this.formBuilder.group({
        price: [this.prize.price, Validators.required],
        title: [this.prize.title, Validators.required],
        description: [this.prize.description, Validators.required],
        benefactor: [this.benefactorId, Validators.required],
      });
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

      const updatedPrize = new Prize(
        this.prize._id,
        this.f['price'].value,
        this.f['title'].value,
        this.f['description'].value,
        '',
        this.benefactorId
        );

    if (!updatedPrize)
      return;

    this.benefactorsService.updatePrize(
      updatedPrize
    )
      .subscribe(
        result => {
          if (this.fileToUpload) {
            this.fileUploadService.uploadPrizeImage(
              this.fileToUpload,
              this.benefactorId,
              updatedPrize._id
            )
              .subscribe(
                uploadResult => {
                  this.snackBar.open('Prize and image have been updated', 'Close', {
                    duration: 3000
                  })
                },
                uploadError => {
                  this.snackBar.open('Prize created, but image upload failed.', 'Close', {
                    duration: 3000
                  })
                }
              );
          } else {
            this.snackBar.open('Prize has been updated', 'Close', {
              duration: 3000,
            })
          }
        },
        error => {
          this.snackBar.open(error?.message || 'An error occurred', 'Close', {
            duration: 3000
          });
        }
      );
    this.onReset();
  }

  onReset() {
      this.submitted = false;
      this.form.reset();
  }

  onFileSelected(event: any) {
    this.fileToUpload = event.target.files[0];
  }

  onDelete() {
    this.benefactorsService.deletePrize(this.prize._id)
      ?.subscribe(
        result => {
          this.dialogRef.close();
        },
        error => {
          this.snackBar.open(error?.error?.message || 'An error has occurred', 'Close', {
            duration: 3000
          })
        }
      )
  }
}
