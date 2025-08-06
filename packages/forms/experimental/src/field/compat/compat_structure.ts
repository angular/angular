/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  runInInjectionContext,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import {FormFieldManager} from '../manager';
import {FieldNode, ParentFieldNode} from '../node';
import {
  ChildFieldNodeOptions,
  FieldNodeOptions,
  FieldNodeStructure,
  RootFieldNodeOptions,
} from '../structure';

import {toSignal} from '@angular/core/rxjs-interop';
import {getInjectorFromOptions} from '../util';
import {AbstractControl} from '@angular/forms';

export interface CompatChildFieldNodeOptions extends ChildFieldNodeOptions {
  control: Signal<AbstractControl>;
}

export interface CompatRootFieldNodeOptions extends RootFieldNodeOptions {
  control: Signal<AbstractControl>;
}

export type CompatFieldNodeOptions = CompatRootFieldNodeOptions | CompatChildFieldNodeOptions;

function getParentFromOptions(options: FieldNodeOptions) {
  if (options.kind === 'root') {
    return undefined;
  }

  return options.parent;
}

function getFieldManagerFromOptions(options: FieldNodeOptions) {
  if (options.kind === 'root') {
    return options.fieldManager;
  }

  return options.parent.structure.root.structure.fieldManager;
}

export class CompatStructure extends FieldNodeStructure {
  override value: WritableSignal<unknown>;
  // TODO: Figure out why this works.
  override keyInParent: Signal<string> = signal('');
  override root: FieldNode;
  override pathKeys: Signal<readonly PropertyKey[]>;
  override readonly children = signal([]);
  override readonly childrenMap = signal(undefined);
  override readonly parent: ParentFieldNode | undefined;
  override readonly fieldManager: FormFieldManager;

  constructor(node: FieldNode, options: CompatFieldNodeOptions) {
    super(options.logic);

    const control = options.control;

    this.value = computed(() => {
      const c = control();
      return untracked(() => {
        return runInInjectionContext(getInjectorFromOptions(options), () => {
          return toSignal(c.valueChanges, {initialValue: c.value});
        });
      })();
    }) as WritableSignal<unknown>;

    this.value.set = (value: unknown) => {
      control().setValue(value);
    };

    this.parent = getParentFromOptions(options);
    this.root = this.parent?.structure.root ?? node;
    this.fieldManager = getFieldManagerFromOptions(options);
    this.pathKeys = computed(() =>
      this.parent ? [...this.parent.structure.pathKeys(), this.keyInParent()] : [],
    );
  }

  override getChild(): FieldNode | undefined {
    throw new Error('Compat field does not have children');
  }
}
