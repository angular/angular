import {sync as glob} from 'glob';
import {readFileSync, writeFileSync} from 'fs';
import {join, basename} from 'path';
import * as ts from 'typescript';

// Script that generates mappings from our publicly-exported symbols to their entry points. The
// mappings are intended to be used by the secondary entry points schematic and should be committed
// next to the relevant schematic file.
// Can be run using `ts-node --project scripts scripts/generate-schematic-imports-map.ts`.
const mappings: {[symbolName: string]: string} = {};
const outputPath = join(__dirname, '../temp-entry-points-mapping.json');

glob('**/*.d.ts', {
  absolute: true,
  cwd: join(__dirname, '../tools/public_api_guard/material')
}).forEach(fileName => {
  const content = readFileSync(fileName, 'utf8');
  const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.ES5);
  const moduleName = basename(fileName, '.d.ts');

  // We only care about the top-level symbols.
  sourceFile.forEachChild((node: ts.Node & {name?: ts.Identifier}) => {
    // Most of the exports are named nodes (e.g. classes, types, interfaces) so we can use the
    // `name` property to extract the name. The one exception are variable declarations for
    // which we need to loop through the list of declarations.
    if (node.name) {
      addMapping(moduleName, node.name.text);
    } else if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach(declaration => {
        if (ts.isIdentifier(declaration.name)) {
          addMapping(moduleName, declaration.name.text);
        } else {
          throw Error('Unsupported variable kind.');
        }
      });
    } else if (node.kind !== ts.SyntaxKind.EndOfFileToken) {
      throw Error(`Unhandled node kind ${node.kind} in ${fileName}.`);
    }
  });
});

/** Adds a symbol to the mappings. */
function addMapping(moduleName: string, symbolName: string) {
  if (mappings[symbolName] && mappings[symbolName] !== moduleName) {
    throw Error(`Duplicate symbol name ${symbolName}.`);
  }

  mappings[symbolName] = moduleName;
}

writeFileSync(outputPath, JSON.stringify(mappings, null, 2));
console.log(`Generated mappings to ${outputPath}. You should move the file to the ` +
            `proper place yourself.`);
