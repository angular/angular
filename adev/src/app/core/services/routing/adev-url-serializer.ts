/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DefaultUrlSerializer, UrlTree} from '@angular/router';

/**
 * Custom URL serializer extending the default behavior
 * with Adev-specific behavior.
 */
export class AdevUrlSerializer extends DefaultUrlSerializer {
  override parse(url: string): UrlTree {
    // Since the app host/server is decoding encoded forward slashes,
    // we perform this on the client as well in order to maintain
    // a consistent behavior between the two environments and
    // avoid opening a different page on client hydration (presumably, 404).
    url = url.replaceAll(/%2(F|f)/g, '/');

    return super.parse(url);
  }
}
