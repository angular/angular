/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runPipeline, TestFile} from './utils.js';

function tsconfig(files: string[]): TestFile {
  return {
    path: '/tsconfig.json',
    content: JSON.stringify({compilerOptions: {strict: true}, files}),
  };
}

const MY_TOKEN_FILE: TestFile = {
  path: '/my_token.ts',
  content: `export class MyToken {}\n`,
};

async function compile(
  files: TestFile[],
  targetOutPath: string,
  optimize: boolean,
): Promise<string> {
  const outputs = await runPipeline(files, {optimize});
  const out = outputs.find((o) => o.path === targetOutPath);
  if (!out) {
    throw new Error(
      `Expected output ${targetOutPath}, got: ${outputs.map((o) => o.path).join(', ')}`,
    );
  }
  return out.content;
}

describe('constructor DI tokens imported via named imports', () => {
  for (const optimize of [false, true]) {
    describe(`optimize: ${optimize}`, () => {
      it('references non-aliased named imports directly across @Injectable, @Component, @Directive, @Pipe, and @NgModule', async () => {
        const appFile: TestFile = {
          path: '/app.ts',
          content: `
            import {
              Component,
              Directive,
              ElementRef,
              Injectable,
              NgModule,
              Pipe,
              PipeTransform,
            } from '@angular/core';
            import {MyToken} from './my_token';

            @Injectable({providedIn: 'root'})
            export class MyService {
              constructor(private readonly token: MyToken) {}
            }

            @Directive({selector: '[myDir]'})
            export class MyDirective {
              constructor(
                private readonly token: MyToken,
                private readonly el: ElementRef,
              ) {}
            }

            @Pipe({name: 'myPipe'})
            export class MyPipe implements PipeTransform {
              constructor(private readonly token: MyToken) {}
              transform(value: string): string {
                return value;
              }
            }

            @Component({selector: 'my-cmp', template: ''})
            export class MyComponent {
              constructor(private readonly token: MyToken) {}
            }

            @NgModule({})
            export class MyModule {
              constructor(private readonly token: MyToken) {}
            }
          `,
        };

        const out = await compile(
          [tsconfig(['app.ts', 'my_token.ts']), MY_TOKEN_FILE, appFile],
          '/out/app.ts',
          optimize,
        );

        expect(out).not.toContain("import * as i1 from './my_token'");
        expect(out).not.toContain('i1.MyToken');
        expect(out).not.toContain('i0.ElementRef');

        expect(out).toContain('i0.ɵɵinject(MyToken)');
        expect(out).toContain('i0.ɵɵdirectiveInject(MyToken)');
        expect(out).toContain('i0.ɵɵdirectiveInject(ElementRef)');
        expect(out).toContain('i0.ɵɵdirectiveInject(MyToken, 16)');
        expect(out).toContain('type: MyToken');
        expect(out).toContain('type: ElementRef');
      });

      it('preserves aliased named imports and user-written namespace imports', async () => {
        const aliasTokenFile: TestFile = {
          path: '/alias_token.ts',
          content: `export class AliasedToken {}\n`,
        };
        const nsTokenFile: TestFile = {
          path: '/ns_token.ts',
          content: `export class NsToken {}\n`,
        };
        const appFile: TestFile = {
          path: '/app.ts',
          content: `
            import {Injectable} from '@angular/core';
            import {AliasedToken as LocalToken} from './alias_token';
            import * as ns from './ns_token';

            @Injectable({providedIn: 'root'})
            export class MyService {
              constructor(
                private readonly a: LocalToken,
                private readonly b: ns.NsToken,
              ) {}
            }
          `,
        };

        const out = await compile(
          [
            tsconfig(['app.ts', 'alias_token.ts', 'ns_token.ts']),
            aliasTokenFile,
            nsTokenFile,
            appFile,
          ],
          '/out/app.ts',
          optimize,
        );

        expect(out).not.toMatch(/import \* as i[1-9]\d* from/);
        expect(out).toContain('i0.ɵɵinject(LocalToken)');
        expect(out).toContain('i0.ɵɵinject(ns.NsToken)');
        expect(out).toContain('type: LocalToken');
        expect(out).toContain('type: ns.NsToken');
      });

      it('keeps value import when a @defer dependency is also injected as a constructor token', async () => {
        const deferredFile: TestFile = {
          path: '/deferred.ts',
          content: `
            import {Component} from '@angular/core';
            @Component({selector: 'deferred-comp', template: 'Deferred'})
            export class DeferredComp {}
          `,
        };
        const appFile: TestFile = {
          path: '/app.ts',
          content: `
            import {Component} from '@angular/core';
            import {DeferredComp} from './deferred';

            @Component({
              selector: 'app-comp',
              deferredImports: [DeferredComp],
              template: '@defer { <deferred-comp /> }',
            })
            export class AppComponent {
              constructor(private readonly d: DeferredComp) {}
            }
          `,
        };

        const out = await compile(
          [tsconfig(['app.ts', 'deferred.ts']), deferredFile, appFile],
          '/out/app.ts',
          optimize,
        );

        expect(out).not.toContain("import * as i1 from './deferred'");
        expect(out).toContain("import { DeferredComp } from './deferred';");
        expect(out).not.toContain('type DeferredComp');
        expect(out).toContain('i0.ɵɵdirectiveInject(DeferredComp)');
      });

      it('still converts a @defer dependency import to type-only when constructor parameter uses @Inject override', async () => {
        const deferredFile: TestFile = {
          path: '/deferred.ts',
          content: `
            import {Component} from '@angular/core';
            @Component({selector: 'deferred-comp', template: 'Deferred'})
            export class DeferredComp {}
          `,
        };
        const appFile: TestFile = {
          path: '/app.ts',
          content: `
            import {Component, Inject, InjectionToken} from '@angular/core';
            import {DeferredComp} from './deferred';

            const DEFERRED_TOKEN = new InjectionToken<DeferredComp>('DEFERRED_TOKEN');

            @Component({
              selector: 'app-comp',
              deferredImports: [DeferredComp],
              template: '@defer { <deferred-comp /> }',
            })
            export class AppComponent {
              constructor(@Inject(DEFERRED_TOKEN) private readonly d: DeferredComp) {}
            }
          `,
        };

        const out = await compile(
          [tsconfig(['app.ts', 'deferred.ts']), deferredFile, appFile],
          '/out/app.ts',
          optimize,
        );

        expect(out).not.toContain("import * as i1 from './deferred'");
        expect(out).toContain("import { type DeferredComp } from './deferred';");
        expect(out).toContain('i0.ɵɵdirectiveInject(DEFERRED_TOKEN)');
      });
    });
  }
});
