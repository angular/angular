/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import url from 'url';

const containingDir = path.dirname(url.fileURLToPath(import.meta.url));
const testDtsFile = path.join(containingDir, 'signal_input_signature_test.d.ts');

async function main() {
  const fileContent = fs.readFileSync(testDtsFile, 'utf8');
  const sourceFile = ts.createSourceFile('test.ts', fileContent, ts.ScriptTarget.ESNext, true);
  const testClazz =
      sourceFile.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s))!;
  let failing = false;

  for (const member of testClazz.members) {
    if (!ts.isPropertyDeclaration(member)) {
      continue;
    }

    const leadingCommentRanges = ts.getLeadingCommentRanges(sourceFile.text, member.getFullStart());
    const leadingComments = leadingCommentRanges?.map(r => sourceFile.text.substring(r.pos, r.end));

    if (leadingComments === undefined || leadingComments.length === 0) {
      throw new Error(`No expected type for: ${member.name.getText()}`);
    }

    // strip comment start, and beginning (plus whitespace).
    let expectedTypeComment = leadingComments[0].replace(/(^\/\*\*?\s*|\s*\*+\/$)/g, '');
    // expand shorthands where ReadT is the same as WriteT.
    if (!expectedTypeComment.includes(',')) {
      expectedTypeComment = `${expectedTypeComment}, ${expectedTypeComment}`;
    }

    const expectedType = `InputSignal<${expectedTypeComment}>`;
    // strip excess whitespace or newlines.
    const got = member.type?.getText().replace(/(\n+|\s\s+)/g, '');

    if (expectedType !== got) {
      console.error(`${member.name.getText()}: expected: ${expectedType}, got: ${got}`);
      failing = true;
    }
  }

  if (failing) {
    throw new Error('Failing assertions');
  }
}

main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
