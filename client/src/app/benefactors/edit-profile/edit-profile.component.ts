import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BenefactorsService } from '../../services/benefactors.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Benefactor } from '../../models/benefactor';
import {FileUploadService} from "../../services/file-upload.service";

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatIconModule,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  benefactor: Benefactor;
  bannerToUpload: File | null = null;
  logoToUpload: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: BenefactorsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { benefactor: Benefactor },
    private fileUploadService: FileUploadService
  ) {
    this.benefactor = data.benefactor;
  }

  get f() {
    return this.form.controls;
  }

  get addressControls() {
    return (this.form.get('address') as FormGroup).controls;
  }

  get conversionRatioControls() {
    return (this.form.get('conversionRatio') as FormGroup).controls;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      address: this.formBuilder.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['', Validators.required],
      }),
      username: ['', Validators.required],
      newPassword: ['',[Validators.minLength(6)]],
      confirmPassword: ['',[Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      description: [''],
      phone: ['', Validators.required],
      logo: [''],
      banner: [''],
      conversionRatio: this.formBuilder.group({
        points: ['', Validators.required],
        value: ['', Validators.required]
      })
    },{ validator: this.checkPasswords });
    this.form.patchValue(this.benefactor);
  }

  checkPasswords(group: FormGroup) {
    let pass = group.get('newPassword')?.value;
    let confirmPass = group.get('confirmPassword')?.value;

    return !pass || pass === confirmPass ? null : { notSame: true };
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const benefactorData = this.form.value;
    benefactorData.conversionRatio.weightMetric = 'g';
    benefactorData['_id'] = this.benefactor._id;

    if (this.form.value.newPassword && this.form.value.newPassword === this.form.value.confirmPassword) {
      benefactorData['password'] = this.form.value.newPassword;
    }

    benefactorData.image = (this.logoToUpload || this.bannerToUpload) ?  'y' : '';

    this.service.updateBenefactor(benefactorData)?.subscribe(
      response => {
        this.snackBar.open('Profile updated successfully', 'Close', {
          duration: 3000
        })
      },
      error => {
        this.snackBar.open('Failed to update profile', 'Close', {
          duration: 3000
        });
      }
    );

    if (this.logoToUpload) {
      this.fileUploadService.uploadBenefactorLogo(this.logoToUpload, this.benefactor._id)
        ?.subscribe(
        uploadResult => {
          console.log(uploadResult)
          this.snackBar.open('Benefactor logo has been updated', 'Close', {
            duration: 3000
          })
        },
        uploadError => {
          console.log(uploadError)
          this.snackBar.open('Failed to upload logo', 'Close', {
            duration: 3000
          })
        }
      );
    }

    if (this.bannerToUpload) {
      this.fileUploadService.uploadBenefactorBanner(this.bannerToUpload, this.benefactor._id).subscribe(
        uploadResult => {
          this.snackBar.open('Benefactor banner has been updated', 'Close', {
            duration: 3000
          }).afterDismissed().subscribe(() => {
              this.dialogRef.close();
          })
        },
        uploadError => {
          this.snackBar.open('Failed to upload banner', 'Close', {
            duration: 3000
          })
        }
      );
    }

    this.onReset();
    this.dialogRef.close();
  }

  onReset() {
    this.submitted = false;
    this.form.reset();
  }

  onDelete() {
    this.service.deleteBenefactor(this.benefactor._id)?.subscribe(
      response => {
        this.snackBar.open('Profile deleted successfully', 'Close', {
          duration: 3000
        }).afterDismissed().subscribe(() => {
          this.router.navigate(['/benefactors']);
          this.dialogRef.close();
        });
      },
      error => {
        this.snackBar.open('Failed to delete profile', 'Close', {
          duration: 3000
        });
      });
  }

  onBannerSelected(event: any) {
    this.bannerToUpload = event.target.files[0];
  }

  onLogoSelected(event: any) {
    this.logoToUpload = event.target.files[0];
  }
}
