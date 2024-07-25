/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {runfiles} from '@bazel/runfiles';
import shx from 'shelljs';

describe('inject migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(options?: {
    path?: string;
    backwardsCompatibleConstructors?: boolean;
    migrateAbstractClasses?: boolean;
    nonNullableOptional?: boolean;
  }) {
    return runner.runSchematic('inject-migration', options, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../collection.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', '{}');
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );

    previousWorkingDir = shx.pwd();
    tmpDirPath = getSystemPath(host.root);
    shx.cd(tmpDirPath);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  ['Directive', 'Component', 'Pipe', 'NgModule'].forEach((decorator) => {
    it(`should migrate a @${decorator} to use inject()`, async () => {
      writeFile(
        '/dir.ts',
        [
          `import { ${decorator} } from '@angular/core';`,
          `import { Foo } from 'foo';`,
          `import { Bar } from 'bar';`,
          ``,
          `@${decorator}()`,
          `class MyClass {`,
          `  constructor(private foo: Foo, readonly bar: Bar) {}`,
          `}`,
        ].join('\n'),
      );

      await runMigration();

      expect(tree.readContent('/dir.ts').split('\n')).toEqual([
        `import { ${decorator}, inject } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        `import { Bar } from 'bar';`,
        ``,
        `@${decorator}()`,
        `class MyClass {`,
        `  private foo = inject(Foo);`,
        `  readonly bar = inject(Bar);`,
        `}`,
      ]);
    });
  });

  it('should take the injected type from @Inject()', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive, Inject } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        `import { FOO_TOKEN } from './token';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(@Inject(FOO_TOKEN) private foo: Foo) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, Inject, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      `import { FOO_TOKEN } from './token';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(FOO_TOKEN);`,
      `}`,
    ]);
  });

  it('should account for string tokens in @Inject()', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive, Inject } from '@angular/core';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(@Inject('not-officially-supported') private foo: number) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, Inject, inject } from '@angular/core';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject<number>('not-officially-supported' as any);`,
      `}`,
    ]);
  });

  it('should account for injected generic parameters', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive, Inject, ElementRef } from '@angular/core';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(`,
        `    private one: ElementRef<HTMLElement>`,
        `    @Inject(ElementRef) private two: ElementRef<HTMLButtonElement> | ElementRef<HTMLSpanElement>`,
        `  ) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, Inject, ElementRef, inject } from '@angular/core';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private one = inject<ElementRef<HTMLElement>>(ElementRef);`,
      `  private two = inject<ElementRef<HTMLButtonElement> | ElementRef<HTMLSpanElement>>(ElementRef);`,
      `}`,
    ]);
  });

  it('should transform @Attribute() to HostAttributeToken', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive, Attribute } from '@angular/core';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(@Attribute('foo') private foo: string) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, Attribute, HostAttributeToken, inject } from '@angular/core';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(new HostAttributeToken('foo'));`,
      `}`,
    ]);
  });

  it('should generate the options object if additional decorators are used', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive, Inject, Optional, Self, Host } from '@angular/core';`,
        `import { FOO_TOKEN, BAR_TOKEN, Foo } from './tokens';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(`,
        `    @Inject(FOO_TOKEN) @Optional() private a: number`,
        `    @Self() @Inject(BAR_TOKEN) protected b: string`,
        `    @Optional() @Host() readonly c: Foo`,
        `  ) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, Inject, Optional, Self, Host, inject } from '@angular/core';`,
      `import { FOO_TOKEN, BAR_TOKEN, Foo } from './tokens';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private a = inject(FOO_TOKEN, { optional: true });`,
      `  protected b = inject(BAR_TOKEN, { self: true });`,
      `  readonly c = inject(Foo, { optional: true, host: true });`,
      `}`,
    ]);
  });

  it('should migrate an aliased decorator to use inject()', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive as NgDirective } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@NgDirective()`,
        `class MyDir {`,
        `  constructor(private foo: Foo) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive as NgDirective, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@NgDirective()`,
      `class MyDir {`,
      `  private foo = inject(Foo);`,
      `}`,
    ]);
  });

  it('should migrate an aliased decorator to use inject()', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive as NgDirective } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@NgDirective()`,
        `class MyDir {`,
        `  constructor(private foo: Foo) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive as NgDirective, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@NgDirective()`,
      `class MyDir {`,
      `  private foo = inject(Foo);`,
      `}`,
    ]);
  });

  it('should only migrate classes in the specified directory', async () => {
    writeFile(
      '/should-migrate/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(private foo: Foo) {}`,
        `}`,
      ].join('\n'),
    );

    writeFile(
      '/should-not-migrate/other-dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `class MyOtherDir {`,
        `  constructor(private foo: Foo) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration({path: '/should-migrate'});

    expect(tree.readContent('/should-migrate/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(Foo);`,
      `}`,
    ]);

    expect(tree.readContent('/should-not-migrate/other-dir.ts').split('\n')).toEqual([
      `import { Directive } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `class MyOtherDir {`,
      `  constructor(private foo: Foo) {}`,
      `}`,
    ]);
  });

  it('should not migrate classes decorated with a non-Angular decorator', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@not-angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(private foo: Foo) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive } from '@not-angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  constructor(private foo: Foo) {}`,
      `}`,
    ]);
  });

  it('should migrate a nested class', async () => {
    writeFile(
      '/comp.spec.ts',
      [
        `import { Component } from '@angular/core';`,
        `import { TestBed } from '@angular/core/testing';`,
        `import { Foo } from 'foo';`,
        ``,
        `describe('MyComp', () => {`,
        `  it('should work', () => {`,
        `    @Component({standalone: true})`,
        `    class MyComp {`,
        `      constructor(private foo: Foo) {}`,
        `    }`,
        ``,
        `    TestBed.createComponent(MyComp);`,
        `  });`,
        `});`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/comp.spec.ts').split('\n')).toEqual([
      `import { Component, inject } from '@angular/core';`,
      `import { TestBed } from '@angular/core/testing';`,
      `import { Foo } from 'foo';`,
      ``,
      `describe('MyComp', () => {`,
      `  it('should work', () => {`,
      `    @Component({standalone: true})`,
      `    class MyComp {`,
      `      private foo = inject(Foo);`,
      `    }`,
      ``,
      `    TestBed.createComponent(MyComp);`,
      `  });`,
      `});`,
    ]);
  });

  it('should preserve the constructor if it has other expressions', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(private foo: Foo) {`,
        `    console.log('hello');`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(Foo);`,
      ``,
      `  constructor() {`,
      `    console.log('hello');`,
      `  }`,
      `}`,
    ]);
  });

  it('should declare a variable if an injected parameter without modifiers is referenced in the constructor', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(foo: Foo) {`,
        `    console.log(foo.bar + 123);`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  constructor() {`,
      `    const foo = inject(Foo);`,
      ``,
      `    console.log(foo.bar + 123);`,
      `  }`,
      `}`,
    ]);
  });

  it('should declare a variable if an injected parameter with modifiers is referenced in the constructor', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(readonly foo: Foo) {`,
        `    console.log(foo.bar + 123);`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  readonly foo = inject(Foo);`,
      ``,
      `  constructor() {`,
      `    const foo = this.foo;`,
      ``,
      `    console.log(foo.bar + 123);`,
      `  }`,
      `}`,
    ]);
  });

  it('should declare a variable if an injected parameter with modifiers is referenced in the constructor via shorthand assignment', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive, Inject, LOCALE_ID } from '@angular/core';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(@Inject(LOCALE_ID) locale: string) {`,
        `    console.log({ locale });`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, Inject, LOCALE_ID, inject } from '@angular/core';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  constructor() {`,
      `    const locale = inject(LOCALE_ID);`,
      ``,
      `    console.log({ locale });`,
      `  }`,
      `}`,
    ]);
  });

  it('should not declare a variable in the constructor if the only references to the parameter are shadowed', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(private foo: Foo) {`,
        `    console.log([1, 2, 3].map(foo => foo * 2));`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(Foo);`,
      ``,
      `  constructor() {`,
      `    console.log([1, 2, 3].map(foo => foo * 2));`,
      `  }`,
      `}`,
    ]);
  });

  it('should remove all constructor signatures when deleting its implementation', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        `import { Bar } from 'bar';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(foo: Foo);`,
        `  constructor(foo: Foo, bar: Bar);`,
        `  constructor(private foo: Foo, bar?: Bar) {}`,
        ``,
        `  log() {`,
        `    console.log(this.foo.bar());`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      `import { Bar } from 'bar';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(Foo);`,
      ``,
      ``,
      `  log() {`,
      `    console.log(this.foo.bar());`,
      `  }`,
      `}`,
    ]);
  });

  it('should remove constructor overloads when preserving its implementation', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        `import { Bar } from 'bar';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(foo: Foo);`,
        `  constructor(foo: Foo, bar: Bar);`,
        `  constructor(private foo: Foo, bar?: Bar) {`,
        `    console.log(this.foo.bar);`,
        `  }`,
        ``,
        `  log() {`,
        `    console.log(this.foo.bar());`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      `import { Bar } from 'bar';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(Foo);`,
      ``,
      `  constructor() {`,
      `    console.log(this.foo.bar);`,
      `  }`,
      ``,
      `  log() {`,
      `    console.log(this.foo.bar());`,
      `  }`,
      `}`,
    ]);
  });

  it('should handle multi-line constructor parameters', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        `import { Bar } from 'bar';`,
        `import { Baz } from './baz';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(`,
        `    private foo: Foo,`,
        `    readonly bar: Bar,`,
        `    readonly baz: Baz`,
        `  ) {`,
        `    console.log(this.foo, bar.value() + baz.otherValue());`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      `import { Bar } from 'bar';`,
      `import { Baz } from './baz';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(Foo);`,
      `  readonly bar = inject(Bar);`,
      `  readonly baz = inject(Baz);`,
      ``,
      `  constructor() {`,
      `    const bar = this.bar;`,
      `    const baz = this.baz;`,
      ``,
      `    console.log(this.foo, bar.value() + baz.otherValue());`,
      `  }`,
      `}`,
    ]);
  });

  it('should handle multi-line constructor parameters with a trailing comma', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        `import { Bar } from 'bar';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(`,
        `    private foo: Foo,`,
        `    readonly bar: Bar,`,
        `  ) {`,
        `    console.log(this.foo, bar.value());`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      `import { Bar } from 'bar';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(Foo);`,
      `  readonly bar = inject(Bar);`,
      ``,
      `  constructor() {`,
      `    const bar = this.bar;`,
      ``,
      `    console.log(this.foo, bar.value());`,
      `  }`,
      `}`,
    ]);
  });

  it('should insert the new class members before any pre-existing ones', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  private hello = 1;`,
        `  readonly goodbye = 0;`,
        ``,
        `  constructor(private foo: Foo) {}`,
        ``,
        `  log() {`,
        `    console.log(this.foo, this.hello, this.goodbye);`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(Foo);`,
      ``,
      `  private hello = 1;`,
      `  readonly goodbye = 0;`,
      ``,
      `  log() {`,
      `    console.log(this.foo, this.hello, this.goodbye);`,
      `  }`,
      `}`,
    ]);
  });

  it('should exclude the public modifier from newly-created members', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(public readonly foo: Foo) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  readonly foo = inject(Foo);`,
      `}`,
    ]);
  });

  it('should account for super() calls', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Parent } from './parent';`,
        `import { A, B, C, D } from './types';`,
        ``,
        `@Directive()`,
        `class MyDir extends Parent {`,
        `  constructor(`,
        `    readonly usedInSuperAndDeclared: A,`,
        `    protected declaredButNotUsedInSuper: B,`,
        `    usedInSuperUndeclared: C,`,
        `    usedInConstructorUndeclared: D) {`,
        `    super(usedInSuperAndDeclared, usedInSuperUndeclared);`,
        `    console.log(usedInConstructorUndeclared + 1);`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Parent } from './parent';`,
      `import { A, B, C, D } from './types';`,
      ``,
      `@Directive()`,
      `class MyDir extends Parent {`,
      `  readonly usedInSuperAndDeclared: A;`,
      `  protected declaredButNotUsedInSuper = inject(B);`,
      ``,
      `  constructor() {`,
      `    const usedInSuperAndDeclared = inject(A);`,
      `    const usedInSuperUndeclared = inject(C);`,
      `    const usedInConstructorUndeclared = inject(D);`,
      ``,
      `    super(usedInSuperAndDeclared, usedInSuperUndeclared);`,
      `    this.usedInSuperAndDeclared = usedInSuperAndDeclared;`,
      ``,
      `    console.log(usedInConstructorUndeclared + 1);`,
      `  }`,
      `}`,
    ]);
  });

  it('should be able to opt into generating backwards-compatible constructors for a class with existing members', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  private hello = 1;`,
        `  readonly goodbye = 0;`,
        ``,
        `  constructor(private foo: Foo) {}`,
        ``,
        `  log() {`,
        `    console.log(this.foo, this.hello, this.goodbye);`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration({backwardsCompatibleConstructors: true});

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(Foo);`,
      ``,
      `  private hello = 1;`,
      `  readonly goodbye = 0;`,
      ``,
      `  /** Inserted by Angular inject() migration for backwards compatibility */`,
      `  constructor(...args: unknown[]);`,
      ``,
      `  constructor() {}`,
      ``,
      `  log() {`,
      `    console.log(this.foo, this.hello, this.goodbye);`,
      `  }`,
      `}`,
    ]);
  });

  it('should be able to opt into generating backwards-compatible constructors for a class that only has a constructor', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(private foo: Foo) {}`,
        ``,
        `  log() {`,
        `    console.log(this.foo, this.hello, this.goodbye);`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration({backwardsCompatibleConstructors: true});

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(Foo);`,
      ``,
      `  /** Inserted by Angular inject() migration for backwards compatibility */`,
      `  constructor(...args: unknown[]);`,
      ``,
      `  constructor() {}`,
      ``,
      `  log() {`,
      `    console.log(this.foo, this.hello, this.goodbye);`,
      `  }`,
      `}`,
    ]);
  });

  it('should not migrate abstract classes by default', async () => {
    const initialContent = [
      `import { Directive } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `abstract class MyDir {`,
      `  constructor(private foo: Foo) {}`,
      `}`,
    ].join('\n');

    writeFile('/dir.ts', initialContent);

    await runMigration();

    expect(tree.readContent('/dir.ts')).toBe(initialContent);
  });

  it('should be able to opt into migrating abstract classes', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `abstract class MyDir {`,
        `  constructor(readonly foo: Foo) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration({migrateAbstractClasses: true});

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `abstract class MyDir {`,
      `  readonly foo = inject(Foo);`,
      `}`,
    ]);
  });

  it('should migrate a file that uses tabs for indentation', async () => {
    // Note: these strings specifically use tabs for indentation.
    // It might not be visible depending on the IDE settings.
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        `import { Bar } from './bar';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `	private hello = 1;`,
        ``,
        `	constructor(`,
        `		protected foo: Foo,`,
        `		bar: Bar,`,
        `	) {`,
        `		console.log(this.foo, bar);`,
        `	}`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      `import { Bar } from './bar';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `	protected foo = inject(Foo);`,
      ``,
      `	private hello = 1;`,
      ``,
      `	constructor() {`,
      `		const bar = inject(Bar);`,
      ``,
      `		console.log(this.foo, bar);`,
      `	}`,
      `}`,
    ]);
  });

  it('should migrate a file that uses CRLF line endings', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        `import { Bar } from './bar';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(private foo: Foo, bar: Bar) {`,
        `    console.log(this.foo, bar);`,
        `  }`,
        `}`,
      ].join('\r\n'),
    );

    await runMigration();

    // We also split on `\n`, because the code we insert always uses `\n`.
    expect(tree.readContent('/dir.ts').split(/\r\n|\n/g)).toEqual([
      `import { Directive, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      `import { Bar } from './bar';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(Foo);`,
      ``,
      `  constructor() {`,
      `    const bar = inject(Bar);`,
      ``,
      `    console.log(this.foo, bar);`,
      `  }`,
      `}`,
    ]);
  });

  it('should allow users to opt into generating non-nullable optional calls', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive, Optional } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(@Optional() private foo: Foo) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration({nonNullableOptional: true});

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, Optional, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(Foo, { optional: true })!;`,
      `}`,
    ]);
  });

  it('should not add non-null assertions around sites that were nullable before the migration', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive, Inject, Optional } from '@angular/core';`,
        `import { A, B, C, D, E, F, G, H } from './types';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(`,
        `    @Optional() private a?: A,`,
        `    @Inject(B) @Optional() readonly b: number | null,`,
        `    @Inject(C) @Optional() protected c: number | undefined`,
        `    @Inject(D) @Optional() public d: null`,
        `    @Inject(E) @Optional() private e: string | null | number`,
        `    @Inject(F) @Optional() readonly f: string | number | undefined`,
        `    @Inject(G) @Optional() protected g: undefined`,
        `    @Inject(H) @Optional() public h: number | void`,
        `  ) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration({nonNullableOptional: true});

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, Inject, Optional, inject } from '@angular/core';`,
      `import { A, B, C, D, E, F, G, H } from './types';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private a = inject(A, { optional: true });`,
      `  readonly b = inject(B, { optional: true });`,
      `  protected c = inject(C, { optional: true });`,
      `  d = inject(D, { optional: true });`,
      `  private e = inject(E, { optional: true });`,
      `  readonly f = inject(F, { optional: true });`,
      `  protected g = inject(G, { optional: true });`,
      `  h = inject(H, { optional: true });`,
      `}`,
    ]);
  });

  it('should pick up the first non-literal type if a parameter has a union type', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive, Optional } from '@angular/core';`,
        `import { Foo } from 'foo';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(@Optional() private foo: null | Foo) {}`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, Optional, inject } from '@angular/core';`,
      `import { Foo } from 'foo';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  private foo = inject(Foo, { optional: true });`,
      `}`,
    ]);
  });

  it('should unwrap forwardRef with an implicit return', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive, Inject, forwardRef } from '@angular/core';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(@Inject(forwardRef(() => Foo)) readonly foo: Foo) {}`,
        `}`,
        ``,
        `@Directive()`,
        `class Foo {}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, Inject, forwardRef, inject } from '@angular/core';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  readonly foo = inject(Foo);`,
      `}`,
      ``,
      `@Directive()`,
      `class Foo {}`,
    ]);
  });

  it('should unwrap forwardRef with an explicit return', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive, Inject, forwardRef } from '@angular/core';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(@Inject(forwardRef(() => {`,
        `    return Foo;`,
        `  })) readonly foo: Foo) {}`,
        `}`,
        ``,
        `@Directive()`,
        `class Foo {}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, Inject, forwardRef, inject } from '@angular/core';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  readonly foo = inject(Foo);`,
      `}`,
      ``,
      `@Directive()`,
      `class Foo {}`,
    ]);
  });

  it('should unwrap an aliased forwardRef', async () => {
    writeFile(
      '/dir.ts',
      [
        `import { Directive, Inject, forwardRef as aliasedForwardRef } from '@angular/core';`,
        ``,
        `@Directive()`,
        `class MyDir {`,
        `  constructor(@Inject(aliasedForwardRef(() => Foo)) readonly foo: Foo) {}`,
        `}`,
        ``,
        `@Directive()`,
        `class Foo {}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/dir.ts').split('\n')).toEqual([
      `import { Directive, Inject, forwardRef as aliasedForwardRef, inject } from '@angular/core';`,
      ``,
      `@Directive()`,
      `class MyDir {`,
      `  readonly foo = inject(Foo);`,
      `}`,
      ``,
      `@Directive()`,
      `class Foo {}`,
    ]);
  });
});
