import * as ts from 'typescript';
import * as fs from 'fs';

/** Parses an example module file by returning all module names within the given file. */
export function parseExampleModuleFile(filePath: string) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile('', fileContent, ts.ScriptTarget.Latest, false);
  const moduleNames: string[] = [];

  const visitNode = (node: ts.Node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      moduleNames.push(node.name.text);
    }

    ts.forEachChild(node, n => visitNode(n));
  };

  visitNode(sourceFile);

  return moduleNames;
}
