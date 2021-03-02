/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

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

    describe('type-check api surface', () => {
      it('should type-check correctly when a backing input field is renamed', () => {
        // This test verifies that renaming the class field of an input is correctly reflected into
        // the TCB.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir {
            @Input('dir')
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

        // Now rename the backing field of the input; the TCB should be updated such that the `dir`
        // input binding is still valid.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir {
            @Input('dir')
            dirRenamed!: string;
          }
        `);
        env.driveMain();
      });

      it('should type-check correctly when a backing output field is renamed', () => {
        // This test verifies that renaming the class field of an output is correctly reflected into
        // the TCB.
        env.write('dir.ts', `
          import {Directive, EventEmitter, Output} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir {
            @Output('dir')
            dir = new EventEmitter<string>();
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div (dir)="foo($event)"></div>',
          })
          export class Cmp {
            foo(bar: string) {}
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

        // Now rename the backing field of the output; the TCB should be updated such that the `dir`
        // input binding is still valid.
        env.write('dir.ts', `
          import {Directive, EventEmitter, Output} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir {
            @Output('dir')
            dirRenamed = new EventEmitter<string>();
          }
        `);
        env.driveMain();
      });

      it('should type-check correctly when the backing field of an input is removed', () => {
        // For inputs that are only declared in the decorator but for which no backing field is
        // declared in the TypeScript class, the TCB should not contain a write to the field as it
        // would be an error. This test verifies that the TCB is regenerated when a backing field
        // is removed.
        env.write('dir.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dir]',
            inputs: ['dir'],
          })
          export class Dir {
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
            foo = true;
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
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toContain(`Type 'boolean' is not assignable to type 'string'.`);

        // Now remove the backing field for the `dir` input. The compilation should now succeed
        // as there are no type-check errors.
        env.write('dir.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dir]',
            inputs: ['dir'],
          })
          export class Dir {}
        `);
        env.driveMain();
      });

      it('should type-check correctly when the backing field of an input is made readonly', () => {
        // When an input is declared as readonly and if `strictInputAccessModifiers` is disabled,
        // the TCB contains an indirect write to the property to silence the error that a value
        // cannot be assigned to a readonly property. This test verifies that changing a field to
        // become readonly does result in the TCB being updated to use such an indirect write, as
        // otherwise an error would incorrectly be reported.
        env.tsconfig({strictTemplates: true, strictInputAccessModifiers: false});
        env.write('dir.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dir]',
            inputs: ['dir'],
          })
          export class Dir {
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

        // Now change the `dir` input to be readonly. Because `strictInputAccessModifiers` is
        // disabled this should be allowed.
        env.write('dir.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dir]',
            inputs: ['dir'],
          })
          export class Dir {
            readonly dir!: string;
          }
        `);
        env.driveMain();
      });

      it('should type-check correctly when an ngAcceptInputType field is declared', () => {
        // Declaring a static `ngAcceptInputType` member requires that the TCB is regenerated, as
        // writes to an input property should then be targeted against this static member instead
        // of the input field itself.
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
            foo = true;
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
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toContain(`Type 'boolean' is not assignable to type 'string'.`);

        // Now add an `ngAcceptInputType` static member to the directive such that its `dir` input
        // also accepts `boolean`, unlike the type of `dir`'s class field. This should therefore
        // allow the compilation to succeed.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir {
            @Input()
            dir!: string;

            static ngAcceptInputType_dir: string | boolean;
          }
        `);
        env.driveMain();
      });

      it('should type-check correctly when an ngTemplateContextGuard field is declared', () => {
        // This test adds an `ngTemplateContextGuard` static member to verify that the TCB is
        // regenerated for the template context to take effect.
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
            template: '<div *dir="let bar">{{ foo(bar) }}</div>',
          })
          export class Cmp {
            foo(bar: string) {}
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

        // Now add the template context to declare the `$implicit` variable to be of type `number`.
        // Doing so should report an error for `Cmp`, as the type of `bar` which binds to
        // `$implicit` is no longer compatible with the method signature which requires a `string`.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          export interface TemplateContext {
            $implicit: number;
          }

          @Directive({
            selector: '[dir]',
          })
          export class Dir {
            @Input()
            dir!: string;

            static ngTemplateContextGuard(dir: Dir, ctx: any): ctx is TemplateContext { return true; }
          }
        `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toContain(
                `Argument of type 'number' is not assignable to parameter of type 'string'.`);
      });

      it('should type-check correctly when an ngTemplateGuard field is declared', () => {
        // This test verifies that adding an `ngTemplateGuard` static member has the desired effect
        // of type-narrowing the bound input expression within the template.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir {
            @Input()
            dir!: boolean;
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div *dir="foo !== null">{{ test(foo) }}</div>',
          })
          export class Cmp {
            foo!: string | null;
            test(foo: string) {}
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
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n'))
            .toContain(
                `Argument of type 'string | null' is not assignable to parameter of type 'string'.`);

        // Now resolve the compilation error by adding the `ngTemplateGuard_dir` static member to
        // specify that the bound expression for `dir` should be used as template guard. This
        // should allow the compilation to succeed.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          export interface TemplateContext {
            $implicit: number;
          }

          @Directive({
            selector: '[dir]',
          })
          export class Dir {
            @Input()
            dir!: boolean;

            static ngTemplateGuard_dir: 'binding';
          }
        `);
        env.driveMain();
      });

      it('should type-check correctly when the type of an ngTemplateGuard field changes', () => {
        // This test verifies that changing the type of an `ngTemplateGuard` static member has the
        // desired effect of type-narrowing the bound input expression within the template according
        // to the new type of the `ngTemplateGuard` static member. Initially, an "invocation" type
        // context guard is used, but it's ineffective at narrowing an expression that explicitly
        // compares against null. An incremental step changes the type of the guard to be of type
        // `binding`.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T> {
            @Input()
            dir!: T;

            static ngTemplateGuard_dir<T>(dir: Dir<T>, expr: any): expr is NonNullable<T> { return true; };
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div *dir="foo !== null">{{ test(foo) }}</div>',
          })
          export class Cmp {
            foo!: string | null;
            test(foo: string) {}
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
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n'))
            .toContain(
                `Argument of type 'string | null' is not assignable to parameter of type 'string'.`);

        // Now change the type of the template guard into "binding" to achieve the desired narrowing
        // of `foo`, allowing the compilation to succeed.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          export interface TemplateContext {
            $implicit: number;
          }

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T> {
            @Input()
            dir!: T;

            static ngTemplateGuard_dir: 'binding';
          }
        `);
        env.driveMain();
      });

      it('should type-check correctly when the name of an ngTemplateGuard field changes', () => {
        // This test verifies that changing the name of the field to which an `ngTemplateGuard`
        // static member applies correctly removes its narrowing effect on the original input
        // binding expression.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T> {
            @Input()
            dir!: T;

            static ngTemplateGuard_dir: 'binding';
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div *dir="foo !== null">{{ test(foo) }}</div>',
          })
          export class Cmp {
            foo!: string | null;
            test(foo: string) {}
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

        // Now change the `ngTemplateGuard` to target a different field. The `dir` binding should
        // no longer be narrowed, causing the template of `Cmp` to become invalid.
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';

          export interface TemplateContext {
            $implicit: number;
          }

          @Directive({
            selector: '[dir]',
          })
          export class Dir<T> {
            @Input()
            dir!: T;

            static ngTemplateGuard_dir_renamed: 'binding';
          }
        `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n'))
            .toContain(
                `Argument of type 'string | null' is not assignable to parameter of type 'string'.`);
      });
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

    describe('inheritance', () => {
      it('should type-check derived directives when the public API of the parent class is affected',
         () => {
           // This test verifies that an indirect change to the public API of `Dir` as caused by a
           // change to `Dir`'s base class `Parent` causes the type-check result of component `Cmp`
           // that uses `Dir` to be updated accordingly.
           env.write('parent.ts', `
             import {Directive, Input} from '@angular/core';

             @Directive()
             export class Parent {
               @Input()
               parent!: string;
             }
           `);
           env.write('dir.ts', `
             import {Directive, Input} from '@angular/core';
             import {Parent} from './parent';

             @Directive({
               selector: '[dir]',
             })
             export class Dir extends Parent {
               @Input()
               dir!: string;
             }
           `);
           env.write('cmp.ts', `
             import {Component} from '@angular/core';

             @Component({
               selector: 'test-cmp',
               template: '<div [dir]="foo" [parent]="foo"></div>',
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

           // Now remove an input from `Parent`. This invalidates the binding in `Cmp`'s template,
           // so an error diagnostic should be reported.
           env.write('parent.ts', `
             import {Directive, Input} from '@angular/core';

             @Directive()
             export class Parent {

             }
           `);
           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(1);
           expect(diags[0].messageText)
               .toContain(`Can't bind to 'parent' since it isn't a known property of 'div'.`);
         });

      it('should type-check derived directives when the public API of the grandparent class is affected',
         () => {
           // This test verifies that an indirect change to the public API of `Dir` as caused by a
           // change to `Dir`'s transitive base class `Grandparent` causes the type-check result of
           // component `Cmp` that uses `Dir` to be updated accordingly.
           env.write('grandparent.ts', `
             import {Directive, Input} from '@angular/core';

             @Directive()
             export class Grandparent {
               @Input()
               grandparent!: string;
             }
           `);
           env.write('parent.ts', `
             import {Directive, Input} from '@angular/core';
             import {Grandparent} from './grandparent';

             @Directive()
             export class Parent extends Grandparent {
               @Input()
               parent!: string;
             }
           `);
           env.write('dir.ts', `
             import {Directive, Input} from '@angular/core';
             import {Parent} from './parent';

             @Directive({
               selector: '[dir]',
             })
             export class Dir extends Parent {
               @Input()
               dir!: string;
             }
           `);
           env.write('cmp.ts', `
             import {Component} from '@angular/core';

             @Component({
               selector: 'test-cmp',
               template: '<div [dir]="foo" [parent]="foo" [grandparent]="foo"></div>',
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

           // Now remove an input from `Grandparent`. This invalidates the binding in `Cmp`'s
           // template, so an error diagnostic should be reported.
           env.write('grandparent.ts', `
             import {Directive, Input} from '@angular/core';

             @Directive()
             export class Grandparent {

             }
          `);
           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(1);
           expect(diags[0].messageText)
               .toContain(`Can't bind to 'grandparent' since it isn't a known property of 'div'.`);
         });

      it('should type-check derived directives when a base class is added to a grandparent', () => {
        // This test verifies that an indirect change to the public API of `Dir` as caused by
        // adding a base class `Grandgrandparent` to `Dir`'s transitive base class `Grandparent`
        // causes the type-check result of component `Cmp` that uses `Dir` to be
        // updated accordingly.
        env.write('grandgrandparent.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive()
          export class Grandgrandparent {
            @Input()
            grandgrandparent!: string;
          }
        `);
        env.write('grandparent.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive()
          export class Grandparent {
            @Input()
            grandparent!: string;
          }
        `);
        env.write('parent.ts', `
          import {Directive, Input} from '@angular/core';
          import {Grandparent} from './grandparent';

          @Directive()
          export class Parent extends Grandparent {
            @Input()
            parent!: string;
          }
        `);
        env.write('dir.ts', `
          import {Directive, Input} from '@angular/core';
          import {Parent} from './parent';

          @Directive({
            selector: '[dir]',
          })
          export class Dir extends Parent {
            @Input()
            dir!: string;
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div [dir]="foo" [parent]="foo" [grandgrandparent]="foo"></div>',
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

        // `Cmp` already binds to the `grandgrandparent` input but it's not available, as
        // `Granparent` does not yet extend from `Grandgrandparent`.
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toContain(
                `Can't bind to 'grandgrandparent' since it isn't a known property of 'div'.`);

        // Now fix the issue by adding the base class to `Grandparent`; this should allow
        // type-checking to succeed.
        env.write('grandparent.ts', `
          import {Directive, Input} from '@angular/core';
          import {Grandgrandparent} from './grandgrandparent';

          @Directive()
          export class Grandparent extends Grandgrandparent {
            @Input()
            grandparent!: string;
          }
        `);
        env.driveMain();
      });

      it('should type-check derived directives when a base class is removed from a grandparent',
         () => {
           // This test verifies that an indirect change to the public API of `Dir` as caused by
           // removing a base class `Grandgrandparent` from `Dir`'s transitive base class
           // `Grandparent` causes the type-check result of component `Cmp` that uses `Dir` to be
           // updated accordingly.
           env.write('grandgrandparent.ts', `
             import {Directive, Input} from '@angular/core';

             @Directive()
             export class Grandgrandparent {
               @Input()
               grandgrandparent!: string;
             }
           `);
           env.write('grandparent.ts', `
             import {Directive, Input} from '@angular/core';
             import {Grandgrandparent} from './grandgrandparent';

             @Directive()
             export class Grandparent extends Grandgrandparent {
               @Input()
               grandparent!: string;
             }
           `);
           env.write('parent.ts', `
             import {Directive, Input} from '@angular/core';
             import {Grandparent} from './grandparent';

             @Directive()
             export class Parent extends Grandparent {
               @Input()
               parent!: string;
             }
           `);
           env.write('dir.ts', `
             import {Directive, Input} from '@angular/core';
             import {Parent} from './parent';

             @Directive({
               selector: '[dir]',
             })
             export class Dir extends Parent {
               @Input()
               dir!: string;
             }
           `);
           env.write('cmp.ts', `
             import {Component} from '@angular/core';

             @Component({
               selector: 'test-cmp',
               template: '<div [dir]="foo" [parent]="foo" [grandgrandparent]="foo"></div>',
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

           // Removing the base class from `Grandparent` should start to report a type-check
           // error in `Cmp`'s template, as its binding to the `grandgrandparent` input is no
           // longer valid.
           env.write('grandparent.ts', `
             import {Directive, Input} from '@angular/core';

             @Directive()
             export class Grandparent {
               @Input()
               grandparent!: string;
             }
           `);
           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(1);
           expect(diags[0].messageText)
               .toContain(
                   `Can't bind to 'grandgrandparent' since it isn't a known property of 'div'.`);
         });

      it('should type-check derived directives when the base class of a grandparent changes',
         () => {
           // This test verifies that an indirect change to the public API of `Dir` as caused by
           // changing the base class of `Dir`'s transitive base class `Grandparent` causes the
           // type-check result of component `Cmp` that uses `Dir` to be updated accordingly.
           env.write('grandgrandparent-a.ts', `
             import {Directive, Input} from '@angular/core';

             @Directive()
             export class GrandgrandparentA {
               @Input()
               grandgrandparentA!: string;
             }
           `);
           env.write('grandgrandparent-b.ts', `
             import {Directive, Input} from '@angular/core';

             @Directive()
             export class GrandgrandparentB {
               @Input()
               grandgrandparentB!: string;
             }
           `);
           env.write('grandparent.ts', `
             import {Directive, Input} from '@angular/core';
             import {GrandgrandparentA} from './grandgrandparent-a';

             @Directive()
             export class Grandparent extends GrandgrandparentA {
               @Input()
               grandparent!: string;
             }
           `);
           env.write('parent.ts', `
             import {Directive, Input} from '@angular/core';
             import {Grandparent} from './grandparent';

             @Directive()
             export class Parent extends Grandparent {
               @Input()
               parent!: string;
             }
           `);
           env.write('dir.ts', `
             import {Directive, Input} from '@angular/core';
             import {Parent} from './parent';

             @Directive({
               selector: '[dir]',
             })
             export class Dir extends Parent {
               @Input()
               dir!: string;
             }
           `);
           env.write('cmp.ts', `
             import {Component} from '@angular/core';

             @Component({
               selector: 'test-cmp',
               template: '<div [dir]="foo" [parent]="foo" [grandgrandparentA]="foo"></div>',
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

           // Now switch the base class of `Grandparent` from `GrandgrandparentA` to
           // `GrandgrandparentB` causes the input binding to `grandgrandparentA` to be reported as
           // an error, as it's no longer available.
           env.write('grandparent.ts', `
             import {Directive, Input} from '@angular/core';
             import {GrandgrandparentB} from './grandgrandparent-b';

             @Directive()
             export class Grandparent extends GrandgrandparentB {
               @Input()
               grandparent!: string;
             }
           `);
           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(1);
           expect(diags[0].messageText)
               .toContain(
                   `Can't bind to 'grandgrandparentA' since it isn't a known property of 'div'.`);
         });
    });
  });
});
