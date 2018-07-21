// #docregion
import { Component } from '@angular/core';
// #docregion example
/* avoid */

// UsersComponent는 관리자 모듈의 컴포넌트입니다.
// `users`만으로는 관리자용 기능인지 알 수 없습니다.
@Component({
  selector: 'users'
})
export class UsersComponent {}
// #enddocregion example
