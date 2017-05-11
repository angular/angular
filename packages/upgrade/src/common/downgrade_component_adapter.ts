/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, ComponentFactory, ComponentRef, EventEmitter, Injector, OnChanges, ReflectiveInjector, SimpleChange, SimpleChanges, Type} from '@angular/core';

import * as angular from './angular1';
import {PropertyBinding} from './component_info';
import {$SCOPE} from './constants';
import {getAttributesAsArray, getComponentName, hookupNgModel, strictEquals} from './util';

const INITIAL_VALUE = {
  __UNINITIALIZED__: true
};

export class DowngradeComponentAdapter {
  private inputChangeCount: number = 0;
  private inputChanges: SimpleChanges|null = null;
  private componentScope: angular.IScope;
  private componentRef: ComponentRef<any>|null = null;
  private component: any = null;
  private changeDetector: ChangeDetectorRef|null = null;

  constructor(
      private id: string, private element: angular.IAugmentedJQuery,
      private attrs: angular.IAttributes, private scope: angular.IScope,
      private ngModel: angular.INgModelController, private parentInjector: Injector,
      private $injector: angular.IInjectorService, private $compile: angular.ICompileService,
      private $parse: angular.IParseService, private componentFactory: ComponentFactory<any>) {
    (this.element[0] as any).id = id;
    this.componentScope = scope.$new();
  }

  compileContents(): Node[][] {
    const compiledProjectableNodes: Node[][] = [];
    const projectableNodes: Node[][] = this.groupProjectableNodes();
    const linkFns = projectableNodes.map(nodes => this.$compile(nodes));

    this.element.empty !();

    linkFns.forEach(linkFn => {
      linkFn(this.scope, (clone: Node[]) => {
        compiledProjectableNodes.push(clone);
        this.element.append !(clone);
      });
    });

    return compiledProjectableNodes;
  }

  createComponent(projectableNodes: Node[][]) {
    const childInjector = ReflectiveInjector.resolveAndCreate(
        [{provide: $SCOPE, useValue: this.componentScope}], this.parentInjector);

    this.componentRef =
        this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
    this.changeDetector = this.componentRef.changeDetectorRef;
    this.component = this.componentRef.instance;

    hookupNgModel(this.ngModel, this.component);
  }

  setupInputs(): void {
    const attrs = this.attrs;
    const inputs = this.componentFactory.inputs || [];
    for (let i = 0; i < inputs.length; i++) {
      const input = new PropertyBinding(inputs[i].propName, inputs[i].templateName);
      let expr: any /** TODO #9100 */ = null;

      if (attrs.hasOwnProperty(input.attr)) {
        const observeFn = (prop => {
          let prevValue = INITIAL_VALUE;
          return (currValue: any) => {
            // Initially, both `$observe()` and `$watch()` will call this function.
            if (!strictEquals(prevValue, currValue)) {
              if (prevValue === INITIAL_VALUE) {
                prevValue = currValue;
              }

              this.updateInput(prop, prevValue, currValue);
              prevValue = currValue;
            }
          };
        })(input.prop);
        attrs.$observe(input.attr, observeFn);

        // Use `$watch()` (in addition to `$observe()`) in order to initialize the input  in time
        // for `ngOnChanges()`. This is necessary if we are already in a `$digest`, which means that
        // `ngOnChanges()` (which is called by a watcher) will run before the `$observe()` callback.
        let unwatch: any = this.componentScope.$watch(() => {
          unwatch();
          unwatch = null;
          observeFn((attrs as any)[input.attr]);
        });

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
            (prop => (currValue: any, prevValue: any) =>
                 this.updateInput(prop, prevValue, currValue))(input.prop);
        this.componentScope.$watch(expr, watchFn);
      }
    }

    const prototype = this.componentFactory.componentType.prototype;
    if (prototype && (<OnChanges>prototype).ngOnChanges) {
      // Detect: OnChanges interface
      this.inputChanges = {};
      this.componentScope.$watch(() => this.inputChangeCount, () => {
        const inputChanges = this.inputChanges;
        this.inputChanges = {};
        (<OnChanges>this.component).ngOnChanges(inputChanges !);
      });
    }
    this.componentScope.$watch(() => this.changeDetector && this.changeDetector.detectChanges());
  }

  setupOutputs() {
    const attrs = this.attrs;
    const outputs = this.componentFactory.outputs || [];
    for (let j = 0; j < outputs.length; j++) {
      const output = new PropertyBinding(outputs[j].propName, outputs[j].templateName);
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
      } else if (attrs.hasOwnProperty(bindonAttr !)) {
        expr = (attrs as any /** TODO #9100 */)[bindonAttr !];
        assignExpr = true;
      } else if (attrs.hasOwnProperty(bracketParenAttr !)) {
        expr = (attrs as any /** TODO #9100 */)[bracketParenAttr !];
        assignExpr = true;
      }

      if (expr != null && assignExpr != null) {
        const getter = this.$parse(expr);
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
                     getter(this.scope, {'$event': v}))(getter)
          });
        } else {
          throw new Error(
              `Missing emitter '${output.prop}' on component '${getComponentName(this.componentFactory.componentType)}'!`);
        }
      }
    }
  }

  registerCleanup() {
    this.element.bind !('$destroy', () => {
      this.componentScope.$destroy();
      this.componentRef !.destroy();
    });
  }

  getInjector(): Injector { return this.componentRef ! && this.componentRef !.injector; }

  private updateInput(prop: string, prevValue: any, currValue: any) {
    if (this.inputChanges) {
      this.inputChangeCount++;
      this.inputChanges[prop] = new SimpleChange(prevValue, currValue, prevValue === currValue);
    }

    this.component[prop] = currValue;
  }

  groupProjectableNodes() {
    let ngContentSelectors = this.componentFactory.ngContentSelectors;
    return groupNodesBySelector(ngContentSelectors, this.element.contents !());
  }
}

/**
 * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
 */
export function groupNodesBySelector(ngContentSelectors: string[], nodes: Node[]): Node[][] {
  const projectableNodes: Node[][] = [];
  let wildcardNgContentIndex: number;

  for (let i = 0, ii = ngContentSelectors.length; i < ii; ++i) {
    projectableNodes[i] = [];
  }

  for (let j = 0, jj = nodes.length; j < jj; ++j) {
    const node = nodes[j];
    const ngContentIndex = findMatchingNgContentIndex(node, ngContentSelectors);
    if (ngContentIndex != null) {
      projectableNodes[ngContentIndex].push(node);
    }
  }

  return projectableNodes;
}

function findMatchingNgContentIndex(element: any, ngContentSelectors: string[]): number|null {
  const ngContentIndices: number[] = [];
  let wildcardNgContentIndex: number = -1;
  for (let i = 0; i < ngContentSelectors.length; i++) {
    const selector = ngContentSelectors[i];
    if (selector === '*') {
      wildcardNgContentIndex = i;
    } else {
      if (matchesSelector(element, selector)) {
        ngContentIndices.push(i);
      }
    }
  }
  ngContentIndices.sort();

  if (wildcardNgContentIndex !== -1) {
    ngContentIndices.push(wildcardNgContentIndex);
  }
  return ngContentIndices.length ? ngContentIndices[0] : null;
}

let _matches: (this: any, selector: string) => boolean;

function matchesSelector(el: any, selector: string): boolean {
  if (!_matches) {
    const elProto = <any>Element.prototype;
    _matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector ||
        elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
  }
  return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
}
