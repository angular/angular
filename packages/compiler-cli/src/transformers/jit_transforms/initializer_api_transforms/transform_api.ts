/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {Decorator, ReflectionHost} from '../../..//ngtsc/reflection';
import {ImportManager} from '../../../ngtsc/translator';

/** Function that can be used to transform a class properties. */
export type PropertyTransform =
    (node: ts.PropertyDeclaration&{name: ts.Identifier | ts.StringLiteralLike},
     host: ReflectionHost, factory: ts.NodeFactory, importManager: ImportManager,
     decorator: Decorator, isCore: boolean) => ts.PropertyDeclaration;
