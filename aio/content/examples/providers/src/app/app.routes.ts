import { Route } from '@angular/router';

import { UsersComponent } from './users.component';

export const ROUTES: Route[] = [
  {path: '', pathMatch: 'full', component: UsersComponent},
  // Lazy-load the admin routes.
  {path: 'admin', loadChildren: () => import('./admin/admin.routes').then(mod => mod.ADMIN_ROUTES)}
];
