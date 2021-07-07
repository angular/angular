import { htmlFromStringKnownToSatisfyTypeContract } from 'safevalues/unsafe/reviewed';

export function fromInnerHTML(el: Element): TrustedHTML {
  // SECURITY: Existing innerHTML content is already trusted.
  return htmlFromStringKnownToSatisfyTypeContract(el.innerHTML, '^');
}

export function fromOuterHTML(el: Element): TrustedHTML {
  // SECURITY: Existing outerHTML content is already trusted.
  return htmlFromStringKnownToSatisfyTypeContract(el.outerHTML, '^');
}
