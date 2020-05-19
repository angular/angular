/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {setup} from '@angular/compiler/test/aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('mock_compiler', () => {
  // This produces a MockDirectory of the file needed to compile an Angular application.
  // This setup is performed in a beforeAll which populates the map returned.
  const angularFiles = setup({
    compileAngular: false,
    compileFakeCore: true,
    compileAnimations: false,
  });

  describe('compiling', () => {
    // To use compile you need to supply the files in a MockDirectory that can be merged
    // with a set of "environment" files such as the angular files.
    it('should be able to compile a simple application', () => {
      const files = {
        app: {
          'hello.component.ts': `
            import {Component, Input} from '@angular/core';

            @Component({template: 'Hello {{name}}!'})
            export class HelloComponent {
              @Input() name: string = 'world';
            }
          `,
          'hello.module.ts': `
            import {NgModule} from '@angular/core';
            import {HelloComponent} from './hello.component';

            @NgModule({declarations: [HelloComponent]})
            export class HelloModule {}
          `
        }
      };
      const result = compile(files, angularFiles);

      // result.source contains just the emitted factory declarations regardless of the original
      // module.
      expect(result.source).toContain('Hello');
    });
  });

  describe('expecting emitted output', () => {
    it('should be able to find a simple expression in the output', () => {
      const files = {
        app: {
          'hello.component.ts': `
            import {Component, Input} from '@angular/core';

            @Component({template: 'Hello {{name}}! Your name as {{name.length}} characters'})
            export class HelloComponent {
              @Input() name: string = 'world';
            }
          `,
          'hello.module.ts': `
            import {NgModule} from '@angular/core';
            import {HelloComponent} from './hello.component';

            @NgModule({declarations: [HelloComponent]})
            export class HelloModule {}
          `
        }
      };

      const result = compile(files, angularFiles);

      // The expression can expected directly.
      expectEmit(result.source, 'name.length', 'name length expression not found');

      // Whitespace is not significant
      expectEmit(
          result.source, 'name   \n\n   .  \n    length',
          'name length expression not found (whitespace)');
    });

    it('should throw if the expected output contains unknown characters', () => {
      const files = {
        app: {
          'test.ts': `ɵsayHello();`,
        }
      };

      const result = compile(files, angularFiles);

      expect(() => {
        expectEmit(result.source, `ΔsayHello();`, 'Output does not match.');
      }).toThrowError(/Invalid test, no token found for "Δ"/);
    });

    it('should be able to properly handle string literals with escaped quote', () => {
      const files = {
        app: {
          'test.ts': String.raw`const identifier = "\"quoted\"";`,
        }
      };

      const result = compile(files, angularFiles);

      expect(() => {
        expectEmit(result.source, String.raw`const $a$ = "\"quoted\"";`, 'Output does not match.');
      }).not.toThrow();
    });
  });

  it('should be able to skip untested regions (… and // ...)', () => {
    const files = {
      app: {
        'hello.component.ts': `
          import {Component, Input} from '@angular/core';

          @Component({template: 'Hello {{name}}! Your name as {{name.length}} characters'})
          export class HelloComponent {
            @Input() name: string = 'world';
          }
        `,
        'hello.module.ts': `
          import {NgModule} from '@angular/core';
          import {HelloComponent} from './hello.component';

          @NgModule({declarations: [HelloComponent]})
          export class HelloModule {}
        `
      }
    };

    const result = compile(files, angularFiles);

    // The special character … means anything can be generated between the two sections allowing
    // skipping sections of the output that are not under test. The ellipsis unicode char (…) is
    // used instead of '...' because '...' is legal JavaScript (the spread operator) and might
    // need to be tested. `// ...` could also be used in place of `…`.
    expectEmit(result.source, 'ctx.name … ctx.name.length', 'could not find correct length access');
    expectEmit(
        result.source, 'ctx.name // ... ctx.name.length', 'could not find correct length access');
  });

  it('should be able to skip TODO comments (// TODO)', () => {
    const files = {
      app: {
        'hello.component.ts': `
          import {Component, Input} from '@angular/core';

          @Component({template: 'Hello!'})
          export class HelloComponent { }
        `,
        'hello.module.ts': `
          import {NgModule} from '@angular/core';
          import {HelloComponent} from './hello.component';

          @NgModule({declarations: [HelloComponent]})
          export class HelloModule {}
        `
      }
    };

    const result = compile(files, angularFiles);

    expectEmit(
        result.source, `
    // TODO: this comment should not be taken into account
    $r3$.ɵɵtext(0, "Hello!");
    // TODO: this comment should not be taken into account
    `,
        'todo comments should be ignored');
  });


  it('should be able to enforce consistent identifiers', () => {
    const files = {
      app: {
        'hello.component.ts': `
          import {Component, Input} from '@angular/core';

          @Component({template: 'Hello {{name}}! Your name as {{name.length}} characters'})
          export class HelloComponent {
            @Input() name: string = 'world';
          }
        `,
        'hello.module.ts': `
          import {NgModule} from '@angular/core';
          import {HelloComponent} from './hello.component';

          @NgModule({declarations: [HelloComponent]})
          export class HelloModule {}
        `
      }
    };

    const result = compile(files, angularFiles);

    // IDENT can be used a wild card for any identifier
    expectEmit(result.source, 'IDENT.name', 'could not find context access');

    // $<ident>$ can be used as a wild-card but all the content matched by the identifiers must
    // match each other.
    // This is useful if the code generator is free to invent a name but should use the name
    // consistently.
    expectEmit(
        result.source, '$ctx$.$name$ … $ctx$.$name$.length',
        'could not find correct length access');
  });

  it('should be able to enforce that identifiers match a regexp', () => {
    const files = {
      app: {
        'hello.component.ts': `
          import {Component, Input} from '@angular/core';

          @Component({template: 'Hello {{name}}! Your name as {{name.length}} characters'})
          export class HelloComponent {
            @Input() name: string = 'world';
          }
        `,
        'hello.module.ts': `
          import {NgModule} from '@angular/core';
          import {HelloComponent} from './hello.component';

          @NgModule({declarations: [HelloComponent]})
          export class HelloModule {}
        `
      }
    };

    const result = compile(files, angularFiles);

    // Pass: `$n$` ends with `ME` in the generated code
    expectEmit(result.source, '$ctx$.$n$ … $ctx$.$n$.length', 'Match names', {'$n$': /ME$/i});

    // Fail: `$n$` does not match `/(not)_(\1)/` in the generated code
    expect(() => {
      expectEmit(
          result.source, '$ctx$.$n$ … $ctx$.$n$.length', 'Match names', {'$n$': /(not)_(\1)/});
    }).toThrowError(/"\$n\$" is "name" which doesn't match \/\(not\)_\(\\1\)\//);
  });
});
