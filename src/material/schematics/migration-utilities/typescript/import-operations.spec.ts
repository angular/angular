import * as ts from 'typescript';
import {updateModuleSpecifier} from './import-operations';

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
