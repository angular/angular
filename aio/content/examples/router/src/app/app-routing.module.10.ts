// #docplaster
import {NgModule} from '@angular/core';
import {PageTitleStrategy, RouterModule, Routes} from '@angular/router';  // CLI imports router

// #docregion page-title
const routes: Routes = [
  {
    path: 'first-component',
    component: FirstComponent,  // this is the component with the <router-outlet> in the template
    data: {pageTitle: 'First component'},
    children: [
      {
        path: 'child-a',             // child route path
        component: ChildAComponent,  // child route component that the router renders
        data: {pageTitle: 'child a'},
      },
      {
        path: 'child-b',
        component: ChildBComponent,  // another child route component that the router renders
        data: {pageTitle: 'child b'},
      },
    ],
  },
];
// #enddocregion page-title


// #docregion custom-page-title
export class TemplatePageTitleStrategy extends PageTitleStrategy {
  override setTitle(title: string) {
    this.title.setTitle(`My Application | ${title}`);
  }
}
// #enddocregion custom-page-title

// #docregion page-title
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(title: PageTitleStrategy) {}
}
// #enddocregion page-title
