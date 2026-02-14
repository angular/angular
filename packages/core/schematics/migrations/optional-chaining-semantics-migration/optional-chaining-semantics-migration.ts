/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {
  confirmAsSerializable,
  ProgramInfo,
  projectFile,
  ProjectFile,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {extractAngularClassMetadata} from '../../utils/extract_metadata';
import {NgComponentTemplateVisitor} from '../../utils/ng_component_template';
import {getPropertyNameText} from '../../utils/typescript/property_name';
import {AbsoluteFsPath} from '../../../../compiler-cli';
import {migrateTemplate, migrateTemplateBestEffort} from './add-null-coalescing';

export interface MigrationConfig {
  /**
   * Whether to migrate this component template.
   */
  shouldMigrate?: (containingFile: ProjectFile) => boolean;

  /**
   * When enabled, uses `?? null` for expressions that can't be safely converted
   * to ternaries (method calls, keyed access, pipes, etc).
   *
   * **⚠️ DANGEROUS**: `?? null` can incorrectly convert genuinely `undefined`
   * runtime values to `null`. Only use this if you've verified that affected
   * expressions never legitimately produce `undefined`. Similar to signal
   * migration's `--best-effort-mode`.
   */
  bestEffortMode?: boolean;

  /**
   * When enabled, prompts the user for each template before applying changes.
   * Only applicable when running via CLI (not programmatic API).
   *
   * The prompt shows the before/after diff for each template and lets the
   * user accept, skip, or abort the migration.
   */
  interactiveMode?: boolean;

  /**
   * Callback for interactive mode. Called for each template with `?.` usage.
   * Return `true` to apply changes, `false` to skip.
   * If not provided and `interactiveMode` is true, defaults to accepting all.
   */
  promptForTemplate?: (info: TemplatePromptInfo) => Promise<boolean>;
}

export interface TemplatePromptInfo {
  componentName: string;
  filePath: string;
  originalContent: string;
  migratedContent: string;
  fullyMigrated: boolean;
  migratedCount: number;
  skippedCount: number;
}

export interface TemplateResult {
  file: ProjectFile;
  templateFile: ProjectFile;
  componentName: string;
  fullyMigrated: boolean;
  migratedCount: number;
  skippedCount: number;
  /** Original template content for interactive mode diff display. */
  originalContent: string;
  /** Migrated template content (only valid when fullyMigrated or bestEffortMode). */
  migratedContent: string;
  replacements: Replacement[];
  /** Whether this template was approved in interactive mode. Null = not interactive. */
  approved: boolean | null;
}

export function migrateHostExpression(expression: string, bestEffort: boolean) {
  const prefix = `<div [x]="`;
  const suffix = `"></div>`;
  const escapedExpr = expression.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const wrapped = `${prefix}${escapedExpr}${suffix}`;

  const result = bestEffort ? migrateTemplateBestEffort(wrapped) : migrateTemplate(wrapped);
  const migratedEscaped = result.migrated.substring(
    prefix.length,
    result.migrated.length - suffix.length,
  );
  const migrated = migratedEscaped.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  return {
    ...result,
    migrated,
  };
}

export function escapeForHostStringLiteral(
  content: string,
  initializer: ts.StringLiteralLike,
): string {
  const text = initializer.getText();
  const quote = text[0];

  let escaped = content.replace(/\\/g, '\\\\');
  if (quote === "'") {
    escaped = escaped.replace(/'/g, "\\'");
  } else if (quote === '"') {
    escaped = escaped.replace(/"/g, '\\"');
  } else if (quote === '`') {
    escaped = escaped.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  }
  return escaped;
}

export interface CompilationUnitData {
  templates: TemplateResult[];
}

/**
 * Migration for switching from legacy to native optional chaining semantics.
 *
 * Modes:
 *
 * **Default (safe):** Converts `a?.b?.c` → `a != null ? (a.b != null ? a.b.c : null) : null`
 * Only modifies a template if ALL its `?.` expressions were successfully converted.
 * Templates with method calls, pipes, keyed access, etc. are left untouched.
 *
 * **Best-effort (dangerous):** Also applies `?? null` to expressions that can't be
 * converted to ternaries. This covers more cases but may incorrectly convert
 * genuinely `undefined` values to `null`. Use `--best-effort-mode` CLI flag.
 *
 * **Interactive:** Prompts for each template before applying. Use `--interactive` CLI flag.
 *
 * The project-wide `nativeOptionalChainingSemantics: true` should only be enabled when
 * ALL templates were either fully migrated or have no `?.` usage.
 */
export class OptionalChainingSemanticsMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  constructor(private readonly config: MigrationConfig = {}) {
    super();
  }

  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const {sourceFiles, program} = info;
    const typeChecker = program.getTypeChecker();
    const templates: TemplateResult[] = [];
    const bestEffort = this.config.bestEffortMode ?? false;

    for (const sf of sourceFiles) {
      ts.forEachChild(sf, (node: ts.Node) => {
        if (!ts.isClassDeclaration(node)) return;

        const file = projectFile(node.getSourceFile(), info);
        if (this.config.shouldMigrate && !this.config.shouldMigrate(file)) return;

        const templateVisitor = new NgComponentTemplateVisitor(typeChecker);
        templateVisitor.visitNode(node);

        templateVisitor.resolvedTemplates.forEach((tpl) => {
          const result = bestEffort
            ? migrateTemplateBestEffort(tpl.content)
            : migrateTemplate(tpl.content);

          // Skip templates with no safe navigation — already native-safe
          if (!result.hasSafeNavigation) return;

          const canApply = result.fullyMigrated;
          const replacements: Replacement[] = [];

          if (canApply) {
            const fileToMigrate = tpl.inline
              ? file
              : projectFile(tpl.filePath as AbsoluteFsPath, info);
            replacements.push(
              new Replacement(
                fileToMigrate,
                new TextUpdate({
                  position: tpl.start,
                  end: tpl.start + tpl.content.length,
                  toInsert: result.migrated,
                }),
              ),
            );
          }

          templates.push({
            file,
            templateFile: tpl.inline ? file : projectFile(tpl.filePath as AbsoluteFsPath, info),
            componentName: node.name?.text ?? '<anonymous>',
            fullyMigrated: canApply,
            migratedCount: result.migratedCount,
            skippedCount: result.skippedCount,
            originalContent: tpl.content,
            migratedContent: result.migrated,
            replacements,
            approved: null,
          });
        });

        const classMetadata = extractAngularClassMetadata(typeChecker, node);
        if (classMetadata !== null) {
          for (const property of classMetadata.node.properties) {
            if (!ts.isPropertyAssignment(property)) {
              continue;
            }
            const propertyName = getPropertyNameText(property.name);
            if (propertyName !== 'host' || !ts.isObjectLiteralExpression(property.initializer)) {
              continue;
            }

            for (const hostProp of property.initializer.properties) {
              if (
                !ts.isPropertyAssignment(hostProp) ||
                !ts.isStringLiteralLike(hostProp.initializer)
              ) {
                continue;
              }

              const expression = hostProp.initializer.text;
              const result = migrateHostExpression(expression, bestEffort);
              if (!result.hasSafeNavigation) {
                continue;
              }

              const canApply = result.fullyMigrated;
              const replacements: Replacement[] = [];
              if (canApply) {
                const escapedMigrated = escapeForHostStringLiteral(
                  result.migrated,
                  hostProp.initializer,
                );
                replacements.push(
                  new Replacement(
                    file,
                    new TextUpdate({
                      position: hostProp.initializer.getStart() + 1,
                      end: hostProp.initializer.getEnd() - 1,
                      toInsert: escapedMigrated,
                    }),
                  ),
                );
              }

              templates.push({
                file,
                templateFile: file,
                componentName: node.name?.text ?? '<anonymous>',
                fullyMigrated: canApply,
                migratedCount: result.migratedCount,
                skippedCount: result.skippedCount,
                originalContent: expression,
                migratedContent: result.migrated,
                replacements,
                approved: null,
              });
            }
          }
        }
      });
    }

    // Interactive mode: prompt for each template
    if (this.config.interactiveMode && this.config.promptForTemplate) {
      for (const tpl of templates) {
        if (!tpl.fullyMigrated) {
          tpl.approved = false;
          continue;
        }
        tpl.approved = await this.config.promptForTemplate({
          componentName: tpl.componentName,
          filePath: tpl.templateFile.rootRelativePath,
          originalContent: tpl.originalContent,
          migratedContent: tpl.migratedContent,
          fullyMigrated: tpl.fullyMigrated,
          migratedCount: tpl.migratedCount,
          skippedCount: tpl.skippedCount,
        });
      }
    }

    return confirmAsSerializable({templates});
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable({
      templates: [...unitA.templates, ...unitB.templates],
    });
  }

  override async globalMeta(
    combinedData: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable({templates: combinedData.templates});
  }

  override async stats(globalData: CompilationUnitData) {
    const total = globalData.templates.length;
    const fullyMigrated = globalData.templates.filter((t) => t.fullyMigrated).length;
    const needsManualReview = globalData.templates.filter((t) => !t.fullyMigrated).length;
    const totalExprMigrated = globalData.templates.reduce((a, t) => a + t.migratedCount, 0);
    const totalExprSkipped = globalData.templates.reduce((a, t) => a + t.skippedCount, 0);
    const canEnableProjectWideFlag = needsManualReview === 0;

    return confirmAsSerializable({
      componentsWithSafeNavigation: total,
      fullyMigrated,
      needsManualReview,
      totalExpressionsMigrated: totalExprMigrated,
      totalExpressionsSkipped: totalExprSkipped,
      canEnableProjectWideFlag,
      manualReviewComponents: globalData.templates
        .filter((t) => !t.fullyMigrated)
        .map((t) => `${t.componentName} in ${t.file.rootRelativePath} (${t.skippedCount} expr)`),
    });
  }

  override async migrate(globalData: CompilationUnitData) {
    const interactive = this.config.interactiveMode ?? false;

    const replacements = globalData.templates
      .filter((t) => {
        if (!t.fullyMigrated) return false;
        // In interactive mode, only apply approved templates
        if (interactive && t.approved !== true) return false;
        return true;
      })
      .flatMap((t) => t.replacements);

    return {replacements};
  }
}
