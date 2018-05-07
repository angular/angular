/* tslint:disable:no-unused-variable */
// #docplaster
import { Component, ViewEncapsulation } from '@angular/core';

// #docregion
@Component({
  selector: 'app-quest-summary',
  // #docregion urls
  templateUrl: './quest-summary.component.html',
  styleUrls:  ['./quest-summary.component.css']
  // #enddocregion urls
})
export class QuestSummaryComponent { }
// #enddocregion
/*
  // #docregion encapsulation.native!
  // warning: few browsers support shadow DOM encapsulation at this time
  encapsulation: ViewEncapsulation.Native
  // #enddocregion encapsulation.native!
  // #docregion encapsulation.native
  // 주의 : 모든 브라우저가 섀도우 DOM을 지원하는 것은 아닙니다.
  encapsulation: ViewEncapsulation.Native
  // #enddocregion encapsulation.native
*/
