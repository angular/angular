// #docplaster
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router

// #docregion routes, routes-with-wildcard, redirect
const routes: Routes = [
  { path: 'first-component', component: FirstComponent },
  { path: 'second-component', component: SecondComponent },
  // #enddocregion routes, routes-with-wildcard
  { path: '',   redirectTo: '/first-component', pathMatch: 'full' }, // `first-component` 주소로 리다이렉트 합니다.
  // #docregion routes-with-wildcard
  { path: '**', component: PageNotFoundComponent },  // 404 에러 화면을 표시하는 와일드카드 라우팅 규칙
  // #docregion routes
];
// #enddocregion routes, routes-with-wildcard, redirect


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


