/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {MigrationHost} from '../migration_host';
import {InputNode} from '../input_detection/input_node';

/**
 * Unique key for an input in a project.
 *
 * This is the serializable variant, raw string form that
 * is serializable and allows for cross-target knowledge
 * needed for the batching capability (via e.g. go/tsunami).
 */
export type InputUniqueKey = {__inputUniqueKey: true};

/**
 * Interface that describes an input recognized in the
 * migration and project.
 */
export interface InputDescriptor {
  key: InputUniqueKey;
  node: InputNode;
}

/**
 * Gets the descriptor for the given input node.
 *
 * An input descriptor describes a recognized input in the
 * whole project (regardless of batching) and allows easy
 * access to the associated TypeScript declaration node, while
 * also providing a unique key for the input that can be used
 * for serializable communication between compilation units
 * (e.g. when running via batching; in e.g. go/tsunami).
 */
export function getInputDescriptor(host: MigrationHost, node: InputNode): InputDescriptor {
  let className: string;
  if (ts.isAccessor(node)) {
    className = node.parent.name?.text || '<anonymous>';
  } else {
    className = node.parent.name?.text ?? '<anonymous>';
  }

  const fileId = host.fileToId(node.getSourceFile());
  return {
    key: `${fileId}@@${className}@@${node.name.text}` as unknown as InputUniqueKey,
    node,
  };
}

/** Whether the given value is an input descriptor. */
export function isInputDescriptor(v: unknown): v is InputDescriptor {
  return (
    (v as Partial<InputDescriptor>).key !== undefined &&
    (v as Partial<InputDescriptor>).node !== undefined
  );
}
