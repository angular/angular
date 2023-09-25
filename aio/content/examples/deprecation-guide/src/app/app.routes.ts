import { Routes } from '@angular/router';

export const routes: Routes = [{
  path: 'lazy',
  loadComponent: () => import('./lazy/lazy.component').then(m => m.LazyComponent)
  // If you want to use loadChildren for a child route tree, you can do this:
  // loadChildren: () => import('./lazy/lazy.routes')
}];
