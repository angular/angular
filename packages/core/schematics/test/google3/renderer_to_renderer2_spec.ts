/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import * as shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('Google3 Renderer to Renderer2 TSLint rule', () => {
  const rulesDirectory =
      dirname(require.resolve('../../migrations/google3/rendererToRenderer2Rule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('angular.d.ts', `
      export declare abstract class Renderer {}
      export declare function forwardRef(fn: () => any): any {}
    `);

    writeFile('tsconfig.json', JSON.stringify({
      compilerOptions: {
        module: 'es2015',
        baseUrl: './',
        paths: {
          '@angular/core': ['angular.d.ts'],
        }
      },
    }));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix: boolean) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({rules: {'renderer-to-renderer2': true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName)!.getFullText(), config);
    });

    return linter;
  }

  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  function getFile(fileName: string) {
    return readFileSync(join(tmpDir, fileName), 'utf8');
  }

  it('should flag Renderer imports and typed nodes', () => {
    writeFile('/index.ts', `
        import { Renderer, Component } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          public renderer: Renderer;

          constructor(renderer: Renderer) {
            this.renderer = renderer;
          }
        }
      `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());

    expect(failures.length).toBe(3);
    expect(failures[0]).toMatch(/Imports of deprecated Renderer are not allowed/);
    expect(failures[1]).toMatch(/References to deprecated Renderer are not allowed/);
    expect(failures[2]).toMatch(/References to deprecated Renderer are not allowed/);
  });

  it('should change Renderer imports and typed nodes to Renderer2', () => {
    writeFile('/index.ts', `
        import { Renderer, Component } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          public renderer: Renderer;

          constructor(renderer: Renderer) {
            this.renderer = renderer;
          }
        }
      `);

    runTSLint(true);
    const content = getFile('index.ts');

    expect(content).toContain(`import { Component, Renderer2 } from '@angular/core';`);
    expect(content).toContain('public renderer: Renderer2;');
    expect(content).toContain('(renderer: Renderer2)');
  });

  it('should not change Renderer imports if Renderer2 is already imported', () => {
    writeFile('/index.ts', `
        import { Renderer, Component, Renderer2 } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          public renderer: Renderer;

          constructor(renderer: Renderer) {
            this.renderer = renderer;
          }
        }
      `);

    runTSLint(true);
    const content = getFile('index.ts');

    expect(content).toContain(`import { Renderer, Component, Renderer2 } from '@angular/core';`);
  });

  it('should change Renderer inside single-line forwardRefs to Renderer2', () => {
    writeFile('/index.ts', `
      import { Renderer, Component, forwardRef, Inject } from '@angular/core';

      @Component({template: ''})
      export class MyComp {
        constructor(@Inject(forwardRef(() => Renderer)) private _renderer: Renderer) {}
      }
    `);

    runTSLint(true);
    const content = getFile('index.ts');

    expect(content).toContain(
        `constructor(@Inject(forwardRef(() => Renderer2)) private _renderer: Renderer2) {}`);
  });

  it('should change Renderer inside multi-line forwardRefs to Renderer2', () => {
    writeFile('/index.ts', `
      import { Renderer, Component, forwardRef, Inject } from '@angular/core';

      @Component({template: ''})
      export class MyComp {
        constructor(@Inject(forwardRef(() => { return Renderer; })) private _renderer: Renderer) {}
      }
    `);

    runTSLint(true);
    const content = getFile('index.ts');

    expect(content).toContain(
        `constructor(@Inject(forwardRef(() => { return Renderer2; })) private _renderer: Renderer2) {}`);
  });

  it('should flag something that was cast to Renderer', () => {
    writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          setColor(maybeRenderer: any, element: ElementRef) {
            const renderer = maybeRenderer as Renderer;
            renderer.setElementStyle(element.nativeElement, 'color', 'red');
          }
        }
      `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());

    expect(failures.length).toBe(3);
    expect(failures[0]).toMatch(/Imports of deprecated Renderer are not allowed/);
    expect(failures[1]).toMatch(/References to deprecated Renderer are not allowed/);
    expect(failures[2]).toMatch(/Calls to Renderer methods are not allowed/);
  });

  it('should change the type of something that was cast to Renderer', () => {
    writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          setColor(maybeRenderer: any, element: ElementRef) {
            const renderer = maybeRenderer as Renderer;
            renderer.setElementStyle(element.nativeElement, 'color', 'red');
          }
        }
      `);

    runTSLint(true);
    const content = getFile('index.ts');

    expect(content).toContain(`const renderer = maybeRenderer as Renderer2;`);
    expect(content).toContain(`renderer.setStyle(element.nativeElement, 'color', 'red');`);
  });

  it('should be able to insert helper functions', () => {
    writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(renderer: Renderer, element: ElementRef) {
            const el = renderer.createElement(element.nativeElement, 'div');
            renderer.setElementAttribute(el, 'title', 'hello');
            renderer.projectNodes(element.nativeElement, [el]);
          }
        }
      `);

    runTSLint(true);
    const content = getFile('index.ts');

    expect(content).toContain(`function __ngRendererCreateElementHelper(`);
    expect(content).toContain(`function __ngRendererSetElementAttributeHelper(`);
    expect(content).toContain(`function __ngRendererProjectNodesHelper(`);
  });

  it('should only insert each helper only once per file', () => {
    writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(renderer: Renderer, element: ElementRef) {
            const el = renderer.createElement(element.nativeElement, 'div');
            renderer.setElementAttribute(el, 'title', 'hello');

            const el1 = renderer.createElement(element.nativeElement, 'div');
            renderer.setElementAttribute(el2, 'title', 'hello');

            const el2 = renderer.createElement(element.nativeElement, 'div');
            renderer.setElementAttribute(el2, 'title', 'hello');
          }
        }
      `);

    runTSLint(true);
    const content = getFile('index.ts');

    expect(content.match(/function __ngRendererCreateElementHelper\(/g)!.length).toBe(1);
    expect(content.match(/function __ngRendererSetElementAttributeHelper\(/g)!.length).toBe(1);
  });

  it('should insert helpers after the user\'s code', () => {
    writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(renderer: Renderer, element: ElementRef) {
            const el = renderer.createElement(element.nativeElement, 'div');
            renderer.setElementAttribute(el, 'title', 'hello');
          }
        }

        //---
      `);

    runTSLint(true);
    const content = getFile('index.ts');
    const [contentBeforeSeparator, contentAfterSeparator] = content.split('//---');

    expect(contentBeforeSeparator).not.toContain('function __ngRendererCreateElementHelper(');
    expect(contentAfterSeparator).toContain('function __ngRendererCreateElementHelper(');
  });

  // Note that this is intended primarily as a sanity test. All of the replacement logic is the
  // same between the lint rule and the CLI migration so there's not much value in repeating and
  // maintaining the same tests twice. The migration's tests are more exhaustive.
  it('should flag calls to Renderer methods', () => {
    writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _renderer: Renderer, private _element: ElementRef) {
            const span = _renderer.createElement(_element.nativeElement, 'span');
            const greeting = _renderer.createText(_element.nativeElement, 'hello');
            const color = 'red';

            _renderer.setElementProperty(_element.nativeElement, 'disabled', true);
            _renderer.listenGlobal('window', 'resize', () => console.log('resized'));
            _renderer.setElementAttribute(_element.nativeElement, 'title', 'hello');
            _renderer.createViewRoot(_element.nativeElement);
            _renderer.animate(_element.nativeElement);
            _renderer.detachView([]);
            _renderer.destroyView(_element.nativeElement, []);
            _renderer.invokeElementMethod(_element.nativeElement, 'focus', []);
            _renderer.setElementStyle(_element.nativeElement, 'color', color);
            _renderer.setText(_element.nativeElement.querySelector('span'), 'Hello');
          }

          getRootElement() {
            return this._renderer.selectRootElement(this._element.nativeElement, {});
          }

          toggleClass(className: string, shouldAdd: boolean) {
            this._renderer.setElementClass(this._element.nativeElement, className, shouldAdd);
          }

          setInfo() {
            this._renderer.setBindingDebugInfo(this._element.nativeElement, 'prop', 'value');
          }

          createAndAppendAnchor() {
            return this._renderer.createTemplateAnchor(this._element.nativeElement);
          }

          attachViewAfter(rootNodes) {
            this._renderer.attachViewAfter(this._element.nativeElement, rootNodes);
          }

          projectNodes(nodesToProject: Node[]) {
            this._renderer.projectNodes(this._element.nativeElement, nodesToProject);
          }
        }
      `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());

    // One failure for the import, one for the constructor param, one at the end that is used as
    // an anchor for inserting helper functions and the rest are for method calls.
    expect(failures.length).toBe(21);
    expect(failures[0]).toMatch(/Imports of deprecated Renderer are not allowed/);
    expect(failures[1]).toMatch(/References to deprecated Renderer are not allowed/);
    expect(failures[failures.length - 1]).toMatch(/File should contain Renderer helper functions/);
    expect(failures.slice(2, -1).every(message => {
      return /Calls to Renderer methods are not allowed/.test(message);
    })).toBe(true);
  });

  // Note that this is intended primarily as a sanity test. All of the replacement logic is the
  // same between the lint rule and the CLI migration so there's not much value in repeating and
  // maintaining the same tests twice. The migration's tests are more exhaustive.
  it('should fix calls to Renderer methods', () => {
    writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _renderer: Renderer, private _element: ElementRef) {
            const span = _renderer.createElement(_element.nativeElement, 'span');
            const greeting = _renderer.createText(_element.nativeElement, 'hello');
            const color = 'red';

            _renderer.setElementProperty(_element.nativeElement, 'disabled', true);
            _renderer.listenGlobal('window', 'resize', () => console.log('resized'));
            _renderer.setElementAttribute(_element.nativeElement, 'title', 'hello');
            _renderer.animate(_element.nativeElement);
            _renderer.detachView([]);
            _renderer.destroyView(_element.nativeElement, []);
            _renderer.invokeElementMethod(_element.nativeElement, 'focus', []);
            _renderer.setElementStyle(_element.nativeElement, 'color', color);
            _renderer.setText(_element.nativeElement.querySelector('span'), 'Hello');
          }

          createRoot() {
            return this._renderer.createViewRoot(this._element.nativeElement);
          }

          getRootElement() {
            return this._renderer.selectRootElement(this._element.nativeElement, {});
          }

          toggleClass(className: string, shouldAdd: boolean) {
            this._renderer.setElementClass(this._element.nativeElement, className, shouldAdd);
          }

          setInfo() {
            this._renderer.setBindingDebugInfo(this._element.nativeElement, 'prop', 'value');
          }

          createAndAppendAnchor() {
            return this._renderer.createTemplateAnchor(this._element.nativeElement);
          }

          attachViewAfter(rootNodes: Node[]) {
            this._renderer.attachViewAfter(this._element.nativeElement, rootNodes);
          }

          projectNodes(nodesToProject: Node[]) {
            this._renderer.projectNodes(this._element.nativeElement, nodesToProject);
          }
        }
      `);

    runTSLint(true);
    const content = getFile('index.ts');

    expect(content).toContain(
        `const span = __ngRendererCreateElementHelper(_renderer, _element.nativeElement, 'span');`);
    expect(content).toContain(
        `const greeting = __ngRendererCreateTextHelper(_renderer, _element.nativeElement, 'hello');`);
    expect(content).toContain(`_renderer.setProperty(_element.nativeElement, 'disabled', true);`);
    expect(content).toContain(
        `_renderer.listen('window', 'resize', () => console.log('resized'));`);
    expect(content).toContain(
        `__ngRendererSetElementAttributeHelper(_renderer, _element.nativeElement, 'title', 'hello');`);
    expect(content).toContain('__ngRendererAnimateHelper();');
    expect(content).toContain('__ngRendererDetachViewHelper(_renderer, []);');
    expect(content).toContain('__ngRendererDestroyViewHelper(_renderer, []);');
    expect(content).toContain(`_element.nativeElement.focus()`);
    expect(content).toContain(
        `color == null ? _renderer.removeStyle(_element.nativeElement, 'color') : ` +
        `_renderer.setStyle(_element.nativeElement, 'color', color);`);
    expect(content).toContain(
        `_renderer.setValue(_element.nativeElement.querySelector('span'), 'Hello')`);
    expect(content).toContain(
        `return this._renderer.selectRootElement(this._element.nativeElement);`);
    expect(content).toContain(
        `shouldAdd ? this._renderer.addClass(this._element.nativeElement, className) : ` +
        `this._renderer.removeClass(this._element.nativeElement, className);`);
    expect(content).toContain(
        `return __ngRendererCreateTemplateAnchorHelper(this._renderer, this._element.nativeElement);`);
    expect(content).toContain(
        `__ngRendererAttachViewAfterHelper(this._renderer, this._element.nativeElement, rootNodes);`);
    expect(content).toContain(
        `__ngRendererProjectNodesHelper(this._renderer, this._element.nativeElement, nodesToProject);`);

    // Expect the `createRoot` only to return `this._element.nativeElement`.
    expect(content).toMatch(/createRoot\(\) \{\s+return this\._element\.nativeElement;\s+\}/);

    // Expect the `setInfo` method to only contain whitespace.
    expect(content).toMatch(/setInfo\(\) \{\s+\}/);
  });
});
