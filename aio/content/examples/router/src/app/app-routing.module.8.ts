// #docplaster
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router

// #docregion routes, routes-with-wildcard, redirect
const routes: Routes = [
  { path: 'first-component', component: FirstComponent },
  { path: 'second-component', component: SecondComponent },
  // #enddocregion routes
  { path: '',   redirectTo: '/first-component', pathMatch: 'full' }, // redirect to `first-component`
  { path: '**', component: FirstComponent },
  // #enddocregion redirect
  { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
  // #docregion routes
  // #docregion redirect
];
// #enddocregion routes, routes-with-wildcard, redirect


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


