/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */



import {InjectionToken} from '../../di/interfaces/injection_token';
import {Type} from '../../interfaces/type';
import {assertDefined, assertEqual} from '../../utils/assert';
import {NG_ELEMENT_ID} from '../interfaces/fields';
import {LView, TData, TView} from '../interfaces/view';



/**
 * The number of slots in each bloom filter (used by DI). The larger this number, the fewer
 * directives that will share slots, and thus, the fewer false positives when checking for
 * the existence of a directive.
 */
const BLOOM_SIZE = 256;
const BLOOM_MASK = BLOOM_SIZE - 1;

/** Counter used to generate unique IDs for directives. */
let nextNgElementId = 0;

/**
 * Returns the bit in an injector's bloom filter that should be used to determine whether or not
 * the directive might be provided by the injector.
 *
 * When a directive is public, it is added to the bloom filter and given a unique ID that can be
 * retrieved on the Type. When the directive isn't public or the token is not a directive `null`
 * is returned as the node injector can not possibly provide that token.
 *
 * @param token the injection token
 * @returns the matching bit to check in the bloom filter or `null` if the token is not known.
 */
export function bloomHashBitOrFactory(token: Type<any>| InjectionToken<any>| string): number|
    Function|undefined {
  ngDevMode && assertDefined(token, 'token must be defined');
  if (typeof token === 'string') {
    return token.charCodeAt(0) || 0;
  }
  const tokenId: number|undefined = (token as any)[NG_ELEMENT_ID];
  return typeof tokenId === 'number' ? tokenId & BLOOM_MASK : tokenId;
}

export function bloomHasToken(
    bloomHash: number, injectorIndex: number, injectorView: LView | TData) {
  // Create a mask that targets the specific bit associated with the directive we're looking for.
  // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
  // to bit positions 0 - 31 in a 32 bit integer.
  const mask = 1 << bloomHash;
  const b7 = bloomHash & 0x80;
  const b6 = bloomHash & 0x40;
  const b5 = bloomHash & 0x20;

  // Our bloom filter size is 256 bits, which is eight 32-bit bloom filter buckets:
  // bf0 = [0 - 31], bf1 = [32 - 63], bf2 = [64 - 95], bf3 = [96 - 127], etc.
  // Get the bloom filter value from the appropriate bucket based on the directive's bloomBit.
  let value: number;

  if (b7) {
    value = b6 ? (b5 ? injectorView[injectorIndex + 7] : injectorView[injectorIndex + 6]) :
                 (b5 ? injectorView[injectorIndex + 5] : injectorView[injectorIndex + 4]);
  } else {
    value = b6 ? (b5 ? injectorView[injectorIndex + 3] : injectorView[injectorIndex + 2]) :
                 (b5 ? injectorView[injectorIndex + 1] : injectorView[injectorIndex]);
  }

  // If the bloom filter value has the bit corresponding to the directive's bloomBit flipped on,
  // this injector is a potential match.
  return !!(value & mask);
}

/**
 * Registers this directive as present in its node's injector by flipping the directive's
 * corresponding bit in the injector's bloom filter.
 *
 * @param injectorIndex The index of the node injector where this token should be registered
 * @param tView The TView for the injector's bloom filters
 * @param type The directive token to register
 */
export function bloomAdd(
    injectorIndex: number, tView: TView, type: Type<any>| InjectionToken<any>| string): void {
  ngDevMode && assertEqual(tView.firstTemplatePass, true, 'expected firstTemplatePass to be true');
  let id: number|undefined =
      typeof type !== 'string' ? (type as any)[NG_ELEMENT_ID] : type.charCodeAt(0) || 0;

  // Set a unique ID on the directive type, so if something tries to inject the directive,
  // we can easily retrieve the ID and hash it into the bloom bit that should be checked.
  if (id == null) {
    id = (type as any)[NG_ELEMENT_ID] = nextNgElementId++;
  }

  // We only have BLOOM_SIZE (256) slots in our bloom filter (8 buckets * 32 bits each),
  // so all unique IDs must be modulo-ed into a number from 0 - 255 to fit into the filter.
  const bloomBit = id & BLOOM_MASK;

  // Create a mask that targets the specific bit associated with the directive.
  // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
  // to bit positions 0 - 31 in a 32 bit integer.
  const mask = 1 << bloomBit;

  // Use the raw bloomBit number to determine which bloom filter bucket we should check
  // e.g: bf0 = [0 - 31], bf1 = [32 - 63], bf2 = [64 - 95], bf3 = [96 - 127], etc
  const b7 = bloomBit & 0x80;
  const b6 = bloomBit & 0x40;
  const b5 = bloomBit & 0x20;
  const tData = tView.data as number[];

  if (b7) {
    b6 ? (b5 ? (tData[injectorIndex + 7] |= mask) : (tData[injectorIndex + 6] |= mask)) :
         (b5 ? (tData[injectorIndex + 5] |= mask) : (tData[injectorIndex + 4] |= mask));
  } else {
    b6 ? (b5 ? (tData[injectorIndex + 3] |= mask) : (tData[injectorIndex + 2] |= mask)) :
         (b5 ? (tData[injectorIndex + 1] |= mask) : (tData[injectorIndex] |= mask));
  }
}