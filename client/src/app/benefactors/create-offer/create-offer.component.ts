import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BenefactorsService} from '../../services/benefactors.service';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl} from '@angular/forms';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Offer} from '../../models/offer';
import {Router} from '@angular/router';

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
  ],
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.css']
})

export class CreateOfferComponent implements OnInit {
  form!: FormGroup;
  submitted = false;

  constructor(
    private benefactorsService: BenefactorsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

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
    this.form = this.formBuilder.group({
      startDate: [new Date(Date.now()), Validators.required],
      endDate: [new Date(Date.now()), Validators.required],
      benefactor: ['66341183612bf8d5aff074f0'],
      title: ['', [Validators.required, Validators.minLength(6)]],
      description: ['']
    }, {
      validators: this.MustBeGreater('endDate', 'startDate')
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

    this.benefactorsService.addOffer(this.f['benefactor'].value, new Offer('',
      this.f['startDate'].value,
      this.f['endDate'].value,
      this.f['benefactor'].value,
      this.f['title'].value,
      this.f['description'].value,
      '',
      true))
      .subscribe(
        result => {
          this.snackBar.open('Offer has been created!', 'Close', {
            duration: 3000,
          }).afterDismissed().subscribe(() => {
            this.router.navigate(['/']);
          });
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
