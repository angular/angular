/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TestFile, runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import * as ts from 'typescript';

import {Diagnostic} from '../src/diagnostics';

import {TestDeclaration, ngForDeclaration, ngForDts, typecheck} from './test_utils';

runInEachFileSystem(() => {
  describe('template diagnostics', () => {
    it('works for directive bindings', () => {
      const messages = diagnose(
          `<div dir [input]="person.name"></div>`, `
        class Dir {
          input: number;
        }
        class TestComponent {
          person: {
            name: string;
          };
        }`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            exportAs: ['dir'],
            inputs: {input: 'input'},
          }]);

      expect(messages).toEqual(
          [`synthetic.html(9, 30): Type 'string' is not assignable to type 'number | undefined'.`]);
    });

    it('infers type of template variables', () => {
      const messages = diagnose(
          `<div *ngFor="let person of persons; let idx=index">{{ render(idx) }}</div>`, `
        class TestComponent {
          persons: {}[];
          
          render(input: string): string { return input; }
        }`,
          [ngForDeclaration()], [ngForDts()]);

      expect(messages).toEqual([
        `synthetic.html(61, 64): Argument of type 'number' is not assignable to parameter of type 'string'.`,
      ]);
    });

    it('infers any type when generic type inference fails', () => {
      const messages = diagnose(
          `<div *ngFor="let person of persons;">{{ render(person.namme) }}</div>`, `
        class TestComponent {
          persons: any;
          
          render(input: string): string { return input; }
        }`,
          [ngForDeclaration()], [ngForDts()]);

      expect(messages).toEqual([]);
    });

    it('infers type of element references', () => {
      const messages = diagnose(
          `<div dir #el>{{ render(el) }}</div>`, `
        class Dir {
          value: number;
        }
        class TestComponent {
          render(input: string): string { return input; }
        }`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            exportAs: ['dir'],
          }]);

      expect(messages).toEqual([
        `synthetic.html(23, 25): Argument of type 'HTMLDivElement' is not assignable to parameter of type 'string'.`,
      ]);
    });

    it('infers type of directive references', () => {
      const messages = diagnose(
          `<div dir #dir="dir">{{ render(dir) }}</div>`, `
        class Dir {
          value: number;
        }
        class TestComponent {
          render(input: string): string { return input; }
        }`,
          [{
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            exportAs: ['dir'],
          }]);

      expect(messages).toEqual([
        `synthetic.html(30, 33): Argument of type 'Dir' is not assignable to parameter of type 'string'.`,
      ]);
    });

    it('infers TemplateRef<any> for ng-template references', () => {
      const messages = diagnose(`<ng-template #tmpl>{{ render(tmpl) }}</ng-template>`, `
      class TestComponent {
        render(input: string): string { return input; }
      }`);

      expect(messages).toEqual([
        `synthetic.html(29, 33): Argument of type 'TemplateRef<any>' is not assignable to parameter of type 'string'.`,
      ]);
    });

    it('infers type of template context', () => {
      const messages = diagnose(
          `<div *ngFor="let person of persons">{{ person.namme }}</div>`, `
        class TestComponent {
          persons: {
            name: string;
          }[];
        }`,
          [ngForDeclaration()], [ngForDts()]);

      expect(messages).toEqual([
        `synthetic.html(39, 52): Property 'namme' does not exist on type '{ name: string; }'. Did you mean 'name'?`,
      ]);
    });

    it('interprets interpolation as strings', () => {
      const messages = diagnose(`<blockquote cite="{{ person }}"></blockquote>`, `
      class TestComponent {
        person: {};
      }`);

      expect(messages).toEqual([]);
    });

    it('checks bindings to regular element', () => {
      const messages = diagnose(`<img [srcc]="src" [height]="heihgt">`, `
      class TestComponent {
        src: string;
        height: number;
      }`);

      expect(messages).toEqual([
        `synthetic.html(5, 17): Property 'srcc' does not exist on type 'HTMLImageElement'. Did you mean 'src'?`,
        `synthetic.html(28, 34): Property 'heihgt' does not exist on type 'TestComponent'. Did you mean 'height'?`,
      ]);
    });

    it('produces diagnostics for pipes', () => {
      const messages = diagnose(
          `<div>{{ person.name | pipe:person.age:1 }}</div>`, `
        class Pipe {
          transform(value: string, a: string, b: string): string { return a + b; }
        }
        class TestComponent {
          person: {
            name: string;
            age: number;
          };
        }`,
          [{type: 'pipe', name: 'Pipe', pipeName: 'pipe'}]);

      expect(messages).toEqual([
        `synthetic.html(27, 37): Argument of type 'number' is not assignable to parameter of type 'string'.`,
      ]);
    });

    it('does not produce diagnostics for user code', () => {
      const messages = diagnose(`{{ person.name }}`, `
      class TestComponent {
        person: {
          name: string;
        };
        render(input: string): number { return input; } // <-- type error here should not be reported
      }`);

      expect(messages).toEqual([]);
    });

    describe('strict null checks', () => {
      it('produces diagnostic for unchecked property access', () => {
        const messages =
            diagnose(`<div [class.has-street]="person.address.street.length > 0"></div>`, `
        export class TestComponent {
          person: {
            address?: {
              street: string;
            };
          };
        }`);

        expect(messages).toEqual([`synthetic.html(25, 46): Object is possibly 'undefined'.`]);
      });

      it('does not produce diagnostic for checked property access', () => {
        const messages = diagnose(
            `<div [class.has-street]="person.address && person.address.street.length > 0"></div>`, `
        export class TestComponent {
          person: {
            address?: {
              street: string;
            };
          };
        }`);

        expect(messages).toEqual([]);
      });
    });

    it('computes line and column offsets', () => {
      const diagnostics = typecheck(
          `
<div>
  <img [src]="srcc"
       [height]="heihgt">
</div>    
`,
          `
class TestComponent {
  src: string;
  height: number;
}`);

      expect(diagnostics.length).toBe(2);
      expect(formatSpan(diagnostics[0])).toBe('2:14, 2:18');
      expect(formatSpan(diagnostics[1])).toBe('3:17, 3:23');
    });
  });
});

function diagnose(
    template: string, source: string, declarations?: TestDeclaration[],
    additionalSources: TestFile[] = []): string[] {
  const diagnostics = typecheck(template, source, declarations, additionalSources);
  return diagnostics.map(diagnostic => {
    const span = diagnostic.span !;
    return `${span.start.file.url}(${span.start.offset}, ${span.end.offset}): ${diagnostic.messageText}`;
  });
}

function formatSpan(diagostic: ts.Diagnostic | Diagnostic): string {
  if (diagostic.source !== 'angular') {
    return '<unexpected non-angular span>';
  }
  const diag = diagostic as Diagnostic;
  return `${diag.span!.start.line}:${diag.span!.start.col}, ${diag.span!.end.line}:${diag.span!.end.col}`;
}
