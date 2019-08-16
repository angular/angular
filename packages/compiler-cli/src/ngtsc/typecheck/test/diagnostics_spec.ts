/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TestFile, runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import * as ts from 'typescript';

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
          [`synthetic.html(1, 10): Type 'string' is not assignable to type 'number | undefined'.`]);
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
        `synthetic.html(1, 62): Argument of type 'number' is not assignable to parameter of type 'string'.`,
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
        `synthetic.html(1, 24): Argument of type 'HTMLDivElement' is not assignable to parameter of type 'string'.`,
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
        `synthetic.html(1, 31): Argument of type 'Dir' is not assignable to parameter of type 'string'.`,
      ]);
    });

    it('infers TemplateRef<any> for ng-template references', () => {
      const messages = diagnose(`<ng-template #tmpl>{{ render(tmpl) }}</ng-template>`, `
      class TestComponent {
        render(input: string): string { return input; }
      }`);

      expect(messages).toEqual([
        `synthetic.html(1, 30): Argument of type 'TemplateRef<any>' is not assignable to parameter of type 'string'.`,
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
        `synthetic.html(1, 40): Property 'namme' does not exist on type '{ name: string; }'. Did you mean 'name'?`,
      ]);
    });

    it('interprets interpolation as strings', () => {
      const messages = diagnose(`<blockquote title="{{ person }}"></blockquote>`, `
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
        `synthetic.html(1, 29): Property 'heihgt' does not exist on type 'TestComponent'. Did you mean 'height'?`,
        `synthetic.html(1, 6): 'srcc' is not a valid property of <img>.`,
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
        `synthetic.html(1, 28): Argument of type 'number' is not assignable to parameter of type 'string'.`,
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

        expect(messages).toEqual([`synthetic.html(1, 26): Object is possibly 'undefined'.`]);
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
      const messages = diagnose(
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

      expect(messages).toEqual([
        `synthetic.html(3, 15): Property 'srcc' does not exist on type 'TestComponent'. Did you mean 'src'?`,
        `synthetic.html(4, 18): Property 'heihgt' does not exist on type 'TestComponent'. Did you mean 'height'?`,
      ]);
    });
  });
});

function diagnose(
    template: string, source: string, declarations?: TestDeclaration[],
    additionalSources: TestFile[] = []): string[] {
  const diagnostics = typecheck(template, source, declarations, additionalSources);
  return diagnostics.map(diag => {
    const text =
        typeof diag.messageText === 'string' ? diag.messageText : diag.messageText.messageText;
    const fileName = diag.file !.fileName;
    const {line, character} = ts.getLineAndCharacterOfPosition(diag.file !, diag.start !);
    return `${fileName}(${line + 1}, ${character + 1}): ${text}`;
  });
}
