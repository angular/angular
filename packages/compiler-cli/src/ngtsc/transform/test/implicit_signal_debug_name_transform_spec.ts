/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {signalMetadataTransform} from '../src/implicit_signal_debug_name_transform';

describe('signalMetadataTransform', () => {
  it('should transform a variable declaration', async () => {
    const sourceCode = `
      import { signal } from '@angular/core';

      function foo() {
        const bar = signal(0);
      }
      `;
    const output = await getTransformedOutput(sourceCode);

    expect(output).toContain(
      'const bar = (0, core_1.signal)(0, ...(ngDevMode ? [{ debugName: "bar" }] : []));',
    );
  });

  it('should transform a property assignment', async () => {
    const sourceCode = `
      import { signal } from '@angular/core';

      function foo() {
        bar: Signal<number>;
        constructor() {
          this.bar = signal(0);
        }
      }
      `;
    const output = await getTransformedOutput(sourceCode);

    expect(output).toContain(
      'this.bar = (0, core_1.signal)(0, ...(ngDevMode ? [{ debugName: "bar" }] : []));',
    );
  });

  it('should transform a property declaration', async () => {
    const sourceCode = `
      import { signal } from '@angular/core';

      class MyComponent {
        foo = signal(0);
      }
      `;
    const output = await getTransformedOutput(sourceCode);

    expect(output).toContain(
      'this.foo = (0, core_1.signal)(0, ...(ngDevMode ? [{ debugName: "foo" }] : []));',
    );
  });

  it('should transform a signal with an existing object', async () => {
    const sourceCode = `
      import { signal } from '@angular/core';

      class MyComponent {
        foo = signal(0, { equal: isEqual });
      }
      `;
    const output = await getTransformedOutput(sourceCode);

    expect(output).toContain(
      'this.foo = (0, core_1.signal)(0, ...(ngDevMode ? [{ debugName: "foo", equal: isEqual }] : [{ equal: isEqual }]));',
    );
  });

  it('should NOT transform symbols that are not part of @angular', async () => {
    const sourceCode = `
      import { signal } from 'any-lib';

      class MyComponent {
        foo = signal(0);
      }
      `;
    const output = await getTransformedOutput(sourceCode);

    expect(output).toContain('this.foo = (0, any_lib_1.signal)(0);');
  });

  describe('signal', () => {
    it('should handle base case', async () => {
      const sourceCode = `
        import { signal } from '@angular/core';

        class MyComponent {
          foo = signal<string>('bar');
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        `this.foo = (0, core_1.signal)('bar', ...(ngDevMode ? [{ debugName: "foo" }] : []));`,
      );
    });
  });

  describe('computed', () => {
    it('should handle base case', async () => {
      const sourceCode = `
        import { signal, computed } from '@angular/core';

        class MyComponent {
          foo = signal(0);
          bar = computed(() => foo() + 1);
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        'this.bar = (0, core_1.computed)(() => foo() + 1, ...(ngDevMode ? [{ debugName: "bar" }] : []));',
      );
    });
  });

  describe('linkedSignal', () => {
    it('should handle base case', async () => {
      const sourceCode = `
        import { signal, linkedSignal } from '@angular/core';

        class MyComponent {
          foo = signal(0);
          bar = linkedSignal(() => foo() + 1);
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        'this.bar = (0, core_1.linkedSignal)(() => foo() + 1, ...(ngDevMode ? [{ debugName: "bar" }] : []));',
      );
    });

    it('should transform a linkedSignal with computation', async () => {
      const sourceCode = `
        import { signal, linkedSignal } from '@angular/core';

        class MyComponent {
          foo = signal(0);
          bar = linkedSignal({
            source: foo,
            computation: () => 1
          });
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        'this.bar = (0, core_1.linkedSignal)(...(ngDevMode ? ' +
          '[{ debugName: "bar", source: foo, computation: () => 1 }] : ' +
          '[{ source: foo, computation: () => 1 }]));',
      );
    });
  });

  describe('effect', () => {
    it('should handle base case', async () => {
      const sourceCode = `
        import { signal, effect } from '@angular/core';

        class MyComponent {
          foo = signal(0);
          barRef = effect(() => {
            foo();
          });
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        'this.barRef = (0, core_1.effect)(() => { foo(); }, ...(ngDevMode ? [{ debugName: "barRef" }] : []));',
      );
    });
  });

  describe('Inputs', () => {
    it('should handle base case', async () => {
      const sourceCode = `
        import { input } from '@angular/core';

        class MyComponent {
          foo = input<string>('bar');
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        `this.foo = (0, core_1.input)('bar', ...(ngDevMode ? [{ debugName: "foo" }] : []));`,
      );
    });

    it('should transform a required input', async () => {
      const sourceCode = `
        import { input } from '@angular/core';

        class MyComponent {
          foo = input.required<string>();
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        `this.foo = core_1.input.required(...(ngDevMode ? [{ debugName: "foo" }] : []));`,
      );
    });

    it('should transform a model input', async () => {
      const sourceCode = `
        import { model } from '@angular/core';

        class MyComponent {
          foo = model('bar');
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        `this.foo = (0, core_1.model)('bar', ...(ngDevMode ? [{ debugName: "foo" }] : []));`,
      );
    });
  });

  describe('Children queries', () => {
    it('should transform a viewChild', async () => {
      const sourceCode = `
        import { viewChild } from '@angular/core';

        class MyComponent {
          foo = viewChild(FooComponent);
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        'this.foo = (0, core_1.viewChild)(FooComponent, ...(ngDevMode ? [{ debugName: "foo" }] : []));',
      );
    });

    it('should transform a viewChildren', async () => {
      const sourceCode = `
        import { viewChildren } from '@angular/core';

        class MyComponent {
          foo = viewChildren(FooComponent);
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        'this.foo = (0, core_1.viewChildren)(FooComponent, ...(ngDevMode ? [{ debugName: "foo" }] : []));',
      );
    });

    it('should transform a contentChild', async () => {
      const sourceCode = `
        import { contentChild } from '@angular/core';

        class MyComponent {
          foo = contentChild(FooComponent);
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        'this.foo = (0, core_1.contentChild)(FooComponent, ...(ngDevMode ? [{ debugName: "foo" }] : []));',
      );
    });

    it('should transform a contentChildren', async () => {
      const sourceCode = `
        import { contentChildren } from '@angular/core';

        class MyComponent {
          foo = contentChildren(FooComponent);
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        'this.foo = (0, core_1.contentChildren)(FooComponent, ...(ngDevMode ? [{ debugName: "foo" }] : []));',
      );
    });
  });

  describe('Resources', () => {
    it('should transform a resource', async () => {
      const sourceCode = `
        import { resource } from '@angular/core';

        class MyComponent {
          foo = resource({
            defaultValue: 'bar',
            loader: () => service(),
          });
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        'this.foo = (0, core_1.resource)(...(ngDevMode ? ' +
          `[{ debugName: "foo", defaultValue: 'bar', loader: () => service() }] : ` +
          `[{ defaultValue: 'bar', loader: () => service(), }]` +
          '));',
      );
    });

    it('should transform an httpResource', async () => {
      const sourceCode = `
        import { signal } from '@angular/core';
        import { httpResource } from '@angular/common/http';

        class MyComponent {
          foo = signal('foo');
          bar = httpResource(() => '/api/' + foo());
        }
        `;
      const output = await getTransformedOutput(sourceCode);

      expect(output).toContain(
        `this.bar = (0, http_1.httpResource)(() => '/api/' + foo(), ...(ngDevMode ? [{ debugName: "bar" }] : []));`,
      );
    });
  });
});

function getTransformedOutput(sourceCode: string): Promise<string> {
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    strict: true,
    esModuleInterop: true,
  };
  const program = createProgram(sourceCode, 'main.ts', options);

  return new Promise<string>((res) => {
    program.emit(
      undefined,
      (_, transformed) => {
        const formatted = transformed.replace(/\n/g, '').replace(/\s+/g, ' ');
        res(formatted);
      },
      undefined,
      false,
      {before: [signalMetadataTransform(program)]},
    );
  });
}

export function createProgram(
  sourceCode: string,
  fileName: string,
  compilerOptions: ts.CompilerOptions,
): ts.Program {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceCode,
    compilerOptions.target || ts.ScriptTarget.ES2020,
    true,
  );
  const host = ts.createCompilerHost(compilerOptions, true);

  // Override getSourceFile to return the in-memory target file
  const originalGetSourceFile = host.getSourceFile;
  host.getSourceFile = (
    name: string,
    languageVersion: ts.ScriptTarget,
    ...rest: any[]
  ): ts.SourceFile | undefined => {
    if (name === fileName) {
      return sourceFile;
    }
    return originalGetSourceFile(name, languageVersion, ...rest);
  };

  return ts.createProgram([fileName], compilerOptions, host);
}
