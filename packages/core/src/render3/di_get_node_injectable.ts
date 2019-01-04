/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { setInjectImplementation } from '../di/injector_compatibility';
import { NodeInjectorFactory, isFactory } from './interfaces/injector';
import { TElementNode } from './interfaces/node';
import { LView, TData } from './interfaces/view';
import { getLView, getPreviousOrParentTNode, setTNodeAndViewData } from './state';
import { stringify } from './util';
import { unwrapOnChangesDirectiveWrapper } from './onchanges_util';



let includeViewProviders = false;

function setIncludeViewProviders(v: boolean): boolean {
  const oldValue = includeViewProviders;
  includeViewProviders = v;
  return oldValue;
}

/**
 * Returns a boolean that defines if the call to `inject` should include `viewProviders` in its resolution.
 *
 * This is set to true when we try to instantiate a component. This value is reset in
 * `getNodeInjectable` to a value which matches the declaration location of the token about to be
 * instantiated. This is done so that if we are injecting a token which was declared outside of
 * `viewProviders` we don't accidentally pull `viewProviders` in.
 *
 * Example:
 *
 * ```
 * @Injectable()
 * class MyService {
 *   constructor(public value: String) {}
 * }
 *
 * @Component({
 *   providers: [
 *     MyService,
 *     {provide: String, value: 'providers' }
 *   ]
 *   viewProviders: [
 *     {provide: String, value: 'viewProviders'}
 *   ]
 * })
 * class MyComponent {
 *   constructor(myService: MyService, value: String) {
 *     // We expect that Component can see into `viewProviders`.
 *     expect(value).toEqual('viewProviders');
 *     // `MyService` was not declared in `viewProviders` hence it can't see it.
 *     expect(myService.value).toEqual('providers');
 *   }
 * }
 *
 * ```
 */
export function shouldIncludeViewProviders(): boolean {
  return includeViewProviders;
}

/**
* Retrieve or instantiate the injectable from the `lData` at particular `index`.
*
* This function checks to see if the value has already been instantiated and if so returns the
* cached `injectable`. Otherwise if it detects that the value is still a factory it
* instantiates the `injectable` and caches the value.
*/
export function getNodeInjectable(tData: TData, lData: LView, index: number, tNode: TElementNode): any {
  let value = lData[index];
  if (isFactory(value)) {
    const factory: NodeInjectorFactory = value;
    if (factory.resolving) {
      throw new Error(`Circular dep for ${stringify(tData[index])}`);
    }
    const previousIncludeViewProviders = setIncludeViewProviders(factory.canSeeViewProviders);
    factory.resolving = true;
    let previousInjectImplementation;
    if (factory.injectImpl) {
      previousInjectImplementation = setInjectImplementation(factory.injectImpl);
    }
    const savePreviousOrParentTNode = getPreviousOrParentTNode();
    const saveLView = getLView();
    setTNodeAndViewData(tNode, lData);
    try {
      value = lData[index] = factory.factory(null, tData, lData, tNode);
    }
    finally {
      if (factory.injectImpl)
        setInjectImplementation(previousInjectImplementation);
      setIncludeViewProviders(previousIncludeViewProviders);
      factory.resolving = false;
      setTNodeAndViewData(savePreviousOrParentTNode, saveLView);
    }
  }
  return unwrapOnChangesDirectiveWrapper(value);
}
