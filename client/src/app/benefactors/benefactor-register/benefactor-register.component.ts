import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatGridListModule} from '@angular/material/grid-list';
import {BenefactorsService} from '../../services/benefactors.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Benefactor} from '../../models/benefactor';
import {Address} from '../../models/address';
import {ConversionRatio} from "../../models/conversion-ratio";

@Component({
  selector: 'app-benefactor-register',
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
  templateUrl: './benefactor-register.component.html',
  styleUrls: ['./benefactor-register.component.css']
})
export class BenefactorRegisterComponent {
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    phone: new FormControl(''),
    street: new FormControl(''),
    city: new FormControl(''),
    postalCode: new FormControl(''),
    country: new FormControl(''),
    description: new FormControl('')
  });

  constructor(
    private benefactorsService: BenefactorsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const newBenefactor = new Benefactor(
        '',
        this.registerForm.controls['name'].value || '',
        new Address(
          this.registerForm.controls['street'].value || '',
          this.registerForm.controls['city'].value || '',
          this.registerForm.controls['postalCode'].value || '',
          this.registerForm.controls['country'].value || ''
        ),
        this.registerForm.controls['username'].value || '',
        this.registerForm.controls['password'].value || '',
        this.registerForm.controls['email'].value || '',
        this.registerForm.controls['description'].value || '',
        this.registerForm.controls['phone'].value || '',
        '',
        '',
        new Date(),
        new Date(),
        [],
        new ConversionRatio(10, 1000, 'g'),
        'pending'
      );

      this.benefactorsService.addBenefactor(newBenefactor)
        ?.subscribe(
          response => {
            this.snackBar.open('Benefactor Registered Successfully', 'Close', {
              duration: 3000,
            }).afterDismissed().subscribe(() => {
              this.router.navigate(['benefactors/login']);
            });
          },
          error => {
            this.snackBar.open(error.error.message, 'Close', {
              duration: 3000,
            });
          }
        );
    }
  }
}
