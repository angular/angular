import {buildingFailed, validationFailed} from '../error_helpers';
import {ENTER_CLASSNAME, LEAVE_CLASSNAME, normalizeStyles} from '../util';
import {warnValidation} from '../warning_helpers';
import {buildAnimationAst} from './animation_ast_builder';
import {buildAnimationTimelines} from './animation_timeline_builder';
import {ElementInstructionMap} from './element_instruction_map';
export class Animation {
  _driver;
  _animationAst;
  constructor(_driver, input) {
    this._driver = _driver;
    const errors = [];
    const warnings = [];
    const ast = buildAnimationAst(_driver, input, errors, warnings);
    if (errors.length) {
      throw validationFailed(errors);
    }
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (warnings.length) {
        warnValidation(warnings);
      }
    }
    this._animationAst = ast;
  }
  buildTimelines(element, startingStyles, destinationStyles, options, subInstructions) {
    const start = Array.isArray(startingStyles) ? normalizeStyles(startingStyles) : startingStyles;
    const dest = Array.isArray(destinationStyles)
      ? normalizeStyles(destinationStyles)
      : destinationStyles;
    const errors = [];
    subInstructions = subInstructions || new ElementInstructionMap();
    const result = buildAnimationTimelines(
      this._driver,
      element,
      this._animationAst,
      ENTER_CLASSNAME,
      LEAVE_CLASSNAME,
      start,
      dest,
      options,
      subInstructions,
      errors,
    );
    if (errors.length) {
      throw buildingFailed(errors);
    }
    return result;
  }
}
//# sourceMappingURL=animation.js.map
