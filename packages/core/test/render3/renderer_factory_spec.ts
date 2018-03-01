/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEvent} from '@angular/animations';
import {MockAnimationDriver, MockAnimationPlayer} from '@angular/animations/browser/testing';

import {RendererType2, ViewEncapsulation} from '../../src/core';
import {defineComponent, detectChanges} from '../../src/render3/index';
import {bind, directiveRefresh, elementEnd, elementProperty, elementStart, listener, text} from '../../src/render3/instructions';
import {createRendererType2} from '../../src/view/index';

import {getAnimationRendererFactory2, getRendererFactory2} from './imported_renderer2';
import {containerEl, document, renderComponent, renderToHtml, toHtml} from './render_util';

describe('renderer factory lifecycle', () => {
  let logs: string[] = [];
  let rendererFactory = getRendererFactory2(document);
  const createRender = rendererFactory.createRenderer;
  rendererFactory.createRenderer = (hostElement: any, type: RendererType2 | null) => {
    logs.push('create');
    return createRender.apply(rendererFactory, [hostElement, type]);
  };
  rendererFactory.begin = () => logs.push('begin');
  rendererFactory.end = () => logs.push('end');

  class SomeComponent {
    static ngComponentDef = defineComponent({
      type: SomeComponent,
      tag: 'some-component',
      template: function(ctx: SomeComponent, cm: boolean) {
        logs.push('component');
        if (cm) {
          text(0, 'foo');
        }
      },
      factory: () => new SomeComponent
    });
  }

  class SomeComponentWhichThrows {
    static ngComponentDef = defineComponent({
      type: SomeComponentWhichThrows,
      tag: 'some-component-with-Error',
      template: function(ctx: SomeComponentWhichThrows, cm: boolean) {
        throw(new Error('SomeComponentWhichThrows threw'));
      },
      factory: () => new SomeComponentWhichThrows
    });
  }

  function Template(ctx: any, cm: boolean) {
    logs.push('function');
    if (cm) {
      text(0, 'bar');
    }
  }

  function TemplateWithComponent(ctx: any, cm: boolean) {
    logs.push('function_with_component');
    if (cm) {
      text(0, 'bar');
      elementStart(1, SomeComponent);
      elementEnd();
    }
    SomeComponent.ngComponentDef.h(2, 1);
    directiveRefresh(2, 1);
  }

  beforeEach(() => { logs = []; });

  it('should work with a component', () => {
    const component = renderComponent(SomeComponent, rendererFactory);
    expect(logs).toEqual(['create', 'create', 'begin', 'component', 'end']);

    logs = [];
    detectChanges(component);
    expect(logs).toEqual(['begin', 'component', 'end']);
  });

  it('should work with a component which throws', () => {
    expect(() => renderComponent(SomeComponentWhichThrows, rendererFactory)).toThrow();
    expect(logs).toEqual(['create', 'create', 'begin', 'end']);
  });

  it('should work with a template', () => {
    renderToHtml(Template, {}, rendererFactory);
    expect(logs).toEqual(['create', 'begin', 'function', 'end']);

    logs = [];
    renderToHtml(Template, {});
    expect(logs).toEqual(['begin', 'function', 'end']);
  });

  it('should work with a template which contains a component', () => {
    renderToHtml(TemplateWithComponent, {}, rendererFactory);
    expect(logs).toEqual(
        ['create', 'begin', 'function_with_component', 'create', 'component', 'end']);

    logs = [];
    renderToHtml(TemplateWithComponent, {});
    expect(logs).toEqual(['begin', 'function_with_component', 'component', 'end']);
  });

});

describe('animation renderer factory', () => {
  let eventLogs: string[] = [];
  function getLog(): MockAnimationPlayer[] {
    return MockAnimationDriver.log as MockAnimationPlayer[];
  }

  function resetLog() { MockAnimationDriver.log = []; }

  beforeEach(() => {
    eventLogs = [];
    resetLog();
  });

  class SomeComponent {
    static ngComponentDef = defineComponent({
      type: SomeComponent,
      tag: 'some-component',
      template: function(ctx: SomeComponent, cm: boolean) {
        if (cm) {
          text(0, 'foo');
        }
      },
      factory: () => new SomeComponent
    });
  }

  class SomeComponentWithAnimation {
    exp: string;
    callback(event: AnimationEvent) {
      eventLogs.push(`${event.fromState ? event.fromState : event.toState} - ${event.phaseName}`);
    }
    static ngComponentDef = defineComponent({
      type: SomeComponentWithAnimation,
      tag: 'some-component',
      template: function(ctx: SomeComponentWithAnimation, cm: boolean) {
        if (cm) {
          elementStart(0, 'div');
          {
            listener('@myAnimation.start', ctx.callback.bind(ctx));
            listener('@myAnimation.done', ctx.callback.bind(ctx));
            text(1, 'foo');
          }
          elementEnd();
        }
        elementProperty(0, '@myAnimation', bind(ctx.exp));
      },
      factory: () => new SomeComponentWithAnimation,
      rendererType: createRendererType2({
        encapsulation: ViewEncapsulation.None,
        styles: [],
        data: {
          animation: [{
            type: 7,
            name: 'myAnimation',
            definitions: [{
              type: 1,
              expr: '* => on',
              animation:
                  [{type: 4, styles: {type: 6, styles: {opacity: 1}, offset: null}, timings: 10}],
              options: null
            }],
            options: {}
          }]
        }
      }),
    });
  }

  it('should work with components without animations', () => {
    renderComponent(SomeComponent, getAnimationRendererFactory2(document));
    expect(toHtml(containerEl)).toEqual('foo');
  });

  isBrowser && it('should work with animated components', (done) => {
    const factory = getAnimationRendererFactory2(document);
    const component = renderComponent(SomeComponentWithAnimation, factory);
    expect(toHtml(containerEl))
        .toMatch(/<div class="ng-tns-c\d+-0 ng-trigger ng-trigger-myAnimation">foo<\/div>/);

    component.exp = 'on';
    detectChanges(component);

    const [player] = getLog();
    expect(player.keyframes).toEqual([
      {opacity: '*', offset: 0},
      {opacity: 1, offset: 1},
    ]);
    player.finish();

    factory.whenRenderingDone !().then(() => {
      expect(eventLogs).toEqual(['void - start', 'void - done', 'on - start', 'on - done']);
      done();
    });
  });
});
