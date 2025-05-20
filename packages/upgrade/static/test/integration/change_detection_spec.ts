/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  destroyPlatform,
  Directive,
  ElementRef,
  Injector,
  Input,
  NgModule,
  NgZone,
  SimpleChanges,
} from '@angular/core';
import {waitForAsync} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {downgradeComponent, UpgradeComponent, UpgradeModule} from '../../../static';

import * as angular from '../../../src/common/src/angular1';
import {html, withEachNg1Version} from '../../../src/common/test/helpers/common_test_helpers';

import {bootstrap} from './static_test_helpers';

withEachNg1Version(() => {
  describe('change-detection', () => {
    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should not break if a $digest is already in progress', waitForAsync(() => {
      const element = html('<my-app></my-app>');

      @Component({
        selector: 'my-app',
        template: '',
        standalone: false,
      })
      class AppComponent {}

      @NgModule({declarations: [AppComponent], imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('myApp', downgradeComponent({component: AppComponent}));

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        const $rootScope = upgrade.$injector.get('$rootScope') as angular.IRootScopeService;
        const ngZone: NgZone = upgrade.ngZone;

        // Wrap in a setTimeout to ensure all bootstrap operations have completed.
        setTimeout(
          // Run inside the Angular zone, so that operations such as emitting
          // `onMicrotaskEmpty` do not trigger entering/existing the zone (and thus another
          // `$digest`). This also closer simulates what would happen in a real app.
          () =>
            ngZone.run(() => {
              const digestSpy = spyOn($rootScope, '$digest').and.callThrough();

              // Step 1: Ensure `$digest` is run on `onMicrotaskEmpty`.
              ngZone.onMicrotaskEmpty.emit(null);
              expect(digestSpy).toHaveBeenCalledTimes(1);

              digestSpy.calls.reset();

              // Step 2: Cause the issue.
              $rootScope.$apply(() => ngZone.onMicrotaskEmpty.emit(null));

              // With the fix, `$digest` will only be run once (for `$apply()`).
              // Without the fix, `$digest()` would have been run an extra time
              // (`onMicrotaskEmpty`).
              expect(digestSpy).toHaveBeenCalledTimes(1);

              digestSpy.calls.reset();

              // Step 3: Ensure that `$digest()` is still executed on `onMicrotaskEmpty`.
              ngZone.onMicrotaskEmpty.emit(null);
              expect(digestSpy).toHaveBeenCalledTimes(1);
            }),
          0,
        );
      });
    }));

    it('should interleave scope and component expressions', waitForAsync(() => {
      const log: string[] = [];
      const l = (value: string) => {
        log.push(value);
        return value + ';';
      };

      @Directive({
        selector: 'ng1a',
        standalone: false,
      })
      class Ng1aComponent extends UpgradeComponent {
        constructor(elementRef: ElementRef, injector: Injector) {
          super('ng1a', elementRef, injector);
        }
      }

      @Directive({
        selector: 'ng1b',
        standalone: false,
      })
      class Ng1bComponent extends UpgradeComponent {
        constructor(elementRef: ElementRef, injector: Injector) {
          super('ng1b', elementRef, injector);
        }
      }

      @Component({
        selector: 'ng2',
        template: `{{ l('2A') }}<ng1a></ng1a>{{ l('2B') }}<ng1b></ng1b>{{ l('2C') }}`,
        standalone: false,
      })
      class Ng2Component {
        l = l;
      }

      @NgModule({
        declarations: [Ng1aComponent, Ng1bComponent, Ng2Component],
        imports: [BrowserModule, UpgradeModule],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng1a', () => ({template: "{{ l('ng1a') }}"}))
        .directive('ng1b', () => ({template: "{{ l('ng1b') }}"}))
        .directive('ng2', downgradeComponent({component: Ng2Component}))
        .run(($rootScope: angular.IRootScopeService) => {
          $rootScope['l'] = l;
          $rootScope['reset'] = () => (log.length = 0);
        });

      const element = html("<div>{{reset(); l('1A');}}<ng2>{{l('1B')}}</ng2>{{l('1C')}}</div>");
      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        expect(document.body.textContent).toEqual('1A;2A;ng1a;2B;ng1b;2C;1C;');
        expect(log).toEqual(['1A', '1C', '2A', '2B', '2C', 'ng1a', 'ng1b']);
      });
    }));

    it('should propagate changes to a downgraded component inside the ngZone', waitForAsync(() => {
      const element = html('<my-app></my-app>');
      let appComponent: AppComponent;

      @Component({
        selector: 'my-app',
        template: '<my-child [value]="value"></my-child>',
        standalone: false,
      })
      class AppComponent {
        value?: number;
        constructor() {
          appComponent = this;
        }
      }

      @Component({
        selector: 'my-child',
        template: '<div>{{ valueFromPromise }}</div>',
        standalone: false,
      })
      class ChildComponent {
        valueFromPromise?: number;
        @Input()
        set value(v: number) {
          expect(NgZone.isInAngularZone()).toBe(true);
        }

        constructor(private zone: NgZone) {}

        ngOnChanges(changes: SimpleChanges) {
          if (changes['value'].isFirstChange()) return;

          this.zone.onMicrotaskEmpty.subscribe(() => {
            expect(element.textContent).toEqual('5');
          });

          // Create a micro-task to update the value to be rendered asynchronously.
          queueMicrotask(() => (this.valueFromPromise = changes['value'].currentValue));
        }
      }

      @NgModule({
        declarations: [AppComponent, ChildComponent],
        imports: [BrowserModule, UpgradeModule],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('myApp', downgradeComponent({component: AppComponent}));

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        appComponent.value = 5;
      });
    }));

    // This test demonstrates https://github.com/angular/angular/issues/6385
    // which was invalidly fixed by https://github.com/angular/angular/pull/6386
    // it('should not trigger $digest from an async operation in a watcher', async(() => {
    //      @Component({selector: 'my-app', template: ''})
    //      class AppComponent {
    //      }

    //      @NgModule({declarations: [AppComponent], imports: [BrowserModule]})
    //      class Ng2Module {
    //      }

    //      const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
    //      const ng1Module = angular.module_('ng1', []).directive(
    //          'myApp', adapter.downgradeNg2Component(AppComponent));

    //      const element = html('<my-app></my-app>');

    //      adapter.bootstrap(element, ['ng1']).ready((ref) => {
    //        let doTimeout = false;
    //        let timeoutId: number;
    //        ref.ng1RootScope.$watch(() => {
    //          if (doTimeout && !timeoutId) {
    //            timeoutId = window.setTimeout(function() {
    //              timeoutId = null;
    //            }, 10);
    //          }
    //        });
    //        doTimeout = true;
    //      });
    //    }));
  });
});
