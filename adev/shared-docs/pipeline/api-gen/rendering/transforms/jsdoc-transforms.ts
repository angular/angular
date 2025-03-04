/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import {JsDocTagEntry} from '../entities';

import {
  getDeprecatedEntry,
  isDeprecatedEntry,
  isDeveloperPreview,
  isExperimental,
} from '../entities/categorization';
import {LinkEntryRenderable} from '../entities/renderables';
import {
  HasAdditionalLinks,
  HasDeprecatedFlag,
  HasDescription,
  HasDeveloperPreviewFlag,
  HasHtmlDescription,
  HasHtmlUsageNotes,
  HasJsDocTags,
  HasModuleName,
  HasRenderableJsDocTags,
  hasExperimentalFlag,
} from '../entities/traits';

import {getLinkToModule} from './url-transforms';
import {addApiLinksToHtml} from './code-transforms';
import {getCurrentSymbol, getModuleName, unknownSymbolMessage} from '../symbol-context';

export const JS_DOC_REMARKS_TAG = 'remarks';
export const JS_DOC_USAGE_NOTES_TAG = 'usageNotes';
export const JS_DOC_SEE_TAG = 'see';
export const JS_DOC_DESCRIPTION_TAG = 'description';

// Some links are written in the following format: {@link Route}
const jsDoclinkRegex = /\{\s*@link\s+([^}]+)\s*\}/;
const jsDoclinkRegexGlobal = new RegExp(jsDoclinkRegex.source, 'g');

/** Given an entity with a description, gets the entity augmented with an `htmlDescription`. */
export function addHtmlDescription<T extends HasDescription & HasModuleName>(
  entry: T,
): T & HasHtmlDescription {
  const firstParagraphRule = /(.*?)(?:\n\n|$)/s;

  let jsDocDescription = '';

  if ('jsdocTags' in entry) {
    jsDocDescription =
      (entry.jsdocTags as JsDocTagEntry[]).find((tag) => tag.name === JS_DOC_DESCRIPTION_TAG)
        ?.comment ?? '';
  }

  const description = !!entry.description ? entry.description : jsDocDescription;
  const shortTextMatch = description.match(firstParagraphRule);
  const htmlDescription = getHtmlForJsDocText(description).trim();
  const shortHtmlDescription = getHtmlForJsDocText(shortTextMatch ? shortTextMatch[0] : '').trim();

  return {...entry, htmlDescription, shortHtmlDescription};
}

/**
 * Given an entity with JsDoc tags, gets the entity with JsDocTagRenderable entries that
 * have been augmented with an `htmlComment`.
 */
export function addHtmlJsDocTagComments<T extends HasJsDocTags & HasModuleName>(
  entry: T,
): T & HasRenderableJsDocTags {
  return {
    ...entry,
    jsdocTags: entry.jsdocTags.map((tag) => ({
      ...tag,
      htmlComment: getHtmlForJsDocText(tag.comment),
    })),
  };
}

/** Given an entity with `See also` links. */
export function addHtmlAdditionalLinks<T extends HasJsDocTags & HasModuleName>(
  entry: T,
): T & HasAdditionalLinks {
  return {
    ...entry,
    additionalLinks: getHtmlAdditionalLinks(entry),
  };
}

export function addHtmlUsageNotes<T extends HasJsDocTags>(entry: T): T & HasHtmlUsageNotes {
  const usageNotesTag = entry.jsdocTags.find(
    ({name}) => name === JS_DOC_USAGE_NOTES_TAG || name === JS_DOC_REMARKS_TAG,
  );
  const htmlUsageNotes = usageNotesTag ? getHtmlForJsDocText(usageNotesTag.comment) : '';

  return {
    ...entry,
    htmlUsageNotes,
  };
}

/** Given a markdown JsDoc text, gets the rendered HTML. */
function getHtmlForJsDocText(text: string): string {
  const parsed = marked.parse(convertLinks(wrapExampleHtmlElementsWithCode(text))) as string;
  return addApiLinksToHtml(parsed);
}

export function setEntryFlags<T extends HasJsDocTags & HasModuleName>(
  entry: T,
): T & HasDeprecatedFlag & HasDeveloperPreviewFlag & hasExperimentalFlag {
  const deprecationMessage = getDeprecatedEntry(entry);
  return {
    ...entry,
    isDeprecated: isDeprecatedEntry(entry),
    deprecationMessage: deprecationMessage
      ? getHtmlForJsDocText(deprecationMessage)
      : deprecationMessage,
    isDeveloperPreview: isDeveloperPreview(entry),
    isExperimental: isExperimental(entry),
  };
}

function getHtmlAdditionalLinks<T extends HasJsDocTags>(entry: T): LinkEntryRenderable[] {
  const markdownLinkRule = /\[(.*?)\]\((.*?)(?: "(.*?)")?\)/;

  const seeAlsoLinks = entry.jsdocTags
    .filter((tag) => tag.name === JS_DOC_SEE_TAG)
    .map((tag) => tag.comment)
    .map((comment) => {
      const markdownLinkMatch = comment.match(markdownLinkRule);

      if (markdownLinkMatch) {
        return {
          label: markdownLinkMatch[1],
          url: markdownLinkMatch[2],
          title: markdownLinkMatch[3],
        };
      }

      const linkMatch = comment.match(jsDoclinkRegex);

      if (linkMatch) {
        const link = linkMatch[1];
        const {url, label} = parseAtLink(link);
        return {label, url};
      }

      return undefined;
    })
    .filter((link): link is LinkEntryRenderable => !!link);

  return seeAlsoLinks;
}

/**
 * Some descriptions in the text contain HTML elements like `input` or `img`,
 * we should wrap such elements using `code`.
 * Otherwise DocViewer will try to render those elements.
 */
function wrapExampleHtmlElementsWithCode(text: string) {
  return text
    .replace(/'<input>'/g, `<code><input></code>`)
    .replace(/'<img>'/g, `<code><img></code>`);
}

/**
 * Converts {@link } tags into html anchor elements
 */
function convertLinks(text: string) {
  return text.replace(jsDoclinkRegexGlobal, (_, link) => {
    const {label, url} = parseAtLink(link);

    return `<a href="${url}"><code>${label}</code></a>`;
  });
}

function parseAtLink(link: string): {label: string; url: string} {
  // Because of microsoft/TypeScript/issues/59679
  // getTextOfJSDocComment introduces an extra space between the symbol and a trailing ()
  link = link.replace(/ \(\)$/, '');

  let [rawSymbol, description] = link.split(/\s(.+)/);
  if (rawSymbol.startsWith('#')) {
    rawSymbol = rawSymbol.substring(1);
  } else if (rawSymbol.includes('/')) {
    if (!rawSymbol.startsWith('/') && !rawSymbol.startsWith('http')) {
      throw Error(
        `Forbidden relative link: ${link}. Links should be absolute and start with a slash`,
      );
    }

    return {
      url: rawSymbol,
      label: description ?? rawSymbol.split('/').pop()!,
    };
  }

  let [symbol, subSymbol] = rawSymbol.replace(/\(\)$/, '').split(/(?:#|\.)/);

  let moduleName = getModuleName(symbol);
  const label = description ?? rawSymbol;

  const currentSymbol = getCurrentSymbol();

  if (!moduleName) {
    // 2nd attemp, try to get the module name in the context of the current symbol
    moduleName = getModuleName(`${currentSymbol}.${symbol}`);

    if (!moduleName || !currentSymbol) {
      throw unknownSymbolMessage(link, symbol);
    }

    subSymbol = symbol;
    symbol = currentSymbol;
  }

  return {label, url: getLinkToModule(moduleName, symbol, subSymbol)};
}
