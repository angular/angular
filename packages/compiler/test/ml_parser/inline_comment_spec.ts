/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as html from '../../src/ml_parser/ast';
import {Parser} from '../../src/ml_parser/parser';
import {TagContentType} from '../../src/ml_parser/tags';

describe('Inline comments in attributes', () => {
  const parser = new Parser((tagName) => ({
    closedByParent: false,
    implicitNamespacePrefix: null,
    isVoid: false,
    ignoreFirstLf: false,
    canSelfClose: false,
    preventNamespaceInheritance: false,
    isClosedByChild: () => false,
    getContentType: () => TagContentType.PARSABLE_DATA,
  }));

  it('should ignore single line comments between attributes', () => {
    const source = `
      <div 
        // comment 1
        attr1="value1"
        // comment 2
        attr2="value2"
      ></div>
    `;
    const result = parser.parse(source, 'url');
    expect(result.errors.length).toBe(0);
    const element = result.rootNodes.find((n) => n instanceof html.Element) as html.Element;
    expect(element.attrs.length).toBe(2);
    expect(element.attrs[0].name).toBe('attr1');
    expect(element.attrs[1].name).toBe('attr2');
  });

  it('should ignore single line comments between inputs and outputs', () => {
    const source = `
      <div 
        // comment 1
        [input]="value1"
        // comment 2
        (output)="handler()"
      ></div>
    `;
    const result = parser.parse(source, 'url');
    expect(result.errors.length).toBe(0);
    const element = result.rootNodes.find((n) => n instanceof html.Element) as html.Element;
    expect(element.attrs.length).toBe(2);
    expect(element.attrs[0].name).toBe('[input]');
    expect(element.attrs[1].name).toBe('(output)');
  });

  it('should ignore single line comments at the end of tag', () => {
    const source = `<div attr1="value1" // comment 
    ></div>`;
    const result = parser.parse(source, 'url');
    expect(result.errors.length).toBe(0);
    const element = result.rootNodes.find((n) => n instanceof html.Element) as html.Element;
    expect(element.attrs.length).toBe(1);
    expect(element.attrs[0].name).toBe('attr1');
  });

  it('should ignore multi-line comments between attributes', () => {
    const source = `
      <div 
        /* comment 1 */
        attr1="value1"
        /* 
           comment 2 
           spanning multiple lines
        */
        attr2="value2"
      ></div>
    `;
    const result = parser.parse(source, 'url');
    expect(result.errors.length).toBe(0);
    const element = result.rootNodes.find((n) => n instanceof html.Element) as html.Element;
    expect(element.attrs.length).toBe(2);
    expect(element.attrs[0].name).toBe('attr1');
    expect(element.attrs[1].name).toBe('attr2');
  });

  it('should ignore multi-line comments at the end of tag', () => {
    const source = `<div attr1="value1" /* comment */ ></div>`;
    const result = parser.parse(source, 'url');
    expect(result.errors.length).toBe(0);
    const element = result.rootNodes.find((n) => n instanceof html.Element) as html.Element;
    expect(element.attrs.length).toBe(1);
    expect(element.attrs[0].name).toBe('attr1');
  });

  it('should handle * inside multi-line comments', () => {
    const source = `<div attr1="value1" /* comment with * inside */ attr2="value2"></div>`;
    const result = parser.parse(source, 'url');
    expect(result.errors.length).toBe(0);
    const element = result.rootNodes.find((n) => n instanceof html.Element) as html.Element;
    expect(element.attrs.length).toBe(2);
    expect(element.attrs[0].name).toBe('attr1');
    expect(element.attrs[1].name).toBe('attr2');
  });

  it('should maintain correct source spans with comments', () => {
    // 0         1         2         3         4
    // 0123456789012345678901234567890123456789012345
    // <div attr1="a" /* comment */ attr2="b"></div>
    const source = `<div attr1="a" /* comment */ attr2="b"></div>`;
    const result = parser.parse(source, 'url');
    expect(result.errors.length).toBe(0);
    const element = result.rootNodes.find((n) => n instanceof html.Element) as html.Element;
    expect(element.attrs.length).toBe(2);

    const attr1 = element.attrs[0];
    expect(attr1.name).toBe('attr1');
    expect(attr1.sourceSpan.start.offset).toBe(5);
    expect(attr1.sourceSpan.end.offset).toBe(14);

    const attr2 = element.attrs[1];
    expect(attr2.name).toBe('attr2');
    // <div attr1="a" /* comment */ attr2="b"></div>
    // 0123456789012345678901234567890123456789
    // attr1="a" is 5-14 (length 9)
    // " " is 14-15
    // /* comment */ is 15-28 (length 13)
    // " " is 28-29
    // attr2="b" is 29-38
    expect(attr2.sourceSpan.start.offset).toBe(29);
    expect(attr2.sourceSpan.end.offset).toBe(38);
  });
});
