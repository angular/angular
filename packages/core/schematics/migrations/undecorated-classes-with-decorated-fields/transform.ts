/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
enum ClassKind {
  DIRECTIVE,
  AMBIGUOUS,
  UNKNOWN,
}

/** Analyzed class declaration. */
interface AnalyzedClass {
  /** Whether the class is decorated with @Directive or @Component. */
  isDirectiveOrComponent: boolean;
  /** Whether the class is an abstract directive. */
  isAbstractDirective: boolean;
  /** Kind of the given class in terms of Angular. */
  kind: ClassKind;
}

interface AnalysisFailure {
  node: ts.Node;
  message: string;
}

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
    const {result, ambiguous} = this._findUndecoratedAbstractDirectives(sourceFiles);


    result.forEach(node => {
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
    return Array.from(ambiguous).reduce((failures, node) => {
      const sourceFile = node.getSourceFile();
      const recorder = this.getUpdateRecorder(sourceFile);

      // Add a TODO to the class that uses Angular features but is not decorated.
      recorder.addClassTodo(node, `Add Angular decorator.`);

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
    const result = new Set<ts.ClassDeclaration>();
    const undecoratedClasses = new Set<ts.ClassDeclaration>();
    const nonAbstractDirectives = new WeakSet<ts.ClassDeclaration>();
    const abstractDirectives = new WeakSet<ts.ClassDeclaration>();
    const ambiguous = new Set<ts.ClassDeclaration>();

    const visitNode = (node: ts.Node) => {
      node.forEachChild(visitNode);
      if (!ts.isClassDeclaration(node)) {
        return;
      }
      const {isDirectiveOrComponent, isAbstractDirective, kind} =
          this._analyzeClassDeclaration(node);
      if (isDirectiveOrComponent) {
        if (isAbstractDirective) {
          abstractDirectives.add(node);
        } else {
          nonAbstractDirectives.add(node);
        }
      } else if (kind === ClassKind.DIRECTIVE) {
        abstractDirectives.add(node);
        result.add(node);
      } else {
        if (kind === ClassKind.AMBIGUOUS) {
          ambiguous.add(node);
        }
        undecoratedClasses.add(node);
      }
    };

    sourceFiles.forEach(sourceFile => sourceFile.forEachChild(visitNode));

    // We collected all undecorated class declarations which inherit from abstract directives.
    // For such abstract directives, the derived classes also need to be migrated.
    undecoratedClasses.forEach(node => {
      for (const {node: baseClass} of findBaseClassDeclarations(node, this.typeChecker)) {
        // If the undecorated class inherits from a non-abstract directive, skip the current
        // class. We do this because undecorated classes which inherit metadata from non-abstract
        // directives are handled in the `undecorated-classes-with-di` migration that copies
        // inherited metadata into an explicit decorator.
        if (nonAbstractDirectives.has(baseClass)) {
          break;
        } else if (abstractDirectives.has(baseClass)) {
          result.add(node);
          // In case the undecorated class previously could not be detected as directive,
          // remove it from the ambiguous set as we now know that it's a guaranteed directive.
          ambiguous.delete(node);
          break;
        }
      }
    });

    return {result, ambiguous};
  }

  /**
   * Analyzes the given class declaration by determining whether the class
   * is a directive, is an abstract directive, or uses Angular features.
   */
  private _analyzeClassDeclaration(node: ts.ClassDeclaration): AnalyzedClass {
    const ngDecorators = node.decorators && getAngularDecorators(this.typeChecker, node.decorators);
    const kind = this._determineClassKind(node);
    if (ngDecorators === undefined || ngDecorators.length === 0) {
      return {isDirectiveOrComponent: false, isAbstractDirective: false, kind};
    }
    const directiveDecorator = ngDecorators.find(({name}) => name === 'Directive');
    const componentDecorator = ngDecorators.find(({name}) => name === 'Component');
    const isAbstractDirective =
        directiveDecorator !== undefined && this._isAbstractDirective(directiveDecorator);
    return {
      isDirectiveOrComponent: !!directiveDecorator || !!componentDecorator,
      isAbstractDirective,
      kind,
    };
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
  private _determineClassKind(node: ts.ClassDeclaration): ClassKind {
    let usage = ClassKind.UNKNOWN;

    for (const member of node.members) {
      const propertyName = member.name !== undefined ? getPropertyNameText(member.name) : null;

      // If the class declares any of the known directive lifecycle hooks, we can
      // immediately exit the loop as the class is guaranteed to be a directive.
      if (propertyName !== null && DIRECTIVE_LIFECYCLE_HOOKS.has(propertyName)) {
        return ClassKind.DIRECTIVE;
      }

      const ngDecorators = member.decorators !== undefined ?
          getAngularDecorators(this.typeChecker, member.decorators) :
          [];
      for (const {name} of ngDecorators) {
        if (DIRECTIVE_FIELD_DECORATORS.has(name)) {
          return ClassKind.DIRECTIVE;
        }
      }

      // If the class declares any of the lifecycle hooks that do not guarantee that
      // the given class is a directive, update the kind and continue looking for other
      // members that would unveil a more specific kind (i.e. being a directive).
      if (propertyName !== null && AMBIGUOUS_LIFECYCLE_HOOKS.has(propertyName)) {
        usage = ClassKind.AMBIGUOUS;
      }
    }

    return usage;
  }
}
