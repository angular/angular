/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {makeDiagnostic, makeRelatedInformation} from '../../diagnostics/src/error';
import {ErrorCode} from '../../diagnostics/src/error_code';
import {readBaseClass} from '../../inheritance/src/base_class';
import {MetadataReader} from '../../metadata/src/api';
import {InjectableClassRegistry} from '../../metadata/src/registry';
import {PartialEvaluator} from '../../partial_evaluator';
import {ClassDeclaration, ClassMember, ClassMemberKind, Decorator, Import, ReflectionHost} from '../../reflection';

import {DetectedAngularFeature, KnownFieldDecoratorFeature, KnownLifecycleHookFeature} from './features';

/** List of known decorators that indicate that a given class is a directive. */
const DIRECTIVE_FIELD_DECORATORS = [
  'Input', 'Output', 'ViewChild', 'ViewChildren', 'ContentChild', 'ContentChildren', 'HostBinding',
  'HostListener'
];

/** Set of known lifecycle hooks that indicate that a given class is a directive. */
const DIRECTIVE_LIFECYCLE_HOOKS = new Set([
  'ngOnChanges', 'ngOnInit', 'ngDoCheck', 'ngAfterViewInit', 'ngAfterViewChecked',
  'ngAfterContentInit', 'ngAfterContentChecked'
]);

/**
 * Set of known lifecycle hooks that indicate that a given class is using Angular features
 * but it's not guaranteed to be of a directive (i.e. it can also be an injectable).
 */
const AMBIGUOUS_LIFECYCLE_HOOKS = new Set(['ngOnDestroy']);


/**
 * Scanner that can detect Angular features in class declaration. It keeps track of
 * undecorated classes using Angular features so that diagnostics can be generated.
 *
 * We want to generate diagnostics for undecorated classes that use Angular features.
 * Classes are considered using Angular features if they:
 *
 *    1. Contain class members which are decorated with an Angular decorator.
 *    2. Contain class members which are known to be Angular lifecycle hooks.
 *    3. Define a constructor that is inherited by detected directives.
 */
export class UndecoratedClassesFeatureScanner {
  private undecoratedClassesWithFeature = new Map<ClassDeclaration, DetectedAngularFeature[]>();

  constructor(
      private reflector: ReflectionHost, private evaluator: PartialEvaluator,
      private injectableClassRegistry: InjectableClassRegistry,
      private metadataReader: MetadataReader, private isCore: boolean) {}

  /** Captures a feature for a given undecorated class declaration. */
  captureUndecoratedAngularClass(node: ClassDeclaration, feature: DetectedAngularFeature) {
    if (this.undecoratedClassesWithFeature.has(node)) {
      this.undecoratedClassesWithFeature.get(node)!.push(feature);
    } else {
      this.undecoratedClassesWithFeature.set(node, [feature]);
    }
  }

  /** Computes the diagnostics for undecorated classes using Angular features. */
  computeDiagnostics(): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];
    this.undecoratedClassesWithFeature.forEach((features, node) => {
      diagnostics.push(getUndecoratedClassWithAngularFeaturesDiagnostic(node, features));
    });

    return diagnostics;
  }

  /**
   * Checks if a given class uses Angular features and returns an object describing the
   * detected Angular feature if present. Classes are considered using Angular features
   * if they contain class members that are either decorated with a known Angular decorator,
   * or if they correspond to a known Angular lifecycle hook.
   */
  detectAngularFeatureInClass(node: ClassDeclaration): KnownLifecycleHookFeature
      |KnownFieldDecoratorFeature|null {
    let ambiguousLifecycleHook: ClassMember|null = null;
    for (const member of this.reflector.getMembersOfClass(node)) {
      const isMemberMethod = !member.isStatic && member.kind === ClassMemberKind.Method;
      // If the class declares any of the known directive lifecycle hooks, we can
      // immediately exit the loop as the class is guaranteed to be a directive.
      if (isMemberMethod && DIRECTIVE_LIFECYCLE_HOOKS.has(member.name)) {
        return {type: 'known-lifecycle-hook', trigger: member.node, specificTo: 'directive'};
      }
      const fieldNgDecorator = member.decorators !== null ?
          member.decorators.find(
              decorator => DIRECTIVE_FIELD_DECORATORS.some(
                  decoratorName => isAngularDecorator(decorator, decoratorName, this.isCore))) :
          undefined;
      // If the class declares any member that is decorated with an Angular decorator that is
      // specified to directives, we exit early as the class is guaranteed to be a directive.
      if (fieldNgDecorator !== undefined) {
        const decoratorNode = fieldNgDecorator.node !== null ? fieldNgDecorator.node :
                                                               fieldNgDecorator.synthesizedFor;
        return {type: 'known-field-decorator', trigger: decoratorNode, specificTo: 'directive'};
      }
      // If the class declares any of the non-directive lifecycle hooks, we keep track of it
      // and continue looking for other members that would unveil a more specific kind. i.e.
      // the class actually being a directive. This cannot be guaranteed if only ambiguous
      // lifecycle hooks were detected.
      if (isMemberMethod && AMBIGUOUS_LIFECYCLE_HOOKS.has(member.name)) {
        ambiguousLifecycleHook = member;
      }
    }
    return ambiguousLifecycleHook ?
        {type: 'known-lifecycle-hook', trigger: ambiguousLifecycleHook.node, specificTo: null} :
        null;
  }

  /**
   * Checks a given directive class declaration for an inherited constructor. If found
   * and the base class is undecorated, the detected feature is captured so that diagnostics
   * can be reported for the base class as it uses Angular features (i.e. DI).
   */
  checkDirectiveForInheritedConstructor(node: ClassDeclaration) {
    if (this.reflector.getConstructorParameters(node) !== null) {
      // If a constructor exists, then no base class definition is required on the
      // runtime side. It's legal to inherit from any class.
      return null;
    }

    // The extends clause is an expression which can be as dynamic as the user wants. Try to
    // evaluate it, but fall back on ignoring the clause if it can't be understood. This is a
    // View Engine compatibility hack: View Engine ignores 'extends' expressions that it
    // cannot understand.
    let baseClass = readBaseClass(node, this.reflector, this.evaluator);

    while (baseClass !== null) {
      if (baseClass === 'dynamic') {
        return;
      }

      // We can skip the base class if it has metadata.
      const baseClassMeta = this.metadataReader.getDirectiveMetadata(baseClass);
      if (baseClassMeta !== null) {
        return;
      }

      // If the base class has a blank constructor we can skip it since it can't be using DI.
      const baseClassConstructorParams = this.reflector.getConstructorParameters(baseClass.node);
      const newParentClass = readBaseClass(baseClass.node, this.reflector, this.evaluator);

      if (baseClassConstructorParams !== null && baseClassConstructorParams.length > 0) {
        this.captureUndecoratedAngularClass(baseClass.node, {
          type: 'dependency-injection',
          specificTo: 'directive',
          derived: node,
        });
        return;
      } else if (baseClassConstructorParams !== null || newParentClass === null) {
        // This class has a trivial constructor, or no constructor + is the
        // top of the inheritance chain, so it's okay.
        return;
      }

      // Go up the chain and continue.
      baseClass = newParentClass;
    }
  }
}

export function getUndecoratedClassWithAngularFeaturesDiagnostic(
    node: ClassDeclaration, features: DetectedAngularFeature[]): ts.Diagnostic {
  const relatedInfo: ts.DiagnosticRelatedInformation[] = [];
  let proposedDecorator = 'Angular';

  for (const f of features) {
    // In the current state, we only come across directive features, or features which
    // cannot be clearly associated with a directive. This means that in the future,
    // when we check other declarations for inherited constructors, this logic may need
    // to determine a compatible decorator for all deviants (or throw an error).
    if (f.specificTo === 'directive') {
      proposedDecorator = '@Directive';
    }

    if (f.type === 'known-field-decorator') {
      relatedInfo.push(
          makeRelatedInformation(f.trigger, 'Class member has an Angular decorator applied.'));
    } else if (f.type === 'known-lifecycle-hook' && f.trigger !== null) {
      relatedInfo.push(makeRelatedInformation(
          f.trigger, 'Class member corresponds to an Angular lifecycle hook.'));
    } else if (f.type === 'dependency-injection') {
      relatedInfo.push(makeRelatedInformation(
          f.derived,
          `Inherits constructor that uses dependency injection. Either decorate ${
              node.name.text}, or add an explicit constructor to ${f.derived.name.text}.`));
    }
  }

  const unexpectedAngularFeatureMessage = `Cannot use Angular features in an undecorated ` +
      `class. Please add an explicit ${proposedDecorator} decorator.`;

  return makeDiagnostic(
      ErrorCode.UNDECORATED_CLASS_USING_ANGULAR_FEATURES, node, unexpectedAngularFeatureMessage,
      relatedInfo);
}

function isAngularCore(decorator: Decorator): decorator is Decorator&{import: Import} {
  return decorator.import !== null && decorator.import.from === '@angular/core';
}

function isAngularDecorator(decorator: Decorator, name: string, isCore: boolean): boolean {
  if (isCore) {
    return decorator.name === name;
  } else if (isAngularCore(decorator)) {
    return decorator.import.name === name;
  }
  return false;
}
