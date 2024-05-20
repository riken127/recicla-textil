import { Routes } from '@angular/router';
import { UserLoginComponent } from './users/user-login/user-login.component';
import {UserRegisterComponent} from "./users/user-register/user-register.component";


export const routes: Routes = [
    {
        path: 'users/login',
        component: UserLoginComponent,
    },
  {
    path: 'users/register',
    component: UserRegisterComponent,
  }
];
