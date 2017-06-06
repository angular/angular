import {Injectable} from 'angular2/src/core/di';

import * as o from '../output/output_ast';
import {CompileElement} from './compile_element';
import {CompileView} from './compile_view';
import {buildView, finishView, ViewCompileDependency} from './view_builder';
import {bindView} from './view_binder';

import {CompileDirectiveMetadata, CompilePipeMetadata} from '../compile_metadata';

import {TemplateAst} from '../template_ast';
import {CompilerConfig} from '../config';

export class ViewCompileResult {
  constructor(public statements: o.Statement[], public viewFactoryVar: string,
              public dependencies: ViewCompileDependency[]) {}
}

@Injectable()
export class ViewCompiler {
  constructor(private _genConfig: CompilerConfig) {}

  compileComponent(component: CompileDirectiveMetadata, template: TemplateAst[],
                   styles: o.Expression, pipes: CompilePipeMetadata[]): ViewCompileResult {
    var statements = [];
    var dependencies = [];
    var view = new CompileView(component, this._genConfig, pipes, styles, 0,
                               CompileElement.createNull(), []);
    buildView(view, template, dependencies);
    // Need to separate binding from creation to be able to refer to
    // variables that have been declared after usage.
    bindView(view, template);
    finishView(view, statements);

    return new ViewCompileResult(statements, view.viewFactory.name, dependencies);
  }
}
