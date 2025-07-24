/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  ChangeDetectorRef,
  ComponentFactory,
  ComponentRef,
  type EventEmitter,
  Injector,
  OnChanges,
  SimpleChange,
  SimpleChanges,
  StaticProvider,
  Testability,
  TestabilityRegistry,
  type OutputEmitterRef,
  type ɵInputSignalNode as InputSignalNode,
  ɵSIGNAL as SIGNAL,
} from '@angular/core';

import {
  IAttributes,
  IAugmentedJQuery,
  ICompileService,
  INgModelController,
  IParseService,
  IScope,
} from './angular1';
import {PropertyBinding} from './component_info';
import {$SCOPE} from './constants';
import {cleanData, getTypeName, hookupNgModel, strictEquals} from './util';

const INITIAL_VALUE = {
  __UNINITIALIZED__: true,
};

export class DowngradeComponentAdapter {
  private implementsOnChanges = false;
  private inputChangeCount: number = 0;
  private inputChanges: SimpleChanges = {};
  private componentScope: IScope;

  constructor(
    private element: IAugmentedJQuery,
    private attrs: IAttributes,
    private scope: IScope,
    private ngModel: INgModelController,
    private parentInjector: Injector,
    private $compile: ICompileService,
    private $parse: IParseService,
    private componentFactory: ComponentFactory<any>,
    private wrapCallback: <T>(cb: () => T) => () => T,
    private readonly unsafelyOverwriteSignalInputs: boolean,
  ) {
    this.componentScope = scope.$new();
  }

  compileContents(): Node[][] {
    const compiledProjectableNodes: Node[][] = [];
    const projectableNodes: Node[][] = this.groupProjectableNodes();
    const linkFns = projectableNodes.map((nodes) => this.$compile(nodes));

    this.element.empty!();

    linkFns.forEach((linkFn) => {
      linkFn(this.scope, (clone: Node[]) => {
        compiledProjectableNodes.push(clone);
        this.element.append!(clone);
      });
    });

    return compiledProjectableNodes;
  }

  createComponentAndSetup(
    projectableNodes: Node[][],
    manuallyAttachView = false,
    propagateDigest = true,
  ): ComponentRef<any> {
    const component = this.createComponent(projectableNodes);
    this.setupInputs(manuallyAttachView, propagateDigest, component);
    this.setupOutputs(component.componentRef);
    this.registerCleanup(component.componentRef);

    return component.componentRef;
  }

  private createComponent(projectableNodes: Node[][]): ComponentInfo {
    const providers: StaticProvider[] = [{provide: $SCOPE, useValue: this.componentScope}];
    const childInjector = Injector.create({
      providers: providers,
      parent: this.parentInjector,
      name: 'DowngradeComponentAdapter',
    });

    const componentRef = this.componentFactory.create(
      childInjector,
      projectableNodes,
      this.element[0],
    );
    const viewChangeDetector = componentRef.injector.get(ChangeDetectorRef);
    const changeDetector = componentRef.changeDetectorRef;

    // testability hook is commonly added during component bootstrap in
    // packages/core/src/application_ref.bootstrap()
    // in downgraded application, component creation will take place here as well as adding the
    // testability hook.
    const testability = componentRef.injector.get(Testability, null);
    if (testability) {
      componentRef.injector
        .get(TestabilityRegistry)
        .registerApplication(componentRef.location.nativeElement, testability);
    }

    hookupNgModel(this.ngModel, componentRef.instance);

    return {viewChangeDetector, componentRef, changeDetector};
  }

  private setupInputs(
    manuallyAttachView: boolean,
    propagateDigest = true,
    {componentRef, changeDetector, viewChangeDetector}: ComponentInfo,
  ): void {
    const attrs = this.attrs;
    const inputs = this.componentFactory.inputs || [];
    for (const input of inputs) {
      const inputBinding = new PropertyBinding(input.propName, input.templateName);
      let expr: string | null = null;

      if (attrs.hasOwnProperty(inputBinding.attr)) {
        const observeFn = ((prop, isSignal) => {
          let prevValue = INITIAL_VALUE;
          return (currValue: any) => {
            // Initially, both `$observe()` and `$watch()` will call this function.
            if (!strictEquals(prevValue, currValue)) {
              if (prevValue === INITIAL_VALUE) {
                prevValue = currValue;
              }

              this.updateInput(componentRef, prop, prevValue, currValue, isSignal);
              prevValue = currValue;
            }
          };
        })(inputBinding.prop, input.isSignal);
        attrs.$observe(inputBinding.attr, observeFn);

        // Use `$watch()` (in addition to `$observe()`) in order to initialize the input in time
        // for `ngOnChanges()`. This is necessary if we are already in a `$digest`, which means that
        // `ngOnChanges()` (which is called by a watcher) will run before the `$observe()` callback.
        let unwatch: Function | null = this.componentScope.$watch(() => {
          unwatch!();
          unwatch = null;
          observeFn(attrs[inputBinding.attr]);
        });
      } else if (attrs.hasOwnProperty(inputBinding.bindAttr)) {
        expr = attrs[inputBinding.bindAttr];
      } else if (attrs.hasOwnProperty(inputBinding.bracketAttr)) {
        expr = attrs[inputBinding.bracketAttr];
      } else if (attrs.hasOwnProperty(inputBinding.bindonAttr)) {
        expr = attrs[inputBinding.bindonAttr];
      } else if (attrs.hasOwnProperty(inputBinding.bracketParenAttr)) {
        expr = attrs[inputBinding.bracketParenAttr];
      }
      if (expr != null) {
        const watchFn = (
          (prop, isSignal) => (currValue: unknown, prevValue: unknown) =>
            this.updateInput(componentRef, prop, prevValue, currValue, isSignal)
        )(inputBinding.prop, input.isSignal);
        this.componentScope.$watch(expr, watchFn);
      }
    }

    // Invoke `ngOnChanges()` and Change Detection (when necessary)
    const detectChanges = () => changeDetector.detectChanges();
    const prototype = this.componentFactory.componentType.prototype;
    this.implementsOnChanges = !!(prototype && (<OnChanges>prototype).ngOnChanges);

    this.componentScope.$watch(
      () => this.inputChangeCount,
      this.wrapCallback(() => {
        // Invoke `ngOnChanges()`
        if (this.implementsOnChanges) {
          const inputChanges = this.inputChanges;
          this.inputChanges = {};
          (<OnChanges>componentRef.instance).ngOnChanges(inputChanges);
        }

        viewChangeDetector.markForCheck();

        // If opted out of propagating digests, invoke change detection when inputs change.
        if (!propagateDigest) {
          detectChanges();
        }
      }),
    );

    // If not opted out of propagating digests, invoke change detection on every digest
    if (propagateDigest) {
      this.componentScope.$watch(this.wrapCallback(detectChanges));
    }

    // If necessary, attach the view so that it will be dirty-checked.
    // (Allow time for the initial input values to be set and `ngOnChanges()` to be called.)
    if (manuallyAttachView || !propagateDigest) {
      let unwatch: Function | null = this.componentScope.$watch(() => {
        unwatch!();
        unwatch = null;

        const appRef = this.parentInjector.get<ApplicationRef>(ApplicationRef);
        appRef.attachView(componentRef.hostView);
      });
    }
  }

  private setupOutputs(componentRef: ComponentRef<any>) {
    const attrs = this.attrs;
    const outputs = this.componentFactory.outputs || [];
    for (const output of outputs) {
      const outputBindings = new PropertyBinding(output.propName, output.templateName);
      const bindonAttr = outputBindings.bindonAttr.substring(
        0,
        outputBindings.bindonAttr.length - 6,
      );
      const bracketParenAttr = `[(${outputBindings.bracketParenAttr.substring(
        2,
        outputBindings.bracketParenAttr.length - 8,
      )})]`;
      // order below is important - first update bindings then evaluate expressions
      if (attrs.hasOwnProperty(bindonAttr)) {
        this.subscribeToOutput(componentRef, outputBindings, attrs[bindonAttr], true);
      }
      if (attrs.hasOwnProperty(bracketParenAttr)) {
        this.subscribeToOutput(componentRef, outputBindings, attrs[bracketParenAttr], true);
      }
      if (attrs.hasOwnProperty(outputBindings.onAttr)) {
        this.subscribeToOutput(componentRef, outputBindings, attrs[outputBindings.onAttr]);
      }
      if (attrs.hasOwnProperty(outputBindings.parenAttr)) {
        this.subscribeToOutput(componentRef, outputBindings, attrs[outputBindings.parenAttr]);
      }
    }
  }

  private subscribeToOutput(
    componentRef: ComponentRef<any>,
    output: PropertyBinding,
    expr: string,
    isAssignment: boolean = false,
  ) {
    const getter = this.$parse(expr);
    const setter = getter.assign;
    if (isAssignment && !setter) {
      throw new Error(`Expression '${expr}' is not assignable!`);
    }
    const emitter = componentRef.instance[output.prop] as EventEmitter<any> | OutputEmitterRef<any>;
    if (emitter) {
      const subscription = emitter.subscribe(
        isAssignment
          ? (v: any) => setter!(this.scope, v)
          : (v: any) => getter(this.scope, {'$event': v}),
      );
      componentRef.onDestroy(() => subscription.unsubscribe());
    } else {
      throw new Error(
        `Missing emitter '${output.prop}' on component '${getTypeName(
          this.componentFactory.componentType,
        )}'!`,
      );
    }
  }

  private registerCleanup(componentRef: ComponentRef<any>) {
    const testabilityRegistry = componentRef.injector.get(TestabilityRegistry);
    const destroyComponentRef = this.wrapCallback(() => componentRef.destroy());
    let destroyed = false;

    this.element.on!('$destroy', () => {
      // The `$destroy` event may have been triggered by the `cleanData()` call in the
      // `componentScope` `$destroy` handler below. In that case, we don't want to call
      // `componentScope.$destroy()` again.
      if (!destroyed) this.componentScope.$destroy();
    });
    this.componentScope.$on('$destroy', () => {
      if (!destroyed) {
        destroyed = true;
        testabilityRegistry.unregisterApplication(componentRef.location.nativeElement);

        // The `componentScope` might be getting destroyed, because an ancestor element is being
        // removed/destroyed. If that is the case, jqLite/jQuery would normally invoke `cleanData()`
        // on the removed element and all descendants.
        //   https://github.com/angular/angular.js/blob/2e72ea13fa98bebf6ed4b5e3c45eaf5f990ed16f/src/jqLite.js#L349-L355
        //   https://github.com/jquery/jquery/blob/6984d1747623dbc5e87fd6c261a5b6b1628c107c/src/manipulation.js#L182
        //
        // Here, however, `destroyComponentRef()` may under some circumstances remove the element
        // from the DOM and therefore it will no longer be a descendant of the removed element when
        // `cleanData()` is called. This would result in a memory leak, because the element's data
        // and event handlers (and all objects directly or indirectly referenced by them) would be
        // retained.
        //
        // To ensure the element is always properly cleaned up, we manually call `cleanData()` on
        // this element and its descendants before destroying the `ComponentRef`.
        cleanData(this.element[0]);

        destroyComponentRef();
      }
    });
  }

  private updateInput(
    componentRef: ComponentRef<any>,
    prop: string,
    prevValue: any,
    currValue: any,
    isSignal: boolean,
  ) {
    if (this.implementsOnChanges) {
      this.inputChanges[prop] = new SimpleChange(prevValue, currValue, prevValue === currValue);
    }

    this.inputChangeCount++;
    if (isSignal && !this.unsafelyOverwriteSignalInputs) {
      const node = componentRef.instance[prop][SIGNAL] as InputSignalNode<unknown, unknown>;
      node.applyValueToInputSignal(node, currValue);
    } else {
      componentRef.instance[prop] = currValue;
    }
  }

  private groupProjectableNodes() {
    let ngContentSelectors = this.componentFactory.ngContentSelectors;
    return groupNodesBySelector(ngContentSelectors, this.element.contents!());
  }
}

/**
 * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
 */
export function groupNodesBySelector(ngContentSelectors: string[], nodes: Node[]): Node[][] {
  const projectableNodes: Node[][] = [];

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

function findMatchingNgContentIndex(element: any, ngContentSelectors: string[]): number | null {
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

function matchesSelector(el: any, selector: string): boolean {
  const elProto = <any>Element.prototype;

  return el.nodeType === Node.ELEMENT_NODE
    ? // matches is supported by all browsers from 2014 onwards except non-chromium edge
      (elProto.matches ?? elProto.msMatchesSelector).call(el, selector)
    : false;
}

interface ComponentInfo {
  componentRef: ComponentRef<any>;
  changeDetector: ChangeDetectorRef;
  viewChangeDetector: ChangeDetectorRef;
}
