/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEvent} from '@angular/animations';
import {ɵAnimationEngine, ɵNoopAnimationStyleNormalizer} from '@angular/animations/browser';
import {MockAnimationDriver, MockAnimationPlayer} from '@angular/animations/browser/testing';
import {DOCUMENT} from '@angular/common';
import {Component, DoCheck, NgZone, RendererFactory2, RendererType2} from '@angular/core';
import {NoopNgZone} from '@angular/core/src/zone/ng_zone';
import {TestBed} from '@angular/core/testing';
import {EventManager, ɵDomSharedStylesHost} from '@angular/platform-browser';
import {ɵAnimationRendererFactory} from '@angular/platform-browser/animations';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ServerRendererFactory2} from '@angular/platform-server/src/server_renderer';
import {onlyInIvy} from '@angular/private/testing';

describe('renderer factory lifecycle', () => {
  let logs: string[] = [];

  @Component({selector: 'some-component', template: `foo`})
  class SomeComponent implements DoCheck {
    ngOnInit() { logs.push('some_component create'); }
    ngDoCheck() { logs.push('some_component update'); }
  }

  @Component({selector: 'some-component-with-error', template: `With error`})
  class SomeComponentWhichThrows {
    ngOnInit() { throw new Error('SomeComponentWhichThrows threw'); }
  }

  @Component({selector: 'lol', template: `<some-component></some-component>`})
  class TestComponent implements DoCheck {
    ngOnInit() { logs.push('test_component create'); }
    ngDoCheck() { logs.push('test_component update'); }
  }

  /** Creates a patched renderer factory that pushes entries to the test log */
  function createPatchedRendererFactory(document: any) {
    let rendererFactory = getRendererFactory2(document);
    const createRender = rendererFactory.createRenderer;

    rendererFactory.createRenderer = (hostElement: any, type: RendererType2 | null) => {
      logs.push('create');
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
      providers: [{
        provide: RendererFactory2,
        useFactory: (document: any) => createPatchedRendererFactory(document),
        deps: [DOCUMENT]
      }]
    });
  });

  onlyInIvy('FW-1320: Ivy creates renderer twice.').it('should work with a component', () => {
    const fixture = TestBed.createComponent(SomeComponent);
    fixture.detectChanges();
    expect(logs).toEqual(
        ['create', 'create', 'begin', 'some_component create', 'some_component update', 'end']);

    logs = [];
    fixture.detectChanges();
    expect(logs).toEqual(['begin', 'some_component update', 'end']);
  });

  onlyInIvy('FW-1320: Ivy creates renderer twice.')
      .it('should work with a component which throws', () => {
        expect(() => {
          const fixture = TestBed.createComponent(SomeComponentWhichThrows);
          fixture.detectChanges();
        }).toThrow();
        expect(logs).toEqual(['create', 'create', 'begin', 'end']);
      });
});

describe('animation renderer factory', () => {
  let eventLogs: string[] = [];
  let rendererFactory: RendererFactory2|null = null;

  function getAnimationLog(): MockAnimationPlayer[] {
    return MockAnimationDriver.log as MockAnimationPlayer[];
  }

  beforeEach(() => {
    eventLogs = [];
    rendererFactory = null;
    MockAnimationDriver.log = [];

    TestBed.configureTestingModule({
      declarations: [SomeComponentWithAnimation, SomeComponent],
      providers: [{
        provide: RendererFactory2,
        useFactory: (d: any) => rendererFactory = getAnimationRendererFactory2(d),
        deps: [DOCUMENT]
      }]
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
    animations: [{
      type: 7,
      name: 'myAnimation',
      definitions: [{
        type: 1,
        expr: '* => on',
        animation: [{type: 4, styles: {type: 6, styles: {opacity: 1}, offset: null}, timings: 10}],
        options: null
      }],
      options: {}
    }]
  })
  class SomeComponentWithAnimation {
    exp: string|undefined;

    callback(event: AnimationEvent) {
      eventLogs.push(`${event.fromState ? event.fromState : event.toState} - ${event.phaseName}`);
    }
  }

  @Component({selector: 'some-component', template: 'foo'})
  class SomeComponent {
  }

  it('should work with components without animations', () => {
    const fixture = TestBed.createComponent(SomeComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual('foo');
  });

  isBrowser && it('should work with animated components', (done) => {
    const fixture = TestBed.createComponent(SomeComponentWithAnimation);
    fixture.detectChanges();

    expect(rendererFactory).toBeTruthy();
    expect(fixture.nativeElement.innerHTML)
        .toMatch(/<div class="ng-tns-c\d+-0 ng-trigger ng-trigger-myAnimation">\s+foo\s+<\/div>/);

    fixture.componentInstance.exp = 'on';
    fixture.detectChanges();

    const [player] = getAnimationLog();
    expect(player.keyframes).toEqual([
      {opacity: '*', offset: 0},
      {opacity: 1, offset: 1},
    ]);
    player.finish();

    rendererFactory !.whenRenderingDone !().then(() => {
      expect(eventLogs).toEqual(['void - start', 'void - done', 'on - start', 'on - done']);
      done();
    });
  });
});

function getRendererFactory2(document: any): RendererFactory2 {
  const fakeNgZone: NgZone = new NoopNgZone();
  const eventManager = new EventManager([], fakeNgZone);
  const rendererFactory = new ServerRendererFactory2(
      eventManager, fakeNgZone, document, new ɵDomSharedStylesHost(document));
  const origCreateRenderer = rendererFactory.createRenderer;
  rendererFactory.createRenderer = function(element: any, type: RendererType2|null) {
    const renderer = origCreateRenderer.call(this, element, type);
    renderer.destroyNode = () => {};
    return renderer;
  };
  return rendererFactory;
}

function getAnimationRendererFactory2(document: any): RendererFactory2 {
  const fakeNgZone: NgZone = new NoopNgZone();
  return new ɵAnimationRendererFactory(
      getRendererFactory2(document),
      new ɵAnimationEngine(
          document.body, new MockAnimationDriver(), new ɵNoopAnimationStyleNormalizer()),
      fakeNgZone);
}
