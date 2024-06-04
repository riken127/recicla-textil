import {Routes} from '@angular/router';
import {UserLoginComponent} from './users/user-login/user-login.component';
import {UserRegisterComponent} from "./users/user-register/user-register.component";
import {BenefactorLoginComponent} from "./benefactors/benefactor-login/benefactor-login.component";
import {BenefactorRegisterComponent} from "./benefactors/benefactor-register/benefactor-register.component";
import {authGuard} from "./auth.guard";
import {ListDonationsComponent} from './donations/list/list-donations.component';
import {ListComponent} from './benefactors/list/list.component';
import {ListItemsComponent} from './donations/list-items/list-items.component';
import {CreateDonationComponent} from './donations/create-donation/create-donation.component';
import {CreateItemComponent} from './donations/create-item/create-item.component';
import {ListWaitingDonationsComponent} from './donations/list-waiting-donations/list-waiting-donations.component';
import {CreatePrizeComponent} from "./benefactors/create-prize/create-prize.component";
import {EditPrizeComponent} from "./benefactors/edit-prize/edit-prize.component";
import {DisablePrizeComponent} from "./benefactors/disable-prize/disable-prize.component";
import {CreateOfferComponent} from "./benefactors/create-offer/create-offer.component";
import {EditOfferComponent} from "./benefactors/edit-offer/edit-offer.component";
import {DisableOfferComponent} from "./benefactors/disable-offer/disable-offer.component";
import {ProfileComponent} from './benefactors/profile/profile.component';
import {AllOffersComponent} from "./benefactors/all-offers/all-offers.component";

export const routes: Routes = [
  {
    path: 'benefactors',
    component: ListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'offers',
    component: AllOffersComponent,
    canActivate: [authGuard]
  },
  {
    path: 'benefactors/profile/:id',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'list-user-donations',
    component: ListDonationsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'users/login',
    component: UserLoginComponent,
  },
  {
    path: 'users/register',
    component: UserRegisterComponent,
  },
  {
    path: 'benefactors/login',
    component: BenefactorLoginComponent,
  },
  {
    path: 'benefactors/register',
    component: BenefactorRegisterComponent,
  },
  {
    path: ':id/list-benefactor-donations',
    component: ListWaitingDonationsComponent,
    canActivate: [authGuard]
  },
  {
    path: ':id/create-donation',
    component: CreateDonationComponent,
    canActivate: [authGuard]
  },
  {
    path: ':id/create-item',
    component: CreateItemComponent,
    canActivate: [authGuard]
  },
  {
    path: ':id/list-items',
    component: ListItemsComponent,
    canActivate: [authGuard]
  },
  {
    path: ':id/create-prize',
    component: CreatePrizeComponent,
    canActivate: [authGuard]
  },
  {
    path: ':benefactor/:prize/edit-prize',
    component: EditPrizeComponent,
    canActivate: [authGuard]
  },
  {
    path: ':id/disable-prize',
    component: DisablePrizeComponent,
    canActivate: [authGuard]
  },
  {
    path: ':id/create-offer',
    component: CreateOfferComponent,
    canActivate: [authGuard]
  },
  {
    path: ':benefactor/:offer/edit-offer',
    component: EditOfferComponent,
    canActivate: [authGuard]
  },
  {
    path: ':benefactor/:offer/disable-offer',
    component: DisableOfferComponent,
    canActivate: [authGuard]
  }
];
