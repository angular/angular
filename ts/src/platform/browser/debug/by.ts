import {Type, isPresent, isBlank} from 'angular2/src/facade/lang';
import {Predicate} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {DebugElement} from 'angular2/core';

export class By {
  static all(): Function { return (debugElement) => true; }

  static css(selector: string): Predicate<DebugElement> {
    return (debugElement) => {
      return isPresent(debugElement.nativeElement) ?
                 DOM.elementMatches(debugElement.nativeElement, selector) :
                 false;
    };
  }
  static directive(type: Type): Predicate<DebugElement> {
    return (debugElement) => { return debugElement.hasDirective(type); };
  }
}
