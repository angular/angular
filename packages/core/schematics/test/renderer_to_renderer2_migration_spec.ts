/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import * as shx from 'shelljs';

describe('Renderer to Renderer2 migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
      }
    }));
    writeFile('/angular.json', JSON.stringify({
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));
    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/core/index.d.ts', `
      export declare abstract class Renderer {}
    `);

    previousWorkingDir = shx.pwd();
    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDirPath);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  describe('import renaming', () => {
    it('should change Renderer imports to Renderer2', async() => {
      writeFile('/index.ts', `
          import { Renderer, Component } from '@angular/core';

          @Component({template: ''})
          export class MyComp {
            constructor(renderer: Renderer) {}
          }
        `);

      await runMigration();
      expect(tree.readContent('/index.ts'))
          .toContain(`import { Component, Renderer2 } from '@angular/core';`);
    });

    it('should change aliased Renderer imports to Renderer2', async() => {
      writeFile('/index.ts', `
          import { Renderer as RenamedRenderer, Component } from '@angular/core';

          @Component({template: ''})
          export class MyComp {
            constructor(renderer: RenamedRenderer) {}
          }
        `);

      await runMigration();
      expect(tree.readContent('/index.ts'))
          .toContain(`import { Component, Renderer2 as RenamedRenderer } from '@angular/core';`);
    });

    it('should not change Renderer imports if they are not from @angular/core', async() => {
      writeFile('/index.ts', `
          import { Component } from '@angular/core';
          import { Renderer } from './my-renderer';

          @Component({template: ''})
          export class MyComp {
            constructor(renderer: Renderer) {}
          }
        `);

      await runMigration();
      const content = tree.readContent('/index.ts');

      expect(content).toContain(`import { Component } from '@angular/core';`);
      expect(content).toContain(`import { Renderer } from './my-renderer';`);
    });
  });

  describe('type renaming', () => {
    it('should change type of constructor parameter from Renderer to Renderer2', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(element: ElementRef, renderer: Renderer) {}
        }
      `);

      await runMigration();
      expect(tree.readContent('/index.ts'))
          .toContain('constructor(element: ElementRef, renderer: Renderer2)');
    });

    it('should change type of method parameter from Renderer to Renderer2', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          disable(renderer: Renderer, element: HTMLElement, isDisabled: boolean) {
            renderer.setElementProperty(element, 'disabled', isDisabled);
          }
        }
      `);

      await runMigration();
      expect(tree.readContent('/index.ts'))
          .toContain('disable(renderer: Renderer2, element: HTMLElement, isDisabled: boolean)');
    });

    it('should change type of property declarations', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          public renderer: Renderer;
        }
      `);

      await runMigration();
      expect(tree.readContent('/index.ts')).toContain('public renderer: Renderer2;');
    });

    it('should change type of properties initialized via the constructor', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(element: ElementRef, private _renderer: Renderer) {}
        }
      `);

      await runMigration();
      expect(tree.readContent('/index.ts'))
          .toContain('constructor(element: ElementRef, private _renderer: Renderer2)');
    });

    it('should change the type of something that was cast to Renderer', async() => {
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

      await runMigration();

      const content = tree.readContent('/index.ts');

      expect(content).toContain(`const renderer = maybeRenderer as Renderer2;`);
      expect(content).toContain(`renderer.setStyle(element.nativeElement, 'color', 'red');`);
    });
  });

  describe('helper insertion', () => {
    it('should only declare declare each helper once per file', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {
            _renderer.createElement(_element.nativeElement, 'span');
            _renderer.createElement(_element.nativeElement, 'button');
            _renderer.createElement(_element.nativeElement, 'div');
          }
        }
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');

      expect(content.match(/function __rendererCreateElementHelper\(/g) !.length)
          .toBe(1, 'Expected exactly one helper for createElement.');
    });

    it('should be able to handle multiple helpers per file', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {
            _renderer.createText(_element.nativeElement, 'hello');
            _renderer.createText(_element.nativeElement, 'there');
            _renderer.createText(_element.nativeElement, '!');
          }

          createElements(parent: HTMLElement) {
            this._renderer.createElement(parent, 'span');
            this._renderer.createElement(parent, 'button');
          }

          createAnchor() {
            this._renderer.createTemplateAnchor(this._element.nativeElement);
          }
        }
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');

      expect(content.match(/function __rendererCreateTextHelper\(/g) !.length)
          .toBe(1, 'Expected exactly one helper for createElement.');
      expect(content.match(/function __rendererCreateElementHelper\(/g) !.length)
          .toBe(1, 'Expected exactly one helper for createText.');
      expect(content.match(/function __rendererCreateTemplateAnchorHelper\(/g) !.length)
          .toBe(1, 'Expected exactly one helper for createTemplateAnchor.');
    });

    it('should create the __rendererSplitNamespaceHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(element: ElementRef, renderer: Renderer) {
            renderer.createElement(element.nativeElement, 'span');
          }
        }
      `);

      await runMigration();

      expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
        function __rendererSplitNamespaceHelper(name: any) {
          if (name[0] === ":") {
            const match = name.match(/^:([^:]+):(.+)$/);
            return [match[1], match[2]];
          }
          return ["", name];
        }
      `));
    });

  });

  describe('setElementProperty migration', () => {
    it('should migrate setElementProperty calls', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          disable() {
            this._renderer.setElementProperty(this._element.nativeElement, 'disabled', true);
          }
        }
      `);

      await runMigration();
      expect(tree.readContent('/index.ts'))
          .toContain(`this._renderer.setProperty(this._element.nativeElement, 'disabled', true);`);
    });
  });

  describe('setText migration', () => {
    it('should migrate setText calls', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: '<span></span>'})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          sayHello() {
            this._renderer.setText(this._element.nativeElement.querySelector('span'), 'Hello');
          }
        }
      `);

      await runMigration();
      expect(tree.readContent('/index.ts'))
          .toContain(
              `this._renderer.setValue(this._element.nativeElement.querySelector('span'), 'Hello');`);
    });
  });

  describe('listenGlobal migration', () => {
    it('should migrate listenGlobal calls', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component } from '@angular/core';

        @Component({template: '<span></span>'})
        export class MyComp {
          constructor(private _renderer: Renderer) {}

          listenToResize() {
            this._renderer.listenGlobal('window', 'resize', () => console.log('resized'));
          }
        }
      `);

      await runMigration();
      expect(tree.readContent('/index.ts'))
          .toContain(`this._renderer.listen('window', 'resize', () => console.log('resized'));`);
    });
  });

  describe('selectRootElement migration', () => {
    it('should migrate selectRootElement calls', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          getRootElement() {
            return this._renderer.selectRootElement(this._element.nativeElement, {});
          }
        }
      `);

      await runMigration();
      expect(tree.readContent('/index.ts'))
          .toContain(`return this._renderer.selectRootElement(this._element.nativeElement);`);
    });
  });

  describe('setElementClass migration', () => {
    it('should migrate calls with inline isAdd value', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          addClass(className: string) {
            this._renderer.setElementClass(this._element.nativeElement, className, true);
          }

          removeClass(className: string) {
            this._renderer.setElementClass(this._element.nativeElement, className, false);
          }
        }
      `);

      await runMigration();
      expect(tree.readContent('/index.ts'))
          .toContain(`this._renderer.addClass(this._element.nativeElement, className);`);
      expect(tree.readContent('/index.ts'))
          .toContain(`this._renderer.removeClass(this._element.nativeElement, className);`);
    });

    it('should migrate calls with variable isAdd value', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          toggleClass(className: string, shouldAdd: boolean) {
            this._renderer.setElementClass(this._element.nativeElement, className, shouldAdd);
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(
              `shouldAdd ? this._renderer.addClass(this._element.nativeElement, className) : ` +
              `this._renderer.removeClass(this._element.nativeElement, className);`);
    });
  });

  describe('setElementStyle migration', () => {
    it('should migrate calls with two arguments to a removeStyle call', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          removeColor() {
            this._renderer.setElementStyle(this._element.nativeElement, 'color');
          }
        }
      `);

      await runMigration();
      expect(tree.readContent('/index.ts'))
          .toContain(`this._renderer.removeStyle(this._element.nativeElement, 'color');`);
    });

    it('should migrate calls with static third arguments to a setStyle call', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          setStyles() {
            this._renderer.setElementStyle(this._element.nativeElement, 'color', 'red');
            this._renderer.setElementStyle(this._element.nativeElement, 'background-color', \`blue\`);
            this._renderer.setElementStyle(this._element.nativeElement, 'width', 3);
          }
        }
      `);

      await runMigration();
      expect(tree.readContent('/index.ts'))
          .toContain(`this._renderer.setStyle(this._element.nativeElement, 'color', 'red');`);
      expect(tree.readContent('/index.ts'))
          .toContain(
              `this._renderer.setStyle(this._element.nativeElement, 'background-color', \`blue\`);`);
      expect(tree.readContent('/index.ts'))
          .toContain(`this._renderer.setStyle(this._element.nativeElement, 'width', 3);`);
    });

    it('should migrate calls with null or undefined value for last argument to a removeStyle call',
       async() => {
         writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          removeColors() {
            this._renderer.setElementStyle(this._element.nativeElement, 'color', null);
            this._renderer.setElementStyle(this._element.nativeElement, 'background-color', undefined);
          }
        }
      `);

         await runMigration();
         expect(tree.readContent('/index.ts'))
             .toContain(`this._renderer.removeStyle(this._element.nativeElement, 'color');`);
         expect(tree.readContent('/index.ts'))
             .toContain(
                 `this._renderer.removeStyle(this._element.nativeElement, 'background-color');`);
       });

    it('should migrate calls with a variable third argument', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          setColor(value: string | null) {
            this._renderer.setElementStyle(this._element.nativeElement, 'color', value);
          }
        }
      `);

      await runMigration();
      expect(tree.readContent('/index.ts'))
          .toContain(
              `value == null ? this._renderer.removeStyle(this._element.nativeElement, 'color') : ` +
              `this._renderer.setStyle(this._element.nativeElement, 'color', value);`);
    });
  });

  describe('setElementAttribute migration', () => {
    it('should migrate to calls to the __rendererSetElementAttributeHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {
            _renderer.setElementAttribute(_element.nativeElement, 'title', 'hello');
          }

          removeAttribute(name: string) {
            this._renderer.setElementAttribute(this._element.nativeElement, name);
          }
        }
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');

      expect(content).toContain(
          `__rendererSetElementAttributeHelper(_renderer, _element.nativeElement, 'title', 'hello');`);
      expect(content).toContain(
          '__rendererSetElementAttributeHelper(this._renderer, this._element.nativeElement, name);');
    });

    it('should declare the __rendererSetElementAttributeHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(element: ElementRef, renderer: Renderer) {
            renderer.setElementAttribute(element.nativeElement, 'foo', 'bar');
          }
        }
      `);

      await runMigration();

      const content = stripWhitespace(tree.readContent('/index.ts'));

      expect(content).toContain(stripWhitespace(`
        function __rendererSetElementAttributeHelper(renderer: any, element: any, namespaceAndName: any, value?: any) {
          const [namespace, name] = __rendererSplitNamespaceHelper(namespaceAndName);
          if (value != null) {
            renderer.setAttribute(element, name, value, namespace);
          } else {
            renderer.removeAttribute(element, name, namespace);
          }
        }
      `));

      expect(content).toContain(stripWhitespace('function __rendererSplitNamespaceHelper('));
    });

  });

  describe('invokeElementMethod migration', () => {
    it('should migrate calls to a direct method call if the method name and arguments are static',
       async() => {
         writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          focus() {
            this._renderer.invokeElementMethod(this._element.nativeElement, 'focus', []);
            this._renderer.invokeElementMethod(this._element.nativeElement, 'focusEvenMore');
            this._renderer.invokeElementMethod(this._element.nativeElement, 'doSomething', [1, true, 'three']);
          }
        }
      `);

         await runMigration();
         const content = tree.readContent('/index.ts');
         expect(content).not.toContain('this._renderer');
         expect(content).toContain(`this._element.nativeElement.focus()`);
         expect(content).toContain(`this._element.nativeElement.focusEvenMore()`);
         expect(content).toContain(`this._element.nativeElement.doSomething(1, true, 'three')`);
       });

    it('should migrate calls to a property access if the method name or arguments are dynamic',
       async() => {
         writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          callMethod(name: string, args: any[]) {
            this._renderer.invokeElementMethod(this._element.nativeElement, name, [1, true]);
          }

          callOtherMethod(args: any[]) {
            this._renderer.invokeElementMethod(this._element.nativeElement, 'otherMethod', args);
          }
        }
      `);

         await runMigration();
         const content = tree.readContent('/index.ts');
         expect(content).not.toContain('this._renderer');
         expect(content).toContain(
             `(this._element.nativeElement as any)[name].apply(this._element.nativeElement, [1, true]);`);

         expect(content).toContain(
             `(this._element.nativeElement as any)['otherMethod'].apply(this._element.nativeElement, args);`);
       });

    it('should handle calls without an `args` array', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          callMethod(name: string) {
            this._renderer.invokeElementMethod(this._element.nativeElement, name);
          }
        }
      `);

      await runMigration();
      const content = tree.readContent('/index.ts');
      expect(content).not.toContain('this._renderer');
      expect(content).toContain(
          `(this._element.nativeElement as any)[name].apply(this._element.nativeElement);`);
    });
  });

  describe('setBindingDebugInfo migration', () => {
    it('should drop calls to setBindingDebugInfo', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          setInfo() {
            this._renderer.setBindingDebugInfo(this._element.nativeElement, 'prop', 'value');
          }
        }
      `);

      await runMigration();

      // Expect the `setInfo` method to only contain whitespace.
      expect(tree.readContent('/index.ts')).toMatch(/setInfo\(\) \{\s+\}/);
    });
  });

  describe('createViewRoot migration', () => {
    it('should replace createViewRoot calls with a reference to the first argument', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {}

          createRoot() {
            return this._renderer.createViewRoot(this._element.nativeElement);
          }
        }
      `);

      await runMigration();

      // Expect the `createRoot` only to return `this._element.nativeElement`.
      expect(tree.readContent('/index.ts'))
          .toMatch(/createRoot\(\) \{\s+return this\._element\.nativeElement;\s+\}/);
    });
  });

  describe('createElement migration', () => {
    it('should migrate to calls to the __rendererCreateElementHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {
            const message = _renderer.createElement(_element.nativeElement, 'span', {});
            message.textContent = 'hello';
          }

          createAndAppendElement(nodeName: string) {
            return this._renderer.createElement(this._element.nativeElement, nodeName);
          }
        }
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');

      expect(content).toContain(
          `const message = __rendererCreateElementHelper(_renderer, _element.nativeElement, 'span');`);
      expect(content).toContain(
          'return __rendererCreateElementHelper(this._renderer, this._element.nativeElement, nodeName);');
    });

    it('should declare the __rendererCreateElementHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(element: ElementRef, renderer: Renderer) {
            renderer.createElement(element.nativeElement, 'span');
          }
        }
      `);

      await runMigration();

      const content = stripWhitespace(tree.readContent('/index.ts'));

      expect(content).toContain(stripWhitespace(`
        function __rendererCreateElementHelper(renderer: any, parent: any, namespaceAndName: any) {
          const [namespace, name] = __rendererSplitNamespaceHelper(namespaceAndName);
          const node = renderer.createElement(name, namespace);
          if (parent) {
            renderer.appendChild(parent, node);
          }
          return node;
        }
      `));

      expect(content).toContain(stripWhitespace('function __rendererSplitNamespaceHelper('));
    });

  });

  describe('createText migration', () => {
    it('should migrate to calls to the __rendererCreateTextHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {
            const message = _renderer.createText(_element.nativeElement, 'hello', {});
            message.textContent += ' world';
          }

          createAndAppendText(value: string) {
            return this._renderer.createText(this._element.nativeElement, value);
          }
        }
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');

      expect(content).toContain(
          `const message = __rendererCreateTextHelper(_renderer, _element.nativeElement, 'hello');`);
      expect(content).toContain(
          'return __rendererCreateTextHelper(this._renderer, this._element.nativeElement, value);');
    });

    it('should declare the __rendererCreateTextHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(element: ElementRef, renderer: Renderer) {
            renderer.createText(element.nativeElement, 'hi');
          }
        }
      `);

      await runMigration();

      expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
        function __rendererCreateTextHelper(renderer: any, parent: any, value: any) {
          const node = renderer.createText(value);
          if (parent) {
            renderer.appendChild(parent, node);
          }
          return node;
        }
      `));
    });

  });

  describe('createTemplateAnchor migration', () => {
    it('should migrate to calls to the __rendererCreateTemplateAnchorHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {
            console.log(_renderer.createTemplateAnchor(_element.nativeElement));
          }

          createAndAppendAnchor() {
            return this._renderer.createTemplateAnchor(this._element.nativeElement);
          }
        }
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');

      expect(content).toContain(
          `console.log(__rendererCreateTemplateAnchorHelper(_renderer, _element.nativeElement));`);
      expect(content).toContain(
          'return __rendererCreateTemplateAnchorHelper(this._renderer, this._element.nativeElement);');
    });

    it('should declare the __rendererCreateTemplateAnchorHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(element: ElementRef, renderer: Renderer) {
            renderer.createTemplateAnchor(element.nativeElement);
          }
        }
      `);

      await runMigration();

      expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
        function __rendererCreateTemplateAnchorHelper(renderer: any, parent: any) {
          const node = renderer.createComment("");
          if (parent) {
            renderer.appendChild(parent, node);
          }
          return node;
        }
      `));
    });

  });

  describe('projectNodes migration', () => {
    it('should migrate to calls to the __rendererProjectNodesHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {
          }

          projectNodes(nodesToProject: Node[]) {
            this._renderer.projectNodes(this._element.nativeElement, nodesToProject);
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(
              '__rendererProjectNodesHelper(this._renderer, this._element.nativeElement, nodesToProject);');
    });

    it('should declare the __rendererProjectNodesHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(element: ElementRef, renderer: Renderer) {
            renderer.projectNodes(element.nativeElement, []);
          }
        }
      `);

      await runMigration();

      expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
        function __rendererProjectNodesHelper(renderer: any, parent: any, nodes: any) {
          for (let i = 0; i < nodes.length; i++) {
            renderer.appendChild(parent, nodes[i]);
          }
        }
      `));
    });

  });

  describe('animate migration', () => {
    it('should migrate to calls to the __rendererAnimateHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {
          }

          animate() {
            this._renderer.animate(this._element.nativeElement);
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts')).toContain('__rendererAnimateHelper();');
    });

    it('should declare the __rendererAnimateHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(element: ElementRef, renderer: Renderer) {
            renderer.animate(element.nativeElement);
          }
        }
      `);

      await runMigration();

      expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
        function __rendererAnimateHelper() {
          throw new Error("Renderer.animate is no longer supported!");
        }
      `));
    });

  });

  describe('destroyView migration', () => {
    it('should migrate to calls to the __rendererDestroyViewHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {
          }

          destroyView(allNodes: Node[]) {
            this._renderer.destroyView(this._element.nativeElement, allNodes);
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain('__rendererDestroyViewHelper(this._renderer, allNodes);');
    });

    it('should declare the __rendererDestroyViewHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {
          }

          destroyView(allNodes: Node[]) {
            this._renderer.destroyView(this._element.nativeElement, allNodes);
          }
        }
      `);

      await runMigration();

      expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
        function __rendererDestroyViewHelper(renderer: any, allNodes: any) {
          for (let i = 0; i < allNodes.length; i++) {
            renderer.destroyNode(allNodes[i]);
          }
        }
      `));
    });
  });

  describe('detachView migration', () => {
    it('should migrate to calls to the __rendererDetachViewHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _renderer: Renderer) {
          }

          detachView(rootNodes: Node[]) {
            this._renderer.detachView(rootNodes);
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain('__rendererDetachViewHelper(this._renderer, rootNodes);');
    });

    it('should declare the __rendererDetachViewHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _renderer: Renderer) {
          }

          detachView(rootNodes: Node[]) {
            this._renderer.detachView(rootNodes);
          }
        }
      `);

      await runMigration();

      expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
        function __rendererDetachViewHelper(renderer: any, rootNodes: any) {
          for (let i = 0; i < rootNodes.length; i++) {
            const node = rootNodes[i];
            renderer.removeChild(renderer.parentNode(node), node);
          }
        }
      `));
    });
  });

  describe('attachViewAfter migration', () => {
    it('should migrate to calls to the __rendererAttachViewAfterHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component, ElementRef } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _element: ElementRef, private _renderer: Renderer) {
          }

          attachViewAfter(rootNodes: Node[]) {
            this._renderer.attachViewAfter(this._element.nativeElement, rootNodes);
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(
              '__rendererAttachViewAfterHelper(this._renderer, this._element.nativeElement, rootNodes);');
    });

    it('should declare the __rendererAttachViewAfterHelper', async() => {
      writeFile('/index.ts', `
        import { Renderer, Component } from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          constructor(private _renderer: Renderer) {
          }

          attachViewAfter(node: Node, rootNodes: Node[]) {
            this._renderer.attachViewAfter(node, rootNodes);
          }
        }
      `);

      await runMigration();

      expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
        function __rendererAttachViewAfterHelper(renderer: any, node: any, rootNodes: any) {
          const parent = renderer.parentNode(node);
          const nextSibling = renderer.nextSibling(node);
          for (let i = 0; i < rootNodes.length; i++) {
            renderer.insertBefore(parent, rootNodes[i], nextSibling);
          }
        }
      `));
    });
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v9-renderer-to-renderer2', {}, tree).toPromise();
  }

  function stripWhitespace(contents: string) { return contents.replace(/\s/g, ''); }
});
