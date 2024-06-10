import { Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { UserRegisterComponent } from '../users/user-register/user-register.component';
import { BenefactorRegisterComponent } from '../benefactors/benefactor-register/benefactor-register.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    UserRegisterComponent,
    BenefactorRegisterComponent,
    MatButtonToggleModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  selectedValue: string = 'users';
}
