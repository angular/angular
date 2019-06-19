// #docplaster
// #docregion vc
import { AfterViewInit, ViewChild } from '@angular/core';
// #docregion lv
import { Component }                from '@angular/core';
import { CountdownTimerComponent }  from './countdown-timer.component';

// #enddocregion lv
// #enddocregion vc

//// Local variable, #timer, version
// #docregion lv
@Component({
  selector: 'app-countdown-parent-lv',
  template: `
  <h3>Countdown to Liftoff (via local variable)</h3>
  <button (click)="timer.start()">Start</button>
  <button (click)="timer.stop()">Stop</button>
  <div class="seconds">{{timer.seconds}}</div>
  <app-countdown-timer #timer></app-countdown-timer>
  `,
  styleUrls: ['../assets/demo.css']
})
export class CountdownLocalVarParentComponent { }
// #enddocregion lv

//// View Child version
// #docregion vc
@Component({
  selector: 'app-countdown-parent-vc',
  template: `
  <h3>Countdown to Liftoff (via ViewChild)</h3>
  <button (click)="start()">Start</button>
  <button (click)="stop()">Stop</button>
  <div class="seconds">{{ seconds() }}</div>
  <app-countdown-timer></app-countdown-timer>
  `,
  styleUrls: ['../assets/demo.css']
})
export class CountdownViewChildParentComponent implements AfterViewInit {

  @ViewChild(CountdownTimerComponent, {static: false})
  private timerComponent: CountdownTimerComponent;

  seconds() { return 0; }

  ngAfterViewInit() {
    // `seconds()` 메소드는 `CountdownTimerComponent.seconds`에서 다시 구현합니다.
    // 이 때 개발 모드에서 출력하는 단방향 바인딩 검사 에러를 방지하기 위해
    // 한 싸이클 기다려야 합니다.
    setTimeout(() => this.seconds = () => this.timerComponent.seconds, 0);
  }

  start() { this.timerComponent.start(); }
  stop() { this.timerComponent.stop(); }
}
// #enddocregion vc
