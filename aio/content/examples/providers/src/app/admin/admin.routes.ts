import { Route } from '@angular/router';

import { AdminUserService } from './admin-user.service';
import { AdminHomeComponent } from './admin-home.component';
import { AdminUsersComponent } from './admin-users.component';

export const ADMIN_ROUTES: Route[] = [{
  path: '',
  pathMatch: 'prefix',
  providers: [
    AdminUserService,
  ],
  children: [
    {path: '', component: AdminHomeComponent},
    {path: 'users', component: AdminUsersComponent},
  ],
}];
