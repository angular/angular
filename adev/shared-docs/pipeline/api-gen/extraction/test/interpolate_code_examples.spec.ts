import fs from 'fs';
import {interpolateCodeExamples} from '../interpolate_code_examples';
import {DocEntry} from '@angular/compiler-cli';

const DUMMY_EXAMPLE_FILE = `
#docregion class
class Foo {}
#enddocregion

#docregion function
function bar() {}
#enddocregion
`;

const tsMdBlock = (code: string) => '```typescript\n' + code + '\n```';

describe('interpolate_code_examples', () => {
  it('should interpolate both JSDoc tags comments and raw comment', () => {
    spyOn(fs, 'readFileSync').and.returnValue(DUMMY_EXAMPLE_FILE);

    const entries: Partial<DocEntry>[] = [
      {
        jsdocTags: [
          {
            name: '',
            comment: `{@example dummy/path/file.ts region='class'}`,
          },
        ],
        rawComment: `{@example dummy/path/file.ts region='function'}`,
      },
    ];

    interpolateCodeExamples(entries as DocEntry[]);

    const {jsdocTags, rawComment} = entries[0];

    expect(jsdocTags![0].comment).toEqual(tsMdBlock('class Foo {}'));
    expect(rawComment).toEqual(tsMdBlock('function bar() {}'));
  });
});
