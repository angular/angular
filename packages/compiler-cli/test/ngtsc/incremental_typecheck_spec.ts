/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('ngtsc incremental compilation (template typecheck)', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.enableMultipleCompilations();
      env.tsconfig({strictTemplates: true});
    });

    describe('type parameters', () => {
      it('should type-check correctly when directive becomes generic', () => {
        // This test verifies that changing a non-generic directive `Dir` into a generic directive
        // correctly type-checks component `Cmp` that uses `Dir` in its template. The introduction
        // of the generic type requires that `Cmp`'s local declaration of `Dir` is also updated,
        // otherwise the prior declaration without generic type argument would be invalid.

        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir {
            @Input()
            dir!: string;
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div [dir]="foo"></div>',
          })
          export class Cmp {
            foo = 'foo';
          }
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dir} from './dir';

          @NgModule({
            declarations: [Cmp, Dir],
          })
          export class Mod {}
        `);
        env.driveMain();

        // Adding a generic type should still allow the compilation to succeed.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T> {
            @Input()
            dir!: string;
          }
        `);
        env.driveMain();
      });

      it('should type-check correctly when a type parameter is added to a directive', () => {
        // This test verifies that adding an additional generic type to directive `Dir` correctly
        // type-checks component `Cmp` that uses `Dir` in its template. The addition of a generic
        // type requires that `Cmp`'s local declaration of `Dir` is also updated, otherwise the
        // prior declaration with fewer generic type argument would be invalid.

        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T> {
            @Input()
            dir!: T;
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div [dir]="foo"></div>',
          })
          export class Cmp {
            foo = 'foo';
          }
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dir} from './dir';

          @NgModule({
            declarations: [Cmp, Dir],
          })
          export class Mod {}
        `);
        env.driveMain();

        // Add generic type parameter `U` should continue to allow the compilation to succeed.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T, U> {
            @Input()
            dir!: T;
          }
        `);
        env.driveMain();
      });

      it('should type-check correctly when directive removes its generic type parameter', () => {
        // This test verifies that removing a type parameter from generic directive `Dir` such that
        // it becomes non-generic correctly type-checks component `Cmp` that uses `Dir` in its
        // template. The removal of the generic type requires that `Cmp`'s local declaration of
        // `Dir` is also updated, as otherwise the prior declaration with a generic type argument
        // would be invalid.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T> {
            @Input()
            dir!: string;
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div [dir]="foo"></div>',
          })
          export class Cmp {
            foo = 'foo';
          }
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dir} from './dir';

          @NgModule({
            declarations: [Cmp, Dir],
          })
          export class Mod {}
        `);
        env.driveMain();

        // Changing `Dir` to become non-generic should allow the compilation to succeed.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir {
            @Input()
            dir!: string;
          }
        `);
        env.driveMain();
      });

      it('should type-check correctly when a type parameter is removed from a directive', () => {
        // This test verifies that removing a type parameter from generic directive `Dir` correctly
        // type-checks component `Cmp` that uses `Dir` in its template. The removal of the generic
        // type requires that `Cmp`'s local declaration of `Dir` is also updated, as otherwise the
        // prior declaration with the initial number of generic type arguments would be invalid.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T, U> {
            @Input()
            dir!: T;
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div [dir]="foo"></div>',
          })
          export class Cmp {
            foo = 'foo';
          }
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dir} from './dir';

          @NgModule({
            declarations: [Cmp, Dir],
          })
          export class Mod {}
        `);
        env.driveMain();

        // Removing type parameter `U` should allow the compilation to succeed.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T> {
            @Input()
            dir!: T;
          }
        `);
        env.driveMain();
      });

      it('should type-check correctly when a generic type bound is added', () => {
        // This test verifies that changing an unbound generic type parameter of directive `Dir`
        // to have a type constraint properly applies the newly added type constraint during
        // type-checking of `Cmp` that uses `Dir` in its template.
        env.write('node_modules/foo/index.ts', `
          export interface Foo {
            a: boolean;
          }
        `);
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T> {
            @Input()
            dir!: T;
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div [dir]="foo"></div>',
          })
          export class Cmp {
            foo: string;
          }
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dir} from './dir';

          @NgModule({
            declarations: [Cmp, Dir],
          })
          export class Mod {}
        `);
        env.driveMain();

        // Update `Dir` such that its generic type parameter `T` is constrained to type `Foo`. The
        // template of `Cmp` should now fail to type-check, as its bound value for `T` does not
        // conform to the `Foo` constraint.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';
          import {Foo} from 'foo';

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T extends Foo> {
            @Input()
            dir!: T;
          }
        `);

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain(`Type 'string' is not assignable to type 'Foo'.`);

        // Now update `Dir` again to remove the constraint of `T`, which should allow the template
        // of `Cmp` to succeed type-checking.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T> {
            @Input()
            dir!: T;
          }
        `);
        env.driveMain();
      });

      it('should type-check correctly when a generic type bound indirectly changes', () => {
        // This test verifies the scenario where a generic type constraint is updated indirectly,
        // i.e. without the type parameter itself changing. The setup of this test is as follows:
        //
        // - Have two external modules `foo-a` and `foo-b` that both export a type named `Foo`,
        //   each having an incompatible shape.
        // - Have a directive `Dir` that has a type parameter constrained to `Foo` from `foo-a`.
        // - Have a component `Cmp` that uses `Dir` in its template and binds a `Foo` from `foo-a`
        //   to an input of `Dir` of generic type `T`. This should succeed as it conforms to the
        //   constraint of `T`.
        // - Perform an incremental compilation where the import of `Foo` is changed into `foo-b`.
        //   The binding in `Cmp` should now report an error, as its value of `Foo` from `foo-a`
        //   no longer conforms to the new type constraint of `Foo` from 'foo-b'.
        env.write('node_modules/foo-a/index.ts', `
          export interface Foo {
            a: boolean;
          }
        `);
        env.write('node_modules/foo-b/index.ts', `
          export interface Foo {
            b: boolean;
          }
        `);
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';
          import {Foo} from 'foo-a';

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T extends Foo> {
            @Input()
            dir!: T;
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';
          import {Foo} from 'foo-a';

          @Component({
            selector: 'test-cmp',
            template: '<div [dir]="foo"></div>',
          })
          export class Cmp {
            foo: Foo = {a: true};
          }
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dir} from './dir';

          @NgModule({
            declarations: [Cmp, Dir],
          })
          export class Mod {}
        `);
        env.driveMain();

        // Now switch the import of `Foo` from `foo-a` to `foo-b`. This should cause a type-check
        // failure in `Cmp`, as its binding into `Dir` still provides an incompatible `Foo`
        // from `foo-a`.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';
          import {Foo} from 'foo-b';

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T extends Foo> {
            @Input()
            dir!: T;
          }
        `);

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toContain(`Type 'import("${
                absoluteFrom(
                    '/node_modules/foo-a/index')}").Foo' is not assignable to type 'import("${
                absoluteFrom('/node_modules/foo-b/index')}").Foo'.`);

        // For completeness, update `Cmp` to address the previous template type-check error by
        // changing the type of the binding into `Dir` to also be the `Foo` from `foo-b`. This
        // should result in a successful compilation.
        env.write('cmp.ts', `
          import {Component} from '@angular/core';
          import {Foo} from 'foo-b';

          @Component({
            selector: 'test-cmp',
            template: '<div [dir]="foo"></div>',
          })
          export class Cmp {
            foo: Foo = {b: true};
          }
        `);
        env.driveMain();
      });
    });
  });
});
