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
  Provider,
  HostMetadata,
  OptionalMetadata,
  InjectableMetadata,
  SelfMetadata,
  SkipSelfMetadata,
  InjectMetadata,
  trigger,
  state,
  transition,
  sequence,
  group,
  animate,
  style,
  keyframes
} from "@angular/core";
import {ReflectorReader} from "./core_private";
 
const SUPPORTED_SCHEMA_VERSION = 1;

/**
 * The host of the static resolver is expected to be able to provide module metadata in the form of
 * ModuleMetadata. Angular 2 CLI will produce this metadata for a module whenever a .d.ts files is
 * produced and the module has exported variables or classes with decorators. Module metadata can
 * also be produced directly from TypeScript sources by using MetadataCollector in tools/metadata.
 */
export interface StaticReflectorHost {
  /**
   * Return a ModuleMetadata for the given module.
   *
   * @param modulePath is a string identifier for a module as an absolute path.
   * @returns the metadata for the given module.
   */
  getMetadataFor(modulePath: string): {[key: string]: any};

  /**
   * Resolve a symbol from an import statement form, to the file where it is declared.
   * @param module the location imported from
   * @param containingFile for relative imports, the path of the file containing the import
   */
  findDeclaration(modulePath: string, symbolName: string, containingFile?: string): StaticSymbol;

  getStaticSymbol(declarationFile: string, name: string): StaticSymbol;

  angularImportLocations():
      {coreDecorators: string, diDecorators: string, diMetadata: string, animationMetadata: string, provider: string};
}

/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a filePath and name and can be used as a hash table key.
 */
export class StaticSymbol {
  constructor(public filePath: string, public name: string) {}
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
  private conversionMap = new Map<StaticSymbol, (context: StaticSymbol, args: any[]) => any>();

  constructor(private host: StaticReflectorHost) { this.initializeConversionMap(); }

  importUri(typeOrFunc: StaticSymbol): string {
    var staticSymbol = this.host.findDeclaration(typeOrFunc.filePath, typeOrFunc.name, '');
    return staticSymbol ? staticSymbol.filePath : null;
  }

  public annotations(type: StaticSymbol): any[] {
    let annotations = this.annotationCache.get(type);
    if (!annotations) {
      let classMetadata = this.getTypeMetadata(type);
      if (classMetadata['decorators']) {
        annotations = this.simplify(type, classMetadata['decorators']);
      } else {
        annotations = [];
      }
      this.annotationCache.set(type, annotations.filter(ann => !!ann));
    }
    return annotations;
  }

  public propMetadata(type: StaticSymbol): {[key: string]: any} {
    let propMetadata = this.propertyCache.get(type);
    if (!propMetadata) {
      let classMetadata = this.getTypeMetadata(type);
      let members = classMetadata ? classMetadata['members'] : {};
      propMetadata = mapStringMap(members, (propData, propName) => {
        let prop = (<any[]>propData).find(a => a['__symbolic'] == 'property');
        if (prop && prop['decorators']) {
          return this.simplify(type, prop['decorators']);
        } else {
          return [];
        }
      });
      this.propertyCache.set(type, propMetadata);
    }
    return propMetadata;
  }

  public parameters(type: StaticSymbol): any[] {
    if (!(type instanceof StaticSymbol)) {
      throw new Error(`parameters received ${JSON.stringify(type)} which is not a StaticSymbol`);
    }
    try {
      let parameters = this.parameterCache.get(type);
      if (!parameters) {
        let classMetadata = this.getTypeMetadata(type);
        let members = classMetadata ? classMetadata['members'] : null;
        let ctorData = members ? members['__ctor__'] : null;
        if (ctorData) {
          let ctor = (<any[]>ctorData).find(a => a['__symbolic'] == 'constructor');
          let parameterTypes = <any[]>this.simplify(type, ctor['parameters'] || []);
          let parameterDecorators = <any[]>this.simplify(type, ctor['parameterDecorators'] || []);

          parameters = [];
          parameterTypes.forEach((paramType, index) => {
            let nestedResult: any[] = [];
            if (paramType) {
              nestedResult.push(paramType);
            }
            let decorators = parameterDecorators ? parameterDecorators[index] : null;
            if (decorators) {
              nestedResult.push(...decorators);
            }
            parameters.push(nestedResult);
          });
        }
        if (!parameters) {
          parameters = [];
        }
        this.parameterCache.set(type, parameters);
      }
      return parameters;
    } catch (e) {
      console.log(`Failed on type ${JSON.stringify(type)} with error ${e}`);
      throw e;
    }
  }

  hasLifecycleHook(type: any, lcInterface: /*Type*/ any, lcProperty: string): boolean {
    if (!(type instanceof StaticSymbol)) {
      throw new Error(
          `hasLifecycleHook received ${JSON.stringify(type)} which is not a StaticSymbol`);
    }
    let classMetadata = this.getTypeMetadata(type);
    let members = classMetadata ? classMetadata['members'] : null;
    let member:any[] = members ? members[lcProperty] : null;
    return member ? member.some(a => a['__symbolic'] == 'method') : false;
  }

  private registerDecoratorOrConstructor(type: StaticSymbol, ctor: any): void {
    this.conversionMap.set(type, (context: StaticSymbol, args: any[]) => {
      let argValues: any[] = [];
      args.forEach((arg, index) => {
        let argValue: any;
        if (typeof arg === 'object' && !arg['__symbolic']) {
          argValue = mapStringMap(arg, (value, key) => this.simplify(context, value));
        } else {
          argValue = this.simplify(context, arg);
        }
        argValues.push(argValue);
      });
      var metadata = Object.create(ctor.prototype);
      ctor.apply(metadata, argValues);
      return metadata;
    });
  }

  private registerFunction(type: StaticSymbol, fn: any): void {
    this.conversionMap.set(type, (context: StaticSymbol, args: any[]) => {
      let argValues: any[] = [];
      args.forEach((arg, index) => {
        let argValue = this.simplify(context, arg);
        argValues.push(argValue);
      });
      return fn.apply(null, argValues);
    });
  }

  private initializeConversionMap(): void {
    const {coreDecorators, diDecorators, diMetadata, animationMetadata, provider} = this.host.angularImportLocations();
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
                                        DirectiveMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Component'),
                                        ComponentMetadata);

    // Note: Some metadata classes can be used directly with Provider.deps.
    this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'HostMetadata'),
                                        HostMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'SelfMetadata'),
                                        SelfMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'SkipSelfMetadata'),
                                        SkipSelfMetadata);
    this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'OptionalMetadata'),
                                        OptionalMetadata);

    this.registerFunction(this.host.findDeclaration(animationMetadata, 'trigger'), trigger);
    this.registerFunction(this.host.findDeclaration(animationMetadata, 'state'), state);
    this.registerFunction(this.host.findDeclaration(animationMetadata, 'transition'), transition);
    this.registerFunction(this.host.findDeclaration(animationMetadata, 'style'), style);
    this.registerFunction(this.host.findDeclaration(animationMetadata, 'animate'), animate);
    this.registerFunction(this.host.findDeclaration(animationMetadata, 'keyframes'), keyframes);
    this.registerFunction(this.host.findDeclaration(animationMetadata, 'sequence'), sequence);
    this.registerFunction(this.host.findDeclaration(animationMetadata, 'group'), group);
  }

  /** @internal */
  public simplify(context: StaticSymbol, value: any): any {
    let _this = this;

    function simplify(expression: any): any {
      if (isPrimitive(expression)) {
        return expression;
      }
      if (expression instanceof Array) {
        let result: any[] = [];
        for (let item of(<any>expression)) {
          result.push(simplify(item));
        }
        return result;
      }
      if (expression) {
        if (expression['__symbolic']) {
          let staticSymbol: StaticSymbol;
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
              if (indexTarget && isPrimitive(index)) return indexTarget[index];
              return null;
            case "select":
              let selectTarget = simplify(expression['expression']);
              let member = simplify(expression['member']);
              if (selectTarget && isPrimitive(member)) return selectTarget[member];
              return null;
            case "reference":
              if (expression['module']) {
                staticSymbol = _this.host.findDeclaration(expression['module'], expression['name'],
                                                          context.filePath);
              } else {
                staticSymbol = _this.host.getStaticSymbol(context.filePath, expression['name']);
              }
              let result = staticSymbol;
              let moduleMetadata = _this.getModuleMetadata(staticSymbol.filePath);
              let declarationValue =
                  moduleMetadata ? moduleMetadata['metadata'][staticSymbol.name] : null;
              if (declarationValue) {
                result = _this.simplify(staticSymbol, declarationValue);
              }
              return result;
            case "class":
              return context;
            case "new":
            case "call":
              let target = expression['expression'];
              if (target['module']) {
                staticSymbol =
                  _this.host.findDeclaration(target['module'], target['name'], context.filePath);
              } else {
                staticSymbol = _this.host.getStaticSymbol(context.filePath, target['name']);
              }
              let converter = _this.conversionMap.get(staticSymbol);
              if (converter) {
                let args = expression['arguments'];
                if (!args) {
                  args = [];
                }
                return converter(context, args);
              } else {
                return context;
              }
             case "error":
              throw new Error(expression['message']);
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
    if (!moduleMetadata) {
      moduleMetadata = this.host.getMetadataFor(module);
      if (Array.isArray(moduleMetadata)) {
        moduleMetadata = (<Array<any>>moduleMetadata).find(element => element.version === SUPPORTED_SCHEMA_VERSION) || moduleMetadata[0];
      }
      if (!moduleMetadata) {
        moduleMetadata = {__symbolic: "module", version: SUPPORTED_SCHEMA_VERSION, module: module, metadata: {}};
      }
      if (moduleMetadata['version'] != SUPPORTED_SCHEMA_VERSION) {
        throw new Error(`Metadata version mismatch for module ${module}, found version ${moduleMetadata['version']}, expected ${SUPPORTED_SCHEMA_VERSION}`);
      }
      this.metadataCache.set(module, moduleMetadata);
    }
    return moduleMetadata;
  }

  private getTypeMetadata(type: StaticSymbol): {[key: string]: any} {
    let moduleMetadata = this.getModuleMetadata(type.filePath);
    let result = moduleMetadata['metadata'][type.name];
    if (!result) {
      result = {__symbolic: "class"};
    }
    return result;
  }
}

function mapStringMap(input: {[key: string]: any},
                      transform: (value: any, key: string) => any): {[key: string]: any} {
  if (!input) return {};
  var result: {[key: string]: any} = {};
  Object.keys(input).forEach((key) => { result[key] = transform(input[key], key); });
  return result;
}

function isPrimitive(o: any): boolean {
  return o === null || (typeof o !== "function" && typeof o !== "object");
}
