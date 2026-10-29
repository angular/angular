/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ngContentSignature} from '../src/dependency_templates.js';

describe('ngContentSignature', () => {
  it('should be empty for a template without <ng-content>', () => {
    expect(ngContentSignature('<div>{{value}}</div>')).toBe('');
  });

  it('should list the <ng-content> tags in order', () => {
    expect(
      ngContentSignature(
        '<header><ng-content select="[slot=title]"></ng-content></header><ng-content/>',
      ),
    ).toBe('<ng-content select="[slot=title]">\n<ng-content/>');
  });

  it('should not confuse <ng-container> with <ng-content>', () => {
    expect(ngContentSignature('<ng-container></ng-container>')).toBe('');
  });

  it('should match tag names case-insensitively', () => {
    expect(ngContentSignature('<NG-CONTENT></NG-CONTENT>')).toBe('<NG-CONTENT>');
  });

  it('should not end a tag at a > inside a quoted attribute value', () => {
    const before = ngContentSignature('<ng-content select="div > span"></ng-content>');
    const after = ngContentSignature('<ng-content select="div > p"></ng-content>');
    expect(before).toBe('<ng-content select="div > span">');
    expect(after).not.toBe(before);
    expect(ngContentSignature(`<ng-content select='a[title=">"]'></ng-content>`)).toBe(
      `<ng-content select='a[title=">"]'>`,
    );
  });

  it('should ignore <ng-content> inside HTML comments', () => {
    expect(ngContentSignature('<!-- <ng-content></ng-content> --><p></p>')).toBe('');
    expect(ngContentSignature('<!-- <ng-content></ng-content> -->')).not.toBe(
      ngContentSignature('<ng-content></ng-content>'),
    );
  });

  it('should tolerate unterminated comments and tags', () => {
    expect(ngContentSignature('<!-- <ng-content>')).toBe('');
    expect(ngContentSignature('<ng-content select="a')).toBe('<ng-content select="a');
    expect(ngContentSignature('<ng-content')).toBe('<ng-content');
  });
});
