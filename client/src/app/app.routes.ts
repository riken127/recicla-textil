import {Routes} from '@angular/router';
import {UserLoginComponent} from './users/user-login/user-login.component';
import {UserRegisterComponent} from "./users/user-register/user-register.component";
import {ListComponent} from './benefactors/list/list.component';
import {ListDonationsComponent} from './donations/list/list.component';
import {CreateOfferComponent} from './benefactors/create-offer/create-offer.component';
import {EditOfferComponent} from './benefactors/edit-offer/edit-offer.component';
import {DisableOfferComponent} from './benefactors/disable-offer/disable-offer.component';

export const routes: Routes = [
  {
    path: 'users/login',
    component: UserLoginComponent,
  },
  {
    path: 'users/register',
    component: UserRegisterComponent,
  },
  {
    path: 'benefactors',
    component: ListComponent
  },
  {
    path: 'list-donations',
    component: ListDonationsComponent
  },
  {
    path: 'create-offer',
    component: CreateOfferComponent
  },
  {
    path: 'edit-offer',
    component: EditOfferComponent
  },
  {
    path: 'disable-offer',
    component: DisableOfferComponent
  }
];
