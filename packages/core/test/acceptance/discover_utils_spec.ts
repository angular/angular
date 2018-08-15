/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CommonModule} from '@angular/common';
import {Component, Directive, HostBinding, InjectionToken, ViewChild} from '@angular/core';
import {isLView} from '@angular/core/src/render3/interfaces/type_checks';
import {CONTEXT} from '@angular/core/src/render3/interfaces/view';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {getElementStyles} from '@angular/core/testing/src/styling';
import {expect} from '@angular/core/testing/src/testing_internal';
import {onlyInIvy} from '@angular/private/testing';

import {getHostElement, markDirty} from '../../src/render3/index';
import {getComponent, getComponentLView, getContext, getDebugNode, getDirectives, getInjectionTokens, getInjector, getListeners, getLocalRefs, getOwningComponent, getRootComponents, loadLContext} from '../../src/render3/util/discovery_utils';

onlyInIvy('Ivy-specific utilities').describe('discovery utils', () => {
  let fixture: ComponentFixture<MyApp>;
  let myApp: MyApp;
  let dirA: DirectiveA[];
  let childComponent: DirectiveA[];
  let child: NodeListOf<Element>;
  let span: NodeListOf<Element>;
  let div: NodeListOf<Element>;
  let p: NodeListOf<Element>;
  let log: any[];

  beforeEach(() => {
    log = [];
    dirA = [];
    childComponent = [];
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [MyApp, DirectiveA, Child],
      providers: [{provide: String, useValue: 'Module'}]
    });
    fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();
    child = fixture.nativeElement.querySelectorAll('child');
    span = fixture.nativeElement.querySelectorAll('span');
    div = fixture.nativeElement.querySelectorAll('div');
    p = fixture.nativeElement.querySelectorAll('p');
  });

  @Component(
      {selector: 'child', template: '<p></p>', providers: [{provide: String, useValue: 'Child'}]})
  class Child {
    constructor() {
      childComponent.push(this);
    }
  }

  @Directive({selector: '[dirA]', exportAs: 'dirA'})
  class DirectiveA {
    constructor() {
      dirA.push(this);
    }
  }

  @Component({
    selector: 'my-app',
    template: `
      <span (click)="log($event)">{{text}}</span>
      <div dirA #div #foo="dirA"></div>
      <child></child>
      <child dirA #child></child>
      <child dirA *ngIf="true"></child>
      <ng-container><p></p></ng-container>
    `
  })
  class MyApp {
    text: string = 'INIT';
    constructor() {
      myApp = this;
    }

    log(event: any) {
      log.push(event);
    }
  }

  describe('getComponent', () => {
    it('should return null if no component', () => {
      expect(getComponent(span[0])).toEqual(null);
      expect(getComponent(div[0])).toEqual(null);
      expect(getComponent(p[0])).toEqual(null);
    });
    it('should throw when called on non-element', () => {
      expect(() => getComponent(dirA[0] as any)).toThrowError(/Expecting instance of DOM Element/);
      expect(() => getComponent(dirA[1] as any)).toThrowError(/Expecting instance of DOM Element/);
    });
    it('should return component from element', () => {
      expect(getComponent<MyApp>(fixture.nativeElement)).toEqual(myApp);
      expect(getComponent<Child>(child[0])).toEqual(childComponent[0]);
      expect(getComponent<Child>(child[1])).toEqual(childComponent[1]);
    });
  });

  describe('getComponentLView', () => {
    it('should retrieve component LView from element', () => {
      const childLView = getComponentLView(child[0]);
      expect(isLView(childLView)).toBe(true);
      expect(childLView[CONTEXT] instanceof Child).toBe(true);
    });

    it('should retrieve component LView from component instance', () => {
      const childLView = getComponentLView(childComponent[0]);
      expect(isLView(childLView)).toBe(true);
      expect(childLView[CONTEXT] instanceof Child).toBe(true);
    });
  });

  describe('getContext', () => {
    it('should throw when called on non-element', () => {
      expect(() => getContext(dirA[0] as any)).toThrowError(/Expecting instance of DOM Element/);
      expect(() => getContext(dirA[1] as any)).toThrowError(/Expecting instance of DOM Element/);
    });
    it('should return context from element', () => {
      expect(getContext<MyApp>(child[0])).toEqual(myApp);
      expect(getContext<{$implicit: boolean}>(child[2])!.$implicit).toEqual(true);
      expect(getContext<Child>(p[0])).toEqual(childComponent[0]);
    });
  });

  describe('getHostElement', () => {
    it('should return element on component', () => {
      expect(getHostElement(myApp)).toEqual(fixture.nativeElement);
      expect(getHostElement(childComponent[0])).toEqual(child[0]);
      expect(getHostElement(childComponent[1])).toEqual(child[1]);
    });
    it('should return element on directive', () => {
      expect(getHostElement(dirA[0])).toEqual(div[0]);
      expect(getHostElement(dirA[1])).toEqual(child[1]);
    });
    it('should throw on unknown target', () => {
      expect(() => getHostElement({})).toThrowError();  //
    });
  });

  describe('getInjector', () => {
    it('should return node-injector from element', () => {
      expect(getInjector(fixture.nativeElement).get(String)).toEqual('Module');
      expect(getInjector(child[0]).get(String)).toEqual('Child');
      expect(getInjector(p[0]).get(String)).toEqual('Child');
    });
    it('should return node-injector from component with providers', () => {
      expect(getInjector(myApp).get(String)).toEqual('Module');
      expect(getInjector(childComponent[0]).get(String)).toEqual('Child');
      expect(getInjector(childComponent[1]).get(String)).toEqual('Child');
    });
    it('should return node-injector from directive without providers', () => {
      expect(getInjector(dirA[0]).get(String)).toEqual('Module');
      expect(getInjector(dirA[1]).get(String)).toEqual('Child');
    });
  });

  describe('getDirectives', () => {
    it('should return empty array if no directives', () => {
      expect(getDirectives(fixture.nativeElement)).toEqual([]);
      expect(getDirectives(span[0])).toEqual([]);
      expect(getDirectives(child[0])).toEqual([]);
    });
    it('should return just directives', () => {
      expect(getDirectives(div[0])).toEqual([dirA[0]]);
      expect(getDirectives(child[1])).toEqual([dirA[1]]);
    });
  });

  describe('getOwningComponent', () => {
    it('should return null when called on root component', () => {
      expect(getOwningComponent(fixture.nativeElement)).toEqual(null);
      expect(getOwningComponent(myApp)).toEqual(null);
    });
    it('should return containing component of child component', () => {
      expect(getOwningComponent<MyApp>(child[0])).toEqual(myApp);
      expect(getOwningComponent<MyApp>(child[1])).toEqual(myApp);
      expect(getOwningComponent<MyApp>(child[2])).toEqual(myApp);

      expect(getOwningComponent<MyApp>(childComponent[0])).toEqual(myApp);
      expect(getOwningComponent<MyApp>(childComponent[1])).toEqual(myApp);
      expect(getOwningComponent<MyApp>(childComponent[2])).toEqual(myApp);
    });
    it('should return containing component of any view element', () => {
      expect(getOwningComponent<MyApp>(span[0])).toEqual(myApp);
      expect(getOwningComponent<MyApp>(div[0])).toEqual(myApp);
      expect(getOwningComponent<Child>(p[0])).toEqual(childComponent[0]);
      expect(getOwningComponent<Child>(p[1])).toEqual(childComponent[1]);
      expect(getOwningComponent<Child>(p[2])).toEqual(childComponent[2]);
    });
    it('should return containing component of child directive', () => {
      expect(getOwningComponent<MyApp>(dirA[0])).toEqual(myApp);
      expect(getOwningComponent<MyApp>(dirA[1])).toEqual(myApp);
    });
  });

  describe('getLocalRefs', () => {
    it('should retrieve empty map', () => {
      expect(getLocalRefs(fixture.nativeElement)).toEqual({});
      expect(getLocalRefs(myApp)).toEqual({});
      expect(getLocalRefs(span[0])).toEqual({});
      expect(getLocalRefs(child[0])).toEqual({});
    });

    it('should retrieve the local map', () => {
      expect(getLocalRefs(div[0])).toEqual({div: div[0], foo: dirA[0]});
      expect(getLocalRefs(dirA[0])).toEqual({div: div[0], foo: dirA[0]});

      expect(getLocalRefs(child[1])).toEqual({child: childComponent[1]});
      expect(getLocalRefs(dirA[1])).toEqual({child: childComponent[1]});
    });
  });

  describe('getRootComponents', () => {
    it('should return root components from component', () => {
      const rootComponents = [myApp];
      expect(getRootComponents(myApp)).toEqual(rootComponents);
      expect(getRootComponents(childComponent[0])).toEqual(rootComponents);
      expect(getRootComponents(childComponent[1])).toEqual(rootComponents);
      expect(getRootComponents(dirA[0])).toEqual(rootComponents);
      expect(getRootComponents(dirA[1])).toEqual(rootComponents);
      expect(getRootComponents(child[0])).toEqual(rootComponents);
      expect(getRootComponents(child[1])).toEqual(rootComponents);
      expect(getRootComponents(div[0])).toEqual(rootComponents);
      expect(getRootComponents(p[0])).toEqual(rootComponents);
    });
  });

  describe('getListeners', () => {
    it('should return no listeners', () => {
      expect(getListeners(fixture.nativeElement)).toEqual([]);
      expect(getListeners(child[0])).toEqual([]);
    });
    it('should return the listeners', () => {
      const listeners = getListeners(span[0]);
      expect(listeners.length).toEqual(1);
      expect(listeners[0].name).toEqual('click');
      expect(listeners[0].element).toEqual(span[0]);
      expect(listeners[0].useCapture).toEqual(false);
      expect(listeners[0].type).toEqual('dom');
      listeners[0].callback('CLICKED');
      expect(log).toEqual(['CLICKED']);
    });
  });

  describe('getInjectionTokens', () => {
    it('should retrieve tokens', () => {
      expect(getInjectionTokens(fixture.nativeElement)).toEqual([MyApp]);
      expect(getInjectionTokens(child[0])).toEqual([String, Child]);
      expect(getInjectionTokens(child[1])).toEqual([String, Child, DirectiveA]);
    });
  });

  describe('markDirty', () => {
    it('should re-render component', () => {
      expect(span[0].textContent).toEqual('INIT');
      myApp.text = 'WORKS';
      markDirty(myApp);
      fixture.detectChanges();
      expect(span[0].textContent).toEqual('WORKS');
    });
  });

  describe('loadLContext', () => {
    it('should work on components', () => {
      const lContext = loadLContext(child[0]);
      expect(lContext).toBeDefined();
      expect(lContext.native as any).toBe(child[0]);
    });

    it('should work on templates', () => {
      const templateComment = Array.from((fixture.nativeElement as HTMLElement).childNodes)
                                  .find((node: ChildNode) => node.nodeType === Node.COMMENT_NODE)!;
      const lContext = loadLContext(templateComment);
      expect(lContext).toBeDefined();
      expect(lContext.native as any).toBe(templateComment);
    });

    it('should work on ng-container', () => {
      const ngContainerComment = Array.from((fixture.nativeElement as HTMLElement).childNodes)
                                     .find(
                                         (node: ChildNode) => node.nodeType === Node.COMMENT_NODE &&
                                             node.textContent === `ng-container`)!;
      const lContext = loadLContext(ngContainerComment);
      expect(lContext).toBeDefined();
      expect(lContext.native as any).toBe(ngContainerComment);
    });
  });
});

onlyInIvy('Ivy-specific utilities').describe('discovery utils deprecated', () => {
  describe('getRootComponents()', () => {
    it('should return a list of the root components of the application from an element', () => {
      @Component({selector: 'inner-comp', template: '<div></div>'})
      class InnerComp {
      }

      @Component({selector: 'comp', template: '<inner-comp></inner-comp>'})
      class Comp {
      }

      TestBed.configureTestingModule({declarations: [Comp, InnerComp]});
      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();

      const hostElm = fixture.nativeElement;
      const innerElm = hostElm.querySelector('inner-comp')!;
      const divElm = hostElm.querySelector('div')!;
      const component = fixture.componentInstance;

      expect(getRootComponents(hostElm)!).toEqual([component]);
      expect(getRootComponents(innerElm)!).toEqual([component]);
      expect(getRootComponents(divElm)!).toEqual([component]);
    });
  });

  describe('getDirectives()', () => {
    it('should return a list of the directives that are on the given element', () => {
      @Directive({selector: '[my-dir-1]'})
      class MyDir1 {
      }

      @Directive({selector: '[my-dir-2]'})
      class MyDir2 {
      }

      @Directive({selector: '[my-dir-3]'})
      class MyDir3 {
      }

      @Component({
        selector: 'comp',
        template: `
          <div my-dir-1 my-dir-2></div>
          <div my-dir-3></div>
        `
      })
      class Comp {
        @ViewChild(MyDir1) myDir1Instance!: MyDir1;
        @ViewChild(MyDir2) myDir2Instance!: MyDir2;
        @ViewChild(MyDir3) myDir3Instance!: MyDir3;
      }

      TestBed.configureTestingModule({declarations: [Comp, MyDir1, MyDir2, MyDir3]});
      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();

      const hostElm = fixture.nativeElement;
      const elements = hostElm.querySelectorAll('div');

      const elm1 = elements[0];
      const elm1Dirs = getDirectives(elm1);
      expect(elm1Dirs).toContain(fixture.componentInstance.myDir1Instance!);
      expect(elm1Dirs).toContain(fixture.componentInstance.myDir2Instance!);

      const elm2 = elements[1];
      const elm2Dirs = getDirectives(elm2);
      expect(elm2Dirs).toContain(fixture.componentInstance.myDir3Instance!);
    });
  });

  describe('getInjector', () => {
    it('should return an injector that can return directive instances', () => {
      @Component({template: ''})
      class Comp {
      }

      TestBed.configureTestingModule({declarations: [Comp]});
      const fixture = TestBed.createComponent(Comp);
      const nodeInjector = getInjector(fixture.nativeElement);
      expect(nodeInjector.get(Comp)).toEqual(jasmine.any(Comp));
    });

    it('should return an injector that falls-back to a module injector', () => {
      @Component({template: ''})
      class Comp {
      }

      class TestToken {}
      const token = new InjectionToken<TestToken>('test token');

      TestBed.configureTestingModule(
          {declarations: [Comp], providers: [{provide: token, useValue: new TestToken()}]});
      const fixture = TestBed.createComponent(Comp);
      const nodeInjector = getInjector(fixture.nativeElement);
      expect(nodeInjector.get(token)).toEqual(jasmine.any(TestToken));
    });
  });

  describe('getLocalRefs', () => {
    it('should return a map of local refs for an element', () => {
      @Directive({selector: '[myDir]', exportAs: 'myDir'})
      class MyDir {
      }

      @Component({template: '<div myDir #elRef #dirRef="myDir"></div>'})
      class Comp {
      }

      TestBed.configureTestingModule({declarations: [Comp, MyDir]});
      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();

      const divEl = fixture.nativeElement.querySelector('div')!;
      const localRefs = getLocalRefs(divEl);

      expect(localRefs.elRef.tagName.toLowerCase()).toBe('div');
      expect(localRefs.dirRef.constructor).toBe(MyDir);
    });

    it('should return a map of local refs for an element with styling context', () => {
      @Component({template: '<div #elRef class="fooClass" [style.color]="color"></div>'})
      class Comp {
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [Comp]});
      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();

      const divEl = fixture.nativeElement.querySelector('div')!;
      const localRefs = getLocalRefs(divEl);

      expect(localRefs.elRef.tagName.toLowerCase()).toBe('div');
    });
  });

  describe('getDebugNode()', () => {
    it('should create an instance of `DebugNode` when called for a specific element', () => {
      @Component({
        template: `
          <div class="parent">
            <div class="child"></div>
          </div>
        `
      })
      class Comp {
      }

      TestBed.configureTestingModule({declarations: [Comp]});
      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();

      const parent = fixture.nativeElement.querySelector('.parent')!;
      const child = fixture.nativeElement.querySelector('.child')!;

      const parentDebug = getDebugNode(parent)!;
      const childDebug = getDebugNode(child)!;

      expect(parentDebug.native).toBe(parent);
      expect(childDebug.native).toBe(child);
    });

    it('should be able to pull debug information for a component host element', () => {
      @Component({
        selector: 'child-comp',
        template: `
          child comp
        `
      })
      class ChildComp {
        @HostBinding('style') public styles = {width: '200px', height: '400px'};
      }

      @Component({
        template: `
          <child-comp></child-comp>
        `
      })
      class Comp {
      }

      TestBed.configureTestingModule({declarations: [Comp, ChildComp]});
      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();

      const child = fixture.nativeElement.querySelector('child-comp')!;
      const childDebug = getDebugNode(child)!;

      expect(childDebug.native).toBe(child);
      expect(getElementStyles(child)).toEqual({
        width: '200px',
        height: '400px',
      });
    });
  });
});
