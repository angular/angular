import { htmlSafeByReview } from 'safevalues/restricted/reviewed';

export function fromInnerHTML(el: Element): TrustedHTML {
  // SECURITY: Existing innerHTML content is already trusted.
  return htmlSafeByReview(el.innerHTML, '^');
}

export function fromOuterHTML(el: Element): TrustedHTML {
  // SECURITY: Existing outerHTML content is already trusted.
  return htmlSafeByReview(el.outerHTML, '^');
}

export function svg(constantSvg: TemplateStringsArray): TrustedHTML {
  // SECURITY: Template literal argument with no interpolation is constant, and
  // hence trusted.
  return htmlSafeByReview(constantSvg[0], '^');
}
