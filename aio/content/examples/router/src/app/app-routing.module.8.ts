// #docplaster
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router

// #docregion routes, routes-with-wildcard, redirect
const routes: Routes = [
  { path: 'first-component', component: FirstComponent },
  { path: 'second-component', component: SecondComponent },
  // #enddocregion routes, routes-with-wildcard
  { path: '',   redirectTo: '/first-component', pathMatch: 'full' }, // redirect to `first-component`
  // #docregion routes-with-wildcard
  { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
  // #docregion routes
];
// #enddocregion routes, routes-with-wildcard, redirect


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


