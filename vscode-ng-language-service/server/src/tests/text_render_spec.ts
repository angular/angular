/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as tss from 'typescript/lib/tsserverlibrary';

import {asPlainTextWithLinks, documentationToMarkdown, tagsToMarkdown} from '../text_render';

describe('typescript.previewer', () => {
  it('Should ignore hyphens after a param tag', () => {
    expect(
      tagsToMarkdown([{name: 'param', text: [{kind: 'text', text: 'a - b'}]}], () => undefined),
    ).toBe('*@param* `a` — b');
  });

  it('Should parse url jsdoc @link', () => {
    expect(
      documentationToMarkdown(
        [
          {'text': 'x ', 'kind': 'text'},
          {'text': '{@link ', 'kind': 'link'},
          {'text': 'http://www.example.com/foo', 'kind': 'linkText'},
          {'text': '}', 'kind': 'link'},
          {'text': ' y ', 'kind': 'text'},
          {'text': '{@link ', 'kind': 'link'},
          {
            'text': 'https://api.jquery.com/bind/#bind-eventType-eventData-handler',
            'kind': 'linkText',
          },
          {'text': '}', 'kind': 'link'},
          {'text': ' z', 'kind': 'text'},
        ],
        [],
        () => undefined,
      ),
    ).toEqual([
      'x http://www.example.com/foo y https://api.jquery.com/bind/#bind-eventType-eventData-handler z',
    ]);
  });

  it('Should parse url jsdoc @link with text', () => {
    expect(
      documentationToMarkdown(
        [
          {'text': 'x ', 'kind': 'text'},
          {'text': '{@link ', 'kind': 'link'},
          {'text': 'http://www.example.com/foo abc xyz', 'kind': 'linkText'},
          {'text': '}', 'kind': 'link'},
          {'text': ' y ', 'kind': 'text'},
          {'text': '{@link ', 'kind': 'link'},
          {'text': 'http://www.example.com/bar|b a z', 'kind': 'linkText'},
          {'text': '}', 'kind': 'link'},
          {'text': ' z', 'kind': 'text'},
        ],
        [],
        () => undefined,
      ),
    ).toEqual(['x [abc xyz](http://www.example.com/foo) y [a z](http://www.example.com/bar|b) z']);
  });

  it('Should treat @linkcode jsdocs links as monospace', () => {
    expect(
      documentationToMarkdown(
        [
          {'text': 'x ', 'kind': 'text'},
          {'text': '{@linkcode ', 'kind': 'link'},
          {'text': 'http://www.example.com/foo', 'kind': 'linkText'},
          {'text': '}', 'kind': 'link'},
          {'text': ' y ', 'kind': 'text'},
          {'text': '{@linkplain ', 'kind': 'link'},
          {'text': 'http://www.example.com/bar', 'kind': 'linkText'},
          {'text': '}', 'kind': 'link'},
          {'text': ' z', 'kind': 'text'},
        ],
        [],
        () => undefined,
      ),
    ).toEqual(['x http://www.example.com/foo y http://www.example.com/bar z']);
  });

  it('Should parse url jsdoc @link in param tag', () => {
    expect(
      tagsToMarkdown(
        [
          {
            name: 'param',
            text: [
              {
                kind: 'text',
                text: 'a x {@link http://www.example.com/foo abc xyz} y {@link http://www.example.com/bar|b a z} z',
              },
            ],
          },
        ],
        () => undefined,
      ),
    ).toBe(
      '*@param* `a` — x [abc xyz](http://www.example.com/foo) y [b a z](http://www.example.com/bar) z',
    );
  });

  it('Should ignore unclosed jsdocs @link', () => {
    expect(
      documentationToMarkdown(
        [
          {'text': 'x ', 'kind': 'text'},
          {'text': '{@link ', 'kind': 'link'},
          {
            'text': 'http://www.example.com/foo y {@link http://www.example.com/bar bar',
            'kind': 'linkText',
          },
          {'text': '}', 'kind': 'link'},
          {'text': ' z', 'kind': 'text'},
        ],
        [],
        () => undefined,
      ),
    ).toEqual(['x [y {@link http://www.example.com/bar bar](http://www.example.com/foo) z']);
  });

  it('Should support non-ascii characters in parameter name (#90108)', () => {
    expect(
      tagsToMarkdown(
        [{name: 'param', text: [{kind: 'text', text: 'parámetroConDiacríticos this will not'}]}],
        () => undefined,
      ),
    ).toBe('*@param* `parámetroConDiacríticos` — this will not');
  });

  it('Should render @example blocks as code', () => {
    expect(
      tagsToMarkdown([{name: 'example', text: [{kind: 'text', text: 'code();'}]}], () => undefined),
    ).toBe('*@example*  \n```\ncode();\n```');
  });

  it('Should not render @example blocks as code as if they contain a codeblock', () => {
    expect(
      tagsToMarkdown(
        [{name: 'example', text: [{kind: 'text', text: 'Not code\n```\ncode();\n```'}]}],
        () => undefined,
      ),
    ).toBe('*@example*  \nNot code\n```\ncode();\n```');
  });

  it('Should render @example blocks as code if they contain a <caption>', () => {
    expect(
      tagsToMarkdown(
        [
          {
            name: 'example',
            text: [
              {
                kind: 'text',
                text: '<caption>Not code</caption>\ncode();',
              },
            ],
          },
        ],
        () => undefined,
      ),
    ).toBe('*@example*  \nNot code\n```\ncode();\n```');
  });

  it('Should not render @example blocks as code if they contain a <caption> and a codeblock', () => {
    expect(
      tagsToMarkdown(
        [
          {
            name: 'example',
            text: [{kind: 'text', text: '<caption>Not code</caption>\n```\ncode();\n```'}],
          },
        ],
        () => undefined,
      ),
    ).toBe('*@example*  \nNot code\n```\ncode();\n```');
  });

  it('Should not render @link inside of @example #187768', () => {
    expect(
      tagsToMarkdown(
        [
          {
            'name': 'example',
            'text': [
              {'text': '1 + 1 ', 'kind': 'text'},
              {'text': '{@link ', 'kind': 'link'},
              {'text': 'foo', 'kind': 'linkName'},
              {'text': '}', 'kind': 'link'},
            ],
          },
        ],
        () => undefined,
      ),
    ).toBe('*@example*  \n```\n1 + 1 {@link foo}\n```');
  });

  it('Should render @linkcode symbol name as code', () => {
    expect(
      asPlainTextWithLinks(
        [
          {'text': 'a ', 'kind': 'text'},
          {'text': '{@linkcode ', 'kind': 'link'},
          {
            'text': 'dog',
            'kind': 'linkName',
            'target': {
              'fileName': '/path/file.ts',
              'start': {'line': 7, 'offset': 5},
              'end': {'line': 7, 'offset': 13},
            },
          } as tss.SymbolDisplayPart,
          {'text': '}', 'kind': 'link'},
          {'text': ' b', 'kind': 'text'},
        ],
        () => undefined,
      ),
    ).toBe('a [`dog`](command:angular.openJsDocLink?%7B%22file%22%3A%22%2Fpath%2Ffile.ts%22%7D) b');
  });

  it('Should render @linkcode text as code', () => {
    expect(
      asPlainTextWithLinks(
        [
          {'text': 'a ', 'kind': 'text'},
          {'text': '{@linkcode ', 'kind': 'link'},
          {
            'text': 'dog',
            'kind': 'linkName',
            'target': {
              'fileName': '/path/file.ts',
              'start': {'line': 7, 'offset': 5},
              'end': {'line': 7, 'offset': 13},
            },
          } as tss.SymbolDisplayPart,
          {'text': 'husky', 'kind': 'linkText'},
          {'text': '}', 'kind': 'link'},
          {'text': ' b', 'kind': 'text'},
        ],
        () => undefined,
      ),
    ).toBe(
      'a [`husky`](command:angular.openJsDocLink?%7B%22file%22%3A%22%2Fpath%2Ffile.ts%22%7D) b',
    );
  });
});
