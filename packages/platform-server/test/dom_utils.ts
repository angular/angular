/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * The name of the attribute that contains a slot index
 * inside the TransferState storage where hydration info
 * could be found.
 */
const NGH_ATTR_NAME = 'ngh';
const EMPTY_TEXT_NODE_COMMENT = 'ngetn';
const TEXT_NODE_SEPARATOR_COMMENT = 'ngtns';

const NGH_ATTR_REGEXP = new RegExp(` ${NGH_ATTR_NAME}=".*?"`, 'g');
const EMPTY_TEXT_NODE_REGEXP = new RegExp(`<!--${EMPTY_TEXT_NODE_COMMENT}-->`, 'g');
const TEXT_NODE_SEPARATOR_REGEXP = new RegExp(`<!--${TEXT_NODE_SEPARATOR_COMMENT}-->`, 'g');

/**
 * Drop utility attributes such as `ng-version`, `ng-server-context` and `ngh`,
 * so that it's easier to make assertions in tests.
 */
export function stripUtilAttributes(html: string, keepNgh: boolean): string {
  html = html
    .replace(/ ng-version=".*?"/g, '')
    .replace(/ ng-server-context=".*?"/g, '')
    .replace(/ ng-reflect-(.*?)=".*?"/g, '')
    .replace(/ _nghost(.*?)=""/g, '')
    .replace(/ _ngcontent(.*?)=""/g, '');
  if (!keepNgh) {
    html = html
      .replace(NGH_ATTR_REGEXP, '')
      .replace(EMPTY_TEXT_NODE_REGEXP, '')
      .replace(TEXT_NODE_SEPARATOR_REGEXP, '');
  }
  return html;
}

/**
 * Extracts a portion of HTML located inside of the `<body>` element.
 * This content belongs to the application view (and supporting TransferState
 * scripts) rendered on the server.
 */
export function getAppContents(html: string): string {
  const result = stripUtilAttributes(html, true).match(/<body>(.*?)<\/body>/s);
  return result ? result[1] : html;
}
