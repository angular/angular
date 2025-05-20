/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';

/** Convenience component to render raw html */
export function RawHtml(props: {value: string; className?: string}) {
  // Unfortunately, there does not seem to be a way to render the raw html
  // into a text node without introducing a div.
  return <div className={props.className} dangerouslySetInnerHTML={{__html: props.value}}></div>;
}
