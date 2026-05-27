/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TI18n, TIcu} from '../../src/render3/interfaces/i18n';
import {TNode} from '../../src/render3/interfaces/node';
import {TView} from '../../src/render3/interfaces/view';

/**
 * A type used to create a runtime representation of a shape of object which matches the declared
 * interface at compile time.
 *
 * The purpose of this type is to ensure that the object must match all of the properties of a type.
 * This is later used by `isShapeOf` method to ensure that a particular object has a particular
 * shape.
 *
 * ```ts
 * interface MyShape {
 *   foo: string,
 *   bar: number
 * }
 *
 * const myShapeObj: {foo: '', bar: 0};
 * const ExpectedPropertiesOfShape = {foo: true, bar: true};
 *
 * isShapeOf(myShapeObj, ExpectedPropertiesOfShape);
 * ```
 *
 * The above code would verify that `myShapeObj` has `foo` and `bar` properties. However if later
 * `MyShape` is refactored to change a set of properties we would like to have a compile time error
 * that the `ExpectedPropertiesOfShape` also needs to be changed.
 *
 * ```ts
 * const ExpectedPropertiesOfShape = <ShapeOf<MyShape>>{foo: true, bar: true};
 * ```
 * The above code will force through compile time checks that the `ExpectedPropertiesOfShape` match
 * that of `MyShape`.
 *
 * See: `isShapeOf`
 *
 */
export type ShapeOf<T> = {
  [P in keyof T]: true;
};

/**
 * Determines if a particular object is of a given shape (duck-type version of `instanceof`.)
 *
 * ```ts
 * isShapeOf(someObj, {foo: true, bar: true});
 * ```
 *
 * The above code will be true if the `someObj` has both `foo` and `bar` property
 *
 * @param obj Object to test for.
 * @param shapeOf Desired shape.
 */
export function isShapeOf<T>(obj: any, shapeOf: ShapeOf<T>): obj is T {
  if (typeof obj === 'object' && obj) {
    return Object.keys(shapeOf).every((key) => obj.hasOwnProperty(key));
  }
  return false;
}

/**
 * Determines if `obj` matches the shape `TI18n`.
 * @param obj
 */
export function isTI18n(obj: any): obj is TI18n {
  return isShapeOf<TI18n>(obj, ShapeOfTI18n);
}
const ShapeOfTI18n: ShapeOf<TI18n> = {
  create: true,
  update: true,
  ast: true,
  parentTNodeIndex: true,
};

/**
 * Determines if `obj` matches the shape `TIcu`.
 * @param obj
 */
export function isTIcu(obj: any): obj is TIcu {
  return isShapeOf<TIcu>(obj, ShapeOfTIcu);
}
const ShapeOfTIcu: ShapeOf<TIcu> = {
  type: true,
  anchorIdx: true,
  currentCaseLViewIndex: true,
  cases: true,
  create: true,
  remove: true,
  update: true,
};

/**
 * Determines if `obj` matches the shape `TView`.
 * @param obj
 */
export function isTView(obj: any): obj is TView {
  return isShapeOf<TView>(obj, ShapeOfTView);
}
const ShapeOfTView: ShapeOf<TView> = {
  type: true,
  blueprint: true,
  template: true,
  viewQuery: true,
  declTNode: true,
  firstCreatePass: true,
  firstUpdatePass: true,
  data: true,
  bindingStartIndex: true,
  expandoStartIndex: true,
  staticViewQueries: true,
  staticContentQueries: true,
  firstChild: true,
  hostBindingOpCodes: true,
  directiveRegistry: true,
  pipeRegistry: true,
  preOrderHooks: true,
  preOrderCheckHooks: true,
  contentHooks: true,
  contentCheckHooks: true,
  viewHooks: true,
  viewCheckHooks: true,
  destroyHooks: true,
  cleanup: true,
  components: true,
  queries: true,
  contentQueries: true,
  schemas: true,
  consts: true,
  incompleteFirstPass: true,
  ssrId: true,
};

/**
 * Determines if `obj` matches the shape `TI18n`.
 * @param obj
 */
export function isTNode(obj: any): obj is TNode {
  return isShapeOf<TNode>(obj, ShapeOfTNode);
}
const ShapeOfTNode: ShapeOf<TNode> = {
  type: true,
  index: true,
  insertBeforeIndex: true,
  injectorIndex: true,
  directiveStart: true,
  directiveEnd: true,
  directiveStylingLast: true,
  componentOffset: true,
  propertyBindings: true,
  flags: true,
  providerIndexes: true,
  value: true,
  attrs: true,
  mergedAttrs: true,
  localNames: true,
  initialInputs: true,
  inputs: true,
  hostDirectiveInputs: true,
  outputs: true,
  hostDirectiveOutputs: true,
  directiveToIndex: true,
  tView: true,
  next: true,
  prev: true,
  projectionNext: true,
  child: true,
  parent: true,
  projection: true,
  styles: true,
  stylesWithoutHost: true,
  residualStyles: true,
  classes: true,
  classesWithoutHost: true,
  residualClasses: true,
  classBindings: true,
  styleBindings: true,
};

/**
 * Determines if `obj` is DOM `Node`.
 */
export function isDOMNode(obj: any): obj is Node {
  return obj instanceof Node;
}

/**
 * Determines if `obj` is DOM `Text`.
 */
export function isDOMElement(obj: any): obj is Element {
  return obj instanceof Element;
}

/**
 * Determines if `obj` is DOM `Text`.
 */
export function isDOMText(obj: any): obj is Text {
  return obj instanceof Text;
}
