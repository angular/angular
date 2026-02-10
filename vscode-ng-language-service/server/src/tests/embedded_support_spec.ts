/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ts from 'typescript';

import {
  getCSSVirtualContent,
  getHTMLVirtualContent,
  getSCSSVirtualContent,
} from '../embedded_support';

function assertEmbeddedHTMLContent(value: string, expectedContent: string): void {
  const sf = ts.createSourceFile('temp', value, ts.ScriptTarget.ESNext, true /* setParentNodes */);
  const virtualContent = getHTMLVirtualContent(sf);

  expect(virtualContent).toEqual(expectedContent);
}

function assertEmbeddedSCSSContent(value: string, expectedContent: string): void {
  const sf = ts.createSourceFile('temp', value, ts.ScriptTarget.ESNext, true /* setParentNodes */);
  const virtualContent = getSCSSVirtualContent(sf);

  expect(virtualContent).toEqual(expectedContent);
}

function assertEmbeddedCSSContent(value: string, expectedContent: string): void {
  const sf = ts.createSourceFile('temp', value, ts.ScriptTarget.ESNext, true /* setParentNodes */);
  const virtualContent = getCSSVirtualContent(sf);

  expect(virtualContent).toEqual(expectedContent);
}

describe('server embedded support', () => {
  it('strips everything but the template string literal', () => {
    assertEmbeddedHTMLContent(
      `@Component({template: 'abc123'}) export class MyCmp`,
      `                       abc123                      `,
    );
  });

  it('can locate multiple template literals', () => {
    assertEmbeddedHTMLContent(
      `@Component({template: 'abc123'}) @Component({template: 'xyz789'})`,
      `                       abc123                           xyz789   `,
    );
  });

  it('works as expected for CRLF', () => {
    assertEmbeddedHTMLContent(
      `@Component({template: 'abc123'})\r\nexport class MyComponent {}`,
      `                       abc123   \ \n                           `,
    );
    // Note that the \r is replaced with a whitespace. As long as we preserve the same document
    // length and line break locations, our results will be just fine. It doesn't matter that we
    // have an extra whitespace character at the end of the line for folding ranges.
  });

  describe('SCSS support', () => {
    it('strips everything but the styles string literal', () => {
      assertEmbeddedSCSSContent(
        `@Component({styles: ['abc123']}) export class MyCmp`,
        `                      abc123                       `,
      );
    });

    it('can locate multiple style literals', () => {
      assertEmbeddedSCSSContent(
        `@Component({styles: ['abc123', 'xyz789']})`,
        `                      abc123    xyz789    `,
      );
    });

    it('can locate direct assignment to styles', () => {
      assertEmbeddedSCSSContent(`@Component({styles: 'abc123'})`, `                     abc123   `);
    });
  });

  describe('CSS support in templates', () => {
    it('can locate style bindings in template', () => {
      const input___ = `@Component({template: \`<div [style]="{color: 'red', 'font-weight': 'bold'}"></div>\`})`;
      const expected = `                                   * {color:  red ;  font-weight :  bold }           `;
      // note: the shift is due to the escaped backticks.
      assertEmbeddedCSSContent(input___, expected);
    });

    it('ignores regular templates in SCSS content', () => {
      // styles should be processed by SCSS, template ignored
      const input_______ = `@Component({styles: ['a { }'], template: '<div [style]="{}"></div>'})`;
      const expectedSCSS = `                      a { }                                          `;
      assertEmbeddedSCSSContent(input_______, expectedSCSS);
    });
  });
});
