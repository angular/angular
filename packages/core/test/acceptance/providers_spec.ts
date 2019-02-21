/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {onlyInIvy} from '@angular/private/testing';


describe('providers', () => {
  describe('lifecycles', () => {
    it('should inherit ngOnDestroy hooks on providers', () => {
      const logs: string[] = [];

      @Injectable()
      class SuperInjectableWithDestroyHook {
        ngOnDestroy() { logs.push('OnDestroy'); }
      }

      @Injectable()
      class SubInjectableWithDestroyHook extends SuperInjectableWithDestroyHook {
      }

      @Component({template: '', providers: [SubInjectableWithDestroyHook]})
      class App {
        constructor(foo: SubInjectableWithDestroyHook) {}
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(logs).toEqual(['OnDestroy']);
    });

    it('should not call ngOnDestroy for providers that have not been requested', () => {
      const logs: string[] = [];

      @Injectable()
      class InjectableWithDestroyHook {
        ngOnDestroy() { logs.push('OnDestroy'); }
      }

      @Component({template: '', providers: [InjectableWithDestroyHook]})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(logs).toEqual([]);
    });

    it('should only call ngOnDestroy once for multiple instances', () => {
      const logs: string[] = [];

      @Injectable()
      class InjectableWithDestroyHook {
        ngOnDestroy() { logs.push('OnDestroy'); }
      }

      @Component({selector: 'my-cmp', template: ''})
      class MyComponent {
        constructor(foo: InjectableWithDestroyHook) {}
      }

      @Component({
        template: `
          <my-cmp></my-cmp>
          <my-cmp></my-cmp>
        `,
        providers: [InjectableWithDestroyHook]
      })
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, MyComponent]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(logs).toEqual(['OnDestroy']);
    });

    it('should call ngOnDestroy when providing same token via useClass', () => {
      const logs: string[] = [];

      @Injectable()
      class InjectableWithDestroyHook {
        ngOnDestroy() { logs.push('OnDestroy'); }
      }

      @Component({
        template: '',
        providers: [{provide: InjectableWithDestroyHook, useClass: InjectableWithDestroyHook}]
      })
      class App {
        constructor(foo: InjectableWithDestroyHook) {}
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(logs).toEqual(['OnDestroy']);
    });

    onlyInIvy('Destroy hook of useClass provider is invoked correctly')
        .it('should only call ngOnDestroy of value when providing via useClass', () => {
          const logs: string[] = [];

          @Injectable()
          class InjectableWithDestroyHookToken {
            ngOnDestroy() { logs.push('OnDestroy Token'); }
          }

          @Injectable()
          class InjectableWithDestroyHookValue {
            ngOnDestroy() { logs.push('OnDestroy Value'); }
          }

          @Component({
            template: '',
            providers: [
              {provide: InjectableWithDestroyHookToken, useClass: InjectableWithDestroyHookValue}
            ]
          })
          class App {
            constructor(foo: InjectableWithDestroyHookToken) {}
          }

          TestBed.configureTestingModule({declarations: [App]});
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();
          fixture.destroy();

          expect(logs).toEqual(['OnDestroy Value']);
        });

    it('should only call ngOnDestroy of value when providing via useExisting', () => {
      const logs: string[] = [];

      @Injectable()
      class InjectableWithDestroyHookToken {
        ngOnDestroy() { logs.push('OnDestroy Token'); }
      }

      @Injectable()
      class InjectableWithDestroyHookExisting {
        ngOnDestroy() { logs.push('OnDestroy Existing'); }
      }

      @Component({
        template: '',
        providers: [
          InjectableWithDestroyHookExisting, {
            provide: InjectableWithDestroyHookToken,
            useExisting: InjectableWithDestroyHookExisting
          }
        ]
      })
      class App {
        constructor(foo1: InjectableWithDestroyHookExisting, foo2: InjectableWithDestroyHookToken) {
        }
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(logs).toEqual(['OnDestroy Existing']);
    });

  });
});
