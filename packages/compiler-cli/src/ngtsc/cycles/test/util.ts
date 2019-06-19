/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {makeProgram} from '../../testing/in_memory_typescript';

/**
 * Construct a TS program consisting solely of an import graph, from a string-based representation
 * of the graph.
 *
 * The `graph` string consists of semicolon separated files, where each file is specified
 * as a name and (optionally) a list of comma-separated imports or exports. For example:
 *
 * "a:b,c;b;c"
 *
 * specifies a program with three files (a.ts, b.ts, c.ts) where a.ts imports from both b.ts and
 * c.ts.
 *
 * A more complicated example has a dependency from b.ts to c.ts: "a:b,c;b:c;c".
 *
 * A * preceding a file name in the list of imports indicates that the dependency should be an
 * "export" and not an "import" dependency. For example:
 *
 * "a:*b,c;b;c"
 *
 * represents a program where a.ts exports from b.ts and imports from c.ts.
 */
export function makeProgramFromGraph(graph: string): {
  program: ts.Program,
  host: ts.CompilerHost,
  options: ts.CompilerOptions,
} {
  const files = graph.split(';').map(fileSegment => {
    const [name, importList] = fileSegment.split(':');
    const contents = (importList ? importList.split(',') : [])
                         .map(i => {
                           if (i.startsWith('*')) {
                             const sym = i.substr(1);
                             return `export {${sym}} from './${sym}';`;
                           } else {
                             return `import {${i}} from './${i}';`;
                           }
                         })
                         .join('\n') +
        `export const ${name} = '${name}';\n`;
    return {
      name: `${name}.ts`,
      contents,
    };
  });
  return makeProgram(files);
}
