/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {anchorTarget} from '../helpers';
import {RendererApi} from 'marked';

export const linkRender: RendererApi['link'] = (href, title, text) => {
  const titleAttribute = title ? ` title=${title}` : '';
  return `<a href="${href}"${titleAttribute}${anchorTarget(href)}>${text}</a>`;
};
