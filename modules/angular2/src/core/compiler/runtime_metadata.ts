import {resolveForwardRef} from 'angular2/src/core/di';
import {
  Type,
  isBlank,
  isPresent,
  isArray,
  stringify,
  RegExpWrapper
} from 'angular2/src/core/facade/lang';
import {BaseException} from 'angular2/src/core/facade/exceptions';
import {MapWrapper, StringMapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import * as cpl from './directive_metadata';
import * as dirAnn from 'angular2/src/core/metadata/directives';
import {DirectiveResolver} from 'angular2/src/core/linker/directive_resolver';
import {ViewResolver} from 'angular2/src/core/linker/view_resolver';
import {ViewMetadata} from 'angular2/src/core/metadata/view';
import {hasLifecycleHook} from 'angular2/src/core/linker/directive_lifecycle_reflector';
import {LifecycleHooks, LIFECYCLE_HOOKS_VALUES} from 'angular2/src/core/linker/interfaces';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {Injectable} from 'angular2/src/core/di';
import {MODULE_SUFFIX} from './util';

// group 1: "property" from "[property]"
// group 2: "event" from "(event)"
var HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))$/g;

@Injectable()
export class RuntimeMetadataResolver {
  private _cache = new Map<Type, cpl.CompileDirectiveMetadata>();

  constructor(private _directiveResolver: DirectiveResolver, private _viewResolver: ViewResolver) {}

  getMetadata(directiveType: Type): cpl.CompileDirectiveMetadata {
    var meta = this._cache.get(directiveType);
    if (isBlank(meta)) {
      var directiveAnnotation = this._directiveResolver.resolve(directiveType);
      var moduleUrl = calcModuleUrl(directiveType, directiveAnnotation);
      var templateMeta = null;
      var changeDetectionStrategy = null;

      if (directiveAnnotation instanceof dirAnn.ComponentMetadata) {
        var compAnnotation = <dirAnn.ComponentMetadata>directiveAnnotation;
        var viewAnnotation = this._viewResolver.resolve(directiveType);
        templateMeta = new cpl.CompileTemplateMetadata({
          encapsulation: viewAnnotation.encapsulation,
          template: viewAnnotation.template,
          templateUrl: viewAnnotation.templateUrl,
          styles: viewAnnotation.styles,
          styleUrls: viewAnnotation.styleUrls
        });
        changeDetectionStrategy = compAnnotation.changeDetection;
      }
      meta = cpl.CompileDirectiveMetadata.create({
        selector: directiveAnnotation.selector,
        exportAs: directiveAnnotation.exportAs,
        isComponent: isPresent(templateMeta),
        dynamicLoadable: true,
        type: new cpl.CompileTypeMetadata(
            {name: stringify(directiveType), moduleUrl: moduleUrl, runtime: directiveType}),
        template: templateMeta,
        changeDetection: changeDetectionStrategy,
        inputs: directiveAnnotation.inputs,
        outputs: directiveAnnotation.outputs,
        host: directiveAnnotation.host,
        lifecycleHooks: ListWrapper.filter(LIFECYCLE_HOOKS_VALUES,
                                           hook => hasLifecycleHook(hook, directiveType))
      });
      this._cache.set(directiveType, meta);
    }
    return meta;
  }

  getViewDirectivesMetadata(component: Type): cpl.CompileDirectiveMetadata[] {
    var view = this._viewResolver.resolve(component);
    var directives = flattenDirectives(view);
    for (var i = 0; i < directives.length; i++) {
      if (!isValidDirective(directives[i])) {
        throw new BaseException(
            `Unexpected directive value '${stringify(directives[i])}' on the View of component '${stringify(component)}'`);
      }
    }
    return removeDuplicatedDirectives(directives.map(type => this.getMetadata(type)));
  }
}

function removeDuplicatedDirectives(directives: cpl.CompileDirectiveMetadata[]):
    cpl.CompileDirectiveMetadata[] {
  var directivesMap = new Map<Type, cpl.CompileDirectiveMetadata>();
  directives.forEach((dirMeta) => { directivesMap.set(dirMeta.type.runtime, dirMeta); });
  return MapWrapper.values(directivesMap);
}

function flattenDirectives(view: ViewMetadata): Type[] {
  if (isBlank(view.directives)) return [];
  var directives = [];
  flattenList(view.directives, directives);
  return directives;
}

function flattenList(tree: any[], out: Array<Type | any[]>): void {
  for (var i = 0; i < tree.length; i++) {
    var item = resolveForwardRef(tree[i]);
    if (isArray(item)) {
      flattenList(item, out);
    } else {
      out.push(item);
    }
  }
}

function isValidDirective(value: Type): boolean {
  return isPresent(value) && (value instanceof Type);
}

function calcModuleUrl(type: Type, directiveAnnotation: dirAnn.DirectiveMetadata): string {
  if (isPresent(directiveAnnotation.moduleId)) {
    return `package:${directiveAnnotation.moduleId}${MODULE_SUFFIX}`;
  } else {
    return reflector.importUri(type);
  }
}
