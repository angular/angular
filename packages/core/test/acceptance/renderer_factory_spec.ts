/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AnimationEvent} from '@angular/animations';
import {
  ɵAnimationEngine,
  ɵAnimationRendererFactory,
  ɵNoopAnimationStyleNormalizer,
} from '@angular/animations/browser';
import {MockAnimationDriver, MockAnimationPlayer} from '@angular/animations/browser/testing';
import {
  CommonModule,
  DOCUMENT,
  ɵPLATFORM_BROWSER_ID as PLATFORM_BROWSER_ID,
  ɵPLATFORM_SERVER_ID as PLATFORM_SERVER_ID,
} from '@angular/common';
import {
  ɵDomRendererFactory2 as DomRendererFactory2,
  EventManager,
  ɵSharedStylesHost,
} from '@angular/platform-browser';
import {isBrowser, isNode} from '@angular/private/testing';
import {expect} from '@angular/private/testing/matchers';
import {
  Component,
  DoCheck,
  NgZone,
  Renderer2,
  RendererFactory2,
  RendererStyleFlags2,
  RendererType2,
  ViewEncapsulation,
} from '../../src/core';
import {RElement} from '../../src/render3/interfaces/renderer_dom';
import {NoopNgZone} from '../../src/zone/ng_zone';
import {TestBed} from '../../testing';

describe('renderer factory lifecycle', () => {
  let logs: string[] = [];
  let lastCapturedType: RendererType2 | null = null;

  @Component({
    selector: 'some-component',
    template: `foo`,
    standalone: false,
  })
  class SomeComponent implements DoCheck {
    ngOnInit() {
      logs.push('some_component create');
    }
    ngDoCheck() {
      logs.push('some_component update');
    }
  }

  @Component({
    selector: 'some-component-with-error',
    template: `With error`,
    standalone: false,
  })
  class SomeComponentWhichThrows {
    ngOnInit() {
      throw new Error('SomeComponentWhichThrows threw');
    }
  }

  @Component({
    selector: 'lol',
    template: `<some-component></some-component>`,
    standalone: false,
  })
  class TestComponent implements DoCheck {
    ngOnInit() {
      logs.push('test_component create');
    }
    ngDoCheck() {
      logs.push('test_component update');
    }
  }

  /** Creates a patched renderer factory that pushes entries to the test log */
  function createPatchedRendererFactory(document: any) {
    let rendererFactory = getRendererFactory2(document);
    const createRender = rendererFactory.createRenderer;

    rendererFactory.createRenderer = (hostElement: any, type: RendererType2 | null) => {
      logs.push('create');
      lastCapturedType = type;
      return createRender.apply(rendererFactory, [hostElement, type]);
    };

    rendererFactory.begin = () => logs.push('begin');
    rendererFactory.end = () => logs.push('end');

    return rendererFactory;
  }

  beforeEach(() => {
    logs = [];

    TestBed.configureTestingModule({
      declarations: [SomeComponent, SomeComponentWhichThrows, TestComponent],
      providers: [
        {
          provide: RendererFactory2,
          useFactory: (document: any) => createPatchedRendererFactory(document),
          deps: [DOCUMENT],
        },
      ],
    });
  });

  it('should work with a component', () => {
    const fixture = TestBed.createComponent(SomeComponent);
    fixture.componentRef.changeDetectorRef.detectChanges();
    expect(logs).toEqual([
      'create',
      'create',
      'begin',
      'end',
      'begin',
      'some_component create',
      'some_component update',
      'end',
    ]);
    logs = [];
    fixture.componentRef.changeDetectorRef.detectChanges();
    expect(logs).toEqual(['begin', 'some_component update', 'end']);
  });

  it('should work with a component which throws', () => {
    expect(() => {
      const fixture = TestBed.createComponent(SomeComponentWhichThrows);
      fixture.componentRef.changeDetectorRef.detectChanges();
    }).toThrow();
    expect(logs).toEqual(['create', 'create', 'begin', 'end', 'begin', 'end']);
  });

  it('should pass in the component styles directly into the underlying renderer', () => {
    @Component({
      styles: ['.some-css-class { color: red; }'],
      template: '...',
      encapsulation: ViewEncapsulation.ShadowDom,
    })
    class StyledComp {}

    TestBed.createComponent(StyledComp);

    expect(lastCapturedType!.styles).toEqual(['.some-css-class { color: red; }']);
    expect(lastCapturedType!.encapsulation).toEqual(ViewEncapsulation.ShadowDom);
  });

  describe('component animations', () => {
    it('should pass in the component styles directly into the underlying renderer', () => {
      const animA = {name: 'a'};
      const animB = {name: 'b'};

      @Component({
        template: '',
        animations: [animA, animB],
      })
      class AnimComp {}

      TestBed.createComponent(AnimComp);

      const capturedAnimations = lastCapturedType!.data!['animation'];
      expect(Array.isArray(capturedAnimations)).toBeTruthy();
      expect(capturedAnimations.length).toEqual(2);
      expect(capturedAnimations).toContain(animA);
      expect(capturedAnimations).toContain(animB);
    });

    it('should include animations in the renderType data array even if the array is empty', () => {
      @Component({
        template: '...',
        animations: [],
      })
      class AnimComp {}

      TestBed.createComponent(AnimComp);

      const data = lastCapturedType!.data;
      expect(data['animation']).toEqual([]);
    });

    it('should allow [@trigger] bindings to be picked up by the underlying renderer', () => {
      @Component({
        template: '<div @fooAnimation></div>',
        animations: [],
      })
      class AnimComp {}

      const rendererFactory = new MockRendererFactory(['setProperty']);

      TestBed.configureTestingModule({
        providers: [
          {
            provide: RendererFactory2,
            useValue: rendererFactory,
            deps: [DOCUMENT],
          },
        ],
      });

      const fixture = TestBed.createComponent(AnimComp);
      fixture.detectChanges();

      const renderer = rendererFactory.lastRenderer!;
      const spy = renderer.spies['setProperty'];
      const [_, prop, __] = spy.calls.mostRecent().args;

      expect(prop).toEqual('@fooAnimation');
    });
  });

  it('should not invoke renderer destroy method for embedded views', () => {
    @Component({
      selector: 'comp',
      imports: [CommonModule],
      template: `
        <div>Root view</div>
        <div *ngIf="visible">Child view</div>
      `,
    })
    class Comp {
      visible = true;
    }

    const rendererFactory = new MockRendererFactory(['destroy', 'createElement']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: RendererFactory2,
          useValue: rendererFactory,
          deps: [DOCUMENT],
        },
      ],
    });

    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp!.visible = false;
    fixture.detectChanges();

    comp!.visible = true;
    fixture.detectChanges();

    const renderer = rendererFactory.lastRenderer!;
    const destroySpy = renderer.spies['destroy'];
    const createElementSpy = renderer.spies['createElement'];

    // we should never see `destroy` method being called
    // in case child views are created/removed.
    expect(destroySpy.calls.count()).toBe(0);

    // Make sure other methods on the renderer were invoked.
    expect(createElementSpy.calls.count() > 0).toBe(true);
  });
});

describe('animation renderer factory', () => {
  let eventLogs: string[] = [];
  let rendererFactory: RendererFactory2 | null = null;

  function getAnimationLog(): MockAnimationPlayer[] {
    return MockAnimationDriver.log as MockAnimationPlayer[];
  }

  beforeEach(() => {
    eventLogs = [];
    rendererFactory = null;
    MockAnimationDriver.log = [];

    TestBed.configureTestingModule({
      declarations: [SomeComponentWithAnimation, SomeComponent],
      providers: [
        {
          provide: RendererFactory2,
          useFactory: (d: Document) => (rendererFactory = getAnimationRendererFactory2(d)),
          deps: [DOCUMENT],
        },
      ],
    });
  });

  @Component({
    selector: 'some-component',
    template: `
      <div [@myAnimation]="exp"
           (@myAnimation.start)="callback($event)"
           (@myAnimation.done)="callback($event)">
        foo
      </div>
    `,
    animations: [
      {
        type: 7,
        name: 'myAnimation',
        definitions: [
          {
            type: 1,
            expr: '* => on',
            animation: [
              {type: 4, styles: {type: 6, styles: {opacity: 1}, offset: null}, timings: 10},
            ],
            options: null,
          },
        ],
        options: {},
      },
    ],
    standalone: false,
  })
  class SomeComponentWithAnimation {
    exp: string | undefined;

    callback(event: AnimationEvent) {
      eventLogs.push(`${event.fromState ? event.fromState : event.toState} - ${event.phaseName}`);
    }
  }

  @Component({
    selector: 'some-component',
    template: 'foo',
    standalone: false,
  })
  class SomeComponent {}

  it('should work with components without animations', () => {
    const fixture = TestBed.createComponent(SomeComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual('foo');
  });

  isBrowser &&
    it('should work with animated components', (done) => {
      const fixture = TestBed.createComponent(SomeComponentWithAnimation);
      fixture.detectChanges();

      expect(rendererFactory).toBeTruthy();
      expect(fixture.nativeElement.innerHTML).toMatch(
        /<div class="ng-tns-c\d+-0 ng-trigger ng-trigger-myAnimation">\s+foo\s+<\/div>/,
      );

      fixture.componentInstance.exp = 'on';
      fixture.detectChanges();

      const [player] = getAnimationLog();
      expect(player.keyframes).toEqual([
        new Map<string, string | number>([
          ['opacity', '*'],
          ['offset', 0],
        ]),
        new Map<string, string | number>([
          ['opacity', 1],
          ['offset', 1],
        ]),
      ]);
      player.finish();

      rendererFactory!.whenRenderingDone!().then(() => {
        expect(eventLogs).toEqual(['void - start', 'void - done', 'on - start', 'on - done']);
        done();
      });
    });
});

function getRendererFactory2(document: Document): RendererFactory2 {
  const fakeNgZone: NgZone = new NoopNgZone();
  const eventManager = new EventManager([], fakeNgZone);
  const appId = 'app-id';
  const rendererFactory = new DomRendererFactory2(
    eventManager,
    new ɵSharedStylesHost(document, appId),
    appId,
    true,
    document,
    isNode ? PLATFORM_SERVER_ID : PLATFORM_BROWSER_ID,
    fakeNgZone,
  );
  const origCreateRenderer = rendererFactory.createRenderer;
  rendererFactory.createRenderer = function (element: any, type: RendererType2 | null) {
    const renderer = origCreateRenderer.call(this, element, type);
    renderer.destroyNode = () => {};
    return renderer;
  };
  return rendererFactory;
}

function getAnimationRendererFactory2(document: Document): RendererFactory2 {
  const fakeNgZone: NgZone = new NoopNgZone();
  return new ɵAnimationRendererFactory(
    getRendererFactory2(document),
    new ɵAnimationEngine(document, new MockAnimationDriver(), new ɵNoopAnimationStyleNormalizer()),
    fakeNgZone,
  );
}

describe('custom renderer', () => {
  @Component({
    selector: 'some-component',
    template: `<div><span></span></div>`,
    standalone: false,
  })
  class SomeComponent {}

  /**
   * Creates a patched renderer factory that creates elements with a shape different than DOM node
   */
  function createPatchedRendererFactory(document: Document) {
    let rendererFactory = getRendererFactory2(document);
    const origCreateRenderer = rendererFactory.createRenderer;
    rendererFactory.createRenderer = function (element: any, type: RendererType2 | null) {
      const renderer = origCreateRenderer.call(this, element, type);
      renderer.appendChild = () => {};
      renderer.createElement = (name: string) => ({
        name,
        el: document.createElement(name),
      });
      return renderer;
    };

    return rendererFactory;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SomeComponent],
      providers: [
        {
          provide: RendererFactory2,
          useFactory: (document: Document) => createPatchedRendererFactory(document),
          deps: [DOCUMENT],
        },
      ],
    });
  });

  it('should not trigger errors', () => {
    expect(() => {
      const fixture = TestBed.createComponent(SomeComponent);
      fixture.detectChanges();
    }).not.toThrow();
  });
});

describe('Renderer2 destruction hooks', () => {
  @Component({
    selector: 'some-component',
    template: `
      <span *ngIf="isContentVisible">A</span>
      <span *ngIf="isContentVisible">B</span>
      <span *ngIf="isContentVisible">C</span>
    `,
    standalone: false,
  })
  class SimpleApp {
    isContentVisible = true;
  }

  @Component({
    selector: 'basic-comp',
    template: 'comp(<ng-content></ng-content>)',
    standalone: false,
  })
  class BasicComponent {}

  @Component({
    selector: 'some-component',
    template: `
      <basic-comp *ngIf="isContentVisible">A</basic-comp>
      <basic-comp *ngIf="isContentVisible">B</basic-comp>
      <basic-comp *ngIf="isContentVisible">C</basic-comp>
    `,
    standalone: false,
  })
  class AppWithComponents {
    isContentVisible = true;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SimpleApp, AppWithComponents, BasicComponent],
      providers: [
        {
          provide: RendererFactory2,
          useFactory: (document: Document) => getRendererFactory2(document),
          deps: [DOCUMENT],
        },
      ],
    });
  });

  it('should call renderer.destroyNode for each node destroyed', () => {
    const fixture = TestBed.createComponent(SimpleApp);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('ABC');

    fixture.componentInstance.isContentVisible = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('');
  });

  it('should call renderer.destroy for each component destroyed', () => {
    const fixture = TestBed.createComponent(AppWithComponents);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('comp(A)comp(B)comp(C)');

    fixture.componentInstance.isContentVisible = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('');
  });
});

export class MockRendererFactory implements RendererFactory2 {
  lastRenderer: any;
  private _spyOnMethods: string[];

  constructor(spyOnMethods?: string[]) {
    this._spyOnMethods = spyOnMethods || [];
  }

  createRenderer(hostElement: RElement | null, rendererType: RendererType2 | null): Renderer2 {
    const renderer = (this.lastRenderer = new MockRenderer(this._spyOnMethods));
    return renderer;
  }
}

class MockRenderer implements Renderer2 {
  public spies: {[methodName: string]: any} = {};
  data = {};

  destroyNode: ((node: any) => void) | null = null;

  constructor(spyOnMethods: string[]) {
    spyOnMethods.forEach((methodName) => {
      this.spies[methodName] = spyOn(this as any, methodName).and.callThrough();
    });
  }

  destroy(): void {}
  createComment(value: string): Comment {
    return document.createComment(value);
  }
  createElement(name: string, namespace?: string | null): Element {
    return namespace ? document.createElementNS(namespace, name) : document.createElement(name);
  }
  createText(value: string): Text {
    return document.createTextNode(value);
  }
  appendChild(parent: RElement, newChild: Node): void {
    parent.appendChild(newChild);
  }
  insertBefore(parent: Node, newChild: Node, refChild: Node | null): void {
    parent.insertBefore(newChild, refChild);
  }
  removeChild(parent: RElement, oldChild: Element): void {
    oldChild.remove();
  }
  selectRootElement(selectorOrNode: string | any): RElement {
    return typeof selectorOrNode === 'string'
      ? document.querySelector<HTMLElement>(selectorOrNode)!
      : selectorOrNode;
  }
  parentNode(node: Node): Element | null {
    return node.parentNode as Element;
  }
  nextSibling(node: Node): Node | null {
    return node.nextSibling;
  }
  setAttribute(el: RElement, name: string, value: string, namespace?: string | null): void {
    // set all synthetic attributes as properties
    if (name[0] === '@') {
      this.setProperty(el, name, value);
    } else {
      el.setAttribute(name, value);
    }
  }
  removeAttribute(el: RElement, name: string, namespace?: string | null): void {}
  addClass(el: RElement, name: string): void {}
  removeClass(el: RElement, name: string): void {}
  setStyle(el: RElement, style: string, value: any, flags?: RendererStyleFlags2): void {}
  removeStyle(el: RElement, style: string, flags?: RendererStyleFlags2): void {}
  setProperty(el: RElement, name: string, value: any): void {
    (el as any)[name] = value;
  }
  setValue(node: Text, value: string): void {
    node.textContent = value;
  }

  // TODO: Deprecate in favor of addEventListener/removeEventListener
  listen(target: Node, eventName: string, callback: (event: any) => boolean | void): () => void {
    return () => {};
  }
}
