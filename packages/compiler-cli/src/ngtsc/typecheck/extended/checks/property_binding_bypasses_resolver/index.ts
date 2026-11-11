/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  BindingType,
  DomElementSchemaRegistry,
  getAttributeResolver,
  isNgContainer,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstHostElement,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  tmplAstVisitAll,
} from '@angular/compiler';
import ts from 'typescript';

import {NgCompilerOptions} from '../../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic, TypeCheckableDirectiveMeta} from '../../../api';
import {
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
  formatExtendedError,
} from '../../api';

interface Resolver {
  attribute: string;
  eventName: string;
  directive: TypeCheckableDirectiveMeta | null;
}

/**
 * Warns when a property binding writes an attribute that a resolver on the same element resolves,
 * such as `[title]` next to `(attr.title)`. The binding isn't a source of the resolver, so the
 * resolver doesn't receive its value, and the binding's writes can stay in the DOM.
 */
class PropertyBindingBypassesResolverCheck extends TemplateCheckWithVisitor<ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER> {
  override code = ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER as const;

  private readonly schema = new DomElementSchemaRegistry();

  /**
   * Host elements of each class and of its base classes, looked up once per run, because a lookup
   * can prepare the type-checking data of the class's file.
   */
  private readonly hostElements = new Map<ts.ClassDeclaration, TmplAstHostElement[]>();

  private reportedHostBindings = new Map<ts.Node, Set<TmplAstBoundAttribute>>();

  private nonBindableElements = new Set<TmplAstElement>();

  constructor(private readonly typeCheckHostBindings: boolean) {
    super();
  }

  override run(
    ctx: TemplateContext<ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER>,
    component: ts.ClassDeclaration,
    template: TmplAstNode[],
  ): NgTemplateDiagnostic<ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER>[] {
    this.reportedHostBindings = new Map();
    this.nonBindableElements = getNonBindableElements(template);
    return super.run(ctx, component, template);
  }

  override visitNode(
    ctx: TemplateContext<ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER>[] {
    // A resolver on `<ng-container>` resolves nothing; type checking reports it. Directives
    // inside an `ngNonBindable` element aren't created, though the template still matches them.
    if (
      !(node instanceof TmplAstElement) ||
      isNgContainer(node.name) ||
      this.nonBindableElements.has(node)
    ) {
      return [];
    }

    const directives = ctx.templateTypeChecker.getDirectivesOfNode(component, node) ?? [];
    const hosts = directives.flatMap((directive) => {
      const declaration = directive.ref.node;
      return ts.isClassDeclaration(declaration)
        ? this.getHostElements(ctx, declaration).map((host) => ({directive, host}))
        : [];
    });

    const resolvers = [
      ...getResolvers(node.outputs, null),
      ...hosts.flatMap(({directive, host}) => getResolvers(host.listeners, directive)),
    ];
    if (resolvers.length === 0) return [];

    const diagnostics: NgTemplateDiagnostic<ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER>[] = [];

    for (const binding of node.inputs) {
      // A binding that a directive input claims never writes the DOM.
      if (directives.some((dir) => dir.inputs.hasBindingPropertyName(binding.name))) continue;

      const resolver = this.findResolver(binding, resolvers);
      if (resolver === null) continue;

      diagnostics.push(
        ctx.makeTemplateDiagnostic(binding.keySpan, makeMessage(binding, null, resolver)),
      );
    }

    // A host binding's span lies in its directive's `host` metadata, which this template's
    // diagnostics can't point to, so it's reported on the element.
    for (const {directive, host} of hosts) {
      let reported = this.reportedHostBindings.get(directive.ref.node);
      for (const binding of host.bindings) {
        if (reported?.has(binding)) continue;

        const resolver = this.findResolver(binding, resolvers);
        if (resolver === null) continue;

        if (reported === undefined) {
          reported = new Set();
          this.reportedHostBindings.set(directive.ref.node, reported);
        }
        reported.add(binding);
        diagnostics.push(
          ctx.makeTemplateDiagnostic(
            node.startSourceSpan,
            makeMessage(binding, directive, resolver),
          ),
        );
      }
    }

    return diagnostics;
  }

  private findResolver(binding: TmplAstBoundAttribute, resolvers: Resolver[]): Resolver | null {
    // `[class]` and `[style]` are sources of their resolvers, as are attribute, class, and style
    // bindings, which aren't property bindings.
    if (
      binding.type !== BindingType.Property ||
      binding.name === 'class' ||
      binding.name === 'style'
    ) {
      return null;
    }

    return (
      resolvers.find((resolver) => this.writesAttribute(binding.name, resolver.attribute)) ?? null
    );
  }

  /**
   * Whether a property binding writes an attribute. Names are compared as written, after the DOM
   * schema maps attributes such as `tabindex` and `aria-label` to their properties. The schema
   * leaves every other name as is, so a name that a property reflects is spelled in lowercase;
   * an attribute name with an uppercase letter, such as `textContent` or `className`, isn't one
   * that a property binding writes.
   */
  private writesAttribute(property: string, attribute: string): boolean {
    return (
      attribute === attribute.toLowerCase() &&
      this.schema.getMappedPropName(attribute) === this.schema.getMappedPropName(property)
    );
  }

  private getHostElements(
    ctx: TemplateContext<ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER>,
    node: ts.ClassDeclaration,
  ): TmplAstHostElement[] {
    if (!this.typeCheckHostBindings || node.getSourceFile().isDeclarationFile) return [];

    let hosts = this.hostElements.get(node);
    if (hosts === undefined) {
      // Set first, so that a class that extends itself ends the walk.
      this.hostElements.set(node, (hosts = []));
      const host = ctx.templateTypeChecker.getHostElement(node);
      const baseClass = getBaseClass(ctx.typeChecker, node);
      hosts.push(
        ...(host === null ? [] : [host]),
        ...(baseClass === null ? [] : this.getHostElements(ctx, baseClass)),
      );
    }
    return hosts;
  }
}

function getBaseClass(
  typeChecker: ts.TypeChecker,
  node: ts.ClassDeclaration,
): ts.ClassDeclaration | null {
  const heritage = node.heritageClauses?.find(
    (clause) => clause.token === ts.SyntaxKind.ExtendsKeyword,
  );
  const expression = heritage?.types[0]?.expression;
  let symbol = expression === undefined ? undefined : typeChecker.getSymbolAtLocation(expression);
  if (symbol !== undefined && symbol.flags & ts.SymbolFlags.Alias) {
    symbol = typeChecker.getAliasedSymbol(symbol);
  }
  return symbol?.declarations?.find(ts.isClassDeclaration) ?? null;
}

/** Gets the elements inside `ngNonBindable` elements, which keep their static attributes only. */
function getNonBindableElements(template: TmplAstNode[]): Set<TmplAstElement> {
  const elements = new Set<TmplAstElement>();
  const addDescendants = (nodes: TmplAstNode[]) => {
    for (const node of nodes) {
      if (node instanceof TmplAstElement) {
        elements.add(node);
        addDescendants(node.children);
      }
    }
  };

  class Visitor extends TmplAstRecursiveVisitor {
    override visitElement(element: TmplAstElement): void {
      if (isNonBindable(element)) addDescendants(element.children);
      else super.visitElement(element);
    }
  }

  tmplAstVisitAll(new Visitor(), template);
  return elements;
}

function isNonBindable(node: TmplAstElement): boolean {
  return node.attributes.some((attribute) => attribute.name === 'ngNonBindable');
}

function getResolvers(
  events: TmplAstBoundEvent[],
  directive: TypeCheckableDirectiveMeta | null,
): Resolver[] {
  return events.flatMap((event) => {
    const resolver = getAttributeResolver(event.name, event.type, event.target);
    return resolver === null
      ? []
      : [{attribute: resolver.attribute, eventName: event.name, directive}];
  });
}

function makeMessage(
  binding: TmplAstBoundAttribute,
  bindingDirective: TypeCheckableDirectiveMeta | null,
  resolver: Resolver,
): string {
  const bindingDescription =
    bindingDirective === null
      ? `The \`${binding.name}\` property binding`
      : `The \`${binding.name}\` host property binding of \`${bindingDirective.name}\``;
  const resolverDescription =
    resolver.directive === null
      ? `the element's \`(${resolver.eventName})\` binding`
      : `the \`(${resolver.eventName})\` host binding of \`${resolver.directive.name}\``;

  return formatExtendedError(
    ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER,
    `${bindingDescription} writes the \`${resolver.attribute}\` attribute, which ` +
      `${resolverDescription} resolves. The resolver doesn't receive the binding's value, and ` +
      `the binding's later writes can stay in the DOM while the resolved value doesn't change. ` +
      `Bind \`[attr.${resolver.attribute}]\` instead to make the value a source of the resolver.`,
  );
}

export const factory: TemplateCheckFactory<
  ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER,
  ExtendedTemplateDiagnosticName.PROPERTY_BINDING_BYPASSES_RESOLVER
> = {
  code: ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER,
  name: ExtendedTemplateDiagnosticName.PROPERTY_BINDING_BYPASSES_RESOLVER,
  create: (options: NgCompilerOptions) =>
    new PropertyBindingBypassesResolverCheck(options.typeCheckHostBindings ?? true),
};
