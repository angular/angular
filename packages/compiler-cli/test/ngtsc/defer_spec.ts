/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

function cleanNewLines(contents: string) {
  return contents.replace(/\s*\n\s*/g, ' ');
}

runInEachFileSystem(() => {
  describe('ngtsc @defer block', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should handle deferred blocks', () => {
      env.write(
        'cmp-a.ts',
        `
        import { Component } from '@angular/core';

        @Component({
          selector: 'cmp-a',
          template: 'CmpA!'
        })
        export class CmpA {}
      `,
      );

      env.write(
        '/test.ts',
        `
        import { Component } from '@angular/core';
        import { CmpA } from './cmp-a';

        @Component({
          selector: 'local-dep',
          template: 'Local dependency',
        })
        export class LocalDep {}

        @Component({
          selector: 'test-cmp',
          imports: [CmpA, LocalDep],
          template: \`
            @defer {
              <cmp-a />
              <local-dep />
            }
          \`,
        })
        export class TestCmp {}
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');

      expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');
      expect(cleanNewLines(jsContents)).toContain(
        '() => [/* @ts-ignore */ import("./cmp-a").then(m => m.CmpA), LocalDep]',
      );

      // The `CmpA` symbol wasn't referenced elsewhere, so it can be defer-loaded
      // via dynamic imports and an original import can be removed.
      expect(jsContents).not.toContain('import { CmpA }');
    });

    it('should include timer scheduler function when `after` or `minimum` parameters are used', () => {
      env.write(
        'cmp-a.ts',
        `
          import { Component } from '@angular/core';

          @Component({
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export class CmpA {}
        `,
      );

      env.write(
        '/test.ts',
        `
          import { Component } from '@angular/core';
          import { CmpA } from './cmp-a';

          @Component({
            selector: 'test-cmp',
            imports: [CmpA],
            template: \`
              @defer {
                <cmp-a />
              } @loading (after 500ms; minimum 300ms) {
                Loading...
              }
            \`,
          })
          export class TestCmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        'ɵɵdefer(2, 0, TestCmp_Defer_2_DepsFn, 1, null, null, 0, null, i0.ɵɵdeferEnableTimerScheduling)',
      );
    });

    it('should include incremental hydration runtime activator when `@defer` uses hydrate triggers', () => {
      env.write(
        'cmp-a.ts',
        `
          import { Component } from '@angular/core';

          @Component({
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export class CmpA {}
        `,
      );

      env.write(
        '/test.ts',
        `
          import { Component } from '@angular/core';
          import { CmpA } from './cmp-a';

          @Component({
            selector: 'test-cmp',
            imports: [CmpA],
            template: \`
              @defer (hydrate on idle) {
                <cmp-a />
              }
            \`,
          })
          export class TestCmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('i0.ɵɵenableIncrementalHydrationRuntime');
      expect(jsContents).toContain('i0.ɵɵdeferHydrateOnIdle()');
    });

    it('should NOT include incremental hydration runtime activator when `@defer` has no hydrate triggers', () => {
      env.write(
        'cmp-a.ts',
        `
          import { Component } from '@angular/core';

          @Component({
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export class CmpA {}
        `,
      );

      env.write(
        '/test.ts',
        `
          import { Component } from '@angular/core';
          import { CmpA } from './cmp-a';

          @Component({
            selector: 'test-cmp',
            imports: [CmpA],
            template: \`
              @defer (on idle) {
                <cmp-a />
              }
            \`,
          })
          export class TestCmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).not.toContain('ɵɵenableIncrementalHydrationRuntime');
    });

    describe('imports', () => {
      it('should retain regular imports when symbol is eagerly referenced', () => {
        env.write(
          'cmp-a.ts',
          `
          import { Component } from '@angular/core';

          @Component({
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export class CmpA {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { CmpA } from './cmp-a';

          @Component({
            selector: 'test-cmp',
            imports: [CmpA],
            template: \`
              @defer {
                <cmp-a />
              }
            \`,
          })
          export class TestCmp {
            constructor() {
              // This line retains the regular import of CmpA,
              // since it's eagerly referenced in the code.
              console.log(CmpA);
            }
          }
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');

        // The dependency function doesn't have a dynamic import, because `CmpA`
        // was eagerly referenced in component's code, thus regular import can not be removed.
        expect(jsContents).toContain('() => [CmpA]');
        expect(jsContents).toContain('import { CmpA }');
      });

      it('should retain regular imports when one of the symbols is eagerly referenced', () => {
        env.write(
          'cmp-a.ts',
          `
          import { Component } from '@angular/core';

          @Component({
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export class CmpA {}

          @Component({
            selector: 'cmp-b',
            template: 'CmpB!'
          })
          export class CmpB {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { CmpA, CmpB } from './cmp-a';

          @Component({
            selector: 'test-cmp',
            imports: [CmpA, CmpB],
            template: \`
              @defer {
                <cmp-a />
                <cmp-b />
              }
            \`,
          })
          export class TestCmp {
            constructor() {
              // This line retains the regular import of CmpA,
              // since it's eagerly referenced in the code.
              console.log(CmpA);
            }
          }
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');

        // The dependency function doesn't have a dynamic import, because `CmpA`
        // was eagerly referenced in component's code, thus regular import can not be removed.
        // This also affects `CmpB`, since it was extracted from the same import.
        expect(jsContents).toContain('() => [CmpA, CmpB]');
        expect(jsContents).toContain('import { CmpA, CmpB }');
      });

      it('should drop regular imports when none of the symbols are eagerly referenced', () => {
        env.write(
          'cmp-a.ts',
          `
          import { Component } from '@angular/core';

          @Component({
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export class CmpA {}

          @Component({
            selector: 'cmp-b',
            template: 'CmpB!'
          })
          export class CmpB {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { CmpA, CmpB } from './cmp-a';

          @Component({
            selector: 'test-cmp',
            imports: [CmpA, CmpB],
            template: \`
              @defer {
                <cmp-a />
                <cmp-b />
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');

        // Both `CmpA` and `CmpB` were used inside the defer block and were not
        // referenced elsewhere, so we generate dynamic imports and drop a regular one.
        expect(cleanNewLines(jsContents)).toContain(
          '() => [/* @ts-ignore */ import("./cmp-a").then(m => m.CmpA), /* @ts-ignore */ import("./cmp-a").then(m => m.CmpB)]',
        );
        expect(jsContents).not.toContain('import { CmpA, CmpB }');
      });

      it('should lazy-load dependency referenced with a fowrardRef', () => {
        env.write(
          'cmp-a.ts',
          `
          import { Component } from '@angular/core';

          @Component({
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export class CmpA {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component, forwardRef } from '@angular/core';
          import { CmpA } from './cmp-a';

          @Component({
            selector: 'test-cmp',
            imports: [forwardRef(() => CmpA)],
            template: \`
              @defer {
                <cmp-a />
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');
        expect(cleanNewLines(jsContents)).toContain(
          '() => [/* @ts-ignore */ import("./cmp-a").then(m => m.CmpA)]',
        );

        // The `CmpA` symbol wasn't referenced elsewhere, so it can be defer-loaded
        // via dynamic imports and an original import can be removed.
        expect(jsContents).not.toContain('import { CmpA }');
      });

      it('should drop imports when one is deferrable and the rest are type-only imports', () => {
        env.write(
          'cmp-a.ts',
          `
          import { Component } from '@angular/core';

          export class Foo {}

          @Component({
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export class CmpA {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { CmpA, type Foo } from './cmp-a';

          export const foo: Foo = {};

          @Component({
            selector: 'test-cmp',
            imports: [CmpA],
            template: \`
              @defer {
                <cmp-a />
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');
        expect(cleanNewLines(jsContents)).toContain(
          '() => [/* @ts-ignore */ import("./cmp-a").then(m => m.CmpA)]',
        );
        expect(jsContents).not.toContain('import { CmpA }');
      });

      it('should drop multiple imports to the same file when one is deferrable and the other has a single type-only element', () => {
        env.write(
          'cmp-a.ts',
          `
            import { Component } from '@angular/core';

            export class Foo {}

            @Component({
              selector: 'cmp-a',
              template: 'CmpA!'
            })
            export class CmpA {}
          `,
        );

        env.write(
          '/test.ts',
          `
            import { Component } from '@angular/core';
            import { CmpA } from './cmp-a';
            import { type Foo } from './cmp-a';

            export const foo: Foo = {};

            @Component({
              selector: 'test-cmp',
              imports: [CmpA],
              template: \`
                @defer {
                  <cmp-a />
                }
              \`,
            })
            export class TestCmp {}
          `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');
        expect(cleanNewLines(jsContents)).toContain(
          '() => [/* @ts-ignore */ import("./cmp-a").then(m => m.CmpA)]',
        );
        expect(jsContents).not.toContain('import { CmpA }');
      });

      it('should drop multiple imports to the same file when one is deferrable and the other is type-only at the declaration level', () => {
        env.write(
          'cmp-a.ts',
          `
            import { Component } from '@angular/core';

            export class Foo {}

            @Component({
              selector: 'cmp-a',
              template: 'CmpA!'
            })
            export class CmpA {}
          `,
        );

        env.write(
          '/test.ts',
          `
            import { Component } from '@angular/core';
            import { CmpA } from './cmp-a';
            import type { Foo, CmpA as CmpAlias } from './cmp-a';

            export const foo: Foo|CmpAlias = {};

            @Component({
              selector: 'test-cmp',
              imports: [CmpA],
              template: \`
                @defer {
                  <cmp-a />
                }
              \`,
            })
            export class TestCmp {}
          `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');
        expect(cleanNewLines(jsContents)).toContain(
          '() => [/* @ts-ignore */ import("./cmp-a").then(m => m.CmpA)]',
        );
        expect(jsContents).not.toContain('import { CmpA }');
      });

      it('should drop multiple imports to the same file when one is deferrable and the other is a type-only import of all symbols', () => {
        env.write(
          'cmp-a.ts',
          `
            import { Component } from '@angular/core';

            export class Foo {}

            @Component({
              selector: 'cmp-a',
              template: 'CmpA!'
            })
            export class CmpA {}
          `,
        );

        env.write(
          '/test.ts',
          `
            import { Component } from '@angular/core';
            import { CmpA } from './cmp-a';
            import type * as allCmpA from './cmp-a';

            export const foo: allCmpA.Foo|allCmpA.CmpA = {};

            @Component({
              selector: 'test-cmp',
              imports: [CmpA],
              template: \`
                @defer {
                  <cmp-a />
                }
              \`,
            })
            export class TestCmp {}
          `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');
        expect(cleanNewLines(jsContents)).toContain(
          '() => [/* @ts-ignore */ import("./cmp-a").then(m => m.CmpA)]',
        );
        expect(jsContents).not.toContain('import { CmpA }');
      });

      it('should drop multiple imports of deferrable symbols from the same file', () => {
        env.write(
          'cmps.ts',
          `
          import { Component } from '@angular/core';

          @Component({
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export class CmpA {}

          @Component({
            selector: 'cmp-b',
            template: 'CmpB!'
          })
          export class CmpB {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { CmpA } from './cmps';
          import { CmpB } from './cmps';

          @Component({
            selector: 'test-cmp',
            imports: [CmpA, CmpB],
            template: \`
              @defer {
                <cmp-a />
                <cmp-b />
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');
        expect(cleanNewLines(jsContents)).toContain(
          '() => [/* @ts-ignore */ import("./cmps").then(m => m.CmpA), /* @ts-ignore */ import("./cmps").then(m => m.CmpB)]',
        );
        expect(jsContents).not.toContain('import { CmpA }');
        expect(jsContents).not.toContain('import { CmpB }');
      });

      it('should handle deferred dependencies imported through a default import', () => {
        env.write(
          'cmp-a.ts',
          `
          import { Component } from '@angular/core';
          @Component({
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export default class CmpA {}
        `,
        );
        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import CmpA from './cmp-a';
          @Component({
            selector: 'local-dep',
            template: 'Local dependency',
          })
          export class LocalDep {}
          @Component({
            selector: 'test-cmp',
            imports: [CmpA, LocalDep],
            template: \`
              @defer {
                <cmp-a />
                <local-dep />
              }
            \`,
          })
          export class TestCmp {}
        `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');
        expect(cleanNewLines(jsContents)).toContain(
          'const TestCmp_Defer_1_DepsFn = () => [/* @ts-ignore */ import("./cmp-a").then(m => m.default), LocalDep];',
        );
        expect(cleanNewLines(jsContents)).toContain(
          'i0.ɵsetClassMetadataAsync(TestCmp, () => [/* @ts-ignore */ import("./cmp-a").then(m => m.default)]',
        );
        // The `CmpA` symbol wasn't referenced elsewhere, so it can be defer-loaded
        // via dynamic imports and an original import can be removed.
        expect(jsContents).not.toContain('import CmpA');
      });

      it('should defer symbol that is used only in types', () => {
        env.write(
          'cmp.ts',
          `
          import { Component } from '@angular/core';

          @Component({
            selector: 'cmp',
            template: 'Cmp!'
          })
          export class Cmp {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component, viewChild } from '@angular/core';
          import { Cmp } from './cmp';

          const topLevelConst: Cmp = null!;

          @Component({
            imports: [Cmp],
            template: \`
              @defer {
                <cmp #ref/>
              }
            \`,
          })
          export class TestCmp {
            query = viewChild<Cmp>('ref');
            asType: Cmp;
            inlineType: {foo: Cmp};
            unionType: string | Cmp | number;
            constructor(param: Cmp) {}
            inMethod(param: Cmp): Cmp {
              let localVar: Cmp | null = null;
              return localVar!;
            }
          }

          function inFunction(param: Cmp): Cmp {
            return null!;
          }
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');
        expect(cleanNewLines(jsContents)).toContain(
          '() => [/* @ts-ignore */ import("./cmp").then(m => m.Cmp)]',
        );
        expect(jsContents).not.toContain('import { Cmp }');
      });

      it('should retain symbols used in types and eagerly', () => {
        env.write(
          'cmp.ts',
          `
          import { Component } from '@angular/core';

          @Component({
            selector: 'cmp',
            template: 'Cmp!'
          })
          export class Cmp {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component, viewChild } from '@angular/core';
          import { Cmp } from './cmp';

          @Component({
            imports: [Cmp],
            template: \`
              @defer {
                <cmp #ref/>
              }
            \`,
          })
          export class TestCmp {
            // Type-only reference
            query = viewChild<Cmp>('ref');

            // Directy reference
            otherQuery = viewChild(Cmp);
          }
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');
        expect(jsContents).toContain('() => [Cmp]');
        expect(jsContents).toContain('import { Cmp }');
      });
    });

    it('should detect pipe used in the `when` trigger as an eager dependency', () => {
      env.write(
        'test-pipe.ts',
        `
        import { Pipe } from '@angular/core';

        @Pipe({name: 'test'})
        export class TestPipe {
          transform(arg: unknown) {
            return 1;
          }
        }
      `,
      );

      env.write(
        '/test.ts',
        `
        import { Component } from '@angular/core';
        import { TestPipe } from './test-pipe';

        @Component({
          selector: 'test-cmp',
          imports: [TestPipe],
          template: '@defer (when 1 | test) { hello }',
        })
        export class TestCmp {
        }
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');

      expect(jsContents).toContain('dependencies: [TestPipe]');
    });

    it('should detect pipe used in the `prefetch when` trigger as an eager dependency', () => {
      env.write(
        'test-pipe.ts',
        `
        import { Pipe } from '@angular/core';

        @Pipe({name: 'test'})
        export class TestPipe {
          transform(arg: unknown) {
            return 1;
          }
        }
      `,
      );

      env.write(
        '/test.ts',
        `
        import { Component } from '@angular/core';
        import { TestPipe } from './test-pipe';

        @Component({
          selector: 'test-cmp',
          imports: [TestPipe],
          template: '@defer (when 1 | test) { hello }',
        })
        export class TestCmp {
        }
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');

      expect(jsContents).toContain('dependencies: [TestPipe]');
    });

    it('should detect pipe used both in a trigger and the deferred content as eager', () => {
      env.write(
        'test-pipe.ts',
        `
        import { Pipe } from '@angular/core';

        @Pipe({name: 'test'})
        export class TestPipe {
          transform(arg: unknown) {
            return 1;
          }
        }
      `,
      );

      env.write(
        '/test.ts',
        `
        import { Component } from '@angular/core';
        import { TestPipe } from './test-pipe';

        @Component({
          selector: 'test-cmp',
          imports: [TestPipe],
          template: '@defer (when 1 | test) { {{1 | test}} }',
        })
        export class TestCmp {
        }
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');

      expect(jsContents).toContain('dependencies: [TestPipe]');
    });

    describe('@Component.deferredImports', () => {
      beforeEach(() => {
        env.tsconfig({onlyExplicitDeferDependencyImports: true});
      });

      it('should handle `@Component.deferredImports` field', () => {
        env.write(
          'deferred-a.ts',
          `
          import {Component} from '@angular/core';
          @Component({
            selector: 'deferred-cmp-a',
            template: 'DeferredCmpA contents',
          })
          export class DeferredCmpA {
          }
        `,
        );

        env.write(
          'deferred-b.ts',
          `
          import {Component} from '@angular/core';
          @Component({
            selector: 'deferred-cmp-b',
            template: 'DeferredCmpB contents',
          })
          export class DeferredCmpB {
          }
        `,
        );

        env.write(
          'pipe-a.ts',
          `
          import {Pipe} from '@angular/core';
          @Pipe({
            name: 'pipea',
          })
          export class PipeA {
            transform(arg: unknown) {}
          }
        `,
        );

        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {DeferredCmpA} from './deferred-a';
          import {DeferredCmpB} from './deferred-b';
          import {PipeA} from './pipe-a';
          @Component({
            // @ts-ignore
            deferredImports: { block1: [DeferredCmpA, PipeA], block2: [DeferredCmpB] },
            template: \`
              @for (item of items; track item) {
                @if (true) {
                  @defer (name block1) {
                    {{ 'Hi!' | pipea }}
                    <deferred-cmp-a />
                  }
                  @defer (name block2) {
                    <deferred-cmp-b />
                  }
                }
              }
            \`,
          })
          export class AppCmp {
             items = [1,2,3];
          }
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // Expect that all deferrableImports in local compilation mode
        // are located in a single function (since we can't detect in
        // the local mode which components belong to which block).
        expect(cleanNewLines(jsContents)).toContain(
          'const AppCmp_For_1_Conditional_0_Defer_1_DepsFn = () => [/* @ts-ignore */ ' +
            'import("./deferred-a").then(m => m.DeferredCmpA), /* @ts-ignore */ ' +
            'import("./pipe-a").then(m => m.PipeA)];',
        );
        expect(cleanNewLines(jsContents)).toContain(
          'const AppCmp_For_1_Conditional_0_Defer_4_DepsFn = () => [/* @ts-ignore */ ' +
            'import("./deferred-b").then(m => m.DeferredCmpB)];',
        );

        // Make sure there are no eager imports present in the output.
        expect(jsContents).not.toContain(`from './deferred-a'`);
        expect(jsContents).not.toContain(`from './deferred-b'`);
        expect(jsContents).not.toContain(`from './pipe-a'`);

        // There's 2 separate defer instructions due to the two separate defer blocks
        expect(jsContents).toContain('ɵɵdefer(1, 0, AppCmp_For_1_Conditional_0_Defer_1_DepsFn);');
        expect(jsContents).toContain('ɵɵdefer(4, 3, AppCmp_For_1_Conditional_0_Defer_4_DepsFn);');

        // Expect `ɵsetClassMetadataAsync` to contain dynamic imports too.
        expect(cleanNewLines(jsContents)).toContain(
          'ɵsetClassMetadataAsync(AppCmp, () => [/* @ts-ignore */ ' +
            'import("./deferred-a").then(m => m.DeferredCmpA), /* @ts-ignore */ ' +
            'import("./pipe-a").then(m => m.PipeA), /* @ts-ignore */ ' +
            'import("./deferred-b").then(m => m.DeferredCmpB)], ' +
            '(DeferredCmpA, PipeA, DeferredCmpB) => {',
        );
      });

      it('should handle defer blocks that rely on deps from `deferredImports` and `imports`', () => {
        env.write(
          'eager-a.ts',
          `
            import {Component} from '@angular/core';

            @Component({
              selector: 'eager-cmp-a',
              template: 'EagerCmpA contents',
            })
            export class EagerCmpA {
            }
          `,
        );

        env.write(
          'deferred-a.ts',
          `
            import {Component} from '@angular/core';

            @Component({
              selector: 'deferred-cmp-a',
              template: 'DeferredCmpA contents',
            })
            export class DeferredCmpA {
            }
          `,
        );

        env.write(
          'deferred-b.ts',
          `
            import {Component} from '@angular/core';

            @Component({
              selector: 'deferred-cmp-b',
              template: 'DeferredCmpB contents',
            })
            export class DeferredCmpB {
            }
          `,
        );

        env.write(
          'test.ts',
          `
            import {Component} from '@angular/core';
            import {DeferredCmpA} from './deferred-a';
            import {DeferredCmpB} from './deferred-b';
            import {EagerCmpA} from './eager-a';

            @Component({
              imports: [EagerCmpA],
              // @ts-ignore
              deferredImports: { block1: [DeferredCmpA], block2: [DeferredCmpB] },
              template: \`
                @defer (name block1) {
                  <eager-cmp-a />
                  <deferred-cmp-a />
                }
                @defer (name block2) {
                  <eager-cmp-a />
                  <deferred-cmp-b />
                }
              \`,
            })
            export class AppCmp {
            }
          `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // Expect that all deferrableImports to become dynamic imports.
        // Other imported symbols remain eager.
        expect(cleanNewLines(jsContents)).toContain(
          'const AppCmp_Defer_1_DepsFn = () => [/* @ts-ignore */ ' +
            'import("./deferred-a").then(m => m.DeferredCmpA)];',
        );
        expect(cleanNewLines(jsContents)).toContain(
          'const AppCmp_Defer_4_DepsFn = () => [/* @ts-ignore */ ' +
            'import("./deferred-b").then(m => m.DeferredCmpB)];',
        );

        // Make sure there are no eager imports present in the output.
        expect(jsContents).not.toContain(`from './deferred-a'`);
        expect(jsContents).not.toContain(`from './deferred-b'`);

        // Eager dependencies retain their imports.
        expect(jsContents).toContain(`from './eager-a';`);

        // Defer blocks would have their own dependency functions in full mode.
        expect(jsContents).toContain('ɵɵdefer(1, 0, AppCmp_Defer_1_DepsFn);');
        expect(jsContents).toContain('ɵɵdefer(4, 3, AppCmp_Defer_4_DepsFn);');

        // Expect `ɵsetClassMetadataAsync` to contain dynamic imports too.
        expect(cleanNewLines(jsContents)).toContain(
          'ɵsetClassMetadataAsync(AppCmp, () => [/* @ts-ignore */ ' +
            'import("./deferred-a").then(m => m.DeferredCmpA), /* @ts-ignore */ ' +
            'import("./deferred-b").then(m => m.DeferredCmpB)], ' +
            '(DeferredCmpA, DeferredCmpB) => {',
        );
      });

      describe('error handling', () => {
        it('should produce an error when unsupported type (@Injectable) is used in `deferredImports`', () => {
          env.write(
            'test.ts',
            `
              import {Component, Injectable} from '@angular/core';
              @Injectable()
              class MyInjectable {}
              @Component({
                // @ts-ignore
                deferredImports: { block1: [MyInjectable] },
                template: '',
              })
              export class AppCmp {
              }
            `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_UNKNOWN_DEFERRED_IMPORT));
        });

        it('should produce an error when unsupported type (@NgModule) is used in `deferredImports`', () => {
          env.write(
            'test.ts',
            `
              import {Component, NgModule} from '@angular/core';
              @NgModule()
              class MyModule {}
              @Component({
                // @ts-ignore
                deferredImports: { block1: [MyModule] },
                template: '',
              })
              export class AppCmp {
              }
            `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_UNKNOWN_DEFERRED_IMPORT));
        });

        it('should produce an error when components from `deferredImports` are used outside of defer blocks', () => {
          env.write(
            'deferred-a.ts',
            `
              import {Component} from '@angular/core';

              @Component({
                selector: 'deferred-cmp-a',
                template: 'DeferredCmpA contents',
              })
              export class DeferredCmpA {
              }
            `,
          );

          env.write(
            'deferred-b.ts',
            `
              import {Component} from '@angular/core';

              @Component({
                selector: 'deferred-cmp-b',
                template: 'DeferredCmpB contents',
              })
              export class DeferredCmpB {
              }
            `,
          );

          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';
              import {DeferredCmpA} from './deferred-a';
              import {DeferredCmpB} from './deferred-b';
              @Component({
                // @ts-ignore
                deferredImports: { block1: [DeferredCmpA, DeferredCmpB] },
                template: \`
                  <deferred-cmp-a />
                  @defer (name block1) {
                    <deferred-cmp-b />
                  }
                \`,
              })
              export class AppCmp {
              }
            `,
          );

          const diags = env.driveDiagnostics();

          expect(diags.length).toBe(1);
          expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFERRED_DIRECTIVE_USED_EAGERLY));
          expect(diags[0].messageText).toContain(
            "Component 'DeferredCmpA' (used as element 'deferred-cmp-a') was imported via `@Component.deferredImports`, but was used outside of a `@defer` block in a template",
          );
        });

        it('should produce an error the same component is referenced in both `deferredImports` and `imports`', () => {
          env.write(
            'deferred-a.ts',
            `
              import {Component} from '@angular/core';

              @Component({
                selector: 'deferred-cmp-a',
                template: 'DeferredCmpA contents',
              })
              export class DeferredCmpA {
              }
            `,
          );

          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';
              import {DeferredCmpA} from './deferred-a';

              @Component({
                // @ts-ignore
                deferredImports: { block1: [DeferredCmpA] },
                imports: [DeferredCmpA],
                template: \`
                  @defer (name block1) {
                    <deferred-cmp-a />
                  }
                \`,
              })
              export class AppCmp {}
            `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFERRED_DEPENDENCY_IMPORTED_EAGERLY));
        });

        it('should produce an error when pipes from `deferredImports` are used outside of defer blocks', () => {
          env.write(
            'deferred-pipe-a.ts',
            `
              import {Pipe} from '@angular/core';
              @Pipe({name: 'deferredPipeA'})
              export class DeferredPipeA {
                transform(arg: unknown) {}
              }
            `,
          );

          env.write(
            'deferred-pipe-b.ts',
            `
              import {Pipe} from '@angular/core';
              @Pipe({name: 'deferredPipeB'})
              export class DeferredPipeB {
                transform(arg: unknown) {}
              }
            `,
          );

          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';
              import {DeferredPipeA} from './deferred-pipe-a';
              import {DeferredPipeB} from './deferred-pipe-b';
              @Component({
                // @ts-ignore
                deferredImports: { block1: [DeferredPipeA, DeferredPipeB] },
                template: \`
                  {{ 'Eager' | deferredPipeA }}
                  @defer (name block1) {
                    {{ 'Deferred' | deferredPipeB }}
                  }
                \`,
              })
              export class AppCmp {}
            `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFERRED_PIPE_USED_EAGERLY));
        });

        it('should not produce an error when a deferred block is wrapped in a conditional', () => {
          env.write(
            'deferred-a.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'deferred-cmp-a',
              template: 'DeferredCmpA contents',
            })
            export class DeferredCmpA {
            }
          `,
          );

          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            import {DeferredCmpA} from './deferred-a';
            @Component({
              // @ts-ignore
              deferredImports: { block1: [DeferredCmpA] },
              template: \`
                @if (true) {
                  @if (true) {
                  @if (true) {
                    @defer (name block1) {
                      <deferred-cmp-a />
                    }
                  }
                  }
                }
              \`,
            })
            export class AppCmp {
            condition = true;
            }
          `,
          );

          const diags = env.driveDiagnostics();
          expect(diags).toEqual([]);
        });

        it('should not produce an error when a dependency is wrapped in a condition inside of a deferred block', () => {
          env.write(
            'deferred-a.ts',
            `
              import {Component} from '@angular/core';
              @Component({
                selector: 'deferred-cmp-a',
                template: 'DeferredCmpA contents',
              })
              export class DeferredCmpA {
              }
            `,
          );

          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';
              import {DeferredCmpA} from './deferred-a';
              @Component({
                // @ts-ignore
                deferredImports: { block1: [DeferredCmpA] },
                template: \`
                  @defer (name block1) {
                    @if (true) {
                      @if (true) {
                        @if (true) {
                          <deferred-cmp-a />
                        }
                      }
                    }
                  }
                \`,
              })
              export class AppCmp {
              condition = true;
              }
            `,
          );

          const diags = env.driveDiagnostics();
          expect(diags).toEqual([]);
        });
      });

      describe('block-specific deferredImports mapping', () => {
        beforeEach(() => {
          env.tsconfig({onlyExplicitDeferDependencyImports: true});
        });

        it('should handle block-specific mapping in standard compilation', () => {
          env.write(
            'deferred-a.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'deferred-cmp-a',
              template: 'DeferredCmpA contents',
            })
            export class DeferredCmpA {}
          `,
          );

          env.write(
            'deferred-b.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'deferred-cmp-b',
              template: 'DeferredCmpB contents',
            })
            export class DeferredCmpB {}
          `,
          );

          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            import {DeferredCmpA} from './deferred-a';
            import {DeferredCmpB} from './deferred-b';
            @Component({
              // @ts-ignore
              deferredImports: {
                blockA: [DeferredCmpA],
                blockB: [DeferredCmpB],
              },
              template: \`
                @defer (name blockA) {
                  <deferred-cmp-a />
                }
                @defer (name blockB) {
                  <deferred-cmp-b />
                }
              \`,
            })
            export class AppCmp {}
          `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');

          expect(cleanNewLines(jsContents)).toContain(
            'const AppCmp_Defer_1_DepsFn = () => [/* @ts-ignore */ ' +
              'import("./deferred-a").then(m => m.DeferredCmpA)];',
          );
          expect(cleanNewLines(jsContents)).toContain(
            'const AppCmp_Defer_4_DepsFn = () => [/* @ts-ignore */ ' +
              'import("./deferred-b").then(m => m.DeferredCmpB)];',
          );
        });

        it('should correctly include eager dependencies that are only used inside a defer block when they overlap with deferredImports (empty block)', () => {
          env.tsconfig({onlyExplicitDeferDependencyImports: true});

          env.write(
            'my-cmp.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'my-cmp',
              template: 'MyCmp',
              standalone: true
            })
            export class MyCmp {}
          `,
          );

          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            import {MyCmp} from './my-cmp';
            @Component({
              selector: 'app-root',
              standalone: true,
              imports: [MyCmp],
              // @ts-ignore
              deferredImports: { block1: [] },
              template: \`
                @defer (name block1) {
                  <my-cmp />
                }
              \`
            })
            export class AppRoot {}
          `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');

          // Verify that MyCmp is kept as an eager dependency
          expect(jsContents).toContain('dependencies: [MyCmp]');
        });

        it('should not eager load components that are in the deferredImports object', () => {
          env.tsconfig({onlyExplicitDeferDependencyImports: true});

          env.write(
            'my-cmp.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'my-cmp',
              template: 'MyCmp',
              standalone: true
            })
            export class MyCmp {}
          `,
          );

          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            import {MyCmp} from './my-cmp';
            @Component({
              selector: 'app-root',
              standalone: true,
              // @ts-ignore
              deferredImports: { block1: [MyCmp] },
              template: \`
                @defer (name block1) {
                  <my-cmp />
                }
              \`
            })
            export class AppRoot {}
          `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');

          // Verify that MyCmp is not kept as an eager dependency
          expect(jsContents).not.toContain('dependencies: [MyCmp]');

          // Verify that MyCmp is deferred
          expect(cleanNewLines(jsContents)).toContain('import("./my-cmp").then(m => m.MyCmp)');
        });

        it('should remove the import statement for explicitly deferred imports even in local compilation mode', () => {
          env.tsconfig({
            onlyExplicitDeferDependencyImports: true,
            compilationMode: 'local',
          });
          env.write(
            'my-cmp.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'my-cmp',
              template: 'MyCmp',
              standalone: true
            })
            export class MyCmp {}
          `,
          );
          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            import {MyCmp} from './my-cmp';
            @Component({
              selector: 'app-root',
              standalone: true,
              // @ts-ignore
              deferredImports: { block1: [MyCmp] },
              template: \`
                @defer (name block1) {
                  <my-cmp />
                }
              \`
            })
            export class AppRoot {}
          `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');

          // Verify that the import statement is completely removed
          expect(jsContents).not.toContain('import { MyCmp } from "./my-cmp"');
          expect(jsContents).not.toContain('import {MyCmp} from "./my-cmp"');
        });

        it('should report exactly one error (no duplicates) when an import is used in deferredImports but also provides eager symbols', () => {
          env.write(
            'my-cmp.ts',
            `
            import {Component, Directive} from '@angular/core';
            @Component({
              selector: 'my-cmp',
              template: 'MyCmp',
              standalone: true
            })
            export class MyCmp {}

            @Directive({
              selector: '[my-dir]',
              standalone: true
            })
            export class MyDir {}
          `,
          );

          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            import {MyCmp, MyDir} from './my-cmp';
            @Component({
              selector: 'app-root',
              standalone: true,
              imports: [MyDir], // MyDir is used eagerly
              // @ts-ignore
              deferredImports: { block1: [MyCmp] }, // MyCmp is deferred
              template: \`
                <div my-dir></div>
                @defer (name block1) {
                  <my-cmp />
                }
              \`
            })
            export class AppRoot {}
          `,
          );

          const diags = env.driveDiagnostics();

          // Verify that exactly one diagnostic is produced, ensuring no duplicate errors are generated
          // because of multiple 'markAsDeferrableCandidate' registrations for the same import.
          expect(diags.length).toBe(1);
          expect(diags[0].messageText).toContain(
            'This import contains symbols that are used both inside and outside of the `@Component.deferredImports`',
          );
        });

        it('should handle block-specific mapping in local compilation mode', () => {
          env.tsconfig({
            onlyExplicitDeferDependencyImports: true,
            compilationMode: 'experimental-local',
          });

          env.write(
            'deferred-a.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'deferred-cmp-a',
              template: 'DeferredCmpA contents',
            })
            export class DeferredCmpA {}
          `,
          );

          env.write(
            'deferred-b.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'deferred-cmp-b',
              template: 'DeferredCmpB contents',
            })
            export class DeferredCmpB {}
          `,
          );

          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            import {DeferredCmpA} from './deferred-a';
            import {DeferredCmpB} from './deferred-b';
            @Component({
              // @ts-ignore
              deferredImports: {
                blockA: [DeferredCmpA],
                blockB: [DeferredCmpB],
              },
              template: \`
                @defer (name blockA) {
                  <deferred-cmp-a />
                }
                @defer (name blockB) {
                  <deferred-cmp-b />
                }
              \`,
            })
            export class AppCmp {}
          `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');

          expect(cleanNewLines(jsContents)).toContain(
            'const AppCmp_Defer_1_DepsFn = () => [/* @ts-ignore */ ' +
              'import("./deferred-a").then(m => m.DeferredCmpA)];',
          );
          expect(cleanNewLines(jsContents)).toContain(
            'const AppCmp_Defer_4_DepsFn = () => [/* @ts-ignore */ ' +
              'import("./deferred-b").then(m => m.DeferredCmpB)];',
          );
        });

        it('should report error when defer block has no name parameter but deferredImports is an object', () => {
          env.write(
            'deferred-a.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'deferred-cmp-a',
              template: 'DeferredCmpA contents',
            })
            export class DeferredCmpA {}
          `,
          );

          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            import {DeferredCmpA} from './deferred-a';
            @Component({
              // @ts-ignore
              deferredImports: {
                blockA: [DeferredCmpA],
              },
              template: \`
                @defer {
                  <deferred-cmp-a />
                }
              \`,
            })
            export class AppCmp {}
          `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].messageText).toContain(`@defer block must specify a 'name' parameter`);
        });

        it('should report error when name parameter references missing block in deferredImports', () => {
          env.write(
            'deferred-a.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'deferred-cmp-a',
              template: 'DeferredCmpA contents',
            })
            export class DeferredCmpA {}
          `,
          );

          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            import {DeferredCmpA} from './deferred-a';
            @Component({
              // @ts-ignore
              deferredImports: {
                blockA: [DeferredCmpA],
              },
              template: \`
                @defer (name blockB) {
                  <deferred-cmp-a />
                }
              \`,
            })
            export class AppCmp {}
          `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].messageText).toContain(
            `The 'name' parameter references block 'blockB' which is missing from '@Component.deferredImports'`,
          );
        });

        it('should report error when name parameter is used but component has no deferredImports in standard compilation', () => {
          env.write(
            'deferred-a.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'deferred-cmp-a',
              template: 'DeferredCmpA contents',
            })
            export class DeferredCmpA {}
          `,
          );

          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            import {DeferredCmpA} from './deferred-a';
            @Component({
              imports: [DeferredCmpA],
              template: \`
                @defer (name blockA) {
                  <deferred-cmp-a />
                }
              \`,
            })
            export class AppCmp {}
          `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFER_BLOCK_INVALID_NAME_PARAMETER));
          expect(diags[0].messageText).toContain(
            `The 'name' parameter can only be used when '@Component.deferredImports' is defined.`,
          );
        });

        it('should report error when name parameter is used but component has no deferredImports in local compilation', () => {
          env.tsconfig({
            onlyExplicitDeferDependencyImports: true,
            compilationMode: 'experimental-local',
          });

          env.write(
            'deferred-a.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'deferred-cmp-a',
              template: 'DeferredCmpA contents',
            })
            export class DeferredCmpA {}
          `,
          );

          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            import {DeferredCmpA} from './deferred-a';
            @Component({
              imports: [DeferredCmpA],
              template: \`
                @defer (name blockA) {
                  <deferred-cmp-a />
                }
              \`,
            })
            export class AppCmp {}
          `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFER_BLOCK_INVALID_NAME_PARAMETER));
          expect(diags[0].messageText).toContain(
            `The 'name' parameter can only be used when '@Component.deferredImports' is defined.`,
          );
        });

        it('should disallow quoted block names in deferred blocks', () => {
          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              template: \`
                @defer (name 'blockA') {
                  <div>A</div>
                }
                @defer (name "blockB") {
                  <div>B</div>
                }
              \`,
            })
            export class AppCmp {}
          `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(2);
          expect(diags[0].messageText).toContain('Block names cannot be quoted in @defer blocks');
          expect(diags[1].messageText).toContain('Block names cannot be quoted in @defer blocks');
        });
      });
    });

    describe('setClassMetadataAsync', () => {
      it('should generate setClassMetadataAsync for components with defer blocks', () => {
        env.write(
          'cmp-a.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export class CmpA {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import {Component} from '@angular/core';
          import {CmpA} from './cmp-a';

          @Component({
            selector: 'local-dep',
            template: 'Local dependency',
          })
          export class LocalDep {}

          @Component({
            selector: 'test-cmp',
            imports: [CmpA, LocalDep],
            template: \`
              @defer {
                <cmp-a />
                <local-dep />
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');
        expect(cleanNewLines(jsContents)).toContain(
          '(() => { (typeof ngDevMode === "undefined" || ngDevMode) && ' +
            'i0.ɵsetClassMetadataAsync(TestCmp, ' +
            '() => [/* @ts-ignore */ import("./cmp-a").then(m => m.CmpA)], ' +
            'CmpA => { i0.ɵsetClassMetadata(TestCmp',
        );
      });

      it(
        'should *not* generate setClassMetadataAsync for components with defer blocks ' +
          'when dependencies are eagerly referenced as well',
        () => {
          env.write(
            'cmp-a.ts',
            `
            import {Component} from '@angular/core';

            @Component({
              selector: 'cmp-a',
              template: 'CmpA!'
            })
            export class CmpA {}
          `,
          );

          env.write(
            '/test.ts',
            `
            import {Component} from '@angular/core';
            import {CmpA} from './cmp-a';

            @Component({
              selector: 'test-cmp',
              imports: [CmpA],
              template: \`
                @defer {
                  <cmp-a />
                }
              \`,
            })
            export class TestCmp {
              constructor() {
                // This eager reference retains 'CmpA' symbol as eager.
                console.log(CmpA);
              }
            }
          `,
          );

          env.driveMain();

          const jsContents = env.getContents('test.js');

          // Dependency function eagerly references `CmpA`.
          expect(jsContents).toContain('() => [CmpA]');

          // The `setClassMetadataAsync` wasn't generated, since there are no deferrable
          // symbols.
          expect(jsContents).not.toContain('setClassMetadataAsync');

          // But the regular `setClassMetadata` is present.
          expect(jsContents).toContain('setClassMetadata');
        },
      );
    });

    it('should generate setClassMetadataAsync for default imports', () => {
      env.write(
        'cmp-a.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'cmp-a',
          template: 'CmpA!'
        })
        export default class CmpA {}
      `,
      );

      env.write(
        '/test.ts',
        `
        import {Component} from '@angular/core';
        import CmpA from './cmp-a';

        @Component({
          selector: 'local-dep',
          template: 'Local dependency',
        })
        export class LocalDep {}

        @Component({
          selector: 'test-cmp',
                    imports: [CmpA, LocalDep],
          template: \`
            @defer {
              <cmp-a />
              <local-dep />
            }
          \`,
        })
        export class TestCmp {}
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');

      expect(jsContents).toContain('ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn)');
      expect(cleanNewLines(jsContents)).toContain(
        '(() => { (typeof ngDevMode === "undefined" || ngDevMode) && ' +
          // Main `setClassMetadataAsync` call
          'i0.ɵsetClassMetadataAsync(TestCmp, ' +
          // Dependency loading function (note: no local `LocalDep` here)
          // Callback that invokes `setClassMetadata` at the end
          '() => [/* @ts-ignore */ import("./cmp-a").then(m => m.default)], ' +
          'CmpA => { i0.ɵsetClassMetadata(TestCmp',
      );
    });

    describe('trigger validation', () => {
      it('should report if reference-based trigger has no reference and there is no placeholder block but a hydrate trigger exists', () => {
        env.write(
          '/test.ts',
          `
          import {Component} from '@angular/core';

          @Component({template: '@defer (on viewport; hydrate on immediate) {hello}'})
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          'Trigger with no target can only be placed on an @defer that has a @placeholder block',
        );
      });

      it('should report if reference-based trigger has no reference and there is no placeholder block but a hydrate trigger exists and it is also viewport', () => {
        env.write(
          '/test.ts',
          `
          import {Component} from '@angular/core';

          @Component({template: '@defer (on viewport; hydrate on viewport) {hello}'})
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          'Trigger with no target can only be placed on an @defer that has a @placeholder block',
        );
      });

      it('should report if reference-based trigger has no reference and the placeholder is empty', () => {
        env.write(
          '/test.ts',
          `
          import {Component} from '@angular/core';

          @Component({template: '@defer (on viewport) {hello} @placeholder {}'})
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          'Trigger with no target can only be placed on an @defer that has a @placeholder block with exactly one root element node',
        );
      });

      it('should report if reference-based trigger has no reference and the placeholder with text at the root', () => {
        env.write(
          '/test.ts',
          `
          import {Component} from '@angular/core';

          @Component({template: '@defer (on viewport) {hello} @placeholder {placeholder}'})
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          'Trigger with no target can only be placed on an @defer that has a @placeholder block with exactly one root element node',
        );
      });

      it('should report if reference-based trigger has no reference and there is no placeholder block', () => {
        env.write(
          '/test.ts',
          `
          import {Component} from '@angular/core';

          @Component({template: '@defer (on viewport) {hello}'})
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          'Trigger with no target can only be placed on an @defer that has a @placeholder block',
        );
      });

      it('should report if reference-based trigger has no reference and the placeholder has multiple root elements', () => {
        env.write(
          '/test.ts',
          `
          import {Component} from '@angular/core';

          @Component({template: '@defer (on viewport) {hello} @placeholder {<div></div><span></span>}'})
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          'Trigger with no target can only be placed on an @defer that has a @placeholder block with exactly one root element node',
        );
      });

      it('should report if reference-based trigger has no reference and the placeholder has one root element and some text', () => {
        env.write(
          '/test.ts',
          `
          import {Component} from '@angular/core';

          @Component({template: '@defer (on viewport) {hello} @placeholder {<div></div> hi}'})
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          'Trigger with no target can only be placed on an @defer that has a @placeholder block with exactly one root element node',
        );
      });

      it('should count whitespace as a root node when preserveWhitespaces is enabled', () => {
        env.write(
          '/test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            preserveWhitespaces: true,
            template: '@defer (on viewport) {hello} @placeholder {<div></div>  }'
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          'Trigger with no target can only be placed on an @defer that has a @placeholder block with exactly one root element node',
        );
      });
    });

    describe('block-specific deferredImports type checking', () => {
      it('should pass type-checking when a deferred component is used in its declared block', () => {
        env.write(
          'cmp-a.ts',
          `
          import { Component } from '@angular/core';
          @Component({ selector: 'cmp-a', template: 'CmpA!' })
          export class CmpA {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { CmpA } from './cmp-a';

          @Component({
            selector: 'test-cmp',
            // @ts-ignore
            deferredImports: {
              blockA: [CmpA],
            },
            template: \`
              @defer (name blockA) {
                <cmp-a />
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should report an error when a deferred component is used in a defer block that does not include it', () => {
        env.write(
          'cmps.ts',
          `
          import { Component } from '@angular/core';
          @Component({ selector: 'cmp-a', template: 'CmpA!' })
          export class CmpA {}

          @Component({ selector: 'cmp-b', template: 'CmpB!' })
          export class CmpB {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { CmpA, CmpB } from './cmps';

          @Component({
            selector: 'test-cmp',
            // @ts-ignore
            deferredImports: {
              blockA: [CmpA],
              blockB: [CmpB],
            },
            template: \`
              @defer (name blockA) {
                <cmp-b />
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain(
          "Component 'CmpB' (used as element 'cmp-b') was imported via `@Component.deferredImports` under block 'blockB', but is used in a `@defer` block configured for 'blockA'",
        );
      });

      it('should allow nested defer blocks to inherit dependencies from parent defer blocks', () => {
        env.write(
          'cmps.ts',
          `
          import { Component } from '@angular/core';
          @Component({ selector: 'outer-cmp', template: 'Outer!' })
          export class OuterCmp {}

          @Component({ selector: 'inner-cmp', template: 'Inner!' })
          export class InnerCmp {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { OuterCmp, InnerCmp } from './cmps';

          @Component({
            selector: 'test-cmp',
            // @ts-ignore
            deferredImports: {
              outerBlock: [OuterCmp],
              innerBlock: [InnerCmp],
            },
            template: \`
              @defer (name outerBlock) {
                <outer-cmp />
                @defer (name innerBlock) {
                  <outer-cmp />
                  <inner-cmp />
                }
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should report an error in nested defer block when using a component from an unassociated block', () => {
        env.write(
          'cmps.ts',
          `
          import { Component } from '@angular/core';
          @Component({ selector: 'outer-cmp', template: 'Outer!' })
          export class OuterCmp {}

          @Component({ selector: 'inner-cmp', template: 'Inner!' })
          export class InnerCmp {}

          @Component({ selector: 'other-cmp', template: 'Other!' })
          export class OtherCmp {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { OuterCmp, InnerCmp, OtherCmp } from './cmps';

          @Component({
            selector: 'test-cmp',
            // @ts-ignore
            deferredImports: {
              outerBlock: [OuterCmp],
              innerBlock: [InnerCmp],
              otherBlock: [OtherCmp],
            },
            template: \`
              @defer (name outerBlock) {
                @defer (name innerBlock) {
                  <other-cmp />
                }
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain(
          "Component 'OtherCmp' (used as element 'other-cmp') was imported via `@Component.deferredImports` under block 'otherBlock', but is used in a `@defer` block configured for 'innerBlock'",
        );
      });

      it('should report an error when a deferred pipe is used in a defer block that does not include it', () => {
        env.write(
          'pipe-b.ts',
          `
          import { Pipe, PipeTransform } from '@angular/core';
          @Pipe({ name: 'pipeb' })
          export class PipeB implements PipeTransform {
            transform(val: string) { return val; }
          }
        `,
        );

        env.write(
          'cmp-a.ts',
          `
          import { Component } from '@angular/core';
          @Component({ selector: 'cmp-a', template: 'CmpA!' })
          export class CmpA {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { CmpA } from './cmp-a';
          import { PipeB } from './pipe-b';

          @Component({
            selector: 'test-cmp',
            // @ts-ignore
            deferredImports: {
              blockA: [CmpA],
              blockB: [PipeB],
            },
            template: \`
              @defer (name blockA) {
                <cmp-a />
                {{ 'hello' | pipeb }}
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain(
          "Pipe 'pipeb' was imported via `@Component.deferredImports` under block 'blockB', but is used in a `@defer` block configured for 'blockA'",
        );
      });

      it('should pass type-checking when multiple defer blocks use distinct pipes', () => {
        env.write(
          'pipes.ts',
          `
          import { Pipe, PipeTransform } from '@angular/core';
          @Pipe({ name: 'pipea' })
          export class PipeA implements PipeTransform {
            transform(val: string) { return val; }
          }
          @Pipe({ name: 'pipeb' })
          export class PipeB implements PipeTransform {
            transform(val: string) { return val; }
          }
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { PipeA, PipeB } from './pipes';

          @Component({
            selector: 'test-cmp',
            // @ts-ignore
            deferredImports: {
              blockA: [PipeA],
              blockB: [PipeB],
            },
            template: \`
              @defer (name blockA) {
                {{ 'hello' | pipea }}
              }
              @defer (name blockB) {
                {{ 'world' | pipeb }}
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should report an error when a pipe declared in a keyed block is used in an unnamed defer block', () => {
        env.write(
          'pipe-a.ts',
          `
          import { Pipe, PipeTransform } from '@angular/core';
          @Pipe({ name: 'pipea' })
          export class PipeA implements PipeTransform {
            transform(val: string) { return val; }
          }
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { PipeA } from './pipe-a';

          @Component({
            selector: 'test-cmp',
            // @ts-ignore
            deferredImports: {
              blockA: [PipeA],
            },
            template: \`
              @defer {
                {{ 'hello' | pipea }}
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain(`@defer block must specify a 'name' parameter`);
      });

      it('should report an error when a structural directive from deferredImports is used in an unassociated defer block', () => {
        env.write(
          'dirs.ts',
          `
          import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';
          @Directive({ selector: '[dirA]' })
          export class DirA {
            constructor(tr: TemplateRef<any>, vcr: ViewContainerRef) {}
          }
          @Directive({ selector: '[dirB]' })
          export class DirB {
            constructor(tr: TemplateRef<any>, vcr: ViewContainerRef) {}
          }
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { DirA, DirB } from './dirs';

          @Component({
            selector: 'test-cmp',
            // @ts-ignore
            deferredImports: {
              blockA: [DirA],
              blockB: [DirB],
            },
            template: \`
              @defer (name blockA) {
                <div *dirB></div>
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain(
          "Directive 'DirB' (used on element 'div') was imported via `@Component.deferredImports` under block 'blockB', but is used in a `@defer` block configured for 'blockA'",
        );
      });

      it('should pass type-checking when a structural directive from deferredImports is used in its declared defer block', () => {
        env.write(
          'dir-a.ts',
          `
          import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';
          @Directive({ selector: '[dirA]' })
          export class DirA {
            constructor(tr: TemplateRef<any>, vcr: ViewContainerRef) {}
          }
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { DirA } from './dir-a';

          @Component({
            selector: 'test-cmp',
            // @ts-ignore
            deferredImports: {
              blockA: [DirA],
            },
            template: \`
              @defer (name blockA) {
                <div *dirA></div>
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should report separate diagnostics for multiple deferred directives on the same element', () => {
        env.write(
          'dirs.ts',
          `
          import { Directive } from '@angular/core';
          @Directive({ selector: '[dirA]' })
          export class DirA {}
          @Directive({ selector: '[dirB]' })
          export class DirB {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { DirA, DirB } from './dirs';

          @Component({
            selector: 'test-cmp',
            // @ts-ignore
            deferredImports: {
              blockA: [DirA],
              blockB: [DirB],
              blockC: [],
            },
            template: \`
              @defer (name blockC) {
                <div dirA dirB></div>
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toContain(
          "Directive 'DirA' (used on element 'div') was imported via `@Component.deferredImports` under block 'blockA', but is used in a `@defer` block configured for 'blockC'",
        );
        expect(diags[1].messageText).toContain(
          "Directive 'DirB' (used on element 'div') was imported via `@Component.deferredImports` under block 'blockB', but is used in a `@defer` block configured for 'blockC'",
        );
      });

      it('should allow the same dependency across multiple defer blocks without duplicate symbol diagnostics', () => {
        env.write(
          'dirs.ts',
          `
          import { Directive } from '@angular/core';
          @Directive({ selector: '[dirA]' })
          export class DirA {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { DirA } from './dirs';

          @Component({
            selector: 'test-cmp',
            // @ts-ignore
            deferredImports: {
              blockA: [DirA],
              blockB: [DirA],
            },
            template: \`
              @defer (name blockA) {
                <div dirA></div>
              }
              @defer (name blockB) {
                <div dirA></div>
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not duplicate explicitly deferred dependencies in generated setClassMetadataAsync', () => {
        env.write(
          'dirs.ts',
          `
          import { Directive } from '@angular/core';
          @Directive({ selector: '[dirA]' })
          export class DirA {}
        `,
        );

        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';
          import { DirA } from './dirs';

          @Component({
            selector: 'test-cmp',
            // @ts-ignore
            deferredImports: {
              blockA: [DirA],
              blockB: [DirA],
            },
            template: \`
              @defer (name blockA) {
                <div dirA></div>
              }
              @defer (name blockB) {
                <div dirA></div>
              }
            \`,
          })
          export class TestCmp {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // Make sure we do not generate a duplicate parameter like (DirA, DirA)
        expect(jsContents).not.toContain('DirA, DirA');

        // Ensure that setClassMetadataAsync has exactly one parameter for DirA
        expect(cleanNewLines(jsContents)).toContain(
          'i0.ɵsetClassMetadataAsync(TestCmp, ' +
            '() => [/* @ts-ignore */ import("./dirs").then(m => m.DirA)], ' +
            'DirA => { i0.ɵsetClassMetadata(TestCmp',
        );
      });
    });
  });
});
