import { Routes } from '@angular/router';
import { UserLoginComponent } from './users/user-login/user-login.component';
import { UserRegisterComponent } from "./users/user-register/user-register.component";
import {BenefactorLoginComponent} from "./benefactors/benefactor-login/benefactor-login.component";
import {BenefactorRegisterComponent} from "./benefactors/benefactor-register/benefactor-register.component";
import {authGuard} from "./auth.guard";
import { ListDonationsComponent } from './donations/list/list.component';
import { ListComponent } from './benefactors/list/list.component';
import { ListItemsComponent } from './donations/list-items/list-items.component';
import { CreateDonationComponent } from './donations/create-donation/create-donation.component';
import { CreateItemComponent } from './donations/create-item/create-item.component';

export const routes: Routes = [
  {
    path: 'benefactors',
    component: ListComponent,
  },
  {
    path: 'list-donations',
    component: ListDonationsComponent
  },
    {
        path: 'users/login',
        component: UserLoginComponent,
      canActivate: [authGuard]
    },
  {
    path: 'users/register',
    component: UserRegisterComponent,
    canActivate: [authGuard]
  },
  {
    path: 'benefactors/login',
    component: BenefactorLoginComponent,
    canActivate: [authGuard]
  },
  {
    path: 'benefactors/register',
    component: BenefactorRegisterComponent,
    canActivate: [authGuard]
  },
  {
    path: 'create-donation',
    component: CreateDonationComponent,
  },
  {
    path: ':id/create-item',
    component: CreateItemComponent,
  },
  {
    path: ':id/list-items',
    component: ListItemsComponent,
  }
];
