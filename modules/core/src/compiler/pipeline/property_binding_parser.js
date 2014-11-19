import {isPresent, isBlank, RegExpWrapper, BaseException} from 'facade/lang';
import {MapWrapper} from 'facade/collection';
import {TemplateElement} from 'facade/dom';

import {Parser} from 'change_detection/parser/parser';
import {ExpressionWithSource} from 'change_detection/parser/ast';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

import {interpolationToExpression} from './text_interpolation_parser';

// TODO(tbosch): Cannot make this const/final right now because of the transpiler...
var BIND_NAME_REGEXP = RegExpWrapper.create('^(?:(?:(bind)|(let))-(.+))|\\[([^\\]]+)\\]');

/**
 * Parses the property bindings on a single element.
 *
 * Fills:
 * - CompileElement#propertyBindings
 */
export class PropertyBindingParser extends CompileStep {
  constructor(parser:Parser) {
    this._parser = parser;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var attrs = current.attrs();
    MapWrapper.forEach(attrs, (attrValue, attrName) => {
      var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
      if (isPresent(bindParts)) {
        if (isPresent(bindParts[1])) {
          // match: bind-prop
          current.addPropertyBinding(bindParts[3], this._parser.parseBinding(attrValue));
        } else if (isPresent(bindParts[2])) {
          // match: let-prop
          // Note: We assume that the ViewSplitter already did its work, i.e. template directive should
          // only be present on <template> elements any more!
          if (!(current.element instanceof TemplateElement)) {
            throw new BaseException('let-* is only allowed on <template> elements!');
          }
          current.addVariableBinding(bindParts[3], attrValue);
        } else if (isPresent(bindParts[4])) {
          // match: [prop]
          current.addPropertyBinding(bindParts[4], this._parser.parseBinding(attrValue));
        }
      } else {
        var expression = interpolationToExpression(attrValue);
        if (isPresent(expression)) {
          current.addPropertyBinding(attrName, this._parser.parseBinding(expression));
        }
      }
    });
  }
}
