/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool, EMPTY_SOURCE_SPAN, R3BaseRefMetaData, WrappedNodeExpr, compileBaseDefFromMetadata, makeBindingParser} from '@angular/compiler';

import {PartialEvaluator} from '../../partial_evaluator';
import {ClassDeclaration, ClassMember, Decorator, ReflectionHost} from '../../reflection';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence} from '../../transform';

import {extractHostBindings, queriesFromFields} from './directive';
import {isAngularDecorator} from './util';

function containsNgTopLevelDecorator(decorators: Decorator[] | null, isCore: boolean): boolean {
  if (!decorators) {
    return false;
  }
  return decorators.some(
      decorator => isAngularDecorator(decorator, 'Component', isCore) ||
          isAngularDecorator(decorator, 'Directive', isCore) ||
          isAngularDecorator(decorator, 'NgModule', isCore));
}

export class BaseDefDecoratorHandler implements
    DecoratorHandler<R3BaseRefMetaData, R3BaseRefDecoratorDetection> {
  constructor(
      private reflector: ReflectionHost, private evaluator: PartialEvaluator,
      private isCore: boolean) {}

  readonly precedence = HandlerPrecedence.WEAK;

  detect(node: ClassDeclaration, decorators: Decorator[]|null):
      DetectResult<R3BaseRefDecoratorDetection>|undefined {
    if (containsNgTopLevelDecorator(decorators, this.isCore)) {
      // If the class is already decorated by @Component or @Directive let that
      // DecoratorHandler handle this. BaseDef is unnecessary.
      return undefined;
    }

    let result: R3BaseRefDecoratorDetection|undefined = undefined;

    this.reflector.getMembersOfClass(node).forEach(property => {
      const {decorators} = property;
      if (!decorators) {
        return;
      }
      for (const decorator of decorators) {
        if (isAngularDecorator(decorator, 'Input', this.isCore)) {
          result = result || {};
          const inputs = result.inputs = result.inputs || [];
          inputs.push({decorator, property});
        } else if (isAngularDecorator(decorator, 'Output', this.isCore)) {
          result = result || {};
          const outputs = result.outputs = result.outputs || [];
          outputs.push({decorator, property});
        } else if (
            isAngularDecorator(decorator, 'ViewChild', this.isCore) ||
            isAngularDecorator(decorator, 'ViewChildren', this.isCore)) {
          result = result || {};
          const viewQueries = result.viewQueries = result.viewQueries || [];
          viewQueries.push({member: property, decorators});
        } else if (
            isAngularDecorator(decorator, 'ContentChild', this.isCore) ||
            isAngularDecorator(decorator, 'ContentChildren', this.isCore)) {
          result = result || {};
          const queries = result.queries = result.queries || [];
          queries.push({member: property, decorators});
        } else if (
            isAngularDecorator(decorator, 'HostBinding', this.isCore) ||
            isAngularDecorator(decorator, 'HostListener', this.isCore)) {
          result = result || {};
          const host = result.host = result.host || [];
          host.push(property);
        }
      }
    });

    if (result !== undefined) {
      return {
        metadata: result,
        trigger: null,
      };
    } else {
      return undefined;
    }
  }

  analyze(node: ClassDeclaration, metadata: R3BaseRefDecoratorDetection):
      AnalysisOutput<R3BaseRefMetaData> {
    const analysis: R3BaseRefMetaData = {
      name: node.name.text,
      type: new WrappedNodeExpr(node.name),
      typeSourceSpan: EMPTY_SOURCE_SPAN,
    };

    if (metadata.inputs) {
      const inputs = analysis.inputs = {} as{[key: string]: string | [string, string]};
      metadata.inputs.forEach(({decorator, property}) => {
        const propName = property.name;
        const args = decorator.args;
        let value: string|[string, string];
        if (args && args.length > 0) {
          const resolvedValue = this.evaluator.evaluate(args[0]);
          if (typeof resolvedValue !== 'string') {
            throw new TypeError('Input alias does not resolve to a string value');
          }
          value = [resolvedValue, propName];
        } else {
          value = propName;
        }
        inputs[propName] = value;
      });
    }

    if (metadata.outputs) {
      const outputs = analysis.outputs = {} as{[key: string]: string};
      metadata.outputs.forEach(({decorator, property}) => {
        const propName = property.name;
        const args = decorator.args;
        let value: string;
        if (args && args.length > 0) {
          const resolvedValue = this.evaluator.evaluate(args[0]);
          if (typeof resolvedValue !== 'string') {
            throw new TypeError('Output alias does not resolve to a string value');
          }
          value = resolvedValue;
        } else {
          value = propName;
        }
        outputs[propName] = value;
      });
    }

    if (metadata.viewQueries) {
      analysis.viewQueries =
          queriesFromFields(metadata.viewQueries, this.reflector, this.evaluator);
    }

    if (metadata.queries) {
      analysis.queries = queriesFromFields(metadata.queries, this.reflector, this.evaluator);
    }

    if (metadata.host) {
      analysis.host = extractHostBindings(
          metadata.host, this.evaluator, this.isCore ? undefined : '@angular/core');
    }

    return {analysis};
  }

  compile(node: ClassDeclaration, analysis: R3BaseRefMetaData, pool: ConstantPool):
      CompileResult[]|CompileResult {
    const {expression, type} = compileBaseDefFromMetadata(analysis, pool, makeBindingParser());

    return {
      name: 'ngBaseDef',
      initializer: expression, type,
      statements: [],
    };
  }
}

export interface R3BaseRefDecoratorDetection {
  inputs?: {property: ClassMember, decorator: Decorator}[];
  outputs?: {property: ClassMember, decorator: Decorator}[];
  viewQueries?: {member: ClassMember, decorators: Decorator[]}[];
  queries?: {member: ClassMember, decorators: Decorator[]}[];
  host?: ClassMember[];
}
