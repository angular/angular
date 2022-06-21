import * as ts from 'typescript';
import {updateModuleSpecifier, updateNamedImport} from './import-operations';

describe('import operations', () => {
  describe('updateModuleSpecifier', () => {
    function runUpdateModuleSpecifierTest(
      description: string,
      opts: {old: string; new: string},
    ): void {
      const node = createNode(opts.old, ts.SyntaxKind.ImportDeclaration) as ts.ImportDeclaration;
      const update = updateModuleSpecifier(node!, {moduleSpecifier: 'new-module-name'});
      const newImport = update?.updateFn(opts.old);
      expect(newImport).withContext(description).toBe(opts.new);
    }
    it('updates the module specifier of import declarations', () => {
      runUpdateModuleSpecifierTest('default export', {
        old: `import defaultExport from 'old-module-name';`,
        new: `import defaultExport from 'new-module-name';`,
      });
      runUpdateModuleSpecifierTest('namespace import', {
        old: `import * as name from 'old-module-name';`,
        new: `import * as name from 'new-module-name';`,
      });
      runUpdateModuleSpecifierTest('named import', {
        old: `import { export1 } from 'old-module-name';`,
        new: `import { export1 } from 'new-module-name';`,
      });
      runUpdateModuleSpecifierTest('aliased named import', {
        old: `import { export1 as alias1 } from 'old-module-name';`,
        new: `import { export1 as alias1 } from 'new-module-name';`,
      });
      runUpdateModuleSpecifierTest('multiple named import', {
        old: `import { export1, export2 } from 'old-module-name';`,
        new: `import { export1, export2 } from 'new-module-name';`,
      });
      runUpdateModuleSpecifierTest('multiple named import w/ alias', {
        old: `import { export1, export2 as alias2 } from 'old-module-name';`,
        new: `import { export1, export2 as alias2 } from 'new-module-name';`,
      });
    });
  });

  describe('updateNamedExport', () => {
    function runUpdateNamedExportTest(
      description: string,
      opts: {
        oldFile: string;
        newFile: string;
        oldExport: string;
        newExport: string;
      },
    ): void {
      const node = createNode(opts.oldFile, ts.SyntaxKind.NamedImports) as ts.NamedImports;
      const newImport = updateNamedImport(node, {
        oldExport: opts.oldExport,
        newExport: opts.newExport,
      })?.updateFn(opts.oldFile);
      expect(newImport).withContext(description).toBe(opts.newFile);
    }
    it('updates the named exports of import declarations', () => {
      runUpdateNamedExportTest('named binding', {
        oldExport: 'oldExport',
        newExport: 'newExport',
        oldFile: `import { oldExport } from 'module-name';`,
        newFile: `import { newExport } from 'module-name';`,
      });
      runUpdateNamedExportTest('aliased named binding', {
        oldExport: 'oldExport',
        newExport: 'newExport',
        oldFile: `import { oldExport as alias } from 'module-name';`,
        newFile: `import { newExport as alias } from 'module-name';`,
      });
      runUpdateNamedExportTest('multiple named bindings', {
        oldExport: 'oldExport1',
        newExport: 'newExport1',
        oldFile: `import { oldExport1, export2 } from 'module-name';`,
        newFile: `import { newExport1, export2 } from 'module-name';`,
      });
      runUpdateNamedExportTest('multiple named bindings w/ alias', {
        oldExport: 'oldExport2',
        newExport: 'newExport2',
        oldFile: `import { export1, oldExport2 as alias2 } from 'module-name';`,
        newFile: `import { export1, newExport2 as alias2 } from 'module-name';`,
      });
    });
  });
});

function createSourceFile(text: string): ts.SourceFile {
  return ts.createSourceFile('file.ts', text, ts.ScriptTarget.Latest);
}

function visitNodes(node: ts.SourceFile | ts.Node, visitFn: (node: ts.Node) => void): void {
  node.forEachChild(child => {
    visitFn(child);
    visitNodes(child, visitFn);
  });
}

function getNodeByKind(file: ts.SourceFile, kind: ts.SyntaxKind): ts.Node | null {
  let node: ts.Node | null = null;
  visitNodes(file, (_node: ts.Node) => {
    if (_node.kind === kind) {
      node = _node;
    }
  });
  return node;
}

function createNode(text: string, kind: ts.SyntaxKind): ts.Node | null {
  return getNodeByKind(createSourceFile(text), kind);
}
