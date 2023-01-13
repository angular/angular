// #docplaster
// #docregion
import { AfterContentChecked, AfterContentInit, Component, ContentChild } from '@angular/core';

import { ChildComponent } from './child.component';
import { LoggerService } from './logger.service';

@Component({
  selector: 'after-content',
// #docregion template
  template: `
    <div>projected content begins</div>
      <ng-content></ng-content>
    <div>projected content ends</div>
  `
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

  // Query for a CONTENT child of type `ChildComponent`
  @ContentChild(ChildComponent) contentChild!: ChildComponent;

// #enddocregion hooks
  constructor(private logger: LoggerService) {
    this.logIt('AfterContent constructor');
  }

// #docregion hooks
  ngAfterContentInit() {
    // contentChild is set after the content has been initialized
    this.logIt('AfterContentInit');
    this.doSomething();
  }

  ngAfterContentChecked() {
    // contentChild is updated after the content has been checked
    if (this.prevHero === this.contentChild.hero) {
      this.logIt('AfterContentChecked (no change)');
    } else {
      this.prevHero = this.contentChild.hero;
      this.logIt('AfterContentChecked');
      this.doSomething();
    }
  }
// #enddocregion hooks

  // This surrogate for real business logic sets the `comment`
  private doSomething() {
    this.comment = this.contentChild.hero.length > 10 ? "That's a long name" : '';
  }

  private logIt(method: string) {
    const child = this.contentChild;
    const message = `${method}: ${child ? child.hero : 'no'} child content`;
    this.logger.log(message);
  }
// #docregion hooks
  // ...
}
// #enddocregion hooks
