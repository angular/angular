/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RendererType2, ViewEncapsulation} from '../../src/core';
import {ɵɵdefineComponent} from '../../src/render3/index';
import {ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {getRendererFactory2} from './imported_renderer2';
import {TemplateFixture, document, renderToHtml} from './render_util';

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
    static ngComponentDef = ɵɵdefineComponent({
      type: SomeComponent,
      encapsulation: ViewEncapsulation.None,
      selectors: [['some-component']],
      consts: 1,
      vars: 0,
      template: function(rf: RenderFlags, ctx: SomeComponent) {
        if (rf & RenderFlags.Create) {
          logs.push('component create');
          ɵɵtext(0, 'foo');
        }
        if (rf & RenderFlags.Update) {
          logs.push('component update');
        }
      },
      factory: () => new SomeComponent
    });
  }

  class SomeComponentWhichThrows {
    static ngComponentDef = ɵɵdefineComponent({
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
      ɵɵtext(0, 'bar');
    }
    if (rf & RenderFlags.Update) {
      logs.push('function update');
    }
  }

  const directives = [SomeComponent, SomeComponentWhichThrows];

  function TemplateWithComponent(rf: RenderFlags, ctx: any) {
    if (rf & RenderFlags.Create) {
      logs.push('function_with_component create');
      ɵɵtext(0, 'bar');
      ɵɵelement(1, 'some-component');
    }
    if (rf & RenderFlags.Update) {
      logs.push('function_with_component update');
    }
  }

  beforeEach(() => { logs = []; });

  it('should work with a template', () => {
    renderToHtml(Template, {}, 1, 0, null, null, rendererFactory);
    expect(logs).toEqual(['create', 'function create', 'function update']);

    logs = [];
    renderToHtml(Template, {});
    expect(logs).toEqual(['begin', 'function update', 'end']);
  });

  it('should work with a template which contains a component', () => {
    renderToHtml(TemplateWithComponent, {}, 2, 0, directives, null, rendererFactory);
    expect(logs).toEqual([
      'create', 'function_with_component create', 'create', 'component create',
      'function_with_component update', 'component update'
    ]);

    logs = [];
    renderToHtml(TemplateWithComponent, {}, 2, 0, directives);
    expect(logs).toEqual(['begin', 'function_with_component update', 'component update', 'end']);
  });

});

describe('Renderer2 destruction hooks', () => {
  const rendererFactory = getRendererFactory2(document);

  it('should call renderer.destroyNode for each node destroyed', () => {
    let condition = true;

    function createTemplate() {
      ɵɵelementStart(0, 'div');
      { ɵɵcontainer(1); }
      ɵɵelementEnd();
    }

    function updateTemplate() {
      ɵɵcontainerRefreshStart(1);
      {
        if (condition) {
          let rf1 = ɵɵembeddedViewStart(1, 3, 0);
          {
            if (rf1 & RenderFlags.Create) {
              ɵɵelement(0, 'span');
              ɵɵelement(1, 'span');
              ɵɵelement(2, 'span');
            }
          }
          ɵɵembeddedViewEnd();
        }
      }
      ɵɵcontainerRefreshEnd();
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
      static ngComponentDef = ɵɵdefineComponent({
        type: SimpleComponent,
        encapsulation: ViewEncapsulation.None,
        selectors: [['simple']],
        consts: 1,
        vars: 0,
        template: function(rf: RenderFlags, ctx: SimpleComponent) {
          if (rf & RenderFlags.Create) {
            ɵɵelement(0, 'span');
          }
        },
        factory: () => new SimpleComponent,
      });
    }

    let condition = true;

    function createTemplate() {
      ɵɵelementStart(0, 'div');
      { ɵɵcontainer(1); }
      ɵɵelementEnd();
    }

    function updateTemplate() {
      ɵɵcontainerRefreshStart(1);
      {
        if (condition) {
          let rf1 = ɵɵembeddedViewStart(1, 3, 0);
          {
            if (rf1 & RenderFlags.Create) {
              ɵɵelement(0, 'simple');
              ɵɵelement(1, 'span');
              ɵɵelement(2, 'simple');
            }
          }
          ɵɵembeddedViewEnd();
        }
      }
      ɵɵcontainerRefreshEnd();
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
