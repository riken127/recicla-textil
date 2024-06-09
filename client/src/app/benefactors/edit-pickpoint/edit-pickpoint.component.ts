import { Component, OnInit, Inject } from '@angular/core';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { BenefactorsService } from "../../services/benefactors.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Pickpoint } from "../../models/pickpoint";
import { MatButtonModule } from "@angular/material/button";
import { MatCard, MatCardContent, MatCardTitle } from "@angular/material/card";
import { MatError, MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { NgIf } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edit-pickpoint',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatError,
    MatFormField,
    MatInput,
    NgIf,
    ReactiveFormsModule,
    MatLabel,
    MatIconModule
  ],
  templateUrl: './edit-pickpoint.component.html',
  styleUrl: './edit-pickpoint.component.css'
})
export class EditPickpointComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  benefactorId: string;
  pickpoint: Pickpoint;

  constructor(
    private benefactorsService: BenefactorsService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditPickpointComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.benefactorId = data.benefactorId;
    this.pickpoint = data.pickpoint;
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      street: ['', Validators.required],
      postalCode: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
    })

    this.benefactorsService.getPickpoint(this.benefactorId, this.pickpoint._id)
      ?.subscribe(result => {
        if (result) {
          this.form.setValue({
            street: result.street,
            postalCode: result.postalCode,
            city: result.city,
            country: result.country,
          });
        }
      },
        error => {
          this.snackBar.open(error?.error?.message || 'An error occurred', 'Close', {
            duration: 3000
          })
        });
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const updatedPickpoint = new Pickpoint(
      this.pickpoint._id,
      this.f['street'].value,
      this.f['city'].value,
      this.f['postalCode'].value,
      this.f['country'].value,
      true
    )

    if (!updatedPickpoint) {
      return;
    }

    this.benefactorsService.updatePickpoint(this.benefactorId,
      this.pickpoint._id, updatedPickpoint)
      ?.subscribe(
        result => {
          this.dialogRef.close();
        },
        error => {
          this.snackBar.open(error?.error?.message || 'An error occurred', 'Close', {
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

  onDelete() {
    this.benefactorsService.deletePickpoint(this.benefactorId, this.pickpoint._id)
      ?.subscribe(
        result => {
          this.dialogRef.close();
        },
        error => {
          this.snackBar.open(error?.error?.message || 'An error occurred', 'Close', {
            duration: 3000
          });
        }
      );
  }
}
