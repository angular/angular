/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {
  Component,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '../../src/core';
import {TestBed} from '../../testing';

describe('outputs', () => {
  @Component({
    selector: 'button-toggle',
    template: '',
    standalone: false,
  })
  class ButtonToggle {
    @Output('change') change = new EventEmitter<void>();

    @Output('reset') resetStream = new EventEmitter<void>();
  }

  @Directive({
    selector: '[otherDir]',
    standalone: false,
  })
  class OtherDir {
    @Output('change') changeStream = new EventEmitter<void>();
  }

  @Component({
    selector: 'destroy-comp',
    template: '',
    standalone: false,
  })
  class DestroyComp implements OnDestroy {
    events: string[] = [];
    ngOnDestroy() {
      this.events.push('destroy');
    }
  }

  @Directive({
    selector: '[myButton]',
    standalone: false,
  })
  class MyButton {
    @Output() click = new EventEmitter<void>();
  }

  it('should call component output function when event is emitted', () => {
    let counter = 0;

    @Component({
      template: '<button-toggle (change)="onChange()"></button-toggle>',
      standalone: false,
    })
    class App {
      @ViewChild(ButtonToggle) buttonToggle!: ButtonToggle;
      onChange() {
        counter++;
      }
    }
    TestBed.configureTestingModule({declarations: [App, ButtonToggle]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.buttonToggle.change.next();
    expect(counter).toBe(1);

    fixture.componentInstance.buttonToggle.change.next();
    expect(counter).toBe(2);
  });

  it('should support more than 1 output function on the same node', () => {
    let counter = 0;
    let resetCounter = 0;

    @Component({
      template: '<button-toggle (change)="onChange()" (reset)="onReset()"></button-toggle>',
      standalone: false,
    })
    class App {
      @ViewChild(ButtonToggle) buttonToggle!: ButtonToggle;
      onChange() {
        counter++;
      }
      onReset() {
        resetCounter++;
      }
    }
    TestBed.configureTestingModule({declarations: [App, ButtonToggle]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.buttonToggle.change.next();
    expect(counter).toBe(1);

    fixture.componentInstance.buttonToggle.resetStream.next();
    expect(resetCounter).toBe(1);
  });

  it('should eval component output expression when event is emitted', () => {
    @Component({
      template: '<button-toggle (change)="counter = counter + 1"></button-toggle>',
      standalone: false,
    })
    class App {
      @ViewChild(ButtonToggle) buttonToggle!: ButtonToggle;
      counter = 0;
    }
    TestBed.configureTestingModule({declarations: [App, ButtonToggle]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.buttonToggle.change.next();
    expect(fixture.componentInstance.counter).toBe(1);

    fixture.componentInstance.buttonToggle.change.next();
    expect(fixture.componentInstance.counter).toBe(2);
  });

  it('should unsubscribe from output when view is destroyed', () => {
    let counter = 0;

    @Component({
      template: '<button-toggle *ngIf="condition" (change)="onChange()"></button-toggle>',
      standalone: false,
    })
    class App {
      @ViewChild(ButtonToggle) buttonToggle!: ButtonToggle;
      condition = true;

      onChange() {
        counter++;
      }
    }
    TestBed.configureTestingModule({imports: [CommonModule], declarations: [App, ButtonToggle]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const buttonToggle = fixture.componentInstance.buttonToggle;

    buttonToggle.change.next();
    expect(counter).toBe(1);

    fixture.componentInstance.condition = false;
    fixture.detectChanges();

    buttonToggle.change.next();
    expect(counter).toBe(1);
  });

  it('should unsubscribe from output in nested view', () => {
    let counter = 0;

    @Component({
      template: `
        <div *ngIf="condition">
          <button-toggle *ngIf="condition2" (change)="onChange()"></button-toggle>
        </div>
      `,
      standalone: false,
    })
    class App {
      @ViewChild(ButtonToggle) buttonToggle!: ButtonToggle;
      condition = true;
      condition2 = true;

      onChange() {
        counter++;
      }
    }
    TestBed.configureTestingModule({imports: [CommonModule], declarations: [App, ButtonToggle]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const buttonToggle = fixture.componentInstance.buttonToggle;

    buttonToggle.change.next();
    expect(counter).toBe(1);

    fixture.componentInstance.condition = false;
    fixture.detectChanges();

    buttonToggle.change.next();
    expect(counter).toBe(1);
  });

  it('should work properly when view also has listeners and destroys', () => {
    let clickCounter = 0;
    let changeCounter = 0;

    @Component({
      template: `
        <div *ngIf="condition">
          <button (click)="onClick()">Click me</button>
          <button-toggle (change)="onChange()"></button-toggle>
          <destroy-comp></destroy-comp>
        </div>
      `,
      standalone: false,
    })
    class App {
      @ViewChild(ButtonToggle) buttonToggle!: ButtonToggle;
      @ViewChild(DestroyComp) destroyComp!: DestroyComp;
      condition = true;

      onClick() {
        clickCounter++;
      }
      onChange() {
        changeCounter++;
      }
    }
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [App, ButtonToggle, DestroyComp],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const {buttonToggle, destroyComp} = fixture.componentInstance;
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    buttonToggle.change.next();
    expect(changeCounter).toBe(1);
    expect(clickCounter).toBe(0);

    button.click();
    expect(changeCounter).toBe(1);
    expect(clickCounter).toBe(1);

    fixture.componentInstance.condition = false;
    fixture.detectChanges();

    expect(destroyComp.events).toEqual(['destroy']);

    buttonToggle.change.next();
    button.click();
    expect(changeCounter).toBe(1);
    expect(clickCounter).toBe(1);
  });

  it('should fire event listeners along with outputs if they match', () => {
    let counter = 0;

    @Component({
      template: '<button myButton (click)="onClick()">Click me</button>',
      standalone: false,
    })
    class App {
      @ViewChild(MyButton) buttonDir!: MyButton;
      onClick() {
        counter++;
      }
    }
    TestBed.configureTestingModule({declarations: [App, MyButton]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // To match current Angular behavior, the click listener is still
    // set up in addition to any matching outputs.
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(counter).toBe(1);

    fixture.componentInstance.buttonDir.click.next();
    expect(counter).toBe(2);
  });

  it('should work with two outputs of the same name', () => {
    let counter = 0;

    @Component({
      template: '<button-toggle (change)="onChange()" otherDir></button-toggle>',
      standalone: false,
    })
    class App {
      @ViewChild(ButtonToggle) buttonToggle!: ButtonToggle;
      @ViewChild(OtherDir) otherDir!: OtherDir;
      onChange() {
        counter++;
      }
    }
    TestBed.configureTestingModule({declarations: [App, ButtonToggle, OtherDir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.buttonToggle.change.next();
    expect(counter).toBe(1);

    fixture.componentInstance.otherDir.changeStream.next();
    expect(counter).toBe(2);
  });

  it('should work with an input and output of the same name', () => {
    let counter = 0;

    @Directive({
      selector: '[otherChangeDir]',
      standalone: false,
    })
    class OtherChangeDir {
      @Input() change!: boolean;
    }

    @Component({
      template:
        '<button-toggle (change)="onChange()" otherChangeDir [change]="change"></button-toggle>',
      standalone: false,
    })
    class App {
      @ViewChild(ButtonToggle) buttonToggle!: ButtonToggle;
      @ViewChild(OtherChangeDir) otherDir!: OtherChangeDir;
      change = true;

      onChange() {
        counter++;
      }
    }
    TestBed.configureTestingModule({declarations: [App, ButtonToggle, OtherChangeDir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const {buttonToggle, otherDir} = fixture.componentInstance;

    expect(otherDir.change).toBe(true);

    fixture.componentInstance.change = false;
    fixture.detectChanges();

    expect(otherDir.change).toBe(false);

    buttonToggle.change.next();
    expect(counter).toBe(1);
  });
});
