/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DocEntry,
  EntryType,
  FunctionSignatureMetadata,
  GenericEntry,
  MemberEntry,
  DecoratorEntry,
  MemberTags,
  ParameterEntry,
  PropertyEntry,
} from '../entities.mjs';

import {
  isClassEntry,
  isClassMethodEntry,
  isConstantEntry,
  isDecoratorEntry,
  isDeprecatedEntry,
  isEnumEntry,
  isFunctionEntry,
  isGetterEntry,
  isInitializerApiFunctionEntry,
  isInterfaceEntry,
  isSetterEntry,
  isTypeAliasEntry,
} from '../entities/categorization.mjs';
import {CodeLineRenderable} from '../entities/renderables.mjs';
import {HasModuleName, HasRenderableToc} from '../entities/traits.mjs';
import {getModuleName} from '../symbol-context.mjs';
import {
  codeToHtml,
  insertParenthesesForDecoratorInShikiHtml,
  replaceKeywordFromShikiHtml,
} from '../shiki/shiki.mjs';

import {filterLifecycleMethods, mergeGettersAndSetters} from './member-transforms.mjs';
import {getLinkToModule} from './url-transforms.mjs';
import {formatJs} from './format-code.mjs';

const INDENT = '  ';
const SPACE = ' ';
const LN_BREAK = '\n';
const INDENTED_NEW_LINE = `${LN_BREAK}${INDENT}`;

// Allows to generate links for code lines.
interface CodeTableOfContentsData {
  // The contents of code block.
  contents: string;
  // The keys are code line numbers and the values are ids.
  codeLineNumbersWithIdentifiers: Map<number, string>;
  deprecatedLineNumbers: number[];
}

/** Split generated code with syntax highlighting into single lines */
export function splitLines(text: string): string[] {
  if (text.length === 0) {
    return [];
  }
  return text.split(/\r\n|\r|\n/g);
}

/**
 * Based on provided docEntry:
 * 1. Build metadata
 * 2. Run syntax highlighting
 * 3. Generate list of renderable code lines.
 */
export async function addRenderableCodeToc<T extends DocEntry & HasModuleName>(
  entry: T,
): Promise<T & HasRenderableToc> {
  const metadata = mapDocEntryToCode(entry);
  appendPrefixAndSuffix(entry, metadata);

  // For now we only format functions with prettier
  let formattedCode: string | null = null;
  if (entry.entryType === EntryType.Function || entry.entryType === EntryType.Decorator) {
    formattedCode = await formatJs(metadata.contents);
  }

  let codeWithSyntaxHighlighting = codeToHtml(formattedCode ?? metadata?.contents, 'typescript');

  if (isDecoratorEntry(entry)) {
    // Shiki requires a keyword for correct formating of Decorators
    // We use an interface and then replace it with a '@'
    codeWithSyntaxHighlighting = replaceKeywordFromShikiHtml(
      'class|function',
      codeWithSyntaxHighlighting,
      '@',
    );
    // if (entry.entryType === EntryType.InterfaceLikeDecorator) {
    // We need to add parentheses around the curly braces for this kind of decorators
    codeWithSyntaxHighlighting = insertParenthesesForDecoratorInShikiHtml(
      codeWithSyntaxHighlighting,
    );
    // }
  }

  // Note: Don't expect enum value in signatures to be linked correctly
  // as shiki already splits them into separate span blocks.
  // Only the enum itself will recieve a link
  codeWithSyntaxHighlighting = addApiLinksToHtml(codeWithSyntaxHighlighting);

  // shiki returns the lines wrapped by 2 node : 1 pre node, 1 code node.
  // As leveraging jsdom isn't trivial here, we rely on a regex to extract the line nodes
  const pattern = /(.*?)<code.*?>(.*?)<\/code>(.*)/s;
  const match = codeWithSyntaxHighlighting.match(pattern);
  if (!match) {
    return {
      ...entry,
      codeLinesGroups: new Map(),
      afterCodeGroups: '',
      beforeCodeGroups: '',
      formattedCode,
    };
  }
  const beforeCode = match[1];
  const insideCode = match[2];
  const afterCode = match[3];

  const lines = splitLines(insideCode);
  const groups = groupCodeLines(lines, metadata, entry);

  return {
    ...entry,
    codeLinesGroups: groups,
    beforeCodeGroups: beforeCode,
    afterCodeGroups: afterCode,
    formattedCode: formattedCode ? codeWithSyntaxHighlighting : null,
  };
}

/** Group overloaded methods */
function groupCodeLines(lines: string[], metadata: CodeTableOfContentsData, entry: DocEntry) {
  const hasSingleSignature = isFunctionEntry(entry) && entry.signatures.length === 1;
  return lines.reduce((groups, line, index) => {
    const tocItem: CodeLineRenderable = {
      contents: line,
      id: hasSingleSignature ? undefined : metadata.codeLineNumbersWithIdentifiers.get(index),
      isDeprecated: metadata.deprecatedLineNumbers.some((lineNumber) => lineNumber === index),
    };

    if (tocItem.id !== undefined && groups.has(tocItem.id)) {
      const group = groups.get(tocItem.id);
      group?.push(tocItem);
    } else {
      groups.set(tocItem.id ?? index.toString(), [tocItem]);
    }

    return groups;
  }, new Map<string, CodeLineRenderable[]>());
}

function mapDocEntryToCode(entry: DocEntry): CodeTableOfContentsData {
  const isDeprecated = isDeprecatedEntry(entry);
  const deprecatedLineNumbers = isDeprecated ? [0] : [];

  if (isClassEntry(entry) || (isDecoratorEntry(entry) && isClassLikeDecorator(entry))) {
    const members = filterLifecycleMethods(mergeGettersAndSetters(entry.members!));
    return getCodeTocData(members, isDeprecated);
  }

  if (isDecoratorEntry(entry) && !isClassLikeDecorator(entry)) {
    return {
      contents: entry
        .signatures!.map((sig) =>
          sig.parameters
            .map((param) => `${param.name}${param.isOptional ? '?' : ''}: ${param.type}`)
            .join(', '),
        )
        .join(LN_BREAK),
      codeLineNumbersWithIdentifiers: new Map<number, string>(),
      deprecatedLineNumbers: [],
    };
  }

  if (isConstantEntry(entry)) {
    return {
      contents: `const ${entry.name}: ${entry.type};`,
      codeLineNumbersWithIdentifiers: new Map(),
      deprecatedLineNumbers,
    };
  }

  if (isEnumEntry(entry)) {
    return getCodeTocData(entry.members, isDeprecated);
  }

  if (isInterfaceEntry(entry)) {
    return getCodeTocData(mergeGettersAndSetters(entry.members), isDeprecated);
  }

  if (isFunctionEntry(entry)) {
    const codeLineNumbersWithIdentifiers = new Map<number, string>();
    const hasSingleSignature = entry.signatures.length === 1;

    // Specifically handling the case of overloaded functions
    if (entry.signatures.length > 0) {
      const initialMetadata: CodeTableOfContentsData = {
        contents: '',
        codeLineNumbersWithIdentifiers: new Map<number, string>(),
        deprecatedLineNumbers,
      };

      return entry.signatures.reduce(
        (acc: CodeTableOfContentsData, curr: FunctionSignatureMetadata, index: number) => {
          const lineNumber = index;
          acc.codeLineNumbersWithIdentifiers.set(lineNumber, `${curr.name}_${index}`);
          acc.contents += getFunctionCodeLine(curr, []);

          // We don't want to add line break after the last item
          if (!hasSingleSignature && index < entry.signatures.length - 1) {
            acc.contents += '\n';
          }

          if (isDeprecatedEntry(curr)) {
            acc.deprecatedLineNumbers.push(lineNumber);
          }
          return acc;
        },
        initialMetadata,
      );
    }

    return {
      contents: getMethodCodeLine(entry.implementation, []),
      codeLineNumbersWithIdentifiers,
      deprecatedLineNumbers,
    };
  }

  if (isInitializerApiFunctionEntry(entry)) {
    const codeLineNumbersWithIdentifiers = new Map<number, string>();
    const showTypesInSignaturePreview = !!entry.__docsMetadata__?.showTypesInSignaturePreview;

    let lines: string[] = [];
    for (const [index, callSignature] of entry.callFunction.signatures.entries()) {
      lines.push(
        printInitializerFunctionSignatureLine(
          callSignature.name,
          callSignature,
          showTypesInSignaturePreview,
        ),
      );
      const id = `${callSignature.name}_${index}`;
      codeLineNumbersWithIdentifiers.set(lines.length - 1, id);
    }

    if (Object.keys(entry.subFunctions).length > 0) {
      lines.push('');

      for (const [i, subFunction] of entry.subFunctions.entries()) {
        for (const [index, subSignature] of subFunction.signatures.entries()) {
          lines.push(
            printInitializerFunctionSignatureLine(
              `${entry.name}.${subFunction.name}`,
              subSignature,
              showTypesInSignaturePreview,
            ),
          );
          const id = `${entry.name}_${subFunction.name}_${index}`;
          codeLineNumbersWithIdentifiers.set(lines.length - 1, id);
        }
        if (i < entry.subFunctions.length - 1) {
          lines.push('');
        }
      }
    }

    return {
      contents: lines.join('\n'),
      codeLineNumbersWithIdentifiers,
      deprecatedLineNumbers,
    };
  }

  if (isTypeAliasEntry(entry)) {
    const generics = makeGenericsText(entry.generics);
    const contents = `type ${entry.name}${generics} = ${entry.type}`;

    if (isDeprecated) {
      const numberOfLinesOfCode = getNumberOfLinesOfCode(contents);

      for (let i = 0; i < numberOfLinesOfCode; i++) {
        deprecatedLineNumbers.push(i);
      }
    }

    return {
      contents,
      codeLineNumbersWithIdentifiers: new Map(),
      deprecatedLineNumbers,
    };
  }

  return {
    contents: '',
    codeLineNumbersWithIdentifiers: new Map(),
    deprecatedLineNumbers,
  };
}

// TODO(matthieu): This whole part should be refactored to rely on a formatter (like prettier)
// to handle formatting (See also #59211)
/** Generate code ToC data for list of members. */
function getCodeTocData(members: MemberEntry[], isDeprecated: boolean): CodeTableOfContentsData {
  const initialMetadata: CodeTableOfContentsData = {
    contents: '',
    codeLineNumbersWithIdentifiers: new Map<number, string>(),
    deprecatedLineNumbers: isDeprecated ? [0] : [],
  };
  let lineNumber = 1;

  return members.reduce((acc: CodeTableOfContentsData, curr: MemberEntry, index: number) => {
    const setTocData = (entry: DocEntry | MemberEntry, content: string) => {
      acc.contents += `${INDENTED_NEW_LINE}${content}`;
      acc.codeLineNumbersWithIdentifiers.set(lineNumber, entry.name);
      if (isDeprecatedEntry(entry)) {
        acc.deprecatedLineNumbers.push(lineNumber);
      }

      lineNumber++;
    };

    if (isClassMethodEntry(curr)) {
      // class methods
      if (curr.signatures.length > 0) {
        curr.signatures.forEach((signature) => {
          setTocData(signature, getMethodCodeLine(signature, curr.memberTags));
        });
      } else {
        // Constructors, methods on interfaces, Decorators
        setTocData(curr, getMethodCodeLine(curr.implementation, curr.memberTags));
      }
    } else {
      // class props
      setTocData(curr, getCodeLine(curr));
    }
    return acc;
  }, initialMetadata);
}

function getCodeLine(member: MemberEntry): string {
  if (isGetterEntry(member)) {
    return getGetterCodeLine(member);
  } else if (isSetterEntry(member)) {
    return getSetterCodeLine(member);
  }
  return getPropertyCodeLine(member as PropertyEntry);
}

/** Map getter, setter and property entry to text */
function getPropertyCodeLine(member: PropertyEntry): string {
  const isOptional = isOptionalMember(member);
  const tags = getTags(member);

  return `${tags.join(SPACE)}${tags.length ? SPACE : ''}${member.name}${markOptional(isOptional)}: ${member.type};`;
}

/** Map method entry to text */
function getMethodCodeLine(member: FunctionSignatureMetadata, memberTags: MemberTags[]): string {
  const generics = makeGenericsText(member.generics);
  return (
    `${memberTags.join(SPACE)}${memberTags.length ? ' ' : ''}${member.name}${generics}(` +
    `${member.params.map((param) => mapParamEntry(param)).join(`, `)}` +
    `): ${member.returnType};`
  );
}

function getFunctionCodeLine(member: FunctionSignatureMetadata, memberTags: MemberTags[]) {
  return `function ${getMethodCodeLine(member, memberTags).trim()}`;
}

function mapParamEntry(entry: ParameterEntry) {
  return `${entry.isRestParam ? '...' : ''}${entry.name}${markOptional(entry.isOptional)}: ${
    entry.type
  }`;
}

function getGetterCodeLine(member: PropertyEntry): string {
  const tags = getTags(member);

  return `${tags.join(SPACE)} get ${member.name}(): ${member.type};`;
}

function getSetterCodeLine(member: PropertyEntry): string {
  const tags = getTags(member);

  return `${tags.join(SPACE)} set ${member.name}(value: ${member.type});`;
}

function markOptional(isOptional: boolean): string {
  return isOptional ? '?' : '';
}

function isOptionalMember(member: PropertyEntry): boolean {
  return member.memberTags.some((tag) => tag === 'optional');
}

function getTags(member: PropertyEntry): string[] {
  return member.memberTags
    .map((tag) => {
      if (tag === 'input') {
        return !member.inputAlias || member.name === member.inputAlias
          ? '@Input()'
          : `@Input('${member.inputAlias}')`;
      } else if (tag === 'output') {
        return !member.outputAlias || member.name === member.outputAlias
          ? '@Output()'
          : `@Output('${member.outputAlias}')`;
      } else if (tag === 'optional') {
        return '';
      }
      return tag;
    })
    .filter((tag) => !!tag);
}

function getNumberOfLinesOfCode(contents: string): number {
  return contents.split('\n').length;
}

/** Prints an initializer function signature into a single line. */
export function printInitializerFunctionSignatureLine(
  name: string,
  signature: FunctionSignatureMetadata,
  showTypesInSignaturePreview: boolean,
): string {
  let res = name;
  if (signature.generics.length > 0) {
    res += '<';
    for (let i = 0; i < signature.generics.length; i++) {
      const generic = signature.generics[i];
      res += generic.name;
      if (generic.default !== undefined) {
        res += ` = ${generic.default}`;
      }
      if (i < signature.generics.length - 1) {
        res += ', ';
      }
    }
    res += '>';
  }
  res += '(';
  for (let i = 0; i < signature.params.length; i++) {
    const param = signature.params[i];
    if (param.isRestParam) {
      res += '...';
    }
    res += `${param.name}${markOptional(param.isOptional)}`;
    if (showTypesInSignaturePreview) {
      res += `: ${param.type}`;
    }
    if (i < signature.params.length - 1) {
      res += ', ';
    }
  }
  res += ')';
  if (showTypesInSignaturePreview) {
    res += `: ${signature.returnType}`;
  }
  res += ';';
  return `function ${res}`;
}

function appendPrefixAndSuffix(entry: DocEntry, codeTocData: CodeTableOfContentsData): void {
  const appendFirstAndLastLines = (
    data: CodeTableOfContentsData,
    firstLine: string,
    lastLine: string,
  ) => {
    data.contents = `${firstLine}${data.contents}${lastLine}`;
  };

  if (isClassEntry(entry) || isInterfaceEntry(entry)) {
    const generics = makeGenericsText(entry.generics);
    const extendsStr = entry.extends ? ` extends ${entry.extends}` : '';
    const implementsStr =
      entry.implements.length > 0 ? ` implements ${entry.implements.join(' ,')}` : '';

    const signature = `${entry.name}${generics}${extendsStr}${implementsStr}`;
    if (isClassEntry(entry)) {
      const abstractPrefix = entry.isAbstract ? 'abstract ' : '';
      appendFirstAndLastLines(codeTocData, `${abstractPrefix}class ${signature} {`, `\n}`);
    }

    if (isInterfaceEntry(entry)) {
      appendFirstAndLastLines(codeTocData, `interface ${signature} {`, `\n}`);
    }
  }

  if (isEnumEntry(entry)) {
    appendFirstAndLastLines(codeTocData, `enum ${entry.name} {`, `\n}`);
  }
  if (isDecoratorEntry(entry)) {
    if (isClassLikeDecorator(entry)) {
      appendFirstAndLastLines(codeTocData, `class ${entry.name} {`, `\n}`);
    } else {
      let lines = splitLines(codeTocData.contents);
      if (lines.length === 0) {
        codeTocData.contents = `function ${entry.name}()`;
      } else {
        codeTocData.contents = lines.map((line) => `function ${entry.name}(${line})`).join('\n');
      }
    }
  }
}

/**
 * Replaces any code block that isn't already wrapped by an anchor element
 * by a link if the symbol is known
 */
export function addApiLinksToHtml(htmlString: string): string {
  const result = htmlString.replace(
    // This regex looks for span/code blocks not wrapped by an anchor block
    // or the tag doesn't contain `data-skip-anchor` attribute.
    // Their content are then replaced with a link if the symbol is known
    //                                         The captured content ==>  vvvvvvvv
    /(?<!<a[^>]*>)(<(?:(?:span)|(?:code))(?!\sdata-skip-anchor)[^>]*>\s*)([^<]*?)(\s*<\/(?:span|code)>)/g,
    (type: string, span1: string, potentialSymbolName: string, span2: string) => {
      const [symbol, subSymbol] = potentialSymbolName.split(/(?:#|\.)/) as [string, string?];

      // mySymbol() => mySymbol
      const symbolWithoutInvocation = symbol.replace(/\([^)]*\);?/g, '');
      const moduleName = getModuleName(symbolWithoutInvocation);

      if (moduleName) {
        return `${span1}<a href="${getLinkToModule(moduleName, symbol, subSymbol)}">${potentialSymbolName}</a>${span2}`;
      }

      return type;
    },
  );

  return result;
}

/**
 * Constructs a TypeScript generics string based on an array of generic type entries.
 *
 * This function takes an array of generic type entries and returns a formatted string
 * representing TypeScript generics syntax, including any constraints and default values
 * specified in each entry.
 *
 * @param generics - An array of `GenericEntry` objects representing the generics to be formatted,
 *                   or `undefined` if there are no generics.
 *
 * @returns A formatted string representing TypeScript generics syntax, or an empty string if no generics are provided.
 */
export function makeGenericsText(generics: GenericEntry[] | undefined): string {
  if (!generics?.length) {
    return '';
  }

  const parts: string[] = ['<'];

  for (let index = 0; index < generics.length; index++) {
    const {constraint, default: defaultVal, name} = generics[index];

    parts.push(name);

    if (constraint) {
      parts.push(' extends ', constraint);
    }

    if (defaultVal !== undefined) {
      parts.push(' = ', defaultVal);
    }

    if (index < generics.length - 1) {
      parts.push(', ');
    }
  }

  parts.push('>');

  return parts.join('');
}

function isClassLikeDecorator(entry: DecoratorEntry): boolean {
  return !!entry.members;
}
