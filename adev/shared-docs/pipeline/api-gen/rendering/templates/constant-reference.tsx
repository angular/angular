/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {ConstantEntryRenderable} from '../entities/renderables.mjs';
import {HeaderApi} from './header-api';
import {SectionDescription} from './section-description';
import {SectionUsageNotes} from './section-usage-notes';
import {SectionApi} from './section-api';
import {API_REFERENCE_CONTAINER} from '../styling/css-classes.mjs';
import {DeprecationWarning} from './deprecation-warning';

/** Component to render a constant API reference document. */
export function ConstantReference(entry: ConstantEntryRenderable) {
  return (
    <div className={API_REFERENCE_CONTAINER}>
      <HeaderApi entry={entry} />
      <DeprecationWarning entry={entry} />
      <SectionApi entry={entry} />
      <SectionDescription entry={entry} />
      <SectionUsageNotes entry={entry} />
    </div>
  );
}
