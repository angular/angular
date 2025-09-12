/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('authoring API diagnostics', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true});
    });

    it('should report when an initializer function is used outside of an initializer', () => {
      env.write(
        'test.ts',
        `
        import {Component, input} from '@angular/core';

        function myInput() {
          return input();
        }

        @Component({template: ''})
        export class TestDir {
          inp = myInput();
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(
        'Unsupported call to the input function. This function can only be called in the initializer of a class member',
      );
    });

    it('should report when a required initializer function is used outside of an initializer', () => {
      env.write(
        'test.ts',
        `
        import {Component, input} from '@angular/core';

        function myInput() {
          return input.required<boolean>();
        }

        @Component({template: ''})
        export class TestDir {
          inp = myInput();
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(
        'Unsupported call to the input.required function. This function can only be called in the initializer of a class member',
      );
    });

    it('should report when an aliased initializer function is used outside of an initializer', () => {
      env.write(
        'test.ts',
        `
        import {Component, input as notInput} from '@angular/core';

        function myInput() {
          return notInput();
        }

        @Component({template: ''})
        export class TestDir {
          inp = myInput();
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(
        'Unsupported call to the input function. This function can only be called in the initializer of a class member',
      );
    });

    it('should report when an initializer function accessed through a namespace import is used outside of an initializer', () => {
      env.write(
        'test.ts',
        `
            import * as ng from '@angular/core';

            function myInput() {
              return ng.input();
            }

            @ng.Component({template: ''})
            export class TestDir {
              inp = myInput();
            }
          `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(
        'Unsupported call to the input function. This function can only be called in the initializer of a class member',
      );
    });

    it('should report when an initializer function is used outside of an initializer in a file that does not have any decorated classes', () => {
      env.write(
        'test.ts',
        `
            import {input} from '@angular/core';

            export function myInput() {
              return input();
            }
          `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(
        'Unsupported call to the input function. This function can only be called in the initializer of a class member',
      );
    });

    it('should report when an initializer function is used in a constructor', () => {
      env.write(
        'test.ts',
        `
        import {Component, input} from '@angular/core';

        @Component({template: ''})
        export class TestDir {
          inp: any;

          constructor() {
            this.inp = input();
          }
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(
        'Unsupported call to the input function. This function can only be called in the initializer of a class member',
      );
    });

    it('should report when an initializer function is an indirect descendant of the initializer', () => {
      env.write(
        'test.ts',
        `
        import {Component, input} from '@angular/core';

        @Component({template: ''})
        export class TestDir {
          inp = (() => {
            return input();
          })();
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(
        'Unsupported call to the input function. This function can only be called in the initializer of a class member',
      );
    });

    it('should not report a correct usage of an initializer API', () => {
      env.write(
        'test.ts',
        `
        import {Component, input} from '@angular/core';

        @Component({template: ''})
        export class TestDir {
          inp = input();
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should not report if an initializer function is wrapped in a parenthesized expression', () => {
      env.write(
        'test.ts',
        `
            import {Component, input} from '@angular/core';

            @Component({template: ''})
            export class TestDir {
              inp = (input());
              inp2 = (((((((((input())))))))));
            }
          `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should not report if an initializer function is wrapped in an `as` expression', () => {
      env.write(
        'test.ts',
        `
        import {Component, input} from '@angular/core';

        @Component({template: ''})
        export class TestDir {
          inp = input() as any;
          inp2 = input() as unknown as any as {};
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should report initializer function being used in an undecorated class', () => {
      env.write(
        'test.ts',
        `
        import {input} from '@angular/core';

        export class Test {
          inp = input();
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(
        'Unsupported call to the input function. This function can only be used as the initializer of a property on a @Component or @Directive class.',
      );
    });

    it('should report initializer function being used in an unsupported Angular class', () => {
      env.write(
        'test.ts',
        `
        import {input, Pipe} from '@angular/core';

        @Pipe({name: 'test'})
        export class Test {
          inp = input();
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(
        'Unsupported call to the input function. This function can only be used as the initializer of a property on a @Component or @Directive class.',
      );
    });

    describe('required initializer functions validation', () => {
      it('should report required input being used as property initialized', () => {
        env.write(
          'test.ts',
          `
        import {input, Component} from '@angular/core';

        function foobar(x:any) {}

        @Component({template: \`\`})
        export class Test {
          reqInp = input.required<string>();
          reqInp2 = input.required<boolean>();
          smthg = this.reqInp();
          smthg2 = foobar(this.reqInp2());
        }
      `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toContain('`reqInp` is a required `input`');
        expect(diags[1].messageText).toContain('`reqInp2` is a required `input`');
      });

      it('should report required input being invoked inside a constructor', () => {
        env.write(
          'test.ts',
          `
        import {input, Component} from '@angular/core';

        function foobar(x:any) {}

        @Component({template: \`\`})
        export class Test {
          reqInp = input.required<string>();
          reqInp2 = input.required<boolean>();

          constructor() {
            const smthg = this.reqInp();
            const smthg2 = foobar(this.reqInp2());
          }
        }
      `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toContain('`reqInp` is a required `input`');
        expect(diags[1].messageText).toContain('`reqInp2` is a required `input`');
      });

      it('should report required model being used as property initialized', () => {
        env.write(
          'test.ts',
          `
        import {model, Component} from '@angular/core';

        @Component({template: \`\`})
        export class Test {
          reqModel = model.required<string>();
          smthg = this.reqModel();
        }
      `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('`reqModel` is a required `model`');
      });

      it('should report required model being invoked in a constructor despite being set before hand', () => {
        // While this code might be valid at runtime, we still prefer to flag any required model reads.
        env.write(
          'test.ts',
          `
        import {model, Component} from '@angular/core';

        @Component({template: \`\`})
        export class Test {
          reqModel = model.required<string>();
          constructor() {
            this.reqModel.set('foobar');
            const smthg = this.reqModel();
          }
        }
      `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('`reqModel` is a required `model`');
      });

      it('should report required viewChild being used as property initialized', () => {
        env.write(
          'test.ts',
          `
        import {viewChild, Component} from '@angular/core';

        @Component({template: \`\`})
        export class Test {
          reqChild = viewChild.required('someRef');
          smthg = this.reqChild();
        }
      `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('`reqChild` is a required `viewChild`');
      });

      it('should not report required input being invoked inside an effect or a computed', () => {
        env.write(
          'test.ts',
          `
        import {input, Component, effect, computed} from '@angular/core';

        function foobar(x:any) {}

        @Component({template: \`\`})
        export class Test {
          reqInp = input.required<string>();
          reqInp2 = input.required<boolean>();
          _ = effect(() => { this.reqInp(); foobar(this.reqInp2()); });
          __ = effect(function() { this.reqInp(); foobar(this.reqInp2()); });
          comp = computed(() => this.reqInp());

          constructor() {
            effect(() => { this.reqInp(); foobar(this.reqInp2()); });
          }
        }
      `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not report non-required input being invoked in contructrors or in property initialization', () => {
        env.write(
          'test.ts',
          `
        import {input, Component, effect, computed} from '@angular/core';

        function foobar(x:any) {}

        @Component({template: \`\`})
        export class Test {
          reqInp = input<string>('');
          reqInp2 = input<boolean>(true);
          smthg = this.reqInp();
          smthg2 = foobar(this.reqInp2());

          constructor() {
            const smthg = this.reqInp();
            const smthg2 = foobar(this.reqInp2());
          }
        }
      `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not report non-invocations of required inputs', () => {
        env.write(
          'test.ts',
          `
        import {input, Component, effect, computed} from '@angular/core';
        import {toObservable} from '@angular/core/rxjs-interop';


        @Component({template: \`\`})
        export class Test {
          reqInp = input.required<string>();
          obs$ = toObservable(this.reqInp);

          constructor() {
            const obs$ = toObservable(this.reqInp);
          }
        }
      `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });
    });
  });
});
