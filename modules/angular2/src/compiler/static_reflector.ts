import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {
  isArray,
  isBlank,
  isNumber,
  isPresent,
  isPrimitive,
  isString,
  Type
} from 'angular2/src/facade/lang';
import {
  AttributeMetadata,
  DirectiveMetadata,
  ComponentMetadata,
  ContentChildrenMetadata,
  ContentChildMetadata,
  InputMetadata,
  HostBindingMetadata,
  HostListenerMetadata,
  OutputMetadata,
  PipeMetadata,
  ViewMetadata,
  ViewChildMetadata,
  ViewChildrenMetadata,
  ViewQueryMetadata,
  QueryMetadata,
} from 'angular2/src/core/metadata';

/**
 * The host of the static resolver is expected to be able to provide module metadata in the form of
 * ModuleMetadata. Angular 2 CLI will produce this metadata for a module whenever a .d.ts files is
 * produced and the module has exported variables or classes with decorators. Module metadata can
 * also be produced directly from TypeScript sources by using MetadataCollector in tools/metadata.
 */
export interface StaticReflectorHost {
  /**
   *  Return a ModuleMetadata for the give module.
   *
   * @param moduleId is a string identifier for a module in the form that would expected in a
   *                 module import of an import statement.
   * @returns the metadata for the given module.
   */
  getMetadataFor(moduleId: string): {[key: string]: any};
}

/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a moduleId and name and can be used as a hash table key.
 */
export class StaticType {
  constructor(public moduleId: string, public name: string) {}
}

/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
export class StaticReflector {
  private typeCache = new Map<string, StaticType>();
  private annotationCache = new Map<StaticType, any[]>();
  private propertyCache = new Map<StaticType, {[key: string]: any}>();
  private parameterCache = new Map<StaticType, any[]>();
  private metadataCache = new Map<string, {[key: string]: any}>();

  constructor(private host: StaticReflectorHost) { this.initializeConversionMap(); }

  /**
   * getStatictype produces a Type whose metadata is known but whose implementation is not loaded.
   * All types passed to the StaticResolver should be pseudo-types returned by this method.
   *
   * @param moduleId the module identifier as would be passed to an import statement.
   * @param name the name of the type.
   */
  public getStaticType(moduleId: string, name: string): StaticType {
    let key = `"${moduleId}".${name}`;
    let result = this.typeCache.get(key);
    if (!isPresent(result)) {
      result = new StaticType(moduleId, name);
      this.typeCache.set(key, result);
    }
    return result;
  }

  public annotations(type: StaticType): any[] {
    let annotations = this.annotationCache.get(type);
    if (!isPresent(annotations)) {
      let classMetadata = this.getTypeMetadata(type);
      if (isPresent(classMetadata['decorators'])) {
        annotations = (<any[]>classMetadata['decorators'])
                          .map(decorator => this.convertKnownDecorator(type.moduleId, decorator))
                          .filter(decorator => isPresent(decorator));
      }
      this.annotationCache.set(type, annotations);
    }
    return annotations;
  }

  public propMetadata(type: StaticType): {[key: string]: any} {
    let propMetadata = this.propertyCache.get(type);
    if (!isPresent(propMetadata)) {
      let classMetadata = this.getTypeMetadata(type);
      propMetadata = this.getPropertyMetadata(type.moduleId, classMetadata['members']);
      this.propertyCache.set(type, propMetadata);
    }
    return propMetadata;
  }

  public parameters(type: StaticType): any[] {
    let parameters = this.parameterCache.get(type);
    if (!isPresent(parameters)) {
      let classMetadata = this.getTypeMetadata(type);
      let ctorData = classMetadata['members']['__ctor__'];
      if (isPresent(ctorData)) {
        let ctor = (<any[]>ctorData).find(a => a['__symbolic'] === 'constructor');
        parameters = this.simplify(type.moduleId, ctor['parameters']);
        this.parameterCache.set(type, parameters);
      }
    }
    return parameters;
  }

  private conversionMap = new Map<StaticType, (moduleContext: string, expression: any) => any>();
  private initializeConversionMap(): any {
    let core_metadata = 'angular2/src/core/metadata';
    let conversionMap = this.conversionMap;
    conversionMap.set(this.getStaticType(core_metadata, 'Directive'),
                      (moduleContext, expression) => {
                        let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
                        if (!isPresent(p0)) {
                          p0 = {};
                        }
                        return new DirectiveMetadata({
                          selector: p0['selector'],
                          inputs: p0['inputs'],
                          outputs: p0['outputs'],
                          events: p0['events'],
                          host: p0['host'],
                          bindings: p0['bindings'],
                          providers: p0['providers'],
                          exportAs: p0['exportAs'],
                          queries: p0['queries'],
                        });
                      });
    conversionMap.set(this.getStaticType(core_metadata, 'Component'),
                      (moduleContext, expression) => {
                        let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
                        if (!isPresent(p0)) {
                          p0 = {};
                        }
                        return new ComponentMetadata({
                          selector: p0['selector'],
                          inputs: p0['inputs'],
                          outputs: p0['outputs'],
                          properties: p0['properties'],
                          events: p0['events'],
                          host: p0['host'],
                          exportAs: p0['exportAs'],
                          moduleId: p0['moduleId'],
                          bindings: p0['bindings'],
                          providers: p0['providers'],
                          viewBindings: p0['viewBindings'],
                          viewProviders: p0['viewProviders'],
                          changeDetection: p0['changeDetection'],
                          queries: p0['queries'],
                          templateUrl: p0['templateUrl'],
                          template: p0['template'],
                          styleUrls: p0['styleUrls'],
                          styles: p0['styles'],
                          directives: p0['directives'],
                          pipes: p0['pipes'],
                          encapsulation: p0['encapsulation']
                        });
                      });
    conversionMap.set(this.getStaticType(core_metadata, 'Input'),
                      (moduleContext, expression) => new InputMetadata(
                          this.getDecoratorParameter(moduleContext, expression, 0)));
    conversionMap.set(this.getStaticType(core_metadata, 'Output'),
                      (moduleContext, expression) => new OutputMetadata(
                          this.getDecoratorParameter(moduleContext, expression, 0)));
    conversionMap.set(this.getStaticType(core_metadata, 'View'), (moduleContext, expression) => {
      let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
      if (!isPresent(p0)) {
        p0 = {};
      }
      return new ViewMetadata({
        templateUrl: p0['templateUrl'],
        template: p0['template'],
        directives: p0['directives'],
        pipes: p0['pipes'],
        encapsulation: p0['encapsulation'],
        styles: p0['styles'],
      });
    });
    conversionMap.set(this.getStaticType(core_metadata, 'Attribute'),
                      (moduleContext, expression) => new AttributeMetadata(
                          this.getDecoratorParameter(moduleContext, expression, 0)));
    conversionMap.set(this.getStaticType(core_metadata, 'Query'), (moduleContext, expression) => {
      let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
      let p1 = this.getDecoratorParameter(moduleContext, expression, 1);
      if (!isPresent(p1)) {
        p1 = {};
      }
      return new QueryMetadata(p0, {descendants: p1.descendants, first: p1.first});
    });
    conversionMap.set(this.getStaticType(core_metadata, 'ContentChildren'),
                      (moduleContext, expression) => new ContentChildrenMetadata(
                          this.getDecoratorParameter(moduleContext, expression, 0)));
    conversionMap.set(this.getStaticType(core_metadata, 'ContentChild'),
                      (moduleContext, expression) => new ContentChildMetadata(
                          this.getDecoratorParameter(moduleContext, expression, 0)));
    conversionMap.set(this.getStaticType(core_metadata, 'ViewChildren'),
                      (moduleContext, expression) => new ViewChildrenMetadata(
                          this.getDecoratorParameter(moduleContext, expression, 0)));
    conversionMap.set(this.getStaticType(core_metadata, 'ViewChild'),
                      (moduleContext, expression) => new ViewChildMetadata(
                          this.getDecoratorParameter(moduleContext, expression, 0)));
    conversionMap.set(this.getStaticType(core_metadata, 'ViewQuery'),
                      (moduleContext, expression) => {
                        let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
                        let p1 = this.getDecoratorParameter(moduleContext, expression, 1);
                        if (!isPresent(p1)) {
                          p1 = {};
                        }
                        return new ViewQueryMetadata(p0, {
                          descendants: p1['descendants'],
                          first: p1['first'],
                        });
                      });
    conversionMap.set(this.getStaticType(core_metadata, 'Pipe'), (moduleContext, expression) => {
      let p0 = this.getDecoratorParameter(moduleContext, expression, 0);
      if (!isPresent(p0)) {
        p0 = {};
      }
      return new PipeMetadata({
        name: p0['name'],
        pure: p0['pure'],
      });
    });
    conversionMap.set(this.getStaticType(core_metadata, 'HostBinding'),
                      (moduleContext, expression) => new HostBindingMetadata(
                          this.getDecoratorParameter(moduleContext, expression, 0)));
    conversionMap.set(this.getStaticType(core_metadata, 'HostListener'),
                      (moduleContext, expression) => new HostListenerMetadata(
                          this.getDecoratorParameter(moduleContext, expression, 0),
                          this.getDecoratorParameter(moduleContext, expression, 1)));
    return null;
  }

  private convertKnownDecorator(moduleContext: string, expression: {[key: string]: any}): any {
    let converter = this.conversionMap.get(this.getDecoratorType(moduleContext, expression));
    if (isPresent(converter)) return converter(moduleContext, expression);
    return null;
  }

  private getDecoratorType(moduleContext: string, expression: {[key: string]: any}): StaticType {
    if (isMetadataSymbolicCallExpression(expression)) {
      let target = expression['expression'];
      if (isMetadataSymbolicReferenceExpression(target)) {
        let moduleId = this.normalizeModuleName(moduleContext, target['module']);
        return this.getStaticType(moduleId, target['name']);
      }
    }
    return null;
  }

  private getDecoratorParameter(moduleContext: string, expression: {[key: string]: any},
                                index: number): any {
    if (isMetadataSymbolicCallExpression(expression) && isPresent(expression['arguments']) &&
        (<any[]>expression['arguments']).length <= index + 1) {
      return this.simplify(moduleContext, (<any[]>expression['arguments'])[index]);
    }
    return null;
  }

  private getPropertyMetadata(moduleContext: string,
                              value: {[key: string]: any}): {[key: string]: any} {
    if (isPresent(value)) {
      let result = {};
      StringMapWrapper.forEach(value, (value, name) => {
        let data = this.getMemberData(moduleContext, value);
        if (isPresent(data)) {
          let propertyData = data.filter(d => d['kind'] == "property")
                                 .map(d => d['directives'])
                                 .reduce((p, c) => (<any[]>p).concat(<any[]>c), []);
          if (propertyData.length != 0) {
            StringMapWrapper.set(result, name, propertyData);
          }
        }
      });
      return result;
    }
    return null;
  }

  // clang-format off
  private getMemberData(moduleContext: string, member: { [key: string]: any }[]): { [key: string]: any }[] {
    // clang-format on
    let result = [];
    if (isPresent(member)) {
      for (let item of member) {
        result.push({
          kind: item['__symbolic'],
          directives:
              isPresent(item['decorators']) ?
                  (<any[]>item['decorators'])
                      .map(decorator => this.convertKnownDecorator(moduleContext, decorator))
                      .filter(d => isPresent(d)) :
                  null
        });
      }
    }
    return result;
  }

  /** @internal */
  public simplify(moduleContext: string, value: any): any {
    let _this = this;

    function simplify(expression: any): any {
      if (isPrimitive(expression)) {
        return expression;
      }
      if (isArray(expression)) {
        let result = [];
        for (let item of(<any>expression)) {
          result.push(simplify(item));
        }
        return result;
      }
      if (isPresent(expression)) {
        if (isPresent(expression['__symbolic'])) {
          switch (expression['__symbolic']) {
            case "binop":
              let left = simplify(expression['left']);
              let right = simplify(expression['right']);
              switch (expression['operator']) {
                case '&&':
                  return left && right;
                case '||':
                  return left || right;
                case '|':
                  return left | right;
                case '^':
                  return left ^ right;
                case '&':
                  return left & right;
                case '==':
                  return left == right;
                case '!=':
                  return left != right;
                case '===':
                  return left === right;
                case '!==':
                  return left !== right;
                case '<':
                  return left < right;
                case '>':
                  return left > right;
                case '<=':
                  return left <= right;
                case '>=':
                  return left >= right;
                case '<<':
                  return left << right;
                case '>>':
                  return left >> right;
                case '+':
                  return left + right;
                case '-':
                  return left - right;
                case '*':
                  return left * right;
                case '/':
                  return left / right;
                case '%':
                  return left % right;
              }
              return null;
            case "pre":
              let operand = simplify(expression['operand']);
              switch (expression['operator']) {
                case '+':
                  return operand;
                case '-':
                  return -operand;
                case '!':
                  return !operand;
                case '~':
                  return ~operand;
              }
              return null;
            case "index":
              let indexTarget = simplify(expression['expression']);
              let index = simplify(expression['index']);
              if (isPresent(indexTarget) && isPrimitive(index)) return indexTarget[index];
              return null;
            case "select":
              let selectTarget = simplify(expression['expression']);
              let member = simplify(expression['member']);
              if (isPresent(selectTarget) && isPrimitive(member)) return selectTarget[member];
              return null;
            case "reference":
              let referenceModuleName =
                  _this.normalizeModuleName(moduleContext, expression['module']);
              let referenceModule = _this.getModuleMetadata(referenceModuleName);
              let referenceValue = referenceModule['metadata'][expression['name']];
              if (isClassMetadata(referenceValue)) {
                // Convert to a pseudo type
                return _this.getStaticType(referenceModuleName, expression['name']);
              }
              return _this.simplify(referenceModuleName, referenceValue);
            case "call":
              return null;
          }
          return null;
        }
        let result = {};
        StringMapWrapper.forEach(expression, (value, name) => { result[name] = simplify(value); });
        return result;
      }
      return null;
    }

    return simplify(value);
  }

  private getModuleMetadata(module: string): {[key: string]: any} {
    let moduleMetadata = this.metadataCache.get(module);
    if (!isPresent(moduleMetadata)) {
      moduleMetadata = this.host.getMetadataFor(module);
      if (!isPresent(moduleMetadata)) {
        moduleMetadata = {__symbolic: "module", module: module, metadata: {}};
      }
      this.metadataCache.set(module, moduleMetadata);
    }
    return moduleMetadata;
  }

  private getTypeMetadata(type: StaticType): {[key: string]: any} {
    let moduleMetadata = this.getModuleMetadata(type.moduleId);
    let result = moduleMetadata['metadata'][type.name];
    if (!isPresent(result)) {
      result = {__symbolic: "class"};
    }
    return result;
  }

  private normalizeModuleName(from: string, to: string): string {
    if (to.startsWith('.')) {
      return pathTo(from, to);
    }
    return to;
  }
}

function isMetadataSymbolicCallExpression(expression: any): boolean {
  return !isPrimitive(expression) && !isArray(expression) && expression['__symbolic'] == 'call';
}

function isMetadataSymbolicReferenceExpression(expression: any): boolean {
  return !isPrimitive(expression) && !isArray(expression) &&
         expression['__symbolic'] == 'reference';
}

function isClassMetadata(expression: any): boolean {
  return !isPrimitive(expression) && !isArray(expression) && expression['__symbolic'] == 'class';
}

function splitPath(path: string): string[] {
  return path.split(/\/|\\/g);
}

function resolvePath(pathParts: string[]): string {
  let result = [];
  ListWrapper.forEachWithIndex(pathParts, (part, index) => {
    switch (part) {
      case '':
      case '.':
        if (index > 0) return;
        break;
      case '..':
        if (index > 0 && result.length != 0) result.pop();
        return;
    }
    result.push(part);
  });
  return result.join('/');
}

function pathTo(from: string, to: string): string {
  let result = to;
  if (to.startsWith('.')) {
    let fromParts = splitPath(from);
    fromParts.pop();  // remove the file name.
    let toParts = splitPath(to);
    result = resolvePath(fromParts.concat(toParts));
  }
  return result;
}
