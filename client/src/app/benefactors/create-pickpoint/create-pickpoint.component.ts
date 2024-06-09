import {Component, OnInit, Inject} from '@angular/core';
import {MatCard, MatCardContent, MatCardModule, MatCardTitle} from "@angular/material/card";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatError, MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {CommonModule, NgIf} from "@angular/common";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {BenefactorsService} from "../../services/benefactors.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import {Pickpoint} from "../../models/pickpoint";
import {MatInputModule} from "@angular/material/input";
import {MatGridListModule} from "@angular/material/grid-list";
import { Benefactor } from '../../models/benefactor';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-pickpoint',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatGridListModule,
  ],
  templateUrl: './create-pickpoint.component.html',
  styleUrl: './create-pickpoint.component.css'
})
export class CreatePickpointComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  benefactorId: string;

  constructor(
    private benefactorsService: BenefactorsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<CreatePickpointComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.benefactorId = data.benefactorId;
 } 

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
      this.form = this.formBuilder.group({
        street: ["", Validators.required],
        city: ["", Validators.required],
        country: ["", Validators.required],
        postalCode: ["", Validators.required],
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

      this.benefactorsService.addPickpoint(this.benefactorId, new Pickpoint(
        '',
        this.f['street'].value,
        this.f['city'].value,
        this.f['postalCode'].value,
        this.f['country'].value,
        true
      ))
        ?.subscribe(result => {
          this.dialogRef.close();
        },
          error => {
          this.snackBar.open(error.error.message, 'Close', {
            duration: 3000
          });
        });
    
    this.onReset();
  }

  onReset() {
    this.submitted = false;
    this.form.reset();
  }


}
