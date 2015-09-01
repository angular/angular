import {Parser} from 'angular2/src/core/change_detection/change_detection';
import {ViewDefinition} from '../../api';
import {CompileStep} from './compile_step';
import {PropertyBindingParser} from './property_binding_parser';
import {TextInterpolationParser} from './text_interpolation_parser';
import {DirectiveParser} from './directive_parser';
import {ViewSplitter} from './view_splitter';
import {StyleEncapsulator} from './style_encapsulator';

export class CompileStepFactory {
  createSteps(view: ViewDefinition): CompileStep[] { return null; }
}

export class DefaultStepFactory extends CompileStepFactory {
  private _componentUIDsCache: Map<string, string> = new Map();
  constructor(private _parser: Parser, private _appId: string) { super(); }

  createSteps(view: ViewDefinition): CompileStep[] {
    return [
      new ViewSplitter(this._parser),
      new PropertyBindingParser(this._parser),
      new DirectiveParser(this._parser, view.directives),
      new TextInterpolationParser(this._parser),
      new StyleEncapsulator(this._appId, view, this._componentUIDsCache)
    ];
  }
}
