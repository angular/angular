/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';

import {TemplateAspect} from './aspect/template';
import {CreateList, UpdateList} from './node';
import {Scope} from './template_scope';

/**
 * Represents a template declaration for a component's top-level template.
 *
 * In addition to the normal properties of a template (defined in `TemplateAspect`), the
 * `RootTemplate` contains additional context about the template extracted from the template AST and
 * the component host.
 *
 * After processing, the `RootTemplate` will also contain top-level data for the template, such as
 * the `consts` array to which constants from the template are extracted, which will be expressed in
 * the component definition.
 */
export class RootTemplate implements TemplateAspect {
  readonly[TemplateAspect] = true;

  create: CreateList;
  update: UpdateList;

  decls: number|null = null;
  vars: number|null = null;

  /**
   * `Scope` that was extracted from this template when it was converted to IR.
   *
   * This contains useful information about the named entities within the template and their
   * relationship to the initial IR.
   */
  scope: Scope;

  constructor(create: CreateList, update: UpdateList, scope: Scope) {
    this.create = create;
    this.update = update;
    this.scope = scope;
  }

  /**
   * Name of the template function (usually the name of the component which declared the template).
   */
  name: string|null = null;

  /**
   * Array of constants extracted from the template during processing.
   *
   * Emitted instructions will refer to these constants via their index in this array.
   */
  consts: o.Expression[]|null = null;

  /**
   * Transform this `RootTemplate` with a sequence of `TemplateStage`s.
   */
  transform(...stages: TemplateStage[]): void {
    for (const stage of stages) {
      stage.transform(this);
    }
  }
}

/**
 * Represents a host binding function, which looks similar to a template in some ways (create and
 * update blocks, `decls` and `vars`, etc) but is not a recursive structure (no embedded views) and
 * uses a different set of instructions.
 */
export class Host {
  /**
   * Creation block of the host binding function.
   */
  create = new CreateList();

  /**
   * Update block of the host binding function.
   */
  update = new UpdateList();


  attrs: o.Expression[]|null = null;

  decls: number|null = null;
  vars: number|null = null;

  constructor(readonly name: string) {}

  /**
   * Transform this `Host` with a sequence of `HostStage`s.
   */
  transform(...stages: HostStage[]): void {
    for (const stage of stages) {
      stage.transform(this);
    }
  }

  /**
   * Check if this host binding function is empty.
   */
  isEmpty(): boolean {
    return this.update.head === null && this.create.head === null;
  }
}

/**
 * A single stage in a processing pipeline for a template IR.
 *
 * A stage is conceptually similar to one of the `CreateTransform` or `UpdateTransform`
 * transformations, but is applied recursively to both the `RootTemplate` and any embedded views
 * within it (which may contain their own embedded views, etc). Stages also process both the
 * creation and update blocks of the template.
 */
export interface TemplateStage {
  transform(tmpl: RootTemplate): void;
}

/**
 * A single stage in a processing pipeline for a host binding function IR.
 *
 * Like a `TemplateStage` the `HostStage` processes both the creation and update blocks of the host
 * binding function IR. Unlike its template equivalent, the host binding function IR is
 * non-recursive.
 */
export interface HostStage {
  transform(host: Host): void;
}
