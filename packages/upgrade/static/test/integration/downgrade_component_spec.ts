/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Compiler,
  Component,
  destroyPlatform,
  Directive,
  ElementRef,
  EventEmitter,
  Injector,
  input,
  Input,
  NgModule,
  NgModuleRef,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import {fakeAsync, tick, waitForAsync} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {downgradeComponent, UpgradeComponent, UpgradeModule} from '../../../static';

import * as angular from '../../../src/common/src/angular1';
import {$ROOT_SCOPE} from '../../../src/common/src/constants';
import {
  html,
  multiTrim,
  withEachNg1Version,
} from '../../../src/common/test/helpers/common_test_helpers';

import {$apply, bootstrap} from './static_test_helpers';

withEachNg1Version(() => {
  describe('downgrade ng2 component', () => {
    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should bind properties, events', waitForAsync(() => {
      const ng1Module = angular.module_('ng1', []).run(($rootScope: angular.IScope) => {
        $rootScope['name'] = 'world';
        $rootScope['dataA'] = 'A';
        $rootScope['dataB'] = 'B';
        $rootScope['modelA'] = 'initModelA';
        $rootScope['modelB'] = 'initModelB';
        $rootScope['eventA'] = '?';
        $rootScope['eventB'] = '?';
      });

      @Component({
        selector: 'ng2',
        inputs: ['literal', 'interpolate', 'oneWayA', 'oneWayB', 'twoWayA', 'twoWayB'],
        outputs: [
          'eventA',
          'eventB',
          'twoWayAEmitter: twoWayAChange',
          'twoWayBEmitter: twoWayBChange',
        ],
        template:
          'ignore: {{ignore}}; ' +
          'literal: {{literal}}; interpolate: {{interpolate}}; ' +
          'oneWayA: {{oneWayA}}; oneWayB: {{oneWayB}}; ' +
          'twoWayA: {{twoWayA}}; twoWayB: {{twoWayB}}; ({{ngOnChangesCount}})',
        standalone: false,
      })
      class Ng2Component implements OnChanges {
        ngOnChangesCount = 0;
        ignore = '-';
        literal = '?';
        interpolate = '?';
        oneWayA = '?';
        oneWayB = '?';
        twoWayA = '?';
        twoWayB = '?';
        eventA = new EventEmitter();
        eventB = new EventEmitter();
        twoWayAEmitter = new EventEmitter();
        twoWayBEmitter = new EventEmitter();

        ngOnChanges(changes: SimpleChanges) {
          const assert = (prop: string, value: any) => {
            const propVal = (this as any)[prop];
            if (propVal != value) {
              throw new Error(`Expected: '${prop}' to be '${value}' but was '${propVal}'`);
            }
          };

          const assertChange = (prop: string, value: any) => {
            assert(prop, value);
            if (!changes[prop]) {
              throw new Error(`Changes record for '${prop}' not found.`);
            }
            const actualValue = changes[prop].currentValue;
            if (actualValue != value) {
              throw new Error(
                `Expected changes record for'${prop}' to be '${value}' but was '${actualValue}'`,
              );
            }
          };

          switch (this.ngOnChangesCount++) {
            case 0:
              assert('ignore', '-');
              assertChange('literal', 'Text');
              assertChange('interpolate', 'Hello world');
              assertChange('oneWayA', 'A');
              assertChange('oneWayB', 'B');
              assertChange('twoWayA', 'initModelA');
              assertChange('twoWayB', 'initModelB');

              this.twoWayAEmitter.emit('newA');
              this.twoWayBEmitter.emit('newB');
              this.eventA.emit('aFired');
              this.eventB.emit('bFired');
              break;
            case 1:
              assertChange('twoWayA', 'newA');
              assertChange('twoWayB', 'newB');
              break;
            case 2:
              assertChange('interpolate', 'Hello everyone');
              break;
            default:
              throw new Error('Called too many times! ' + JSON.stringify(changes));
          }
        }
      }

      ng1Module.directive(
        'ng2',
        downgradeComponent({
          component: Ng2Component,
        }),
      );

      @NgModule({declarations: [Ng2Component], imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const element = html(`
           <div>
             <ng2 literal="Text" interpolate="Hello {{name}}"
                 bind-one-way-a="dataA" [one-way-b]="dataB"
                 bindon-two-way-a="modelA" [(two-way-b)]="modelB"
                 on-event-a='eventA=$event' (event-b)="eventB=$event"></ng2>
             | modelA: {{modelA}}; modelB: {{modelB}}; eventA: {{eventA}}; eventB: {{eventB}};
           </div>`);

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        expect(multiTrim(document.body.textContent)).toEqual(
          'ignore: -; ' +
            'literal: Text; interpolate: Hello world; ' +
            'oneWayA: A; oneWayB: B; twoWayA: newA; twoWayB: newB; (2) | ' +
            'modelA: newA; modelB: newB; eventA: aFired; eventB: bFired;',
        );

        $apply(upgrade, 'name = "everyone"');
        expect(multiTrim(document.body.textContent)).toEqual(
          'ignore: -; ' +
            'literal: Text; interpolate: Hello everyone; ' +
            'oneWayA: A; oneWayB: B; twoWayA: newA; twoWayB: newB; (3) | ' +
            'modelA: newA; modelB: newB; eventA: aFired; eventB: bFired;',
        );
      });
    }));

    it('should bind properties to signal inputs', waitForAsync(() => {
      const ng1Module = angular.module_('ng1', []).run(($rootScope: angular.IScope) => {
        $rootScope['name'] = 'world';
      });

      @Component({
        selector: 'ng2',
        inputs: ['message'],
        template: 'Message: {{message()}}',
        standalone: false,
      })
      class Ng2Component {
        message = input<string>('');
      }

      @NgModule({declarations: [Ng2Component], imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      // Hack to wire up the `input()` signal correctly, since our JIT tests don't run with the
      // transform which supports `input()`.
      (Ng2Component as any).ɵcmp.inputs.message = ['message', /* InputFlags.SignalBased */ 1];

      ng1Module.directive(
        'ng2',
        downgradeComponent({
          component: Ng2Component,
        }),
      );

      const element = html(`
        <div>
          <ng2 literal="Text" message="Hello {{name}}"></ng2>
        </div>`);

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        expect(multiTrim(document.body.textContent)).toEqual('Message: Hello world');

        $apply(upgrade, 'name = "everyone"');
        expect(multiTrim(document.body.textContent)).toEqual('Message: Hello everyone');
      });
    }));

    it('should bind properties to onpush components', waitForAsync(() => {
      const ng1Module = angular.module_('ng1', []).run(($rootScope: angular.IScope) => {
        $rootScope['dataB'] = 'B';
      });

      @Component({
        selector: 'ng2',
        inputs: ['oneWayB'],
        template: 'oneWayB: {{oneWayB}}',
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: false,
      })
      class Ng2Component {
        ngOnChangesCount = 0;
        oneWayB = '?';
      }

      ng1Module.directive(
        'ng2',
        downgradeComponent({
          component: Ng2Component,
        }),
      );

      @NgModule({declarations: [Ng2Component], imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const element = html(`
          <div>
            <ng2 [one-way-b]="dataB"></ng2>
          </div>`);

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        expect(multiTrim(document.body.textContent)).toEqual('oneWayB: B');
        $apply(upgrade, 'dataB= "everyone"');
        expect(multiTrim(document.body.textContent)).toEqual('oneWayB: everyone');
      });
    }));

    it('should support two-way binding and event listener', waitForAsync(() => {
      const listenerSpy = jasmine.createSpy('$rootScope.listener');
      const ng1Module = angular.module_('ng1', []).run(($rootScope: angular.IScope) => {
        $rootScope['value'] = 'world';
        $rootScope['listener'] = listenerSpy;
      });

      @Component({
        selector: 'ng2',
        template: `model: {{ model }};`,
        standalone: false,
      })
      class Ng2Component implements OnChanges {
        ngOnChangesCount = 0;
        @Input() model = '?';
        @Output() modelChange = new EventEmitter();

        ngOnChanges(changes: SimpleChanges) {
          switch (this.ngOnChangesCount++) {
            case 0:
              expect(changes['model'].currentValue).toBe('world');
              this.modelChange.emit('newC');
              break;
            case 1:
              expect(changes['model'].currentValue).toBe('newC');
              break;
            default:
              throw new Error('Called too many times! ' + JSON.stringify(changes));
          }
        }
      }

      ng1Module.directive('ng2', downgradeComponent({component: Ng2Component}));

      @NgModule({declarations: [Ng2Component], imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const element = html(`
          <div>
            <ng2 [(model)]="value" (model-change)="listener($event)"></ng2>
            | value: {{value}}
          </div>
        `);

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        expect(multiTrim(element.textContent)).toEqual('model: newC; | value: newC');
        expect(listenerSpy).toHaveBeenCalledWith('newC');
      });
    }));

    it('should run change-detection on every digest (by default)', waitForAsync(() => {
      let ng2Component: Ng2Component;

      @Component({
        selector: 'ng2',
        template: '{{ value1 }} | {{ value2 }}',
        standalone: false,
      })
      class Ng2Component {
        @Input() value1 = -1;
        @Input() value2 = -1;

        constructor() {
          ng2Component = this;
        }
      }

      @NgModule({
        imports: [BrowserModule, UpgradeModule],
        declarations: [Ng2Component],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng2', downgradeComponent({component: Ng2Component}))
        .run(($rootScope: angular.IRootScopeService) => {
          $rootScope['value1'] = 0;
          $rootScope['value2'] = 0;
        });

      const element = html('<ng2 [value1]="value1" value2="{{ value2 }}"></ng2>');

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        const $rootScope = upgrade.$injector.get('$rootScope') as angular.IRootScopeService;

        expect(element.textContent).toBe('0 | 0');

        // Digest should invoke CD
        $rootScope.$digest();
        $rootScope.$digest();
        expect(element.textContent).toBe('0 | 0');

        // Internal changes should be detected on digest
        ng2Component.value1 = 1;
        ng2Component.value2 = 2;
        $rootScope.$digest();
        expect(element.textContent).toBe('1 | 2');

        // Digest should propagate change in prop-bound input
        $rootScope.$apply('value1 = 3');
        expect(element.textContent).toBe('3 | 2');

        // Digest should propagate change in attr-bound input
        ng2Component.value1 = 4;
        $rootScope.$apply('value2 = 5');
        expect(element.textContent).toBe('4 | 5');

        // Digest should propagate changes that happened before the digest
        $rootScope['value1'] = 6;
        expect(element.textContent).toBe('4 | 5');

        $rootScope.$digest();
        expect(element.textContent).toBe('6 | 5');
      });
    }));

    it('should not run change-detection on every digest when opted out', waitForAsync(() => {
      let ng2Component: Ng2Component;

      @Component({
        selector: 'ng2',
        template: '{{ value1 }} | {{ value2 }}',
        standalone: false,
      })
      class Ng2Component {
        @Input() value1 = -1;
        @Input() value2 = -1;

        constructor() {
          ng2Component = this;
        }
      }

      @NgModule({
        imports: [BrowserModule, UpgradeModule],
        declarations: [Ng2Component],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng2', downgradeComponent({component: Ng2Component, propagateDigest: false}))
        .run(($rootScope: angular.IRootScopeService) => {
          $rootScope['value1'] = 0;
          $rootScope['value2'] = 0;
        });

      const element = html('<ng2 [value1]="value1" value2="{{ value2 }}"></ng2>');

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        const $rootScope = upgrade.$injector.get('$rootScope') as angular.IRootScopeService;

        expect(element.textContent).toBe('0 | 0');

        // Digest should not invoke CD
        $rootScope.$digest();
        $rootScope.$digest();
        expect(element.textContent).toBe('0 | 0');

        // Digest should not invoke CD, even if component values have changed (internally)
        ng2Component.value1 = 1;
        ng2Component.value2 = 2;
        $rootScope.$digest();
        expect(element.textContent).toBe('0 | 0');

        // Digest should invoke CD, if prop-bound input has changed
        $rootScope.$apply('value1 = 3');
        expect(element.textContent).toBe('3 | 2');

        // Digest should invoke CD, if attr-bound input has changed
        ng2Component.value1 = 4;
        $rootScope.$apply('value2 = 5');
        expect(element.textContent).toBe('4 | 5');

        // Digest should invoke CD, if input has changed before the digest
        $rootScope['value1'] = 6;
        $rootScope.$digest();
        expect(element.textContent).toBe('6 | 5');
      });
    }));

    it('should still run normal Angular change-detection regardless of `propagateDigest`', fakeAsync(() => {
      @Component({
        selector: 'ng2',
        template: '{{ value }}',
        standalone: false,
      })
      class Ng2Component {
        value = 'foo';
        constructor() {
          setTimeout(() => (this.value = 'bar'), 1000);
        }
      }

      @NgModule({
        imports: [BrowserModule, UpgradeModule],
        declarations: [Ng2Component],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng2A', downgradeComponent({component: Ng2Component, propagateDigest: true}))
        .directive('ng2B', downgradeComponent({component: Ng2Component, propagateDigest: false}));

      const element = html('<ng2-a></ng2-a> | <ng2-b></ng2-b>');

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        expect(element.textContent).toBe('foo | foo');

        tick(1000);
        expect(element.textContent).toBe('bar | bar');
      });
    }));

    it('should initialize inputs in time for `ngOnChanges`', waitForAsync(() => {
      @Component({
        selector: 'ng2',
        template: ` ngOnChangesCount: {{ ngOnChangesCount }} | firstChangesCount:
          {{ firstChangesCount }} | initialValue: {{ initialValue }}`,
        standalone: false,
      })
      class Ng2Component implements OnChanges {
        ngOnChangesCount = 0;
        firstChangesCount = 0;
        @Input() foo: string = '';
        initialValue: string = this.foo;

        ngOnChanges(changes: SimpleChanges) {
          this.ngOnChangesCount++;

          if (this.ngOnChangesCount === 1) {
            this.initialValue = this.foo;
          }

          if (changes['foo'] && changes['foo'].isFirstChange()) {
            this.firstChangesCount++;
          }
        }
      }

      @NgModule({
        imports: [BrowserModule, UpgradeModule],
        declarations: [Ng2Component],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng2', downgradeComponent({component: Ng2Component}));

      const element = html(`
           <ng2 [foo]="'foo'"></ng2>
           <ng2 foo="bar"></ng2>
           <ng2 [foo]="'baz'" ng-if="true"></ng2>
           <ng2 foo="qux" ng-if="true"></ng2>
         `);

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        const nodes = element.querySelectorAll('ng2');
        const expectedTextWith = (value: string) =>
          `ngOnChangesCount: 1 | firstChangesCount: 1 | initialValue: ${value}`;

        expect(multiTrim(nodes[0].textContent)).toBe(expectedTextWith('foo'));
        expect(multiTrim(nodes[1].textContent)).toBe(expectedTextWith('bar'));
        expect(multiTrim(nodes[2].textContent)).toBe(expectedTextWith('baz'));
        expect(multiTrim(nodes[3].textContent)).toBe(expectedTextWith('qux'));
      });
    }));

    it('should bind to ng-model', waitForAsync(() => {
      const ng1Module = angular.module_('ng1', []).run(($rootScope: angular.IScope) => {
        $rootScope['modelA'] = 'A';
      });

      let ng2Instance: Ng2;
      @Component({
        selector: 'ng2',
        template: '<span>{{_value}}</span>',
        standalone: false,
      })
      class Ng2 {
        private _value: any = '';
        private _onChangeCallback: (_: any) => void = () => {};
        private _onTouchedCallback: () => void = () => {};
        constructor() {
          ng2Instance = this;
        }
        writeValue(value: any) {
          this._value = value;
        }
        registerOnChange(fn: any) {
          this._onChangeCallback = fn;
        }
        registerOnTouched(fn: any) {
          this._onTouchedCallback = fn;
        }
        doTouch() {
          this._onTouchedCallback();
        }
        doChange(newValue: string) {
          this._value = newValue;
          this._onChangeCallback(newValue);
        }
      }

      ng1Module.directive('ng2', downgradeComponent({component: Ng2}));

      const element = html(`<div><ng2 ng-model="modelA"></ng2> | {{modelA}}</div>`);

      @NgModule({declarations: [Ng2], imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      platformBrowserDynamic()
        .bootstrapModule(Ng2Module)
        .then((ref) => {
          const adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
          adapter.bootstrap(element, [ng1Module.name]);
          const $rootScope = adapter.$injector.get('$rootScope');

          expect(multiTrim(document.body.textContent)).toEqual('A | A');

          $rootScope.modelA = 'B';
          $rootScope.$apply();
          expect(multiTrim(document.body.textContent)).toEqual('B | B');

          ng2Instance.doChange('C');
          expect($rootScope.modelA).toBe('C');
          expect(multiTrim(document.body.textContent)).toEqual('C | C');

          const downgradedElement = <Element>document.body.querySelector('ng2');
          expect(downgradedElement.classList.contains('ng-touched')).toBe(false);

          ng2Instance.doTouch();
          $rootScope.$apply();
          expect(downgradedElement.classList.contains('ng-touched')).toBe(true);
        });
    }));

    it('should properly run cleanup when ng1 directive is destroyed', waitForAsync(() => {
      let destroyed = false;
      @Component({
        selector: 'ng2',
        template: '<ul><li>test1</li><li>test2</li></ul>',
        standalone: false,
      })
      class Ng2Component implements OnDestroy {
        ngOnDestroy() {
          destroyed = true;
        }
      }

      @NgModule({declarations: [Ng2Component], imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng1', () => {
          return {template: '<div ng-if="!destroyIt"><ng2></ng2></div>'};
        })
        .directive('ng2', downgradeComponent({component: Ng2Component}));
      const element = html('<ng1></ng1>');
      platformBrowserDynamic()
        .bootstrapModule(Ng2Module)
        .then((ref) => {
          const adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
          adapter.bootstrap(element, [ng1Module.name]);

          const ng2Element = angular.element(element.querySelector('ng2') as Element);
          const ng2Descendants = Array.from(element.querySelectorAll('ng2 li')).map(
            angular.element,
          );
          let ng2ElementDestroyed = false;
          let ng2DescendantsDestroyed = [false, false];

          ng2Element.data!('test', 42);
          ng2Descendants.forEach((elem, i) => elem.data!('test', i));
          ng2Element.on!('$destroy', () => (ng2ElementDestroyed = true));
          ng2Descendants.forEach((elem, i) =>
            elem.on!('$destroy', () => (ng2DescendantsDestroyed[i] = true)),
          );

          expect(element.textContent).toBe('test1test2');
          expect(destroyed).toBe(false);
          expect(ng2Element.data!('test')).toBe(42);
          ng2Descendants.forEach((elem, i) => expect(elem.data!('test')).toBe(i));
          expect(ng2ElementDestroyed).toBe(false);
          expect(ng2DescendantsDestroyed).toEqual([false, false]);

          const $rootScope = adapter.$injector.get('$rootScope');
          $rootScope.$apply('destroyIt = true');

          expect(element.textContent).toBe('');
          expect(destroyed).toBe(true);
          expect(ng2Element.data!('test')).toBeUndefined();
          ng2Descendants.forEach((elem) => expect(elem.data!('test')).toBeUndefined());
          expect(ng2ElementDestroyed).toBe(true);
          expect(ng2DescendantsDestroyed).toEqual([true, true]);
        });
    }));

    it('should properly run cleanup with multiple levels of nesting', waitForAsync(() => {
      let destroyed = false;

      @Component({
        selector: 'ng2-outer',
        template: '<div *ngIf="!destroyIt"><ng1></ng1></div>',
        standalone: false,
      })
      class Ng2OuterComponent {
        @Input() destroyIt = false;
      }

      @Component({
        selector: 'ng2-inner',
        template: 'test',
        standalone: false,
      })
      class Ng2InnerComponent implements OnDestroy {
        ngOnDestroy() {
          destroyed = true;
        }
      }

      @Directive({
        selector: 'ng1',
        standalone: false,
      })
      class Ng1ComponentFacade extends UpgradeComponent {
        constructor(elementRef: ElementRef, injector: Injector) {
          super('ng1', elementRef, injector);
        }
      }

      @NgModule({
        imports: [BrowserModule, UpgradeModule],
        declarations: [Ng1ComponentFacade, Ng2InnerComponent, Ng2OuterComponent],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng1', () => ({template: '<ng2-inner></ng2-inner>'}))
        .directive('ng2Inner', downgradeComponent({component: Ng2InnerComponent}))
        .directive('ng2Outer', downgradeComponent({component: Ng2OuterComponent}));

      const element = html('<ng2-outer [destroy-it]="destroyIt"></ng2-outer>');

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        expect(element.textContent).toBe('test');
        expect(destroyed).toBe(false);

        $apply(upgrade, 'destroyIt = true');

        expect(element.textContent).toBe('');
        expect(destroyed).toBe(true);
      });
    }));

    it('should destroy the AngularJS app when `PlatformRef` is destroyed', waitForAsync(() => {
      @Component({
        selector: 'ng2',
        template: '<span>NG2</span>',
        standalone: false,
      })
      class Ng2Component {}

      @NgModule({
        declarations: [Ng2Component],
        imports: [BrowserModule, UpgradeModule],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .component('ng1', {template: '<ng2></ng2>'})
        .directive('ng2', downgradeComponent({component: Ng2Component}));

      const element = html('<div><ng1></ng1></div>');
      const platformRef = platformBrowserDynamic();

      platformRef.bootstrapModule(Ng2Module).then((ref) => {
        const upgrade = ref.injector.get(UpgradeModule);
        upgrade.bootstrap(element, [ng1Module.name]);

        const $rootScope: angular.IRootScopeService = upgrade.$injector.get($ROOT_SCOPE);
        const rootScopeDestroySpy = spyOn($rootScope, '$destroy');

        const appElem = angular.element(element);
        const ng1Elem = angular.element(element.querySelector('ng1') as Element);
        const ng2Elem = angular.element(element.querySelector('ng2') as Element);
        const ng2ChildElem = angular.element(element.querySelector('ng2 span') as Element);

        // Attach data to all elements.
        appElem.data!('testData', 1);
        ng1Elem.data!('testData', 2);
        ng2Elem.data!('testData', 3);
        ng2ChildElem.data!('testData', 4);

        // Verify data can be retrieved.
        expect(appElem.data!('testData')).toBe(1);
        expect(ng1Elem.data!('testData')).toBe(2);
        expect(ng2Elem.data!('testData')).toBe(3);
        expect(ng2ChildElem.data!('testData')).toBe(4);

        expect(rootScopeDestroySpy).not.toHaveBeenCalled();

        // Destroy `PlatformRef`.
        platformRef.destroy();

        // Verify `$rootScope` has been destroyed and data has been cleaned up.
        expect(rootScopeDestroySpy).toHaveBeenCalled();

        expect(appElem.data!('testData')).toBeUndefined();
        expect(ng1Elem.data!('testData')).toBeUndefined();
        expect(ng2Elem.data!('testData')).toBeUndefined();
        expect(ng2ChildElem.data!('testData')).toBeUndefined();
      });
    }));

    it('should work when compiled outside the dom (by fallback to the root ng2.injector)', waitForAsync(() => {
      @Component({
        selector: 'ng2',
        template: 'test',
        standalone: false,
      })
      class Ng2Component {}

      @NgModule({declarations: [Ng2Component], imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng1', [
          '$compile',
          ($compile: angular.ICompileService) => {
            return {
              link: function (
                $scope: angular.IScope,
                $element: angular.IAugmentedJQuery,
                $attrs: angular.IAttributes,
              ) {
                // here we compile some HTML that contains a downgraded component
                // since it is not currently in the DOM it is not able to "require"
                // an ng2 injector so it should use the `moduleInjector` instead.
                const compiled = $compile('<ng2></ng2>');
                const template = compiled($scope);
                $element.append!(template);
              },
            };
          },
        ])
        .directive('ng2', downgradeComponent({component: Ng2Component}));

      const element = html('<ng1></ng1>');
      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        // the fact that the body contains the correct text means that the
        // downgraded component was able to access the moduleInjector
        // (since there is no other injector in this system)
        expect(multiTrim(document.body.textContent)).toEqual('test');
      });
    }));

    it('should allow attribute selectors for downgraded components', waitForAsync(() => {
      @Component({
        selector: '[itWorks]',
        template: 'It works',
        standalone: false,
      })
      class WorksComponent {}

      @NgModule({declarations: [WorksComponent], imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('worksComponent', downgradeComponent({component: WorksComponent}));

      const element = html('<works-component></works-component>');

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        expect(multiTrim(document.body.textContent)).toBe('It works');
      });
    }));

    it('should allow attribute selectors for components in ng2', waitForAsync(() => {
      @Component({
        selector: '[itWorks]',
        template: 'It works',
        standalone: false,
      })
      class WorksComponent {}

      @Component({
        selector: 'root-component',
        template: '<span itWorks></span>!',
        standalone: false,
      })
      class RootComponent {}

      @NgModule({
        declarations: [RootComponent, WorksComponent],
        imports: [BrowserModule, UpgradeModule],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('rootComponent', downgradeComponent({component: RootComponent}));

      const element = html('<root-component></root-component>');

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        expect(multiTrim(document.body.textContent)).toBe('It works!');
      });
    }));

    it('should respect hierarchical dependency injection for ng2', waitForAsync(() => {
      @Component({
        selector: 'parent',
        template: 'parent(<ng-content></ng-content>)',
        standalone: false,
      })
      class ParentComponent {}

      @Component({
        selector: 'child',
        template: 'child',
        standalone: false,
      })
      class ChildComponent {
        constructor(parent: ParentComponent) {}
      }

      @NgModule({
        declarations: [ParentComponent, ChildComponent],
        imports: [BrowserModule, UpgradeModule],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('parent', downgradeComponent({component: ParentComponent}))
        .directive('child', downgradeComponent({component: ChildComponent}));

      const element = html('<parent><child></child></parent>');

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        expect(multiTrim(document.body.textContent)).toBe('parent(child)');
      });
    }));

    it('should be compiled synchronously, if possible', waitForAsync(() => {
      @Component({
        selector: 'ng2A',
        template: '<ng-content></ng-content>',
        standalone: false,
      })
      class Ng2ComponentA {}

      @Component({
        selector: 'ng2B',
        template: "{{ 'Ng2 template' }}",
        standalone: false,
      })
      class Ng2ComponentB {}

      @NgModule({
        declarations: [Ng2ComponentA, Ng2ComponentB],
        imports: [BrowserModule, UpgradeModule],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng2A', downgradeComponent({component: Ng2ComponentA}))
        .directive('ng2B', downgradeComponent({component: Ng2ComponentB}));

      const element = html('<ng2-a><ng2-b></ng2-b></ng2-a>');

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
        expect(element.textContent).toBe('Ng2 template');
      });
    }));

    it('should work with ng2 lazy loaded components', waitForAsync(() => {
      let componentInjector: Injector;

      @Component({
        selector: 'ng2',
        template: '',
        standalone: false,
      })
      class Ng2Component {
        constructor(injector: Injector) {
          componentInjector = injector;
        }
      }

      @NgModule({
        declarations: [Ng2Component],
        imports: [BrowserModule, UpgradeModule],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      @Component({
        template: '',
        standalone: false,
      })
      class LazyLoadedComponent {
        constructor(public module: NgModuleRef<any>) {}
      }

      @NgModule({
        declarations: [LazyLoadedComponent],
      })
      class LazyLoadedModule {}

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng2', downgradeComponent({component: Ng2Component}));

      const element = html('<ng2></ng2>');

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        const modInjector = upgrade.injector;
        // Emulate the router lazy loading a module and creating a component
        const compiler = modInjector.get(Compiler);
        const modFactory = compiler.compileModuleSync(LazyLoadedModule);
        const childMod = modFactory.create(modInjector);
        const cmpFactory =
          childMod.componentFactoryResolver.resolveComponentFactory(LazyLoadedComponent)!;
        const lazyCmp = cmpFactory.create(componentInjector);

        expect(lazyCmp.instance.module.injector === childMod.injector).toBe(true);
      });
    }));

    it('should throw if `downgradedModule` is specified', waitForAsync(() => {
      @Component({
        selector: 'ng2',
        template: '',
        standalone: false,
      })
      class Ng2Component {}

      @NgModule({
        declarations: [Ng2Component],
        imports: [BrowserModule, UpgradeModule],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng2', downgradeComponent({component: Ng2Component, downgradedModule: 'foo'}));

      const element = html('<ng2></ng2>');

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(
        () => {
          throw new Error('Expected bootstraping to fail.');
        },
        (err) =>
          expect(err.message).toBe(
            "Error while instantiating component 'Ng2Component': 'downgradedModule' " +
              'unexpectedly specified.\n' +
              "You should not specify a value for 'downgradedModule', unless you are " +
              "downgrading more than one Angular module (via 'downgradeModule()').",
          ),
      );
    }));
  });

  describe('standalone', () => {
    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should downgrade a standalone component using NgModule APIs', waitForAsync(() => {
      @Component({selector: 'ng2', standalone: true, template: 'Hi from Angular!'})
      class Ng2Component {}

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng2', downgradeComponent({component: Ng2Component}));

      @NgModule({
        imports: [BrowserModule, UpgradeModule, Ng2Component],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const element = html('<ng2></ng2>');
      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
        expect(element.textContent).toBe('Hi from Angular!');
      });
    }));
  });
});
