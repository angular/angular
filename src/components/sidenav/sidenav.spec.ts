import {
  it,
  iit,
  describe,
  ddescribe,
  expect,
  inject,
  injectAsync,
  TestComponentBuilder,
  beforeEachProviders,
  beforeEach,
} from 'angular2/testing';
import {provide, Component, DebugElement} from 'angular2/core';
import {By} from 'angular2/platform/browser';

import {MdSidenav, MdSidenavLayout, MD_SIDENAV_DIRECTIVES} from './sidenav';
import {AsyncTestFn, FunctionWithParamTokens} from 'angular2/testing';
import {ComponentFixture} from "angular2/testing";
import {EventEmitter} from "angular2/core";
import {Predicate} from "angular2/src/facade/collection";


function wait(msec: number) {
  return new Promise<void>(resolve => window.setTimeout(() => resolve(), msec));
}


function waitOnEvent(fixture: ComponentFixture,
                     by: Predicate<DebugElement>,
                     propertyName: string) {
  fixture.detectChanges();

  // Wait for the animation end.
  return new Promise(resolve => {
    const component: any = fixture.debugElement.query(by).componentInstance;
    component[propertyName].subscribe(resolve);
  });
}


describe('MdSidenav', () => {
  let builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => { builder = tcb; }));

  describe('methods', () => {
    it('should be able to open and close', (done: any) => {
      let testComponent: BasicTestApp;
      let fixture: ComponentFixture;

      return builder.createAsync(BasicTestApp)
        .then((f) => {
          fixture = f;
          testComponent = fixture.debugElement.componentInstance;

          const openButtonElement = fixture.debugElement.query(By.css('.open'));
          openButtonElement.nativeElement.click();
        })
        .then(() => wait(1))
        .then(() => {
          expect(testComponent.openStartCount).toBe(1);
          expect(testComponent.openCount).toBe(0);
        })
        .then(() => waitOnEvent(fixture, By.directive(MdSidenav), 'onOpen'))
        .then(() => {
          expect(testComponent.openStartCount).toBe(1);
          expect(testComponent.openCount).toBe(1);
          expect(testComponent.closeStartCount).toBe(0);
          expect(testComponent.closeCount).toBe(0);

          const sidenavElement = fixture.debugElement.query(By.css('md-sidenav'));
          const sidenavBackdropElement = fixture.debugElement.query(By.css('.md-sidenav-backdrop'));
          expect(window.getComputedStyle(sidenavElement.nativeElement).visibility).toEqual('visible');
          expect(window.getComputedStyle(sidenavBackdropElement.nativeElement).visibility).toEqual('visible');

          // Close it.
          const closeButtonElement = fixture.debugElement.query(By.css('.close'));
          closeButtonElement.nativeElement.click();
        })
        .then(() => wait(1))
        .then(() => {
          expect(testComponent.openStartCount).toBe(1);
          expect(testComponent.openCount).toBe(1);
          expect(testComponent.closeStartCount).toBe(1);
          expect(testComponent.closeCount).toBe(0);
        })
        .then(() => waitOnEvent(fixture, By.directive(MdSidenav), 'onClose'))
        .then(() => fixture.detectChanges())
        .then(() => {
          expect(testComponent.openStartCount).toBe(1);
          expect(testComponent.openCount).toBe(1);
          expect(testComponent.closeStartCount).toBe(1);
          expect(testComponent.closeCount).toBe(1);

          const sidenavElement = fixture.debugElement.query(By.css('md-sidenav'));
          const sidenavBackdropElement = fixture.debugElement.query(By.css('.md-sidenav-backdrop'));
          expect(window.getComputedStyle(sidenavElement.nativeElement).visibility).toEqual('hidden');
          expect(window.getComputedStyle(sidenavBackdropElement.nativeElement).visibility).toEqual('hidden');
        })
        .then(done, done.fail);
    }, 8000);

    it('open() and close() return a promise that resolves after the animation ended',
      (done: any) => {
        let testComponent: BasicTestApp;
        let fixture: ComponentFixture;
        let sidenav: MdSidenav;

        let promise: Promise<void>;
        let called: boolean = false;

        return builder.createAsync(BasicTestApp)
          .then((f) => {
            fixture = f;
            sidenav = fixture.debugElement.query(By.directive(MdSidenav)).componentInstance;

            promise = sidenav.open();
            promise.then(() => called = true);
          })
          .then(() => wait(1))
          .then(() => fixture.detectChanges())
          .then(() => {
            expect(called).toBe(false);
          })
          .then(() => promise)
          .then(() => expect(called).toBe(true))
          .then(() => {
            // Close it now.
            called = false;
            promise = sidenav.close();
            promise.then(() => called = true);
          })
          .then(() => wait(1))
          .then(() => fixture.detectChanges())
          .then(() => {
            expect(called).toBe(false);
          })
          .then(() => promise)
          .then(() => expect(called).toBe(true))
          .then(done, done.fail);
      }, 8000);

    it('open() twice returns the same promise', (done: any) => {
      let testComponent: BasicTestApp;
      let fixture: ComponentFixture;
      let sidenav: MdSidenav;

      let promise: Promise<void>;
      let called: boolean = false;

      return builder.createAsync(BasicTestApp)
        .then((f) => {
          fixture = f;
          sidenav = fixture.debugElement.query(By.directive(MdSidenav)).componentInstance;

          promise = sidenav.open();
          expect(sidenav.open()).toBe(promise);
        })
        .then(() => wait(1))
        .then(() => {
          fixture.detectChanges();
          return promise;
        })
        .then(() => {
          promise = sidenav.close();
          expect(sidenav.close()).toBe(promise);
        })
        .then(done, done.fail);
    });

    it('open() then close() cancel animations when called too fast',
      (done: any) => {
        let testComponent: BasicTestApp;
        let fixture: ComponentFixture;
        let sidenav: MdSidenav;

        let openPromise: Promise<void>;
        let closePromise: Promise<void>;
        let openCalled: boolean = false;
        let openCancelled: boolean = false;
        let closeCalled: boolean = false;

        return builder.createAsync(BasicTestApp)
          .then((f) => {
            fixture = f;
            sidenav = fixture.debugElement.query(By.directive(MdSidenav)).componentInstance;

            openPromise = sidenav.open().then(() => { openCalled = true; },
                                              () => { openCancelled = true; });
          })
          .then(() => wait(1))
          .then(() => fixture.detectChanges())
          // We need to wait for the browser to start the transition.
          .then(() => wait(50))
          .then(() => {
            closePromise = sidenav.close().then(() => { closeCalled = true; }, done.fail);
            return wait(1);
          })
          .then(() => {
            fixture.detectChanges();
            return closePromise;
          })
          .then(() => {
            expect(openCalled).toBe(false);
            expect(openCancelled).toBe(true);
            expect(closeCalled).toBe(true);
          })
          .then(done, done.fail);
      }, 8000);

    it('close() then open() cancel animations when called too fast',
      (done: any) => {
        let testComponent: BasicTestApp;
        let fixture: ComponentFixture;
        let sidenav: MdSidenav;

        let openPromise: Promise<void>;
        let closePromise: Promise<void>;
        let closeCalled: boolean = false;
        let closeCancelled: boolean = false;
        let openCalled: boolean = false;

        return builder.createAsync(BasicTestApp)
          .then((f) => {
            fixture = f;
            sidenav = fixture.debugElement.query(By.directive(MdSidenav)).componentInstance;

            /** First, open it. */
            openPromise = sidenav.open();
          })
          .then(() => wait(1))
          .then(() => {
            fixture.detectChanges();
            return openPromise;
          })
          .then(() => {
            // Then close and check behavior.
            closePromise = sidenav.close().then(() => { closeCalled = true; },
                                                () => { closeCancelled = true; });
          })
          .then(() => wait(1))
          .then(() => fixture.detectChanges())
          // We need to wait for the browser to start the transition.
          .then(() => wait(50))
          .then(() => {
            openPromise = sidenav.open().then(() => { openCalled = true; }, done.fail);
            return wait(1);
          })
          .then(() => {
            fixture.detectChanges();
            return openPromise;
          })
          .then(() => {
            expect(closeCalled).toBe(false);
            expect(closeCancelled).toBe(true);
            expect(openCalled).toBe(true);
          })
          .then(done, done.fail);
      }, 8000);
  });
});


/** Test component that contains an MdSidenavLayout and one MdSidenav. */
@Component({
  selector: 'test-app',
  directives: [MD_SIDENAV_DIRECTIVES],
  template: `
    <md-sidenav-layout>
      <md-sidenav #sidenav align="start"
                  (open-start)="openStartCount = openStartCount + 1"
                  (open)="openCount = openCount + 1"
                  (close-start)="closeStartCount = closeStartCount + 1"
                  (close)="closeCount = closeCount + 1">
        Content.
      </md-sidenav>
      <button (click)="sidenav.open()" class="open"></button>
      <button (click)="sidenav.close()" class="close"></button>
    </md-sidenav-layout>
  `,
})
class BasicTestApp {
  openStartCount: number = 0;
  openCount: number = 0;
  closeStartCount: number = 0;
  closeCount: number = 0;
}
