import {
  Directive,
  DoCheck,
  ElementRef,
  EventEmitter,
  Inject,
  OnChanges,
  SimpleChange,
  Type
} from 'angular2/angular2';
import {NG1_COMPILE, NG1_SCOPE} from './constants';

const CAMEL_CASE = /([A-Z])/g;
const INITIAL_VALUE = {
  __UNINITIALIZED__: true
};


export class ExportedNg1Component {
  type: Type;
  inputs: string[] = [];
  inputsRename: string[] = [];
  outputs: string[] = [];
  outputsRename: string[] = [];
  propertyOutputs: string[] = [];
  checkProperties: string[] = [];
  propertyMap: {[name: string]: string} = {};

  constructor(public name: string) {
    var selector = name.replace(CAMEL_CASE, (all, next: string) => '-' + next.toLowerCase());
    var self = this;
    this.type =
        Directive({selector: selector, inputs: this.inputsRename, outputs: this.outputsRename})
            .Class({
              constructor: [
                new Inject(NG1_COMPILE),
                new Inject(NG1_SCOPE),
                ElementRef,
                function(compile: angular.ICompileService, scope: angular.IScope,
                         elementRef: ElementRef) {
                  return new Ng1ComponentFacade(compile, scope, elementRef, self.inputs,
                                                self.outputs, self.propertyOutputs,
                                                self.checkProperties, self.propertyMap);
                }
              ],
              onChanges: function() { /* needs to be here for ng2 to properly detect it */ },
              doCheck: function() { /* needs to be here for ng2 to properly detect it */ }
            });
  }

  extractBindings(injector: angular.auto.IInjectorService) {
    var directives: angular.IDirective[] = injector.get(this.name + 'Directive');
    if (directives.length > 1) {
      throw new Error('Only support single directive definition for: ' + this.name);
    }
    var directive = directives[0];
    var scope = directive.scope;
    if (typeof scope == 'object') {
      for (var name in scope) {
        if ((<any>scope).hasOwnProperty(name)) {
          var localName = scope[name];
          var type = localName.charAt(0);
          localName = localName.substr(1) || name;
          var outputName = 'output_' + name;
          var outputNameRename = outputName + ': ' + name;
          var inputName = 'input_' + name;
          var inputNameRename = inputName + ': ' + name;
          switch (type) {
            case '=':
              this.propertyOutputs.push(outputName);
              this.checkProperties.push(localName);
              this.outputs.push(outputName);
              this.outputsRename.push(outputNameRename);
              this.propertyMap[outputName] = localName;
            // don't break; let it fall through to '@'
            case '@':
              this.inputs.push(inputName);
              this.inputsRename.push(inputNameRename);
              this.propertyMap[inputName] = localName;
              break;
            case '&':
              this.outputs.push(outputName);
              this.outputsRename.push(outputNameRename);
              this.propertyMap[outputName] = localName;
              break;
            default:
              var json = JSON.stringify(scope);
              throw new Error(
                  `Unexpected mapping '${type}' in '${json}' in '${this.name}' directive.`);
          }
        }
      }
    }
  }

  static resolve(exportedComponents: {[name: string]: ExportedNg1Component},
                 injector: angular.auto.IInjectorService) {
    for (var name in exportedComponents) {
      if ((<any>exportedComponents).hasOwnProperty(name)) {
        var exportedComponent = exportedComponents[name];
        exportedComponent.extractBindings(injector);
      }
    }
  }
}

class Ng1ComponentFacade implements OnChanges, DoCheck {
  componentScope: angular.IScope = null;
  checkLastValues: any[] = [];

  constructor(compile: angular.ICompileService, scope: angular.IScope, elementRef: ElementRef,
              private inputs: string[], private outputs: string[], private propOuts: string[],
              private checkProperties: string[], private propertyMap: {[key: string]: string}) {
    var chailTail = scope.$$childTail;  // remember where the next scope is inserted
    var element: Element = elementRef.nativeElement;
    var childNodes: Node[] = [];
    var childNode;
    while (childNode = element.firstChild) {
      element.removeChild(childNode);
      childNodes.push(childNode);
    }
    element.appendChild(element.ownerDocument.createElement('ng-transclude'));
    compile(element)(scope, null,
                     {parentBoundTranscludeFn: (scope, cloneAttach) => cloneAttach(childNodes)});
    // If we are first scope take it, otherwise take the next one in list.
    this.componentScope = chailTail ? chailTail.$$nextSibling : scope.$$childHead;

    for (var i = 0; i < inputs.length; i++) {
      this[inputs[i]] = null;
    }
    for (var j = 0; j < outputs.length; j++) {
      var emitter = this[outputs[j]] = new EventEmitter();
      this.setComponentProperty(outputs[j], ((emitter) => (value) => emitter.next(value))(emitter));
    }
    for (var k = 0; k < propOuts.length; k++) {
      this[propOuts[k]] = new EventEmitter();
      this.checkLastValues.push(INITIAL_VALUE);
    }
  }

  onChanges(changes) {
    for (var name in changes) {
      if (changes.hasOwnProperty(name)) {
        var change: SimpleChange = changes[name];
        this.setComponentProperty(name, change.currentValue);
      }
    }
  }

  doCheck() {
    var count = 0;
    var scope = this.componentScope;
    var lastValues = this.checkLastValues;
    var checkProperties = this.checkProperties;
    for (var i = 0; i < checkProperties.length; i++) {
      var value = scope[checkProperties[i]];
      var last = lastValues[i];
      if (value !== last) {
        if (typeof value == 'number' && isNaN(value) && typeof last == 'number' && isNaN(last)) {
          // ignore because NaN != NaN
        } else {
          var eventEmitter: EventEmitter = this[this.propOuts[i]];
          eventEmitter.next(lastValues[i] = value);
        }
      }
    }
    return count;
  }

  setComponentProperty(name: string, value: any) {
    this.componentScope[this.propertyMap[name]] = value;
  }
}
