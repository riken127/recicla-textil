import {Routes} from '@angular/router';
import {authGuard} from "./auth.guard";
import {ListComponent} from './benefactors/list/list.component';
import {ListItemsComponent} from './donations/list-items/list-items.component';
import {CreatePrizeComponent} from "./benefactors/create-prize/create-prize.component";
import {EditPrizeComponent} from "./benefactors/edit-prize/edit-prize.component";
import {DisablePrizeComponent} from "./benefactors/disable-prize/disable-prize.component";
import {CreateOfferComponent} from "./benefactors/create-offer/create-offer.component";
import {EditOfferComponent} from "./benefactors/edit-offer/edit-offer.component";
import {DisableOfferComponent} from "./benefactors/disable-offer/disable-offer.component";
import {ProfileComponent} from './benefactors/profile/profile.component';
import {AllOffersComponent} from "./benefactors/all-offers/all-offers.component";
import {AllPostsComponent} from "./benefactors/all-posts/all-posts.component";
import {AllPrizesComponent} from "./benefactors/all-prizes/all-prizes.component";
import {UserProfileComponent} from './users/user-profile/user-profile.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  {
    path: 'benefactors',
    component: ListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'prizes',
    component: AllPrizesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'offers',
    component: AllOffersComponent,
    canActivate: [authGuard]
  },
  {
    path: 'posts',
    component: AllPostsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'benefactors/profile/:id',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
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
  },
  {
    path: 'user-profile',
    component: UserProfileComponent
  },
];
