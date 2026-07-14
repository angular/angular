/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, ASTWithSource, BindingType, Interpolation} from '../../expression_parser/ast';
import {BindingPropertyName, ClassPropertyName} from '../../property_mapping';
import {Identifiers as R3Identifiers} from '../../render3/r3_identifiers';
import {
  BoundAttribute,
  Component,
  Directive,
  Element,
  Template,
  TextAttribute,
} from '../../render3/r3_ast';
import type {Context} from './context';
import type {Scope} from './scope';
import {TcbDirectiveMetadata} from '../api';
import {TcbOp} from './base';
import {declareVariable, TcbExpr} from './codegen';
import {
  getCustomElementsManifestAttributeCheck,
  getCustomElementsManifestPropertyCheckType,
  hasCustomElementsManifestProperty,
} from './custom_elements_manifest';
import {DomElementSchemaRegistry} from '../../schema/dom_element_schema_registry';
const REGISTRY = new DomElementSchemaRegistry();
import {tcbExpression, unwrapWritableSignal} from './expression';
import {
  checkUnsupportedFieldBindings,
  CustomFormControlType,
  customFormControlBannedInputFields,
  expandBoundAttributesForField,
} from './signal_forms';
import {getBoundAttributes, widenBinding} from './bindings';
import {LocalSymbol} from './references';
import {isUnsafeObjectKey} from '../../render3/util';

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
    private node: Template | Element | Component | Directive,
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
          const type = new TcbExpr(
            `(typeof ${dirId.print()})[${TcbExpr.quoteAndEscape(fieldName)}]`,
          );
          const temp = declareVariable(id, type);
          this.scope.addStatement(temp);
          target = id;
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

    if (this.target instanceof Element && this.tcb.env.config.checkTypeOfAttributes) {
      for (const attribute of this.target.attributes) {
        if (this.claimedInputs?.has(attribute.name)) {
          continue;
        }
        this.checkCustomElementTextAttribute(attribute);
      }
    }

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

      // When the element is a custom element declared in a Custom Elements Manifest and the
      // bound property has a validated check type, assign the binding value to a variable of
      // that type so TypeScript checks it. This is gated on `checkTypeOfInputBindings` (rather
      // than merely widening the value) so that manifests with unresolvable type references
      // can never introduce diagnostics into non-strict projects.
      const checkType =
        isPropertyBinding &&
        binding.name !== 'style' &&
        binding.name !== 'class' &&
        this.tcb.env.config.checkTypeOfInputBindings &&
        this.target instanceof Element
          ? getCustomElementsManifestPropertyCheckType(
              this.tcb.env.config,
              this.target.name,
              binding.name,
            )
          : null;
      if (checkType !== null) {
        const id = new TcbExpr(this.tcb.allocateId());
        // The span on the type maps resolution failures of `import()` type queries in the
        // check type (e.g. a manifest referencing a package without type declarations) back
        // to the property binding in the template.
        const type = new TcbExpr(`(${checkType})`).addParseSpanInfo(
          binding.keySpan ?? binding.sourceSpan,
        );
        this.scope.addStatement(declareVariable(id, type));
        id.addParseSpanInfo(binding.keySpan ?? binding.sourceSpan);
        let checkedExpression = expr.wrapForTypeChecker();
        if (isInterpolation(binding.value)) {
          // Interpolation always serializes to a string at runtime. Materialize that type before
          // the contextual assignment so TypeScript cannot infer a literal-union target type for
          // a broad string expression such as `"" + ctx.variant`.
          checkedExpression = new TcbExpr(
            `(${checkedExpression.print()}) as string`,
          ).addParseSpanInfo(binding.value.sourceSpan);
        }
        this.scope.addStatement(
          new TcbExpr(`${id.print()} = ${checkedExpression.print()}`).addParseSpanInfo(
            binding.sourceSpan,
          ),
        );
        continue;
      }

      if (this.tcb.env.config.checkTypeOfDomBindings && isPropertyBinding) {
        if (binding.name !== 'style' && binding.name !== 'class') {
          if (elId === null) {
            elId = this.scope.resolve(this.target);
          }
          // A direct binding to a property.
          const propertyName =
            this.target instanceof Element &&
            hasCustomElementsManifestProperty(this.tcb.env.config, this.target.name, binding.name)
              ? binding.name
              : REGISTRY.getMappedPropName(binding.name);
          const stmt = new TcbExpr(
            `${elId.print()}[${TcbExpr.quoteAndEscape(propertyName)}] = ${expr.wrapForTypeChecker().print()}`,
          ).addParseSpanInfo(binding.sourceSpan);
          this.scope.addStatement(stmt);
        } else {
          this.scope.addStatement(expr);
        }
      } else {
        // A binding to an animation, attribute, class or style. For now, only validate the right-
        // hand side of the expression.
        // TODO: properly check class and style bindings.
        this.scope.addStatement(expr);
      }
    }

    return null;
  }

  /** Emits a contextual assignment for a manifest-declared static attribute, when safe. */
  private checkCustomElementTextAttribute(attribute: TextAttribute): void {
    if (!(this.target instanceof Element)) {
      return;
    }
    const attributeCheck = getCustomElementsManifestAttributeCheck(
      this.tcb.env.config,
      this.target.name,
      attribute.name,
    );
    if (attributeCheck === null || attributeCheck.type === 'object') {
      return;
    }

    let value: string;
    switch (attributeCheck.type) {
      case 'string':
        value = TcbExpr.quoteAndEscape(attribute.value);
        break;
      case 'number': {
        // Custom-element number attributes are serialized strings at runtime. Validate the HTML
        // spelling first, then emit a numeric literal so TypeScript can check number literal unions.
        const isNumber = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(attribute.value);
        value = isNumber
          ? String(Number(attribute.value))
          : TcbExpr.quoteAndEscape(attribute.value);
        break;
      }
      case 'boolean': {
        // Follow HTML boolean-attribute syntax: presence (empty text) or the attribute's own name.
        const normalizedValue = attribute.value.replace(/[A-Z]/g, (char) => char.toLowerCase());
        const normalizedName = attribute.name.replace(/[A-Z]/g, (char) => char.toLowerCase());
        value =
          normalizedValue === '' || normalizedValue === normalizedName
            ? 'true'
            : TcbExpr.quoteAndEscape(attribute.value);
        break;
      }
    }

    const id = new TcbExpr(this.tcb.allocateId());
    const type = new TcbExpr(`(${attributeCheck.checkType})`).addParseSpanInfo(
      attribute.keySpan ?? attribute.sourceSpan,
    );
    this.scope.addStatement(declareVariable(id, type));
    id.addParseSpanInfo(attribute.keySpan ?? attribute.sourceSpan);
    const expression = new TcbExpr(`(${value})`).addParseSpanInfo(attribute.sourceSpan);
    this.scope.addStatement(
      new TcbExpr(`${id.print()} = ${expression.print()}`).addParseSpanInfo(attribute.sourceSpan),
    );
  }
}

function isInterpolation(value: AST): boolean {
  return (
    value instanceof Interpolation ||
    (value instanceof ASTWithSource && value.ast instanceof Interpolation)
  );
}
