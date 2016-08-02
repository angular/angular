/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DebugElement, Injector, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {DynamicComponentLoader} from '@angular/core/src/linker/dynamic_component_loader';
import {ElementRef} from '@angular/core/src/linker/element_ref';
import {Component} from '@angular/core/src/metadata';
import {ComponentFixture, TestComponentBuilder} from '@angular/core/testing';
import {AsyncTestCompleter, beforeEach, beforeEachProviders, ddescribe, describe, iit, inject, it, xdescribe, xit} from '@angular/core/testing/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DOCUMENT} from '@angular/platform-browser/src/dom/dom_tokens';
import {el} from '@angular/platform-browser/testing/browser_util';
import {expect} from '@angular/platform-browser/testing/matchers';

import {Predicate} from '../../src/facade/collection';
import {BaseException} from '../../src/facade/exceptions';

export function main() {
  describe('DynamicComponentLoader', function() {
    describe('loading next to a location', () => {
      it('should work',
         inject(
             [DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
             (loader: DynamicComponentLoader, tcb: TestComponentBuilder,
              async: AsyncTestCompleter) => {
               tcb.createAsync(MyComp3).then((tc) => {
                 tc.detectChanges();
                 loader.loadNextToLocation(DynamicallyLoaded, tc.componentInstance.viewContainerRef)
                     .then(ref => {
                       expect(tc.debugElement.nativeElement).toHaveText('DynamicallyLoaded;');

                       async.done();
                     });
               });
             }));

      it('should return a disposable component ref',
         inject(
             [DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
             (loader: DynamicComponentLoader, tcb: TestComponentBuilder,
              async: AsyncTestCompleter) => {
               tcb.createAsync(MyComp3).then((tc) => {
                 tc.detectChanges();
                 loader.loadNextToLocation(DynamicallyLoaded, tc.componentInstance.viewContainerRef)
                     .then(ref => {
                       loader
                           .loadNextToLocation(
                               DynamicallyLoaded2, tc.componentInstance.viewContainerRef)
                           .then(ref2 => {
                             expect(tc.debugElement.nativeElement)
                                 .toHaveText('DynamicallyLoaded;DynamicallyLoaded2;');

                             ref2.destroy();

                             expect(tc.debugElement.nativeElement).toHaveText('DynamicallyLoaded;');

                             async.done();
                           });
                     });
               });
             }));

      it('should update host properties',
         inject(
             [DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
             (loader: DynamicComponentLoader, tcb: TestComponentBuilder,
              async: AsyncTestCompleter) => {
               tcb.createAsync(MyComp3).then((tc) => {
                 tc.detectChanges();

                 loader
                     .loadNextToLocation(
                         DynamicallyLoadedWithHostProps, tc.componentInstance.viewContainerRef)
                     .then(ref => {
                       ref.instance.id = 'new value';

                       tc.detectChanges();

                       var newlyInsertedElement = tc.debugElement.childNodes[1].nativeNode;
                       expect((<HTMLElement>newlyInsertedElement).id).toEqual('new value');

                       async.done();
                     });
               });
             }));



      it('should leave the view tree in a consistent state if hydration fails',
         inject(
             [DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
             (loader: DynamicComponentLoader, tcb: TestComponentBuilder,
              async: AsyncTestCompleter) => {
               tcb.createAsync(MyComp3).then((tc: ComponentFixture<any>) => {
                 tc.detectChanges();

                 loader
                     .loadNextToLocation(
                         DynamicallyLoadedThrows, tc.componentInstance.viewContainerRef)
                     .catch((error) => {
                       expect(error.message).toContain('ThrownInConstructor');
                       expect(() => tc.detectChanges()).not.toThrow();
                       async.done();
                       return null;
                     });
               });
             }));

      it('should allow to pass projectable nodes',
         inject(
             [DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
             (loader: DynamicComponentLoader, tcb: TestComponentBuilder,
              async: AsyncTestCompleter) => {
               tcb.createAsync(MyComp3).then((tc) => {
                 tc.detectChanges();
                 loader
                     .loadNextToLocation(
                         DynamicallyLoadedWithNgContent, tc.componentInstance.viewContainerRef,
                         null, [[getDOM().createTextNode('hello')]])
                     .then(ref => {
                       tc.detectChanges();
                       var newlyInsertedElement = tc.debugElement.childNodes[1].nativeNode;
                       expect(newlyInsertedElement).toHaveText('dynamic(hello)');
                       async.done();
                     });
               });
             }));

      it('should not throw if not enough projectable nodes are passed in',
         inject(
             [DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
             (loader: DynamicComponentLoader, tcb: TestComponentBuilder,
              async: AsyncTestCompleter) => {
               tcb.createAsync(MyComp3).then((tc) => {
                 tc.detectChanges();
                 loader
                     .loadNextToLocation(
                         DynamicallyLoadedWithNgContent, tc.componentInstance.viewContainerRef,
                         null, [])
                     .then((_) => { async.done(); });
               });
             }));

    });

    describe('loadAsRoot', () => {
      it('should allow to create, update and destroy components',
         inject(
             [AsyncTestCompleter, DynamicComponentLoader, DOCUMENT, Injector],
             (async: AsyncTestCompleter, loader: DynamicComponentLoader, doc: any /** TODO #9100 */,
              injector: Injector) => {
               var rootEl = createRootElement(doc, 'child-cmp');
               getDOM().appendChild(doc.body, rootEl);
               loader.loadAsRoot(ChildComp, null, injector).then((componentRef) => {
                 var el = new ComponentFixture<any>(componentRef, null, false);

                 expect(rootEl.parentNode).toBe(doc.body);

                 el.detectChanges();

                 expect(rootEl).toHaveText('hello');

                 componentRef.instance.ctxProp = 'new';

                 el.detectChanges();

                 expect(rootEl).toHaveText('new');

                 componentRef.destroy();

                 expect(rootEl.parentNode).toBeFalsy();

                 async.done();
               });
             }));

      it('should allow to pass projectable nodes',
         inject(
             [AsyncTestCompleter, DynamicComponentLoader, DOCUMENT, Injector],
             (async: AsyncTestCompleter, loader: DynamicComponentLoader, doc: any /** TODO #9100 */,
              injector: Injector) => {
               var rootEl = createRootElement(doc, 'dummy');
               getDOM().appendChild(doc.body, rootEl);
               loader
                   .loadAsRoot(
                       DynamicallyLoadedWithNgContent, null, injector, null,
                       [[getDOM().createTextNode('hello')]])
                   .then((_) => {
                     expect(rootEl).toHaveText('dynamic(hello)');

                     async.done();
                   });
             }));

    });

  });
}

function createRootElement(doc: any, name: string): any {
  var nodes = getDOM().querySelectorAll(doc, name);
  for (var i = 0; i < nodes.length; i++) {
    getDOM().remove(nodes[i]);
  }
  var rootEl = el(`<${name}></${name}>`);
  getDOM().appendChild(doc.body, rootEl);
  return rootEl;
}

function filterByDirective(type: Type): Predicate<DebugElement> {
  return (debugElement) => { return debugElement.providerTokens.indexOf(type) !== -1; };
}

@Component({selector: 'child-cmp', template: '{{ctxProp}}'})
class ChildComp {
  ctxProp: string;
  constructor(public elementRef: ElementRef) { this.ctxProp = 'hello'; }
}

@Component({selector: 'dummy', template: 'DynamicallyLoaded;'})
class DynamicallyLoaded {
}

@Component({selector: 'dummy', template: 'DynamicallyLoaded;'})
class DynamicallyLoadedThrows {
  constructor() { throw new BaseException('ThrownInConstructor'); }
}

@Component({selector: 'dummy', template: 'DynamicallyLoaded2;'})
class DynamicallyLoaded2 {
}

@Component({selector: 'dummy', host: {'[id]': 'id'}, template: 'DynamicallyLoadedWithHostProps;'})
class DynamicallyLoadedWithHostProps {
  id: string;

  constructor() { this.id = 'default'; }
}

@Component({selector: 'dummy', template: 'dynamic(<ng-content></ng-content>)'})
class DynamicallyLoadedWithNgContent {
  id: string;

  constructor() { this.id = 'default'; }
}

@Component({selector: 'my-comp', directives: [], template: '<div #loc></div>'})
class MyComp3 {
  ctxBoolProp: boolean;

  @ViewChild('loc', {read: ViewContainerRef}) viewContainerRef: ViewContainerRef;

  constructor() { this.ctxBoolProp = false; }
}
