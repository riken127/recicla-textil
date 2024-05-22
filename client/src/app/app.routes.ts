import { Routes } from '@angular/router';
import { ListDonationsComponent } from './donations/list/list.component';
import { ListComponent } from './benefactors/list/list.component';

export const routes: Routes = [
    {
        path: 'benefactors',
        component: ListComponent
    },
  {
    path: 'list-donations',
    component: ListDonationsComponent
  }
];
