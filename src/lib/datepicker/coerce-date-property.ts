/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DateAdapter} from '@angular/material/core';


/**
 * Function that attempts to coerce a value to a date using a DateAdapter. Date instances, null,
 * and undefined will be passed through. Empty strings will be coerced to null. Valid ISO 8601
 * strings (https://www.ietf.org/rfc/rfc3339.txt) will be coerced to dates. All other values will
 * result in an error being thrown.
 * @param adapter The date adapter to use for coercion
 * @param value The value to coerce.
 * @return A date object coerced from the value.
 * @throws Throws when the value cannot be coerced.
 */
export function coerceDateProperty<D>(adapter: DateAdapter<D>, value: any): D | null {
  if (typeof value === 'string') {
    if (value == '') {
      value = null;
    } else {
      value = adapter.fromIso8601(value) || value;
    }
  }
  if (value == null || adapter.isDateInstance(value)) {
    return value;
  }
  throw Error(`Datepicker: Value must be either a date object recognized by the DateAdapter or ` +
              `an ISO 8601 string. Instead got: ${value}`);
}
