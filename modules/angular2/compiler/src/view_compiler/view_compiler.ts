import {Injectable} from 'angular2/src/core/di';

import * as o from '../output/output_ast';
import {CompileElement} from './compile_element';
import {CompileView} from './compile_view';
import {buildView, ViewCompileDependency} from './view_builder';

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
    buildView(view, template, dependencies, statements);
    return new ViewCompileResult(statements, view.viewFactory.name, dependencies);
  }
}
