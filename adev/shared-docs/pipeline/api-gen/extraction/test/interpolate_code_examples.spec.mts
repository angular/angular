/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import fs from 'fs';
import {interpolateCodeExamples} from '../interpolate_code_examples.mjs';
import {DocEntry} from '@angular/compiler-cli';
import {mockReadFileSync} from './fake-examples.mjs';

const tsMdBlock = (code: string) => '```angular-ts\n' + code + '\n```';
const htmlMdBlock = (code: string) => '```angular-html\n' + code + '\n```';

const entriesBuilder = (comment: string): DocEntry[] => [
  {jsdocTags: [], rawComment: comment, description: ''} as unknown as DocEntry,
];

const getComment = (entries: DocEntry[]) => entries[0].rawComment;

describe('interpolate_code_examples', () => {
  beforeAll(() => {
    spyOn(fs, 'readFileSync').and.callFake(mockReadFileSync as any);
  });

  it('should interpolate both JSDoc tags comments and raw comment', () => {
    const entries: Partial<DocEntry>[] = [
      {
        jsdocTags: [
          {
            name: '',
            comment: `{@example dummy/jsdocs_raw.ts region='class'}`,
          },
        ],
        rawComment: `{@example dummy/jsdocs_raw.ts region='function'}`,
        description: `{@example dummy/jsdocs_raw.ts region='function'}`,
      },
    ];

    interpolateCodeExamples(entries as DocEntry[]);

    const {jsdocTags, rawComment} = entries[0];

    expect(jsdocTags![0].comment).toEqual(tsMdBlock('class Foo {}'));
    expect(rawComment).toEqual(tsMdBlock('function bar() {}'));
  });

  it('should interpolate a single example', () => {
    const entries = entriesBuilder(`Code: {@example dummy/single.ts region='foo'}`);

    interpolateCodeExamples(entries);

    expect(getComment(entries)).toEqual('Code:' + tsMdBlock("foo('Hello world!');"));
  });

  it('should interpolate multiple examples', () => {
    const entries = entriesBuilder(
      `First:{@example dummy/multi.ts region='example-1'} Second:{@example dummy/multi.ts region='example-2'}`,
    );

    interpolateCodeExamples(entries);

    expect(getComment(entries)).toEqual(
      `First:${tsMdBlock('foo(null);')} Second:${tsMdBlock("type Test = 'a' | 'b';")}`,
    );
  });

  it('should interpolate nested examples', () => {
    const entries = entriesBuilder(
      `Outer: {@example dummy/nested.ts region='out'} Inner: {@example dummy/nested.ts region='in'}`,
    );

    interpolateCodeExamples(entries);

    const outer = `function baz() {
  const leet = 1337;
}`;

    expect(getComment(entries)).toEqual(
      `Outer:${tsMdBlock(outer)} Inner:${tsMdBlock('const leet = 1337;')}`,
    );
  });

  it('should interpolate a single example with multiple regions', () => {
    const entries = entriesBuilder(`Code: {@example dummy/regions.ts region='fn'}`);

    interpolateCodeExamples(entries);

    expect(getComment(entries)).toEqual('Code:' + tsMdBlock('function baz() {\n}'));
  });

  it('should support examples defined by overlapping regions', () => {
    const entries = entriesBuilder(
      `1st:{@example dummy/overlap.ts region='1st'} 2nd:{@example dummy/overlap.ts region='2nd'}`,
    );

    interpolateCodeExamples(entries);

    const first = `import {foo} from 'bar';

class Baz {
  constructor () {}`;

    const second = `class Baz {
  constructor () {}

  example () {}
}`;

    expect(getComment(entries)).toEqual(`1st:${tsMdBlock(first)} 2nd:${tsMdBlock(second)}`);
  });

  it('should support multiple region combinations simultaneously', () => {
    const targetStr = `1: {@example dummy/complex.ts region='ex-1'}
2: {@example dummy/complex.ts region='ex-2'}
3: {@example dummy/complex.ts region='ex-3'}
4: {@example dummy/complex.ts region='ex-4'}
5: {@example dummy/complex.ts region='ex-5'}
6: {@example dummy/complex.ts region='ex-6'}`;

    const entries = entriesBuilder(targetStr);

    interpolateCodeExamples(entries);

    const output = `1:${tsMdBlock("import {baz} from 'foo';")}
2:${tsMdBlock('function test() {}\nbaz();')}
3:${tsMdBlock(`function test2() {
  const leet = 1337;
}`)}
4:${tsMdBlock('const leet = 1337;')}
5:${tsMdBlock("const A = 'a';\nconst B = 'b';")}
6:${tsMdBlock("const B = 'b';\nconst C = 'c';")}`;

    expect(getComment(entries)).toEqual(output);
  });

  it('should support HTML files', () => {
    const entries = entriesBuilder(`HTML: {@example dummy/index.html region='tags'}`);

    interpolateCodeExamples(entries);

    expect(getComment(entries)).toEqual(`HTML:${htmlMdBlock('    <i>Foo</i>\n    <p>Baz</p>')}`);
  });

  it('should interpolate an example and remove leading spaces', () => {
    // To generate a valid markdown code block, there should not be any leanding spaces
    const entries = entriesBuilder(`
      Code: 
      
      {@example dummy/single.ts region='foo'}
    `);

    interpolateCodeExamples(entries);

    expect(getComment(entries)).toMatch(/^\`\`\`/m);
  });
});
