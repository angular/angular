// #docregion
import { Component } from '@angular/core';
// #docregion example
/* avoid */

// HeroComponent는 Tour of Heroes 프로젝트의 컴포넌트입니다.
// `hero` 셀렉터만으로는 프로젝트와의 관계를 알 수 없습니다.
@Component({
  selector: 'hero'
})
export class HeroComponent {}
// #enddocregion example
