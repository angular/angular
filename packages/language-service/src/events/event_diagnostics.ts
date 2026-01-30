/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview Event binding diagnostics for the Angular Language Service.
 *
 * This module provides comprehensive validation of event bindings in Angular templates,
 * detecting potential issues that could cause confusing runtime behavior:
 *
 * ## Diagnostic Codes
 *
 * - **UNKNOWN_DOM_EVENT (99101)**: Event name doesn't match any known DOM event or directive output.
 *
 * - **SHADOWED_DOM_EVENT (99102)**: Template-level warning when a directive output has the same
 *   name as a native DOM event. In this case, the event handler is called TWICE:
 *   1. Once for the directive's EventEmitter emission
 *   2. Once for the native DOM event
 *   The `$event` parameter has different types in each call, causing potential runtime confusion.
 *
 * - **CONFLICTING_OUTPUTS (99103)**: Multiple directives on the same element have outputs with the
 *   same binding name. The handler is called once per directive that emits.
 *
 * - **OUTPUT_SHADOWS_DOM_EVENT (99104)**: Definition-level warning when an `@Output()` or `output()`
 *   is named after a native DOM event. This proactively identifies outputs that may cause shadowing
 *   issues when used on native HTML elements.
 *
 * ## Supported Output Syntaxes
 *
 * The diagnostics detect outputs defined using:
 * - `@Output() propertyName = new EventEmitter<T>()`
 * - `propertyName = output<T>()`
 * - `propertyName = output<T>({ alias: 'bindingName' })`
 *
 * ## Configuration
 *
 * Event diagnostics can be configured in the Angular compiler options:
 * ```json
 * {
 *   "angularCompilerOptions": {
 *     "eventDiagnostics": {
 *       "enabled": true,
 *       "severity": "warning",
 *       "warnOnShadowedEvents": true
 *     }
 *   }
 * }
 * ```
 */

import {
  ParsedEventType,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstNode,
  TmplAstTemplate,
  tmplAstVisitAll,
  TmplAstRecursiveVisitor,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {SymbolKind} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import {
  TemplateTypeChecker,
  TypeCheckableDirectiveMeta,
} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';

import {isValidDomEvent, findSimilarDomEvents, getDomEventType} from './event_data';

/**
 * Event diagnostic codes for the Angular Language Service.
 * These are in a separate range from Angular's core diagnostic codes.
 */
export const enum EventDiagnosticCode {
  /** Unknown DOM event name. */
  UNKNOWN_DOM_EVENT = 99101,
  /** Directive output shadows a native DOM event. */
  SHADOWED_DOM_EVENT = 99102,
  /** Multiple directives have outputs with the same name. */
  CONFLICTING_OUTPUTS = 99103,
  /** Output definition shadows a native DOM event. */
  OUTPUT_SHADOWS_DOM_EVENT = 99104,
  /** Multiple directives have inputs with the same name. */
  CONFLICTING_INPUTS = 99105,
  /** Own output shadows host directive's exposed output. */
  HOST_DIRECTIVE_OUTPUT_SHADOWED = 99106,
  /** Own input shadows host directive's exposed input. */
  HOST_DIRECTIVE_INPUT_SHADOWED = 99107,
}

/**
 * Configuration for event diagnostics.
 */
export interface EventDiagnosticsConfig {
  /** Whether event validation is enabled. */
  enabled: boolean;
  /** Severity level for unknown event warnings. */
  severity: 'error' | 'warning' | 'suggestion';
  /** Whether to warn when a directive output shadows a DOM event. */
  warnOnShadowedEvents: boolean;
}

/**
 * Default configuration for event diagnostics.
 */
export const DEFAULT_EVENT_DIAGNOSTICS_CONFIG: EventDiagnosticsConfig = {
  enabled: true,
  severity: 'warning',
  warnOnShadowedEvents: true,
};

/**
 * Set of known HTML element tag names.
 * We only validate events on these elements, not on custom components.
 */
const HTML_ELEMENTS = new Set([
  // Document structure
  'html',
  'head',
  'body',
  'title',
  'meta',
  'link',
  'base',
  'style',
  'script',
  'noscript',

  // Content sectioning
  'header',
  'footer',
  'main',
  'section',
  'article',
  'aside',
  'nav',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hgroup',
  'address',

  // Text content
  'div',
  'p',
  'hr',
  'pre',
  'blockquote',
  'ol',
  'ul',
  'li',
  'dl',
  'dt',
  'dd',
  'figure',
  'figcaption',

  // Inline text
  'span',
  'a',
  'em',
  'strong',
  'small',
  's',
  'cite',
  'q',
  'dfn',
  'abbr',
  'data',
  'time',
  'code',
  'var',
  'samp',
  'kbd',
  'sub',
  'sup',
  'i',
  'b',
  'u',
  'mark',
  'ruby',
  'rb',
  'rt',
  'rtc',
  'rp',
  'bdi',
  'bdo',
  'br',
  'wbr',

  // Edits
  'ins',
  'del',

  // Embedded content
  'img',
  'picture',
  'source',
  'iframe',
  'embed',
  'object',
  'param',
  'video',
  'audio',
  'track',
  'map',
  'area',

  // SVG and MathML
  'svg',
  'math',

  // Tables
  'table',
  'caption',
  'colgroup',
  'col',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'td',
  'th',

  // Forms
  'form',
  'fieldset',
  'legend',
  'label',
  'input',
  'button',
  'select',
  'datalist',
  'optgroup',
  'option',
  'textarea',
  'output',
  'progress',
  'meter',

  // Interactive
  'details',
  'summary',
  'dialog',
  'menu',

  // Web components
  'template',
  'slot',

  // Canvas
  'canvas',
]);

/**
 * Checks if a tag name represents a standard HTML element.
 */
function isHtmlElement(tagName: string): boolean {
  return HTML_ELEMENTS.has(tagName.toLowerCase());
}

/**
 * Gets event diagnostics for a component template.
 */
export function getEventDiagnostics(
  component: ts.ClassDeclaration,
  compiler: NgCompiler,
  config: EventDiagnosticsConfig = DEFAULT_EVENT_DIAGNOSTICS_CONFIG,
): ts.Diagnostic[] {
  if (!config.enabled) {
    return [];
  }

  const templateTypeChecker = compiler.getTemplateTypeChecker();
  const program = compiler.getCurrentProgram();
  const checker = program.getTypeChecker();
  const diagnostics: ts.Diagnostic[] = [];
  const severity = getDiagnosticCategory(config.severity);

  // Validate template event bindings
  const template = templateTypeChecker.getTemplate(component);

  if (template !== null) {
    const visitor = new EventBindingVisitor(
      component,
      templateTypeChecker,
      checker,
      diagnostics,
      severity,
      config,
    );
    tmplAstVisitAll(visitor, template);
  }

  return diagnostics;
}

/**
 * Converts severity string to TypeScript DiagnosticCategory.
 */
function getDiagnosticCategory(
  severity: 'error' | 'warning' | 'suggestion',
): ts.DiagnosticCategory {
  switch (severity) {
    case 'error':
      return ts.DiagnosticCategory.Error;
    case 'warning':
      return ts.DiagnosticCategory.Warning;
    case 'suggestion':
      return ts.DiagnosticCategory.Suggestion;
  }
}

/**
 * Visitor that validates event and input bindings in templates.
 */
class EventBindingVisitor extends TmplAstRecursiveVisitor {
  constructor(
    private component: ts.ClassDeclaration,
    private templateTypeChecker: TemplateTypeChecker,
    private checker: ts.TypeChecker,
    private diagnostics: ts.Diagnostic[],
    private severity: ts.DiagnosticCategory,
    private config: EventDiagnosticsConfig,
  ) {
    super();
  }

  override visitElement(element: TmplAstElement): void {
    // Validate events on standard HTML elements
    if (isHtmlElement(element.name)) {
      for (const event of element.outputs) {
        this.validateEvent(event, element);
      }
    }
    // Always check inputs for conflicts (even on custom components)
    for (const input of element.inputs) {
      this.validateInput(input, element);
    }
    super.visitElement(element);
  }

  override visitTemplate(template: TmplAstTemplate): void {
    // ng-template doesn't have native events, skip validation
    // But still check inputs on ng-template for conflicts
    for (const input of template.inputs) {
      this.validateInputOnTemplate(input, template);
    }
    super.visitTemplate(template);
  }

  private validateInput(input: TmplAstBoundAttribute, element: TmplAstElement): void {
    // Check if this is a directive/component input
    const symbol = this.templateTypeChecker.getSymbolOfNode(input, this.component);
    if (symbol?.kind === SymbolKind.Input) {
      const inputSymbol = symbol as {
        bindings: {target: {kind: SymbolKind; tsSymbol?: ts.Symbol}; tsType?: ts.Type}[];
      };

      // Find all directive bindings (not element or template bindings)
      const directiveBindings =
        inputSymbol.bindings?.filter((b) => b?.target?.kind === SymbolKind.Directive) ?? [];

      // Check for conflicting inputs from multiple directives
      if (directiveBindings.length > 1) {
        const directiveNames = directiveBindings
          .map((b) => b.target.tsSymbol?.name ?? 'unknown')
          .filter((name, i, arr) => arr.indexOf(name) === i); // unique names

        if (directiveNames.length > 1) {
          // Build explicit message showing what will happen with actual types
          const inputsList = directiveBindings
            .map((b) => {
              const name = b.target.tsSymbol?.name ?? 'unknown';
              const inputType = b.tsType ? this.checker.typeToString(b.tsType) : 'unknown';
              return `• '${name}' receives → ${inputType}`;
            })
            .join('\n');

          this.diagnostics.push({
            category: ts.DiagnosticCategory.Warning,
            code: EventDiagnosticCode.CONFLICTING_INPUTS,
            messageText:
              `Multiple directives have inputs named '${input.name}': ${directiveNames.map((n) => `'${n}'`).join(', ')}.\n` +
              `The value will be assigned to all ${directiveBindings.length} directives:\n${inputsList}`,
            file: this.component.getSourceFile(),
            start: input.keySpan?.start.offset ?? input.sourceSpan.start.offset,
            length:
              (input.keySpan?.end.offset ?? input.sourceSpan.end.offset) -
              (input.keySpan?.start.offset ?? input.sourceSpan.start.offset),
            source: 'angular',
          });
        }
      }
    }
  }

  private validateInputOnTemplate(input: TmplAstBoundAttribute, template: TmplAstTemplate): void {
    // Same logic as validateInput but for ng-template
    const symbol = this.templateTypeChecker.getSymbolOfNode(input, this.component);
    if (symbol?.kind === SymbolKind.Input) {
      const inputSymbol = symbol as {
        bindings: {target: {kind: SymbolKind; tsSymbol?: ts.Symbol}; tsType?: ts.Type}[];
      };

      const directiveBindings =
        inputSymbol.bindings?.filter((b) => b?.target?.kind === SymbolKind.Directive) ?? [];

      if (directiveBindings.length > 1) {
        const directiveNames = directiveBindings
          .map((b) => b.target.tsSymbol?.name ?? 'unknown')
          .filter((name, i, arr) => arr.indexOf(name) === i);

        if (directiveNames.length > 1) {
          const inputsList = directiveBindings
            .map((b) => {
              const name = b.target.tsSymbol?.name ?? 'unknown';
              const inputType = b.tsType ? this.checker.typeToString(b.tsType) : 'unknown';
              return `• '${name}' receives → ${inputType}`;
            })
            .join('\n');

          this.diagnostics.push({
            category: ts.DiagnosticCategory.Warning,
            code: EventDiagnosticCode.CONFLICTING_INPUTS,
            messageText:
              `Multiple directives have inputs named '${input.name}': ${directiveNames.map((n) => `'${n}'`).join(', ')}.\n` +
              `The value will be assigned to all ${directiveBindings.length} directives:\n${inputsList}`,
            file: this.component.getSourceFile(),
            start: input.keySpan?.start.offset ?? input.sourceSpan.start.offset,
            length:
              (input.keySpan?.end.offset ?? input.sourceSpan.end.offset) -
              (input.keySpan?.start.offset ?? input.sourceSpan.start.offset),
            source: 'angular',
          });
        }
      }
    }
  }

  private validateEvent(event: TmplAstBoundEvent, element: TmplAstElement): void {
    // Skip Angular animation events
    if (event.type === ParsedEventType.Animation) {
      return;
    }

    // Skip malformed banana-in-box syntax (e.g., ([foo]) parses event name as '[foo]')
    // Angular already reports this as an invalid binding syntax
    if (event.name.includes('[') || event.name.includes(']')) {
      return;
    }

    // Extract the base event name (handle keyboard modifiers like keydown.enter)
    const baseEventName = event.name.split('.')[0].toLowerCase();

    // Check if this is a directive/component output (handled by Angular's type checker)
    const symbol = this.templateTypeChecker.getSymbolOfNode(event, this.component);
    if (symbol?.kind === SymbolKind.Output) {
      // Check for directive bindings
      const outputSymbol = symbol as {
        bindings: {target: {kind: SymbolKind; tsSymbol?: ts.Symbol}; tsType?: ts.Type}[];
      };

      // Find all directive bindings (not element or template bindings)
      const directiveBindings =
        outputSymbol.bindings?.filter((b) => b?.target?.kind === SymbolKind.Directive) ?? [];

      // Check for conflicting outputs from multiple directives
      if (directiveBindings.length > 1) {
        const directiveNames = directiveBindings
          .map((b) => b.target.tsSymbol?.name ?? 'unknown')
          .filter((name, i, arr) => arr.indexOf(name) === i); // unique names

        if (directiveNames.length > 1) {
          // Build explicit message showing what will happen with actual types
          const emitsList = directiveBindings
            .map((b) => {
              const name = b.target.tsSymbol?.name ?? 'unknown';
              const outputType = b.tsType ? this.checker.typeToString(b.tsType) : 'unknown';
              return `• '${name}' emits → handler($event: ${outputType})`;
            })
            .join('\n');

          this.diagnostics.push({
            category: ts.DiagnosticCategory.Warning,
            code: EventDiagnosticCode.CONFLICTING_OUTPUTS,
            messageText:
              `Multiple directives have outputs named '${event.name}': ${directiveNames.map((n) => `'${n}'`).join(', ')}.\n` +
              `The handler will be called ${directiveBindings.length} times when directives emit:\n${emitsList}`,
            file: this.component.getSourceFile(),
            start: event.keySpan.start.offset,
            length: event.keySpan.end.offset - event.keySpan.start.offset,
            source: 'angular',
          });
        }
      }

      // Check if any directive binding shadows a DOM event
      if (directiveBindings.length > 0) {
        const directiveNames = directiveBindings
          .map((b) => b.target.tsSymbol?.name ?? 'unknown')
          .filter((name, i, arr) => arr.indexOf(name) === i);

        // Check if it also shadows a native DOM event
        if (this.config.warnOnShadowedEvents && isValidDomEvent(baseEventName)) {
          // Get the DOM event type for a more informative message
          const domEventType = getDomEventType(baseEventName) ?? 'Event';

          // Build explicit message showing what will happen
          let behaviorMessage: string;
          if (directiveNames.length === 1) {
            behaviorMessage =
              `When user interacts → handler(${domEventType}) called\n` +
              `When '${directiveNames[0]}' emits → handler(${directiveNames[0]}'s output type) called`;
          } else {
            const directiveEmits = directiveNames
              .map((name) => `When '${name}' emits → handler(${name}'s output type) called`)
              .join('\n');
            behaviorMessage = `When user interacts → handler(${domEventType}) called\n${directiveEmits}`;
          }

          this.diagnostics.push({
            category: ts.DiagnosticCategory.Warning,
            code: EventDiagnosticCode.SHADOWED_DOM_EVENT,
            messageText:
              `Output '${event.name}' from ${directiveNames.length === 1 ? `directive '${directiveNames[0]}'` : `directives ${directiveNames.map((n) => `'${n}'`).join(', ')}`} shadows the native DOM '${baseEventName}' event.\n` +
              `The handler will be called ${directiveNames.length + 1} times:\n${behaviorMessage}`,
            file: this.component.getSourceFile(),
            start: event.keySpan.start.offset,
            length: event.keySpan.end.offset - event.keySpan.start.offset,
            source: 'angular',
          });
        }
        // Still skip unknown event validation since this is a directive output
        return;
      }
    }

    // Check if it's a valid DOM event
    if (!isValidDomEvent(baseEventName)) {
      // Find similar events for suggestion
      const similarEvents = findSimilarDomEvents(baseEventName);

      let messageText: string;
      if (similarEvents.length > 0) {
        const suggestions = similarEvents.map((e) => `'${e}'`).join(', ');
        messageText =
          `Unknown DOM event '${event.name}' on <${element.name}>. ` +
          `Did you mean ${suggestions}?`;
      } else {
        messageText = `Unknown DOM event '${event.name}' on <${element.name}>.`;
      }

      this.diagnostics.push({
        category: this.severity,
        code: EventDiagnosticCode.UNKNOWN_DOM_EVENT,
        messageText,
        file: this.component.getSourceFile(),
        start: event.keySpan.start.offset,
        length: event.keySpan.end.offset - event.keySpan.start.offset,
        source: 'angular',
      });
    }
  }
}

/**
 * Gets diagnostics for directive/component output definitions that shadow DOM events
 * or shadow host directive outputs.
 * This checks the @Output() decorators at the class definition level.
 */
export function getOutputDefinitionDiagnostics(
  classDecl: ts.ClassDeclaration,
  compiler: NgCompiler,
  config: EventDiagnosticsConfig = DEFAULT_EVENT_DIAGNOSTICS_CONFIG,
): ts.Diagnostic[] {
  if (!config.enabled || !config.warnOnShadowedEvents) {
    return [];
  }

  const diagnostics: ts.Diagnostic[] = [];
  const templateTypeChecker = compiler.getTemplateTypeChecker();

  // Get directive metadata to check if this is a component/directive
  const meta = templateTypeChecker.getDirectiveMetadata(classDecl);
  if (!meta) {
    return [];
  }

  // Collect exposed host directive output names
  const hostDirectiveOutputs = collectHostDirectiveOutputs(meta, templateTypeChecker);

  // Collect exposed host directive input names
  const hostDirectiveInputs = collectHostDirectiveInputs(meta, templateTypeChecker);

  // Build a set of own output binding names for quick lookup
  const ownOutputBindingNames = new Set<string>();
  for (const output of meta.outputs) {
    ownOutputBindingNames.add(output.bindingPropertyName);
  }

  // Build a set of own input binding names for quick lookup
  const ownInputBindingNames = new Set<string>();
  for (const input of meta.inputs) {
    ownInputBindingNames.add(input.bindingPropertyName);
  }

  // Check each output
  for (const output of meta.outputs) {
    const bindingName = output.bindingPropertyName.toLowerCase();

    // Check if this output name matches a DOM event
    if (isValidDomEvent(bindingName)) {
      const domEventType = getDomEventType(bindingName) ?? 'Event';

      // Find the @Output decorator or output signal in the class
      const outputNode = findOutputDeclaration(classDecl, output.classPropertyName);

      if (outputNode) {
        diagnostics.push({
          category: ts.DiagnosticCategory.Warning,
          code: EventDiagnosticCode.OUTPUT_SHADOWS_DOM_EVENT,
          messageText:
            `Output '${output.bindingPropertyName}' shadows the native DOM '${bindingName}' event (${domEventType}).\n` +
            `When used on an HTML element, the handler will be called both when the DOM event fires ` +
            `and when the directive emits.\n` +
            `Consider renaming this output to avoid confusion (e.g., '${output.bindingPropertyName}Changed', '${output.bindingPropertyName}Triggered', 'on${capitalize(output.bindingPropertyName)}').`,
          file: classDecl.getSourceFile(),
          start: outputNode.getStart(),
          length: outputNode.getWidth(),
          source: 'angular',
        });
      }
    }

    // Check if this output shadows a host directive output
    const shadowedHostOutput = hostDirectiveOutputs.get(output.bindingPropertyName);
    if (shadowedHostOutput) {
      const outputNode = findOutputDeclaration(classDecl, output.classPropertyName);
      if (outputNode) {
        diagnostics.push({
          category: ts.DiagnosticCategory.Warning,
          code: EventDiagnosticCode.HOST_DIRECTIVE_OUTPUT_SHADOWED,
          messageText:
            `Output '${output.bindingPropertyName}' shadows the same output exposed from host directive '${shadowedHostOutput.directiveName}'.\n` +
            `Only this directive's output will be accessible to template bindings.\n` +
            `Consider using a different name or removing the output from the hostDirectives configuration.`,
          file: classDecl.getSourceFile(),
          start: outputNode.getStart(),
          length: outputNode.getWidth(),
          source: 'angular',
        });
      }
    }
  }

  // Check each input for host directive shadowing
  for (const input of meta.inputs) {
    const shadowedHostInput = hostDirectiveInputs.get(input.bindingPropertyName);
    if (shadowedHostInput) {
      const inputNode = findInputDeclaration(classDecl, input.classPropertyName);
      if (inputNode) {
        diagnostics.push({
          category: ts.DiagnosticCategory.Warning,
          code: EventDiagnosticCode.HOST_DIRECTIVE_INPUT_SHADOWED,
          messageText:
            `Input '${input.bindingPropertyName}' shadows the same input exposed from host directive '${shadowedHostInput.directiveName}'.\n` +
            `Both will receive the value, but this may cause unexpected behavior.\n` +
            `Consider using a different name or removing the input from the hostDirectives configuration.`,
          file: classDecl.getSourceFile(),
          start: inputNode.getStart(),
          length: inputNode.getWidth(),
          source: 'angular',
        });
      }
    }
  }

  return diagnostics;
}

interface HostDirectiveBinding {
  directiveName: string;
  originalName: string;
  exposedName: string;
}

/**
 * Collects all exposed outputs from host directives.
 * Returns a map from exposed output name to host directive info.
 */
function collectHostDirectiveOutputs(
  meta: TypeCheckableDirectiveMeta,
  templateTypeChecker: TemplateTypeChecker,
): Map<string, HostDirectiveBinding> {
  const result = new Map<string, HostDirectiveBinding>();

  if (!meta.hostDirectives || meta.hostDirectives.length === 0) {
    return result;
  }

  for (const hostDir of meta.hostDirectives) {
    // Get the host directive's metadata
    if (!hostDir.directive || typeof hostDir.directive === 'function') {
      continue;
    }

    // Get class declaration from directive reference
    let hostDirClass: ts.ClassDeclaration | undefined;
    if ('node' in hostDir.directive && ts.isClassDeclaration(hostDir.directive.node)) {
      hostDirClass = hostDir.directive.node;
    }

    if (!hostDirClass) {
      continue;
    }

    const hostMeta = templateTypeChecker.getDirectiveMetadata(hostDirClass);
    if (!hostMeta) {
      continue;
    }

    const directiveName = hostDirClass.name?.text ?? 'unknown';

    // If outputs is null, NO outputs are exposed (they must be explicitly listed)
    // If outputs is an object, only specified outputs are exposed (with potential aliases)
    if (hostDir.outputs !== null && typeof hostDir.outputs === 'object') {
      // Only specified outputs are exposed
      for (const [originalName, exposedName] of Object.entries(hostDir.outputs)) {
        result.set(exposedName, {
          directiveName,
          originalName,
          exposedName,
        });
      }
    }
    // If outputs is null, nothing is exposed
  }

  return result;
}

/**
 * Collects all exposed inputs from host directives.
 * Returns a map from exposed input name to host directive info.
 */
function collectHostDirectiveInputs(
  meta: TypeCheckableDirectiveMeta,
  templateTypeChecker: TemplateTypeChecker,
): Map<string, HostDirectiveBinding> {
  const result = new Map<string, HostDirectiveBinding>();

  if (!meta.hostDirectives || meta.hostDirectives.length === 0) {
    return result;
  }

  for (const hostDir of meta.hostDirectives) {
    // Get the host directive's metadata
    if (!hostDir.directive || typeof hostDir.directive === 'function') {
      continue;
    }

    // Get class declaration from directive reference
    let hostDirClass: ts.ClassDeclaration | undefined;
    if ('node' in hostDir.directive && ts.isClassDeclaration(hostDir.directive.node)) {
      hostDirClass = hostDir.directive.node;
    }

    if (!hostDirClass) {
      continue;
    }

    const hostMeta = templateTypeChecker.getDirectiveMetadata(hostDirClass);
    if (!hostMeta) {
      continue;
    }

    const directiveName = hostDirClass.name?.text ?? 'unknown';

    // If inputs is null, NO inputs are exposed (they must be explicitly listed)
    // If inputs is an object, only specified inputs are exposed (with potential aliases)
    if (hostDir.inputs !== null && typeof hostDir.inputs === 'object') {
      // Only specified inputs are exposed
      for (const [originalName, exposedName] of Object.entries(hostDir.inputs)) {
        result.set(exposedName, {
          directiveName,
          originalName,
          exposedName,
        });
      }
    }
    // If inputs is null, nothing is exposed
  }

  return result;
}

/**
 * Finds the TypeScript node for an output declaration in a class.
 */
function findOutputDeclaration(
  classDecl: ts.ClassDeclaration,
  propertyName: string,
): ts.Node | undefined {
  for (const member of classDecl.members) {
    if (ts.isPropertyDeclaration(member) || ts.isGetAccessorDeclaration(member)) {
      const name = member.name;
      if (ts.isIdentifier(name) && name.text === propertyName) {
        return member;
      }
    }
  }
  return undefined;
}

/**
 * Finds the TypeScript node for an input declaration in a class.
 */
function findInputDeclaration(
  classDecl: ts.ClassDeclaration,
  propertyName: string,
): ts.Node | undefined {
  for (const member of classDecl.members) {
    if (
      ts.isPropertyDeclaration(member) ||
      ts.isGetAccessorDeclaration(member) ||
      ts.isSetAccessorDeclaration(member)
    ) {
      const name = member.name;
      if (ts.isIdentifier(name) && name.text === propertyName) {
        return member;
      }
    }
  }
  return undefined;
}

/**
 * Capitalizes the first letter of a string.
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
