import { Component, OnInit } from '@angular/core';
import { CommonModule} from "@angular/common";
import { BenefactorsService} from "../../services/benefactors.service";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSnackBar} from "@angular/material/snack-bar";
import { Prize} from "../../models/prize";
import { Router } from "@angular/router";

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
    MatDatepickerModule
  ],
  templateUrl: './edit-prize.component.html',
  styleUrl: './edit-prize.component.css'
})
export class EditPrizeComponent implements OnInit{
  form: FormGroup;
  submitted = false;
  current: string = '665751daf93e401bd9642dd8';
  benefactor: string = '66341183612bf8d5aff074f0';
  constructor(
    private benefactorsService: BenefactorsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
      this.form = this.formBuilder.group({
        price: [new FormControl("", Validators.required)],
        title: [new FormControl("", Validators.required)],
        description: [new FormControl("", Validators.required)],
        benefactor: [new FormControl("")]
      });
  }

  ngOnInit() {
    this.benefactorsService.getBenefactorPrizes(this.benefactor)
      ?.subscribe(result=> {
        const matchingPrize = result?.find(prize => prize?._id === this.current);

        if (matchingPrize) {
          this.form.setValue({
            price: matchingPrize!.price,
            title: matchingPrize!.title,
            benefactor: matchingPrize!.benefactor,
            description: matchingPrize!.description
          });
        }
      },
        error => {
          this.snackBar.open(error?.message || 'An error occurred', 'Close', {
            duration: 3000
          });
        });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const updatedPrize = new Prize(
      this.current,
      this.f['price'].value,
      this.f['title'].value,
      this.f['description'].value,
      '',
      this.benefactor
    );

    if (!updatedPrize)
      return;

    this.benefactorsService.updatePrize(
      updatedPrize
    )
      .subscribe(
        result => {
          this.snackBar.open('Prize has been updated', 'Close', {
            duration: 3000,
          }).afterDismissed().subscribe(() => {
            this.router.navigate(['/']);
          });
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
}
