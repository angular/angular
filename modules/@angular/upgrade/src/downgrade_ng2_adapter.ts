/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, ComponentFactory, ComponentRef, EventEmitter, Injector, OnChanges, ReflectiveInjector, SimpleChange, SimpleChanges} from '@angular/core';

import * as angular from './angular_js';
import {NG1_SCOPE} from './constants';
import {ComponentInfo} from './metadata';

const INITIAL_VALUE = {
  __UNINITIALIZED__: true
};

export class DowngradeNg2ComponentAdapter {
  component: any = null;
  inputChangeCount: number = 0;
  inputChanges: SimpleChanges = null;
  componentRef: ComponentRef<any> = null;
  changeDetector: ChangeDetectorRef = null;
  componentScope: angular.IScope;

  constructor(
      private info: ComponentInfo, private element: angular.IAugmentedJQuery,
      private attrs: angular.IAttributes, private scope: angular.IScope,
      private parentInjector: Injector, private parse: angular.IParseService,
      private componentFactory: ComponentFactory<any>) {
    this.componentScope = scope.$new();
  }

  bootstrapNg2(projectableNodes: Node[][]) {
    const childInjector = ReflectiveInjector.resolveAndCreate(
        [{provide: NG1_SCOPE, useValue: this.componentScope}], this.parentInjector);

    this.componentRef =
        this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
    this.changeDetector = this.componentRef.changeDetectorRef;
    this.component = this.componentRef.instance;
  }

  setupInputs(): void {
    const attrs = this.attrs;
    const inputs = this.info.inputs || [];
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      let expr: any /** TODO #9100 */ = null;
      if (attrs.hasOwnProperty(input.attr)) {
        const observeFn = ((prop: any /** TODO #9100 */) => {
          let prevValue = INITIAL_VALUE;
          return (value: any /** TODO #9100 */) => {
            if (this.inputChanges !== null) {
              this.inputChangeCount++;
              this.inputChanges[prop] = new SimpleChange(
                  value, prevValue === INITIAL_VALUE ? value : prevValue,
                  prevValue === INITIAL_VALUE);
              prevValue = value;
            }
            this.component[prop] = value;
          };
        })(input.prop);
        attrs.$observe(input.attr, observeFn);
      } else if (attrs.hasOwnProperty(input.bindAttr)) {
        expr = (attrs as any /** TODO #9100 */)[input.bindAttr];
      } else if (attrs.hasOwnProperty(input.bracketAttr)) {
        expr = (attrs as any /** TODO #9100 */)[input.bracketAttr];
      } else if (attrs.hasOwnProperty(input.bindonAttr)) {
        expr = (attrs as any /** TODO #9100 */)[input.bindonAttr];
      } else if (attrs.hasOwnProperty(input.bracketParenAttr)) {
        expr = (attrs as any /** TODO #9100 */)[input.bracketParenAttr];
      }
      if (expr != null) {
        const watchFn =
            ((prop: any /** TODO #9100 */) => (
                 value: any /** TODO #9100 */, prevValue: any /** TODO #9100 */) => {
              if (this.inputChanges != null) {
                this.inputChangeCount++;
                this.inputChanges[prop] = new SimpleChange(prevValue, value, prevValue === value);
              }
              this.component[prop] = value;
            })(input.prop);
        this.componentScope.$watch(expr, watchFn);
      }
    }

    const prototype = this.info.type.prototype;
    if (prototype && (<OnChanges>prototype).ngOnChanges) {
      // Detect: OnChanges interface
      this.inputChanges = {};
      this.componentScope.$watch(() => this.inputChangeCount, () => {
        const inputChanges = this.inputChanges;
        this.inputChanges = {};
        (<OnChanges>this.component).ngOnChanges(inputChanges);
      });
    }
    this.componentScope.$watch(() => this.changeDetector && this.changeDetector.detectChanges());
  }

  setupOutputs() {
    const attrs = this.attrs;
    const outputs = this.info.outputs || [];
    for (let j = 0; j < outputs.length; j++) {
      const output = outputs[j];
      let expr: any /** TODO #9100 */ = null;
      let assignExpr = false;

      const bindonAttr =
          output.bindonAttr ? output.bindonAttr.substring(0, output.bindonAttr.length - 6) : null;
      const bracketParenAttr = output.bracketParenAttr ?
          `[(${output.bracketParenAttr.substring(2, output.bracketParenAttr.length - 8)})]` :
          null;

      if (attrs.hasOwnProperty(output.onAttr)) {
        expr = (attrs as any /** TODO #9100 */)[output.onAttr];
      } else if (attrs.hasOwnProperty(output.parenAttr)) {
        expr = (attrs as any /** TODO #9100 */)[output.parenAttr];
      } else if (attrs.hasOwnProperty(bindonAttr)) {
        expr = (attrs as any /** TODO #9100 */)[bindonAttr];
        assignExpr = true;
      } else if (attrs.hasOwnProperty(bracketParenAttr)) {
        expr = (attrs as any /** TODO #9100 */)[bracketParenAttr];
        assignExpr = true;
      }

      if (expr != null && assignExpr != null) {
        const getter = this.parse(expr);
        const setter = getter.assign;
        if (assignExpr && !setter) {
          throw new Error(`Expression '${expr}' is not assignable!`);
        }
        const emitter = this.component[output.prop] as EventEmitter<any>;
        if (emitter) {
          emitter.subscribe({
            next: assignExpr ?
                ((setter: any) => (v: any /** TODO #9100 */) => setter(this.scope, v))(setter) :
                ((getter: any) => (v: any /** TODO #9100 */) =>
                     getter(this.scope, {$event: v}))(getter)
          });
        } else {
          throw new Error(`Missing emitter '${output.prop}' on component '${this.info.selector}'!`);
        }
      }
    }
  }

  registerCleanup() {
    this.element.bind('$destroy', () => {
      this.componentScope.$destroy();
      this.componentRef.destroy();
    });
  }
}
