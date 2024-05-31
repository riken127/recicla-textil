import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatGridListModule} from "@angular/material/grid-list";
import {AuthenticationService} from "../../services/authentication.service";
import {Router} from "@angular/router";
import {MatSnackBar} from '@angular/material/snack-bar';
import {CookieService} from "../../services/cookie.service";

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatGridListModule
  ],
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  constructor(
    protected authenticationService: AuthenticationService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cookieService: CookieService
  ) {
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authenticationService.authenticateUser({
        username: this.loginForm.value.username,
        password: this.loginForm.value.password
      })
        .subscribe(response => {
          if (response.statusCode === 200) {
            this.router.navigate(['/']);
          } else {
            this.showErrorMessage("An error occurred during login.");
          }
        }, error => {
          if (error.status === 401) {
            this.showErrorMessage("Invalid username or password.");
          } else {
            this.showErrorMessage("An error occurred: " + error.message);
          }
        });
    }
  }

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
    });
  }
}
