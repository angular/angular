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
import {defineComponent} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, element, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, listener, text, tick} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {createRendererType2} from '../../src/view/index';

import {getAnimationRendererFactory2, getRendererFactory2} from './imported_renderer2';
import {TemplateFixture, containerEl, document, renderComponent, renderToHtml, toHtml} from './render_util';

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
      encapsulation: ViewEncapsulation.None,
      selectors: [['some-component']],
      consts: 1,
      vars: 0,
      template: function(rf: RenderFlags, ctx: SomeComponent) {
        if (rf & RenderFlags.Create) {
          logs.push('component create');
          text(0, 'foo');
        }
        if (rf & RenderFlags.Update) {
          logs.push('component update');
        }
      },
      factory: () => new SomeComponent
    });
  }

  class SomeComponentWhichThrows {
    static ngComponentDef = defineComponent({
      type: SomeComponentWhichThrows,
      encapsulation: ViewEncapsulation.None,
      selectors: [['some-component-with-Error']],
      consts: 0,
      vars: 0,
      template: function(rf: RenderFlags, ctx: SomeComponentWhichThrows) {
        throw(new Error('SomeComponentWhichThrows threw'));
      },
      factory: () => new SomeComponentWhichThrows
    });
  }

  function Template(rf: RenderFlags, ctx: any) {
    if (rf & RenderFlags.Create) {
      logs.push('function create');
      text(0, 'bar');
    }
    if (rf & RenderFlags.Update) {
      logs.push('function update');
    }
  }

  const directives = [SomeComponent, SomeComponentWhichThrows];

  function TemplateWithComponent(rf: RenderFlags, ctx: any) {
    if (rf & RenderFlags.Create) {
      logs.push('function_with_component create');
      text(0, 'bar');
      element(1, 'some-component');
    }
    if (rf & RenderFlags.Update) {
      logs.push('function_with_component update');
    }
  }

  beforeEach(() => { logs = []; });

  it('should work with a component', () => {
    const component = renderComponent(SomeComponent, {rendererFactory});
    expect(logs).toEqual(
        ['create', 'create', 'begin', 'component create', 'component update', 'end']);

    logs = [];
    tick(component);
    expect(logs).toEqual(['begin', 'component update', 'end']);
  });

  it('should work with a component which throws', () => {
    expect(() => renderComponent(SomeComponentWhichThrows, {rendererFactory})).toThrow();
    expect(logs).toEqual(['create', 'create', 'begin', 'end']);
  });

  it('should work with a template', () => {
    renderToHtml(Template, {}, 1, 0, null, null, rendererFactory);
    expect(logs).toEqual(['create', 'begin', 'function create', 'function update', 'end']);

    logs = [];
    renderToHtml(Template, {});
    expect(logs).toEqual(['begin', 'function update', 'end']);
  });

  it('should work with a template which contains a component', () => {
    renderToHtml(TemplateWithComponent, {}, 2, 0, directives, null, rendererFactory);
    expect(logs).toEqual([
      'create', 'begin', 'function_with_component create', 'create', 'component create',
      'function_with_component update', 'component update', 'end'
    ]);

    logs = [];
    renderToHtml(TemplateWithComponent, {}, 2, 0, directives);
    expect(logs).toEqual(['begin', 'function_with_component update', 'component update', 'end']);
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
      encapsulation: ViewEncapsulation.None,
      selectors: [['some-component']],
      consts: 1,
      vars: 0,
      template: function(rf: RenderFlags, ctx: SomeComponent) {
        if (rf & RenderFlags.Create) {
          text(0, 'foo');
        }
      },
      factory: () => new SomeComponent
    });
  }

  class SomeComponentWithAnimation {
    // TODO(issue/24571): remove '!'.
    exp !: string;
    callback(event: AnimationEvent) {
      eventLogs.push(`${event.fromState ? event.fromState : event.toState} - ${event.phaseName}`);
    }
    static ngComponentDef = defineComponent({
      type: SomeComponentWithAnimation,
      selectors: [['some-component']],
      consts: 2,
      vars: 1,
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
      },
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

describe('Renderer2 destruction hooks', () => {
  const rendererFactory = getRendererFactory2(document);

  it('should call renderer.destroyNode for each node destroyed', () => {
    let condition = true;

    function createTemplate() {
      elementStart(0, 'div');
      { container(1); }
      elementEnd();
    }

    function updateTemplate() {
      containerRefreshStart(1);
      {
        if (condition) {
          let rf1 = embeddedViewStart(1, 3, 0);
          {
            if (rf1 & RenderFlags.Create) {
              element(0, 'span');
              element(1, 'span');
              element(2, 'span');
            }
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    const t = new TemplateFixture(
        createTemplate, updateTemplate, 2, 0, null, null, null, rendererFactory);

    expect(t.html).toEqual('<div><span></span><span></span><span></span></div>');

    condition = false;
    t.update();
    expect(t.html).toEqual('<div></div>');
    expect(ngDevMode).toHaveProperties({rendererDestroy: 0, rendererDestroyNode: 3});
  });

  it('should call renderer.destroy for each component destroyed', () => {
    class SimpleComponent {
      static ngComponentDef = defineComponent({
        type: SimpleComponent,
        encapsulation: ViewEncapsulation.None,
        selectors: [['simple']],
        consts: 1,
        vars: 0,
        template: function(rf: RenderFlags, ctx: SimpleComponent) {
          if (rf & RenderFlags.Create) {
            element(0, 'span');
          }
        },
        factory: () => new SimpleComponent,
      });
    }

    let condition = true;

    function createTemplate() {
      elementStart(0, 'div');
      { container(1); }
      elementEnd();
    }

    function updateTemplate() {
      containerRefreshStart(1);
      {
        if (condition) {
          let rf1 = embeddedViewStart(1, 3, 0);
          {
            if (rf1 & RenderFlags.Create) {
              element(0, 'simple');
              element(1, 'span');
              element(2, 'simple');
            }
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    const t = new TemplateFixture(
        createTemplate, updateTemplate, 2, 0, [SimpleComponent], null, null, rendererFactory);

    expect(t.html).toEqual(
        '<div><simple><span></span></simple><span></span><simple><span></span></simple></div>');

    condition = false;
    t.update();
    expect(t.html).toEqual('<div></div>');
    expect(ngDevMode).toHaveProperties({rendererDestroy: 2, rendererDestroyNode: 3});
  });
});
