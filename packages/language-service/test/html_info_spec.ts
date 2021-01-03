/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DomElementSchemaRegistry} from '@angular/compiler';
import {SchemaInformation} from '../src/html_info';

describe('html_info', () => {
  const domRegistry = new DomElementSchemaRegistry();

  it('should have the same elements as the dom registry', () => {
    // If this test fails, replace the SCHEMA constant in html_info with the one
    // from dom_element_schema_registry and also verify the code to interpret
    // the schema is the same.
    const domElements = domRegistry.allKnownElementNames();
    const infoElements = SchemaInformation.instance.allKnownElements();
    const uniqueToDom = uniqueElements(infoElements, domElements);
    const uniqueToInfo = uniqueElements(domElements, infoElements);
    expect(uniqueToDom).toEqual([]);
    expect(uniqueToInfo).toEqual([]);
  });

  it('should have at least a sub-set of properties', () => {
    const elements = SchemaInformation.instance.allKnownElements();
    for (const element of elements) {
      for (const prop of SchemaInformation.instance.propertiesOf(element)) {
        expect(domRegistry.hasProperty(element, prop, [])).toBeTrue();
      }
    }
  });
});

function uniqueElements<T>(a: T[], b: T[]): T[] {
  const s = new Set<T>();
  for (const aItem of a) {
    s.add(aItem);
  }
  const result: T[] = [];
  const reported = new Set<T>();
  for (const bItem of b) {
    if (!s.has(bItem) && !reported.has(bItem)) {
      reported.add(bItem);
      result.push(bItem);
    }
  }
  return result;
}
