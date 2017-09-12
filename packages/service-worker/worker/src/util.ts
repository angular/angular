/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Adapter} from './adapter';

export function isNavigationRequest(req: Request, adapter: Adapter): boolean {
  if (req.mode !== 'navigate') {
    return false;
  }
  if (req.url.indexOf('__') !== -1) {
    return false;
  }
  if (hasFileExtension(req.url, adapter)) {
    return false;
  }
  if (!acceptsTextHtml(req)) {
    return false;
  }
  return true;
}

function hasFileExtension(url: string, adapter: Adapter): boolean {
  const path = adapter.getPath(url);
  const lastSegment = path.split('/').pop() !;
  return lastSegment.indexOf('.') !== -1;
}

function acceptsTextHtml(req: Request): boolean {
  const accept = req.headers.get('Accept');
  if (accept === null) {
    return false;
  }
  const values = accept.split(',');
  return values.some(value => value.trim().toLowerCase() === 'text/html');
}
