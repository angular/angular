// #docplaster
// #docregion
import { AfterContentChecked, AfterContentInit, Component, ContentChild } from '@angular/core';

import { LoggerService }  from './logger.service';

//////////////////
@Component({
  selector: 'app-child',
  template: '<input [(ngModel)]="hero">'
})
export class ChildComponent {
  hero = 'Magneta';
}

//////////////////////
@Component({
  selector: 'after-content',
// #docregion template
  template: `
    <div>-- projected content begins --</div>
      <ng-content></ng-content>
    <div>-- projected content ends --</div>`
// #enddocregion template
   + `
    <p *ngIf="comment" class="comment">
      {{comment}}
    </p>
  `
})
// #docregion hooks
export class AfterContentComponent implements AfterContentChecked, AfterContentInit {
  private prevHero = '';
  comment = '';

  // `ChildComponent` 타입의 자식 컴포넌트를 참조합니다.
  @ContentChild(ChildComponent, {static: false}) contentChild: ChildComponent;

// #enddocregion hooks
  constructor(private logger: LoggerService) {
    this.logIt('AfterContent constructor');
  }

// #docregion hooks
  ngAfterContentInit() {
    // contentChild는 컨텐츠가 모두 초기화된 이후에 값이 할당됩니다.
    this.logIt('AfterContentInit');
    this.doSomething();
  }

  ngAfterContentChecked() {
    // 컨텐츠에서 변화감지 로직이 동작하면 contentChild가 갱신됩니다.
    if (this.prevHero === this.contentChild.hero) {
      this.logIt('AfterContentChecked (no change)');
    } else {
      this.prevHero = this.contentChild.hero;
      this.logIt('AfterContentChecked');
      this.doSomething();
    }
  }
// #enddocregion hooks
// #docregion do-something

  // This surrogate for real business logic sets the `comment`
  private doSomething() {
    this.comment = this.contentChild.hero.length > 10 ? `That's a long name` : '';
  }

  private logIt(method: string) {
    let child = this.contentChild;
    let message = `${method}: ${child ? child.hero : 'no'} child content`;
    this.logger.log(message);
  }
// #docregion hooks
  // ...
}
// #enddocregion hooks

//////////////
@Component({
  selector: 'after-content-parent',
  template: `
  <div class="parent">
    <h2>AfterContent</h2>

    <div *ngIf="show">` +
// #docregion parent-template
     `<after-content>
        <app-child></app-child>
      </after-content>`
// #enddocregion parent-template
+ `</div>

    <h4>-- AfterContent Logs --</h4>
    <p><button (click)="reset()">Reset</button></p>
    <div *ngFor="let msg of logger.logs">{{msg}}</div>
  </div>
  `,
  styles: ['.parent {background: burlywood}'],
  providers: [LoggerService]
})
export class AfterContentParentComponent {
  show = true;

  constructor(public logger: LoggerService) {
  }

  reset() {
    this.logger.clear();
    // quickly remove and reload AfterContentComponent which recreates it
    this.show = false;
    this.logger.tick_then(() => this.show = true);
  }
}
