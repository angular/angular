'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, '__esModule', {value: true});
exports.asPlainTextWithLinks = asPlainTextWithLinks;
exports.tagsToMarkdown = tagsToMarkdown;
exports.documentationToMarkdown = documentationToMarkdown;
const initialize_1 = require('../../common/initialize');
const utils_1 = require('./utils');
function replaceLinks(text) {
  return (
    text
      // Http(s) links
      .replace(
        /\{@(link|linkplain|linkcode) (https?:\/\/[^ |}]+?)(?:[| ]([^{}\n]+?))?\}/gi,
        (_, tag, link, text) => {
          switch (tag) {
            case 'linkcode':
              return `[\`${text ? text.trim() : link}\`](${link})`;
            default:
              return `[${text ? text.trim() : link}](${link})`;
          }
        },
      )
  );
}
function processInlineTags(text) {
  return replaceLinks(text);
}
function getTagBodyText(tag, getScriptInfo) {
  if (!tag.text) {
    return undefined;
  }
  // Convert to markdown code block if it does not already contain one
  function makeCodeblock(text) {
    if (/^\s*[~`]{3}/m.test(text)) {
      return text;
    }
    return '```\n' + text + '\n```';
  }
  let text = convertLinkTags(tag.text, getScriptInfo);
  switch (tag.name) {
    case 'example': {
      // Example text does not support `{@link}` as it is considered code.
      // TODO: should we support it if it appears outside of an explicit code block?
      text = asPlainText(tag.text);
      // check for caption tags, fix for #79704
      const captionTagMatches = text.match(/<caption>(.*?)<\/caption>\s*(\r\n|\n)/);
      if (captionTagMatches && captionTagMatches.index === 0) {
        return (
          captionTagMatches[1] + '\n' + makeCodeblock(text.substr(captionTagMatches[0].length))
        );
      } else {
        return makeCodeblock(text);
      }
    }
    case 'author': {
      // fix obsucated email address, #80898
      const emailMatch = text.match(/(.+)\s<([-.\w]+@[-.\w]+)>/);
      if (emailMatch === null) {
        return text;
      } else {
        return `${emailMatch[1]} ${emailMatch[2]}`;
      }
    }
    case 'default':
      return makeCodeblock(text);
  }
  return processInlineTags(text);
}
function getTagDocumentation(tag, getScriptInfo) {
  var _a;
  switch (tag.name) {
    case 'augments':
    case 'extends':
    case 'param':
    case 'template': {
      const body = getTagBody(tag, getScriptInfo);
      if ((body === null || body === void 0 ? void 0 : body.length) === 3) {
        const param = body[1];
        const doc = body[2];
        const label = `*@${tag.name}* \`${param}\``;
        if (!doc) {
          return label;
        }
        return (
          label +
          (doc.match(/\r\n|\n/g)
            ? '  \n' + processInlineTags(doc)
            : ` \u2014 ${processInlineTags(doc)}`)
        );
      }
      break;
    }
    case 'return':
    case 'returns': {
      // For return(s), we require a non-empty body
      if (!((_a = tag.text) === null || _a === void 0 ? void 0 : _a.length)) {
        return undefined;
      }
      break;
    }
  }
  // Generic tag
  const label = `*@${tag.name}*`;
  const text = getTagBodyText(tag, getScriptInfo);
  if (!text) {
    return label;
  }
  return label + (text.match(/\r\n|\n/g) ? '  \n' + text : ` \u2014 ${text}`);
}
function getTagBody(tag, getScriptInfo) {
  if (tag.name === 'template') {
    const parts = tag.text;
    if (parts && typeof parts !== 'string') {
      const params = parts
        .filter((p) => p.kind === 'typeParameterName')
        .map((p) => p.text)
        .join(', ');
      const docs = parts
        .filter((p) => p.kind === 'text')
        .map((p) => convertLinkTags(p.text.replace(/^\s*-?\s*/, ''), getScriptInfo))
        .join(' ');
      return params ? ['', params, docs] : undefined;
    }
  }
  return convertLinkTags(tag.text, getScriptInfo).split(/^(\S+)\s*-?\s*/);
}
function asPlainText(parts) {
  if (typeof parts === 'string') {
    return parts;
  }
  return parts.map((part) => part.text).join('');
}
function asPlainTextWithLinks(documentation, getScriptInfo) {
  return processInlineTags(convertLinkTags(documentation, getScriptInfo));
}
/**
 * Convert `@link` inline tags to markdown links
 */
function convertLinkTags(documentation, getScriptInfo) {
  var _a, _b;
  if (!documentation) {
    return '';
  }
  if (typeof documentation === 'string') {
    return documentation;
  }
  const out = [];
  let currentLink;
  for (const part of documentation) {
    switch (part.kind) {
      case 'link':
        if (currentLink) {
          if (currentLink.target) {
            const scriptInfo = getScriptInfo(currentLink.target.fileName);
            const args = {
              file: currentLink.target.fileName, // Prevent VS Code from trying to transform the uri,
              position: scriptInfo
                ? (0, utils_1.tsTextSpanToLspRange)(scriptInfo, currentLink.target.textSpan)
                : undefined,
            };
            const command = `command:${initialize_1.OpenJsDocLinkCommandId}?${encodeURIComponent(JSON.stringify(args))}`;
            const linkText = currentLink.text
              ? currentLink.text
              : escapeMarkdownSyntaxTokensForCode(
                  (_a = currentLink.name) !== null && _a !== void 0 ? _a : '',
                );
            out.push(`[${currentLink.linkcode ? '`' + linkText + '`' : linkText}](${command})`);
          } else {
            const text = (_b = currentLink.text) !== null && _b !== void 0 ? _b : currentLink.name;
            if (text) {
              if (/^https?:/.test(text)) {
                const parts = text.split(' ');
                if (parts.length === 1) {
                  out.push(parts[0]);
                } else if (parts.length > 1) {
                  const linkText = escapeMarkdownSyntaxTokensForCode(parts.slice(1).join(' '));
                  out.push(
                    `[${currentLink.linkcode ? '`' + linkText + '`' : linkText}](${parts[0]})`,
                  );
                }
              } else {
                out.push(escapeMarkdownSyntaxTokensForCode(text));
              }
            }
          }
          currentLink = undefined;
        } else {
          currentLink = {linkcode: part.text === '{@linkcode '};
        }
        break;
      case 'linkName':
        if (currentLink) {
          currentLink.name = part.text;
          currentLink.target = part.target;
        }
        break;
      case 'linkText':
        if (currentLink) {
          currentLink.text = part.text;
        }
        break;
      default:
        out.push(part.text);
        break;
    }
  }
  return processInlineTags(out.join(''));
}
function escapeMarkdownSyntaxTokensForCode(text) {
  return text.replace(/`/g, '\\$&'); // CodeQL [SM02383] This is only meant to escape backticks.
  // The Markdown is fully sanitized after being rendered.
}
function tagsToMarkdown(tags, getScriptInfo) {
  return tags.map((tag) => getTagDocumentation(tag, getScriptInfo)).join('  \n\n');
}
function documentationToMarkdown(documentation, tags, getScriptInfo) {
  const out = [];
  appendDocumentationAsMarkdown(out, documentation, tags, getScriptInfo);
  return out;
}
function appendDocumentationAsMarkdown(out, documentation, tags, getScriptInfo) {
  if (documentation) {
    out.push(asPlainTextWithLinks(documentation, getScriptInfo));
  }
  if (tags) {
    const tagsPreview = tagsToMarkdown(tags, getScriptInfo);
    if (tagsPreview) {
      out.push('\n\n' + tagsPreview);
    }
  }
  return out;
}
//# sourceMappingURL=text_render.js.map
