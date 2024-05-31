import { Routes } from '@angular/router';
import { UserLoginComponent } from './users/user-login/user-login.component';
import { UserRegisterComponent } from "./users/user-register/user-register.component";
import {BenefactorLoginComponent} from "./benefactors/benefactor-login/benefactor-login.component";
import {BenefactorRegisterComponent} from "./benefactors/benefactor-register/benefactor-register.component";
import {authGuard} from "./auth.guard";
import { ListDonationsComponent } from './donations/list/list-donations.component';
import { ListComponent } from './benefactors/list/list.component';
import { ListItemsComponent } from './donations/list-items/list-items.component';
import { CreateDonationComponent } from './donations/create-donation/create-donation.component';
import { CreateItemComponent } from './donations/create-item/create-item.component';
import { ListWaitingDonationsComponent } from './donations/list-waiting-donations/list-waiting-donations.component';
import {CreatePrizeComponent} from "./benefactors/create-prize/create-prize.component";
import {EditPrizeComponent} from "./benefactors/edit-prize/edit-prize.component";
import {DisablePrizeComponent} from "./benefactors/disable-prize/disable-prize.component";
import { CreateOfferComponent} from "./benefactors/create-offer/create-offer.component";
import { EditOfferComponent} from "./benefactors/edit-offer/edit-offer.component";
import { DisableOfferComponent} from "./benefactors/disable-offer/disable-offer.component";
import { ProfileComponent } from './benefactors/profile/profile.component';

export const routes: Routes = [
  {
    path: 'benefactors',
    component: ListComponent,
  },
  {
    path: 'benefactors/:id',
    component: ProfileComponent
  },
  {
    path: 'list-user-donations',
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
    path: ':id/list-benefactor-donations',
    component: ListWaitingDonationsComponent,
  },
  {
    path: ':id/create-donation',
    component: CreateDonationComponent,
  },
  {
    path: ':id/create-item',
    component: CreateItemComponent,
  },
  {
    path: ':id/list-items',
    component: ListItemsComponent,
  },
  {
    path: 'create-prize',
    component: CreatePrizeComponent,
  },
  {
    path: 'edit-prize',
    component: EditPrizeComponent,
  },
  {
    path: 'delete-prize',
    component: DisablePrizeComponent,
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
