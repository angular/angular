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
import {bind, elementEnd, elementProperty, elementStart, listener, text, tick} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
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
      selectors: [['some-component']],
      template: function(rf: RenderFlags, ctx: SomeComponent) {
        logs.push('component');
        if (rf & RenderFlags.Create) {
          text(0, 'foo');
        }
      },
      factory: () => new SomeComponent
    });
  }

  class SomeComponentWhichThrows {
    static ngComponentDef = defineComponent({
      type: SomeComponentWhichThrows,
      selectors: [['some-component-with-Error']],
      template: function(rf: RenderFlags, ctx: SomeComponentWhichThrows) {
        throw(new Error('SomeComponentWhichThrows threw'));
      },
      factory: () => new SomeComponentWhichThrows
    });
  }

  function Template(rf: RenderFlags, ctx: any) {
    logs.push('function');
    if (rf & RenderFlags.Create) {
      text(0, 'bar');
    }
  }

  const directives = [SomeComponent, SomeComponentWhichThrows];

  function TemplateWithComponent(rf: RenderFlags, ctx: any) {
    logs.push('function_with_component');
    if (rf & RenderFlags.Create) {
      text(0, 'bar');
      elementStart(1, 'some-component');
      elementEnd();
    }
  }

  beforeEach(() => { logs = []; });

  it('should work with a component', () => {
    const component = renderComponent(SomeComponent, {rendererFactory});
    expect(logs).toEqual(['create', 'create', 'begin', 'component', 'end']);

    logs = [];
    tick(component);
    expect(logs).toEqual(['begin', 'component', 'end']);
  });

  it('should work with a component which throws', () => {
    expect(() => renderComponent(SomeComponentWhichThrows, {rendererFactory})).toThrow();
    expect(logs).toEqual(['create', 'create', 'begin', 'end']);
  });

  it('should work with a template', () => {
    renderToHtml(Template, {}, null, null, rendererFactory);
    expect(logs).toEqual(['create', 'begin', 'function', 'end']);

    logs = [];
    renderToHtml(Template, {});
    expect(logs).toEqual(['begin', 'function', 'end']);
  });

  it('should work with a template which contains a component', () => {
    renderToHtml(TemplateWithComponent, {}, directives, null, rendererFactory);
    expect(logs).toEqual(
        ['create', 'begin', 'function_with_component', 'create', 'component', 'end']);

    logs = [];
    renderToHtml(TemplateWithComponent, {}, directives);
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
      selectors: [['some-component']],
      template: function(rf: RenderFlags, ctx: SomeComponent) {
        if (rf & RenderFlags.Create) {
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
      selectors: [['some-component']],
      template: function(rf: RenderFlags, ctx: SomeComponentWithAnimation) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          {
            listener('@myAnimation.start', ctx.callback.bind(ctx));
            listener('@myAnimation.done', ctx.callback.bind(ctx));
            text(1, 'foo');
          }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, '@myAnimation', bind(ctx.exp));
        }
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
    renderComponent(SomeComponent, {rendererFactory: getAnimationRendererFactory2(document)});
    expect(toHtml(containerEl)).toEqual('foo');
  });

  isBrowser && it('should work with animated components', (done) => {
    const rendererFactory = getAnimationRendererFactory2(document);
    const component = renderComponent(SomeComponentWithAnimation, {rendererFactory});
    expect(toHtml(containerEl))
        .toMatch(/<div class="ng-tns-c\d+-0 ng-trigger ng-trigger-myAnimation">foo<\/div>/);

    component.exp = 'on';
    tick(component);

    const [player] = getLog();
    expect(player.keyframes).toEqual([
      {opacity: '*', offset: 0},
      {opacity: 1, offset: 1},
    ]);
    player.finish();

    rendererFactory.whenRenderingDone !().then(() => {
      expect(eventLogs).toEqual(['void - start', 'void - done', 'on - start', 'on - done']);
      done();
    });
  });
});
