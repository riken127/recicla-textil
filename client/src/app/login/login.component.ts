import { Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { UserLoginComponent } from '../users/user-login/user-login.component';
import { BenefactorLoginComponent } from '../benefactors/benefactor-login/benefactor-login.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    UserLoginComponent,
    BenefactorLoginComponent,
    MatButtonToggleModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  selectedValue: string = 'users';
}
