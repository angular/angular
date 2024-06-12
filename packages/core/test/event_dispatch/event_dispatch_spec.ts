/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, GlobalEventDelegation, ɵprovideGlobalEventDelegation} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {EventDispatchDirective} from '@angular/platform-browser';

function configureTestingModule(components: unknown[]) {
  TestBed.configureTestingModule({
    imports: components,
    providers: [ɵprovideGlobalEventDelegation()],
  });
}

describe('event dispatch', () => {
  let fixture: ComponentFixture<unknown>;
  afterEach(() => fixture.debugElement.injector.get(GlobalEventDelegation).eventContract.cleanUp());

  it(`executes an onclick handler`, async () => {
    const onClickSpy = jasmine.createSpy();
    @Component({
      selector: 'app',
      standalone: true,
      template: `
        <button id="btn" (click)="onClick()"></button>
      `,
    })
    class AppComponent {
      onClick = onClickSpy;
    }
    configureTestingModule([AppComponent]);
    const addEventListenerSpy = spyOn(
      HTMLButtonElement.prototype,
      'addEventListener',
    ).and.callThrough();
    fixture = TestBed.createComponent(AppComponent);
    const button = (fixture.debugElement.nativeElement as Element)
      .firstElementChild as HTMLButtonElement;
    button.click();
    expect(onClickSpy).toHaveBeenCalledTimes(1);
    expect(button.hasAttribute('jsaction')).toBeTrue();
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('should work for elements with local refs', async () => {
    const onClickSpy = jasmine.createSpy();

    @Component({
      selector: 'app',
      standalone: true,
      template: `
        <button id="btn" (click)="onClick()" #localRef></button>
      `,
    })
    class AppComponent {
      onClick = onClickSpy;
    }
    configureTestingModule([AppComponent]);
    fixture = TestBed.createComponent(AppComponent);
    fixture.debugElement.nativeElement.querySelector('#btn').click();
    expect(onClickSpy).toHaveBeenCalled();
  });
  it('should route to the appropriate component with content projection', async () => {
    const outerOnClickSpy = jasmine.createSpy();
    const innerOnClickSpy = jasmine.createSpy();
    @Component({
      selector: 'app-card',
      standalone: true,
      template: `
        <div class="card">
          <button id="inner-button" (click)="onClick()"></button>
          <ng-content></ng-content> 
        </div>
      `,
    })
    class CardComponent {
      onClick = innerOnClickSpy;
    }

    @Component({
      selector: 'app',
      imports: [CardComponent],
      standalone: true,
      template: `
        <app-card>
          <h2>Card Title</h2>
          <p>This is some card content.</p>
          <button id="outer-button" (click)="onClick()">Click Me</button>
        </app-card>
      `,
    })
    class AppComponent {
      onClick = outerOnClickSpy;
    }
    configureTestingModule([AppComponent]);
    fixture = TestBed.createComponent(AppComponent);
    const nativeElement = fixture.debugElement.nativeElement;
    const outer = nativeElement.querySelector('#outer-button')!;
    const inner = nativeElement.querySelector('#inner-button')!;
    outer.click();
    inner.click();
    expect(outerOnClickSpy).toHaveBeenCalledBefore(innerOnClickSpy);
  });
  it('should serialize event types to be listened to and jsaction attribute', async () => {
    const clickSpy = jasmine.createSpy('onClick');
    const focusSpy = jasmine.createSpy('onFocus');
    @Component({
      standalone: true,
      selector: 'app',
      template: `
            <div (click)="onClick()" id="click-element">
              <div id="focus-container">
                <div id="focus-action-element" (focus)="onFocus()">
                  <button id="focus-target-element">Focus Button</button>
                </div>
              </div>
            </div>
          `,
    })
    class SimpleComponent {
      onClick = clickSpy;
      onFocus = focusSpy;
    }
    configureTestingModule([SimpleComponent]);
    fixture = TestBed.createComponent(SimpleComponent);
    const nativeElement = fixture.debugElement.nativeElement;
    const el = nativeElement.querySelector('#click-element')!;
    const button = nativeElement.querySelector('#focus-target-element')!;
    const clickEvent = new CustomEvent('click', {bubbles: true});
    el.dispatchEvent(clickEvent);
    const focusEvent = new CustomEvent('focus');
    button.dispatchEvent(focusEvent);
    expect(clickSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  describe('bubbling behavior', () => {
    it('should propagate events', async () => {
      const onClickSpy = jasmine.createSpy();
      @Component({
        standalone: true,
        selector: 'app',
        template: `
            <div id="top" (click)="onClick()">
                <div id="bottom" (click)="onClick()"></div>
            </div>
          `,
      })
      class SimpleComponent {
        onClick = onClickSpy;
      }
      configureTestingModule([SimpleComponent]);
      fixture = TestBed.createComponent(SimpleComponent);
      const nativeElement = fixture.debugElement.nativeElement;
      const bottomEl = nativeElement.querySelector('#bottom')!;
      bottomEl.click();
      expect(onClickSpy).toHaveBeenCalledTimes(2);
    });

    it('should not propagate events if stopPropagation is called', async () => {
      @Component({
        standalone: true,
        selector: 'app',
        template: `
            <div id="top" (click)="onClick($event)">
                <div id="bottom" (click)="onClick($event)"></div>
            </div>
          `,
      })
      class SimpleComponent {
        onClick(e: Event) {
          e.stopPropagation();
        }
      }
      const onClickSpy = spyOn(SimpleComponent.prototype, 'onClick').and.callThrough();
      configureTestingModule([SimpleComponent]);
      fixture = TestBed.createComponent(SimpleComponent);
      const nativeElement = fixture.debugElement.nativeElement;
      const bottomEl = nativeElement.querySelector('#bottom')!;
      bottomEl.click();
      expect(onClickSpy).toHaveBeenCalledTimes(1);
    });
  });
});

describe('event dispatch directive', () => {
  it('should delegate only to a specific subsection of the DOM', () => {
    const addEventListener = spyOn(
      HTMLButtonElement.prototype,
      'addEventListener',
    ).and.callThrough();
    const onClickSpy = jasmine.createSpy();
    @Component({
      standalone: true,
      selector: 'cmp',
      template: `
          <button id="btm-btn" (click)="onClick($event)"></button>
        `,
    })
    class SimpleComponent {
      onClick = onClickSpy;
    }
    @Component({
      standalone: true,
      selector: 'cmp-dlg',
      hostDirectives: [EventDispatchDirective],
      template: `
        <button id="top-btn" (click)="onClick($event)"></button>
        `,
    })
    class SimpleComponentWithEventDelegation {
      onClick = onClickSpy;
    }

    TestBed.configureTestingModule({
      imports: [SimpleComponent, SimpleComponentWithEventDelegation],
    });
    const eventDelegationElement = TestBed.createComponent(SimpleComponentWithEventDelegation);
    expect(addEventListener).toHaveBeenCalledTimes(0);
    const dir = eventDelegationElement.debugElement.injector.get(EventDispatchDirective);
    dir.ngAfterContentInit();
    const normalElement = TestBed.createComponent(SimpleComponent);
    expect(addEventListener).toHaveBeenCalledTimes(1);
    eventDelegationElement.nativeElement.querySelector('#top-btn')!.click();
    expect(onClickSpy).toHaveBeenCalledTimes(1);
    normalElement.nativeElement.querySelector('#btm-btn')!.click();
    expect(onClickSpy).toHaveBeenCalledTimes(2);
  });
});
