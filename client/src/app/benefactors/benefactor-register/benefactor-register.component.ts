import {Component} from '@angular/core';
import {MatDialogRef } from '@angular/material/dialog';
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
import {FileUploadService} from "../../services/file-upload.service";
import { MatExpansionModule } from '@angular/material/expansion';
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
    MatExpansionModule
  ],
  templateUrl: './benefactor-register.component.html',
  styleUrls: ['./benefactor-register.component.css']
})
export class BenefactorRegisterComponent {
  bannerToUpload: File | null = null;
  logoToUpload: File | null = null;
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
    private snackBar: MatSnackBar,
    private fileUploadService: FileUploadService,
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
        this.logoToUpload ? 'y' : '',
        this.bannerToUpload ? 'y' : '',
        new Date(),
        new Date(),
        [],
        new ConversionRatio(10, 1000, 'g'),
        'pending'
      );

      this.benefactorsService.addBenefactor(newBenefactor)
        ?.subscribe(
          response => {
            if (this.logoToUpload) {
              this.fileUploadService.uploadBenefactorLogo(this.logoToUpload, response)
                ?.subscribe(
                uploadResult => {
                  this.snackBar.open('Benefactor logo has been updated', 'Close', {
                    duration: 3000
                  })
                },
                uploadError => {
                  this.snackBar.open('Failed to upload logo', 'Close', {
                    duration: 3000
                  })
                }
              );
            }
        
            if (this.bannerToUpload) {
              this.fileUploadService.uploadBenefactorBanner(this.bannerToUpload, response).subscribe(
                uploadResult => {
                  this.snackBar.open('Benefactor banner has been updated', 'Close', {
                    duration: 3000
                  })
                },
                uploadError => {
                  this.snackBar.open('Failed to upload banner', 'Close', {
                    duration: 3000
                  })
                }
              );
            }
            this.snackBar.open('Benefacor successfully registered', 'Close', {
              duration: 3000
            })
            this.login()
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

  onBannerSelected(event: any) {
    this.bannerToUpload = event.target.files[0];
  }

  onLogoSelected(event: any) {
    this.logoToUpload = event.target.files[0];
  }
}
