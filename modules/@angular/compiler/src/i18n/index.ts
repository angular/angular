/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OpaqueToken} from '@angular/core';

export {HtmlParser} from './html_parser';
export {MessageBundle} from './message_bundle';
export {Serializer} from './serializers/serializer';
export {Xmb} from './serializers/xmb';
export {Xtb} from './serializers/xtb';

export const TRANSLATIONS = new OpaqueToken('Translations');
