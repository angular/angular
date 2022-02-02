/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as postcss from 'postcss';

/** The changes to a class names. */
export interface ClassNameChange {
  /** The legacy class name. */
  old: string;

  /** The new class name. */
  new: string;
}

/** The changes to an scss mixin. */
export interface MixinChange {
  /** The name of the legacy scss mixin. */
  old: string;

  /** The name(s) of the new scss mixin(s). */
  new: string[];
}

/** StyleMigrator implements the basic case for migrating old component styles to new ones. */
export abstract class StyleMigrator {
  /** The name of the component that this migration handles. */
  abstract component: string;

  /** The old and new class names of this component. */
  abstract classChanges: ClassNameChange[];

  /** The old mixins and their replacements. */
  abstract mixinChanges: MixinChange[];

  /**
   * Returns whether the given at-include at-rule is a use of a legacy mixin for this component.
   *
   * @param namespace the namespace being used for angular/material.
   * @param atRule a postcss at-include at-rule.
   * @returns `true` if the given at-rule is a use of a legacy mixin for this component.
   */
  isLegacyMixin(namespace: string, atRule: postcss.AtRule): boolean {
    return this.mixinChanges.some(change => atRule.params.includes(`${namespace}.${change.old}`));
  }

  /**
   * Replaces a legacy mixin for this component with the new mixin(s).
   *
   * @param namespace the namespace being used for angular/material.
   * @param atRule an at-include at-rule of a legacy mixin for this component.
   */
  replaceMixin(namespace: string, atRule: postcss.AtRule): void {
    const change = this.mixinChanges.find(c => {
      return atRule.params.includes(`${namespace}.${c.old}`);
    });

    if (!change) {
      return;
    }

    // Cloning & inserting the first node before changing the
    // indentation preserves the indentation of the first node (e.g. 3 newlines).
    atRule.cloneBefore({
      params: atRule.params.replace(change.old, change.new[0]),
    });

    // We change the indentation before inserting all of the other nodes
    // because the additional @includes should only be separated by a single newline.
    const indentation = atRule.raws.before?.split('\n').pop();
    atRule.raws.before = '\n' + indentation;

    // Note: It may be more efficient to create an array of clones and then insert
    // them all at once. If we are having performance issues, we should revisit this.
    for (let i = 1; i < change.new.length; i++) {
      atRule.cloneBefore({
        params: atRule.params.replace(change.old, change.new[i]),
      });
    }
    atRule.remove();
  }

  /**
   * Returns whether the given postcss rule uses a legacy selector of this component.
   *
   * @param rule a postcss rule.
   * @returns `true` if the given Rule uses a legacy selector of this component.
   */
  isLegacySelector(rule: postcss.Rule): boolean {
    return this.classChanges.some(change => rule.selector.includes(change.old));
  }

  /**
   * Replaces a legacy selector of this component with the new one.
   *
   * @param rule a postcss rule.
   */
  replaceLegacySelector(rule: postcss.Rule): void {
    for (let i = 0; i < this.classChanges.length; i++) {
      const change = this.classChanges[i];
      if (rule.selector.includes(change.old)) {
        rule.selector = rule.selector.replace(change.old, change.new);
      }
    }
  }
}
