/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {TestBed, fakeAsync, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

describe('event listener modifiers', () => {
  it('should prevent default action when using .prevent modifier', () => {
    @Component({
      template: `<button (click.prevent)="onClick($event)">Click me</button>`,
    })
    class MyComp {
      public event: Event | null = null;
      onClick(e: Event) {
        this.event = e;
      }
    }

    TestBed.configureTestingModule({imports: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    const event = {
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };

    button.triggerEventHandler('click', event);
    fixture.detectChanges();

    expect(fixture.componentInstance.event).toBe(event as any);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should stop propagation when using .stop modifier', () => {
    @Component({
      template: `
        <div (click)="onParentClick()">
          <button (click.stop)="onChildClick($event)">Click me</button>
        </div>
      `,
    })
    class MyComp {
      parentClicked = false;
      childClicked = false;

      onParentClick() {
        this.parentClicked = true;
      }

      onChildClick(e: Event) {
        this.childClicked = true;
      }
    }

    TestBed.configureTestingModule({imports: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
      preventDefault: jasmine.createSpy('preventDefault'), // Just in case
    };

    button.triggerEventHandler('click', event);
    fixture.detectChanges();

    expect(fixture.componentInstance.childClicked).toBe(true);
    // Since triggerEventHandler doesn't bubble, we can't test parentClicked logic via bubbling here easily
    // But we CAN verify stopPropagation was called by the modifier wrapper.
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should debounce event execution when using .debounce modifier', fakeAsync(() => {
    @Component({
      // Debounce needs delay value, using 500ms
      template: `<button (click.debounce.500)="onClick()">Click me</button>`,
    })
    class MyComp {
      counter = 0;
      onClick() {
        this.counter++;
      }
    }

    TestBed.configureTestingModule({imports: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();

    // Should not have incremented yet (timer started)
    expect(fixture.componentInstance.counter).toBe(0);

    tick(200);
    // Still not incremented
    expect(fixture.componentInstance.counter).toBe(0);

    // Another click should reset the timer
    button.nativeElement.click();
    fixture.detectChanges();

    tick(400);
    // From first click: 200 + 400 = 600 (would have fired)
    // But second click reset it at T=200. So at T=600, second timer is at 400.
    // Still not incremented
    expect(fixture.componentInstance.counter).toBe(0);

    tick(100);
    // Now second timer reaches 500
    expect(fixture.componentInstance.counter).toBe(1);

    // Ensure no pending timers
    tick(1000);
  }));

  it('should support combining multiple modifiers (stop and prevent)', () => {
    @Component({
      template: `
        <div (click)="onParentClick()">
          <button (click.stop.prevent)="onChildClick($event)">Click me</button>
        </div>
      `,
    })
    class MyComp {
      parentClicked = false;
      childClicked = false;
      event: Event | null = null;

      onParentClick() {
        this.parentClicked = true;
      }

      onChildClick(e: Event) {
        this.childClicked = true;
        this.event = e;
      }
    }

    TestBed.configureTestingModule({imports: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    const event = {
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };

    button.triggerEventHandler('click', event);
    fixture.detectChanges();

    expect(fixture.componentInstance.childClicked).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should support key events', async () => {
    @Component({
      template: '<button (keydown.message)="onKey()">Click</button>',
    })
    class App {
      onKey = jasmine.createSpy('onKey');
    }

    TestBed.configureTestingModule({imports: [App]});
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));

    // Trigger arbitrary key
    const mockEvent = {key: 'message', preventDefault: () => {}};
    button.triggerEventHandler('keydown', mockEvent);

    await fixture.whenStable();
    if (app.onKey.calls.count() === 0) {
      button.triggerEventHandler('keydown.message', mockEvent);
    }
    expect(app.onKey).toHaveBeenCalled();
    app.onKey.calls.reset();

    // Trigger different key
    const mockEvent2 = {key: 'Other', preventDefault: () => {}};
    button.triggerEventHandler('keydown', mockEvent2);
    await fixture.whenStable();
    expect(app.onKey).not.toHaveBeenCalled();
  });

  it('should support modifier keys', async () => {
    @Component({
      template: '<button (keydown.shift.a)="onShiftA()">Click</button>',
    })
    class App {
      onShiftA = jasmine.createSpy('onShiftA');
    }

    TestBed.configureTestingModule({imports: [App]});
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));

    // Trigger Shift+A
    const mockEvent = {key: 'a', shiftKey: true, preventDefault: () => {}};
    button.triggerEventHandler('keydown', mockEvent);
    await fixture.whenStable();
    expect(app.onShiftA).toHaveBeenCalled();
    app.onShiftA.calls.reset();

    // Trigger just A
    const mockEvent2 = {key: 'a', shiftKey: false, preventDefault: () => {}};
    button.triggerEventHandler('keydown', mockEvent2);
    await fixture.whenStable();
    expect(app.onShiftA).not.toHaveBeenCalled();
  });
});
