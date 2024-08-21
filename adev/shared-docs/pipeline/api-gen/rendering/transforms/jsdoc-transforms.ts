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

export const JS_DOC_USAGE_NOTES_TAG = 'usageNotes';
export const JS_DOC_SEE_TAG = 'see';
export const JS_DOC_DESCRIPTION_TAG = 'description';

// Some links are written in the following format: {@link Route}
const jsDoclinkRegex = /\{\s*@link\s+([^}]+)\s*\}/;
const jsDoclinkRegexGlobal = /\{\s*@link\s+([^}]+)\s*\}/g;

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

  return {
    ...entry,
    htmlUsageNotes,
  };
}

/** Given a markdown JsDoc text, gets the rendered HTML. */
function getHtmlForJsDocText<T extends HasModuleName>(text: string, entry: T): string {
  return marked.parse(convertLinks(wrapExampleHtmlElementsWithCode(text), entry)) as string;
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

function getHtmlAdditionalLinks<T extends HasJsDocTags & HasModuleName>(
  entry: T,
): LinkEntryRenderable[] {
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

        // handling links like {@link Route Some route with description}
        const [symbol, description] = link.split(/\s(.+)/);
        if (entry && description) {
          return {
            label: description.trim(),
            url: `${getLinkToModule(entry.moduleName)}/${symbol}`,
          };
        }

        // handling links like {@link Route}
        return {
          label: linkMatch[1].trim(),
          url: `${getLinkToModule(entry.moduleName)}/${linkMatch[1].trim()}`,
        };
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

function convertLinks(text: string, entry: HasModuleName) {
  return text.replace(jsDoclinkRegexGlobal, (_, link) => {
    const [symbol, description] = link.split(/\s(.+)/);
    if (symbol && description) {
      // {@link Route Some route with description}
      return `<a href="${getLinkToModule(entry.moduleName)}/${symbol}"><code>${description}</code></a>`;
    } else {
      // {@link Route}
      return `<a href="${getLinkToModule(entry.moduleName)}/${symbol}"><code>${symbol}</code></a>`;
    }
  });
}
