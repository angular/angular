/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldIncompatibilityReason} from '../signal-migration/src';
import {
  nonIgnorableFieldIncompatibilities,
  pickFieldIncompatibility,
} from '../signal-migration/src/passes/problematic_patterns/incompatibility';
import {ClassFieldUniqueKey} from '../signal-migration/src/passes/reference_resolution/known_fields';
import type {KnownQueries} from './known_queries';
import type {GlobalUnitData} from './migration';

export function markFieldIncompatibleInMetadata(
  data: GlobalUnitData['problematicQueries'],
  id: ClassFieldUniqueKey,
  reason: FieldIncompatibilityReason,
) {
  const existing = data[id as ClassFieldUniqueKey];
  if (existing === undefined) {
    data[id as ClassFieldUniqueKey] = {
      fieldReason: reason,
      classReason: null,
    };
  } else if (existing.fieldReason === null) {
    existing.fieldReason = reason;
  } else {
    existing.fieldReason = pickFieldIncompatibility(
      {reason, context: null},
      {reason: existing.fieldReason, context: null},
    ).reason;
  }
}

export function filterBestEffortIncompatibilities(knownQueries: KnownQueries) {
  for (const query of Object.values(knownQueries.globalMetadata.problematicQueries)) {
    if (
      query.fieldReason !== null &&
      !nonIgnorableFieldIncompatibilities.includes(query.fieldReason)
    ) {
      query.fieldReason = null;
    }
  }
}
