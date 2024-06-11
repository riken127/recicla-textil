import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user';
import { AuthenticationService } from '../../services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatButtonModule,
    MatAccordion,
    MatExpansionModule,
    MatCardModule,
    MatIcon,
  ],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
})
export class UserEditComponent implements OnInit {
  userForm: FormGroup;
  fileToUpload: File | undefined;

  constructor(
    public dialogRef: MatDialogRef<UserEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authenticationService: AuthenticationService,
    private fileUploadService: FileUploadService
  ) {
    this.userForm = this.formBuilder.group(
      {
        firstName: [data.firstName, Validators.required],
        lastName: [data.lastName, Validators.required],
        username: [data.username, Validators.required],
        password: ['', [Validators.minLength(6)]],
        confirmPassword: ['', [Validators.minLength(6)]],
        email: [data.email, [Validators.required, Validators.email]],
        phone: [data.phone, Validators.required],
        address: this.formBuilder.group({
          street: [data.address?.street || '', Validators.required],
          city: [data.address?.city || '', Validators.required],
          country: [data.address?.country || '', Validators.required],
          postalCode: [data.address?.postalCode || '', Validators.required],
        }),
      },
      { validator: this.checkPasswords }
    );
  }

  ngOnInit(): void {}

  onSave(): void {
    if (this.userForm.valid) {
      const updatedUser: User = {
        ...this.data,
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName,
        username: this.userForm.value.username,
        email: this.userForm.value.email,
        address: this.userForm.value.address,
        phone: this.userForm.value.phone,
        password: this.userForm.value.password || undefined,
        leafs: 0,
        image: this.fileToUpload ? 'y' : '',
      };

      this.usersService
        .updateUser(updatedUser)
        ?.subscribe((success: boolean) => {
          if (success) {
            if (this.fileToUpload) {
              this.fileUploadService
                .uploadUserImage(this.fileToUpload, this.data._id)
                ?.subscribe((imageSuccess) => {
                  if (imageSuccess.type === 'success') {
                    this.snackBar.open('Image uploaded successfully', 'Close', {
                      duration: 3000,
                    });
                  } else {
                    this.snackBar.open('Failed to upload image', 'Close', {
                      duration: 3000,
                    });
                  }
                });
            }
            this.dialogRef.close('updated');
            this.snackBar.open('User updated successfully', 'Close', {
              duration: 3000,
            });
          } else {
            this.snackBar.open('Failed to update user', 'Close', {
              duration: 3000,
            });
          }
        });
    }
  }

  checkPasswords(group: FormGroup) {
    let pass = group.get('password')?.value;
    let confirmPass = group.get('confirmPassword')?.value;

    return !pass || pass === confirmPass ? null : { notSame: true };
  }

  onDelete(): void {
    this.usersService
      .deleteUser(this.data._id)
      ?.subscribe((success: boolean) => {
        if (success) {
          this.authenticationService
            .logout()
            .subscribe((loggedOut: boolean) => {
              if (loggedOut) {
                this.snackBar.open(
                  'User deleted and logged out successfully',
                  'Close',
                  {
                    duration: 3000,
                  }
                );
                this.dialogRef.close('deleted');
              } else {
                this.snackBar.open(
                  'User deleted but failed to logout',
                  'Close',
                  {
                    duration: 3000,
                  }
                );
              }
            });
        } else {
          this.snackBar.open('Failed to delete user', 'Close', {
            duration: 3000,
          });
        }
      });
  }

  onFileSelected(event: any) {
    this.fileToUpload = event.target.files[0];
  }
}
