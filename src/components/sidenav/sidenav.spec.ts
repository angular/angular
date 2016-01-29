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
import {ComponentFixture} from 'angular2/testing';
import {EventEmitter} from 'angular2/core';
import {Predicate} from 'angular2/src/facade/collection';
import {PromiseWrapper} from 'angular2/src/facade/promise';
import {TimerWrapper} from 'angular2/src/facade/async';


function wait(msec: number) {
  let completer = PromiseWrapper.completer();
  TimerWrapper.setTimeout(completer.resolve, msec);
  return completer.promise;
}


function waitOnEvent(fixture: ComponentFixture,
                     by: Predicate<DebugElement>,
                     propertyName: string) {
  fixture.detectChanges();

  // Wait for the animation end.
  let completer = PromiseWrapper.completer();
  let component: any = fixture.debugElement.query(by).componentInstance;
  component[propertyName].subscribe(() => {
    completer.resolve();
  });
  return completer.promise;
}


export function main() {
  describe('MdSidenav', () => {
    let builder: TestComponentBuilder;

    beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      builder = tcb;
    }));

    describe('methods', () => {
      it('should be able to open and close', (done: any) => {
        let testComponent: BasicTestApp;
        let fixture: ComponentFixture;

        return builder.createAsync(BasicTestApp)
          .then((f) => {
            fixture = f;
            testComponent = fixture.debugElement.componentInstance;
            fixture.detectChanges();
            return wait(1);
          }).then((f) => {
            let openButtonElement = fixture.debugElement.query(By.css('.open'));
            openButtonElement.nativeElement.click();
            fixture.detectChanges();
            return wait(1);
          }).then((_: any) => {
            expect(testComponent.openStartCount).toBe(1);
            expect(testComponent.openCount).toBe(0);
          })
          .then((_: any) => { return waitOnEvent(fixture, By.directive(MdSidenav), 'onOpen'); })
          .then((_: any) => {
            expect(testComponent.openStartCount).toBe(1);
            expect(testComponent.openCount).toBe(1);
            expect(testComponent.closeStartCount).toBe(0);
            expect(testComponent.closeCount).toBe(0);

            let sidenavElement = fixture.debugElement.query(By.css('md-sidenav'));
            let sidenavBackdropElement = fixture.debugElement.query(By.css('.md-sidenav-backdrop'));
            expect(window.getComputedStyle(sidenavElement.nativeElement).visibility).toEqual('visible');
            expect(window.getComputedStyle(sidenavBackdropElement.nativeElement).visibility).toEqual('visible');

            // Close it.
            let closeButtonElement = fixture.debugElement.query(By.css('.close'));
            closeButtonElement.nativeElement.click();
            fixture.detectChanges();
            return wait(1);
          })
          .then((_: any) => wait(1))
          .then((_: any) => {
            expect(testComponent.openStartCount).toBe(1);
            expect(testComponent.openCount).toBe(1);
            expect(testComponent.closeStartCount).toBe(1);
            expect(testComponent.closeCount).toBe(0);
          })
          .then((_: any) => { return waitOnEvent(fixture, By.directive(MdSidenav), 'onClose'); })
          .then((_: any) => fixture.detectChanges())
          .then((_: any) => {
            expect(testComponent.openStartCount).toBe(1);
            expect(testComponent.openCount).toBe(1);
            expect(testComponent.closeStartCount).toBe(1);
            expect(testComponent.closeCount).toBe(1);

            let sidenavElement = fixture.debugElement.query(By.css('md-sidenav'));
            let sidenavBackdropElement = fixture.debugElement.query(By.css('.md-sidenav-backdrop'));
            expect(window.getComputedStyle(sidenavElement.nativeElement).visibility).toEqual('hidden');
            expect(window.getComputedStyle(sidenavBackdropElement.nativeElement).visibility).toEqual('hidden');
          })
          .then(done, done.fail);
      }, 8000);

      it('open() and close() return a promise that resolves after the animation ended',
        (done: any) => {
          let fixture: ComponentFixture;
          let sidenav: MdSidenav;

          let promise: Promise<void>;
          let called: boolean = false;

          return builder.createAsync(BasicTestApp)
            .then((f) => {
              fixture = f;
              sidenav = fixture.debugElement.query(By.directive(MdSidenav)).componentInstance;

              promise = sidenav.open();
              promise.then((_: any) => called = true);
            })
            .then((_: any) => { return wait(1); })
            .then((_: any) => fixture.detectChanges())
            .then((_: any) => {
              expect(called).toBe(false);
            })
            .then((_: any) => promise)
            .then((_: any) => expect(called).toBe(true))
            .then((_: any) => {
              // Close it now.
              called = false;
              promise = sidenav.close();
              promise.then((_: any) => called = true);
            })
            .then((_: any) => { return wait(1); })
            .then((_: any) => fixture.detectChanges())
            .then((_: any) => {
              expect(called).toBe(false);
            })
            .then((_: any) => promise)
            .then((_: any) => expect(called).toBe(true))
            .then(done, done.fail);
        }, 8000);

      it('open() twice returns the same promise', (done: any) => {
        let fixture: ComponentFixture;
        let sidenav: MdSidenav;

        let promise: Promise<void>;

        return builder.createAsync(BasicTestApp)
          .then((f) => {
            fixture = f;
            sidenav = fixture.debugElement.query(By.directive(MdSidenav)).componentInstance;

            promise = sidenav.open();
            expect(sidenav.open()).toBe(promise);
          })
          .then((_: any) => { return wait(1); })
          .then((_: any) => {
            fixture.detectChanges();
            return promise;
          })
          .then((_: any) => {
            promise = sidenav.close();
            expect(sidenav.close()).toBe(promise);
          })
          .then(done, done.fail);
      });

      it('open() then close() cancel animations when called too fast',
        (done: any) => {
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

              openPromise = sidenav.open().then((_: any) => {
                  openCalled = true;
                },
                () => {
                  openCancelled = true;
                });
            })
            .then((_: any) => { return wait(1); })
            .then((_: any) => fixture.detectChanges())
            // We need to wait for the browser to start the transition.
            .then((_: any) => { return wait(50); })
            .then((_: any) => {
              closePromise = sidenav.close().then((_: any) => {
                closeCalled = true;
              }, done.fail);
              return wait(1);
            })
            .then((_: any) => {
              fixture.detectChanges();
              return closePromise;
            })
            .then((_: any) => {
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
            .then((_: any) => { return wait(1); })
            .then((_: any) => {
              fixture.detectChanges();
              return openPromise;
            })
            .then((_: any) => {
              // Then close and check behavior.
              closePromise = sidenav.close().then((_: any) => {
                  closeCalled = true;
                },
                () => {
                  closeCancelled = true;
                });
            })
            .then((_: any) => { return wait(1); })
            .then((_: any) => fixture.detectChanges())
            // We need to wait for the browser to start the transition.
            .then((_: any) => { return wait(50); })
            .then((_: any) => {
              openPromise = sidenav.open().then((_: any) => {
                openCalled = true;
              }, done.fail);
              return wait(1);
            })
            .then((_: any) => {
              fixture.detectChanges();
              return openPromise;
            })
            .then((_: any) => {
              expect(closeCalled).toBe(false);
              expect(closeCancelled).toBe(true);
              expect(openCalled).toBe(true);
            })
            .then(done, done.fail);
        }, 8000);
    });
  });
}

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
