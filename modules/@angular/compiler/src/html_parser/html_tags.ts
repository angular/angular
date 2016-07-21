/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TagContentType, TagDefinition} from './tags';

export class HtmlTagDefinition implements TagDefinition {
  private closedByChildren: {[key: string]: boolean} = {};

  closedByParent: boolean = false;
  requiredParents: {[key: string]: boolean};
  parentToAdd: string;
  implicitNamespacePrefix: string;
  contentType: TagContentType;
  isVoid: boolean;
  ignoreFirstLf: boolean;
  canSelfClose: boolean = false;

  constructor(
      {closedByChildren, requiredParents, implicitNamespacePrefix,
       contentType = TagContentType.PARSABLE_DATA, closedByParent = false, isVoid = false,
       ignoreFirstLf = false}: {
        closedByChildren?: string[],
        closedByParent?: boolean,
        requiredParents?: string[],
        implicitNamespacePrefix?: string,
        contentType?: TagContentType,
        isVoid?: boolean,
        ignoreFirstLf?: boolean
      } = {}) {
    if (closedByChildren && closedByChildren.length > 0) {
      closedByChildren.forEach(tagName => this.closedByChildren[tagName] = true);
    }
    this.isVoid = isVoid;
    this.closedByParent = closedByParent || isVoid;
    if (requiredParents && requiredParents.length > 0) {
      this.requiredParents = {};
      // The first parent is the list is automatically when none of the listed parents are present
      this.parentToAdd = requiredParents[0];
      requiredParents.forEach(tagName => this.requiredParents[tagName] = true);
    }
    this.implicitNamespacePrefix = implicitNamespacePrefix;
    this.contentType = contentType;
    this.ignoreFirstLf = ignoreFirstLf;
  }

  requireExtraParent(currentParent: string): boolean {
    if (!this.requiredParents) {
      return false;
    }

    if (!currentParent) {
      return true;
    }

    const lcParent = currentParent.toLowerCase();
    return this.requiredParents[lcParent] != true && lcParent != 'template';
  }

  isClosedByChild(name: string): boolean {
    return this.isVoid || name.toLowerCase() in this.closedByChildren;
  }
}

// see http://www.w3.org/TR/html51/syntax.html#optional-tags
// This implementation does not fully conform to the HTML5 spec.
const TAG_DEFINITIONS: {[key: string]: HtmlTagDefinition} = {
  'base': new HtmlTagDefinition({isVoid: true}),
  'meta': new HtmlTagDefinition({isVoid: true}),
  'area': new HtmlTagDefinition({isVoid: true}),
  'embed': new HtmlTagDefinition({isVoid: true}),
  'link': new HtmlTagDefinition({isVoid: true}),
  'img': new HtmlTagDefinition({isVoid: true}),
  'input': new HtmlTagDefinition({isVoid: true}),
  'param': new HtmlTagDefinition({isVoid: true}),
  'hr': new HtmlTagDefinition({isVoid: true}),
  'br': new HtmlTagDefinition({isVoid: true}),
  'source': new HtmlTagDefinition({isVoid: true}),
  'track': new HtmlTagDefinition({isVoid: true}),
  'wbr': new HtmlTagDefinition({isVoid: true}),
  'p': new HtmlTagDefinition({
    closedByChildren: [
      'address', 'article', 'aside', 'blockquote', 'div', 'dl',      'fieldset', 'footer', 'form',
      'h1',      'h2',      'h3',    'h4',         'h5',  'h6',      'header',   'hgroup', 'hr',
      'main',    'nav',     'ol',    'p',          'pre', 'section', 'table',    'ul'
    ],
    closedByParent: true
  }),
  'thead': new HtmlTagDefinition({closedByChildren: ['tbody', 'tfoot']}),
  'tbody': new HtmlTagDefinition({closedByChildren: ['tbody', 'tfoot'], closedByParent: true}),
  'tfoot': new HtmlTagDefinition({closedByChildren: ['tbody'], closedByParent: true}),
  'tr': new HtmlTagDefinition({
    closedByChildren: ['tr'],
    requiredParents: ['tbody', 'tfoot', 'thead'],
    closedByParent: true
  }),
  'td': new HtmlTagDefinition({closedByChildren: ['td', 'th'], closedByParent: true}),
  'th': new HtmlTagDefinition({closedByChildren: ['td', 'th'], closedByParent: true}),
  'col': new HtmlTagDefinition({requiredParents: ['colgroup'], isVoid: true}),
  'svg': new HtmlTagDefinition({implicitNamespacePrefix: 'svg'}),
  'math': new HtmlTagDefinition({implicitNamespacePrefix: 'math'}),
  'li': new HtmlTagDefinition({closedByChildren: ['li'], closedByParent: true}),
  'dt': new HtmlTagDefinition({closedByChildren: ['dt', 'dd']}),
  'dd': new HtmlTagDefinition({closedByChildren: ['dt', 'dd'], closedByParent: true}),
  'rb': new HtmlTagDefinition({closedByChildren: ['rb', 'rt', 'rtc', 'rp'], closedByParent: true}),
  'rt': new HtmlTagDefinition({closedByChildren: ['rb', 'rt', 'rtc', 'rp'], closedByParent: true}),
  'rtc': new HtmlTagDefinition({closedByChildren: ['rb', 'rtc', 'rp'], closedByParent: true}),
  'rp': new HtmlTagDefinition({closedByChildren: ['rb', 'rt', 'rtc', 'rp'], closedByParent: true}),
  'optgroup': new HtmlTagDefinition({closedByChildren: ['optgroup'], closedByParent: true}),
  'option': new HtmlTagDefinition({closedByChildren: ['option', 'optgroup'], closedByParent: true}),
  'pre': new HtmlTagDefinition({ignoreFirstLf: true}),
  'listing': new HtmlTagDefinition({ignoreFirstLf: true}),
  'style': new HtmlTagDefinition({contentType: TagContentType.RAW_TEXT}),
  'script': new HtmlTagDefinition({contentType: TagContentType.RAW_TEXT}),
  'title': new HtmlTagDefinition({contentType: TagContentType.ESCAPABLE_RAW_TEXT}),
  'textarea':
      new HtmlTagDefinition({contentType: TagContentType.ESCAPABLE_RAW_TEXT, ignoreFirstLf: true}),
};

const _DEFAULT_TAG_DEFINITION = new HtmlTagDefinition();

export function getHtmlTagDefinition(tagName: string): HtmlTagDefinition {
  return TAG_DEFINITIONS[tagName.toLowerCase()] || _DEFAULT_TAG_DEFINITION;
}
