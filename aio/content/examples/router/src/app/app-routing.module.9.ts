// #docplaster
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router

// #docregion child-routes
const routes: Routes = [
  {
    path: 'first-component',
    component: FirstComponent, // 이 컴포넌트 템플릿에 <router-outlet>이 존재합니다.
    children: [
      {
        path: 'child-a', // 자식 라우팅 규칙과 연결되는 주소
        component: ChildAComponent, // 라우터가 렌더링하는 자식 컴포넌트
      },
      {
        path: 'child-b',
        component: ChildBComponent, // 또다른 자식 컴포넌트
      },
    ],
  },
];
// #enddocregion child-routes


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


