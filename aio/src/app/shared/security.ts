import { assertIsTemplateObject } from 'safevalues/implementation/safe_string_literal';
import { htmlFromStringKnownToSatisfyTypeContract } from 'safevalues/unsafe/reviewed';

export function fromInnerHTML(el: Element): TrustedHTML {
  return htmlFromStringKnownToSatisfyTypeContract(el.innerHTML, 'existing innerHTML content');
}

export function fromOuterHTML(el: Element): TrustedHTML {
  return htmlFromStringKnownToSatisfyTypeContract(el.outerHTML, 'existing outerHTML content');
}

export function svg(constantSvg: TemplateStringsArray): TrustedHTML {
  // Assert that the argument is a template literal with no interpolation
  // expressions. Note that this check is not fool-proof, but should catch any
  // mistakes. Additionally, any attempts at spoofing a template literal should
  // look odd enough to draw attention during a code review.
  assertIsTemplateObject(constantSvg, false, 'Must only be used for static SVG markup.');
  return htmlFromStringKnownToSatisfyTypeContract(constantSvg[0], 'static SVG markup');
}
