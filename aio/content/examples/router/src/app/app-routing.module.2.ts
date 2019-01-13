// #docregion
// #docregion milestone3
import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { CrisisListComponent }   from './crisis-list/crisis-list.component';
// #enddocregion milestone3
// import { HeroListComponent }  from './hero-list/hero-list.component';  // <-- 이 줄을 삭제합니다.
// #docregion milestone3
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const appRoutes: Routes = [
  { path: 'crisis-center', component: CrisisListComponent },
// #enddocregion milestone3
  // { path: 'heroes',     component: HeroListComponent }, // <-- 이 줄을 삭제합니다.
// #docregion milestone3
  { path: '',   redirectTo: '/heroes', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- 디버그 활성화
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
// #enddocregion milestone3
