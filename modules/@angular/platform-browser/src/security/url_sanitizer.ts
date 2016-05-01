import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

const URL_SANITIZATION_WHITELIST = /^\s*(https?|ftp|mailto|tel|file):|data:image\//;

let parsingNode: any /* Attribute */ = null;

function getUrlParsingNode() {
  if (!parsingNode) parsingNode = getDOM().createElement('a');
  return parsingNode;
}

export function sanitizeUrl(url: string): string {
  let pn = getUrlParsingNode();
  // FIXME(martinprobst): Need to double-assign for MSIE to resolve URI.
  pn.href = url;
  let absoluteUrl = pn.href;
  if (absoluteUrl !== '' && !absoluteUrl.match(URL_SANITIZATION_WHITELIST)) {
    return 'unsafe:' + absoluteUrl;
  }
  return url;
}
