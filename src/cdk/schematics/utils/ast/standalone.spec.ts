import {HostTree} from '@angular-devkit/schematics';
import {UnitTestTree} from '@angular-devkit/schematics/testing';
import * as ts from 'typescript';
import {
  addModuleImportToStandaloneBootstrap,
  findBootstrapApplicationCall,
  importsProvidersFrom,
} from './standalone';

describe('standalone utilities', () => {
  let host: UnitTestTree;

  beforeEach(() => {
    host = new UnitTestTree(new HostTree());
  });

  function getSourceFileFrom(path: string) {
    return ts.createSourceFile(path, host.readText(path), ts.ScriptTarget.Latest, true);
  }

  function stripWhitespace(str: string) {
    return str.replace(/\s/g, '');
  }

  function assertContains(source: string, targetString: string) {
    expect(stripWhitespace(source)).toContain(stripWhitespace(targetString));
  }

  describe('findBootstrapApplicationCall', () => {
    it('should find a call to `bootstrapApplication`', () => {
      host.create(
        '/test.ts',
        `
          import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          bootstrapApplication(AppComponent, {
            providers: [importProvidersFrom(BrowserModule)]
          });
        `,
      );

      expect(findBootstrapApplicationCall(getSourceFileFrom('/test.ts'))).toBeTruthy();
    });

    it('should find an aliased call to `bootstrapApplication`', () => {
      host.create(
        '/test.ts',
        `
          import { BrowserModule, bootstrapApplication as boot } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          boot(AppComponent, {
            providers: [importProvidersFrom(BrowserModule)]
          });
        `,
      );

      expect(findBootstrapApplicationCall(getSourceFileFrom('/test.ts'))).toBeTruthy();
    });

    it('should return null if there are no bootstrapApplication calls', () => {
      host.create(
        '/test.ts',
        `
          import { AppComponent } from './app.component';

          console.log(AppComponent);
        `,
      );

      expect(findBootstrapApplicationCall(getSourceFileFrom('/test.ts'))).toBeNull();
    });
  });

  describe('importsProvidersFrom', () => {
    it('should find that a bootstrapApplication call imports providers from a module', () => {
      host.create(
        '/test.ts',
        `
          import { importProvidersFrom } from '@angular/core';
          import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          bootstrapApplication(AppComponent, {
            providers: [
              {provide: foo, useValue: 10},
              importProvidersFrom(BrowserModule)
            ]
          });
        `,
      );

      expect(importsProvidersFrom(host, '/test.ts', 'BrowserModule')).toBe(true);
      expect(importsProvidersFrom(host, '/test.ts', 'FooModule')).toBe(false);
    });

    it('should find that a bootstrapApplication call imports providers from a module if importProvidersFrom is aliased', () => {
      host.create(
        '/test.ts',
        `
          import { importProvidersFrom as imp } from '@angular/core';
          import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          bootstrapApplication(AppComponent, {
            providers: [imp(BrowserModule)]
          });
        `,
      );

      expect(importsProvidersFrom(host, '/test.ts', 'BrowserModule')).toBe(true);
      expect(importsProvidersFrom(host, '/test.ts', 'FooModule')).toBe(false);
    });

    it('should return false if there is no bootstrapApplication calls', () => {
      host.create(
        '/test.ts',
        `
          import { AppComponent } from './app.component';

          console.log(AppComponent);
        `,
      );

      expect(importsProvidersFrom(host, '/test.ts', 'FooModule')).toBe(false);
    });
  });

  describe('addModuleImportToStandaloneBootstrap', () => {
    it('should be able to add a module import to a simple `bootstrapApplication` call', () => {
      host.create(
        '/test.ts',
        `
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          bootstrapApplication(AppComponent);
        `,
      );

      addModuleImportToStandaloneBootstrap(host, '/test.ts', 'FooModule', '@foo/bar');

      const content = stripWhitespace(host.readContent('/test.ts'));

      assertContains(content, `import {importProvidersFrom} from '@angular/core';`);
      assertContains(content, `import {FooModule} from '@foo/bar';`);
      assertContains(
        content,
        `bootstrapApplication(AppComponent, {providers: [importProvidersFrom(FooModule)]});`,
      );
    });

    it('should be able to add a module import to a `bootstrapApplication` call with an empty options object', () => {
      host.create(
        '/test.ts',
        `
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          bootstrapApplication(AppComponent, {});
        `,
      );

      addModuleImportToStandaloneBootstrap(host, '/test.ts', 'FooModule', '@foo/bar');

      const content = stripWhitespace(host.readContent('/test.ts'));

      assertContains(content, `import {importProvidersFrom} from '@angular/core';`);
      assertContains(content, `import {FooModule} from '@foo/bar';`);
      assertContains(
        content,
        `bootstrapApplication(AppComponent, {providers: [importProvidersFrom(FooModule)]});`,
      );
    });

    it('should be able to add a module import to a `bootstrapApplication` call with a pre-existing `providers` array', () => {
      host.create(
        '/test.ts',
        `
          import { enableProdMode } from '@angular/core';
          import { bootstrapApplication } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          enableProdMode();

          bootstrapApplication(AppComponent, {
            providers: [{provide: 'foo', useValue: 'bar'}]
          });
        `,
      );

      addModuleImportToStandaloneBootstrap(host, '/test.ts', 'FooModule', '@foo/bar');

      const content = stripWhitespace(host.readContent('/test.ts'));

      assertContains(content, `import {enableProdMode, importProvidersFrom} from '@angular/core';`);
      assertContains(content, `import {FooModule} from '@foo/bar';`);
      assertContains(
        content,
        `bootstrapApplication(AppComponent, {
          providers: [
            {provide: 'foo', useValue: 'bar'},
            importProvidersFrom(FooModule)
          ]
        });`,
      );
    });

    it('should be able to add a module import to a `bootstrapApplication` call with a pre-existing `importProvidersFrom` call', () => {
      host.create(
        '/test.ts',
        `
          import { importProvidersFrom } from '@angular/core';
          import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
          import { AppComponent } from './app.component';

          bootstrapApplication(AppComponent, {
            providers: [{provide: 'foo', useValue: 'bar'}, importProvidersFrom(BrowserModule)]
          });
        `,
      );

      addModuleImportToStandaloneBootstrap(host, '/test.ts', 'FooModule', '@foo/bar');

      const content = stripWhitespace(host.readContent('/test.ts'));

      assertContains(content, `import {importProvidersFrom} from '@angular/core';`);
      assertContains(content, `import {FooModule} from '@foo/bar';`);
      assertContains(
        content,
        `bootstrapApplication(AppComponent, {
          providers: [
            {provide: 'foo', useValue: 'bar'},
            importProvidersFrom(BrowserModule, FooModule)
          ]
        });`,
      );
    });

    it('should throw if there is no `bootstrapModule` call', () => {
      host.create(
        '/test.ts',
        `
          import { AppComponent } from './app.component';

          console.log(AppComponent);
        `,
      );

      expect(() => {
        addModuleImportToStandaloneBootstrap(host, '/test.ts', 'FooModule', '@foo/bar');
      }).toThrowError(/Could not find bootstrapApplication call in \/test\.ts/);
    });
  });
});
