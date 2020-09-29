/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOfContext} from '@angular/common';
import {getSortedClassName} from '@angular/core/testing/src/styling';

import {ɵɵdefineComponent} from '../../src/render3/definition';
import {RenderFlags, ɵɵadvance, ɵɵattribute, ɵɵclassMap, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵproperty, ɵɵstyleMap, ɵɵstyleProp, ɵɵtemplate, ɵɵtext, ɵɵtextInterpolate1} from '../../src/render3/index';
import {AttributeMarker} from '../../src/render3/interfaces/node';
import {bypassSanitizationTrustHtml, bypassSanitizationTrustResourceUrl, bypassSanitizationTrustScript, bypassSanitizationTrustStyle, bypassSanitizationTrustUrl, getSanitizationBypassType, SafeValue, unwrapSafeValue} from '../../src/sanitization/bypass';
import {ɵɵsanitizeHtml, ɵɵsanitizeResourceUrl, ɵɵsanitizeScript, ɵɵsanitizeStyle, ɵɵsanitizeUrl} from '../../src/sanitization/sanitization';
import {Sanitizer} from '../../src/sanitization/sanitizer';
import {SecurityContext} from '../../src/sanitization/security';

import {NgForOf} from './common_with_def';
import {ComponentFixture, TemplateFixture} from './render_util';

describe('instructions', () => {
  function createAnchor() {
    ɵɵelement(0, 'a');
  }

  function createDiv() {
    ɵɵelement(0, 'div');
  }

  function createScript() {
    ɵɵelement(0, 'script');
  }

  describe('ɵɵadvance', () => {
    it('should error in DevMode if index is out of range', () => {
      // Only one constant added, meaning only index `0` is valid.
      const t = new TemplateFixture({create: createDiv, decls: 1});
      expect(() => {
        t.update(() => {
          ɵɵadvance(-1);
        });
      }).toThrow();
      expect(() => {
        t.update(() => {
          ɵɵadvance(1);
        });
      }).toThrow();
    });
  });

  describe('bind', () => {
    it('should update bindings when value changes with the correct perf counters', () => {
      const t = new TemplateFixture({create: createAnchor, update: () => {}, decls: 1, vars: 1});

      t.update(() => {
        ɵɵproperty('title', 'Hello');
      });
      expect(t.html).toEqual('<a title="Hello"></a>');

      t.update(() => {
        ɵɵproperty('title', 'World');
      });
      expect(t.html).toEqual('<a title="World"></a>');
      expect(ngDevMode).toHaveProperties({
        firstCreatePass: 1,
        tNode: 2,  // 1 for hostElement + 1 for the template under test
        tView: 2,  // 1 for rootView + 1 for the template view
        rendererCreateElement: 1,
        rendererSetProperty: 2
      });
    });

    it('should not update bindings when value does not change, with the correct perf counters',
       () => {
         const idempotentUpdate = () => {
           ɵɵproperty('title', 'Hello');
         };
         const t = new TemplateFixture(
             {create: createAnchor, update: idempotentUpdate, decls: 1, vars: 1});

         t.update();
         expect(t.html).toEqual('<a title="Hello"></a>');

         t.update();
         expect(t.html).toEqual('<a title="Hello"></a>');
         expect(ngDevMode).toHaveProperties({
           firstCreatePass: 1,
           tNode: 2,  // 1 for hostElement + 1 for the template under test
           tView: 2,  // 1 for rootView + 1 for the template view
           rendererCreateElement: 1,
           rendererSetProperty: 1
         });
       });
  });

  describe('element', () => {
    it('should create an element with the correct perf counters', () => {
      const t = new TemplateFixture({
        create: () => {
          ɵɵelement(0, 'div', 0);
        },
        decls: 1,
        vars: 0,
        consts: [['id', 'test', 'title', 'Hello']]
      });

      const div = (t.hostElement as HTMLElement).querySelector('div')!;
      expect(div.id).toEqual('test');
      expect(div.title).toEqual('Hello');
      expect(ngDevMode).toHaveProperties({
        firstCreatePass: 1,
        tNode: 2,  // 1 for div, 1 for host element
        tView: 2,  // 1 for rootView + 1 for the template view
        rendererCreateElement: 1,
      });
    });
  });

  describe('attribute', () => {
    it('should use sanitizer function', () => {
      const t = new TemplateFixture({create: createDiv, decls: 1, vars: 1});

      t.update(() => {
        ɵɵattribute('title', 'javascript:true', ɵɵsanitizeUrl);
      });
      expect(t.html).toEqual('<div title="unsafe:javascript:true"></div>');

      t.update(() => {
        ɵɵattribute('title', bypassSanitizationTrustUrl('javascript:true'), ɵɵsanitizeUrl);
      });
      expect(t.html).toEqual('<div title="javascript:true"></div>');
      expect(ngDevMode).toHaveProperties({
        firstCreatePass: 1,
        tNode: 2,  // 1 for div, 1 for host element
        tView: 2,  // 1 for rootView + 1 for the template view
        rendererCreateElement: 1,
        rendererSetAttribute: 2
      });
    });
  });

  describe('property', () => {
    /**
     * TODO: We need to replace this with an acceptance test, but for right now,
     * this is the only test that ensures chaining works, since code generation
     * is not producing chained instructions yet.
     */
    it('should chain', () => {
      // <div [title]="title" [accesskey]="key"></div>
      const t = new TemplateFixture({create: createDiv, update: () => {}, decls: 1, vars: 2});
      t.update(() => {
        ɵɵproperty('title', 'one')('accessKey', 'A');
      });
      expect(t.html).toEqual('<div accesskey="A" title="one"></div>');
      t.update(() => {
        ɵɵproperty('title', 'two')('accessKey', 'B');
      });
      expect(t.html).toEqual('<div accesskey="B" title="two"></div>');
      expect(ngDevMode).toHaveProperties({
        firstCreatePass: 1,
        tNode: 2,  // 1 for div, 1 for host element
        tView: 2,  // 1 for rootView + 1 for the template view
        rendererCreateElement: 1,
        rendererSetProperty: 4,
      });
    });
  });

  describe('styleProp', () => {
    it('should allow values even if a bypass operation is applied', () => {
      let backgroundImage: string|SafeValue = 'url("http://server")';
      const t = new TemplateFixture({
        create: () => {
          return createDiv();
        },
        update: () => {
          ɵɵstyleProp('background-image', backgroundImage);
        },
        decls: 2,
        vars: 2
      });
      // nothing is set because sanitizer suppresses it.
      expect((t.hostElement.firstChild as HTMLElement).style.getPropertyValue('background-image'))
          .toEqual('url("http://server")');

      backgroundImage = bypassSanitizationTrustStyle('url("http://server2")');
      t.update();
      expect((t.hostElement.firstChild as HTMLElement).style.getPropertyValue('background-image'))
          .toEqual('url("http://server2")');
    });
  });

  describe('styleMap', () => {
    const attrs = [[AttributeMarker.Styles, 'height', '10px']];

    function createDivWithStyle() {
      ɵɵelement(0, 'div', 0);
    }

    it('should add style', () => {
      const fixture = new TemplateFixture({
        create: createDivWithStyle,
        update: () => {
          ɵɵstyleMap({'background-color': 'red'});
        },
        decls: 1,
        vars: 2,
        consts: attrs
      });
      fixture.update();
      expect(fixture.html).toEqual('<div style="background-color: red; height: 10px;"></div>');
    });
  });

  describe('elementClass', () => {
    function createDivWithStyling() {
      ɵɵelement(0, 'div');
    }

    it('should add class', () => {
      const fixture = new TemplateFixture({
        create: createDivWithStyling,
        update: () => {
          ɵɵclassMap('multiple classes');
        },
        decls: 1,
        vars: 2
      });
      const div = fixture.containerElement.querySelector('div.multiple')!;
      expect(getSortedClassName(div)).toEqual('classes multiple');
    });
  });

  describe('performance counters', () => {
    it('should create tViews only once for each nested level', () => {
      function ToDoAppComponent_NgForOf_Template_0(
          rf: RenderFlags, ctx0: NgForOfContext<any, any>) {
        if (rf & RenderFlags.Create) {
          ɵɵelementStart(0, 'ul');
          ɵɵtemplate(1, ToDoAppComponent_NgForOf_NgForOf_Template_1, 2, 1, 'li', 0);
          ɵɵelementEnd();
        }
        if (rf & RenderFlags.Update) {
          const row_r2 = ctx0.$implicit;
          ɵɵadvance(1);
          ɵɵproperty('ngForOf', row_r2);
        }
      }

      function ToDoAppComponent_NgForOf_NgForOf_Template_1(
          rf: RenderFlags, ctx1: NgForOfContext<any, any>) {
        if (rf & RenderFlags.Create) {
          ɵɵelementStart(0, 'li');
          ɵɵtext(1);
          ɵɵelementEnd();
        }
        if (rf & RenderFlags.Update) {
          const col_r3 = ctx1.$implicit;
          ɵɵadvance(1);
          ɵɵtextInterpolate1('', col_r3, '');
        }
      }

      /**
       * <ul *ngFor="let row of rows">
       *   <li *ngFor="let col of row.cols">{{col}}</li>
       * </ul>
       */
      class NestedLoops {
        rows = [['a', 'b'], ['A', 'B'], ['a', 'b'], ['A', 'B']];

        static ɵfac = function ToDoAppComponent_Factory() {
          return new NestedLoops();
        };
        static ɵcmp = ɵɵdefineComponent({
          type: NestedLoops,
          selectors: [['nested-loops']],
          decls: 1,
          vars: 1,
          consts: [[AttributeMarker.Template, 'ngFor', 'ngForOf']],
          template:
              function ToDoAppComponent_Template(rf: RenderFlags, ctx: NestedLoops) {
                if (rf & RenderFlags.Create) {
                  ɵɵtemplate(0, ToDoAppComponent_NgForOf_Template_0, 2, 1, 'ul', 0);
                }
                if (rf & RenderFlags.Update) {
                  ɵɵproperty('ngForOf', ctx.rows);
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
      const t = new TemplateFixture({create: createAnchor, decls: 1, vars: 1, sanitizer: s});
      const inputValue = 'http://foo';
      const outputValue = 'http://foo-sanitized';

      t.update(() => {
        ɵɵattribute('href', inputValue, ɵɵsanitizeUrl);
      });
      expect(t.html).toEqual(`<a href="${outputValue}"></a>`);
      expect(s.lastSanitizedValue).toEqual(outputValue);
    });

    it('should bypass url sanitization if marked by the service', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture({create: createAnchor, decls: 1, vars: 1, sanitizer: s});
      const inputValue = s.bypassSecurityTrustUrl('http://foo');
      const outputValue = 'http://foo';

      t.update(() => {
        ɵɵattribute('href', inputValue, ɵɵsanitizeUrl);
      });
      expect(t.html).toEqual(`<a href="${outputValue}"></a>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should bypass ivy-level url sanitization if a custom sanitizer is used', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture({create: createAnchor, decls: 1, vars: 1, sanitizer: s});
      const inputValue = bypassSanitizationTrustUrl('http://foo');
      const outputValue = 'http://foo-ivy';

      t.update(() => {
        ɵɵattribute('href', inputValue, ɵɵsanitizeUrl);
      });
      expect(t.html).toEqual(`<a href="${outputValue}"></a>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should work for style sanitization', () => {
      const s = new LocalMockSanitizer(value => `color:blue`);
      const t = new TemplateFixture({create: createDiv, decls: 1, vars: 1, sanitizer: s});
      const inputValue = 'color:red';
      const outputValue = 'color:blue';

      t.update(() => {
        ɵɵattribute('style', inputValue, ɵɵsanitizeStyle);
      });
      expect(stripStyleWsCharacters(t.html)).toEqual(`<div style="${outputValue}"></div>`);
      expect(s.lastSanitizedValue).toEqual(outputValue);
    });

    it('should bypass style sanitization if marked by the service', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture({create: createDiv, decls: 1, vars: 1, sanitizer: s});
      const inputValue = s.bypassSecurityTrustStyle('color:maroon');
      const outputValue = 'color:maroon';

      t.update(() => {
        ɵɵattribute('style', inputValue, ɵɵsanitizeStyle);
      });
      expect(stripStyleWsCharacters(t.html)).toEqual(`<div style="${outputValue}"></div>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should bypass ivy-level style sanitization if a custom sanitizer is used', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture({create: createDiv, decls: 1, vars: 1, sanitizer: s});
      const inputValue = bypassSanitizationTrustStyle('font-family:foo');
      const outputValue = 'font-family:foo-ivy';

      t.update(() => {
        ɵɵattribute('style', inputValue, ɵɵsanitizeStyle);
      });
      expect(stripStyleWsCharacters(t.html)).toEqual(`<div style="${outputValue}"></div>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should work for resourceUrl sanitization', () => {
      const s = new LocalMockSanitizer(value => `${value}-sanitized`);
      const t = new TemplateFixture({create: createScript, decls: 1, vars: 1, sanitizer: s});
      const inputValue = 'http://resource';
      const outputValue = 'http://resource-sanitized';

      t.update(() => {
        ɵɵattribute('src', inputValue, ɵɵsanitizeResourceUrl);
      });
      expect(t.html).toEqual(`<script src="${outputValue}"></script>`);
      expect(s.lastSanitizedValue).toEqual(outputValue);
    });

    it('should bypass resourceUrl sanitization if marked by the service', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture({create: createScript, decls: 1, vars: 1, sanitizer: s});
      const inputValue = s.bypassSecurityTrustResourceUrl('file://all-my-secrets.pdf');
      const outputValue = 'file://all-my-secrets.pdf';

      t.update(() => {
        ɵɵattribute('src', inputValue, ɵɵsanitizeResourceUrl);
      });
      expect(t.html).toEqual(`<script src="${outputValue}"></script>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should bypass ivy-level resourceUrl sanitization if a custom sanitizer is used', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture({create: createScript, decls: 1, vars: 1, sanitizer: s});
      const inputValue = bypassSanitizationTrustResourceUrl('file://all-my-secrets.pdf');
      const outputValue = 'file://all-my-secrets.pdf-ivy';

      t.update(() => {
        ɵɵattribute('src', inputValue, ɵɵsanitizeResourceUrl);
      });
      expect(t.html).toEqual(`<script src="${outputValue}"></script>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should work for script sanitization', () => {
      const s = new LocalMockSanitizer(value => `${value} //sanitized`);
      const t = new TemplateFixture({create: createScript, decls: 1, vars: 1, sanitizer: s});
      const inputValue = 'fn();';
      const outputValue = 'fn(); //sanitized';

      t.update(() => {
        ɵɵproperty('innerHTML', inputValue, ɵɵsanitizeScript);
      });
      expect(t.html).toEqual(`<script>${outputValue}</script>`);
      expect(s.lastSanitizedValue).toEqual(outputValue);
    });

    it('should bypass script sanitization if marked by the service', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture({create: createScript, decls: 1, vars: 1, sanitizer: s});
      const inputValue = s.bypassSecurityTrustScript('alert("bar")');
      const outputValue = 'alert("bar")';

      t.update(() => {
        ɵɵproperty('innerHTML', inputValue, ɵɵsanitizeScript);
      });
      expect(t.html).toEqual(`<script>${outputValue}</script>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should bypass ivy-level script sanitization if a custom sanitizer is used', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture({create: createScript, decls: 1, vars: 1, sanitizer: s});
      const inputValue = bypassSanitizationTrustScript('alert("bar")');
      const outputValue = 'alert("bar")-ivy';

      t.update(() => {
        ɵɵproperty('innerHTML', inputValue, ɵɵsanitizeScript);
      });
      expect(t.html).toEqual(`<script>${outputValue}</script>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should work for html sanitization', () => {
      const s = new LocalMockSanitizer(value => `${value} <!--sanitized-->`);
      const t = new TemplateFixture({create: createDiv, decls: 1, vars: 1, sanitizer: s});
      const inputValue = '<header></header>';
      const outputValue = '<header></header> <!--sanitized-->';

      t.update(() => {
        ɵɵproperty('innerHTML', inputValue, ɵɵsanitizeHtml);
      });
      expect(t.html).toEqual(`<div>${outputValue}</div>`);
      expect(s.lastSanitizedValue).toEqual(outputValue);
    });

    it('should bypass html sanitization if marked by the service', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture({create: createDiv, decls: 1, vars: 1, sanitizer: s});
      const inputValue = s.bypassSecurityTrustHtml('<div onclick="alert(123)"></div>');
      const outputValue = '<div onclick="alert(123)"></div>';

      t.update(() => {
        ɵɵproperty('innerHTML', inputValue, ɵɵsanitizeHtml);
      });
      expect(t.html).toEqual(`<div>${outputValue}</div>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });

    it('should bypass ivy-level script sanitization if a custom sanitizer is used', () => {
      const s = new LocalMockSanitizer(value => '');
      const t = new TemplateFixture({create: createDiv, decls: 1, vars: 1, sanitizer: s});
      const inputValue = bypassSanitizationTrustHtml('<div onclick="alert(123)"></div>');
      const outputValue = '<div onclick="alert(123)"></div>-ivy';

      t.update(() => {
        ɵɵproperty('innerHTML', inputValue, ɵɵsanitizeHtml);
      });
      expect(t.html).toEqual(`<div>${outputValue}</div>`);
      expect(s.lastSanitizedValue).toBeFalsy();
    });
  });
});

class LocalSanitizedValue {
  constructor(public value: any) {}

  toString() {
    return this.value;
  }
}

class LocalMockSanitizer implements Sanitizer {
  // TODO(issue/24571): remove '!'.
  public lastSanitizedValue!: string|null;

  constructor(private _interceptor: (value: string|null|any) => string) {}

  sanitize(context: SecurityContext, value: LocalSanitizedValue|string|null|any): string|null {
    if (getSanitizationBypassType(value) != null) {
      return unwrapSafeValue(value) + '-ivy';
    }

    if (value instanceof LocalSanitizedValue) {
      return value.toString();
    }

    return this.lastSanitizedValue = this._interceptor(value);
  }

  bypassSecurityTrustHtml(value: string) {
    return new LocalSanitizedValue(value);
  }

  bypassSecurityTrustStyle(value: string) {
    return new LocalSanitizedValue(value);
  }

  bypassSecurityTrustScript(value: string) {
    return new LocalSanitizedValue(value);
  }

  bypassSecurityTrustUrl(value: string) {
    return new LocalSanitizedValue(value);
  }

  bypassSecurityTrustResourceUrl(value: string) {
    return new LocalSanitizedValue(value);
  }
}

class MockSanitizerInterceptor {
  public lastValue: string|null = null;
  constructor(private _interceptorFn?: ((value: any) => any)|null) {}
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
