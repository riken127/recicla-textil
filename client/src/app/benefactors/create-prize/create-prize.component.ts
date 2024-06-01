import {Component, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-create-prize',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatGridListModule,
    MatDatepickerModule
  ],
  templateUrl: './create-prize.component.html',
  styleUrl: './create-prize.component.css'
})
export class CreatePrizeComponent implements OnInit {
  form!: FormGroup;
  submitted = false;

  constructor(
    private benefactorsService: BenefactorsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.form = this.formBuilder.group({
        price: [new FormControl("", Validators.required)],
        title: [new FormControl("", Validators.required)],
        description: [new FormControl("")],
        image: [new FormControl("")],
        benefactor: [params.get('id')],
      });
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.benefactorsService.addPrize(new Prize('',
      this.f['price'].value,
      this.f['title'].value,
      this.f['description'].value,
      '',
      this.f['benefactor'].value))
      .subscribe(
        result => {
          this.snackBar.open('Prize has been created', 'Close', {
            duration: 3000,
          }).afterDismissed().subscribe(() => {
            this.router.navigate(['/']);
          })
        },
        error => {
          this.snackBar.open(error.message, 'Close', {
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
