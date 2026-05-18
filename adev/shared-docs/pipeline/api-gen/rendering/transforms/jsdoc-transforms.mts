/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {JsDocTagEntry} from '../entities.mjs';

import {getDeprecatedEntry, getTagSinceVersion} from '../entities/categorization.mjs';
import {LinkEntryRenderable} from '../entities/renderables.mjs';
import {
  HasAdditionalLinks,
  HasDeprecatedFlag,
  HasDescription,
  HasDeveloperPreviewFlag,
  hasExperimentalFlag,
  HasHtmlDescription,
  HasHtmlUsageNotes,
  HasJsDocTags,
  HasModuleName,
  HasRenderableJsDocTags,
  HasStableFlag,
  MaybeJsDocTags,
} from '../entities/traits.mjs';

import {parseMarkdown} from '../../../shared/marked/parse.mjs';
import {getHighlighterInstance} from '../shiki/shiki.mjs';
import {
  getCurrentSymbol,
  getSymbolMembers,
  getSymbolsAsApiEntries,
  getSymbolUrl,
  unknownSymbolMessage,
} from '../symbol-context.mjs';
import {getAnchorsForRoute, hasDefinedRoutes, isKnownRoute} from '../defined-routes-context.mjs';
import {addApiLinksToHtml} from './code-transforms.mjs';

const JS_DOC_USAGE_NOTE_TAGS: Set<string> = new Set(['remarks', 'usageNotes', 'example']);
export const JS_DOC_SEE_TAG = 'see';
export const JS_DOC_DESCRIPTION_TAG = 'description';

// Some links are written in the following format: {@link Route}
const jsDoclinkRegex = /\{\s*@link\s+([^}]+)\s*\}/;
const jsDoclinkRegexGlobal = new RegExp(jsDoclinkRegex.source, 'g');

/**
 * Section anchors that the API page templates always emit (via `SectionHeading` /
 * `convertSectionNameToId`). Fragments matching one of these are valid even though they don't
 * correspond to a class/interface member.
 *
 * Keep in sync with `templates/section-*.tsx` and the inline `<SectionHeading name="...">` usages.
 */
const KNOWN_API_SECTION_ANCHORS = new Set(['description', 'usage-notes', 'api', 'pipe-usage']);

/** Given an entity with a description, gets the entity augmented with an `htmlDescription`. */
export function addHtmlDescription<T extends HasDescription & HasModuleName & MaybeJsDocTags>(
  entry: T,
): T & HasHtmlDescription {
  const firstParagraphRule = /(.*?)(?:\n\n|$)/s;

  let jsDocDescription = '';

  if ('jsdocTags' in entry) {
    jsDocDescription =
      (entry.jsdocTags as JsDocTagEntry[]).find((tag) => tag.name === JS_DOC_DESCRIPTION_TAG)
        ?.comment ?? '';
  }

  let description = entry.description || jsDocDescription;
  let shortDescription = description.match(firstParagraphRule)?.[0] ?? '';

  // For the cases where the @description tag is after a short description
  if (jsDocDescription && description !== jsDocDescription) {
    shortDescription = entry.description;
    description = jsDocDescription;
  }

  const htmlDescription = getHtmlForJsDocText(description).trim();
  const shortHtmlDescription = getHtmlForJsDocText(shortDescription).trim();

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
  const usageNotesTags = entry.jsdocTags.filter(({name}) => JS_DOC_USAGE_NOTE_TAGS.has(name)) ?? [];
  let htmlUsageNotes = '';
  for (const {comment} of usageNotesTags) {
    htmlUsageNotes += getHtmlForJsDocText(comment);
  }

  return {
    ...entry,
    htmlUsageNotes,
  };
}

/** Given a markdown JsDoc text, gets the rendered HTML. */
function getHtmlForJsDocText(text: string): string {
  const escaped = wrapExampleHtmlElementsWithCode(text);
  validateMarkdownLinks(escaped);
  const mdToParse = convertLinks(escaped);
  const parsed = parseMarkdown(mdToParse, {
    apiEntries: getSymbolsAsApiEntries(),
    highlighter: getHighlighterInstance(),
    definedRoutes: [],
  });
  return addApiLinksToHtml(parsed);
}

// Markdown inline link: [label](url) or [label](url "title"). Used to extract URLs for
// build-time validation against the guide/api manifests. We only care about the URL group.
const markdownLinkUrlRegexGlobal = /\[(?:[^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/**
 * Walk every markdown `[label](url)` link in `text` and run the same `/api/...` and `/guide/...`
 * validation that `{@link}` URLs are subject to. This catches broken/stale links written in
 * plain markdown , including those in `@see` tag comments , at build time.
 */
function validateMarkdownLinks(text: string): void {
  for (const match of text.matchAll(markdownLinkUrlRegexGlobal)) {
    validateInternalUrl(match[1]);
  }
}

/**
 * Validate an absolute or relative internal documentation URL. Accepts URLs with or without a
 * leading `/` since both forms are common in markdown link syntax. External URLs (`http`, `mailto`,
 * `#`-only fragments, etc.) and unknown shapes are accepted as-is , this validator only enforces
 * correctness for paths it knows how to check.
 */
function validateInternalUrl(url: string): void {
  if (!url || url.startsWith('#') || url.startsWith('http') || url.startsWith('mailto:')) {
    return;
  }
  // Normalise leading slash for prefix matching but keep the original for error messages.
  const normalised = url.startsWith('/') ? url : `/${url}`;
  if (normalised.startsWith('/api/')) {
    validateApiUrl(url, normalised);
  } else if (normalised.startsWith('/guide/')) {
    validateGuideUrl(url, normalised);
  }
}

function validateApiUrl(originalUrl: string, normalisedUrl: string): void {
  const [pathPart, fragment] = normalisedUrl.split('#');
  const segments = pathPart.split('/').filter((s) => s.length > 0);
  const symbolName = segments.at(-1)!;
  const knownSymbols = Object.keys(getSymbolsAsApiEntries());
  // Prefer an exact-case match (e.g. both `inject` and `Inject` exist in core) and only fall
  // back to a case-insensitive lookup to suggest the canonical capitalisation.
  const canonicalSymbol = knownSymbols.includes(symbolName)
    ? symbolName
    : knownSymbols.find((s) => s.toLowerCase() === symbolName.toLowerCase());
  if (canonicalSymbol && canonicalSymbol !== symbolName) {
    const expectedUrl = getSymbolUrl(canonicalSymbol);
    throw Error(
      `Broken link: ${originalUrl}. Did you mean ${expectedUrl}? ` +
        `Symbol names in API URLs are case-sensitive.`,
    );
  }
  if (fragment && canonicalSymbol && !KNOWN_API_SECTION_ANCHORS.has(fragment)) {
    const members = getSymbolMembers(canonicalSymbol);
    if (members && !members.has(fragment)) {
      const memberMatch = [...members].find((m) => m.toLowerCase() === fragment.toLowerCase());
      const hint = memberMatch
        ? `Did you mean #${memberMatch}? Member names are case-sensitive.`
        : `${canonicalSymbol} has no member named '${fragment}'.`;
      throw Error(`Broken link: ${originalUrl}. ${hint}`);
    }
  }
}

function validateGuideUrl(originalUrl: string, normalisedUrl: string): void {
  if (!hasDefinedRoutes()) {
    return;
  }
  const [pathPart, fragment] = normalisedUrl.split('#');
  // Strip the leading `/` and any trailing `/` so the key matches the manifest entries
  // (`guide/...`, not `/guide/...`).
  const guidePath = pathPart.replace(/^\//, '').replace(/\/$/, '');
  const fullKey = fragment ? `${guidePath}#${fragment}` : guidePath;

  if (isKnownRoute(fullKey)) {
    return;
  }

  if (!fragment) {
    throw new Error(`Broken link: ${originalUrl}. Unknown guide page ${guidePath}. `);
  }
  // The page may exist (just not this anchor) or may itself be unknown. Distinguish so the
  // error message can suggest a near-match anchor when possible.
  const knownAnchors = getAnchorsForRoute(guidePath);
  if (!isKnownRoute(guidePath) && knownAnchors.length === 0) {
    throw new Error(`Broken link: ${originalUrl}. Unknown guide page ${guidePath}. `);
  }
  const anchorMatch = knownAnchors.find((a) => a.toLowerCase() === fragment.toLowerCase());
  const hint = anchorMatch
    ? `Did you mean #${anchorMatch}? Anchor IDs are case-sensitive.`
    : `Page ${guidePath} has no heading with id '${fragment}'.`;

  throw new Error(`Broken link: ${originalUrl}. ${hint}`);
}

export function setEntryFlags<T extends HasJsDocTags & HasModuleName>(
  entry: T,
): T & HasDeprecatedFlag & HasDeveloperPreviewFlag & hasExperimentalFlag & HasStableFlag {
  const deprecationMessage = getDeprecatedEntry(entry);
  return {
    ...entry,
    deprecated: getTagSinceVersion(entry, 'deprecated', true),
    deprecationMessage: deprecationMessage
      ? getHtmlForJsDocText(deprecationMessage)
      : deprecationMessage,
    developerPreview: getTagSinceVersion(entry, 'developerPreview'),
    experimental: getTagSinceVersion(entry, 'experimental'),
    stable: getTagSinceVersion(entry, 'publicApi'),
  };
}

function getHtmlAdditionalLinks<T extends HasJsDocTags>(entry: T): LinkEntryRenderable[] {
  const markdownLinkRule = /\[(.*?)\]\((.*?)(?: "(.*?)")?\)/;

  const seeAlsoLinks = entry.jsdocTags
    .filter((tag) => tag.name === JS_DOC_SEE_TAG)
    .map((tag) => tag.comment)
    .map((comment) => {
      // TODO: Throw when the comment is an absolute link.
      // With TS 5.9 this is not possible as the ts api that extracts comments from tags strips the "http" part of links.

      const markdownLinkMatch = comment.match(markdownLinkRule);

      if (markdownLinkMatch) {
        validateInternalUrl(markdownLinkMatch[2]);
        return {
          label: convertBackticksToCodeTags(markdownLinkMatch[1]),
          url: markdownLinkMatch[2],
          title: markdownLinkMatch[3],
        };
      }

      const linkMatch = comment.match(jsDoclinkRegex);

      if (linkMatch) {
        const link = linkMatch[1];
        const parsed = parseAtLink(link);
        if (!parsed) {
          return undefined;
        }
        const {url, label} = parsed;
        return {label, url};
      }

      return undefined;
    })
    .filter((link): link is LinkEntryRenderable => !!link);

  return seeAlsoLinks;
}

/**
 * Converts backticks to HTML code tags.
 * This handles code blocks within link text, e.g., `ViewContainerRef.createComponent`
 */
function convertBackticksToCodeTags(text: string): string {
  // Convert backticks to <code> tags
  return text.replace(/`([^`]+)`/g, '<code>$1</code>');
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
    const parsed = parseAtLink(link);
    if (!parsed) {
      return `<code>${link}</code>`; // leave the link as-is if we can't parse it
    }
    const {label, url} = parsed;

    return `<a href="${url}"><code>${label}</code></a>`;
  });
}

function parseAtLink(link: string): {label: string; url: string} | undefined {
  let [rawSymbol, description] = link.split(/\s(.+)/);
  if (rawSymbol.startsWith('#')) {
    rawSymbol = rawSymbol.substring(1);
  } else if (rawSymbol.includes('/')) {
    if (!rawSymbol.startsWith('/') && !rawSymbol.startsWith('http')) {
      throw Error(
        `Forbidden relative link: ${link}. Links should be absolute and start with a slash`,
      );
    }

    // Validate absolute `/api/...` and `/guide/...` URLs against the known registries. Catches
    // miscased symbols, unknown members and stale `#fragment` anchors at build time. Same logic is
    // also applied to plain markdown `[label](url)` links via `validateMarkdownLinks`.
    validateInternalUrl(rawSymbol);

    return {
      url: rawSymbol,
      label: description ?? rawSymbol.split('/').pop()!,
    };
  }

  let url = getSymbolUrl(rawSymbol);
  const label = description ?? rawSymbol;

  if (!url) {
    const currentSymbol = getCurrentSymbol();
    // 2nd attempt, try to get the module name in the context of the current symbol
    url = getSymbolUrl(`${currentSymbol}.${rawSymbol}`);

    if (!url || !currentSymbol) {
      throw unknownSymbolMessage(link, rawSymbol);
    }
  }

  return {label, url};
}
