/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {TagStyle} from '@codemirror/language';
import {tags} from '@lezer/highlight';

export const SYNTAX_STYLES: TagStyle[] = [
  /** A comment. */
  {tag: tags.comment, color: 'var(--code-comment)'},

  /** A language keyword. */
  {tag: tags.keyword, color: 'var(--code-keyword)'},

  /** A string literal */
  {tag: tags.string, color: 'var(--code-string)'},

  /** A number literal. */
  {tag: tags.number, color: 'var(--code-number)'},

  /** A tag name, subtag of typeName. */
  {tag: tags.tagName, color: 'var(--code-tags)'},

  /** The name of a class. */
  {tag: tags.className, color: 'var(--code-component)'},

  /** A line comment. */
  {tag: tags.lineComment, color: 'var(--code-line-comment)'},

  /** A block comment. */
  {tag: tags.blockComment, color: 'var(--code-block-comment)'},

  /** A documentation comment. */
  {tag: tags.docComment, color: 'var(--code-doc-comment)'},

  /** Any kind of identifier. */
  {tag: tags.name, color: 'var(--code-name)'},

  /** The name of a variable. */
  {tag: tags.variableName, color: 'var(--code-variable-name)'},

  /** A type name */
  {tag: tags.typeName, color: 'var(--code-type-name)'},

  /** A property or field name. */
  {tag: tags.propertyName, color: 'var(--code-property-name)'},

  /** An attribute name, subtag of propertyName. */
  {tag: tags.attributeName, color: 'var(--code-attribute-name)'},

  /** A label name. */
  {tag: tags.labelName, color: 'var(--code-label-name)'},

  /** A namespace name. */
  {tag: tags.namespace, color: 'var(--code-namespace)'},

  /** The name of a macro. */
  {tag: tags.macroName, color: 'var(--code-macro-name)'},

  /** A literal value. */
  {tag: tags.literal, color: 'var(--code-literal)'},

  /** A documentation string. */
  {tag: tags.docString, color: 'var(--code-doc-string)'},

  /** A character literal (subtag of string). */
  {tag: tags.character, color: 'var(--code-character)'},

  /** An attribute value (subtag of string). */
  {tag: tags.attributeValue, color: 'var(--code-attribute-value)'},

  /** An integer number literal. */
  {tag: tags.integer, color: 'var(--code-integer)'},

  /** A floating-point number literal. */
  {tag: tags.float, color: 'var(--code-float)'},

  /** A boolean literal. */
  {tag: tags.bool, color: 'var(--code-bool)'},

  /** Regular expression literal. */
  {tag: tags.regexp, color: 'var(--code-regexp)'},

  /** An escape literal, for example a backslash escape in a string. */
  {tag: tags.escape, color: 'var(--code-escape)'},

  /** A color literal . */
  {tag: tags.color, color: 'var(--code-color)'},

  /** A URL literal. */
  {tag: tags.url, color: 'var(--code-url)'},

  /** The keyword for the self or this object. */
  {tag: tags.self, color: 'var(--code-self)'},

  /** The keyword for null. */
  {tag: tags.null, color: 'var(--code-null)'},

  /** A keyword denoting some atomic value. */
  {tag: tags.atom, color: 'var(--code-atom)'},

  /** A keyword that represents a unit. */
  {tag: tags.unit, color: 'var(--code-unit)'},

  /** A modifier keyword. */
  {tag: tags.modifier, color: 'var(--code-modifier)'},

  /** A keyword that acts as an operator. */
  {tag: tags.operatorKeyword, color: 'var(--code-operator-keyword)'},

  /** A control-flow related keyword. */
  {tag: tags.controlKeyword, color: 'var(--code-control-keyword)'},

  /** A keyword that defines something. */
  {tag: tags.definitionKeyword, color: 'var(--code-definition-keyword)'},

  /** A keyword related to defining or interfacing with modules. */
  {tag: tags.moduleKeyword, color: 'var(--code-module-keyword)'},

  /** An operator. */
  {tag: tags.operator, color: 'var(--code-operator)'},

  /** An operator that dereferences something. */
  {tag: tags.derefOperator, color: 'var(--code-deref-operator)'},

  /** Arithmetic-related operator. */
  {tag: tags.arithmeticOperator, color: 'var(--code-arithmetic-operator)'},

  /** Logical operator. */
  {tag: tags.logicOperator, color: 'var(--code-logic-operator)'},

  /** Bit operator. */
  {tag: tags.bitwiseOperator, color: 'var(--code-bitwise-operator)'},

  /** Comparison operator. */
  {tag: tags.compareOperator, color: 'var(--code-compare-operator)'},

  /** Operator that updates its operand. */
  {tag: tags.updateOperator, color: 'var(--code-update-operator)'},

  /** Operator that defines something. */
  {tag: tags.definitionOperator, color: 'var(--code-definition-operator)'},

  /** Type-related operator. */
  {tag: tags.typeOperator, color: 'var(--code-type-operator)'},

  /** Control-flow operator. */
  {tag: tags.controlOperator, color: 'var(--code-control-operator)'},

  /** Program or markup punctuation. */
  {tag: tags.punctuation, color: 'var(--code-punctuation)'},

  /** Punctuation that separates things. */
  {tag: tags.separator, color: 'var(--code-separator)'},

  /** Bracket-style punctuation. */
  {tag: tags.bracket, color: 'var(--code-bracket)'},

  /** Angle brackets (usually `<` and `>` tokens). */
  {tag: tags.angleBracket, color: 'var(--code-angle-bracket)'},

  /** Square brackets (usually `[` and `]` tokens). */
  {tag: tags.squareBracket, color: 'var(--code-square-bracket)'},

  /** Parentheses (usually `(` and `)` tokens). Subtag of bracket. */
  {tag: tags.paren, color: 'var(--code-paren)'},

  /** Braces (usually `{` and `}` tokens). Subtag of bracket. */
  {tag: tags.brace, color: 'var(--code-brace)'},

  /** Content, for example plain text in XML or markup documents. */
  {tag: tags.content, color: 'var(--code-content)'},

  /** Content that represents a heading. */
  {tag: tags.heading, color: 'var(--code-heading)'},

  /** A level 1 heading. */
  {tag: tags.heading1, color: 'var(--code-heading1)'},

  /** A level 2 heading. */
  {tag: tags.heading2, color: 'var(--code-heading2)'},

  /** A level 3 heading. */
  {tag: tags.heading3, color: 'var(--code-heading3)'},

  /** A level 4 heading. */
  {tag: tags.heading4, color: 'var(--code-heading4)'},

  /** A level 5 heading. */
  {tag: tags.heading5, color: 'var(--code-heading5)'},

  /** A level 6 heading. */
  {tag: tags.heading6, color: 'var(--code-heading6)'},

  /** A prose separator (such as a horizontal rule). */
  {tag: tags.contentSeparator, color: 'var(--code-content-separator)'},

  /** Content that represents a list. */
  {tag: tags.list, color: 'var(--code-list)'},

  /** Content that represents a quote. */
  {tag: tags.quote, color: 'var(--code-quote)'},

  /** Content that is emphasized. */
  {tag: tags.emphasis, color: 'var(--code-emphasis)'},

  /** Content that is styled strong. */
  {tag: tags.strong, color: 'var(--code-strong)'},

  /** Content that is part of a link. */
  {tag: tags.link, color: 'var(--code-link)'},

  /** Content that is styled as code or monospace. */
  {tag: tags.monospace, color: 'var(--code-monospace)'},

  /** Content that has a strike-through style. */
  {tag: tags.strikethrough, color: 'var(--code-strikethrough)'},

  /** Inserted text in a change-tracking format. */
  {tag: tags.inserted, color: 'var(--code-inserted)'},

  /** Deleted text. */
  {tag: tags.deleted, color: 'var(--code-deleted)'},

  /** Changed text. */
  {tag: tags.changed, color: 'var(--code-changed)'},

  /** An invalid or unsyntactic element. */
  {tag: tags.invalid, color: 'var(--code-invalid)'},

  /** Metadata or meta-instruction. */
  {tag: tags.meta, color: 'var(--code-meta)'},

  /** Metadata that applies to the entire document. */
  {tag: tags.documentMeta, color: 'var(--code-document-meta)'},

  /** Metadata that annotates or adds attributes to a given syntactic element. */
  {tag: tags.annotation, color: 'var(--code-annotation)'},

  /** Processing instruction or preprocessor directive. Subtag of meta. */
  {tag: tags.processingInstruction, color: 'var(--code-processing-instruction)'},
];
