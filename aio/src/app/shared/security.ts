import { htmlFromStringKnownToSatisfyTypeContract } from 'safevalues/unsafe/reviewed';

export function fromInnerHTML(el: Element): TrustedHTML {
  return htmlFromStringKnownToSatisfyTypeContract(el.innerHTML, 'existing innerHTML content');
}

export function fromOuterHTML(el: Element): TrustedHTML {
  return htmlFromStringKnownToSatisfyTypeContract(el.outerHTML, 'existing outerHTML content');
}
