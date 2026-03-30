/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  createCssSelectorFromNode,
  CssSelector,
  ParsedEventType,
  SelectorMatcher,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstNode,
  TmplAstTemplate,
  TmplAstTextAttribute,
} from '@angular/compiler';
import ts from 'typescript';

import {NgCompilerOptions} from '../../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic, PotentialImportMode, TypeCheckableDirectiveMeta} from '../../../api';
import {
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
  formatExtendedError,
} from '../../api';

type DirectiveDeclaration = TypeCheckableDirectiveMeta['ref']['node'];

interface MatchingDirective {
  directive: TypeCheckableDirectiveMeta;
  bindingNames: ReadonlySet<string>;
}

/**
 * Ensures that standalone components report a diagnostic when plain text attributes or regular
 * event bindings can match directive selectors, but the directives are not in scope.
 *
 * This check is intentionally opt-in and only runs if configured explicitly in
 * `extendedDiagnostics.checks`.
 */
class MissingAttributeDirectiveCheck extends TemplateCheckWithVisitor<ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE> {
  override code = ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE as const;
  private static readonly matcherCache = new WeakMap<
    ts.Program,
    SelectorMatcher<MatchingDirective[]>
  >();

  private matcher: SelectorMatcher<MatchingDirective[]> | null = null;
  private readonly selectorBindingNames = new Map<string, ReadonlySet<string>>();

  override run(
    ctx: TemplateContext<ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE>,
    component: ts.ClassDeclaration,
    template: TmplAstNode[],
  ) {
    const componentMetadata = ctx.templateTypeChecker.getDirectiveMetadata(component);
    // Avoid running this check for non-standalone components.
    if (!componentMetadata || !componentMetadata.isStandalone) {
      return [];
    }

    this.ensureMatcherInitialized(ctx);
    return super.run(ctx, component, template);
  }

  override visitNode(
    ctx: TemplateContext<ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE>[] {
    if (
      !(node instanceof TmplAstElement || node instanceof TmplAstTemplate) ||
      this.matcher === null
    ) {
      return [];
    }

    // Skip generated inline templates (e.g. from `*ngIf`), since they are backed by their
    // corresponding element and would produce duplicate diagnostics.
    if (node instanceof TmplAstTemplate && node.tagName !== 'ng-template') {
      return [];
    }

    const directivesOfNode = ctx.templateTypeChecker.getDirectivesOfNode(component, node) ?? [];
    const inScopeDirectives = new Set<DirectiveDeclaration>();
    for (const directive of directivesOfNode) {
      inScopeDirectives.add(directive.ref.node);
    }

    const missingByBinding = this.getMissingByBinding(ctx, node, component, inScopeDirectives);
    if (missingByBinding.size === 0) {
      return [];
    }

    const inScopeBindingNames = this.getInScopeBindingNames(directivesOfNode);
    const tagName = this.getTagName(node);
    const domBindingNames = this.getPotentialDomBindingNames(ctx, tagName);
    const domEventNames = new Set(ctx.templateTypeChecker.getPotentialDomEvents(tagName));
    const diagnostics: NgTemplateDiagnostic<ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE>[] = [];
    const reportedDirectives = new Set<DirectiveDeclaration>();

    for (const attr of node.attributes) {
      const candidates = missingByBinding.get(attr.name);
      const unseenCandidates = candidates?.filter(
        ({directive}) => !reportedDirectives.has(directive.ref.node),
      );
      if (
        unseenCandidates === undefined ||
        unseenCandidates.length === 0 ||
        inScopeBindingNames.has(attr.name) ||
        domBindingNames.has(attr.name) ||
        this.shouldSkipAttribute(attr)
      ) {
        continue;
      }

      diagnostics.push(
        ctx.makeTemplateDiagnostic(
          attr.keySpan ?? attr.sourceSpan,
          this.buildErrorMessage('attribute', attr.name, unseenCandidates),
        ),
      );
      for (const {directive} of unseenCandidates) {
        reportedDirectives.add(directive.ref.node);
      }
    }

    for (const output of node.outputs) {
      const candidates = missingByBinding.get(output.name);
      const unseenCandidates = candidates?.filter(
        ({directive}) => !reportedDirectives.has(directive.ref.node),
      );
      if (
        unseenCandidates === undefined ||
        unseenCandidates.length === 0 ||
        inScopeBindingNames.has(output.name) ||
        domEventNames.has(output.name) ||
        this.shouldSkipEvent(output)
      ) {
        continue;
      }

      diagnostics.push(
        ctx.makeTemplateDiagnostic(
          output.keySpan ?? output.sourceSpan,
          this.buildErrorMessage('event binding', `(${output.name})`, unseenCandidates),
        ),
      );
      for (const {directive} of unseenCandidates) {
        reportedDirectives.add(directive.ref.node);
      }
    }

    return diagnostics;
  }

  private ensureMatcherInitialized(
    ctx: TemplateContext<ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE>,
  ): void {
    if (this.matcher !== null) {
      return;
    }

    if (ctx.program !== null) {
      const cachedMatcher = MissingAttributeDirectiveCheck.matcherCache.get(ctx.program);
      if (cachedMatcher !== undefined) {
        this.matcher = cachedMatcher;
        return;
      }
    }

    const matcher = new SelectorMatcher<MatchingDirective[]>();
    const directivesBySelector = new Map<string, MatchingDirective[]>();
    if (ctx.program === null) {
      this.matcher = matcher;
      return;
    }

    for (const sourceFile of ctx.program.getSourceFiles()) {
      for (const statement of sourceFile.statements) {
        if (!ts.isClassDeclaration(statement)) {
          continue;
        }

        const directive = ctx.templateTypeChecker.getDirectiveMetadata(statement);
        if (directive === null || directive.selector === null) {
          continue;
        }

        const bindingNames = this.getSelectorBindingNames(directive.selector);
        if (bindingNames.size === 0) {
          continue;
        }

        const directives = directivesBySelector.get(directive.selector);
        if (directives === undefined) {
          directivesBySelector.set(directive.selector, [{directive, bindingNames}]);
        } else {
          directives.push({directive, bindingNames});
        }
      }
    }

    for (const [selector, directives] of directivesBySelector.entries()) {
      matcher.addSelectables(CssSelector.parse(selector), directives);
    }

    MissingAttributeDirectiveCheck.matcherCache.set(ctx.program, matcher);
    this.matcher = matcher;
  }

  private getMissingByBinding(
    ctx: TemplateContext<ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE>,
    node: TmplAstElement | TmplAstTemplate,
    component: ts.ClassDeclaration,
    inScopeDirectives: Set<DirectiveDeclaration>,
  ): Map<string, MatchingDirective[]> {
    const missingByBinding = new Map<string, Map<DirectiveDeclaration, MatchingDirective>>();
    const importabilityCache = new Map<DirectiveDeclaration, boolean>();

    this.matcher!.match(createCssSelectorFromNode(node), (_selector, directives) => {
      for (const current of directives) {
        if (
          current.directive.ref.node === component ||
          inScopeDirectives.has(current.directive.ref.node)
        ) {
          continue;
        }
        if (!this.isImportableInContext(ctx, component, current, importabilityCache)) {
          continue;
        }

        for (const bindingName of current.bindingNames) {
          const currentBindingMissing = missingByBinding.get(bindingName) ?? new Map();
          currentBindingMissing.set(current.directive.ref.node, current);
          missingByBinding.set(bindingName, currentBindingMissing);
        }
      }
    });

    const flattened = new Map<string, MatchingDirective[]>();
    for (const [bindingName, missing] of missingByBinding.entries()) {
      flattened.set(bindingName, Array.from(missing.values()));
    }

    return flattened;
  }

  private getInScopeBindingNames(
    directives: ReadonlyArray<{selector: string | null}>,
  ): Set<string> {
    const inScopeBindingNames = new Set<string>();

    for (const directive of directives) {
      if (directive.selector === null) {
        continue;
      }

      for (const bindingName of this.getSelectorBindingNames(directive.selector)) {
        inScopeBindingNames.add(bindingName);
      }
    }

    return inScopeBindingNames;
  }

  private getSelectorBindingNames(selector: string): ReadonlySet<string> {
    const cached = this.selectorBindingNames.get(selector);
    if (cached !== undefined) {
      return cached;
    }

    const bindingNames = new Set<string>();
    for (const parsedSelector of CssSelector.parse(selector)) {
      for (let i = 0; i < parsedSelector.attrs.length; i += 2) {
        bindingNames.add(parsedSelector.attrs[i]);
      }
    }

    this.selectorBindingNames.set(selector, bindingNames);
    return bindingNames;
  }

  private getPotentialDomBindingNames(
    ctx: TemplateContext<ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE>,
    tagName: string,
  ): Set<string> {
    const names = new Set<string>();

    for (const binding of ctx.templateTypeChecker.getPotentialDomBindings(tagName)) {
      names.add(binding.attribute);
      names.add(binding.property);
    }

    return names;
  }

  private isImportableInContext(
    ctx: TemplateContext<ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE>,
    component: ts.ClassDeclaration,
    candidate: MatchingDirective,
    cache: Map<DirectiveDeclaration, boolean>,
  ): boolean {
    const directiveClass = candidate.directive.ref.node;
    if (cache.has(directiveClass)) {
      return cache.get(directiveClass)!;
    }

    const potentialImports = ctx.templateTypeChecker.getPotentialImportsFor(
      candidate.directive.ref,
      component,
      PotentialImportMode.Normal,
    );
    const isImportable = potentialImports.length > 0;
    cache.set(directiveClass, isImportable);

    return isImportable;
  }

  private getTagName(node: TmplAstElement | TmplAstTemplate): string {
    return node instanceof TmplAstElement ? node.name : (node.tagName ?? 'ng-template');
  }

  private buildErrorMessage(
    bindingKind: 'attribute' | 'event binding',
    bindingName: string,
    candidates: MatchingDirective[],
  ): string {
    const allDirectiveNames = Array.from(
      new Set(candidates.map(({directive}) => directive.name)),
    ).sort();
    const visibleDirectiveNames = allDirectiveNames
      .slice(0, 3)
      .map((name) => `\`${name}\``)
      .join(', ');
    const remainingDirectiveCount = allDirectiveNames.length - 3;
    const suffix = remainingDirectiveCount > 0 ? ` and ${remainingDirectiveCount} more` : '';

    return formatExtendedError(
      ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE,
      `The ${bindingKind} \`${bindingName}\` can match ${visibleDirectiveNames}${suffix}, ` +
        `but none of these directives is in scope for this component. ` +
        `Make sure that the directive or the NgModule that exports it is included in the ` +
        `\`@Component.imports\` array of this component.`,
    );
  }

  /**
   * Keep this check low-noise for open and framework-reserved attribute namespaces that are very
   * commonly used as plain text attributes.
   */
  private shouldSkipAttribute(attribute: TmplAstTextAttribute): boolean {
    return (
      attribute.name === 'i18n' ||
      attribute.name.startsWith('i18n-') ||
      attribute.name.startsWith('aria-') ||
      attribute.name.startsWith('data-')
    );
  }

  private shouldSkipEvent(event: TmplAstBoundEvent): boolean {
    return event.type !== ParsedEventType.Regular || event.target !== null;
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE,
  ExtendedTemplateDiagnosticName.MISSING_ATTRIBUTE_DIRECTIVE
> = {
  code: ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE,
  name: ExtendedTemplateDiagnosticName.MISSING_ATTRIBUTE_DIRECTIVE,
  create: (options: NgCompilerOptions) => {
    // Keep this check opt-in until it has proven signal/noise characteristics in real projects.
    const checks = options.extendedDiagnostics?.checks;
    if (
      checks === undefined ||
      !Object.prototype.hasOwnProperty.call(
        checks,
        ExtendedTemplateDiagnosticName.MISSING_ATTRIBUTE_DIRECTIVE,
      )
    ) {
      return null;
    }

    return new MissingAttributeDirectiveCheck();
  },
};
