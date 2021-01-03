/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PartialEvaluator} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {reflectObjectLiteral, TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import * as ts from 'typescript';

import {ImportManager} from '../../utils/import_manager';
import {getAngularDecorators, NgDecorator} from '../../utils/ng_decorators';
import {findBaseClassDeclarations} from '../../utils/typescript/find_base_classes';
import {unwrapExpression} from '../../utils/typescript/functions';
import {getPropertyNameText} from '../../utils/typescript/property_name';

import {UpdateRecorder} from './update_recorder';

/**
 * Set of known decorators that indicate that the current class needs a directive
 * definition. These decorators are always specific to directives.
 */
const DIRECTIVE_FIELD_DECORATORS = new Set([
  'Input', 'Output', 'ViewChild', 'ViewChildren', 'ContentChild', 'ContentChildren', 'HostBinding',
  'HostListener'
]);

/**
 * Set of known lifecycle hooks that indicate that the current class needs a directive
 * definition. These lifecycle hooks are always specific to directives.
 */
const DIRECTIVE_LIFECYCLE_HOOKS = new Set([
  'ngOnChanges', 'ngOnInit', 'ngDoCheck', 'ngAfterViewInit', 'ngAfterViewChecked',
  'ngAfterContentInit', 'ngAfterContentChecked'
]);

/**
 * Set of known lifecycle hooks that indicate that a given class uses Angular
 * features, but it's ambiguous whether it is a directive or service.
 */
const AMBIGUOUS_LIFECYCLE_HOOKS = new Set(['ngOnDestroy']);

/** Describes how a given class is used in the context of Angular. */
enum InferredKind {
  DIRECTIVE,
  AMBIGUOUS,
  UNKNOWN,
}

/** Describes possible types of Angular declarations. */
enum DeclarationType {
  DIRECTIVE,
  COMPONENT,
  ABSTRACT_DIRECTIVE,
  PIPE,
  INJECTABLE,
}

/** Analyzed class declaration. */
interface AnalyzedClass {
  /** Type of declaration that is determined through an applied decorator. */
  decoratedType: DeclarationType|null;
  /** Inferred class kind in terms of Angular. */
  inferredKind: InferredKind;
}

interface AnalysisFailure {
  node: ts.Node;
  message: string;
}

/** TODO message that is added to ambiguous classes using Angular features. */
const AMBIGUOUS_CLASS_TODO = 'Add Angular decorator.';

export class UndecoratedClassesWithDecoratedFieldsTransform {
  private printer = ts.createPrinter();
  private importManager = new ImportManager(this.getUpdateRecorder, this.printer);
  private reflectionHost = new TypeScriptReflectionHost(this.typeChecker);
  private partialEvaluator = new PartialEvaluator(this.reflectionHost, this.typeChecker, null);

  constructor(
      private typeChecker: ts.TypeChecker,
      private getUpdateRecorder: (sf: ts.SourceFile) => UpdateRecorder) {}

  /**
   * Migrates the specified source files. The transform adds the abstract `@Directive`
   * decorator to undecorated classes that use Angular features. Class members which
   * are decorated with any Angular decorator, or class members for lifecycle hooks are
   * indicating that a given class uses Angular features. https://hackmd.io/vuQfavzfRG6KUCtU7oK_EA
   */
  migrate(sourceFiles: ts.SourceFile[]): AnalysisFailure[] {
    const {detectedAbstractDirectives, ambiguousClasses} =
        this._findUndecoratedAbstractDirectives(sourceFiles);

    detectedAbstractDirectives.forEach(node => {
      const sourceFile = node.getSourceFile();
      const recorder = this.getUpdateRecorder(sourceFile);
      const directiveExpr =
          this.importManager.addImportToSourceFile(sourceFile, 'Directive', '@angular/core');
      const decoratorExpr = ts.createDecorator(ts.createCall(directiveExpr, undefined, undefined));
      recorder.addClassDecorator(
          node, this.printer.printNode(ts.EmitHint.Unspecified, decoratorExpr, sourceFile));
    });

    // Ambiguous classes clearly use Angular features, but the migration is unable to
    // determine whether the class is used as directive, service or pipe. The migration
    // could potentially determine the type by checking NgModule definitions or inheritance
    // of other known declarations, but this is out of scope and a TODO/failure is sufficient.
    return Array.from(ambiguousClasses).reduce((failures, node) => {
      // If the class has been reported as ambiguous before, skip adding a TODO and
      // printing an error. A class could be visited multiple times when it's part
      // of multiple build targets in the CLI project.
      if (this._hasBeenReportedAsAmbiguous(node)) {
        return failures;
      }

      const sourceFile = node.getSourceFile();
      const recorder = this.getUpdateRecorder(sourceFile);

      // Add a TODO to the class that uses Angular features but is not decorated.
      recorder.addClassTodo(node, AMBIGUOUS_CLASS_TODO);

      // Add an error for the class that will be printed in the `ng update` output.
      return failures.concat({
        node,
        message: 'Class uses Angular features but cannot be migrated automatically. Please ' +
            'add an appropriate Angular decorator.'
      });
    }, [] as AnalysisFailure[]);
  }

  /** Records all changes that were made in the import manager. */
  recordChanges() {
    this.importManager.recordChanges();
  }

  /**
   * Finds undecorated abstract directives in the specified source files. Also returns
   * a set of undecorated classes which could not be detected as guaranteed abstract
   * directives. Those are ambiguous and could be either Directive, Pipe or service.
   */
  private _findUndecoratedAbstractDirectives(sourceFiles: ts.SourceFile[]) {
    const ambiguousClasses = new Set<ts.ClassDeclaration>();
    const declarations = new WeakMap<ts.ClassDeclaration, DeclarationType>();
    const detectedAbstractDirectives = new Set<ts.ClassDeclaration>();
    const undecoratedClasses = new Set<ts.ClassDeclaration>();

    const visitNode = (node: ts.Node) => {
      node.forEachChild(visitNode);
      if (!ts.isClassDeclaration(node)) {
        return;
      }
      const {inferredKind, decoratedType} = this._analyzeClassDeclaration(node);

      if (decoratedType !== null) {
        declarations.set(node, decoratedType);
        return;
      }

      if (inferredKind === InferredKind.DIRECTIVE) {
        detectedAbstractDirectives.add(node);
      } else if (inferredKind === InferredKind.AMBIGUOUS) {
        ambiguousClasses.add(node);
      } else {
        undecoratedClasses.add(node);
      }
    };

    sourceFiles.forEach(sourceFile => sourceFile.forEachChild(visitNode));

    /**
     * Checks the inheritance of the given set of classes. It removes classes from the
     * detected abstract directives set when they inherit from a non-abstract Angular
     * declaration. e.g. an abstract directive can never extend from a component.
     *
     * If a class inherits from an abstract directive though, we will migrate them too
     * as derived classes also need to be decorated. This has been done for a simpler mental
     * model and reduced complexity in the Angular compiler. See migration plan document.
     */
    const checkInheritanceOfClasses = (classes: Set<ts.ClassDeclaration>) => {
      classes.forEach(node => {
        for (const {node: baseClass} of findBaseClassDeclarations(node, this.typeChecker)) {
          if (!declarations.has(baseClass)) {
            continue;
          }
          // If the undecorated class inherits from an abstract directive, always migrate it.
          // Derived undecorated classes of abstract directives are always also considered
          // abstract directives and need to be decorated too. This is necessary as otherwise
          // the inheritance chain cannot be resolved by the Angular compiler. e.g. when it
          // flattens directive metadata for type checking. In the other case, we never want
          // to migrate a class if it extends from a non-abstract Angular declaration. That
          // is an unsupported pattern as of v9 and was previously handled with the
          // `undecorated-classes-with-di` migration (which copied the inherited decorator).
          if (declarations.get(baseClass) === DeclarationType.ABSTRACT_DIRECTIVE) {
            detectedAbstractDirectives.add(node);
          } else {
            detectedAbstractDirectives.delete(node);
          }
          ambiguousClasses.delete(node);
          break;
        }
      });
    };

    // Check inheritance of any detected abstract directive. We want to remove
    // classes that are not eligible abstract directives due to inheritance. i.e.
    // if a class extends from a component, it cannot be a derived abstract directive.
    checkInheritanceOfClasses(detectedAbstractDirectives);
    // Update the class declarations to reflect the detected abstract directives. This is
    // then used later when we check for undecorated classes that inherit from an abstract
    // directive and need to be decorated.
    detectedAbstractDirectives.forEach(
        n => declarations.set(n, DeclarationType.ABSTRACT_DIRECTIVE));
    // Check ambiguous and undecorated classes if they inherit from an abstract directive.
    // If they do, we want to migrate them too. See function definition for more details.
    checkInheritanceOfClasses(ambiguousClasses);
    checkInheritanceOfClasses(undecoratedClasses);

    return {detectedAbstractDirectives, ambiguousClasses};
  }

  /**
   * Analyzes the given class declaration by determining whether the class
   * is a directive, is an abstract directive, or uses Angular features.
   */
  private _analyzeClassDeclaration(node: ts.ClassDeclaration): AnalyzedClass {
    const ngDecorators = node.decorators && getAngularDecorators(this.typeChecker, node.decorators);
    const inferredKind = this._determineClassKind(node);
    if (ngDecorators === undefined || ngDecorators.length === 0) {
      return {decoratedType: null, inferredKind};
    }
    const directiveDecorator = ngDecorators.find(({name}) => name === 'Directive');
    const componentDecorator = ngDecorators.find(({name}) => name === 'Component');
    const pipeDecorator = ngDecorators.find(({name}) => name === 'Pipe');
    const injectableDecorator = ngDecorators.find(({name}) => name === 'Injectable');
    const isAbstractDirective =
        directiveDecorator !== undefined && this._isAbstractDirective(directiveDecorator);

    let decoratedType: DeclarationType|null = null;
    if (isAbstractDirective) {
      decoratedType = DeclarationType.ABSTRACT_DIRECTIVE;
    } else if (componentDecorator !== undefined) {
      decoratedType = DeclarationType.COMPONENT;
    } else if (directiveDecorator !== undefined) {
      decoratedType = DeclarationType.DIRECTIVE;
    } else if (pipeDecorator !== undefined) {
      decoratedType = DeclarationType.PIPE;
    } else if (injectableDecorator !== undefined) {
      decoratedType = DeclarationType.INJECTABLE;
    }
    return {decoratedType, inferredKind};
  }

  /**
   * Checks whether the given decorator resolves to an abstract directive. An directive is
   * considered "abstract" if there is no selector specified.
   */
  private _isAbstractDirective({node}: NgDecorator): boolean {
    const metadataArgs = node.expression.arguments;
    if (metadataArgs.length === 0) {
      return true;
    }
    const metadataExpr = unwrapExpression(metadataArgs[0]);
    if (!ts.isObjectLiteralExpression(metadataExpr)) {
      return false;
    }
    const metadata = reflectObjectLiteral(metadataExpr);
    if (!metadata.has('selector')) {
      return false;
    }
    const selector = this.partialEvaluator.evaluate(metadata.get('selector')!);
    return selector == null;
  }

  /**
   * Determines the kind of a given class in terms of Angular. The method checks
   * whether the given class has members that indicate the use of Angular features.
   * e.g. lifecycle hooks or decorated members like `@Input` or `@Output` are
   * considered Angular features..
   */
  private _determineClassKind(node: ts.ClassDeclaration): InferredKind {
    let usage = InferredKind.UNKNOWN;

    for (const member of node.members) {
      const propertyName = member.name !== undefined ? getPropertyNameText(member.name) : null;

      // If the class declares any of the known directive lifecycle hooks, we can
      // immediately exit the loop as the class is guaranteed to be a directive.
      if (propertyName !== null && DIRECTIVE_LIFECYCLE_HOOKS.has(propertyName)) {
        return InferredKind.DIRECTIVE;
      }

      const ngDecorators = member.decorators !== undefined ?
          getAngularDecorators(this.typeChecker, member.decorators) :
          [];
      for (const {name} of ngDecorators) {
        if (DIRECTIVE_FIELD_DECORATORS.has(name)) {
          return InferredKind.DIRECTIVE;
        }
      }

      // If the class declares any of the lifecycle hooks that do not guarantee that
      // the given class is a directive, update the kind and continue looking for other
      // members that would unveil a more specific kind (i.e. being a directive).
      if (propertyName !== null && AMBIGUOUS_LIFECYCLE_HOOKS.has(propertyName)) {
        usage = InferredKind.AMBIGUOUS;
      }
    }

    return usage;
  }

  /**
   * Checks whether a given class has been reported as ambiguous in previous
   * migration run. e.g. when build targets are migrated first, and then test
   * targets that have an overlap with build source files, the same class
   * could be detected as ambiguous.
   */
  private _hasBeenReportedAsAmbiguous(node: ts.ClassDeclaration): boolean {
    const sourceFile = node.getSourceFile();
    const leadingComments = ts.getLeadingCommentRanges(sourceFile.text, node.pos);
    if (leadingComments === undefined) {
      return false;
    }
    return leadingComments.some(
        ({kind, pos, end}) => kind === ts.SyntaxKind.SingleLineCommentTrivia &&
            sourceFile.text.substring(pos, end).includes(`TODO: ${AMBIGUOUS_CLASS_TODO}`));
  }
}
