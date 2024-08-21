/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {InputDescriptor, InputUniqueKey} from '../utils/input_id';
import {ExtractedInput} from './input_decorator';
import {InputNode} from './input_node';
import {DirectiveInfo} from './directive_info';
import {ClassIncompatibilityReason, InputMemberIncompatibility} from './incompatibility';

/**
 * Public interface describing a single known `@Input()` in the
 * compilation.
 *
 * A known `@Input()` may be defined in sources, or inside some `d.ts` files
 * loaded into the program.
 */
export type KnownInputInfo = {
  metadata: ExtractedInput;
  descriptor: InputDescriptor;
  container: DirectiveInfo;
  isIncompatible: () => boolean;
};

/**
 * Registry keeping track of all known `@Input()`s in the compilation.
 *
 *  A known `@Input()` may be defined in sources, or inside some `d.ts` files
 * loaded into the program.
 */
export class KnownInputs {
  /**
   * Known inputs from the whole program.
   */
  knownInputIds = new Map<InputUniqueKey, KnownInputInfo>();

  /** Known container classes of inputs. */
  private _allClasses = new Set<ts.ClassDeclaration>();
  /** Maps classes to their directive info. */
  private _classToDirectiveInfo = new Map<ts.ClassDeclaration, DirectiveInfo>();

  /** Whether the given input exists. */
  has(descr: Pick<InputDescriptor, 'key'>): boolean {
    return this.knownInputIds.has(descr.key);
  }

  /** Whether the given class contains `@Input`s. */
  isInputContainingClass(clazz: ts.ClassDeclaration): boolean {
    return this._classToDirectiveInfo.has(clazz);
  }

  /** Gets precise `@Input()` information for the given class. */
  getDirectiveInfoForClass(clazz: ts.ClassDeclaration): DirectiveInfo | undefined {
    return this._classToDirectiveInfo.get(clazz);
  }

  /** Gets known input information for the given `@Input()`. */
  get(descr: Pick<InputDescriptor, 'key'>): KnownInputInfo | undefined {
    return this.knownInputIds.get(descr.key);
  }

  /** Gets all classes containing `@Input`s in the compilation. */
  getAllInputContainingClasses(): ts.ClassDeclaration[] {
    return Array.from(this._allClasses.values());
  }

  /** Registers an `@Input()` in the registry. */
  register(data: {descriptor: InputDescriptor; node: InputNode; metadata: ExtractedInput}) {
    if (!this._classToDirectiveInfo.has(data.node.parent)) {
      this._classToDirectiveInfo.set(data.node.parent, new DirectiveInfo(data.node.parent));
    }
    const directiveInfo = this._classToDirectiveInfo.get(data.node.parent)!;

    directiveInfo.inputFields.set(data.descriptor.key, {
      descriptor: data.descriptor,
      metadata: data.metadata,
    });
    this.knownInputIds.set(data.descriptor.key, {
      metadata: data.metadata,
      descriptor: data.descriptor,
      container: directiveInfo,
      isIncompatible: () => directiveInfo.isInputMemberIncompatible(data.descriptor),
    });
    this._allClasses.add(data.node.parent);
  }

  /** Marks the given input as incompatible for migration. */
  markInputAsIncompatible(input: InputDescriptor, incompatibility: InputMemberIncompatibility) {
    if (!this.knownInputIds.has(input.key)) {
      throw new Error(`Input cannot be marked as incompatible because it's not registered.`);
    }
    this.knownInputIds
      .get(input.key)!
      .container.memberIncompatibility.set(input.key, incompatibility);
  }

  /** Marks the given class as incompatible for migration. */
  markDirectiveAsIncompatible(
    clazz: ts.ClassDeclaration,
    incompatibility: ClassIncompatibilityReason,
  ) {
    if (!this._classToDirectiveInfo.has(clazz)) {
      throw new Error(`Class cannot be marked as incompatible because it's not known.`);
    }
    this._classToDirectiveInfo.get(clazz)!.incompatible = incompatibility;
  }
}
