/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import ts from 'typescript';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv} from '../../testing';

describe('navigation tree', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should include @if block in the navigation tree for an inline template', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({
        template: \`
        @if (condition) {
          <div>content</div>
        }
        \`,
        standalone: false,
      })
      export class AppCmp {
        condition = true;
      }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    const tree = appFile.getNavigationTree();
    const ifItem = findNavigationItem(tree, '@if');
    expect(ifItem).toBeDefined();
  });

  it('should include @for block in the navigation tree', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({
        template: \`
        @for (item of items; track $index) {
          <span>{{ item }}</span>
        } @empty {
          <p>No items</p>
        }
        \`,
        standalone: false,
      })
      export class AppCmp {
        items: string[] = [];
      }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    const tree = appFile.getNavigationTree();
    const forItem = findNavigationItem(tree, '@for');
    expect(forItem).toBeDefined();
    const emptyItem = findNavigationItem(forItem!, '@empty');
    expect(emptyItem).toBeDefined();
  });

  it('should include @switch block in the navigation tree', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({
        template: \`
        @switch (val) {
          @case ('a') {
            <span>A</span>
          }
          @default {
            <span>default</span>
          }
        }
        \`,
        standalone: false,
      })
      export class AppCmp {
        val = 'a';
      }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    const tree = appFile.getNavigationTree();
    const switchItem = findNavigationItem(tree, '@switch');
    expect(switchItem).toBeDefined();
    const caseItem = findNavigationItem(switchItem!, '@case');
    expect(caseItem).toBeDefined();
    const defaultItem = findNavigationItem(switchItem!, '@default');
    expect(defaultItem).toBeDefined();
  });

  it('should include @defer block in the navigation tree', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({
        template: \`
        @defer {
          <div>deferred content</div>
        }
        \`,
        standalone: false,
      })
      export class AppCmp {
      }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    const tree = appFile.getNavigationTree();
    const deferItem = findNavigationItem(tree, '@defer');
    expect(deferItem).toBeDefined();
  });

  it('should include HTML elements in the navigation tree', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({
        template: \`
        <div>
          <span>content</span>
        </div>
        \`,
        standalone: false,
      })
      export class AppCmp {
      }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    const tree = appFile.getNavigationTree();
    const divItem = findNavigationItem(tree, '<div>');
    expect(divItem).toBeDefined();
    const spanItem = findNavigationItem(divItem!, '<span>');
    expect(spanItem).toBeDefined();
  });

  it('should include control flow blocks for an external template', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './app.html',
          standalone: false,
        })
        export class AppCmp {
          condition = true;
        }`,
      'app.html': `
        @if (condition) {
          <div>content</div>
        }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.html');
    const tree = appFile.getNavigationTree();
    const ifItem = findNavigationItem(tree, '@if');
    expect(ifItem).toBeDefined();
  });

  it('should include nested control flow blocks', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({
        template: \`
        @if (showList) {
          @for (item of items; track $index) {
            <div>{{ item }}</div>
          }
        }
        \`,
        standalone: false,
      })
      export class AppCmp {
        showList = true;
        items: string[] = [];
      }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    const tree = appFile.getNavigationTree();
    const ifItem = findNavigationItem(tree, '@if');
    expect(ifItem).toBeDefined();
    const forItem = findNavigationItem(ifItem!, '@for');
    expect(forItem).toBeDefined();
  });
});

function findNavigationItem(tree: ts.NavigationTree, text: string): ts.NavigationTree | undefined {
  if (tree.text === text) {
    return tree;
  }
  if (tree.childItems) {
    for (const child of tree.childItems) {
      const found = findNavigationItem(child, text);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}
