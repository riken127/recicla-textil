import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatGridListModule } from "@angular/material/grid-list";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UsersService } from "../../services/users.service";
import { User } from "../../models/user";
import { Address } from "../../models/address";
import { FileUploadService } from '../../services/file-upload.service';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatGridListModule,
    MatExpansionModule
  ],
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent {
  fileToUpload: File | undefined;
  registerForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    phone: new FormControl(''),
    street: new FormControl(''),
    city: new FormControl(''),
    postalCode: new FormControl(''),
    country: new FormControl('')
  });

  constructor(
    protected userService: UsersService,
    private router: Router,
    private snackBar: MatSnackBar,
    private fileUploadService: FileUploadService
  ) {
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const newUser = new User(
        '',
        this.registerForm.controls['lastName'].value || '',
        this.registerForm.controls['firstName'].value || '',
        this.registerForm.controls['username'].value || '',
        this.registerForm.controls['email'].value || '',
        this.registerForm.controls['password'].value || '',
        this.fileToUpload ? 'y' : '',
        new Date(),
        new Date(),
        [],
        new Address(
          this.registerForm.controls['street'].value || '',
          this.registerForm.controls['city'].value || '',
          this.registerForm.controls['postalCode'].value || '',
          this.registerForm.controls['country'].value || ''
        ),
        this.registerForm.controls['phone'].value || '',
        0,
        'en',
        [],
        true,
        true,
      );

      this.userService.addUser(newUser)
        ?.subscribe(
          response => {
            if (this.fileToUpload) {
              this.fileUploadService.uploadUserImage(this.fileToUpload!, response).subscribe(
                () => {
                  this.snackBar.open('User Registered Successfully', 'Close', {
                    duration: 3000,
                  }).afterDismissed().subscribe(() => {
                    this.router.navigate(['/login']);
                  });
                },
                error => {
                  this.snackBar.open(error.message, 'Close', {
                    duration: 3000,
                  });
                }
              );
            } else {
              this.snackBar.open('User Registered Successfully', 'Close', {
                duration: 3000,
              }).afterDismissed().subscribe(() => {
                this.router.navigate(['/login']);
              });
            }

          },
          error => {
            this.snackBar.open(error.error.message, 'Close', {
              duration: 3000,
            });
          }
        );
    }
  }

  login() {
    this.router.navigate(['/login']);
  }

  onFileSelected(event: any) {
    this.fileToUpload = event.target.files[0];
  }
}
