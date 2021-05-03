/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {ServerStylesHost} from '@angular/platform-server/src/styles_host';


(function() {
if (getDOM().supportsDOMEvents) return;  // NODE only

describe('ServerStylesHost', () => {
  let ssh: ServerStylesHost;
  let documentHead: Element;
  beforeEach(() => {
    const doc = getDOM().createHtmlDocument();
    ssh = new ServerStylesHost(doc, '');
    documentHead = doc.head;
    doc.querySelector('title')?.remove();
  });

  it('should add existing styles', () => {
    ssh.addStyles(['a {};']);
    expect(documentHead.innerHTML).toEqual('<style>a {};</style>');
  });

  it('should add new styles to hosts', () => {
    ssh.addStyles(['a {};']);
    expect(documentHead.innerHTML).toEqual('<style>a {};</style>');
  });

  it('should add styles only once to hosts', () => {
    ssh.addStyles(['a {};']);
    ssh.addStyles(['a {};']);
    expect(documentHead.innerHTML).toEqual('<style>a {};</style>');
  });

  it('should remove style nodes on destroy', () => {
    ssh.addStyles(['a {};']);
    expect(documentHead.innerHTML).toEqual('<style>a {};</style>');

    ssh.ngOnDestroy();
    expect(documentHead.innerHTML).toEqual('');
  });
});
})();
