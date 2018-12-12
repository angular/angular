/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOfContext} from '@angular/common';

import {RenderFlags} from '../../src/render3';
import {defineComponent} from '../../src/render3/definition';
import {bind, element, elementAttribute, elementEnd, elementProperty, elementStart, elementStyleProp, elementStyling, elementStylingApply, elementStylingMap, interpolation1, renderTemplate, template, text, textBinding} from '../../src/render3/instructions';
import {InitialStylingFlags} from '../../src/render3/interfaces/definition';
import {AttributeMarker} from '../../src/render3/interfaces/node';
import {bypassSanitizationTrustHtml, bypassSanitizationTrustResourceUrl, bypassSanitizationTrustScript, bypassSanitizationTrustStyle, bypassSanitizationTrustUrl} from '../../src/sanitization/bypass';
import {defaultStyleSanitizer, sanitizeHtml, sanitizeResourceUrl, sanitizeScript, sanitizeStyle, sanitizeUrl} from '../../src/sanitization/sanitization';
import {Sanitizer, SecurityContext} from '../../src/sanitization/security';
import {StyleSanitizeFn} from '../../src/sanitization/style_sanitizer';

import {NgForOf} from './common_with_def';
import {ComponentFixture, TemplateFixture} from './render_util';

describe('instructions', () => {
  function createAnchor() {
    elementStart(0, 'a');
    elementStyling();
    elementEnd();
  }

  function createDiv(initialStyles?: (string | number)[], styleSanitizer?: StyleSanitizeFn) {
    elementStart(0, 'div');
    elementStyling(
        [], initialStyles && Array.isArray(initialStyles) ? initialStyles : null, styleSanitizer);
    elementEnd();
  }

  function createScript() { element(0, 'script'); }

  describe('bind', () => {
    it('should update bindings when value changes', () => {
      const t = new TemplateFixture(createAnchor, () => {}, 1, 1);

      t.update(() => elementProperty(0, 'title', bind('Hello')));
      expect(t.html).toEqual('<a title="Hello"></a>');

      t.update(() => elementProperty(0, 'title', bind('World')));
      expect(t.html).toEqual('<a title="World"></a>');
      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 1,
        tNode: 2,  // 1 for hostElement + 1 for the template under test
        tView: 2,  // 1 for rootView + 1 for the template view
        rendererCreateElement: 1,
        rendererSetProperty: 2
      });
    });

    it('should not update bindings when value does not change', () => {
      const idempotentUpdate = () => elementProperty(0, 'title', bind('Hello'));
      const t = new TemplateFixture(createAnchor, idempotentUpdate, 1, 1);

      t.update();
      expect(t.html).toEqual('<a title="Hello"></a>');

      t.update();
      expect(t.html).toEqual('<a title="Hello"></a>');
      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 1,
        tNode: 2,  // 1 for hostElement + 1 for the template under test
        tView: 2,  // 1 for rootView + 1 for the template view
        rendererCreateElement: 1,
        rendererSetProperty: 1
      });
    });
  });

  describe('element', () => {
    it('should create an element', () => {
      const t = new TemplateFixture(() => {
        element(0, 'div', ['id', 'test', 'title', 'Hello']);
      }, () => {}, 1);

      const div = (t.hostElement as HTMLElement).querySelector('div') !;
      expect(div.id).toEqual('test');
      expect(div.title).toEqual('Hello');
      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 1,
        tNode: 2,  // 1 for div, 1 for host element
        tView: 2,  // 1 for rootView + 1 for the template view
        rendererCreateElement: 1,
      });
    });

    it('should allow setting namespaced attributes', () => {
      const t = new TemplateFixture(() => {
        element(0, 'div', [
          // id="test"
          'id',
          'test',
          // test:foo="bar"
          AttributeMarker.NamespaceURI,
          'http://someuri.com/2018/test',
          'test:foo',
          'bar',
          // title="Hello"
          'title',
          'Hello',
        ]);
      }, () => {}, 1);

      const div = (t.hostElement as HTMLElement).querySelector('div') !;
      const attrs: any = div.attributes;

      expect(attrs['id'].name).toEqual('id');
      expect(attrs['id'].namespaceURI).toEqual(null);
      expect(attrs['id'].value).toEqual('test');

      expect(attrs['test:foo'].name).toEqual('test:foo');
      expect(attrs['test:foo'].namespaceURI).toEqual('http://someuri.com/2018/test');
      expect(attrs['test:foo'].value).toEqual('bar');

      expect(attrs['title'].name).toEqual('title');
      expect(attrs['title'].namespaceURI).toEqual(null);
      expect(attrs['title'].value).toEqual('Hello');

      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 1,
        tNode: 2,  // 1 for div, 1 for host element
        tView: 2,  // 1 for rootView + 1 for the template view
        rendererCreateElement: 1,
        rendererSetAttribute: 3
      });
    });
  });

  describe('elementAttribute', () => {
    it('should use sanitizer function', () => {
      const t = new TemplateFixture(createDiv, () => {}, 1);

      t.update(() => elementAttribute(0, 'title', 'javascript:true', sanitizeUrl));
      expect(t.html).toEqual('<div title="unsafe:javascript:true"></div>');

      t.update(
          () => elementAttribute(
              0, 'title', bypassSanitizationTrustUrl('javascript:true'), sanitizeUrl));
      expect(t.html).toEqual('<div title="javascript:true"></div>');
      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 1,
        tNode: 2,  // 1 for div, 1 for host element
        tView: 2,  // 1 for rootView + 1 for the template view
        rendererCreateElement: 1,
        rendererSetAttribute: 2
      });
    });
  });

  describe('elementProperty', () => {
    it('should use sanitizer function when available', () => {
      const t = new TemplateFixture(createDiv, () => {}, 1);

      t.update(() => elementProperty(0, 'title', 'javascript:true', sanitizeUrl));
      expect(t.html).toEqual('<div title="unsafe:javascript:true"></div>');

      t.update(
          () => elementProperty(
              0, 'title', bypassSanitizationTrustUrl('javascript:false'), sanitizeUrl));
      expect(t.html).toEqual('<div title="javascript:false"></div>');
      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 1,
        tNode: 2,  // 1 for div, 1 for host element
        tView: 2,  // 1 for rootView + 1 for the template view
        rendererCreateElement: 1,
      });
    });

    it('should not stringify non string values', () => {
      const t = new TemplateFixture(createDiv, () => {}, 1);

      t.update(() => elementProperty(0, 'hidden', false));
      // The hidden property would be true if `false` was stringified into `"false"`.
      expect((t.hostElement as HTMLElement).querySelector('div') !.hidden).toEqual(false);
      expect(ngDevMode).toHaveProperties({
        firstTemplatePass: 1,
        tNode: 2,  // 1 for div, 1 for host element
        tView: 2,  // 1 for rootView + 1 for the template view
        rendererCreateElement: 1,
        rendererSetProperty: 1
      });
    });
  });

  describe('elementStyleProp', () => {
    it('should automatically sanitize unless a bypass operation is applied', () => {
      const t = new TemplateFixture(
          () => { return createDiv(['background-image'], defaultStyleSanitizer); }, () => {}, 1);
      t.update(() => {
        elementStyleProp(0, 0, 'url("http://server")');
        elementStylingApply(0);
      });
      // nothing is set because sanitizer suppresses it.
      expect(t.html).toEqual('<div></div>');

      t.update(() => {
        elementStyleProp(0, 0, bypassSanitizationTrustStyle('url("http://server2")'));
        elementStylingApply(0);
      });
      expect((t.hostElement.firstChild as HTMLElement).style.getPropertyValue('background-image'))
          .toEqual('url("http://server2")');
    });

    it('should not re-apply the style value even if it is a newly bypassed again', () => {
      const sanitizerInterceptor = new MockSanitizerInterceptor();
      const t = createTemplateFixtureWithSanitizer(
          () => createDiv(['background-image'], sanitizerInterceptor.getStyleSanitizer()), 1,
          sanitizerInterceptor);

      t.update(() => {
        elementStyleProp(0, 0, bypassSanitizationTrustStyle('apple'));
        elementStylingApply(0);
      });

      expect(sanitizerInterceptor.lastValue !).toEqual('apple');
      sanitizerInterceptor.lastValue = null;

      t.update(() => {
        elementStyleProp(0, 0, bypassSanitizationTrustStyle('apple'));
        elementStylingApply(0);
      });
      expect(sanitizerInterceptor.lastValue).toEqual(null);
    });
  });

  describe('elementStyleMap', () => {
    function createDivWithStyle() {
      elementStart(0, 'div');
      elementStyling([], ['height', InitialStylingFlags.VALUES_MODE, 'height', '10px']);
      elementEnd();
    }

    it('should add style', () => {
      const fixture = new TemplateFixture(createDivWithStyle, () => {}, 1);
      fixture.update(() => {
        elementStylingMap(0, null, {'background-color': 'red'});
        elementStylingApply(0);
      });
      expect(fixture.html).toEqual('<div style="background-color: red; height: 10px;"></div>');
    });

    it('should sanitize new styles that may contain `url` properties', () => {
      const detectedValues: string[] = [];
      const sanitizerInterceptor =
          new MockSanitizerInterceptor(value => { detectedValues.push(value); });
      const fixture = createTemplateFixtureWithSanitizer(
          () => createDiv([], sanitizerInterceptor.getStyleSanitizer()), 1, sanitizerInterceptor);

      fixture.update(() => {
        elementStylingMap(0, null, {
          'background-image': 'background-image',
          'background': 'background',
          'border-image': 'border-image',
          'list-style': 'list-style',
          'list-style-image': 'list-style-image',
          'filter': 'filter',
          'width': 'width'
        });
        elementStylingApply(0);
      });

      const props = detectedValues.sort();
      expect(props).toEqual([
        'background', 'background-image', 'border-image', 'filter', 'list-style', 'list-style-image'
      ]);
    });
  });

  describe('elementClass', () => {
    function createDivWithStyling() {
      elementStart(0, 'div');
      elementStyling();
      elementEnd();
    }

    it('should add class', () => {
      const fixture = new TemplateFixture(createDivWithStyling, () => {}, 1);
      fixture.update(() => {
        elementStylingMap(0, 'multiple classes');
        elementStylingApply(0);
      });
      expect(fixture.html).toEqual('<div class="multiple classes"></div>');
    });
  });

  describe('performance counters', () => {
    it('should create tViews only once for each nested level', () => {
      const _c0 = ['ngFor', '', 'ngForOf', ''];

      function ToDoAppComponent_NgForOf_Template_0(rf: RenderFlags, ctx0: NgForOfContext<any>) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'ul');
          template(1, ToDoAppComponent_NgForOf_NgForOf_Template_1, 2, 1, 'li', _c0);
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const row_r2 = ctx0.$implicit;
          elementProperty(1, 'ngForOf', bind(row_r2));
        }
      }

      function ToDoAppComponent_NgForOf_NgForOf_Template_1(
          rf: RenderFlags, ctx1: NgForOfContext<any>) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'li');
          text(1);
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          const col_r3 = ctx1.$implicit;
          textBinding(1, interpolation1('', col_r3, ''));
        }
      }

      /**
       * <ul *ngFor="let row of rows">
       *   <li *ngFor="let col of row.cols">{{col}}</li>
       * </ul>
       */
      class NestedLoops {
        rows = [['a', 'b'], ['A', 'B'], ['a', 'b'], ['A', 'B']];

        static ngComponentDef = defineComponent({
          type: NestedLoops,
          selectors: [['nested-loops']],
          factory: function ToDoAppComponent_Factory() { return new NestedLoops(); },
          consts: 1,
          vars: 1,
          template: function ToDoAppComponent_Template(rf: RenderFlags, ctx: NestedLoops) {
            if (rf & RenderFlags.Create) {
              template(0, ToDoAppComponent_NgForOf_Template_0, 2, 1, 'ul', _c0);
            }
            if (rf & RenderFlags.Update) {
              elementProperty(0, 'ngForOf', bind(ctx.rows));
            }
          },
          directives: [NgForOf]
        });
      }
      const fixture = new ComponentFixture(NestedLoops);
      expect(ngDevMode).toHaveProperties({
        // Expect: fixture view/Host view + component + ngForRow + ngForCol
        tView: 4,  // should be: 4,
      });

    });
  });

  describe('sanitization injection compatibility', () => {
    it('should work for url sanitization', () => {
      const s = new LocalMockSanitizer(value => `${value}-sanitized`);
      const t = new TemplateFixture(createAnchor, undefined, 1, 0, null, null, s);
      const inputValue = 'http://foo';
      const outputValue = 'http://foo-sanitized';

      t.update(() => elementAttribute(0, 'href', inputValue, sanitizeUrl));
      expect(t.html).toEqual(`<a href="${outputValue}"></a>`);
      expect(s.lastSanitizedValue).toEqual(outputValue);
    });

    it('should bypass url sanitization if marked by the service', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture(createAnchor, undefined, 1, 0, null, null, s);
      const inputValue = s.bypassSecurityTrustUrl('http://foo');
      const outputValue = 'http://foo';

      t.update(() => elementAttribute(0, 'href', inputValue, sanitizeUrl));
      expect(t.html).toEqual(`<a href="${outputValue}"></a>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should bypass ivy-level url sanitization if a custom sanitizer is used', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture(createAnchor, undefined, 1, 0, null, null, s);
      const inputValue = bypassSanitizationTrustUrl('http://foo');
      const outputValue = 'http://foo-ivy';

      t.update(() => elementAttribute(0, 'href', inputValue, sanitizeUrl));
      expect(t.html).toEqual(`<a href="${outputValue}"></a>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should work for style sanitization', () => {
      const s = new LocalMockSanitizer(value => `color:blue`);
      const t = new TemplateFixture(createDiv, undefined, 1, 0, null, null, s);
      const inputValue = 'color:red';
      const outputValue = 'color:blue';

      t.update(() => elementAttribute(0, 'style', inputValue, sanitizeStyle));
      expect(stripStyleWsCharacters(t.html)).toEqual(`<div style="${outputValue}"></div>`);
      expect(s.lastSanitizedValue).toEqual(outputValue);
    });

    it('should bypass style sanitization if marked by the service', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture(createDiv, undefined, 1, 0, null, null, s);
      const inputValue = s.bypassSecurityTrustStyle('color:maroon');
      const outputValue = 'color:maroon';

      t.update(() => elementAttribute(0, 'style', inputValue, sanitizeStyle));
      expect(stripStyleWsCharacters(t.html)).toEqual(`<div style="${outputValue}"></div>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should bypass ivy-level style sanitization if a custom sanitizer is used', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture(createDiv, undefined, 1, 0, null, null, s);
      const inputValue = bypassSanitizationTrustStyle('font-family:foo');
      const outputValue = 'font-family:foo-ivy';

      t.update(() => elementAttribute(0, 'style', inputValue, sanitizeStyle));
      expect(stripStyleWsCharacters(t.html)).toEqual(`<div style="${outputValue}"></div>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should work for resourceUrl sanitization', () => {
      const s = new LocalMockSanitizer(value => `${value}-sanitized`);
      const t = new TemplateFixture(createScript, undefined, 1, 0, null, null, s);
      const inputValue = 'http://resource';
      const outputValue = 'http://resource-sanitized';

      t.update(() => elementAttribute(0, 'src', inputValue, sanitizeResourceUrl));
      expect(t.html).toEqual(`<script src="${outputValue}"></script>`);
      expect(s.lastSanitizedValue).toEqual(outputValue);
    });

    it('should bypass resourceUrl sanitization if marked by the service', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture(createScript, undefined, 1, 0, null, null, s);
      const inputValue = s.bypassSecurityTrustResourceUrl('file://all-my-secrets.pdf');
      const outputValue = 'file://all-my-secrets.pdf';

      t.update(() => elementAttribute(0, 'src', inputValue, sanitizeResourceUrl));
      expect(t.html).toEqual(`<script src="${outputValue}"></script>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should bypass ivy-level resourceUrl sanitization if a custom sanitizer is used', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture(createScript, undefined, 1, 0, null, null, s);
      const inputValue = bypassSanitizationTrustResourceUrl('file://all-my-secrets.pdf');
      const outputValue = 'file://all-my-secrets.pdf-ivy';

      t.update(() => elementAttribute(0, 'src', inputValue, sanitizeResourceUrl));
      expect(t.html).toEqual(`<script src="${outputValue}"></script>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should work for script sanitization', () => {
      const s = new LocalMockSanitizer(value => `${value} //sanitized`);
      const t = new TemplateFixture(createScript, undefined, 1, 0, null, null, s);
      const inputValue = 'fn();';
      const outputValue = 'fn(); //sanitized';

      t.update(() => elementProperty(0, 'innerHTML', inputValue, sanitizeScript));
      expect(t.html).toEqual(`<script>${outputValue}</script>`);
      expect(s.lastSanitizedValue).toEqual(outputValue);
    });

    it('should bypass script sanitization if marked by the service', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture(createScript, undefined, 1, 0, null, null, s);
      const inputValue = s.bypassSecurityTrustScript('alert("bar")');
      const outputValue = 'alert("bar")';

      t.update(() => elementProperty(0, 'innerHTML', inputValue, sanitizeScript));
      expect(t.html).toEqual(`<script>${outputValue}</script>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should bypass ivy-level script sanitization if a custom sanitizer is used', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture(createScript, undefined, 1, 0, null, null, s);
      const inputValue = bypassSanitizationTrustScript('alert("bar")');
      const outputValue = 'alert("bar")-ivy';

      t.update(() => elementProperty(0, 'innerHTML', inputValue, sanitizeScript));
      expect(t.html).toEqual(`<script>${outputValue}</script>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should work for html sanitization', () => {
      const s = new LocalMockSanitizer(value => `${value} <!--sanitized-->`);
      const t = new TemplateFixture(createDiv, undefined, 1, 0, null, null, s);
      const inputValue = '<header></header>';
      const outputValue = '<header></header> <!--sanitized-->';

      t.update(() => elementProperty(0, 'innerHTML', inputValue, sanitizeHtml));
      expect(t.html).toEqual(`<div>${outputValue}</div>`);
      expect(s.lastSanitizedValue).toEqual(outputValue);
    });

    it('should bypass html sanitization if marked by the service', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture(createDiv, undefined, 1, 0, null, null, s);
      const inputValue = s.bypassSecurityTrustHtml('<div onclick="alert(123)"></div>');
      const outputValue = '<div onclick="alert(123)"></div>';

      t.update(() => elementProperty(0, 'innerHTML', inputValue, sanitizeHtml));
      expect(t.html).toEqual(`<div>${outputValue}</div>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should bypass ivy-level script sanitization if a custom sanitizer is used', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture(createDiv, undefined, 1, 0, null, null, s);
      const inputValue = bypassSanitizationTrustHtml('<div onclick="alert(123)"></div>');
      const outputValue = '<div onclick="alert(123)"></div>-ivy';

      t.update(() => elementProperty(0, 'innerHTML', inputValue, sanitizeHtml));
      expect(t.html).toEqual(`<div>${outputValue}</div>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });
  });
});

class LocalSanitizedValue {
  constructor(public value: any) {}

  toString() { return this.value; }
}

class LocalMockSanitizer implements Sanitizer {
  // TODO(issue/24571): remove '!'.
  public lastSanitizedValue !: string | null;

  constructor(private _interceptor: (value: string|null|any) => string) {}

  sanitize(context: SecurityContext, value: LocalSanitizedValue|string|null|any): string|null {
    if (value instanceof String) {
      return value.toString() + '-ivy';
    }

    if (value instanceof LocalSanitizedValue) {
      return value.toString();
    }

    return this.lastSanitizedValue = this._interceptor(value);
  }

  bypassSecurityTrustHtml(value: string) { return new LocalSanitizedValue(value); }

  bypassSecurityTrustStyle(value: string) { return new LocalSanitizedValue(value); }

  bypassSecurityTrustScript(value: string) { return new LocalSanitizedValue(value); }

  bypassSecurityTrustUrl(value: string) { return new LocalSanitizedValue(value); }

  bypassSecurityTrustResourceUrl(value: string) { return new LocalSanitizedValue(value); }
}

class MockSanitizerInterceptor {
  public lastValue: string|null = null;
  constructor(private _interceptorFn?: ((value: any) => any)|null) {}
  getStyleSanitizer() { return defaultStyleSanitizer; }
  sanitize(context: SecurityContext, value: LocalSanitizedValue|string|null|any): string|null {
    if (this._interceptorFn) {
      this._interceptorFn(value);
    }
    return this.lastValue = value;
  }
}

function stripStyleWsCharacters(value: string): string {
  // color: blue; => color:blue
  return value.replace(/;/g, '').replace(/:\s+/g, ':');
}

function createTemplateFixtureWithSanitizer(
    buildFn: () => any, consts: number, sanitizer: Sanitizer) {
  return new TemplateFixture(buildFn, () => {}, consts, 0, null, null, sanitizer);
}
