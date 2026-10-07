/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {join} from 'path';
import {
  IdentifierKind,
  ElementIdentifier,
  ReferenceIdentifier,
  VariableIdentifier,
  PropertyIdentifier,
  DirectiveHostIdentifier,
  TopLevelIdentifier,
  BoundAttributeIdentifier,
  IndexedComponent,
  PipeIdentifier,
} from '../src/indexer_api.js';
import {HybridCompiler} from '../src/hybrid_compiler.js';
import {buildTypeCheckingConfig} from '../src/tcb.js';
import {IndexerVisitor} from '@angular/compiler';
import {getIndexedComponents, IndexerBoundTemplate} from '../src/indexing/indexer.js';
import {createAnalyzer} from '../api.js';
import {resolveWasmBinding} from './utils.js';

async function setupCompiler(content: string, options?: {strictTemplates?: boolean}) {
  const projectRoot = process.cwd();
  const filePath = join(projectRoot, 'test.ts');
  const tsconfigPath = join(projectRoot, 'tsconfig.json');
  const nodeModulesPath = join(projectRoot, 'node_modules');

  const virtualFiles = {
    [filePath]: content,
    [tsconfigPath]: JSON.stringify({
      files: [filePath],
    }),
  };

  const wasmBinding = resolveWasmBinding();
  const analyzer = await createAnalyzer(tsconfigPath, {
    virtualFiles,
    optimize: true,
    backend: 'wasm',
    wasmBinding,
    nodeModulesPathOverride: nodeModulesPath,
  });

  const compiler = new HybridCompiler(analyzer, {
    optimize: true,
    tcbConfig: buildTypeCheckingConfig({strictTemplates: options?.strictTemplates ?? false}),
  });

  return {compiler, filePath};
}

async function setupMultiFileCompiler(
  files: Record<string, string>,
  options?: {strictTemplates?: boolean; enableSelectorless?: boolean},
) {
  const projectRoot = process.cwd();
  const tsconfigPath = join(projectRoot, 'tsconfig.json');
  const nodeModulesPath = join(projectRoot, 'node_modules');

  const virtualFiles: Record<string, string> = {};
  const filePaths: string[] = [];
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = join(projectRoot, relativePath);
    virtualFiles[fullPath] = content;
    filePaths.push(fullPath);
  }

  virtualFiles[tsconfigPath] = JSON.stringify({
    files: filePaths,
  });

  const wasmBinding = resolveWasmBinding();
  const analyzer = await createAnalyzer(tsconfigPath, {
    virtualFiles,
    optimize: true,
    backend: 'wasm',
    wasmBinding,
    nodeModulesPathOverride: nodeModulesPath,
  });

  const compiler = new HybridCompiler(analyzer, {
    optimize: true,
    tcbConfig: buildTypeCheckingConfig({strictTemplates: options?.strictTemplates ?? false}),
    templateParseOptions: {enableSelectorless: options?.enableSelectorless ?? false},
  });

  return {compiler, filePaths, projectRoot};
}

async function getIndexedComponent(
  compiler: HybridCompiler,
  name = 'TestComp',
): Promise<IndexedComponent> {
  const indexed = await compiler.getIndexedComponents();
  expect(indexed.size).toBe(1);
  const comp = indexed.get(name);
  expect(comp).toBeDefined();
  expect(comp!.errors.length).toBe(0);
  return comp!;
}

async function getIndexedComponentByName(
  compiler: HybridCompiler,
  name: string,
): Promise<IndexedComponent> {
  const indexed = await compiler.getIndexedComponents();
  const comp = indexed.get(name);
  expect(comp).toBeDefined();
  expect(comp!.errors.length).toBe(0);
  return comp!;
}

function getIdentifier<T extends TopLevelIdentifier = TopLevelIdentifier>(
  comp: IndexedComponent,
  kind: IdentifierKind,
  name: string,
): T {
  const identifiers = Array.from(comp.template.identifiers);
  const found = identifiers.find((id) => id.kind === kind && id.name === name);
  expect(found).toBeDefined();
  return found as T;
}

function getIdentifiers<T extends TopLevelIdentifier = TopLevelIdentifier>(
  comp: IndexedComponent,
  kind: IdentifierKind,
  name: string,
): T[] {
  const identifiers = Array.from(comp.template.identifiers);
  return identifiers.filter((id) => id.kind === kind && id.name === name) as T[];
}

describe('Indexer', () => {
  it('should index component properties', async () => {
    const {compiler} = await setupCompiler(`
      import {Component} from '@angular/core';
      @Component({
        selector: 'test-comp',
        template: '{{ foo }}',
      })
      export class TestComp {
        foo = 'bar';
        bar() {}
      }
    `);

    const comp = await getIndexedComponent(compiler);
    expect(comp.name).toBe('TestComp');
    expect(comp.template.identifiers.size).toBe(1);

    const id = getIdentifier(comp, IdentifierKind.Property, 'foo');
    expect(id.name).toBe('foo');
    expect(id.kind).toBe(IdentifierKind.Property);
  });

  it('should index attributes, directives, references, and variables with bound targets', async () => {
    const {compiler, filePath} = await setupCompiler(
      `
      import {Component, Directive} from '@angular/core';

      @Directive({
        selector: '[myDir]',
        exportAs: 'myDir',
      })
      export class MyDir {}

      @Component({
        selector: 'test-comp',
        template: '<div myDir #myRef="myDir"></div><span *ngFor="let item of items">{{item}}</span>',
        imports: [MyDir]
      })
      export class TestComp {
        items = [1, 2];
      }
    `,
      {strictTemplates: true},
    );

    const comp = await getIndexedComponent(compiler);

    // Check Element and its usedDirectives / attributes
    const div = getIdentifier<ElementIdentifier>(comp, IdentifierKind.Element, 'div');
    expect(div.attributes.size).toBeGreaterThan(0);
    expect(div.usedDirectives.size).toBeGreaterThan(0);
    for (const usedDir of div.usedDirectives) {
      expect(usedDir.node).toBeDefined();
      expect(usedDir.node.name).toBe('MyDir');
      expect(usedDir.node.filePath.toLowerCase()).toBe(filePath.toLowerCase());
    }

    // Check Reference
    const ref = getIdentifier<ReferenceIdentifier>(comp, IdentifierKind.Reference, 'myRef');
    expect(ref.target).toBeDefined();
    expect(ref.target?.node).toBeDefined();
    expect(ref.target?.directive).toBeDefined();
    expect(ref.target?.directive?.name).toBe('MyDir');
    expect(ref.target?.directive?.filePath.toLowerCase()).toBe(filePath.toLowerCase());

    // Check Variable
    getIdentifier<VariableIdentifier>(comp, IdentifierKind.Variable, 'item');

    // Check Property Read targeting Variable
    const prop = getIdentifier<PropertyIdentifier>(comp, IdentifierKind.Property, 'item');
    expect(prop.target).toBeDefined();
    expect(prop.target?.kind).toBe(IdentifierKind.Variable);
  });

  it('should support calling the standalone getIndexedComponents function with a compiler context', async () => {
    const {compiler} = await setupCompiler(`
      import {Component} from '@angular/core';
      @Component({
        selector: 'test-comp',
        template: '{{ foo }}',
      })
      export class TestComp {
        foo = 'bar';
      }
    `);

    await compiler.getIndexedComponents();
    const indexed = await getIndexedComponents(compiler);
    expect(indexed.size).toBe(1);
  });

  it('should index @let declarations and their references', async () => {
    const {compiler} = await setupCompiler(`
      import {Component} from '@angular/core';
      @Component({
        selector: 'test-comp',
        template: '@let myLet = foo; {{ myLet }}',
      })
      export class TestComp {
        foo = 'bar';
      }
    `);

    const comp = await getIndexedComponent(compiler);

    // Check for Let Declaration identifier
    getIdentifier(comp, IdentifierKind.LetDeclaration, 'myLet');

    // Check for Property Read targeting the Let Declaration
    const propertyRead = getIdentifier<PropertyIdentifier>(comp, IdentifierKind.Property, 'myLet');
    expect(propertyRead.target).toBeDefined();
    expect(propertyRead.target?.kind).toBe(IdentifierKind.LetDeclaration);
  });

  it('should index properties with safe navigation reads obj?.prop', async () => {
    const {compiler} = await setupCompiler(`
      import {Component} from '@angular/core';
      @Component({
        selector: 'test-comp',
        template: '{{ obj?.prop }}',
      })
      export class TestComp {
        obj = { prop: 'val' };
      }
    `);

    const comp = await getIndexedComponent(compiler);
    getIdentifier(comp, IdentifierKind.Property, 'obj');
  });

  it('should index references targeting standard HTML elements directly and map to ElementIdentifier', async () => {
    const {compiler} = await setupCompiler(`
      import {Component} from '@angular/core';
      @Component({
        selector: 'test-comp',
        template: '<div #myRef></div>',
      })
      export class TestComp {}
    `);

    const comp = await getIndexedComponent(compiler);

    getIdentifier<ElementIdentifier>(comp, IdentifierKind.Element, 'div');

    const ref = getIdentifier<ReferenceIdentifier>(comp, IdentifierKind.Reference, 'myRef');
    expect(ref.target).toBeDefined();
    expect(ref.target?.node).toBeDefined();
    expect(ref.target?.node.name).toBe('div');
    expect(ref.target?.node.kind).toBe(IdentifierKind.Element);
    expect(ref.target?.directive).toBeNull();
  });

  it('should populate error properties when encountering malformed template AST or getStartLocation failures', async () => {
    const visitor = new IndexerVisitor(new IndexerBoundTemplate());
    visitor.visitVariable({
      name: 'nonexistent',
      sourceSpan: {
        toString: () => 'something else',
        start: {offset: 0},
      },
    } as any);

    expect(visitor.errors.length).toBe(1);
    expect(visitor.errors[0].message).toContain('Impossible state');
  });

  it('should index property writes in event bindings (click)="saved = true"', async () => {
    const {compiler} = await setupCompiler(`
      import {Component} from '@angular/core';
      @Component({
        selector: 'test-comp',
        template: '<button (click)="saved = true"></button>',
      })
      export class TestComp {
        saved = false;
      }
    `);

    const comp = await getIndexedComponent(compiler);
    getIdentifier(comp, IdentifierKind.Property, 'saved');
  });

  it('should index method calls with and without "this." receivers (click)="onSave()" and (click)="this.onSave()"', async () => {
    const {compiler} = await setupCompiler(`
      import {Component} from '@angular/core';
      @Component({
        selector: 'test-comp',
        template: '<button (click)="onSave()"></button><button (click)="this.onSave()"></button>',
      })
      export class TestComp {
        onSave() {}
      }
    `);

    const comp = await getIndexedComponent(compiler);
    const onSaveId = getIdentifiers(comp, IdentifierKind.Property, 'onSave');
    expect(onSaveId.length).toBe(2);
  });

  it('should index safe method calls {{ user?.getName() }}', async () => {
    const {compiler} = await setupCompiler(`
      import {Component} from '@angular/core';
      @Component({
        selector: 'test-comp',
        template: '{{ user?.getName() }}',
      })
      export class TestComp {
        user = { getName: () => 'name' };
      }
    `);

    const comp = await getIndexedComponent(compiler);
    getIdentifier(comp, IdentifierKind.Property, 'user');
  });

  it('should index a component without a selector under the default ng-component selector', async () => {
    // ngtsc's `ComponentDecoratorHandler.index` reports `analysis.meta.selector`, which
    // `extractDirectiveMetadata` has already defaulted to `ng-component`.
    const {compiler} = await setupCompiler(`
      import {Component} from '@angular/core';
      @Component({
        template: '{{ foo }}',
      })
      export class SelectorlessComp {
        foo = 'bar';
      }
    `);

    const comp = await getIndexedComponent(compiler, 'SelectorlessComp');
    expect(comp.name).toBe('SelectorlessComp');
    expect(comp.selector).toBe('ng-component');
    expect(comp.template.identifiers.size).toBe(1);

    const id = getIdentifier(comp, IdentifierKind.Property, 'foo');
    expect(id.name).toBe('foo');
    expect(id.kind).toBe(IdentifierKind.Property);
  });

  it('should index component inputs and outputs without duplicates when declared on decorator and class properties', async () => {
    const {compiler} = await setupCompiler(`
      import {Component, Input, Output, EventEmitter} from '@angular/core';
      @Component({
        selector: 'test-comp',
        template: '<div></div>',
        inputs: ['input1', 'input2Field: input2'],
        outputs: ['output1', 'output2Field: output2'],
      })
      export class TestComp {
        input1 = 0;
        input2Field = 0;
        @Input() input3 = 0;
        @Input('input4') input4Field = 0;

        output1 = new EventEmitter();
        output2Field = new EventEmitter();
        @Output() output3 = new EventEmitter();
        @Output('output4') output4Field = new EventEmitter();
      }
    `);

    const comp = await getIndexedComponent(compiler);
    expect(comp.inputs).toEqual([
      {directiveProperty: 'input1', bindingName: 'input1'},
      {directiveProperty: 'input2Field', bindingName: 'input2'},
      {directiveProperty: 'input3', bindingName: 'input3'},
      {directiveProperty: 'input4Field', bindingName: 'input4'},
    ]);
    expect(comp.outputs).toEqual([
      {directiveProperty: 'output1', bindingName: 'output1'},
      {directiveProperty: 'output2Field', bindingName: 'output2'},
      {directiveProperty: 'output3', bindingName: 'output3'},
      {directiveProperty: 'output4Field', bindingName: 'output4'},
    ]);
  });

  it('should index signal inputs, signal outputs, and model() declarations', async () => {
    const {compiler} = await setupCompiler(`
      import {Component, input, output, model} from '@angular/core';
      @Component({
        selector: 'test-comp',
        template: '<div></div>',
      })
      export class TestComp {
        sigIn = input<string>();
        sigInAliased = input<string>('', {alias: 'customIn'});
        sigOut = output<string>();
        sigModel = model<number>(0);
      }
    `);

    const comp = await getIndexedComponent(compiler);
    expect(comp.inputs).toEqual([
      {directiveProperty: 'sigIn', bindingName: 'sigIn'},
      {directiveProperty: 'sigInAliased', bindingName: 'customIn'},
      {directiveProperty: 'sigModel', bindingName: 'sigModel'},
    ]);
    expect(comp.outputs).toEqual([
      {directiveProperty: 'sigOut', bindingName: 'sigOut'},
      {directiveProperty: 'sigModel', bindingName: 'sigModelChange'},
    ]);
  });

  it('should index cross-file imported directives with their source file path', async () => {
    const {compiler, projectRoot} = await setupMultiFileCompiler(
      {
        'dir.ts': `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[myDir]',
            exportAs: 'myDir',
          })
          export class MyDir {}
        `,
        'test.ts': `
          import {Component} from '@angular/core';
          import {MyDir} from './dir';

          @Component({
            selector: 'test-comp',
            template: '<div myDir #myRef="myDir"></div>',
            imports: [MyDir],
          })
          export class TestComp {}
        `,
      },
      {strictTemplates: true},
    );

    const comp = await getIndexedComponentByName(compiler, 'TestComp');
    const expectedDirPath = join(projectRoot, 'dir.ts').toLowerCase();

    // Check Element and its usedDirectives
    const div = getIdentifier<ElementIdentifier>(comp, IdentifierKind.Element, 'div');
    expect(div.usedDirectives.size).toBe(1);
    const usedDir = Array.from(div.usedDirectives)[0];
    expect(usedDir.node.name).toBe('MyDir');
    expect(usedDir.node.filePath.toLowerCase()).toBe(expectedDirPath);

    // Check Reference targeting the directive
    const ref = getIdentifier<ReferenceIdentifier>(comp, IdentifierKind.Reference, 'myRef');
    expect(ref.target).toBeDefined();
    expect(ref.target?.directive).toBeDefined();
    expect(ref.target?.directive?.name).toBe('MyDir');
    expect(ref.target?.directive?.filePath.toLowerCase()).toBe(expectedDirPath);
  });

  it('should index cross-file imported components with their source file path', async () => {
    const {compiler, projectRoot} = await setupMultiFileCompiler(
      {
        'child.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'child-comp',
            template: '<span>child</span>',
            exportAs: 'childComp',
          })
          export class ChildComp {}
        `,
        'test.ts': `
          import {Component} from '@angular/core';
          import {ChildComp} from './child';

          @Component({
            selector: 'test-comp',
            template: '<child-comp #childRef="childComp"></child-comp>',
            imports: [ChildComp],
          })
          export class TestComp {}
        `,
      },
      {strictTemplates: true},
    );

    const comp = await getIndexedComponentByName(compiler, 'TestComp');
    const expectedChildPath = join(projectRoot, 'child.ts').toLowerCase();

    const childElement = getIdentifier<ElementIdentifier>(
      comp,
      IdentifierKind.Element,
      'child-comp',
    );
    expect(childElement.usedDirectives.size).toBe(1);
    const usedChild = Array.from(childElement.usedDirectives)[0];
    expect(usedChild.node.name).toBe('ChildComp');
    expect(usedChild.node.filePath.toLowerCase()).toBe(expectedChildPath);

    const ref = getIdentifier<ReferenceIdentifier>(comp, IdentifierKind.Reference, 'childRef');
    expect(ref.target?.directive?.name).toBe('ChildComp');
    expect(ref.target?.directive?.filePath.toLowerCase()).toBe(expectedChildPath);
  });

  it('should index multiple cross-file directives and components on elements with respective file paths', async () => {
    const {compiler, projectRoot} = await setupMultiFileCompiler(
      {
        'dir-a.ts': `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dirA]',
            exportAs: 'dirA',
          })
          export class DirA {}
        `,
        'dir-b.ts': `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dirB]',
            exportAs: 'dirB',
          })
          export class DirB {}
        `,
        'child.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'child-comp',
            template: '<p>child</p>',
            exportAs: 'childComp',
          })
          export class ChildComp {}
        `,
        'test.ts': `
          import {Component} from '@angular/core';
          import {DirA} from './dir-a';
          import {DirB} from './dir-b';
          import {ChildComp} from './child';

          @Component({
            selector: 'test-comp',
            template: '<child-comp dirA #compRef="childComp" #aRef="dirA"></child-comp><span dirB #bRef="dirB"></span>',
            imports: [ChildComp, DirA, DirB],
          })
          export class TestComp {}
        `,
      },
      {strictTemplates: true},
    );

    const comp = await getIndexedComponentByName(compiler, 'TestComp');
    const expectedChildPath = join(projectRoot, 'child.ts').toLowerCase();
    const expectedDirAPath = join(projectRoot, 'dir-a.ts').toLowerCase();
    const expectedDirBPath = join(projectRoot, 'dir-b.ts').toLowerCase();

    // Check child-comp element with multiple matched directives (ChildComp + DirA)
    const childElement = getIdentifier<ElementIdentifier>(
      comp,
      IdentifierKind.Element,
      'child-comp',
    );
    const matchedNames = Array.from(childElement.usedDirectives).map((d) => ({
      name: d.node.name,
      filePath: d.node.filePath.toLowerCase(),
    }));
    expect(matchedNames).toEqual(
      jasmine.arrayContaining([
        {name: 'ChildComp', filePath: expectedChildPath},
        {name: 'DirA', filePath: expectedDirAPath},
      ]),
    );

    // Check references on child-comp
    const compRef = getIdentifier<ReferenceIdentifier>(comp, IdentifierKind.Reference, 'compRef');
    expect(compRef.target?.directive?.name).toBe('ChildComp');
    expect(compRef.target?.directive?.filePath.toLowerCase()).toBe(expectedChildPath);

    const aRef = getIdentifier<ReferenceIdentifier>(comp, IdentifierKind.Reference, 'aRef');
    expect(aRef.target?.directive?.name).toBe('DirA');
    expect(aRef.target?.directive?.filePath.toLowerCase()).toBe(expectedDirAPath);

    // Check span element with DirB
    const spanElement = getIdentifier<ElementIdentifier>(comp, IdentifierKind.Element, 'span');
    const spanUsedDir = Array.from(spanElement.usedDirectives)[0];
    expect(spanUsedDir.node.name).toBe('DirB');
    expect(spanUsedDir.node.filePath.toLowerCase()).toBe(expectedDirBPath);

    const bRef = getIdentifier<ReferenceIdentifier>(comp, IdentifierKind.Reference, 'bRef');
    expect(bRef.target?.directive?.name).toBe('DirB');
    expect(bRef.target?.directive?.filePath.toLowerCase()).toBe(expectedDirBPath);
  });

  it('should index cross-file selectorless components with their source file paths', async () => {
    const {compiler, projectRoot} = await setupMultiFileCompiler(
      {
        'dep-comp.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<span>dep comp</span>',
            standalone: true,
          })
          export class DepComp {}
        `,
        'other-comp.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<span>other comp</span>',
            standalone: true,
          })
          export class OtherComp {}
        `,
        'test.ts': `
          import {Component} from '@angular/core';
          import {DepComp} from './dep-comp';
          import {OtherComp} from './other-comp';

          @Component({
            template: '<DepComp #compRef /><OtherComp #otherRef />',
            standalone: true,
            imports: [DepComp, OtherComp],
          })
          export class TestComp {}
        `,
      },
      {enableSelectorless: true, strictTemplates: true},
    );

    const comp = await getIndexedComponentByName(compiler, 'TestComp');
    const expectedDepPath = join(projectRoot, 'dep-comp.ts').toLowerCase();
    const expectedOtherPath = join(projectRoot, 'other-comp.ts').toLowerCase();

    // Check selectorless Component nodes
    getIdentifier<DirectiveHostIdentifier>(comp, IdentifierKind.Component, 'DepComp');
    getIdentifier<DirectiveHostIdentifier>(comp, IdentifierKind.Component, 'OtherComp');

    const compRef = getIdentifier<ReferenceIdentifier>(comp, IdentifierKind.Reference, 'compRef');
    expect(compRef.target?.directive?.name).toBe('DepComp');
    expect(compRef.target?.directive?.filePath.toLowerCase()).toBe(expectedDepPath);

    const otherRef = getIdentifier<ReferenceIdentifier>(comp, IdentifierKind.Reference, 'otherRef');
    expect(otherRef.target?.directive?.name).toBe('OtherComp');
    expect(otherRef.target?.directive?.filePath.toLowerCase()).toBe(expectedOtherPath);
  });

  it('should index cross-file structural directives applied on templates with their source file path', async () => {
    const {compiler, projectRoot} = await setupMultiFileCompiler(
      {
        'structural-dir.ts': `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[myStructuralDir]',
            exportAs: 'myStructuralDir',
          })
          export class MyStructuralDir {}
        `,
        'test.ts': `
          import {Component} from '@angular/core';
          import {MyStructuralDir} from './structural-dir';

          @Component({
            selector: 'test-comp',
            template: '<ng-template myStructuralDir #dirRef="myStructuralDir"></ng-template>',
            imports: [MyStructuralDir],
          })
          export class TestComp {}
        `,
      },
      {strictTemplates: true},
    );

    const comp = await getIndexedComponentByName(compiler, 'TestComp');
    const expectedDirPath = join(projectRoot, 'structural-dir.ts').toLowerCase();

    // Check Template node
    const tpl = getIdentifier<DirectiveHostIdentifier>(
      comp,
      IdentifierKind.Template,
      'ng-template',
    );
    expect(tpl.usedDirectives.size).toBe(1);
    const usedDir = Array.from(tpl.usedDirectives)[0];
    expect(usedDir.node.name).toBe('MyStructuralDir');
    expect(usedDir.node.filePath.toLowerCase()).toBe(expectedDirPath);

    // Check Reference targeting the structural directive
    const ref = getIdentifier<ReferenceIdentifier>(comp, IdentifierKind.Reference, 'dirRef');
    expect(ref.target?.directive?.name).toBe('MyStructuralDir');
    expect(ref.target?.directive?.filePath.toLowerCase()).toBe(expectedDirPath);
  });

  it('should resolve ClassEntity from nodeFilePath or fallback to ref.key in getClassEntity', () => {
    const boundTemplate = new IndexerBoundTemplate();

    // With nodeFilePath present
    const entityWithNodeFilePath = boundTemplate.getClassEntity({
      name: 'MyDirective',
      ref: {
        nodeFilePath: '/project/src/my_directive.ts',
        key: 'unimportant_key' as any,
        name: 'MyDirective',
      } as any,
    } as any);
    expect(entityWithNodeFilePath).toEqual({
      name: 'MyDirective',
      filePath: '/project/src/my_directive.ts',
    });

    // Without nodeFilePath, fallback to key with # delimiter
    const entityWithKeyFallback = boundTemplate.getClassEntity({
      name: 'OtherDirective',
      ref: {
        key: '/project/src/other_directive.ts#OtherDirective' as any,
        name: 'OtherDirective',
      } as any,
    } as any);
    expect(entityWithKeyFallback).toEqual({
      name: 'OtherDirective',
      filePath: '/project/src/other_directive.ts',
    });

    // Without ref
    const entityWithoutRef = boundTemplate.getClassEntity({
      name: 'FallbackDirective',
    } as any);
    expect(entityWithoutRef).toEqual({
      name: 'FallbackDirective',
      filePath: '',
    });
  });

  it('should discover bound attribute inputs on components', async () => {
    const {compiler, filePath} = await setupCompiler(
      `
      import {Component, Input} from '@angular/core';

      @Component({
        selector: 'child-comp',
        template: '',
      })
      export class ChildComp {
        @Input() myInput = '';
      }

      @Component({
        selector: 'test-comp',
        template: '<child-comp [myInput]="foo"></child-comp>',
        imports: [ChildComp],
      })
      export class TestComp {
        foo = 'bar';
      }
    `,
      {strictTemplates: true},
    );

    const comp = await getIndexedComponentByName(compiler, 'TestComp');
    const inputId = getIdentifier<BoundAttributeIdentifier>(comp, IdentifierKind.Input, 'myInput');
    expect(inputId).toBeDefined();
    expect(inputId.name).toBe('myInput');
    expect(inputId.kind).toBe(IdentifierKind.Input);
    expect(inputId.target).toBeDefined();
    expect(inputId.target?.node.name).toBe('ChildComp');
    expect(inputId.target?.node.filePath.toLowerCase()).toBe(filePath.toLowerCase());
  });

  it('should discover bound event outputs on components', async () => {
    const {compiler, filePath} = await setupCompiler(
      `
      import {Component, Output, EventEmitter} from '@angular/core';

      @Component({
        selector: 'child-comp',
        template: '',
      })
      export class ChildComp {
        @Output() myOutput = new EventEmitter<void>();
      }

      @Component({
        selector: 'test-comp',
        template: '<child-comp (myOutput)="handle()"></child-comp>',
        imports: [ChildComp],
      })
      export class TestComp {
        handle() {}
      }
    `,
      {strictTemplates: true},
    );

    const comp = await getIndexedComponentByName(compiler, 'TestComp');
    const outputId = getIdentifier<BoundAttributeIdentifier>(
      comp,
      IdentifierKind.Output,
      'myOutput',
    );
    expect(outputId).toBeDefined();
    expect(outputId.name).toBe('myOutput');
    expect(outputId.kind).toBe(IdentifierKind.Output);
    expect(outputId.target).toBeDefined();
    expect(outputId.target?.node.name).toBe('ChildComp');
    expect(outputId.target?.node.filePath.toLowerCase()).toBe(filePath.toLowerCase());
  });

  it('should discover static text attribute inputs on components', async () => {
    const {compiler, filePath} = await setupCompiler(
      `
      import {Component, Input} from '@angular/core';

      @Component({
        selector: 'child-comp',
        template: '',
      })
      export class ChildComp {
        @Input() myInput = '';
      }

      @Component({
        selector: 'test-comp',
        template: '<child-comp myInput="staticVal"></child-comp>',
        imports: [ChildComp],
      })
      export class TestComp {}
    `,
      {strictTemplates: true},
    );

    const comp = await getIndexedComponentByName(compiler, 'TestComp');
    const inputId = getIdentifier<BoundAttributeIdentifier>(comp, IdentifierKind.Input, 'myInput');
    expect(inputId).toBeDefined();
    expect(inputId.name).toBe('myInput');
    expect(inputId.kind).toBe(IdentifierKind.Input);
    expect(inputId.target).toBeDefined();
    expect(inputId.target?.node.name).toBe('ChildComp');
    expect(inputId.target?.node.filePath.toLowerCase()).toBe(filePath.toLowerCase());
  });

  it('should discover bound inputs and outputs on cross-file directives', async () => {
    const {compiler, projectRoot} = await setupMultiFileCompiler(
      {
        'dir.ts': `
          import {Directive, Input, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[myDir]',
          })
          export class MyDir {
            @Input() dirInput = '';
            @Output() dirOutput = new EventEmitter<void>();
          }
        `,
        'test.ts': `
          import {Component} from '@angular/core';
          import {MyDir} from './dir';

          @Component({
            selector: 'test-comp',
            template: '<div myDir [dirInput]="foo" (dirOutput)="handle()"></div>',
            imports: [MyDir],
          })
          export class TestComp {
            foo = 'bar';
            handle() {}
          }
        `,
      },
      {strictTemplates: true},
    );

    const comp = await getIndexedComponentByName(compiler, 'TestComp');
    const expectedDirPath = join(projectRoot, 'dir.ts').toLowerCase();

    const inputId = getIdentifier<BoundAttributeIdentifier>(comp, IdentifierKind.Input, 'dirInput');
    expect(inputId.target?.node.name).toBe('MyDir');
    expect(inputId.target?.node.filePath.toLowerCase()).toBe(expectedDirPath);

    const outputId = getIdentifier<BoundAttributeIdentifier>(
      comp,
      IdentifierKind.Output,
      'dirOutput',
    );
    expect(outputId.target?.node.name).toBe('MyDir');
    expect(outputId.target?.node.filePath.toLowerCase()).toBe(expectedDirPath);
  });

  it('should index pipes declared in the same file', async () => {
    const {compiler, filePath} = await setupCompiler(`
      import {Component, Pipe, PipeTransform} from '@angular/core';

      @Pipe({
        name: 'testPipe',
      })
      export class TestPipe implements PipeTransform {
        transform(value: any) { return value; }
      }

      @Component({
        selector: 'test-comp',
        template: '{{ foo | testPipe }}',
        imports: [TestPipe],
      })
      export class TestComp {
        foo = 'bar';
      }
    `);

    const comp = await getIndexedComponent(compiler);
    const pipeId = getIdentifier<PipeIdentifier>(comp, IdentifierKind.Pipe, 'testPipe');
    expect(pipeId).toBeDefined();
    expect(pipeId.name).toBe('testPipe');
    expect(pipeId.kind).toBe(IdentifierKind.Pipe);
    expect(pipeId.target).toBeDefined();
    expect(pipeId.target?.node.name).toBe('TestPipe');
    expect(pipeId.target?.node.filePath.toLowerCase()).toBe(filePath.toLowerCase());
  });

  it('should index cross-file imported pipes with their source file path', async () => {
    const {compiler, projectRoot} = await setupMultiFileCompiler(
      {
        'my-pipe.ts': `
          import {Pipe, PipeTransform} from '@angular/core';

          @Pipe({
            name: 'myPipe',
          })
          export class MyPipe implements PipeTransform {
            transform(val: string) { return val; }
          }
        `,
        'test.ts': `
          import {Component} from '@angular/core';
          import {MyPipe} from './my-pipe';

          @Component({
            selector: 'test-comp',
            template: '{{ name | myPipe }}',
            imports: [MyPipe],
          })
          export class TestComp {
            name = 'Angular';
          }
        `,
      },
      {strictTemplates: true},
    );

    const comp = await getIndexedComponentByName(compiler, 'TestComp');
    const expectedPipePath = join(projectRoot, 'my-pipe.ts').toLowerCase();

    const pipeId = getIdentifier<PipeIdentifier>(comp, IdentifierKind.Pipe, 'myPipe');
    expect(pipeId.target?.node.name).toBe('MyPipe');
    expect(pipeId.target?.node.filePath.toLowerCase()).toBe(expectedPipePath);
  });

  it('should index pipes with arguments and index expression identifiers in arguments', async () => {
    const {compiler} = await setupCompiler(`
      import {Component, Pipe, PipeTransform} from '@angular/core';

      @Pipe({name: 'prefixPipe'})
      export class PrefixPipe implements PipeTransform {
        transform(val: string, prefix: string) { return prefix + val; }
      }

      @Component({
        selector: 'test-comp',
        template: '{{ val | prefixPipe: myPrefix }}',
        imports: [PrefixPipe],
      })
      export class TestComp {
        val = 'world';
        myPrefix = 'hello';
      }
    `);

    const comp = await getIndexedComponent(compiler);
    getIdentifier<PipeIdentifier>(comp, IdentifierKind.Pipe, 'prefixPipe');
    getIdentifier<PropertyIdentifier>(comp, IdentifierKind.Property, 'val');
    getIdentifier<PropertyIdentifier>(comp, IdentifierKind.Property, 'myPrefix');
  });

  it('should index chained pipes', async () => {
    const {compiler} = await setupCompiler(`
      import {Component, Pipe, PipeTransform} from '@angular/core';

      @Pipe({name: 'pipeA'})
      export class PipeA implements PipeTransform {
        transform(val: any) { return val; }
      }

      @Pipe({name: 'pipeB'})
      export class PipeB implements PipeTransform {
        transform(val: any) { return val; }
      }

      @Component({
        selector: 'test-comp',
        template: '{{ foo | pipeA | pipeB }}',
        imports: [PipeA, PipeB],
      })
      export class TestComp {
        foo = 'bar';
      }
    `);

    const comp = await getIndexedComponent(compiler);
    const pipeA = getIdentifier<PipeIdentifier>(comp, IdentifierKind.Pipe, 'pipeA');
    const pipeB = getIdentifier<PipeIdentifier>(comp, IdentifierKind.Pipe, 'pipeB');
    expect(pipeA.target?.node.name).toBe('PipeA');
    expect(pipeB.target?.node.name).toBe('PipeB');
  });

  it('should index unknown pipes with null target without throwing', async () => {
    const {compiler} = await setupCompiler(`
      import {Component} from '@angular/core';

      @Component({
        selector: 'test-comp',
        template: '{{ foo | unknownPipe }}',
      })
      export class TestComp {
        foo = 'bar';
      }
    `);

    const comp = await getIndexedComponent(compiler);
    const pipeId = getIdentifier<PipeIdentifier>(comp, IdentifierKind.Pipe, 'unknownPipe');
    expect(pipeId).toBeDefined();
    expect(pipeId.target).toBeNull();
  });

  it('should record an error if pipe name is not found at identifier start', () => {
    const visitor = new IndexerVisitor(new IndexerBoundTemplate());
    (visitor as any).currentAstWithSource = {
      source: 'abc',
      absoluteOffset: 0,
    };
    visitor.visitPipe({
      name: 'nonexistent',
      nameSpan: {start: 0, end: 11},
      exp: {visit: () => {}},
      args: [],
    } as any);

    expect(visitor.errors.length).toBe(1);
    expect(visitor.errors[0].message).toContain('Impossible state');
  });
});
