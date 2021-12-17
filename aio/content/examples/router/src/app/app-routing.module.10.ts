// #docplaster
import {Injectable, NgModule} from '@angular/core';
import {PageTitleStrategy, RouterModule, Routes} from '@angular/router';  // CLI imports router

// #docregion page-title
const routes: Routes = [
  {
    path: 'first-component',
    title: 'First component',
    component: FirstComponent,  // this is the component with the <router-outlet> in the template
    children: [
      {
        path: 'child-a',  // child route path
        title: ResolvedChildATitle,
        component: ChildAComponent,  // child route component that the router renders
      },
      {
        path: 'child-b',
        title: 'child b',
        component: ChildBComponent,  // another child route component that the router renders
      },
    ],
  },
];

@Injectable({providedIn: 'root'})
export class ResolvedChildATitle {
  resolve() {
    return Promise.resolve('child a');
  }
}
// #enddocregion page-title


// #docregion custom-page-title
export class TemplatePageTitleStrategy extends PageTitleStrategy {
  override setTitle(title: string) {
    this.title.setTitle(`My Application | ${title}`);
  }
}

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {provide: PageTitleStrategy, useClass: TemplatePageTitleStrategy},
  ]
})
export class AppRoutingModule {
}
// #enddocregion custom-page-title
