// #docregion progressbar-component
import { Component, Input } from '@angular/core';

/**
 * 진행률 표시 UI 컴포넌트 예제
 */
@Component({
  selector: 'app-example-progressbar',
  template: `<div class="bar" [style.width.%]="value"></div>`,
  styleUrls: ['./progress-bar.component.css'],
  host: {
    // 컴포넌트의 role은 "progressbar"로 지정합니다.
    role: 'progressbar',

    // 진행률의 최소값과 최대값을 지정합니다.
    'aria-valuemin': '0',
    'aria-valuemax': '100',

    // 현재값을 ARIA 어트리뷰트에 바인딩합니다.
    '[attr.aria-valuenow]': 'value',
  }
})
export class ExampleProgressbarComponent  {
  /** 현재 진행률 */
  @Input() value = 0;
}

// #enddocregion progressbar-component
