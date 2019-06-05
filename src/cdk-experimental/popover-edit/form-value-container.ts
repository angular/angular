/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface Entry<FormValue> {
  value?: FormValue;
}

/**
 * A convenience class for preserving unsaved form state while an edit lens is closed.
 *
 * Example usage:
 * class MyComponent {
 *   readonly nameEditValues = new FormValueContainer&lt;Item, {name: string}&gt;();
 * }
 *
 * &lt;form cdkEditControl [(cdkEditControlPreservedFormValue)]="nameEditValues.for(item).value"&gt;
 */
export class FormValueContainer<Key extends object, FormValue> {
  private _formValues = new WeakMap<Key, Entry<FormValue>>();

  for(key: Key): Entry<FormValue> {
    const _formValues = this._formValues;

    let entry = _formValues.get(key);
    if (!entry) {
      // Expose entry as an object so that we can [(two-way)] bind to its value member
      entry = {};
      _formValues.set(key, entry);
    }

    return entry;
  }
}
