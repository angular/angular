/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// We are temporarily importing the existing viewEngine from core so we can be sure we are
// correctly implementing its interfaces for backwards compatibility.
import * as viewEngine from '../core';
import {BLOOM_SIZE, NG_ELEMENT_ID, getOrCreateNodeInjector} from './instructions';
import {LContainer, LNodeFlags, LNodeInjector} from './interfaces';
import {ComponentTemplate, DirectiveDef} from './public_interfaces';
import {stringify, notImplemented} from './util';

/**
 * Injection flags for DI.
 *
 * Optional: The dependency is not required.
 *
 * CheckSelf: Should check the current node for the dependency.
 *
 * CheckParent: Should check parent nodes for the dependency.
 */
export const enum InjectFlags {
  Optional = 1 << 0,
  CheckSelf = 1 << 1,
  CheckParent = 1 << 2,
  Default = CheckSelf | CheckParent
}

/**
 * Constructs an injection error with the given text and token.
 *
 * @param text The text of the error
 * @param token The token associated with the error
 * @returns The error that was created
 */
function createInjectionError(text: string, token: any) {
  return new Error(`ElementInjector: ${text} [${stringify(token)}]`);
}

/**
 * Searches for an instance of the given directive type up the injector tree and returns
 * that instance if found.
 *
 * Specifically, it gets the bloom filter bit associated with the directive (see bloomHashBit),
 * checks that bit against the bloom filter structure to identify an injector that might have
 * the directive (see bloomFindPossibleInjector), then searches the directives on that injector
 * for a match.
 *
 * If not found, it will propagate up to the next parent injector until the token
 * is found or the top is reached.
 *
 * @param token The directive type to search for
 * @param flags Injection flags (e.g. CheckParent)
 * @returns The instance found
 */
export function inject<T>(token: viewEngine.Type<T>, flags?: InjectFlags): T {
  const di = getOrCreateNodeInjector();
  const bloomHash = bloomHashBit(token);
  if (bloomHash === null) {
    const moduleInjector = di.injector;
    if (!moduleInjector) {
      throw createInjectionError('NotFound', token);
    }
    moduleInjector.get(token);
  } else {
    let injector: LNodeInjector|null = di;
    while (injector) {
      injector = bloomFindPossibleInjector(injector, bloomHash);
      if (injector) {
        const node = injector.node;
        const flags = node.flags;
        let size = flags & LNodeFlags.SIZE_MASK;
        if (size !== 0) {
          size = size >> LNodeFlags.SIZE_SHIFT;
          const start = flags >> LNodeFlags.INDX_SHIFT;
          const ngStaticData = node.view.ngStaticData;
          for (let i = start, ii = start + size; i < ii; i++) {
            const def = ngStaticData[i] as DirectiveDef<any>;
            if (def.diPublic && def.type == token) {
              return node.view.data[i];
            }
          }
        }
        injector = injector.parent;
      }
    }
  }
  throw createInjectionError('Not found', token);
}

/**
 * Given a directive type, this function returns the bit in an injector's bloom filter
 * that should be used to determine whether or not the directive is present.
 *
 * When the directive was added to the bloom filter, it was given a unique ID that can be
 * retrieved on the class. Since there are only BLOOM_SIZE slots per bloom filter, the directive's
 * ID must be modulo-ed by BLOOM_SIZE to get the correct bloom bit (directives share slots after
 * BLOOM_SIZE is reached).
 *
 * @param type The directive type
 * @returns The bloom bit to check for the directive
 */
function bloomHashBit(type: viewEngine.Type<any>): number|null {
  let id: number|undefined = (type as any)[NG_ELEMENT_ID];
  return typeof id === 'number' ? id % BLOOM_SIZE : null;
}

/**
 * Finds the closest injector that might have a certain directive.
 *
 * Each directive corresponds to a bit in an injector's bloom filter. Given the bloom bit to
 * check and a starting injector, this function propagates up injectors until it finds an
 * injector that contains a 1 for that bit in its bloom filter. A 1 indicates that the
 * injector may have that directive. It only *may* have the directive because directives begin
 * to share bloom filter bits after the BLOOM_SIZE is reached, and it could correspond to a
 * different directive sharing the bit.
 *
 * Note: We can skip checking further injectors up the tree if an injector's cbf structure
 * has a 0 for that bloom bit. Since cbf contains the merged value of all the parent
 * injectors, a 0 in the bloom bit indicates that the parents definitely do not contain
 * the directive and do not need to be checked.
 *
 * @param injector The starting injector to check
 * @param  bloomBit The bit to check in each injector's bloom filter
 * @returns An injector that might have the directive
 */
export function bloomFindPossibleInjector(injector: LNodeInjector, bloomBit: number): LNodeInjector|
    null {
  const mask = 1 << bloomBit;
  let di: LNodeInjector|null = injector;
  while (di) {
    // See if the current injector may have the value.
    let value: number =
        bloomBit < 64 ? (bloomBit < 32 ? di.bf0 : di.bf1) : (bloomBit < 96 ? di.bf2 : di.bf3);
    if ((value & mask) === mask) {
      return di;
    }
    // See if the parent injectors may have the value
    value =
        bloomBit < 64 ? (bloomBit < 32 ? di.cbf0 : di.cbf1) : (bloomBit < 96 ? di.cbf2 : di.cbf3);
    // Only go to parent if parent may have value otherwise exit.
    di = (value & mask) ? di.parent : null;
  }
  return null;
}

/**
 * Creates an ElementRef and stores it on the injector. Or, if the ElementRef already
 * exists, retrieves the existing ElementRef.
 *
 * @returns The ElementRef instance to use
 */
export function injectElementRef(): viewEngine.ElementRef {
  let di = getOrCreateNodeInjector();
  return di.elementRef || (di.elementRef = new ElementRef(di.node.native));
}

/** A ref to a node's native element. */
class ElementRef implements viewEngine.ElementRef {
  readonly nativeElement: any;
  constructor(nativeElement: any) { this.nativeElement = nativeElement; }
}

/**
 * Creates a TemplateRef and stores it on the injector. Or, if the TemplateRef already
 * exists, retrieves the existing TemplateRef.
 *
 * @returns The TemplateRef instance to use
 */
export function injectTemplateRef(): viewEngine.TemplateRef<any> {
  let di = getOrCreateNodeInjector();
  const data = (di.node as LContainer).data;
  if (data === null || data.template === null) {
    throw createInjectionError('Directive does not have a template.', null);
  }
  return di.templateRef ||
      (di.templateRef = new TemplateRef<any>(injectElementRef(), data.template));
}

/** A ref to a particular template. */
class TemplateRef<T> implements viewEngine.TemplateRef<T> {
  readonly elementRef: viewEngine.ElementRef;

  constructor(elementRef: viewEngine.ElementRef, template: ComponentTemplate<T>) {
    this.elementRef = elementRef;
  }

  createEmbeddedView(context: T): viewEngine.EmbeddedViewRef<T> { throw notImplemented(); }
}

/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export function injectViewContainerRef(): viewEngine.ViewContainerRef {
  let di = getOrCreateNodeInjector();
  return di.viewContainerRef || (di.viewContainerRef = new ViewContainerRef(di.node as LContainer));
}

/**
 * A ref to a container that enables adding and removing views from that container
 * imperatively.
 */
class ViewContainerRef implements viewEngine.ViewContainerRef {
  element: viewEngine.ElementRef;
  injector: viewEngine.Injector;
  parentInjector: viewEngine.Injector;

  constructor(node: LContainer) {}

  clear(): void { throw notImplemented(); }
  get(index: number): viewEngine.ViewRef|null { throw notImplemented(); }
  length: number;
  createEmbeddedView<C>(
    templateRef: viewEngine.TemplateRef<C>, context?: C|undefined,
    index?: number|undefined): viewEngine.EmbeddedViewRef<C> {
    throw notImplemented();
  }
  createComponent<C>(
      componentFactory: viewEngine.ComponentFactory<C>, index?: number|undefined,
      injector?: viewEngine.Injector|undefined, projectableNodes?: any[][]|undefined,
      ngModule?: viewEngine.NgModuleRef<any>|undefined): viewEngine.ComponentRef<C> {
    throw notImplemented();
  }
  insert(viewRef: viewEngine.ViewRef, index?: number|undefined): viewEngine.ViewRef { throw notImplemented(); }
  move(viewRef: viewEngine.ViewRef, currentIndex: number): viewEngine.ViewRef { throw notImplemented(); }
  indexOf(viewRef: viewEngine.ViewRef): number { throw notImplemented(); }
  remove(index?: number|undefined): void { throw notImplemented(); }
  detach(index?: number|undefined): viewEngine.ViewRef|null { throw notImplemented(); }
}
