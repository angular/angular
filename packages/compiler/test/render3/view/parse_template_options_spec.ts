/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceSpan} from '../../../src/parse_util';
import {Comment} from '../../../src/render3/r3_ast';
import {parseTemplate} from '../../../src/render3/view/template';

describe('collectCommentNodes', () => {
  it('should include an array of HTML comment nodes on the returned R3 AST', () => {
    const html = `
      <!-- eslint-disable-next-line -->
      <div *ngFor="let item of items">
        {{item.name}}
      </div>

      <div>
        <p>
          <!-- some nested comment -->
          <span>Text</span>
        </p>
      </div>
    `;

    const templateNoCommentsOption = parseTemplate(html, '', {});
    expect(templateNoCommentsOption.commentNodes).toBeUndefined();

    const templateCommentsOptionDisabled = parseTemplate(html, '', {collectCommentNodes: false});
    expect(templateCommentsOptionDisabled.commentNodes).toBeUndefined();

    const templateCommentsOptionEnabled = parseTemplate(html, '', {collectCommentNodes: true});
    expect(templateCommentsOptionEnabled.commentNodes!.length).toEqual(2);
    expect(templateCommentsOptionEnabled.commentNodes![0]).toBeInstanceOf(Comment);
    expect(templateCommentsOptionEnabled.commentNodes![0].value)
        .toEqual('eslint-disable-next-line');
    expect(templateCommentsOptionEnabled.commentNodes![0].sourceSpan)
        .toBeInstanceOf(ParseSourceSpan);
    expect(templateCommentsOptionEnabled.commentNodes![1]).toBeInstanceOf(Comment);
    expect(templateCommentsOptionEnabled.commentNodes![1].value).toEqual('some nested comment');
    expect(templateCommentsOptionEnabled.commentNodes![1].sourceSpan)
        .toBeInstanceOf(ParseSourceSpan);
  });
});
