// #docplaster
// #docregion
import { AfterViewChecked, AfterViewInit, Component, ViewChild } from '@angular/core';

import { LoggerService }  from './logger.service';

//////////////////
// #docregion child-view
@Component({
  selector: 'my-child-view',
  template: '<input [(ngModel)]="hero">'
})
export class ChildViewComponent {
  hero = 'Magneta';
}
// #enddocregion child-view

//////////////////////
@Component({
  selector: 'after-view',
// #docregion template
  template: `
    <div>-- child view begins --</div>
      <my-child-view></my-child-view>
    <div>-- child view ends --</div>`
// #enddocregion template
   + `
    <p *ngIf="comment" class="comment">
      {{comment}}
    </p>
  `
})
// #docregion hooks
export class AfterViewComponent implements  AfterViewChecked, AfterViewInit {
  private prevHero = '';

  // Query for a VIEW child of type `ChildViewComponent`
  @ViewChild(ChildViewComponent) viewChild: ChildViewComponent;

// #enddocregion hooks
  constructor(private logger: LoggerService) {
    this.logIt('AfterView constructor');
  }

// #docregion hooks
  ngAfterViewInit() {
    // viewChild is set after the view has been initialized
    this.logIt('AfterViewInit');
    this.doSomething();
  }

  ngAfterViewChecked() {
    // viewChild is updated after the view has been checked
    if (this.prevHero === this.viewChild.hero) {
      this.logIt('AfterViewChecked (no change)');
    } else {
      this.prevHero = this.viewChild.hero;
      this.logIt('AfterViewChecked');
      this.doSomething();
    }
  }
// #enddocregion hooks

  comment = '';

// #docregion do-something
  // This surrogate for real business logic sets the `comment`
  private doSomething() {
    let c = this.viewChild.hero.length > 10 ? `That's a long name` : '';
    if (c !== this.comment) {
      // Wait a tick because the component's view has already been checked
      this.logger.tick_then(() => this.comment = c);
    }
  }
// #enddocregion do-something

  private logIt(method: string) {
    let child = this.viewChild;
    let message = `${method}: ${child ? child.hero : 'no'} child view`;
    this.logger.log(message);
  }
// #docregion hooks
  // ...
}
// #enddocregion hooks

//////////////
@Component({
  selector: 'after-view-parent',
  template: `
  <div class="parent">
    <h2>AfterView</h2>

    <after-view  *ngIf="show"></after-view>

    <h4>-- AfterView Logs --</h4>
    <p><button (click)="reset()">Reset</button></p>
    <div *ngFor="let msg of logs">{{msg}}</div>
  </div>
  `,
  styles: ['.parent {background: burlywood}'],
  providers: [LoggerService]
})
export class AfterViewParentComponent {
  logs: string[];
  show = true;

  constructor(private logger: LoggerService) {
    this.logs = logger.logs;
  }

  reset() {
    this.logs.length = 0;
    // quickly remove and reload AfterViewComponent which recreates it
    this.show = false;
    this.logger.tick_then(() => this.show = true);
  }
}
