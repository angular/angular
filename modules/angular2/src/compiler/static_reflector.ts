import {StringMapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {
  isArray,
  isPresent,
  isBlank,
  isPrimitive,
  isStringMap,
  CONST_EXPR,
  FunctionWrapper
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
  ViewChildMetadata,
  ViewChildrenMetadata,
  ViewQueryMetadata,
  QueryMetadata,
} from 'angular2/src/core/metadata';
import {ReflectorReader} from 'angular2/src/core/reflection/reflector_reader';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {Provider} from 'angular2/src/core/di/provider';
import {
  HostMetadata,
  OptionalMetadata,
  InjectableMetadata,
  SelfMetadata,
  SkipSelfMetadata,
  InjectMetadata
} from "angular2/src/core/di/metadata";

export class ModuleContext {
  constructor(public moduleId: string, public filePath: string) {}
}

/**
 * The host of the static resolver is expected to be able to provide module metadata in the form of
 * ModuleMetadata. Angular 2 CLI will produce this metadata for a module whenever a .d.ts files is
 * produced and the module has exported variables or classes with decorators. Module metadata can
 * also be produced directly from TypeScript sources by using MetadataCollector in tools/metadata.
 */
export interface StaticReflectorHost {
  /**
   *  Return a ModuleMetadata for the given module.
   *
   * @param moduleId is a string identifier for a module as an absolute path.
   * @returns the metadata for the given module.
   */
  getMetadataFor(modulePath: string): {[key: string]: any};

  /**
   * Resolve a symbol from an import statement form, to the file where it is declared.
   * @param module the location imported from
   * @param containingFile for relative imports, the path of the file containing the import
   */
  findDeclaration(modulePath: string, symbolName: string, containingFile?: string): StaticSymbol;

  getStaticSymbol(moduleId: string, declarationFile: string, name: string): StaticSymbol;
}

/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a moduleId and name and can be used as a hash table key.
 */
export class StaticSymbol {
  constructor(public moduleId: string, public filePath: string, public name: string) {}
}

/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
export class StaticReflector implements ReflectorReader {
  private annotationCache = new Map<StaticSymbol, any[]>();
  private propertyCache = new Map<StaticSymbol, {[key: string]: any}>();
  private parameterCache = new Map<StaticSymbol, any[]>();
  private metadataCache = new Map<string, {[key: string]: any}>();
  private conversionMap =
      new Map<StaticSymbol, (moduleContext: ModuleContext, args: any[]) => any>();

  constructor(private host: StaticReflectorHost) { this.initializeConversionMap(); }

  importUri(typeOrFunc: any): string { return (<StaticSymbol>typeOrFunc).filePath; }

  public annotations(type: StaticSymbol): any[] {
    let annotations = this.annotationCache.get(type);
    if (!isPresent(annotations)) {
      let classMetadata = this.getTypeMetadata(type);
      if (isPresent(classMetadata['decorators'])) {
        annotations = this.simplify(type, classMetadata['decorators'], false);
      } else {
        annotations = [];
      }
      this.annotationCache.set(type, annotations.filter(ann => isPresent(ann)));
    }
    return annotations;
  }

  public propMetadata(type: StaticSymbol): {[key: string]: any} {
    let propMetadata = this.propertyCache.get(type);
    if (!isPresent(propMetadata)) {
      let classMetadata = this.getTypeMetadata(type);
      let members = isPresent(classMetadata) ? classMetadata['members'] : {};
      propMetadata = mapStringMap(members, (propData, propName) => {
        let prop = (<any[]>propData).find(a => a['__symbolic'] == 'property');
        if (isPresent(prop) && isPresent(prop['decorators'])) {
          return this.simplify(type, prop['decorators'], false);
        } else {
          return [];
        }
      });
      this.propertyCache.set(type, propMetadata);
    }
    return propMetadata;
  }

  public parameters(type: StaticSymbol): any[] {
    let parameters = this.parameterCache.get(type);
    if (!isPresent(parameters)) {
      let classMetadata = this.getTypeMetadata(type);
      let members = isPresent(classMetadata) ? classMetadata['members'] : null;
      let ctorData = isPresent(members) ? members['__ctor__'] : null;
      if (isPresent(ctorData)) {
        let ctor = (<any[]>ctorData).find(a => a['__symbolic'] == 'constructor');
        let parameterTypes = <any[]>this.simplify(type, ctor['parameters'], false);
        let parameterDecorators = <any[]>this.simplify(type, ctor['parameterDecorators'], false);

        parameters = [];
        ListWrapper.forEachWithIndex(parameterTypes, (paramType, index) => {
          let nestedResult = [];
          if (isPresent(paramType)) {
            nestedResult.push(paramType);
          }
          let decorators = isPresent(parameterDecorators) ? parameterDecorators[index] : null;
          if (isPresent(decorators)) {
            ListWrapper.addAll(nestedResult, decorators);
          }
          parameters.push(nestedResult);
        });
      }
      if (!isPresent(parameters)) {
        parameters = [];
      }
      this.parameterCache.set(type, parameters);
    }
    return parameters;
  }

  private registerDecoratorOrConstructor(type: StaticSymbol, ctor: any,
                                         crossModuleProps: any[] = CONST_EXPR([])): void {
    this.conversionMap.set(type, (moduleContext: ModuleContext, args: any[]) => {
      let argValues = [];
      ListWrapper.forEachWithIndex(args, (arg, index) => {
        let argValue;
        if (isStringMap(arg) && isBlank(arg['__symbolic'])) {
          argValue =
              mapStringMap(arg, (value, key) => this.simplify(
                                    moduleContext, value, crossModuleProps.indexOf(key) !== -1));
        } else {
          argValue = this.simplify(moduleContext, arg, crossModuleProps.indexOf(index) !== -1);
        }
        argValues.push(argValue);
      });
      return FunctionWrapper.apply(reflector.factory(ctor), argValues);
    });
  }

  private initializeConversionMap(): void {
    let coreDecorators = 'angular2/src/core/metadata';
    let diDecorators = 'angular2/src/core/di/decorators';
    let diMetadata = 'angular2/src/core/di/metadata';
    let provider = 'angular2/src/core/di/provider';
    this.registerDecoratorOrConstructor(this.host.findDeclaration(provider, 'Provider'), Provider);

    this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Host'),
                                        HostMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Injectable'),
                                        InjectableMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Self'),
                                        SelfMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'SkipSelf'),
                                        SkipSelfMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Inject'),
                                        InjectMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Optional'),
                                        OptionalMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Attribute'),
                                        AttributeMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Query'),
                                        QueryMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ViewQuery'),
                                        ViewQueryMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ContentChild'),
                                        ContentChildMetadata);
    this.registerDecoratorOrConstructor(
        this.host.findDeclaration(coreDecorators, 'ContentChildren'), ContentChildrenMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ViewChild'),
                                        ViewChildMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ViewChildren'),
                                        ViewChildrenMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Input'),
                                        InputMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Output'),
                                        OutputMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Pipe'),
                                        PipeMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'HostBinding'),
                                        HostBindingMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'HostListener'),
                                        HostListenerMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Directive'),
                                        DirectiveMetadata, ['bindings', 'providers']);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Component'),
                                        ComponentMetadata,
                                        ['bindings', 'providers', 'directives', 'pipes']);

    // Note: Some metadata classes can be used directly with Provider.deps.
    this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'HostMetadata'),
                                        HostMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'SelfMetadata'),
                                        SelfMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'SkipSelfMetadata'),
                                        SkipSelfMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'OptionalMetadata'),
                                        OptionalMetadata);
  }

  /** @internal */
  public simplify(moduleContext: ModuleContext, value: any, crossModules: boolean): any {
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
          let staticSymbol;
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
              if (isPresent(expression['module'])) {
                staticSymbol = _this.host.findDeclaration(expression['module'], expression['name'],
                                                          moduleContext.filePath);
              } else {
                staticSymbol = _this.host.getStaticSymbol(
                    moduleContext.moduleId, moduleContext.filePath, expression['name']);
              }
              let result;
              if (crossModules || isBlank(expression['module'])) {
                let moduleMetadata = _this.getModuleMetadata(staticSymbol.filePath);
                let declarationValue = moduleMetadata['metadata'][staticSymbol.name];
                if (isClassMetadata(declarationValue)) {
                  result = staticSymbol;
                } else {
                  const newModuleContext =
                      new ModuleContext(staticSymbol.moduleId, staticSymbol.filePath);
                  result = _this.simplify(newModuleContext, declarationValue, crossModules);
                }
              } else {
                result = staticSymbol;
              }
              return result;
            case "new":
            case "call":
              let target = expression['expression'];
              staticSymbol = _this.host.findDeclaration(target['module'], target['name'],
                                                        moduleContext.filePath);
              let converter = _this.conversionMap.get(staticSymbol);
              let args = expression['arguments'];
              if (isBlank(args)) {
                args = [];
              }
              return isPresent(converter) ? converter(moduleContext, args) : null;
          }
          return null;
        }
        return mapStringMap(expression, (value, name) => simplify(value));
      }
      return null;
    }

    return simplify(value);
  }

  /**
   * @param module an absolute path to a module file.
   */
  public getModuleMetadata(module: string): {[key: string]: any} {
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

  private getTypeMetadata(type: StaticSymbol): {[key: string]: any} {
    if (!(type instanceof StaticSymbol)) {
      throw new Error('not static type');
    }
    let moduleMetadata = this.getModuleMetadata(type.filePath);
    let result = moduleMetadata['metadata'][type.name];
    if (!isPresent(result)) {
      result = {__symbolic: "class"};
    }
    return result;
  }
}

function isClassMetadata(expression: any): boolean {
  return !isPrimitive(expression) && !isArray(expression) && expression['__symbolic'] == 'class';
}

function mapStringMap(input: {[key: string]: any},
                      transform: (value: any, key: string) => any): {[key: string]: any} {
  if (isBlank(input)) return {};
  var result = {};
  StringMapWrapper.keys(input).forEach((key) => { result[key] = transform(input[key], key); });
  return result;
}
