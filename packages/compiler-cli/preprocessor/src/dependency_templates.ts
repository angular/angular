/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ParseTemplateOptions} from '@angular/compiler';

import {getOrParseComponentTemplate} from './compiler-utils.js';
import {
  getOrCreateFileAnalysis,
  type FileAnalysis,
  type ParsedComponentTemplate,
} from './file_analysis.js';
import type {IAnalyzer} from './hybrid_compiler.js';
import type * as nga from './types.js';

/** The file whose component's dependencies are being resolved. */
export interface DependencyTemplateConsumer {
  filePath: string;
  content: string;
  classes: nga.ClassMetadata[];
  templatesByClass: Map<string, ParsedComponentTemplate>;
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
 * Fills in template-derived metadata of the components a template depends on.
 *
 * The analyzer does not parse templates, so the only `DeclarationMetadata` that carry a
 * component's `ngContentSelectors` are those it read off a `.d.ts` (the `NgContentSelectors` type
 * argument of `ɵɵComponentDeclaration`). For a component declared in a source file of the
 * compilation they are missing, and the type-check block then cannot tell whether a control flow
 * block keeps a node out of the slot it targets (`controlFlowPreventingContentProjection`,
 * NG8011). ngtsc has them because `ComponentDecoratorHandler.analyze` registers the parsed
 * template's selectors in its metadata registry.
 *
 * They are recovered from the dependency's own parsed template. The template is parsed at most
 * once: it is cached in the dependency file's `FileAnalysis.parsedTemplates` under the same key
 * the processing of that file uses, so whichever of the two runs first parses and the other
 * reuses. A dependency file is read once per call, however many of its components are needed.
 *
 * TODO(ngp): remove once the analyzer parses templates and reports `ngContentSelectors` itself.
 */
export class DependencyTemplates {
  /**
   * @param knownMetadata Metadata already at hand (e.g. the files of the chunk being
   *     processed), preferred to a round trip to the analyzer.
   */
  constructor(
    private readonly analyzer: IAnalyzer,
    private readonly fileCache: Map<string, FileAnalysis>,
    private readonly templateParseOptions: Partial<ParseTemplateOptions> | undefined,
    private readonly knownMetadata?: ReadonlyMap<string, nga.AnalysisResult>,
  ) {}

  /**
   * Returns `declarations` with `ngContentSelectors` filled in for every source-file component
   * that lacks them. The input array and its entries are not mutated; it is returned as is when
   * nothing had to change.
   */
  withNgContentSelectors(
    declarations: nga.DeclarationMetadata[],
    consumer: DependencyTemplateConsumer,
  ): nga.DeclarationMetadata[] {
    const missing: MissingTemplates = new Map();
    this.collectMissing(declarations, consumer.filePath, missing);
    for (const [filePath, classIds] of missing) {
      // The sidecar analyzer has no synchronous lookups and throws. Its callers `prefetch` first,
      // so nothing is missing by the time they get here; a dependency that still is gets no
      // selectors rather than failing the whole file.
      const metadata =
        this.knownMetadata?.get(filePath) ??
        safeLookup(() => this.analyzer.getMetadataForFileSync(filePath));
      const content = metadata && safeLookup(() => this.analyzer.getFileContentSync(filePath));
      if (metadata && content !== null) {
        this.parseTemplates(filePath, metadata.classes, content, classIds.values());
      }
    }

    let result: nga.DeclarationMetadata[] | null = null;
    for (let i = 0; i < declarations.length; i++) {
      const decl = declarations[i];
      if (!needsNgContentSelectors(decl)) {
        continue;
      }
      const parsed = this.getTemplate(decl, consumer);
      if (parsed === null) {
        continue;
      }
      result ??= [...declarations];
      result[i] = {...decl, ngContentSelectors: parsed.ngContentSelectors};
    }
    return result ?? declarations;
  }

  /**
   * Parses and caches the templates of the cross-file component dependencies of every component
   * in `consumer` that `withNgContentSelectors` would otherwise have to read synchronously. For
   * analyzers without synchronous lookups (the sidecar), this has to run before the consumer is
   * bound. The dependency files are read concurrently.
   */
  async prefetch(consumer: nga.AnalysisResult): Promise<void> {
    const missing: MissingTemplates = new Map();
    for (const cls of consumer.classes) {
      this.collectMissing(cls.component?.resolvedDeclarations ?? [], consumer.filePath, missing);
    }
    await Promise.all(
      Array.from(missing, async ([filePath, classIds]) => {
        const metadata =
          this.knownMetadata?.get(filePath) ?? (await this.analyzer.getMetadataForFile(filePath));
        if (metadata == null) {
          return;
        }
        const content = await this.analyzer.getFileContent(filePath);
        this.parseTemplates(filePath, metadata.classes, content, classIds.values());
      }),
    );
  }

  /**
   * Adds to `missing` the components among `declarations` that are declared in a file other than
   * `consumerPath` and whose template is not cached yet. Same-file dependencies are parsed from
   * the consumer's own content, which the caller already has.
   */
  private collectMissing(
    declarations: nga.DeclarationMetadata[],
    consumerPath: string,
    missing: MissingTemplates,
  ): void {
    for (const decl of declarations) {
      const filePath = decl.filePath ?? consumerPath;
      if (!needsNgContentSelectors(decl) || filePath === consumerPath) {
        continue;
      }
      const id = classIdOf(decl);
      if (findParsedTemplate(this.getParsedTemplates(filePath), id) !== null) {
        continue;
      }
      let classIds = missing.get(filePath);
      if (classIds === undefined) {
        classIds = new Map();
        missing.set(filePath, classIds);
      }
      classIds.set(id.nameStart, id);
    }
  }

  /** Parses the templates of `classIds` into `filePath`'s cache, if not there already. */
  private parseTemplates(
    filePath: string,
    classes: nga.ClassMetadata[],
    content: string,
    classIds: Iterable<ClassId>,
  ): void {
    const templatesByClass = this.getParsedTemplates(filePath);
    for (const id of classIds) {
      this.getOrParseTemplate(id, classes, filePath, content, templatesByClass);
    }
  }

  private getTemplate(
    decl: nga.DeclarationMetadata,
    consumer: DependencyTemplateConsumer,
  ): ParsedComponentTemplate | null {
    const filePath = decl.filePath ?? consumer.filePath;
    const id = classIdOf(decl);
    if (filePath === consumer.filePath) {
      return this.getOrParseTemplate(
        id,
        consumer.classes,
        consumer.filePath,
        consumer.content,
        consumer.templatesByClass,
      );
    }
    return findParsedTemplate(this.getParsedTemplates(filePath), id);
  }

  private getParsedTemplates(filePath: string): Map<string, ParsedComponentTemplate> {
    return getOrCreateFileAnalysis(this.fileCache, filePath).parsedTemplates;
  }

  private getOrParseTemplate(
    id: ClassId,
    classes: nga.ClassMetadata[],
    filePath: string,
    content: string,
    templatesByClass: Map<string, ParsedComponentTemplate>,
  ): ParsedComponentTemplate | null {
    const classMeta = classes.find(
      (c) => c.nameSpan?.start === id.nameStart && c.className === id.name && c.component != null,
    );
    if (classMeta?.component == null) {
      return null;
    }
    return getOrParseComponentTemplate(
      templatesByClass,
      classMeta,
      classMeta.component,
      filePath,
      content,
      this.templateParseOptions,
    );
  }
}

function needsNgContentSelectors(decl: nga.DeclarationMetadata): boolean {
  return decl.declarationType === 'component' && decl.ngContentSelectors == null;
}

function classIdOf(decl: nga.DeclarationMetadata): ClassId {
  return {name: decl.name, nameStart: decl.nameSpan.start};
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

function safeLookup<T>(lookup: () => T): T | null {
  try {
    return lookup();
  } catch {
    return null;
  }
}
