/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RendererType2} from '@angular/core';

import {D, E, e} from '../../src/render3';
import {T, defineComponent, detectChanges} from '../../src/render3/index';

import {getRendererFactory2} from './imported_renderer2';
import {document, renderComponent, renderToHtml, resetDOM} from './render_util';

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
          T(0, 'foo');
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
      T(0, 'bar');
    }
  }

  function TemplateWithComponent(ctx: any, cm: boolean) {
    logs.push('function_with_component');
    if (cm) {
      T(0, 'bar');
      E(1, SomeComponent.ngComponentDef);
      { D(2, SomeComponent.ngComponentDef.n(), SomeComponent.ngComponentDef); }
      e();
    }
    SomeComponent.ngComponentDef.r(2, 1);
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
