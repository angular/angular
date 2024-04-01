/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Provider, ɵɵdefineInjectable} from '../di';
import {ElementRef} from '../linker';

import {RElement} from './interfaces/renderer_dom';

/**
 * An internal symbol used by unwrapElementRefInternal() for
 * framework code to access the underlying native element.
 */
const INTERNAL_NATIVE_ELEMENT = Symbol();

export abstract class ElementRefFactory {
  abstract create(nativeElement: RElement): ElementRef;

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: ElementRefFactory,
    providedIn: 'root',
    factory: () => new DefaultElementRefFactory(),
  });
}

/**
 * An ElementRefFactory that vends normal ElementRef instances,
 * when running on the browser or with DOM emulation enabled.
 */
export class DefaultElementRefFactory extends ElementRefFactory {
  override create(nativeElement: RElement): ElementRef<any> {
    return new ElementRef(nativeElement);
  }
}

/**
 * An ElementRefFactory that creates ElementRef instances
 * when running on the server with DOM emulation disabled.
 */
class ServerElementRefFactory extends ElementRefFactory {
  override create(nativeElement: RElement): ElementRef<any> {
    return new Proxy(new ElementRef(null), {
      get(target, prop, receiver) {
        switch (prop) {
          case 'nativeElement':
            throw new Error(
                'Attempted to access ElementRef#nativeElement during server rendering.');

          case INTERNAL_NATIVE_ELEMENT:
            return nativeElement;

          default:
            return Reflect.get(target, prop, receiver);
        }
      }
    });
  }
}

/**
 * Returns a set of providers that configures the ServerElementRefFactory.
 */
export function withServerElementRefFactory(): Provider[] {
  return [{
    provide: ElementRefFactory,
    useClass: ServerElementRefFactory,
  }];
}

/**
 * Unwraps an ElementRef into a native element, even if DOM emulation
 * is disabled. This is an escape hatch that for internal framework use
 * only. Call sites should be migrated to alternative approaches.
 */
export function unwrapElementRefInternal<T>(value: ElementRef<T>): T {
  const nativeElement = (value as any)[INTERNAL_NATIVE_ELEMENT];
  return (nativeElement ?? value.nativeElement) as unknown as T;
}
