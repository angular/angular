/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ParseTemplateOptions} from '@angular/compiler';

import {
  getOrParseComponentTemplate,
  isDeclarationFilePath,
  usesDirectInlineTemplate,
} from './compiler-utils.js';
import {
  getOrCreateFileAnalysis,
  type FileAnalysis,
  type ParsedComponentTemplate,
} from './file_analysis.js';
import type {IAnalyzer} from './hybrid_compiler.js';
import {NOOP_TRACER, type Tracer} from './perf.js';
import type * as nga from './types.js';

/** Shared analyzer and cache state for cross-file dependency template lookups. */
export interface DependencyTemplateContext {
  analyzer: IAnalyzer;
  fileCache: Map<string, FileAnalysis>;
  /**
   * Metadata already at hand (e.g. the files of the chunk being processed), preferred to a round
   * trip to the analyzer.
   */
  knownMetadata?: ReadonlyMap<string, nga.AnalysisResult>;
  onMetadata?: (metadata: nga.AnalysisResult) => void;
}

/** Consumer file inputs for {@link resolveNgContentSelectors}. */
export interface ResolveNgContentSelectorsOptions extends DependencyTemplateContext {
  filePath: string;
  content: string;
  classes: nga.ClassMetadata[];
  components: readonly nga.ClassMetadata[];
  templatesByClass: Map<string, ParsedComponentTemplate>;
  templateParseOptions?: Partial<ParseTemplateOptions>;
  tracer?: Tracer;
}

/**
 * Identifies a class within its declaring file. The name alone is not enough: same-named classes
 * can be declared in different scopes of one file, which is why `FileAnalysis.parsedTemplates`
 * is keyed by `makeClassKey(className, span.start)`.
 */
interface ClassId {
  name: string;
  nameStart: number;
}

/**
 * Component classes whose template is not parsed yet, grouped by the file declaring them and
 * keyed by the start of their name span.
 */
type MissingTemplates = Map<string, Map<number, ClassId>>;

/**
 * Resolves `ngContentSelectors` for `resolvedDeclarations` of each component in `components`.
 *
 * The analyzer does not parse templates, so the only `DeclarationMetadata` that carry a
 * component's `ngContentSelectors` are those it read off a `.d.ts` (the `NgContentSelectors` type
 * argument of `ɵɵComponentDeclaration`). For a component declared in a source file of the
 * compilation they are missing, and the type-check block then cannot tell whether a control flow
 * block keeps a node out of the slot it targets (`controlFlowPreventingContentProjection`,
 * NG8011). ngtsc has them because `ComponentDecoratorHandler.analyze` registers the parsed
 * template's selectors in its metadata registry.
 *
 * Selectors are recovered from each dependency's own parsed template, cached in the declaring
 * file's `FileAnalysis.parsedTemplates` under the same key that processing of that file uses so
 * whichever runs first parses and the other reuses. Missing cross-file dependencies across all
 * components in `components` are deduplicated per `(filePath, classId)` and fetched concurrently.
 * Input declaration arrays and entries are never mutated.
 *
 * TODO(ngp): remove once the analyzer parses templates and reports `ngContentSelectors` itself.
 */
export async function resolveNgContentSelectors(
  options: ResolveNgContentSelectorsOptions,
): Promise<Map<nga.ClassMetadata, nga.DeclarationMetadata[]>> {
  const {
    analyzer,
    fileCache,
    knownMetadata,
    onMetadata,
    filePath,
    content,
    classes,
    components,
    templatesByClass,
    templateParseOptions,
    tracer = NOOP_TRACER,
  } = options;

  const missing: MissingTemplates = new Map();
  for (const cls of components) {
    for (const decl of cls.component?.resolvedDeclarations ?? []) {
      const depFilePath = decl.filePath ?? filePath;
      if (!needsNgContentSelectors(decl) || depFilePath === filePath) {
        continue;
      }
      const id = classIdOf(decl);
      const cached = fileCache.get(depFilePath)?.parsedTemplates;
      if (cached !== undefined && findParsedTemplate(cached, id) !== null) {
        continue;
      }
      let classIds = missing.get(depFilePath);
      if (classIds === undefined) {
        classIds = new Map();
        missing.set(depFilePath, classIds);
      }
      classIds.set(id.nameStart, id);
    }
  }

  if (missing.size > 0) {
    await Promise.all(
      Array.from(missing, async ([depFilePath, classIds]) => {
        const metadata =
          knownMetadata?.get(depFilePath) ?? (await analyzer.getMetadataForFile(depFilePath));
        if (metadata == null) {
          return;
        }
        onMetadata?.(metadata);
        const targetClasses: nga.ClassMetadata[] = [];
        let needsSource = false;
        for (const id of classIds.values()) {
          const classMeta = findComponentClass(metadata.classes, id);
          if (classMeta?.component != null) {
            targetClasses.push(classMeta);
            needsSource ||= usesDirectInlineTemplate(classMeta.component);
          }
        }
        if (targetClasses.length === 0) {
          return;
        }
        const fileAnalysis = getOrCreateFileAnalysis(fileCache, depFilePath);
        let depContent = '';
        if (needsSource) {
          depContent = fileAnalysis.sourceContent ?? (await analyzer.getFileContent(depFilePath));
          fileAnalysis.sourceContent = depContent;
        }
        for (const classMeta of targetClasses) {
          getOrParseComponentTemplate(
            fileAnalysis.parsedTemplates,
            classMeta,
            classMeta.component!,
            depFilePath,
            depContent,
            templateParseOptions,
            tracer,
          );
        }
      }),
    );
  }

  const resolvedByClass = new Map<nga.ClassMetadata, nga.DeclarationMetadata[]>();
  for (const cls of components) {
    const declarations = cls.component?.resolvedDeclarations ?? [];
    let enriched: nga.DeclarationMetadata[] | null = null;
    for (let i = 0; i < declarations.length; i++) {
      const decl = declarations[i];
      if (!needsNgContentSelectors(decl)) {
        continue;
      }
      const depFilePath = decl.filePath ?? filePath;
      const id = classIdOf(decl);
      let parsed: ParsedComponentTemplate | null = null;
      if (depFilePath === filePath) {
        const sameFileClass = findComponentClass(classes, id);
        if (sameFileClass?.component != null) {
          parsed = getOrParseComponentTemplate(
            templatesByClass,
            sameFileClass,
            sameFileClass.component,
            filePath,
            content,
            templateParseOptions,
            tracer,
          );
        }
      } else {
        const depTemplates = fileCache.get(depFilePath)?.parsedTemplates;
        parsed = depTemplates !== undefined ? findParsedTemplate(depTemplates, id) : null;
      }
      if (parsed === null) {
        continue;
      }
      enriched ??= [...declarations];
      enriched[i] = {...decl, ngContentSelectors: parsed.ngContentSelectors};
    }
    resolvedByClass.set(cls, enriched ?? declarations);
  }
  return resolvedByClass;
}

function findComponentClass(
  classes: nga.ClassMetadata[],
  id: ClassId,
): nga.ClassMetadata | undefined {
  return classes.find(
    (c) => c.nameSpan?.start === id.nameStart && c.className === id.name && c.component != null,
  );
}

/**
 * Whether `decl` is a source-file component whose `ngContentSelectors` must be recovered from
 * its template. Declaration files never carry templates, so legacy `.d.ts` components that omit
 * the `NgContentSelectors` type argument are skipped as well.
 */
export function needsNgContentSelectors(decl: nga.DeclarationMetadata): boolean {
  return (
    decl.declarationType === 'component' &&
    decl.ngContentSelectors == null &&
    !isDeclarationFilePath(decl.filePath)
  );
}

function classIdOf(decl: nga.DeclarationMetadata): ClassId {
  return {name: decl.name, nameStart: decl.nameSpan.start};
}

/**
 * Fingerprints what `template` contributes to the components that use its component: its
 * `<ng-content>` tags, in order, which are all that `resolveNgContentSelectors` reads off it. Two
 * templates with the same signature yield the same `ngContentSelectors`, so a consumer only
 * has to be re-bound when a dependency's signature changes, not on every edit to its template.
 *
 * This scans the text rather than parsing it, as it runs for every analyzed component. The scan
 * skips HTML comments and honors quoted attribute values, so a `>` inside `select="div > span"`
 * does not end the tag early. It may still pick up an `<ng-content>` that the parser would not
 * treat as one (e.g. inside a `<script>`), which only costs a spurious re-binding.
 */
export function ngContentSignature(template: string): string {
  const tags: string[] = [];
  const length = template.length;
  let i = 0;
  while (i < length) {
    const start = template.indexOf('<', i);
    if (start === -1) {
      break;
    }
    if (template.startsWith('<!--', start)) {
      const end = template.indexOf('-->', start + 4);
      i = end === -1 ? length : end + 3;
      continue;
    }
    if (!isNgContentTagStart(template, start)) {
      i = start + 1;
      continue;
    }
    // Scan to the `>` closing the tag, skipping quoted attribute values.
    let end = start + NG_CONTENT_TAG.length;
    let quote: string | null = null;
    while (end < length) {
      const char = template[end];
      if (quote !== null) {
        if (char === quote) {
          quote = null;
        }
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === '>') {
        break;
      }
      end++;
    }
    tags.push(template.slice(start, end + 1));
    i = end + 1;
  }
  return tags.join('\n');
}

const NG_CONTENT_TAG = '<ng-content';

/** Whether an `<ng-content` tag starts at `index`, rather than e.g. `<ng-container`. */
function isNgContentTagStart(template: string, index: number): boolean {
  const end = index + NG_CONTENT_TAG.length;
  if (template.slice(index, end).toLowerCase() !== NG_CONTENT_TAG) {
    return false;
  }
  if (end >= template.length) {
    return true;
  }
  return /[\s/>]/.test(template[end]);
}

/**
 * The cached template of the class `id`, without needing its class span (which is what the cache
 * is keyed by, through `makeClassKey(className, span.start)`, but is not known before the
 * declaring file's metadata is). Entries are matched on the name span start recorded when they
 * were cached instead.
 */
function findParsedTemplate(
  templatesByClass: Map<string, ParsedComponentTemplate>,
  id: ClassId,
): ParsedComponentTemplate | null {
  const prefix = `${id.name}@`;
  for (const [key, parsed] of templatesByClass) {
    if (key.startsWith(prefix) && parsed.classNameStart === id.nameStart) {
      return parsed;
    }
  }
  return null;
}
