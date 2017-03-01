/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, InjectionToken, Input, Provider} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('integration tests', () => {
    let fixture: ComponentFixture<TestComponent>;


    describe('directives', () => {
      it('should support dotted selectors', async(() => {
           @Directive({selector: '[dot.name]'})
           class MyDir {
             @Input('dot.name') value: string;
           }

           TestBed.configureTestingModule({
             declarations: [
               MyDir,
               TestComponent,
             ],
           });

           const template = `<div [dot.name]="'foo'"></div>`;
           fixture = createTestComponent(template);
           fixture.detectChanges();
           const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
           expect(myDir.value).toEqual('foo');
         }));

      describe('should call ngOnDestroy on the service provided using token: ', () => {
        let log: string[];
        class Destroyable {
          ngOnDestroy(): void { log.push('destroyed'); }
        }

        beforeEach(() => log = []);

        it('random class', async(() => {
             class Service {}

             shouldCallOnDestroy({provide: Service, useClass: Destroyable});
           }));

        it('string', async(() => shouldCallOnDestroy({provide: 'token', useClass: Destroyable})));

        it('the same class',
           async(() => shouldCallOnDestroy({provide: Destroyable, useClass: Destroyable})));

        it('InjectionToken', async(() => {
             const TOKEN = new InjectionToken<any>('token');
             shouldCallOnDestroy({provide: TOKEN, useClass: Destroyable});
           }));

        function shouldCallOnDestroy(provider: Provider): void {
          @Component({selector: 'cmp', template: '', providers: [provider]})
          class SomeCmp {
          }

          TestBed.configureTestingModule({declarations: [SomeCmp]});

          const component = TestBed.createComponent(SomeCmp);
          expect(log.length).toBe(0);

          component.destroy();

          expect(log.length).toBe(1);
          expect(log[0]).toBe('destroyed');
        }
      });
    });

  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
