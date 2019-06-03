// #docplaster
// #docregion
import { NgModule } from '@angular/core';
import { Routes, RouterModule, UrlSegment } from '@angular/router';
import { AngularJSComponent } from './angular-js/angular-js.component';
import { HomeComponent } from './home/home.component';
import { App404Component } from './app404/app404.component';

// Match any URL that starts with `users`
// #docregion matcher
export function isAngularJSUrl(url: UrlSegment[]) {
  return url.length > 0 && url[0].path.startsWith('users') ? ({consumed: url}) : null;
}
// #enddocregion matcher

export const routes: Routes = [
  // Routes rendered by Angular
  { path: '', component: HomeComponent },

  // AngularJS routes
  { matcher: isAngularJSUrl, component: AngularJSComponent },

  // Catch-all route
  { path: '**', component: App404Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
