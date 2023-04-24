/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, DoCheck, ElementRef, EventEmitter, Inject, Injector, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges, Type} from '@angular/core';

import {IAttributes, IDirective, IInjectorService, ILinkFn, IScope, ITranscludeFunction} from '../../common/src/angular1';
import {$SCOPE} from '../../common/src/constants';
import {IBindingDestination, IControllerInstance, UpgradeHelper} from '../../common/src/upgrade_helper';
import {isFunction, strictEquals} from '../../common/src/util';


const CAMEL_CASE = /([A-Z])/g;
const INITIAL_VALUE = {
  __UNINITIALIZED__: true
};
const NOT_SUPPORTED: any = 'NOT_SUPPORTED';

function getInputPropertyMapName(name: string): string {
  return `input_${name}`;
}

function getOutputPropertyMapName(name: string): string {
  return `output_${name}`;
}

export class UpgradeNg1ComponentAdapterBuilder {
  type: Type<any>;
  inputs: string[] = [];
  inputsRename: string[] = [];
  outputs: string[] = [];
  outputsRename: string[] = [];
  propertyOutputs: string[] = [];
  checkProperties: string[] = [];
  propertyMap: {[name: string]: string} = {};
  directive: IDirective|null = null;
  template!: string;

  constructor(public name: string) {
    const selector =
        name.replace(CAMEL_CASE, (all: string, next: string) => '-' + next.toLowerCase());
    const self = this;

    @Directive(
        {jit: true, selector: selector, inputs: this.inputsRename, outputs: this.outputsRename})
    class MyClass extends UpgradeNg1ComponentAdapter implements OnInit, OnChanges, DoCheck,
                                                                OnDestroy {
      constructor(@Inject($SCOPE) scope: IScope, injector: Injector, elementRef: ElementRef) {
        super(
            new UpgradeHelper(injector, name, elementRef, self.directive || undefined), scope,
            self.template, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties,
            self.propertyMap) as any;
      }
    }
    this.type = MyClass;
  }

  extractBindings() {
    const btcIsObject = typeof this.directive!.bindToController === 'object';
    if (btcIsObject && Object.keys(this.directive!.scope!).length) {
      throw new Error(
          `Binding definitions on scope and controller at the same time are not supported.`);
    }

    const context = (btcIsObject) ? this.directive!.bindToController : this.directive!.scope;

    if (typeof context == 'object') {
      Object.keys(context).forEach(propName => {
        const definition = context[propName];
        const bindingType = definition.charAt(0);
        const bindingOptions = definition.charAt(1);
        const attrName = definition.substring(bindingOptions === '?' ? 2 : 1) || propName;

        // QUESTION: What about `=*`? Ignore? Throw? Support?

        const inputName = getInputPropertyMapName(attrName);
        const inputNameRename = `${inputName}: ${attrName}`;
        const outputName = getOutputPropertyMapName(attrName);
        const outputNameRename = `${outputName}: ${attrName}`;
        const outputNameRenameChange = `${outputNameRename}Change`;

        switch (bindingType) {
          case '@':
          case '<':
            this.inputs.push(inputName);
            this.inputsRename.push(inputNameRename);
            this.propertyMap[inputName] = propName;
            break;
          case '=':
            this.inputs.push(inputName);
            this.inputsRename.push(inputNameRename);
            this.propertyMap[inputName] = propName;

            this.outputs.push(outputName);
            this.outputsRename.push(outputNameRenameChange);
            this.propertyMap[outputName] = propName;

            this.checkProperties.push(propName);
            this.propertyOutputs.push(outputName);
            break;
          case '&':
            this.outputs.push(outputName);
            this.outputsRename.push(outputNameRename);
            this.propertyMap[outputName] = propName;
            break;
          default:
            let json = JSON.stringify(context);
            throw new Error(
                `Unexpected mapping '${bindingType}' in '${json}' in '${this.name}' directive.`);
        }
      });
    }
  }

  /**
   * Upgrade ng1 components into Angular.
   */
  static resolve(
      exportedComponents: {[name: string]: UpgradeNg1ComponentAdapterBuilder},
      $injector: IInjectorService): Promise<string[]> {
    const promises = Object.entries(exportedComponents).map(([name, exportedComponent]) => {
      exportedComponent.directive = UpgradeHelper.getDirective($injector, name);
      exportedComponent.extractBindings();

      return Promise
          .resolve(UpgradeHelper.getTemplate($injector, exportedComponent.directive, true))
          .then(template => exportedComponent.template = template);
    });

    return Promise.all(promises);
  }
}

@Directive()
class UpgradeNg1ComponentAdapter implements OnInit, OnChanges, DoCheck {
  private controllerInstance: IControllerInstance|null = null;
  destinationObj: IBindingDestination|null = null;
  checkLastValues: any[] = [];
  directive: IDirective;
  element: Element;
  $element: any = null;
  componentScope: IScope;

  constructor(
      private helper: UpgradeHelper, scope: IScope, private template: string,
      private inputs: string[], private outputs: string[], private propOuts: string[],
      private checkProperties: string[], private propertyMap: {[key: string]: string}) {
    this.directive = helper.directive;
    this.element = helper.element;
    this.$element = helper.$element;
    this.componentScope = scope.$new(!!this.directive.scope);

    const controllerType = this.directive.controller;

    if (this.directive.bindToController && controllerType) {
      this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
      this.destinationObj = this.controllerInstance;
    } else {
      this.destinationObj = this.componentScope;
    }

    for (const input of this.inputs) {
      (this as any)[input] = null;
    }
    for (const output of this.outputs) {
      const emitter = (this as any)[output] = new EventEmitter();
      if (this.propOuts.indexOf(output) === -1) {
        this.setComponentProperty(
            output, (emitter => (value: any) => emitter.emit(value))(emitter));
      }
    }
    this.checkLastValues.push(...Array(propOuts.length).fill(INITIAL_VALUE));
  }

  ngOnInit() {
    // Collect contents, insert and compile template
    const attachChildNodes: ILinkFn|undefined = this.helper.prepareTransclusion();
    const linkFn = this.helper.compileTemplate(this.template);

    // Instantiate controller (if not already done so)
    const controllerType = this.directive.controller;
    const bindToController = this.directive.bindToController;
    if (controllerType && !bindToController) {
      this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
    }

    // Require other controllers
    const requiredControllers =
        this.helper.resolveAndBindRequiredControllers(this.controllerInstance);

    // Hook: $onInit
    if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
      this.controllerInstance.$onInit();
    }

    // Linking
    const link = this.directive.link;
    const preLink = typeof link == 'object' && link.pre;
    const postLink = typeof link == 'object' ? link.post : link;
    const attrs: IAttributes = NOT_SUPPORTED;
    const transcludeFn: ITranscludeFunction = NOT_SUPPORTED;
    if (preLink) {
      preLink(this.componentScope, this.$element, attrs, requiredControllers, transcludeFn);
    }

    linkFn(this.componentScope, null!, {parentBoundTranscludeFn: attachChildNodes});

    if (postLink) {
      postLink(this.componentScope, this.$element, attrs, requiredControllers, transcludeFn);
    }

    // Hook: $postLink
    if (this.controllerInstance && isFunction(this.controllerInstance.$postLink)) {
      this.controllerInstance.$postLink();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const ng1Changes: any = {};
    Object.keys(changes).forEach(propertyMapName => {
      const change: SimpleChange = changes[propertyMapName];
      this.setComponentProperty(propertyMapName, change.currentValue);
      ng1Changes[this.propertyMap[propertyMapName]] = change;
    });

    if (isFunction(this.destinationObj!.$onChanges)) {
      this.destinationObj!.$onChanges!(ng1Changes);
    }
  }

  ngDoCheck() {
    const destinationObj = this.destinationObj;
    const lastValues = this.checkLastValues;
    const checkProperties = this.checkProperties;
    const propOuts = this.propOuts;
    checkProperties.forEach((propName, i) => {
      const value = destinationObj![propName];
      const last = lastValues[i];
      if (!strictEquals(last, value)) {
        const eventEmitter: EventEmitter<any> = (this as any)[propOuts[i]];
        eventEmitter.emit(lastValues[i] = value);
      }
    });

    if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
      this.controllerInstance.$doCheck();
    }
  }

  ngOnDestroy() {
    this.helper.onDestroy(this.componentScope, this.controllerInstance);
  }

  setComponentProperty(name: string, value: any) {
    this.destinationObj![this.propertyMap[name]] = value;
  }
}
