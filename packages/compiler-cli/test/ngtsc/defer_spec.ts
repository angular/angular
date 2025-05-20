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
          standalone: true,
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
          standalone: true,
          template: 'Local dependency',
        })
        export class LocalDep {}

        @Component({
          selector: 'test-cmp',
          standalone: true,
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
      expect(jsContents).toContain('() => [import("./cmp-a").then(m => m.CmpA), LocalDep]');

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
            standalone: true,
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
            standalone: true,
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

    describe('imports', () => {
      it('should retain regular imports when symbol is eagerly referenced', () => {
        env.write(
          'cmp-a.ts',
          `
          import { Component } from '@angular/core';

          @Component({
            standalone: true,
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
            standalone: true,
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
            standalone: true,
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export class CmpA {}

          @Component({
            standalone: true,
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
            standalone: true,
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
            standalone: true,
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export class CmpA {}

          @Component({
            standalone: true,
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
            standalone: true,
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
        expect(jsContents).toContain(
          '() => [' +
            'import("./cmp-a").then(m => m.CmpA), ' +
            'import("./cmp-a").then(m => m.CmpB)]',
        );
        expect(jsContents).not.toContain('import { CmpA, CmpB }');
      });

      it('should lazy-load dependency referenced with a fowrardRef', () => {
        env.write(
          'cmp-a.ts',
          `
          import { Component } from '@angular/core';

          @Component({
            standalone: true,
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
            standalone: true,
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
        expect(jsContents).toContain('() => [import("./cmp-a").then(m => m.CmpA)]');

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
            standalone: true,
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
            standalone: true,
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
        expect(jsContents).toContain('() => [import("./cmp-a").then(m => m.CmpA)]');
        expect(jsContents).not.toContain('import { CmpA }');
      });

      it('should drop multiple imports to the same file when one is deferrable and the other has a single type-only element', () => {
        env.write(
          'cmp-a.ts',
          `
            import { Component } from '@angular/core';

            export class Foo {}

            @Component({
              standalone: true,
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
              standalone: true,
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
        expect(jsContents).toContain('() => [import("./cmp-a").then(m => m.CmpA)]');
        expect(jsContents).not.toContain('import { CmpA }');
      });

      it('should drop multiple imports to the same file when one is deferrable and the other is type-only at the declaration level', () => {
        env.write(
          'cmp-a.ts',
          `
            import { Component } from '@angular/core';

            export class Foo {}

            @Component({
              standalone: true,
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
              standalone: true,
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
        expect(jsContents).toContain('() => [import("./cmp-a").then(m => m.CmpA)]');
        expect(jsContents).not.toContain('import { CmpA }');
      });

      it('should drop multiple imports to the same file when one is deferrable and the other is a type-only import of all symbols', () => {
        env.write(
          'cmp-a.ts',
          `
            import { Component } from '@angular/core';

            export class Foo {}

            @Component({
              standalone: true,
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
              standalone: true,
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
        expect(jsContents).toContain('() => [import("./cmp-a").then(m => m.CmpA)]');
        expect(jsContents).not.toContain('import { CmpA }');
      });

      it('should drop multiple imports of deferrable symbols from the same file', () => {
        env.write(
          'cmps.ts',
          `
          import { Component } from '@angular/core';

          @Component({
            standalone: true,
            selector: 'cmp-a',
            template: 'CmpA!'
          })
          export class CmpA {}

          @Component({
            standalone: true,
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
            standalone: true,
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
        expect(jsContents).toContain(
          '() => [import("./cmps").then(m => m.CmpA), import("./cmps").then(m => m.CmpB)]',
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
            standalone: true,
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
            standalone: true,
            template: 'Local dependency',
          })
          export class LocalDep {}
          @Component({
            selector: 'test-cmp',
            standalone: true,
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
        expect(jsContents).toContain(
          'const TestCmp_Defer_1_DepsFn = () => [import("./cmp-a").then(m => m.default), LocalDep];',
        );
        expect(jsContents).toContain(
          'i0.ɵsetClassMetadataAsync(TestCmp, () => [import("./cmp-a").then(m => m.default)]',
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
            standalone: true,
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
            standalone: true,
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
        expect(jsContents).toContain('() => [import("./cmp").then(m => m.Cmp)]');
        expect(jsContents).not.toContain('import { Cmp }');
      });

      it('should retain symbols used in types and eagerly', () => {
        env.write(
          'cmp.ts',
          `
          import { Component } from '@angular/core';

          @Component({
            standalone: true,
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
            standalone: true,
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

        @Pipe({name: 'test', standalone: true})
        export class TestPipe {
          transform() {
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
          standalone: true,
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

        @Pipe({name: 'test', standalone: true})
        export class TestPipe {
          transform() {
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
          standalone: true,
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

        @Pipe({name: 'test', standalone: true})
        export class TestPipe {
          transform() {
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
          standalone: true,
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
            standalone: true,
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
            standalone: true,
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
            standalone: true,
            // @ts-ignore
            deferredImports: [DeferredCmpA, DeferredCmpB, PipeA],
            template: \`
              @for (item of items; track item) {
                @if (true) {
                  @defer {
                    {{ 'Hi!' | pipea }}
                    <deferred-cmp-a />
                  }
                  @defer {
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
        expect(jsContents).toContain(
          'const AppCmp_For_1_Conditional_0_Defer_1_DepsFn = () => [' +
            'import("./deferred-a").then(m => m.DeferredCmpA), ' +
            'import("./pipe-a").then(m => m.PipeA)];',
        );
        expect(jsContents).toContain(
          'const AppCmp_For_1_Conditional_0_Defer_4_DepsFn = () => [' +
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
        expect(jsContents).toContain(
          'ɵsetClassMetadataAsync(AppCmp, () => [' +
            'import("./deferred-a").then(m => m.DeferredCmpA), ' +
            'import("./pipe-a").then(m => m.PipeA), ' +
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
              standalone: true,
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
              standalone: true,
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
              standalone: true,
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
              standalone: true,
              imports: [EagerCmpA],
              // @ts-ignore
              deferredImports: [DeferredCmpA, DeferredCmpB],
              template: \`
                @defer {
                  <eager-cmp-a />
                  <deferred-cmp-a />
                }
                @defer {
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
        expect(jsContents).toContain(
          'const AppCmp_Defer_1_DepsFn = () => [' +
            'import("./deferred-a").then(m => m.DeferredCmpA), ' +
            'EagerCmpA];',
        );
        expect(jsContents).toContain(
          'const AppCmp_Defer_4_DepsFn = () => [' +
            'import("./deferred-b").then(m => m.DeferredCmpB), ' +
            'EagerCmpA];',
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
        expect(jsContents).toContain(
          'ɵsetClassMetadataAsync(AppCmp, () => [' +
            'import("./deferred-a").then(m => m.DeferredCmpA), ' +
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
                standalone: true,
                // @ts-ignore
                deferredImports: [MyInjectable],
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
                standalone: true,
                // @ts-ignore
                deferredImports: [MyModule],
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
                standalone: true,
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
                standalone: true,
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
                standalone: true,
                // @ts-ignore
                deferredImports: [DeferredCmpA, DeferredCmpB],
                template: \`
                  <deferred-cmp-a />
                  @defer {
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
        });

        it('should produce an error the same component is referenced in both `deferredImports` and `imports`', () => {
          env.write(
            'deferred-a.ts',
            `
              import {Component} from '@angular/core';
              @Component({
                standalone: true,
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
                standalone: true,
                // @ts-ignore
                deferredImports: [DeferredCmpA],
                imports: [DeferredCmpA],
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
          expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DEFERRED_DEPENDENCY_IMPORTED_EAGERLY));
        });

        it('should produce an error when pipes from `deferredImports` are used outside of defer blocks', () => {
          env.write(
            'deferred-pipe-a.ts',
            `
              import {Pipe} from '@angular/core';
              @Pipe({
                standalone: true,
                name: 'deferredPipeA'
              })
              export class DeferredPipeA {
                transform() {}
              }
            `,
          );

          env.write(
            'deferred-pipe-b.ts',
            `
              import {Pipe} from '@angular/core';
              @Pipe({
                standalone: true,
                name: 'deferredPipeB'
              })
              export class DeferredPipeB {
                transform() {}
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
                standalone: true,
                // @ts-ignore
                deferredImports: [DeferredPipeA, DeferredPipeB],
                template: \`
                  {{ 'Eager' | deferredPipeA }}
                  @defer {
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
              standalone: true,
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
              standalone: true,
              // @ts-ignore
              deferredImports: [DeferredCmpA],
              template: \`
                @if (true) {
                  @if (true) {
                  @if (true) {
                    @defer {
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
                standalone: true,
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
                standalone: true,
                // @ts-ignore
                deferredImports: [DeferredCmpA],
                template: \`
                  @defer {
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
    });

    describe('setClassMetadataAsync', () => {
      it('should generate setClassMetadataAsync for components with defer blocks', () => {
        env.write(
          'cmp-a.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            standalone: true,
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
            standalone: true,
            template: 'Local dependency',
          })
          export class LocalDep {}

          @Component({
            selector: 'test-cmp',
            standalone: true,
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
        expect(jsContents).toContain(
          // ngDevMode check is present
          '(() => { (typeof ngDevMode === "undefined" || ngDevMode) && ' +
            // Main `setClassMetadataAsync` call
            'i0.ɵsetClassMetadataAsync(TestCmp, ' +
            // Dependency loading function (note: no local `LocalDep` here)
            '() => [import("./cmp-a").then(m => m.CmpA)], ' +
            // Callback that invokes `setClassMetadata` at the end
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
              standalone: true,
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
              standalone: true,
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
          standalone: true,
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
          standalone: true,
          template: 'Local dependency',
        })
        export class LocalDep {}

        @Component({
          selector: 'test-cmp',
          standalone: true,
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
      expect(jsContents).toContain(
        // ngDevMode check is present
        '(() => { (typeof ngDevMode === "undefined" || ngDevMode) && ' +
          // Main `setClassMetadataAsync` call
          'i0.ɵsetClassMetadataAsync(TestCmp, ' +
          // Dependency loading function (note: no local `LocalDep` here)
          '() => [import("./cmp-a").then(m => m.default)], ' +
          // Callback that invokes `setClassMetadata` at the end
          'CmpA => { i0.ɵsetClassMetadata(TestCmp',
      );
    });
  });
});
