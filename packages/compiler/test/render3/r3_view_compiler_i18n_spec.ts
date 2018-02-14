/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {setup} from '../aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('i18n support in the view compiler', () => {
  const angularFiles = setup({
    compileAngular: true,
    compileAnimations: false,
    compileCommon: true,
  });

  describe('single text nodes', () => {
    it('should translate single text nodes with the i18n attribute', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n>Hello world</div>
                <div>&</div>
                <div i18n>farewell</div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
        `
        }
      };

      const template = `
      template: function MyComponent_Template(ctx: IDENT, cm: IDENT) {
        if (cm) {
          …
          const $g2$ = goog.getMsg('Hello world');
          $r3$.ɵT(1, $g2$);
          …
          $r3$.ɵT(3,'&');
          …
          const $g3$ = goog.getMsg('farewell');
          $r3$.ɵT(5, $g3$);
          …
        }
      }
    `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should add the meaning and description as JsDoc comments', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n="meaning|desc@@id" i18n-title="desc" title="introduction">Hello world</div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
        `
        }
      };

      const template = `
      const $c1$ = ($a1$:any) => {
        return ['title', $a1$];
      };
      …
      template: function MyComponent_Template(ctx: IDENT, cm: IDENT) {
        if (cm) {
          /**
           * @desc desc
           */
          const $g1$ = goog.getMsg('introduction');
          $r3$.ɵE(0, 'div', $r3$.ɵf1($c1$, $g1$));
          /**
           * @desc desc
           * @meaning meaning
           */
          const $g2$ = goog.getMsg('Hello world');
          $r3$.ɵT(1, $g2$);
          $r3$.ɵe();
        }
      }
    `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });
  });

  describe('static attributes', () => {
    it('should translate static attributes', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n id="static" i18n-title="m|d" title="introduction"></div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
        `
        }
      };

      const template = `
      const $c1$ = ($a1$:any) => {
        return ['id', 'static', 'title', $a1$];
      };
      …
      template: function MyComponent_Template(ctx: IDENT, cm: IDENT) {
        if (cm) {
          /**
           * @desc d
           * @meaning m
           */
          const $g1$ = goog.getMsg('introduction');
          $r3$.ɵE(0, 'div', $r3$.ɵf1($c1$, $g1$));
          $r3$.ɵe();
        }
      }
    `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });
  });

  // TODO(vicb): this feature is not supported yet
  xdescribe('nested nodes', () => {
    it('should generate the placeholders maps', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n>Hello <b>{{name}}<i>!</i><i>!</i></b></div>
                <div>Other</div>
                <div i18n>2nd</div>
                <div i18n><i>3rd</i></div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
        `
        }
      };

      const template = `
      const $r1$ = {'b':[2], 'i':[4, 6]};
      const $r2$ = {'i':[13]};
    `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });
  });

  describe('errors', () => {
    it('should throw on nested i18n sections', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n><div i18n></div></div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
        `
        }
      };

      expect(() => compile(files, angularFiles))
          .toThrowError(
              'Could not mark an element as translatable inside of a translatable section');
    });

  });
});
