/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

import {AnimationCompiler, AnimationEntryCompileResult} from '../animation/animation_compiler';
import {CompileDirectiveMetadata, CompilePipeMetadata} from '../compile_metadata';
import {CompilerConfig} from '../config';
import * as o from '../output/output_ast';
import {TemplateAst} from '../template_parser/template_ast';

import {CompileElement} from './compile_element';
import {CompileView} from './compile_view';
import {bindView} from './view_binder';
import {ComponentFactoryDependency, ViewFactoryDependency, buildView, finishView} from './view_builder';

export {ComponentFactoryDependency, ViewFactoryDependency} from './view_builder';

export class ViewCompileResult {
  constructor(
      public statements: o.Statement[], public viewFactoryVar: string,
      public dependencies: Array<ViewFactoryDependency|ComponentFactoryDependency>) {}
}

@Injectable()
export class ViewCompiler {
  private _animationCompiler = new AnimationCompiler();
  constructor(private _genConfig: CompilerConfig) {}

  compileComponent(
      component: CompileDirectiveMetadata, template: TemplateAst[], styles: o.Expression,
      pipes: CompilePipeMetadata[],
      compiledAnimations: AnimationEntryCompileResult[]): ViewCompileResult {
    const dependencies: Array<ViewFactoryDependency|ComponentFactoryDependency> = [];
    const view = new CompileView(
        component, this._genConfig, pipes, styles, compiledAnimations, 0,
        CompileElement.createNull(), []);

    const statements: o.Statement[] = [];
    buildView(view, template, dependencies);
    // Need to separate binding from creation to be able to refer to
    // variables that have been declared after usage.
    bindView(view, template);
    finishView(view, statements);

    return new ViewCompileResult(statements, view.viewFactory.name, dependencies);
  }
}
