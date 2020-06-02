// #docplaster
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router

// #docregion  redirect, routes-with-wildcard
const routes: Routes = [
  { path: 'first-component', component: FirstComponent },
  { path: 'second-component', component: SecondComponent },
  { path: '',   redirectTo: '/first-component', pathMatch: 'full' }, // redirect to `first-component`
  // #enddocregion redirect
  { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
  // #docregion redirect
];
// #enddocregion routes-with-wildcard, redirect


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
