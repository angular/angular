import {Routes} from '@angular/router';

export const appRoutes: Routes = [
  {
    path: 'lazy',
    loadChildren: () => import('./lazy/lazy.routes').then((routes) => routes.lazyRoutes),
  },
];
