/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom, getFileSystem} from '@angular/compiler-cli';
import {initMockFileSystem} from '@angular/compiler-cli/private/testing';
import {
  applyTextUpdates,
  groupReplacementsByFile,
  ProjectRootRelativePath,
} from '../../utils/tsurge';
import {runTsurgeMigration} from '../../utils/tsurge/testing';
import {SafeOptionalChainingMigration} from './migration';

describe('SafeOptionalChainingMigration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should migrate optional chaining expressions in interpolations when applicable', async () => {
    const content = await migrateInlineTemplate(`
      {{ compute(foo?.bar) }}
      {{ compute(foo.bar.baz?.alpha) }}
      {{ compute(foo.bar?.[0]) }}
      {{ compute(foo.bar?.['abc']) }}
      {{ foo?.bar | json }}
      {{ foo.bar.baz?.alpha | json }}
      {{ foo?.bar === null ? 'A' : 'B'}}
      {{ foo?.bar === undefined ? 'A' : 'B'}}
    `);

    expect(content).toContain('{{ compute($safeNavigationMigration(foo?.bar)) }}');
    expect(content).toContain('{{ compute($safeNavigationMigration(foo.bar.baz?.alpha)) }}');
    expect(content).toContain('{{ compute($safeNavigationMigration(foo.bar?.[0])) }}');
    expect(content).toContain("{{ compute($safeNavigationMigration(foo.bar?.['abc'])) }}");
    expect(content).toContain('{{ $safeNavigationMigration(foo?.bar) | json }}');
    expect(content).toContain('{{ $safeNavigationMigration(foo.bar.baz?.alpha) | json }}');
    expect(content).toContain("{{ $safeNavigationMigration(foo?.bar) === null ? 'A' : 'B'}}");
    expect(content).toContain("{{ $safeNavigationMigration(foo?.bar) === undefined ? 'A' : 'B'}}");
  });

  it('should not migrate optional chaining expressions in interpolations when unnecessary', async () => {
    const content = await migrateInlineTemplate(`
                {{ ((((((((((foo?.bar))))))))) }} 
                {{ foo.bar?.baz }}
                {{ foo.bar?.[0] }}
                {{ foo.bar?.['abc'] }}
                {{ foo?.bar ?? 'ok' }}
                 {{ foo?.bar && 'ok' }}
                {{ foo?.bar ?? foo?.bar }}
                {{ foo?.bar || foo?.bar }}
                {{ foo?.bar && foo?.bar }}
                {{ foo.bar?.() }}
                {{ !foo?.bar }}
              `);
    expect(content).toContain('{{ ((((((((((foo?.bar))))))))) }}');
    expect(content).toContain('{{ foo.bar?.baz }}');
    expect(content).toContain('{{ foo.bar?.[0] }}');
    expect(content).toContain("{{ foo.bar?.['abc'] }}");
    expect(content).toContain("{{ foo?.bar ?? 'ok' }}");
    expect(content).toContain("{{ foo?.bar && 'ok' }}");
    expect(content).toContain('{{ foo?.bar ?? foo?.bar }}');
    expect(content).toContain('{{ foo?.bar || foo?.bar }}');
    expect(content).toContain('{{ foo?.bar && foo?.bar }}');
    expect(content).toContain('{{ foo.bar?.() }}');
    expect(content).toContain('{{ !foo?.bar }}');
  });

  it('should not input/attribute value with interpolation', async () => {
    const content = await migrateInlineTemplate(`
      <input [id]="val-{{foo?.bar}}" />
      <div id="user-{{user?.id}}">
      `);

    expect(content).toContain('<input [id]="val-{{foo?.bar}}" />');
    expect(content).toContain('<div id="user-{{user?.id}}">');
  });

  it('should only migrate @if/ngIf conditional if there is a strict null check', async () => {
    const actual = await migrateInlineTemplate(`
          <div *ngIf="foo?.bar"></div>
          <div *ngIf="foo?.bar !== null"></div>
          <div *ngIf="!foo?.bar"></div>

          @if(foo?.bar) {}
          @if(foo?.bar !== null) {}
    `);
    expect(actual).toContain('<div *ngIf="foo?.bar"></div>'); // Not migrated
    expect(actual).toContain('<div *ngIf="$safeNavigationMigration(foo?.bar) !== null"></div>');
    expect(actual).toContain('<div *ngIf="!foo?.bar"></div>'); // Negation should not be migrated

    expect(actual).toContain('@if(foo?.bar) {}'); // Not migrated
    expect(actual).toContain('@if($safeNavigationMigration(foo?.bar) !== null) {}');
  });

  it('should not migrate @if/ngIf conditionals that are checking for null but not with a strict equality check', async () => {
    const actual = await migrateInlineTemplate(`
          <div *ngIf="foo?.bar == null"></div>
          <div *ngIf="foo?.bar != null"></div>

          @if(foo?.bar == null) {}
          @if(foo?.bar != null) {}
    `);
    expect(actual).toContain('<div *ngIf="foo?.bar == null"></div>');
    expect(actual).toContain('<div *ngIf="foo?.bar != null"></div>');

    expect(actual).toContain('@if(foo?.bar == null) {}');
    expect(actual).toContain('@if(foo?.bar != null) {}');
  });

  it('should migrate conditionals if there is a strict check against undefined', async () => {
    const actual = await migrateInlineTemplate(`
    <div *ngIf="foo?.bar === undefined"></div>
    @if(foo?.bar !== undefined) {}
  `);
    expect(actual).toContain(
      '<div *ngIf="$safeNavigationMigration(foo?.bar) === undefined"></div>',
    );
    expect(actual).toContain('@if($safeNavigationMigration(foo?.bar) !== undefined) {}');
  });

  it('should migrate @defer when condition if there is a strict null check', async () => {
    const actual = await migrateInlineTemplate(`
      @defer (when foo?.bar === null) {
        <div>Deferred content</div>
      }
    `);

    expect(actual).toContain('@defer (when $safeNavigationMigration(foo?.bar) === null) {');
  });

  it('should skip simple ngFor/@for expressions', async () => {
    const actual = await migrateInlineTemplate(`
      <div *ngFor="let item of items?.list"></div>
      @for(item of items?.list; track item) {}
    `);
    expect(actual).toContain('<div *ngFor="let item of items?.list"></div>');
    expect(actual).toContain('@for(item of items?.list; track item) {}');
    // Sanity check
    expect(actual).not.toContain('$safeNavigationMigration');
  });

  it('should migrate ngFor expressions when needed', async () => {
    const actual = await migrateInlineTemplate(
      `<div *ngFor="let user of repository?.project | users"></div>`,
    );
    expect(actual).toContain(
      '<div *ngFor="let user of $safeNavigationMigration(repository?.project) | users">',
    );
  });

  it('should migrate @for expressions when needed', async () => {
    const actual = await migrateInlineTemplate(`
      @for (item of repository?.project | users; track item.id) {}
    `);
    expect(actual).toContain(
      '@for (item of $safeNavigationMigration(repository?.project) | users; track item.id) {}',
    );
  });

  it('should not migrate the @for track function', async () => {
    const actual = await migrateInlineTemplate(`
      @for (item of items; track item?.id) {}
    `);
    expect(actual).toContain('@for (item of items; track item?.id) {}');
  });

  it('should migrate a track function that contains an expression', async () => {
    const actual = await migrateInlineTemplate(`
      @for (item of items; track compute(item?.id)) {}
    `);
    expect(actual).toContain(
      '@for (item of items; track compute($safeNavigationMigration(item?.id))) {}',
    );
  });

  it('should migrate @let declarations', async () => {
    const actual = await migrateInlineTemplate(`@let x = foo?.bar;`);
    expect(actual).toContain(`@let x = $safeNavigationMigration(foo?.bar);`);
  });

  it('should migrate inputs and attribute bindings with optional chaining expressions', async () => {
    const actual = await migrateInlineTemplate(`
      <div [id]="user?.id"></div>
      <my-comp [userInput]="user?.name"/>
      <my-comp [userInput]="user?.name | json"/>
      <my-comp [userInput]="user?.name || 'default'"/>
      <my-comp [userInput]="user?.name && 'ok'"/>
      <my-comp [userInput]="user?.name ?? 'default'"/>
      <my-comp [userInput]="foo.bar?.()"/>
      <my-comp [userInput]="foo?.bar!"/>
      <my-comp [userInput]="foo?.bar > 0"/>
      <my-comp [userInput]="foo?.bar >= 0"/>
      <my-comp [userInput]="foo?.bar < 0"/>
      <my-comp [userInput]="foo?.bar <= 0"/>

    `);
    expect(actual).toContain('<div [id]="$safeNavigationMigration(user?.id)"></div>');
    expect(actual).toContain('<my-comp [userInput]="$safeNavigationMigration(user?.name)"/>');
    expect(actual).toContain(
      '<my-comp [userInput]="$safeNavigationMigration(user?.name) | json"/>',
    );
    expect(actual).toContain('<my-comp [userInput]="user?.name || \'default\'"/>');
    expect(actual).toContain('<my-comp [userInput]="user?.name && \'ok\'"/>');
    expect(actual).toContain('<my-comp [userInput]="user?.name ?? \'default\'"/>');
    expect(actual).toContain('<my-comp [userInput]="$safeNavigationMigration(foo.bar?.())"/>');
    expect(actual).toContain('<my-comp [userInput]="$safeNavigationMigration(foo?.bar)!"/>');

    // Yes there are different semantics between null & undefined checks and greater/less than comparisons
    expect(actual).toContain('<my-comp [userInput]="$safeNavigationMigration(foo?.bar) > 0"/>');
    expect(actual).toContain('<my-comp [userInput]="$safeNavigationMigration(foo?.bar) >= 0"/>');
    expect(actual).toContain('<my-comp [userInput]="$safeNavigationMigration(foo?.bar) < 0"/>');
    expect(actual).toContain('<my-comp [userInput]="$safeNavigationMigration(foo?.bar) <= 0"/>');
  });

  it('should not migrate binding expressions when not necessary', async () => {
    const actual = await migrateInlineTemplate(`
      <my-comp [userInput]="user?.name || 'default'"/>
      <my-comp [userInput]="user?.name && 'ok'"/>
      <my-comp [userInput]="user?.name ?? 'default'"/>
      <my-comp [userInput]="foo?.isActive ? 'a' : 'b'"/>
      <my-comp [userInput]="!foo?.bar"/>
    `);

    expect(actual).toContain('<my-comp [userInput]="user?.name || \'default\'"/>');
    expect(actual).toContain('<my-comp [userInput]="user?.name && \'ok\'"/>');
    expect(actual).toContain('<my-comp [userInput]="user?.name ?? \'default\'"/>');
    expect(actual).toContain(`<my-comp [userInput]="foo?.isActive ? 'a' : 'b'"/>`);
    expect(actual).toContain('<my-comp [userInput]="!foo?.bar"/>');
  });

  it('should skip interpolation with no function and no pipe', async () => {
    const actual = await migrateInlineTemplate(`
      <p>{{ foo?.bar }}</p>
      <div>{{ compute(foo?.bar) }}</div>
      <span>{{ foo?.bar | json }}</span>
    `);
    expect(actual).toContain('<p>{{ foo?.bar }}</p>'); // skipped
    expect(actual).toContain('<div>{{ compute($safeNavigationMigration(foo?.bar)) }}</div>');
    expect(actual).toContain('<span>{{ $safeNavigationMigration(foo?.bar) | json }}</span>');
  });

  it('should migrate optional chaining expressions in pipe arguments', async () => {
    const actual = await migrateInlineTemplate(`
      <p>{{ foo | myPipe:foo?.bar }}</p>
    `);
    expect(actual).toContain('<p>{{ foo | myPipe:$safeNavigationMigration(foo?.bar) }}</p>');
  });

  it('should skip direct optional call in event handlers but migrate wrapped handlers', async () => {
    const actual = await migrateInlineTemplate(`
      <button (click)="user?.save()"></button>
      <button (click)="computed(user?.save())"></button>
    `);

    expect(actual).toContain('<button (click)="user?.save()"></button>');
    // In `computed(user?.save())`, the optional-call continuation sits in a function
    // argument position, which is null-sensitive for consumers that distinguish
    // `null` from `undefined`; this call must be wrapped.
    expect(actual).toContain(
      '<button (click)="computed($safeNavigationMigration(user?.save()))"></button>',
    );
  });

  it('should skip class, style, and attribute bindings that are just optional chains', async () => {
    const actual = await migrateInlineTemplate(`
      <div [class.active]="user?.active"></div>
      <div [class]="user?.classes"></div>
      <div [style.color]="user?.color"></div>
      <div [style]="user?.styles"></div>
      <div [attr.data-id]="user?.id"></div>

      <div [class.active]="user?.active === true"></div>
      <div [class]="user?.classes || 'default'"></div>
      <div [class]="user?.active && user?.classes"></div>
      <div [class]="user?.classes ?? 'default'"></div>
      <div [attr.data-id]="user?.id || 'default'"></div>
      <div [attr.data-id]="user?.id ?? 'default'"></div>
      <div [class]="['classA', user?.classB]"></div>
    `);

    expect(actual).toContain('<div [class.active]="user?.active"></div>');
    expect(actual).toContain('<div [class]="user?.classes"></div>');
    expect(actual).toContain('<div [style.color]="user?.color"></div>');
    expect(actual).toContain('<div [style]="user?.styles"></div>');
    expect(actual).toContain('<div [attr.data-id]="user?.id"></div>');
    expect(actual).toContain(`<div [class]="user?.classes || 'default'"></div>`);
    expect(actual).toContain(`<div [class]="user?.active && user?.classes"></div>`);
    expect(actual).toContain(`<div [class]="user?.classes ?? 'default'"></div>`);
    expect(actual).toContain(`<div [attr.data-id]="user?.id || 'default'"></div>`);
    expect(actual).toContain(`<div [attr.data-id]="user?.id ?? 'default'"></div>`);
    expect(actual).toContain(`<div [class]="['classA', user?.classB]"></div>`);

    expect(actual).toContain('<div [class.active]="user?.active === true"></div>');
  });

  it('should migrate some cases of class/styles/attr bindings', async () => {
    const actual = await migrateInlineTemplate(`
        <div [class.active]="checkActive(user?.id)"></div>
        <div [style.color]="getColor(user?.id)"></div>
    `);

    expect(actual).toContain(
      '<div [class.active]="checkActive($safeNavigationMigration(user?.id))"></div>',
    );
    expect(actual).toContain(
      '<div [style.color]="getColor($safeNavigationMigration(user?.id))"></div>',
    );
  });

  it('should migrate all expressions in ngSwitch/@switch', async () => {
    const actual = await migrateInlineTemplate(`
      <div [ngSwitch]="foo?.bar">
        <span *ngSwitchCase="foo?.bar"></span>
      </div>

      @switch (foo?.bar) {
        @case (foo?.baz) {}
        @default {}
      }
    `);

    expect(actual).toContain('<div [ngSwitch]="$safeNavigationMigration(foo?.bar)">');
    expect(actual).toContain('<span *ngSwitchCase="$safeNavigationMigration(foo?.bar)"></span>');
    expect(actual).toContain('@switch ($safeNavigationMigration(foo?.bar)) {');
    expect(actual).toContain('@case ($safeNavigationMigration(foo?.baz)) {}');
  });

  it('should migrate ngSwitch/@switch if at least one case checks for null', async () => {
    const actual = await migrateInlineTemplate(`
      <div [ngSwitch]="foo?.bar">
        <span *ngSwitchCase="foo?.bar !== null"></span>
      </div>

      @switch (foo?.bar) {
        @case (foo?.baz !== null) {}
        @default {}
      }

      @switch (foo?.baz) {
        @case (null) {}
        @default {}
      }
    `);

    expect(actual).toContain('<div [ngSwitch]="$safeNavigationMigration(foo?.bar)">');
    expect(actual).toContain(
      '<span *ngSwitchCase="$safeNavigationMigration(foo?.bar) !== null"></span>',
    );
    expect(actual).toContain('@switch ($safeNavigationMigration(foo?.bar)) {');
    expect(actual).toContain('@case ($safeNavigationMigration(foo?.baz) !== null) {}');

    expect(actual).toContain('@switch ($safeNavigationMigration(foo?.baz)) {');
  });

  it('should migrate optional-chain continuations in null-sensitive sinks', async () => {
    const content = await migrateInlineTemplate(`
            {{ computed(compute(foo?.bar.baz)?.bar.baz) }}
    `);
    // `foo?.bar.baz` and `compute(... )?.bar.baz` are optional-chain continuations.
    // In null-sensitive sinks (function args), preserving legacy null-vs-undefined behavior
    // requires wrapping these chains.
    expect(content).toContain(
      'computed($safeNavigationMigration(compute($safeNavigationMigration(foo?.bar.baz))?.bar.baz))',
    );
  });

  it('should migrate host bindings when applicable', async () => {
    const {fs} = await runTsurgeMigration(new SafeOptionalChainingMigration(), [
      {
        name: absoluteFrom('/app.component.ts'),
        isProgramRootFile: true,
        contents: `
            import {Component} from '@angular/core';
            @Component({
              selector: 'app-root',
              template:'',
              host: {
                '[attr.data-id2]': 'computed(user?.id)',
                '[attr.data-id2]': 'user?.id | json',
                
                '[class.active]': 'user?.active === null',
                '[id]': 'user?.id',
              }
            })
            export class AppComponent { foo: any; compute(a: any) {} }
            `,
      },
    ]);
    const content = fs.readFile(absoluteFrom('/app.component.ts'));

    expect(content).toContain(`'[attr.data-id2]': 'computed($safeNavigationMigration(user?.id))',`);
    expect(content).toContain(`'[attr.data-id2]': '$safeNavigationMigration(user?.id) | json',`);
    expect(content).toContain(
      `'[class.active]': '$safeNavigationMigration(user?.active) === null',`,
    );
    expect(content).toContain(`'[id]': '$safeNavigationMigration(user?.id)',`);
  });

  it('should not migrate host bindings when not necessary', async () => {
    const {fs} = await runTsurgeMigration(new SafeOptionalChainingMigration(), [
      {
        name: absoluteFrom('/app.component.ts'),
        isProgramRootFile: true,
        contents: `
            import {Component} from '@angular/core';
            @Component({
              selector: 'app-root',
              template:'',
              host: {
                '[attr.data-id]': 'user?.id',
                '[attr.data-id]': 'user?.id ?? foo',
                '[attr.data-id]': 'user?.id || foo',
                '[attr.data-id]': 'user?.id && foo',
                '(click)': 'user?.save()' 
              }
            })
            export class AppComponent { foo: any; compute(a: any) {} }
            `,
      },
    ]);
    const content = fs.readFile(absoluteFrom('/app.component.ts'));

    expect(content).toContain(`'[attr.data-id]': 'user?.id',`);
    expect(content).toContain(`'[attr.data-id]': 'user?.id ?? foo',`);
    expect(content).toContain(`'[attr.data-id]': 'user?.id || foo',`);
    expect(content).toContain(`'[attr.data-id]': 'user?.id && foo',`);
    expect(content).toContain(`'(click)': 'user?.save()'`);
  });

  it('should handle a file that is present in multiple projects', async () => {
    const mockFs = getFileSystem();

    const sharedFile = absoluteFrom('/app.component.ts');
    const sharedContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-root',
        template: \`<div [id]="user?.id"></div>\`
      })
      export class AppComponent { user: any; }
    `;

    mockFs.ensureDir(absoluteFrom('/'));
    mockFs.writeFile(sharedFile, sharedContent);

    const tsconfig1 = absoluteFrom('/tsconfig.app.json');
    const tsconfig2 = absoluteFrom('/tsconfig.spec.json');

    mockFs.writeFile(
      tsconfig1,
      JSON.stringify({compilerOptions: {strict: true, rootDir: '/'}, files: [sharedFile]}),
    );
    mockFs.writeFile(
      tsconfig2,
      JSON.stringify({compilerOptions: {strict: true, rootDir: '/'}, files: [sharedFile]}),
    );

    const migration = new SafeOptionalChainingMigration();

    const info1 = migration.createProgram(tsconfig1, mockFs);
    const info2 = migration.createProgram(tsconfig2, mockFs);

    const unitData1 = await migration.analyze(info1);
    const unitData2 = await migration.analyze(info2);

    const combined = await migration.combine(unitData1, unitData2);
    const globalMeta = await migration.globalMeta(combined);
    const {replacements} = await migration.migrate(globalMeta);

    const updates = groupReplacementsByFile(replacements);
    const relPath = sharedFile.substring(1) as string as ProjectRootRelativePath; // strip leading '/'
    const changes = updates.get(relPath) ?? [];
    const result = applyTextUpdates(sharedContent, changes);

    // The expression should be wrapped exactly once, not twice.
    expect(result).toContain('$safeNavigationMigration(user?.id)');
    expect(result).not.toContain('$safeNavigationMigration($safeNavigationMigration');
  });

  it('should migrate an external template', async () => {
    const content = await migrateExternalTemplate(`
      {{ compute(foo?.bar) }}
      <div *ngIf="foo?.bar !== null"></div>
    `);

    expect(content).toContain('{{ compute($safeNavigationMigration(foo?.bar)) }}');
    expect(content).toContain('<div *ngIf="$safeNavigationMigration(foo?.bar) !== null"></div>');
  });
});

async function migrateInlineTemplate(template: string): Promise<string> {
  const {fs} = await runTsurgeMigration(new SafeOptionalChainingMigration(), [
    {
      name: absoluteFrom('/app.component.ts'),
      isProgramRootFile: true,
      contents: `
            import {Component} from '@angular/core';
            @Component({
              selector: 'app-root',
              template: \`
               ${template}
              \`
            })
            export class AppComponent { foo: any; compute(a: any) {} }
            `,
    },
  ]);
  return fs.readFile(absoluteFrom('/app.component.ts'));
}

async function migrateExternalTemplate(template: string): Promise<string> {
  const {fs} = await runTsurgeMigration(new SafeOptionalChainingMigration(), [
    {
      name: absoluteFrom('/app.component.html'),
      contents: template,
    },
    {
      name: absoluteFrom('/app.component.ts'),
      isProgramRootFile: true,
      contents: `
            import {Component} from '@angular/core';
            @Component({
              selector: 'app-root',
              templateUrl: './app.component.html'
            })
            export class AppComponent { foo: any; compute(a: any) {} }
            `,
    },
  ]);
  return fs.readFile(absoluteFrom('/app.component.html'));
}
