import {isPresent, isBlank, RegExpWrapper} from 'facade/lang';
import {MapWrapper} from 'facade/collection';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

// TODO(tbosch): Cannot make this const/final right now because of the transpiler...
var BIND_DASH_REGEXP = RegExpWrapper.create('bind-((?:[^-]|-(?!-))+)(?:--(.+))?');
var PROP_BIND_REGEXP = RegExpWrapper.create('\\[([^|]+)(?:\\|(.+))?\\]');

/**
 * Parses the property bindings on a single element.
 *
 * Fills:
 * - CompileElement#propertyBindings
 */
export class PropertyBindingParser extends CompileStep {
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var attrs = current.attrs();
    MapWrapper.forEach(attrs, (attrValue, attrName) => {
      var parts = RegExpWrapper.firstMatch(BIND_DASH_REGEXP, attrName);
      if (isBlank(parts)) {
        parts = RegExpWrapper.firstMatch(PROP_BIND_REGEXP, attrName);
      }
      if (isPresent(parts)) {
        current.addPropertyBinding(parts[1], attrValue);
      }
    });
  }
}
