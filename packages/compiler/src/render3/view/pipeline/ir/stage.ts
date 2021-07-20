/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TemplateAspect, TemplateWithIdAspect} from './aspect/template';
import {hasTemplateAspect} from './aspect/template_util';
import {ExpressionTransformer} from './expression';
import {CreateTransform, UpdateTransform} from './node';
import {RootTemplate, TemplateStage} from './root';

/**
 * A base class for `TemplateStage`s which provides some common functionality around processing
 * nested `TemplateAspect`s.
 *
 * A subclass of `BaseTemplateStage` must provide factory functions to create both a
 * `CreateTransform` and `UpdateTransform`, which will be called each time a `TemplateAspect`
 * (either `RootTemplate` or an embedded view) is processed.
 *
 * Thus, the `BaseTemplateStage` is a wrapper which takes `CreateTransform` and `UpdateTransform`
 * implementations and applies them recursively to an entire template IR.
 */
export abstract class BaseTemplateStage<CT extends CreateTransform, UT extends UpdateTransform>
    implements TemplateStage {
  /**
   * Get a `CreateTransform` which will be applied to one `TemplateAspect`.
   *
   * Because the `CreateTransform` instance used for a parent template is passed to the factory
   * function when creating the transform for each child template, it's possible to pass state from
   * the parent transform to any child transforms if required.
   *
   * @param root The `RootTemplate` for the entire template IR.
   * @param prev The previous instance of `CreateTransform` used for this template's parent, if any.
   * @param tmpl The `TemplateAspectWithId` of the child template which will be processed by this
   *     transform, or `null` if the template is the `RootTemplate`.
   */
  protected abstract makeCreateTransform(
      root: RootTemplate, prev: CT|null, tmpl: TemplateWithIdAspect|null): CT|null;


  /**
   * Get an `UpdateTransform` which will be applied to one `TemplateAspect`.
   *
   * Because the `UpdateTransform` instance used for a parent template is passed to the factory
   * function when creating the transform for each child template, it's possible to pass state from
   * the parent transform to any child transforms if required.
   *
   * @param root The `RootTemplate` for the entire template IR.
   * @param prev The previous instance of `UpdateTransform` used for this template's parent, if any.
   * @param tmpl The `TemplateAspectWithId` of the child template which will be processed by this
   *     transform, or `null` if the template is the `RootTemplate`.
   */
  protected abstract makeUpdateTransform(
      root: RootTemplate, prev: UT|null, tmpl: TemplateWithIdAspect|null, create: CT|null): UT|null;

  private transformImpl(
      root: RootTemplate, tmpl: TemplateAspect, prevCreate: CT|null, prevUpdate: UT|null): void {
    const childNode = tmpl instanceof RootTemplate ? null : (tmpl as TemplateWithIdAspect);
    const currCreate = this.makeCreateTransform(root, prevCreate, childNode);
    const currUpdate = this.makeUpdateTransform(root, prevUpdate, childNode, currCreate);

    if (currCreate !== null) {
      tmpl.create.applyTransform(currCreate);
    }
    if (currUpdate !== null) {
      tmpl.update.applyTransform(currUpdate);
    }

    // Recurse into any child create nodes that have the TemplateAspect.
    for (const node of tmpl.create) {
      if (hasTemplateAspect(node)) {
        this.transformImpl(root, node, currCreate, currUpdate);
      }
    }
  }

  transform(tmpl: RootTemplate): void {
    this.transformImpl(tmpl, tmpl, null, null);
  }
}

/**
 * A convenient `TemplateStage` for transformations which only operate on the create side of the
 * template, and can be expressed with a single transformation instance for the entire template
 * (including nested views).
 *
 * A `CreateOnlyTemplateStage` is expected to implement the `CreateTransform` interface. In a sense,
 * inheriting from `CreateOnlyTemplateStage` adapts a singleton `CreateTransform` into a
 * `TemplateStage`.
 */
export abstract class CreateOnlyTemplateStage extends BaseTemplateStage<CreateTransform, never> {
  makeCreateTransform(): CreateTransform {
    return this as CreateTransform;
  }

  makeUpdateTransform(): null {
    return null;
  }
}

/**
 * A convenient `TemplateStage` for transformations which only operate on the update side of the
 * template, and can be expressed with a single transformation instance for the entire template
 * (including nested views).
 *
 * An `UpdateOnlyTemplateStage` is expected to implement the `UpdateTransform` interface. In a
 * sense, inheriting from `UpdateOnlyTemplateStage` adapts a singleton `UpdateTransform` into a
 * `TemplateStage`.
 */
export abstract class UpdateOnlyTemplateStage extends BaseTemplateStage<never, UpdateTransform> {
  makeCreateTransform(): null {
    return null;
  }

  makeUpdateTransform(): UpdateTransform {
    return this as UpdateTransform;
  }
}

/**
 * A convenient `TemplateStage` for transformations which only operate on IR `Expression`s within
 * the template.
 *
 * An `ExpressionOnlyTemplateStage` implements the `ExpressionTransformer` interface. Most consumers
 * will want to implement the optional `visitIrExpression` method from this interface.
 */
export abstract class ExpressionOnlyTemplateStage extends ExpressionTransformer implements
    TemplateStage {
  transform(tmpl: TemplateAspect): void {
    for (const node of tmpl.update) {
      node.visitExpressions(this);
    }

    // Recurse into any child create nodes that have the TemplateAspect.
    for (const node of tmpl.create) {
      if (hasTemplateAspect(node)) {
        this.transform(node);
      }
    }
  }
}
