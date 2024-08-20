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
import {getModuleName} from '../symbol-context';

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
  const htmlDescription = getHtmlForJsDocText(description, entry).trim();
  const shortHtmlDescription = getHtmlForJsDocText(
    shortTextMatch ? shortTextMatch[0] : '',
    entry,
  ).trim();
  return {
    ...entry,
    htmlDescription,
    shortHtmlDescription,
  };
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
      htmlComment: getHtmlForJsDocText(tag.comment, entry),
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
  const usageNotesTag = entry.jsdocTags.find((tag) => tag.name === JS_DOC_USAGE_NOTES_TAG);
  const htmlUsageNotes = usageNotesTag
    ? (marked.parse(
        convertJsDocExampleToHtmlExample(wrapExampleHtmlElementsWithCode(usageNotesTag.comment)),
      ) as string)
    : '';

  const transformedHtml = addApiLinksToHtml(htmlUsageNotes);

  return {
    ...entry,
    htmlUsageNotes: transformedHtml,
  };
}

/** Given a markdown JsDoc text, gets the rendered HTML. */
function getHtmlForJsDocText<T extends HasModuleName>(text: string, entry: T): string {
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
      ? getHtmlForJsDocText(deprecationMessage, entry)
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

function convertJsDocExampleToHtmlExample(text: string): string {
  const codeExampleAtRule = /{@example (\S+) region=(['"])([^'"]+)\2\s*}/g;

  return text.replace(
    codeExampleAtRule,
    (_: string, path: string, separator: string, region: string) => {
      return `<code-example path="${path}" region="${region}" />`;
    },
  );
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

function parseAtLink(link: string) {
  // Because of microsoft/TypeScript/issues/59679
  // getTextOfJSDocComment introduces an extra space between the symbol and a trailing ()
  link = link.replace(/ \(\)$/, '');

  let [rawSymbol, description] = link.split(/\s(.+)/);
  let [symbol, subSymbol] = rawSymbol.split(/(?:#|\.)/);

  const moduleName = getModuleName(symbol)!;
  if (!moduleName) {
    logWarning(link, symbol);
  }

  return {
    label: description ?? rawSymbol,
    url: getLinkToModule(moduleName, symbol, subSymbol),
  };
}

function logWarning(link: string, symbol: string) {
  // TODO: remove the links that generate this error
  // TODO: throw an error when there are no more warning generated
  console.warn(`WARNING: {@link ${link}} is invalid, ${symbol} is unknown in this context`);
}
