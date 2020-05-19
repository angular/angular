/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RendererType2, ViewEncapsulation} from '../../src/core';
import {ɵɵdefineComponent} from '../../src/render3/index';
import {ɵɵelement, ɵɵtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {getRendererFactory2} from './imported_renderer2';
import {document, renderToHtml} from './render_util';

describe('renderer factory lifecycle', () => {
  let logs: string[] = [];
  let rendererFactory = getRendererFactory2(document);
  const createRender = rendererFactory.createRenderer;
  rendererFactory.createRenderer = (hostElement: any, type: RendererType2|null) => {
    logs.push('create');
    return createRender.apply(rendererFactory, [hostElement, type]);
  };
  rendererFactory.begin = () => logs.push('begin');
  rendererFactory.end = () => logs.push('end');

  class SomeComponent {
    static ɵfac = () => new SomeComponent;
    static ɵcmp = ɵɵdefineComponent({
      type: SomeComponent,
      encapsulation: ViewEncapsulation.None,
      selectors: [['some-component']],
      decls: 1,
      vars: 0,
      template:
          function(rf: RenderFlags, ctx: SomeComponent) {
            if (rf & RenderFlags.Create) {
              logs.push('component create');
              ɵɵtext(0, 'foo');
            }
            if (rf & RenderFlags.Update) {
              logs.push('component update');
            }
          }
    });
  }

  class SomeComponentWhichThrows {
    static ɵfac = () => new SomeComponentWhichThrows;
    static ɵcmp = ɵɵdefineComponent({
      type: SomeComponentWhichThrows,
      encapsulation: ViewEncapsulation.None,
      selectors: [['some-component-with-Error']],
      decls: 0,
      vars: 0,
      template:
          function(rf: RenderFlags, ctx: SomeComponentWhichThrows) {
            throw (new Error('SomeComponentWhichThrows threw'));
          }
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

  beforeEach(() => {
    logs = [];
  });

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
