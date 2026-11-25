/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SecurityContext} from '../../core';
import {AST, BindingType} from '../../expression_parser/ast';
import {BindingPropertyName, ClassPropertyName} from '../../property_mapping';
import {BoundAttribute, Element, Template} from '../../render3/r3_ast';
import {Identifiers as R3Identifiers} from '../../render3/r3_identifiers';
import {IDENTIFIER_PATTERN, isUnsafeObjectKey} from '../../render3/util';
import {DomElementSchemaRegistry} from '../../schema/dom_element_schema_registry';
import {isAriaAttribute} from '../../template/pipeline/src/util/attributes';
import {TcbDirectiveMetadata} from '../api';
import {TcbOp} from './base';
import {getBoundAttributes, widenBinding} from './bindings';
import {declareVariable, TcbExpr} from './codegen';
import type {Context} from './context';
import {isCustomElementTag} from './element';
import {tcbExpression, unwrapWritableSignal} from './expression';
import {LocalSymbol} from './references';
import type {Scope} from './scope';
import {
  checkUnsupportedFieldBindings,
  customFormControlBannedInputFields,
  CustomFormControlType,
  expandBoundAttributesForField,
} from './signal_forms';
const REGISTRY = new DomElementSchemaRegistry();

/**
 * Standard global HTML attributes that do not need `ɵNgAttributeType` checks when written as
 * static attributes on custom elements, avoiding unnecessary TCB statements.
 */
const SKIPPED_CUSTOM_ELEMENT_STATIC_ATTRS = new Set([
  'class',
  'style',
  'id',
  'slot',
  'part',
  'role',
  'tabindex',
  'title',
  'dir',
  'lang',
  'hidden',
]);

/**
 * Translates the given attribute binding to a `ts.Expression`.
 */
export function translateInput(value: AST | string, tcb: Context, scope: Scope): TcbExpr {
  if (typeof value === 'string') {
    // For regular attributes with a static string value, use the represented string literal.
    return new TcbExpr(TcbExpr.quoteAndEscape(value));
  } else {
    // Produce an expression representing the value of the binding.
    return tcbExpression(value, tcb, scope);
  }
}

/**
 * A `TcbOp` which generates code to check input bindings on an element that correspond with the
 * members of a directive.
 *
 * Executing this operation returns nothing.
 */
export class TcbDirectiveInputsOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private node: Template | Element,
    private dir: TcbDirectiveMetadata,
    private isFormControl: boolean = false,
    private customFormControlType: CustomFormControlType | null,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    let dirId: TcbExpr | null = null;

    // TODO(joost): report duplicate properties
    const seenRequiredInputs = new Set<ClassPropertyName>();
    const boundAttrs = getBoundAttributes(this.dir, this.node);

    if (this.customFormControlType !== null) {
      checkUnsupportedFieldBindings(this.node, customFormControlBannedInputFields, this.tcb);
    }

    if (this.customFormControlType !== null || this.isFormControl) {
      const additionalBindings = expandBoundAttributesForField(
        this.dir,
        this.node,
        this.customFormControlType,
      );

      if (additionalBindings !== null) {
        boundAttrs.push(...additionalBindings);
      }
    }

    for (const attr of boundAttrs) {
      // For bound inputs, the property is assigned the binding expression.
      let assignment = widenBinding(
        translateInput(attr.value, this.tcb, this.scope),
        this.tcb,
        attr.value,
      );
      assignment.wrapForTypeChecker();

      for (const {fieldName, required, transformType, isSignal, isTwoWayBinding} of attr.inputs) {
        let target: TcbExpr;

        if (required) {
          seenRequiredInputs.add(fieldName);
        }

        // Note: There is no special logic for transforms/coercion with signal inputs.
        // For signal inputs, a `transformType` will never be set as we do not capture
        // the transform in the compiler metadata. Signal inputs incorporate their
        // transform write type into their member type, and we extract it below when
        // setting the `WriteT` of such `InputSignalWithTransform<_, WriteT>`.

        if (this.dir.coercedInputFields.has(fieldName)) {
          let type: TcbExpr;

          if (transformType !== undefined) {
            type = new TcbExpr(transformType);
          } else {
            // The input has a coercion declaration which should be used instead of assigning the
            // expression into the input field directly. To achieve this, a variable is declared
            // with a type of `typeof Directive.ngAcceptInputType_fieldName` which is then used as
            // target of the assignment.
            const dirTypeRef = this.tcb.env.referenceTcbValue(this.dir.ref);
            const propName = `ngAcceptInputType_${fieldName}`;
            const access = isUnsafeObjectKey(fieldName)
              ? `[${TcbExpr.quoteAndEscape(propName)}]`
              : `.${propName}`;
            type = new TcbExpr(`typeof ${dirTypeRef.print()}${access}`);
          }

          const id = new TcbExpr(this.tcb.allocateId());
          this.scope.addStatement(declareVariable(id, type));
          target = id;
        } else if (this.dir.undeclaredInputFields.has(fieldName)) {
          // If no coercion declaration is present nor is the field declared (i.e. the input is
          // declared in a `@Directive` or `@Component` decorator's `inputs` property) there is no
          // assignment target available, so this field is skipped.
          continue;
        } else if (
          !this.tcb.env.config.honorAccessModifiersForInputBindings &&
          this.dir.restrictedInputFields.has(fieldName)
        ) {
          // If strict checking of access modifiers is disabled and the field is restricted
          // (i.e. private/protected/readonly), generate an assignment into a temporary variable
          // that has the type of the field. This achieves type-checking but circumvents the access
          // modifiers.
          if (dirId === null) {
            dirId = this.scope.resolve(this.node, this.dir);
          }

          const id = new TcbExpr(this.tcb.allocateId());
          // Note: the indexed access type is used rather than a type query with a qualified name
          // (`typeof _t1.fieldName`) because, unlike the latter, it widens fresh literal types of
          // `readonly` fields (e.g. `@Input() readonly showBadge = false;` must still accept a
          // `true` binding).
          const type = new TcbExpr(
            `(typeof ${dirId.print()})[${TcbExpr.quoteAndEscape(fieldName)}]`,
          );
          const temp = declareVariable(id, type);
          this.scope.addStatement(temp);
          target = id;

          if (!this.dir.stringLiteralInputFields.has(fieldName) && attr.keySpan !== null) {
            // TypeScript does not treat the string literal in the indexed access type as a
            // reference to the class member, so emit a separate type query with a qualified name
            // that keeps a TypeScript-visible reference to the input's class member. The language
            // service relies on it e.g. to find references to a `readonly` input. Reading the
            // field is an error if it is private/protected, so diagnostics are ignored for this
            // statement; the assignment into the temporary variable remains fully type-checked.
            // Non-identifier field names cannot be expressed as a type query and are skipped.
            this.scope.addStatement(
              new TcbExpr(`null! as typeof ${dirId.print()}.${fieldName}`)
                .markIgnoreDiagnostics()
                .addParseSpanInfo(attr.keySpan),
            );
          }
        } else {
          if (dirId === null) {
            dirId = this.scope.resolve(this.node, this.dir);
          }

          // To get errors assign directly to the fields on the instance, using property access
          // when possible. String literal fields may not be valid JS identifiers so we use
          // literal element access instead for those cases.
          target = this.dir.stringLiteralInputFields.has(fieldName)
            ? new TcbExpr(`${dirId.print()}[${TcbExpr.quoteAndEscape(fieldName)}]`)
            : new TcbExpr(`${dirId.print()}.${fieldName}`);
        }

        // For signal inputs, we unwrap the target `InputSignal`. Note that
        // we intentionally do the following things:
        //   1. keep the direct access to `dir.[field]` so that modifiers are honored.
        //   2. follow the existing pattern where multiple targets assign a single expression.
        //      This is a significant requirement for language service auto-completion.
        if (isSignal) {
          const inputSignalBrandWriteSymbol = this.tcb.env.referenceExternalSymbol(
            R3Identifiers.InputSignalBrandWriteType.moduleName,
            R3Identifiers.InputSignalBrandWriteType.name,
          );

          target = new TcbExpr(`${target.print()}[${inputSignalBrandWriteSymbol.print()}]`);
        }

        if (attr.keySpan !== null) {
          target.addParseSpanInfo(attr.keySpan);
        }

        // Two-way bindings accept `T | WritableSignal<T>` so we have to unwrap the value.
        if (isTwoWayBinding && this.tcb.env.config.allowSignalsInTwoWayBindings) {
          assignment = unwrapWritableSignal(assignment, this.tcb);
        }

        // Finally the assignment is extended by assigning it into the target expression.
        assignment = new TcbExpr(`${target.print()} = ${assignment.print()}`);
      }

      assignment.addParseSpanInfo(attr.sourceSpan);

      // Ignore diagnostics for text attributes if configured to do so.
      if (!this.tcb.env.config.checkTypeOfAttributes && typeof attr.value === 'string') {
        assignment.markIgnoreDiagnostics();
      }

      this.scope.addStatement(assignment);
    }

    this.checkRequiredInputs(seenRequiredInputs);

    return null;
  }

  private checkRequiredInputs(seenRequiredInputs: Set<ClassPropertyName>): void {
    const missing: BindingPropertyName[] = [];

    for (const input of this.dir.inputs) {
      if (input.required && !seenRequiredInputs.has(input.classPropertyName)) {
        missing.push(input.bindingPropertyName);
      }
    }

    if (missing.length > 0) {
      this.tcb.oobRecorder.missingRequiredInputs(
        this.tcb.id,
        this.node,
        this.dir.name,
        this.dir.isComponent,
        missing,
      );
    }
  }
}

/**
 * A `TcbOp` which generates code to check "unclaimed inputs" - bindings on an element which were
 * not attributed to any directive or component, and are instead processed against the HTML element
 * itself.
 *
 * Currently, only the expressions of these bindings are checked. The targets of the bindings are
 * checked against the DOM schema via a `TcbDomSchemaCheckerOp`.
 *
 * Executing this operation returns nothing.
 */
export class TcbUnclaimedInputsOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private inputs: BoundAttribute[],
    private target: LocalSymbol,
    private claimedInputs: Set<string> | null,
    private checkCustomElementBindings: boolean = false,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    // `this.inputs` contains only those bindings not matched by any directive. These bindings go to
    // the element itself.
    let elId: TcbExpr | null = null;
    const hasNoErrorsSchema = this.tcb.schemas.some(
      (schema) => schema.name === NO_ERRORS_SCHEMA.name,
    );
    const hasCustomElementsSchema = this.tcb.schemas.some(
      (schema) => schema.name === CUSTOM_ELEMENTS_SCHEMA.name,
    );
    const allowUnderSchema =
      !hasCustomElementsSchema || this.tcb.env.config.checkCustomElementsUnderSchema;
    const isCheckableDomProperty = (binding: BoundAttribute): boolean =>
      binding.name !== 'style' &&
      binding.name !== 'class' &&
      !isAriaAttribute(binding.name) &&
      binding.securityContext === SecurityContext.NONE;
    const hasUnclaimedDomProperty = this.inputs.some(
      (binding) =>
        (binding.type === BindingType.Property || binding.type === BindingType.TwoWay) &&
        !this.claimedInputs?.has(binding.name) &&
        isCheckableDomProperty(binding) &&
        !REGISTRY.validateProperty(binding.name).error,
    );
    const isCustomElement =
      this.checkCustomElementBindings &&
      this.target instanceof Element &&
      isCustomElementTag(this.target.name);
    const lowerTagName = isCustomElement
      ? (this.target as Element).name.replace(/^:xhtml:/, '').toLowerCase()
      : null;
    const canCheckCustomElementBase = isCustomElement && !hasNoErrorsSchema && allowUnderSchema;
    const canCheckCustomElement = canCheckCustomElementBase && hasUnclaimedDomProperty;
    const checkCustomElementPropertyTypes =
      this.tcb.env.config.checkTypeOfInputBindings || this.tcb.env.config.checkTypeOfDomBindings;
    const canCheckCustomElementAttrBindings =
      canCheckCustomElementBase && this.tcb.env.config.checkTypeOfInputBindings;
    const shouldCheckDomBindings =
      this.tcb.env.config.checkTypeOfDomBindings || canCheckCustomElement;

    // TODO(alxhub): this could be more efficient.
    for (const binding of this.inputs) {
      const isPropertyBinding =
        binding.type === BindingType.Property || binding.type === BindingType.TwoWay;

      if (isPropertyBinding && this.claimedInputs?.has(binding.name)) {
        // Skip this binding as it was claimed by a directive.
        continue;
      }

      const expr = widenBinding(
        tcbExpression(binding.value, this.tcb, this.scope),
        this.tcb,
        binding.value,
      );

      if (shouldCheckDomBindings && isPropertyBinding) {
        if (isCheckableDomProperty(binding)) {
          // A direct binding to a property. Always use `getMappedPropName` so type checking
          // stays aligned with Angular's runtime property writes (`ɵɵproperty` / `ɵɵdomProperty`).
          const propertyName = REGISTRY.getMappedPropName(binding.name);
          if (REGISTRY.validateProperty(propertyName).error) {
            // `TcbDomSchemaCheckerOp` already reports an error for disallowed properties (e.g.
            // `on*` event properties). Still validate the RHS expression without emitting an
            // assignment that could produce a duplicate diagnostic.
            this.scope.addStatement(expr);
            continue;
          }
          if (elId === null) {
            elId = this.scope.resolve(this.target);
          }
          let targetExpr = elId.print();
          if (isCustomElement && lowerTagName !== null) {
            const ngPropertyTarget = this.tcb.env.referenceExternalSymbol(
              '@angular/core',
              'ɵNgPropertyTarget',
            );
            targetExpr = `(${elId.print()} as unknown as ${ngPropertyTarget.print()}<${TcbExpr.quoteAndEscape(lowerTagName)}>)`;
          }
          const target = !IDENTIFIER_PATTERN.test(propertyName)
            ? new TcbExpr(`${targetExpr}[${TcbExpr.quoteAndEscape(propertyName)}]`)
            : new TcbExpr(`${targetExpr}.${propertyName}`);
          if (isCustomElement && propertyName !== binding.name) {
            target.markRemappedProperty(binding.name, propertyName);
          }
          target.addParseSpanInfo(binding.keySpan);
          if (isCustomElement && !checkCustomElementPropertyTypes) {
            // When input type-checking is disabled (e.g. `fullTemplateTypeCheck: true` without
            // `strictTemplates`), still check property existence on known custom elements without
            // checking assignability of the bound expression.
            this.scope.addStatement(target);
            this.scope.addStatement(expr);
          } else {
            let assignment = expr.wrapForTypeChecker();
            if (
              binding.type === BindingType.TwoWay &&
              this.tcb.env.config.allowSignalsInTwoWayBindings
            ) {
              assignment = unwrapWritableSignal(assignment, this.tcb);
            }
            const stmt = new TcbExpr(`${target.print()} = ${assignment.print()}`).addParseSpanInfo(
              binding.sourceSpan,
            );
            this.scope.addStatement(stmt);
          }
        } else {
          this.scope.addStatement(expr);
        }
      } else if (
        canCheckCustomElementAttrBindings &&
        lowerTagName !== null &&
        binding.type === BindingType.Attribute &&
        !this.claimedInputs?.has(binding.name)
      ) {
        // Check `[attr.*]` bindings against `NgCustomElements[tag].attributes` when declared.
        // Angular removes the attribute when bound to `null` or `undefined`.
        const ngAttributeType = this.tcb.env.referenceExternalSymbol(
          '@angular/core',
          'ɵNgAttributeType',
        );
        const attrId = this.tcb.allocateId();
        const stmt = new TcbExpr(
          `var ${attrId}: ${ngAttributeType.print()}<${TcbExpr.quoteAndEscape(lowerTagName)}, ${TcbExpr.quoteAndEscape(binding.name)}> | null | undefined = ${expr.wrapForTypeChecker().print()}`,
        ).addParseSpanInfo(binding.sourceSpan);
        this.scope.addStatement(stmt);
      } else {
        // A binding to an animation, attribute, class or style. For now, only validate the right-
        // hand side of the expression.
        // TODO: properly check class and style bindings.
        this.scope.addStatement(expr);
      }
    }

    // Check static HTML attributes on custom elements against `NgCustomElements[tag].attributes`.
    if (
      canCheckCustomElementBase &&
      lowerTagName !== null &&
      this.tcb.env.config.checkTypeOfAttributes &&
      this.target instanceof Element
    ) {
      for (const attr of this.target.attributes) {
        if (
          this.claimedInputs?.has(attr.name) ||
          SKIPPED_CUSTOM_ELEMENT_STATIC_ATTRS.has(attr.name) ||
          attr.name.startsWith('data-') ||
          attr.name.startsWith('aria-')
        ) {
          continue;
        }
        const ngAttrType = this.tcb.env.referenceExternalSymbol(
          '@angular/core',
          'ɵNgAttributeType',
        );
        const attrId = this.tcb.allocateId();
        const valueExpr = new TcbExpr(TcbExpr.quoteAndEscape(attr.value)).addParseSpanInfo(
          attr.valueSpan ?? attr.sourceSpan,
        );
        const stmt = new TcbExpr(
          `var ${attrId}: ${ngAttrType.print()}<${TcbExpr.quoteAndEscape(lowerTagName)}, ${TcbExpr.quoteAndEscape(attr.name)}> = ${valueExpr.print()}`,
        ).addParseSpanInfo(attr.sourceSpan);
        this.scope.addStatement(stmt);
      }
    }

    return null;
  }
}
