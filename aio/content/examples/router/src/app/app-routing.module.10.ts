// #docplaster
import {NgModule} from '@angular/core';
import {BasePageTitleStrategy, DocumentPageTitleStrategy, PageTitleStrategy, RouterModule, RouterStateSnapshot, Routes} from '@angular/router';  // CLI imports router

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
export class TakeLastPageTitleStrategy extends BasePageTitleStrategy {
  setTitle(route: RouterStateSnapshot) {
    const pageTitles = this.collectPageTitles(route);
    if (pageTitles.length > 0) {
      const title = pageTitles[pageTitles.length - 1];
      this.document.title = title;
    }
  }
}
// #enddocregion custom-page-title

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  // #docregion page-title
  providers: [{provide: PageTitleStrategy, useClass: DocumentPageTitleStrategy}]
  // #enddocregion page-title
})
export class AppRoutingModule {
}
