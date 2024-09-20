/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DomElementSchemaRegistry} from '../schema/dom_element_schema_registry';

import {getNsPrefix, TagContentType, TagDefinition} from './tags';

export class HtmlTagDefinition implements TagDefinition {
  private closedByChildren: {[key: string]: boolean} = {};
  private contentType:
    | TagContentType
    | {default: TagContentType; [namespace: string]: TagContentType};

  closedByParent = false;
  implicitNamespacePrefix: string | null;
  isVoid: boolean;
  ignoreFirstLf: boolean;
  canSelfClose: boolean;
  preventNamespaceInheritance: boolean;

  constructor({
    closedByChildren,
    implicitNamespacePrefix,
    contentType = TagContentType.PARSABLE_DATA,
    closedByParent = false,
    isVoid = false,
    ignoreFirstLf = false,
    preventNamespaceInheritance = false,
    canSelfClose = false,
  }: {
    closedByChildren?: string[];
    closedByParent?: boolean;
    implicitNamespacePrefix?: string;
    contentType?: TagContentType | {default: TagContentType; [namespace: string]: TagContentType};
    isVoid?: boolean;
    ignoreFirstLf?: boolean;
    preventNamespaceInheritance?: boolean;
    canSelfClose?: boolean;
  } = {}) {
    if (closedByChildren && closedByChildren.length > 0) {
      closedByChildren.forEach((tagName) => (this.closedByChildren[tagName] = true));
    }
    this.isVoid = isVoid;
    this.closedByParent = closedByParent || isVoid;
    this.implicitNamespacePrefix = implicitNamespacePrefix || null;
    this.contentType = contentType;
    this.ignoreFirstLf = ignoreFirstLf;
    this.preventNamespaceInheritance = preventNamespaceInheritance;
    this.canSelfClose = canSelfClose ?? isVoid;
  }

  isClosedByChild(name: string): boolean {
    return this.isVoid || name.toLowerCase() in this.closedByChildren;
  }

  getContentType(prefix?: string): TagContentType {
    if (typeof this.contentType === 'object') {
      const overrideType = prefix === undefined ? undefined : this.contentType[prefix];
      return overrideType ?? this.contentType.default;
    }
    return this.contentType;
  }
}

let DEFAULT_TAG_DEFINITION!: HtmlTagDefinition;

// see https://www.w3.org/TR/html51/syntax.html#optional-tags
// This implementation does not fully conform to the HTML5 spec.
let TAG_DEFINITIONS!: {[key: string]: HtmlTagDefinition};

export function getHtmlTagDefinition(tagName: string): HtmlTagDefinition {
  if (!TAG_DEFINITIONS) {
    DEFAULT_TAG_DEFINITION = new HtmlTagDefinition({canSelfClose: true});
    TAG_DEFINITIONS = Object.assign(Object.create(null), {
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
          'address',
          'article',
          'aside',
          'blockquote',
          'div',
          'dl',
          'fieldset',
          'footer',
          'form',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'header',
          'hgroup',
          'hr',
          'main',
          'nav',
          'ol',
          'p',
          'pre',
          'section',
          'table',
          'ul',
        ],
        closedByParent: true,
      }),
      'thead': new HtmlTagDefinition({closedByChildren: ['tbody', 'tfoot']}),
      'tbody': new HtmlTagDefinition({closedByChildren: ['tbody', 'tfoot'], closedByParent: true}),
      'tfoot': new HtmlTagDefinition({closedByChildren: ['tbody'], closedByParent: true}),
      'tr': new HtmlTagDefinition({closedByChildren: ['tr'], closedByParent: true}),
      'td': new HtmlTagDefinition({closedByChildren: ['td', 'th'], closedByParent: true}),
      'th': new HtmlTagDefinition({closedByChildren: ['td', 'th'], closedByParent: true}),
      'col': new HtmlTagDefinition({isVoid: true}),
      'svg': new HtmlTagDefinition({implicitNamespacePrefix: 'svg'}),
      'foreignObject': new HtmlTagDefinition({
        // Usually the implicit namespace here would be redundant since it will be inherited from
        // the parent `svg`, but we have to do it for `foreignObject`, because the way the parser
        // works is that the parent node of an end tag is its own start tag which means that
        // the `preventNamespaceInheritance` on `foreignObject` would have it default to the
        // implicit namespace which is `html`, unless specified otherwise.
        implicitNamespacePrefix: 'svg',
        // We want to prevent children of foreignObject from inheriting its namespace, because
        // the point of the element is to allow nodes from other namespaces to be inserted.
        preventNamespaceInheritance: true,
      }),
      'math': new HtmlTagDefinition({implicitNamespacePrefix: 'math'}),
      'li': new HtmlTagDefinition({closedByChildren: ['li'], closedByParent: true}),
      'dt': new HtmlTagDefinition({closedByChildren: ['dt', 'dd']}),
      'dd': new HtmlTagDefinition({closedByChildren: ['dt', 'dd'], closedByParent: true}),
      'rb': new HtmlTagDefinition({
        closedByChildren: ['rb', 'rt', 'rtc', 'rp'],
        closedByParent: true,
      }),
      'rt': new HtmlTagDefinition({
        closedByChildren: ['rb', 'rt', 'rtc', 'rp'],
        closedByParent: true,
      }),
      'rtc': new HtmlTagDefinition({closedByChildren: ['rb', 'rtc', 'rp'], closedByParent: true}),
      'rp': new HtmlTagDefinition({
        closedByChildren: ['rb', 'rt', 'rtc', 'rp'],
        closedByParent: true,
      }),
      'optgroup': new HtmlTagDefinition({closedByChildren: ['optgroup'], closedByParent: true}),
      'option': new HtmlTagDefinition({
        closedByChildren: ['option', 'optgroup'],
        closedByParent: true,
      }),
      'pre': new HtmlTagDefinition({ignoreFirstLf: true}),
      'listing': new HtmlTagDefinition({ignoreFirstLf: true}),
      'style': new HtmlTagDefinition({contentType: TagContentType.RAW_TEXT}),
      'script': new HtmlTagDefinition({contentType: TagContentType.RAW_TEXT}),
      'title': new HtmlTagDefinition({
        // The browser supports two separate `title` tags which have to use
        // a different content type: `HTMLTitleElement` and `SVGTitleElement`
        contentType: {
          default: TagContentType.ESCAPABLE_RAW_TEXT,
          svg: TagContentType.PARSABLE_DATA,
        },
      }),
      'textarea': new HtmlTagDefinition({
        contentType: TagContentType.ESCAPABLE_RAW_TEXT,
        ignoreFirstLf: true,
      }),
    });

    new DomElementSchemaRegistry().allKnownElementNames().forEach((knownTagName) => {
      if (!TAG_DEFINITIONS[knownTagName] && getNsPrefix(knownTagName) === null) {
        TAG_DEFINITIONS[knownTagName] = new HtmlTagDefinition({canSelfClose: false});
      }
    });
  }
  // We have to make both a case-sensitive and a case-insensitive lookup, because
  // HTML tag names are case insensitive, whereas some SVG tags are case sensitive.
  return (
    TAG_DEFINITIONS[tagName] ?? TAG_DEFINITIONS[tagName.toLowerCase()] ?? DEFAULT_TAG_DEFINITION
  );
}
