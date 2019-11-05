/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {DirectiveDef, HostBindingsFunction} from '../../../src/render3/interfaces/definition';

export function createDirectiveDef(selector: string, hostBindings: HostBindingsFunction<any>) {
  const def: DirectiveDef<any> = {
    inputs: {},
    declaredInputs: {},
    outputs: {},
    type: ((() => {}) as any),
    factory: () => ({}),
    providersResolver: null,
    exportAs: null,
    contentQueries: null,
    template: null,
    viewQuery: null,
    hostBindings: hostBindings,
    selectors: [['', selector, '']],
    onChanges: null,
    onInit: null,
    doCheck: null,
    afterContentInit: null,
    afterContentChecked: null,
    afterViewInit: null,
    afterViewChecked: null,
    onDestroy: null,
    features: null,
    setInput: null,
  } as DirectiveDef<any>;
  return def;
}
