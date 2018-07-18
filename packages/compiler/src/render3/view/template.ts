/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {flatten, sanitizeIdentifier} from '../../compile_metadata';
import {CompileReflector} from '../../compile_reflector';
import {BindingForm, BuiltinFunctionCall, LocalResolver, convertActionBinding, convertPropertyBinding} from '../../compiler_util/expression_converter';
import {ConstantPool} from '../../constant_pool';
import * as core from '../../core';
import {AST, AstMemoryEfficientTransformer, BindingPipe, BindingType, FunctionCall, ImplicitReceiver, Interpolation, LiteralArray, LiteralMap, LiteralPrimitive, PropertyRead} from '../../expression_parser/ast';
import {Lexer} from '../../expression_parser/lexer';
import {Parser} from '../../expression_parser/parser';
import * as html from '../../ml_parser/ast';
import {HtmlParser} from '../../ml_parser/html_parser';
import {WhitespaceVisitor} from '../../ml_parser/html_whitespaces';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../ml_parser/interpolation_config';
import {splitNsName} from '../../ml_parser/tags';
import * as o from '../../output/output_ast';
import {ParseError, ParseSourceSpan} from '../../parse_util';
import {DomElementSchemaRegistry} from '../../schema/dom_element_schema_registry';
import {CssSelector, SelectorMatcher} from '../../selector';
import {BindingParser} from '../../template_parser/binding_parser';
import {OutputContext, error} from '../../util';
import * as t from '../r3_ast';
import {Identifiers as R3} from '../r3_identifiers';
import {htmlAstToRender3Ast} from '../r3_template_transform';

import {R3QueryMetadata} from './api';
import {parseStyle} from './styling';
import {CONTEXT_NAME, I18N_ATTR, I18N_ATTR_PREFIX, ID_SEPARATOR, IMPLICIT_REFERENCE, MEANING_SEPARATOR, REFERENCE_PREFIX, RENDER_FLAGS, TEMPORARY_NAME, asLiteral, getQueryPredicate, invalid, mapToExpression, noop, temporaryAllocator, trimTrailingNulls, unsupported} from './util';

function mapBindingToInstruction(type: BindingType): o.ExternalReference|undefined {
  switch (type) {
    case BindingType.Property:
      return R3.elementProperty;
    case BindingType.Attribute:
      return R3.elementAttribute;
    case BindingType.Class:
      return R3.elementClassProp;
    default:
      return undefined;
  }
}

//  if (rf & flags) { .. }
export function renderFlagCheckIfStmt(
    flags: core.RenderFlags, statements: o.Statement[]): o.IfStmt {
  return o.ifStmt(o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(flags), null, false), statements);
}

export class TemplateDefinitionBuilder implements t.Visitor<void>, LocalResolver {
  private _dataIndex = 0;
  private _bindingContext = 0;
  private _prefixCode: o.Statement[] = [];
  private _creationCode: o.Statement[] = [];
  private _variableCode: o.Statement[] = [];
  private _bindingCode: (() => o.Statement)[] = [];
  private _nestedTemplates: (() => void)[] = [];
  private _valueConverter: ValueConverter;
  private _unsupported = unsupported;
  private _bindingScope: BindingScope;

  // Whether we are inside a translatable element (`<p i18n>... somewhere here ... </p>)
  private _inI18nSection: boolean = false;
  private _i18nSectionIndex = -1;
  // Maps of placeholder to node indexes for each of the i18n section
  private _phToNodeIdxes: {[phName: string]: number[]}[] = [{}];

  // Number of slots to reserve for pureFunctions
  private _pureFunctionSlots = 0;

  constructor(
      private constantPool: ConstantPool, private contextParameter: string,
      parentBindingScope: BindingScope, private level = 0, private contextName: string|null,
      private templateName: string|null, private viewQueries: R3QueryMetadata[],
      private directiveMatcher: SelectorMatcher|null, private directives: Set<o.Expression>,
      private pipeTypeByName: Map<string, o.Expression>, private pipes: Set<o.Expression>,
      private _namespace: o.ExternalReference) {
    // view queries can take up space in data and allocation happens earlier (in the "viewQuery"
    // function)
    this._dataIndex = viewQueries.length;
    this._bindingScope =
        parentBindingScope.nestedScope(level, (lhsVar: o.ReadVarExpr, rhsExpr: o.Expression) => {
          this._variableCode.push(
              lhsVar.set(rhsExpr).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
        });
    this._valueConverter = new ValueConverter(
        constantPool, () => this.allocateDataSlot(),
        (numSlots: number): number => this._pureFunctionSlots += numSlots,
        (name, localName, slot, value: o.ReadVarExpr) => {
          const pipeType = pipeTypeByName.get(name);
          if (pipeType) {
            this.pipes.add(pipeType);
          }
          this._bindingScope.set(localName, value);
          this._creationCode.push(
              o.importExpr(R3.pipe).callFn([o.literal(slot), o.literal(name)]).toStmt());
        });
  }

  buildTemplateFunction(
      nodes: t.Node[], variables: t.Variable[], hasNgContent: boolean = false,
      ngContentSelectors: string[] = []): o.FunctionExpr {
    if (this._namespace !== R3.namespaceHTML) {
      this.creationInstruction(null, this._namespace);
    }

    // Create variable bindings
    for (const variable of variables) {
      const variableName = variable.name;
      const expression =
          o.variable(this.contextParameter).prop(variable.value || IMPLICIT_REFERENCE);
      const scopedName = this._bindingScope.freshReferenceName();
      // Add the reference to the local scope.
      this._bindingScope.set(variableName, o.variable(variableName + scopedName), expression);
    }

    // Output a `ProjectionDef` instruction when some `<ng-content>` are present
    if (hasNgContent) {
      const parameters: o.Expression[] = [];

      // Only selectors with a non-default value are generated
      if (ngContentSelectors.length > 1) {
        const r3Selectors = ngContentSelectors.map(s => core.parseSelectorToR3Selector(s));
        // `projectionDef` needs both the parsed and raw value of the selectors
        const parsed = this.constantPool.getConstLiteral(asLiteral(r3Selectors), true);
        const unParsed = this.constantPool.getConstLiteral(asLiteral(ngContentSelectors), true);
        parameters.push(parsed, unParsed);
      }

      this.creationInstruction(null, R3.projectionDef, ...parameters);
    }

    t.visitAll(this, nodes);

    const creationCode = this._creationCode.length > 0 ?
        [renderFlagCheckIfStmt(core.RenderFlags.Create, this._creationCode)] :
        [];

    const updateCode = this._bindingCode.length > 0 ?
        [renderFlagCheckIfStmt(core.RenderFlags.Update, this._variableCode.concat(
          this._variableCode.concat(this._bindingCode.map((fn: () => o.Statement) => fn()))))] :
        [];

    if (this._pureFunctionSlots > 0) {
      this.creationInstruction(null, R3.reserveSlots, o.literal(this._pureFunctionSlots));
    }

    // Generate maps of placeholder name to node indexes
    // TODO(vicb): This is a WIP, not fully supported yet
    for (const phToNodeIdx of this._phToNodeIdxes) {
      if (Object.keys(phToNodeIdx).length > 0) {
        const scopedName = this._bindingScope.freshReferenceName();
        const phMap = o.variable(scopedName)
                          .set(mapToExpression(phToNodeIdx, true))
                          .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]);

        this._prefixCode.push(phMap);
      }
    }

    this._nestedTemplates.forEach(buildTemplateFn => buildTemplateFn());

    return o.fn(
        // i.e. (rf: RenderFlags, ctx0: any, ctx: any)
        [
          new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), ...this.getNestedContexts(),
          new o.FnParam(CONTEXT_NAME, null)
        ],
        [
          // Temporary variable declarations for query refresh (i.e. let _t: any;)
          ...this._prefixCode,
          // Creating mode (i.e. if (rf & RenderFlags.Create) { ... })
          ...creationCode,
          // Binding and refresh mode (i.e. if (rf & RenderFlags.Update) {...})
          ...updateCode,
        ],
        o.INFERRED_TYPE, null, this.templateName);
  }

  // LocalResolver
  getLocal(name: string): o.Expression|null { return this._bindingScope.get(name); }

  visitContent(ngContent: t.Content) {
    const slot = this.allocateDataSlot();
    const selectorIndex = ngContent.selectorIndex;
    const parameters: o.Expression[] = [o.literal(slot)];

    const attributeAsList: string[] = [];

    ngContent.attributes.forEach((attribute) => {
      const name = attribute.name;
      if (name !== 'select') {
        attributeAsList.push(name, attribute.value);
      }
    });

    if (attributeAsList.length > 0) {
      parameters.push(o.literal(selectorIndex), asLiteral(attributeAsList));
    } else if (selectorIndex !== 0) {
      parameters.push(o.literal(selectorIndex));
    }

    this.creationInstruction(ngContent.sourceSpan, R3.projection, ...parameters);
  }


  getNamespaceInstruction(namespaceKey: string|null) {
    switch (namespaceKey) {
      case 'math':
        return R3.namespaceMathML;
      case 'svg':
        return R3.namespaceSVG;
      default:
        return R3.namespaceHTML;
    }
  }

  addNamespaceInstruction(nsInstruction: o.ExternalReference, element: t.Element) {
    this._namespace = nsInstruction;
    this.creationInstruction(element.sourceSpan, nsInstruction);
  }

  getNestedContexts(): o.FnParam[] {
    const nestedContexts = [];
    let nestingLevel = this.level - 1;

    while (nestingLevel >= 0) {
      nestedContexts.push(new o.FnParam(`ctx${nestingLevel}`, null));
      nestingLevel--;
    }

    return nestedContexts;
  }

  visitElement(element: t.Element) {
    const elementIndex = this.allocateDataSlot();
    const wasInI18nSection = this._inI18nSection;

    const outputAttrs: {[name: string]: string} = {};
    const attrI18nMetas: {[name: string]: string} = {};
    let i18nMeta: string = '';

    const [namespaceKey, elementName] = splitNsName(element.name);

    // Elements inside i18n sections are replaced with placeholders
    // TODO(vicb): nested elements are a WIP in this phase
    if (this._inI18nSection) {
      const phName = element.name.toLowerCase();
      if (!this._phToNodeIdxes[this._i18nSectionIndex][phName]) {
        this._phToNodeIdxes[this._i18nSectionIndex][phName] = [];
      }
      this._phToNodeIdxes[this._i18nSectionIndex][phName].push(elementIndex);
    }

    // Handle i18n attributes
    for (const attr of element.attributes) {
      const name = attr.name;
      const value = attr.value;
      if (name === I18N_ATTR) {
        if (this._inI18nSection) {
          throw new Error(
              `Could not mark an element as translatable inside of a translatable section`);
        }
        this._inI18nSection = true;
        this._i18nSectionIndex++;
        this._phToNodeIdxes[this._i18nSectionIndex] = {};
        i18nMeta = value;
      } else if (name.startsWith(I18N_ATTR_PREFIX)) {
        attrI18nMetas[name.slice(I18N_ATTR_PREFIX.length)] = value;
      } else {
        outputAttrs[name] = value;
      }
    }

    // Match directives on non i18n attributes
    if (this.directiveMatcher) {
      const selector = createCssSelector(element.name, outputAttrs);
      this.directiveMatcher.match(
          selector, (sel: CssSelector, staticType: any) => { this.directives.add(staticType); });
    }

    // Element creation mode
    const parameters: o.Expression[] = [
      o.literal(elementIndex),
      o.literal(elementName),
    ];

    // Add the attributes
    const i18nMessages: o.Statement[] = [];
    const attributes: o.Expression[] = [];
    const initialStyleDeclarations: o.Expression[] = [];
    const initialClassDeclarations: o.Expression[] = [];

    const styleInputs: t.BoundAttribute[] = [];
    const classInputs: t.BoundAttribute[] = [];
    const allOtherInputs: t.BoundAttribute[] = [];

    element.inputs.forEach((input: t.BoundAttribute) => {
      switch (input.type) {
        // [attr.style] or [attr.class] should not be treated as styling-based
        // bindings since they are intended to be written directly to the attr
        // and therefore will skip all style/class resolution that is present
        // with style="", [style]="" and [style.prop]="", class="",
        // [class.prop]="". [class]="" assignments
        case BindingType.Property:
          if (input.name == 'style') {
            // this should always go first in the compilation (for [style])
            styleInputs.splice(0, 0, input);
          } else if (isClassBinding(input)) {
            // this should always go first in the compilation (for [class])
            classInputs.splice(0, 0, input);
          } else {
            allOtherInputs.push(input);
          }
          break;
        case BindingType.Style:
          styleInputs.push(input);
          break;
        case BindingType.Class:
          classInputs.push(input);
          break;
        default:
          allOtherInputs.push(input);
          break;
      }
    });

    let currStyleIndex = 0;
    let currClassIndex = 0;
    let staticStylesMap: {[key: string]: any}|null = null;
    let staticClassesMap: {[key: string]: boolean}|null = null;
    const stylesIndexMap: {[key: string]: number} = {};
    const classesIndexMap: {[key: string]: number} = {};
    Object.getOwnPropertyNames(outputAttrs).forEach(name => {
      const value = outputAttrs[name];
      if (name == 'style') {
        staticStylesMap = parseStyle(value);
        Object.keys(staticStylesMap).forEach(prop => { stylesIndexMap[prop] = currStyleIndex++; });
      } else if (name == 'class') {
        staticClassesMap = {};
        value.split(/\s+/g).forEach(className => {
          classesIndexMap[className] = currClassIndex++;
          staticClassesMap ![className] = true;
        });
      } else {
        attributes.push(o.literal(name));
        if (attrI18nMetas.hasOwnProperty(name)) {
          const meta = parseI18nMeta(attrI18nMetas[name]);
          const variable = this.constantPool.getTranslation(value, meta);
          attributes.push(variable);
        } else {
          attributes.push(o.literal(value));
        }
      }
    });

    let hasMapBasedStyling = false;
    for (let i = 0; i < styleInputs.length; i++) {
      const input = styleInputs[i];
      const isMapBasedStyleBinding = i === 0 && input.name === 'style';
      if (isMapBasedStyleBinding) {
        hasMapBasedStyling = true;
      } else if (!stylesIndexMap.hasOwnProperty(input.name)) {
        stylesIndexMap[input.name] = currStyleIndex++;
      }
    }

    for (let i = 0; i < classInputs.length; i++) {
      const input = classInputs[i];
      const isMapBasedClassBinding = i === 0 && isClassBinding(input);
      if (!isMapBasedClassBinding && !stylesIndexMap.hasOwnProperty(input.name)) {
        classesIndexMap[input.name] = currClassIndex++;
      }
    }

    // in the event that a [style] binding is used then sanitization will
    // always be imported because it is not possible to know ahead of time
    // whether style bindings will use or not use any sanitizable properties
    // that isStyleSanitizable() will detect
    let useDefaultStyleSanitizer = hasMapBasedStyling;

    // this will build the instructions so that they fall into the following syntax
    // => [prop1, prop2, prop3, 0, prop1, value1, prop2, value2]
    Object.keys(stylesIndexMap).forEach(prop => {
      useDefaultStyleSanitizer = useDefaultStyleSanitizer || isStyleSanitizable(prop);
      initialStyleDeclarations.push(o.literal(prop));
    });

    if (staticStylesMap) {
      initialStyleDeclarations.push(o.literal(core.InitialStylingFlags.VALUES_MODE));

      Object.keys(staticStylesMap).forEach(prop => {
        initialStyleDeclarations.push(o.literal(prop));
        const value = staticStylesMap ![prop];
        initialStyleDeclarations.push(o.literal(value));
      });
    }

    Object.keys(classesIndexMap).forEach(prop => {
      initialClassDeclarations.push(o.literal(prop));
    });

    if (staticClassesMap) {
      initialClassDeclarations.push(o.literal(core.InitialStylingFlags.VALUES_MODE));

      Object.keys(staticClassesMap).forEach(className => {
        initialClassDeclarations.push(o.literal(className));
        initialClassDeclarations.push(o.literal(true));
      });
    }

    const hasStylingInstructions = initialStyleDeclarations.length || styleInputs.length ||
        initialClassDeclarations.length || classInputs.length;

    const attrArg: o.Expression = attributes.length > 0 ?
        this.constantPool.getConstLiteral(o.literalArr(attributes), true) :
        o.TYPED_NULL_EXPR;
    parameters.push(attrArg);

    if (element.references && element.references.length > 0) {
      const references = flatten(element.references.map(reference => {
        const slot = this.allocateDataSlot();
        // Generate the update temporary.
        const variableName = this._bindingScope.freshReferenceName();
        // When the ref's binding is processed, we'll either generate a load() or a reference()
        // instruction depending on the nesting level of the binding relative to the reference def.
        const refLevel = this.level;
        this._bindingScope.set(
            reference.name, o.variable(variableName), undefined, (bindingLevel: number) => {
              return bindingLevel === refLevel ?
                  o.importExpr(R3.load).callFn([o.literal(slot)]) :
                  o.importExpr(R3.reference).callFn([
                    o.literal(bindingLevel - refLevel), o.literal(slot)
                  ]);
            });
        return [reference.name, reference.value];
      }));
      parameters.push(this.constantPool.getConstLiteral(asLiteral(references), true));
    } else {
      parameters.push(o.TYPED_NULL_EXPR);
    }

    // Generate the instruction create element instruction
    if (i18nMessages.length > 0) {
      this._creationCode.push(...i18nMessages);
    }

    const wasInNamespace = this._namespace;
    const currentNamespace = this.getNamespaceInstruction(namespaceKey);

    // If the namespace is changing now, include an instruction to change it
    // during element creation.
    if (currentNamespace !== wasInNamespace) {
      this.addNamespaceInstruction(currentNamespace, element);
    }

    const implicit = o.variable(CONTEXT_NAME);

    const createSelfClosingInstruction =
        !hasStylingInstructions && element.children.length === 0 && element.outputs.length === 0;

    if (createSelfClosingInstruction) {
      this.creationInstruction(element.sourceSpan, R3.element, ...trimTrailingNulls(parameters));
    } else {
      // Generate the instruction create element instruction
      if (i18nMessages.length > 0) {
        this._creationCode.push(...i18nMessages);
      }
      this.creationInstruction(
          element.sourceSpan, R3.elementStart, ...trimTrailingNulls(parameters));

      // initial styling for static style="..." attributes
      if (hasStylingInstructions) {
        const paramsList: (o.Expression)[] = [];

        if (initialClassDeclarations.length) {
          // the template compiler handles initial class styling (e.g. class="foo") values
          // in a special command called `elementClass` so that the initial class
          // can be processed during runtime. These initial class values are bound to
          // a constant because the inital class values do not change (since they're static).
          paramsList.push(
              this.constantPool.getConstLiteral(o.literalArr(initialClassDeclarations), true));
        } else if (initialStyleDeclarations.length || useDefaultStyleSanitizer) {
          // no point in having an extra `null` value unless there are follow-up params
          paramsList.push(o.NULL_EXPR);
        }

        if (initialStyleDeclarations.length) {
          // the template compiler handles initial style (e.g. style="foo") values
          // in a special command called `elementStyle` so that the initial styles
          // can be processed during runtime. These initial styles values are bound to
          // a constant because the inital style values do not change (since they're static).
          paramsList.push(
              this.constantPool.getConstLiteral(o.literalArr(initialStyleDeclarations), true));
        } else if (useDefaultStyleSanitizer) {
          // no point in having an extra `null` value unless there are follow-up params
          paramsList.push(o.NULL_EXPR);
        }


        if (useDefaultStyleSanitizer) {
          paramsList.push(o.importExpr(R3.defaultStyleSanitizer));
        }

        this._creationCode.push(o.importExpr(R3.elementStyling).callFn(paramsList).toStmt());
      }

      // Generate Listeners (outputs)
      element.outputs.forEach((outputAst: t.BoundEvent) => {
        const elName = sanitizeIdentifier(element.name);
        const evName = sanitizeIdentifier(outputAst.name);
        const functionName = `${this.templateName}_${elName}_${evName}_listener`;
        const localVars: o.Statement[] = [];
        const bindingScope = this._bindingScope.nestedScope(
            this.level + 1, (lhsVar: o.ReadVarExpr, rhsExpression: o.Expression) => {
              localVars.push(
                  lhsVar.set(rhsExpression).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
            });
        const bindingExpr = convertActionBinding(
            bindingScope, implicit, outputAst.handler, 'b',
            () => error('Unexpected interpolation'));
        const handler = o.fn(
            [new o.FnParam('$event', o.DYNAMIC_TYPE)], [...localVars, ...bindingExpr.render3Stmts],
            o.INFERRED_TYPE, null, functionName);
        this.creationInstruction(
            outputAst.sourceSpan, R3.listener, o.literal(outputAst.name), handler);
      });
    }

    if ((styleInputs.length || classInputs.length) && hasStylingInstructions) {
      const indexLiteral = o.literal(elementIndex);

      const firstStyle = styleInputs[0];
      const mapBasedStyleInput = firstStyle && firstStyle.name == 'style' ? firstStyle : null;

      const firstClass = classInputs[0];
      const mapBasedClassInput = firstClass && isClassBinding(firstClass) ? firstClass : null;

      const stylingInput = mapBasedStyleInput || mapBasedClassInput;
      if (stylingInput) {
        const params: o.Expression[] = [];
        let value: AST;
        if (mapBasedClassInput) {
          value = mapBasedClassInput.value.visit(this._valueConverter);
        } else if (mapBasedStyleInput) {
          params.push(o.NULL_EXPR);
        }

        if (mapBasedStyleInput) {
          value = mapBasedStyleInput.value.visit(this._valueConverter);
        }

        this.updateInstruction(stylingInput.sourceSpan, R3.elementStylingMap, () => {
          params.push(this.convertPropertyBinding(implicit, value, true));
          return [indexLiteral, ...params];
        });
      }

      let lastInputCommand: t.BoundAttribute|null = null;
      if (styleInputs.length) {
        let i = mapBasedStyleInput ? 1 : 0;
        for (i; i < styleInputs.length; i++) {
          const input = styleInputs[i];
          const params: any[] = [];
          const sanitizationRef = resolveSanitizationFn(input, input.securityContext);
          if (sanitizationRef) params.push(sanitizationRef);

          const key = input.name;
          const styleIndex: number = stylesIndexMap[key] !;
          const value = input.value.visit(this._valueConverter);
          this.updateInstruction(input.sourceSpan, R3.elementStyleProp, () => {
            return [
              indexLiteral, o.literal(styleIndex),
              this.convertPropertyBinding(implicit, value, true), ...params
            ];
          });
        }

        lastInputCommand = styleInputs[styleInputs.length - 1];
      }

      if (classInputs.length) {
        let i = mapBasedClassInput ? 1 : 0;
        for (i; i < classInputs.length; i++) {
          const input = classInputs[i];
          const params: any[] = [];
          const sanitizationRef = resolveSanitizationFn(input, input.securityContext);
          if (sanitizationRef) params.push(sanitizationRef);

          const key = input.name;
          const classIndex: number = classesIndexMap[key] !;
          const value = input.value.visit(this._valueConverter);
          this.updateInstruction(input.sourceSpan, R3.elementClassProp, () => {
            return [
              indexLiteral, o.literal(classIndex),
              this.convertPropertyBinding(implicit, value, true), ...params
            ];
          });
        }

        lastInputCommand = classInputs[classInputs.length - 1];
      }

      this.updateInstruction(
          lastInputCommand !.sourceSpan, R3.elementStylingApply, () => [indexLiteral]);
    }

    // Generate element input bindings
    allOtherInputs.forEach((input: t.BoundAttribute) => {
      if (input.type === BindingType.Animation) {
        console.error('warning: animation bindings not yet supported');
        return;
      }

      const instruction = mapBindingToInstruction(input.type);
      if (instruction) {
        const params: any[] = [];
        const sanitizationRef = resolveSanitizationFn(input, input.securityContext);
        if (sanitizationRef) params.push(sanitizationRef);

        // TODO(chuckj): runtime: security context?
        const value = input.value.visit(this._valueConverter);
        this.updateInstruction(input.sourceSpan, instruction, () => {
          return [
            o.literal(elementIndex), o.literal(input.name),
            this.convertPropertyBinding(implicit, value), ...params
          ];
        });
      } else {
        this._unsupported(`binding type ${input.type}`);
      }
    });

    // Traverse element child nodes
    if (this._inI18nSection && element.children.length == 1 &&
        element.children[0] instanceof t.Text) {
      const text = element.children[0] as t.Text;
      this.visitSingleI18nTextChild(text, i18nMeta);
    } else {
      t.visitAll(this, element.children);
    }

    if (!createSelfClosingInstruction) {
      // Finish element construction mode.
      this.creationInstruction(element.endSourceSpan || element.sourceSpan, R3.elementEnd);
    }

    // Restore the state before exiting this node
    this._inI18nSection = wasInI18nSection;
  }

  visitTemplate(template: t.Template) {
    const templateIndex = this.allocateDataSlot();

    let elName = '';
    if (template.children.length === 1 && template.children[0] instanceof t.Element) {
      // When the template as a single child, derive the context name from the tag
      elName = sanitizeIdentifier((template.children[0] as t.Element).name);
    }

    const contextName = elName ? `${this.contextName}_${elName}` : '';

    const templateName =
        contextName ? `${contextName}_Template_${templateIndex}` : `Template_${templateIndex}`;

    const templateContext = `ctx${this.level}`;

    const parameters: o.Expression[] = [
      o.literal(templateIndex),
      o.variable(templateName),
      o.TYPED_NULL_EXPR,
    ];

    const attributeNames: o.Expression[] = [];
    const attributeMap: {[name: string]: string} = {};

    template.attributes.forEach(a => {
      attributeNames.push(asLiteral(a.name), asLiteral(''));
      attributeMap[a.name] = a.value;
    });

    // Match directives on template attributes
    if (this.directiveMatcher) {
      const selector = createCssSelector('ng-template', attributeMap);
      this.directiveMatcher.match(
          selector, (cssSelector, staticType) => { this.directives.add(staticType); });
    }

    if (attributeNames.length) {
      parameters.push(this.constantPool.getConstLiteral(o.literalArr(attributeNames), true));
    }

    // e.g. C(1, C1Template)
    this.creationInstruction(
        template.sourceSpan, R3.containerCreate, ...trimTrailingNulls(parameters));

    // e.g. p(1, 'forOf', ɵb(ctx.items));
    const context = o.variable(CONTEXT_NAME);
    template.inputs.forEach(input => {
      const value = input.value.visit(this._valueConverter);
      this.updateInstruction(template.sourceSpan, R3.elementProperty, () => {
        return [
          o.literal(templateIndex), o.literal(input.name),
          this.convertPropertyBinding(context, value)
        ];
      });
    });

    // Create the template function
    const templateVisitor = new TemplateDefinitionBuilder(
        this.constantPool, templateContext, this._bindingScope, this.level + 1, contextName,
        templateName, [], this.directiveMatcher, this.directives, this.pipeTypeByName, this.pipes,
        this._namespace);

    // Nested templates must not be visited until after their parent templates have completed
    // processing, so they are queued here until after the initial pass. Otherwise, we wouldn't
    // be able to support bindings in nested templates to local refs that occur after the
    // template definition. e.g. <div *ngIf="showing"> {{ foo }} </div>  <div #foo></div>
    this._nestedTemplates.push(() => {
      const templateFunctionExpr =
          templateVisitor.buildTemplateFunction(template.children, template.variables);
      this.constantPool.statements.push(templateFunctionExpr.toDeclStmt(templateName, null));
    });
  }

  // These should be handled in the template or element directly.
  readonly visitReference = invalid;
  readonly visitVariable = invalid;
  readonly visitTextAttribute = invalid;
  readonly visitBoundAttribute = invalid;
  readonly visitBoundEvent = invalid;

  visitBoundText(text: t.BoundText) {
    const nodeIndex = this.allocateDataSlot();

    this.creationInstruction(text.sourceSpan, R3.text, o.literal(nodeIndex));

    const value = text.value.visit(this._valueConverter);
    this.updateInstruction(
        text.sourceSpan, R3.textBinding,
        () => [o.literal(nodeIndex), this.convertPropertyBinding(o.variable(CONTEXT_NAME), value)]);
  }

  visitText(text: t.Text) {
    this.creationInstruction(
        text.sourceSpan, R3.text, o.literal(this.allocateDataSlot()), o.literal(text.value));
  }

  // When the content of the element is a single text node the translation can be inlined:
  //
  // `<p i18n="desc|mean">some content</p>`
  // compiles to
  // ```
  // /**
  // * @desc desc
  // * @meaning mean
  // */
  // const MSG_XYZ = goog.getMsg('some content');
  // i0.ɵT(1, MSG_XYZ);
  // ```
  visitSingleI18nTextChild(text: t.Text, i18nMeta: string) {
    const meta = parseI18nMeta(i18nMeta);
    const variable = this.constantPool.getTranslation(text.value, meta);
    this.creationInstruction(
        text.sourceSpan, R3.text, o.literal(this.allocateDataSlot()), variable);
  }

  private allocateDataSlot() { return this._dataIndex++; }
  private bindingContext() { return `${this._bindingContext++}`; }

  private instruction(
      span: ParseSourceSpan|null, reference: o.ExternalReference,
      params: o.Expression[]): o.Statement {
    return o.importExpr(reference, null, span).callFn(params, span).toStmt();
  }

  private creationInstruction(
      span: ParseSourceSpan|null, reference: o.ExternalReference, ...params: o.Expression[]) {
    this._creationCode.push(this.instruction(span, reference, params));
  }

  // Bindings must only be resolved after all local refs have been visited, so update mode
  // instructions are queued in callbacks that execute once the initial pass has completed.
  // Otherwise, we wouldn't be able to support local refs that are defined after their
  // bindings. e.g. {{ foo }} <div #foo></div>
  private updateInstruction(
      span: ParseSourceSpan|null, reference: o.ExternalReference, paramsFn: () => o.Expression[]) {
    this._bindingCode.push(() => { return this.instruction(span, reference, paramsFn()); });
  }

  private convertPropertyBinding(implicit: o.Expression, value: AST, skipBindFn?: boolean):
      o.Expression {
    const interpolationFn =
        value instanceof Interpolation ? interpolate : () => error('Unexpected interpolation');

    const convertedPropertyBinding = convertPropertyBinding(
        this, implicit, value, this.bindingContext(), BindingForm.TrySimple, interpolationFn);
    this._variableCode.push(...convertedPropertyBinding.stmts);

    const valExpr = convertedPropertyBinding.currValExpr;
    return value instanceof Interpolation || skipBindFn ? valExpr :
                                                          o.importExpr(R3.bind).callFn([valExpr]);
  }
}

class ValueConverter extends AstMemoryEfficientTransformer {
  constructor(
      private constantPool: ConstantPool, private allocateSlot: () => number,
      private allocatePureFunctionSlots: (numSlots: number) => number,
      private definePipe:
          (name: string, localName: string, slot: number, value: o.Expression) => void) {
    super();
  }

  // AstMemoryEfficientTransformer
  visitPipe(pipe: BindingPipe, context: any): AST {
    // Allocate a slot to create the pipe
    const slot = this.allocateSlot();
    const slotPseudoLocal = `PIPE:${slot}`;
    // Allocate one slot for the result plus one slot per pipe argument
    const pureFunctionSlot = this.allocatePureFunctionSlots(2 + pipe.args.length);
    const target = new PropertyRead(pipe.span, new ImplicitReceiver(pipe.span), slotPseudoLocal);
    const {identifier, isVarLength} = pipeBindingCallInfo(pipe.args);
    this.definePipe(pipe.name, slotPseudoLocal, slot, o.importExpr(identifier));
    const args: AST[] = [pipe.exp, ...pipe.args];
    const convertedArgs: AST[] =
        isVarLength ? this.visitAll([new LiteralArray(pipe.span, args)]) : this.visitAll(args);

    return new FunctionCall(pipe.span, target, [
      new LiteralPrimitive(pipe.span, slot),
      new LiteralPrimitive(pipe.span, pureFunctionSlot),
      ...convertedArgs,
    ]);
  }

  visitLiteralArray(array: LiteralArray, context: any): AST {
    return new BuiltinFunctionCall(array.span, this.visitAll(array.expressions), values => {
      // If the literal has calculated (non-literal) elements transform it into
      // calls to literal factories that compose the literal and will cache intermediate
      // values. Otherwise, just return an literal array that contains the values.
      const literal = o.literalArr(values);
      return values.every(a => a.isConstant()) ?
          this.constantPool.getConstLiteral(literal, true) :
          getLiteralFactory(this.constantPool, literal, this.allocatePureFunctionSlots);
    });
  }

  visitLiteralMap(map: LiteralMap, context: any): AST {
    return new BuiltinFunctionCall(map.span, this.visitAll(map.values), values => {
      // If the literal has calculated (non-literal) elements  transform it into
      // calls to literal factories that compose the literal and will cache intermediate
      // values. Otherwise, just return an literal array that contains the values.
      const literal = o.literalMap(values.map(
          (value, index) => ({key: map.keys[index].key, value, quoted: map.keys[index].quoted})));
      return values.every(a => a.isConstant()) ?
          this.constantPool.getConstLiteral(literal, true) :
          getLiteralFactory(this.constantPool, literal, this.allocatePureFunctionSlots);
    });
  }
}

// Pipes always have at least one parameter, the value they operate on
const pipeBindingIdentifiers = [R3.pipeBind1, R3.pipeBind2, R3.pipeBind3, R3.pipeBind4];

function pipeBindingCallInfo(args: o.Expression[]) {
  const identifier = pipeBindingIdentifiers[args.length];
  return {
    identifier: identifier || R3.pipeBindV,
    isVarLength: !identifier,
  };
}

const pureFunctionIdentifiers = [
  R3.pureFunction0, R3.pureFunction1, R3.pureFunction2, R3.pureFunction3, R3.pureFunction4,
  R3.pureFunction5, R3.pureFunction6, R3.pureFunction7, R3.pureFunction8
];

function pureFunctionCallInfo(args: o.Expression[]) {
  const identifier = pureFunctionIdentifiers[args.length];
  return {
    identifier: identifier || R3.pureFunctionV,
    isVarLength: !identifier,
  };
}

function getLiteralFactory(
    constantPool: ConstantPool, literal: o.LiteralArrayExpr | o.LiteralMapExpr,
    allocateSlots: (numSlots: number) => number): o.Expression {
  const {literalFactory, literalFactoryArguments} = constantPool.getLiteralFactory(literal);
  // Allocate 1 slot for the result plus 1 per argument
  const startSlot = allocateSlots(1 + literalFactoryArguments.length);
  literalFactoryArguments.length > 0 || error(`Expected arguments to a literal factory function`);
  const {identifier, isVarLength} = pureFunctionCallInfo(literalFactoryArguments);

  // Literal factories are pure functions that only need to be re-invoked when the parameters
  // change.
  const args = [
    o.literal(startSlot),
    literalFactory,
  ];

  if (isVarLength) {
    args.push(o.literalArr(literalFactoryArguments));
  } else {
    args.push(...literalFactoryArguments);
  }

  return o.importExpr(identifier).callFn(args);
}

/**
 * Function which is executed whenever a variable is referenced for the first time in a given
 * scope.
 *
 * It is expected that the function creates the `const localName = expression`; statement.
 */
export type DeclareLocalVarCallback = (lhsVar: o.ReadVarExpr, rhsExpression: o.Expression) => void;

export class BindingScope implements LocalResolver {
  /**
   * Keeps a map from local variables to their expressions.
   *
   * This is used when one refers to variable such as: 'let abc = a.b.c`.
   * - key to the map is the string literal `"abc"`.
   * - value `lhs` is the left hand side which is an AST representing `abc`.
   * - value `rhs` is the right hand side which is an AST representing `a.b.c`.
   * - value `declared` is true if the `declareLocalVarCallback` has been called for this scope
   * already.
   */
  private map = new Map < string, {
    lhs: o.ReadVarExpr;
    rhs: o.Expression|undefined;
    declared: boolean;
    rhsCallback?: (level: number) => o.Expression;
  }
  > ();
  private referenceNameIndex = 0;

  static ROOT_SCOPE = new BindingScope().set('$event', o.variable('$event'));

  private constructor(
      private level: number = 0, private parent: BindingScope|null = null,
      private declareLocalVarCallback: DeclareLocalVarCallback = noop) {}

  get(name: string): o.Expression|null {
    let current: BindingScope|null = this;
    while (current) {
      let value = current.map.get(name);
      if (value != null) {
        if (current !== this) {
          // make a local copy and reset the `declared` state.
          value = {lhs: value.lhs, rhs: value.rhs, rhsCallback: value.rhsCallback, declared: false};
          // Cache the value locally.
          this.map.set(name, value);
        }
        const rhs = value.rhs || value.rhsCallback && value.rhsCallback(this.level);
        if (rhs && !value.declared) {
          // if it is first time we are referencing the variable in the scope
          // then invoke the callback to insert variable declaration.
          this.declareLocalVarCallback(value.lhs, rhs);
          value.declared = true;
        }
        return value.lhs;
      }
      current = current.parent;
    }
    return null;
  }

  /**
   * Create a local variable for later reference.
   *
   * @param name Name of the variable.
   * @param lhs AST representing the left hand side of the `let lhs = rhs;`.
   * @param rhs AST representing the right hand side of the `let lhs = rhs;`. The `rhs` can be
   * `undefined` for variable that are ambient such as `$event` and which don't have `rhs`
   * declaration.
   */
  set(name: string, lhs: o.ReadVarExpr, rhs?: o.Expression,
      rhsCallback?: (level: number) => o.Expression): BindingScope {
    !this.map.has(name) ||
        error(`The name ${name} is already defined in scope to be ${this.map.get(name)}`);
    this.map.set(name, {lhs: lhs, rhs: rhs, declared: false, rhsCallback: rhsCallback});
    return this;
  }

  getLocal(name: string): (o.Expression|null) { return this.get(name); }

  nestedScope(level: number, declareCallback: DeclareLocalVarCallback): BindingScope {
    return new BindingScope(level, this, declareCallback);
  }

  freshReferenceName(): string {
    let current: BindingScope = this;
    // Find the top scope as it maintains the global reference count
    while (current.parent) current = current.parent;
    const ref = `${REFERENCE_PREFIX}${current.referenceNameIndex++}`;
    return ref;
  }
}

/**
 * Creates a `CssSelector` given a tag name and a map of attributes
 */
function createCssSelector(tag: string, attributes: {[name: string]: string}): CssSelector {
  const cssSelector = new CssSelector();

  cssSelector.setElement(tag);

  Object.getOwnPropertyNames(attributes).forEach((name) => {
    const value = attributes[name];

    cssSelector.addAttribute(name, value);
    if (name.toLowerCase() === 'class') {
      const classes = value.trim().split(/\s+/g);
      classes.forEach(className => cssSelector.addClassName(className));
    }
  });

  return cssSelector;
}

// Parse i18n metas like:
// - "@@id",
// - "description[@@id]",
// - "meaning|description[@@id]"
function parseI18nMeta(i18n?: string): {description?: string, id?: string, meaning?: string} {
  let meaning: string|undefined;
  let description: string|undefined;
  let id: string|undefined;

  if (i18n) {
    // TODO(vicb): figure out how to force a message ID with closure ?
    const idIndex = i18n.indexOf(ID_SEPARATOR);

    const descIndex = i18n.indexOf(MEANING_SEPARATOR);
    let meaningAndDesc: string;
    [meaningAndDesc, id] =
        (idIndex > -1) ? [i18n.slice(0, idIndex), i18n.slice(idIndex + 2)] : [i18n, ''];
    [meaning, description] = (descIndex > -1) ?
        [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
        ['', meaningAndDesc];
  }

  return {description, id, meaning};
}

function interpolate(args: o.Expression[]): o.Expression {
  args = args.slice(1);  // Ignore the length prefix added for render2
  switch (args.length) {
    case 3:
      return o.importExpr(R3.interpolation1).callFn(args);
    case 5:
      return o.importExpr(R3.interpolation2).callFn(args);
    case 7:
      return o.importExpr(R3.interpolation3).callFn(args);
    case 9:
      return o.importExpr(R3.interpolation4).callFn(args);
    case 11:
      return o.importExpr(R3.interpolation5).callFn(args);
    case 13:
      return o.importExpr(R3.interpolation6).callFn(args);
    case 15:
      return o.importExpr(R3.interpolation7).callFn(args);
    case 17:
      return o.importExpr(R3.interpolation8).callFn(args);
  }
  (args.length >= 19 && args.length % 2 == 1) ||
      error(`Invalid interpolation argument length ${args.length}`);
  return o.importExpr(R3.interpolationV).callFn([o.literalArr(args)]);
}

/**
 * Parse a template into render3 `Node`s and additional metadata, with no other dependencies.
 *
 * @param template text of the template to parse
 * @param templateUrl URL to use for source mapping of the parsed template
 */
export function parseTemplate(
    template: string, templateUrl: string, options: {preserveWhitespaces?: boolean} = {}):
    {errors?: ParseError[], nodes: t.Node[], hasNgContent: boolean, ngContentSelectors: string[]} {
  const bindingParser = makeBindingParser();
  const htmlParser = new HtmlParser();
  const parseResult = htmlParser.parse(template, templateUrl);

  if (parseResult.errors && parseResult.errors.length > 0) {
    return {errors: parseResult.errors, nodes: [], hasNgContent: false, ngContentSelectors: []};
  }

  let rootNodes: html.Node[] = parseResult.rootNodes;
  if (!options.preserveWhitespaces) {
    rootNodes = html.visitAll(new WhitespaceVisitor(), rootNodes);
  }

  const {nodes, hasNgContent, ngContentSelectors, errors} =
      htmlAstToRender3Ast(rootNodes, bindingParser);
  if (errors && errors.length > 0) {
    return {errors, nodes: [], hasNgContent: false, ngContentSelectors: []};
  }

  return {nodes, hasNgContent, ngContentSelectors};
}

/**
 * Construct a `BindingParser` with a default configuration.
 */
export function makeBindingParser(): BindingParser {
  return new BindingParser(
      new Parser(new Lexer()), DEFAULT_INTERPOLATION_CONFIG, new DomElementSchemaRegistry(), null,
      []);
}

function isClassBinding(input: t.BoundAttribute): boolean {
  return input.name == 'className' || input.name == 'class';
}

function resolveSanitizationFn(input: t.BoundAttribute, context: core.SecurityContext) {
  switch (context) {
    case core.SecurityContext.HTML:
      return o.importExpr(R3.sanitizeHtml);
    case core.SecurityContext.SCRIPT:
      return o.importExpr(R3.sanitizeScript);
    case core.SecurityContext.STYLE:
      // the compiler does not fill in an instruction for [style.prop?] binding
      // values because the style algorithm knows internally what props are subject
      // to sanitization (only [attr.style] values are explicitly sanitized)
      return input.type === BindingType.Attribute ? o.importExpr(R3.sanitizeStyle) : null;
    case core.SecurityContext.URL:
      return o.importExpr(R3.sanitizeUrl);
    case core.SecurityContext.RESOURCE_URL:
      return o.importExpr(R3.sanitizeResourceUrl);
    default:
      return null;
  }
}

function isStyleSanitizable(prop: string): boolean {
  switch (prop) {
    case 'background-image':
    case 'background':
    case 'border-image':
    case 'filter':
    case 'list-style':
    case 'list-style-image':
      return true;
  }
  return false;
}
