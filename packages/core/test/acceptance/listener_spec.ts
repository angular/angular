/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, ErrorHandler, HostListener} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {onlyInIvy} from '@angular/private/testing';

function getNoOfNativeListeners(): number {
  return ngDevMode ? ngDevMode.rendererAddEventListener : 0;
}

describe('event listeners', () => {

  describe('coalescing', () => {

    @Component({
      selector: 'with-clicks-cmpt',
      template: `<button likes-clicks (click)="count()" md-button>Click me!</button>`
    })
    class WithClicksCmpt {
      counter = 0;
      count() { this.counter++; }
    }

    @Directive({selector: '[md-button]'})
    class MdButton {
      counter = 0;
      @HostListener('click')
      count() { this.counter++; }
    }

    @Directive({selector: '[likes-clicks]'})
    class LikesClicks {
      counter = 0;
      @HostListener('click')
      count() { this.counter++; }
    }

    onlyInIvy('ngDevMode.rendererAddEventListener counters are only available in ivy')
        .it('should coalesce multiple event listeners for the same event on the same element',
            () => {

              @Component({
                selector: 'test-cmpt',
                template:
                    `<with-clicks-cmpt></with-clicks-cmpt><with-clicks-cmpt></with-clicks-cmpt>`
              })
              class TestCmpt {
              }

              TestBed.configureTestingModule(
                  {declarations: [TestCmpt, WithClicksCmpt, LikesClicks, MdButton]});
              const noOfEventListenersRegisteredSoFar = getNoOfNativeListeners();
              const fixture = TestBed.createComponent(TestCmpt);
              fixture.detectChanges();
              const buttonDebugEls = fixture.debugElement.queryAll(By.css('button'));
              const withClicksEls = fixture.debugElement.queryAll(By.css('with-clicks-cmpt'));

              // We want to assert that only one native event handler was registered but still all
              // directives are notified when an event fires. This assertion can only be verified in
              // the ngDevMode (but the coalescing always happens!).
              ngDevMode &&
                  expect(getNoOfNativeListeners()).toBe(noOfEventListenersRegisteredSoFar + 2);

              buttonDebugEls[0].nativeElement.click();
              expect(withClicksEls[0].injector.get(WithClicksCmpt).counter).toBe(1);
              expect(buttonDebugEls[0].injector.get(LikesClicks).counter).toBe(1);
              expect(buttonDebugEls[0].injector.get(MdButton).counter).toBe(1);
              expect(withClicksEls[1].injector.get(WithClicksCmpt).counter).toBe(0);
              expect(buttonDebugEls[1].injector.get(LikesClicks).counter).toBe(0);
              expect(buttonDebugEls[1].injector.get(MdButton).counter).toBe(0);

              buttonDebugEls[1].nativeElement.click();
              expect(withClicksEls[0].injector.get(WithClicksCmpt).counter).toBe(1);
              expect(buttonDebugEls[0].injector.get(LikesClicks).counter).toBe(1);
              expect(buttonDebugEls[0].injector.get(MdButton).counter).toBe(1);
              expect(withClicksEls[1].injector.get(WithClicksCmpt).counter).toBe(1);
              expect(buttonDebugEls[1].injector.get(LikesClicks).counter).toBe(1);
              expect(buttonDebugEls[1].injector.get(MdButton).counter).toBe(1);
            });


    it('should try to execute remaining coalesced listeners if one of the listeners throws', () => {

      @Directive({selector: '[throws-on-clicks]'})
      class ThrowsOnClicks {
        @HostListener('click')
        dontCount() { throw new Error('I was clicked and I don\'t like it!'); }
      }

      @Component(
          {selector: 'test-cmpt', template: `<button throws-on-clicks likes-clicks><button>`})
      class TestCmpt {
      }

      let noOfErrors = 0;

      class CountingErrorHandler extends ErrorHandler {
        handleError(error: any): void { noOfErrors++; }
      }

      TestBed.configureTestingModule({
        declarations: [TestCmpt, LikesClicks, ThrowsOnClicks],
        providers: [{provide: ErrorHandler, useClass: CountingErrorHandler}]
      });
      const fixture = TestBed.createComponent(TestCmpt);
      fixture.detectChanges();
      const buttonDebugEl = fixture.debugElement.query(By.css('button'));

      expect(buttonDebugEl.injector.get(LikesClicks).counter).toBe(0);

      buttonDebugEl.nativeElement.click();
      expect(noOfErrors).toBe(1);
      expect(buttonDebugEl.injector.get(LikesClicks).counter).toBe(1);
    });
  });
});