import {resolveForwardRef} from 'angular2/src/core/di';
import {
  Type,
  isBlank,
  isPresent,
  isArray,
  stringify,
  RegExpWrapper
} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import * as cpl from './directive_metadata';
import * as md from 'angular2/src/core/metadata/directives';
import {DirectiveResolver} from 'angular2/src/core/linker/directive_resolver';
import {ViewResolver} from 'angular2/src/core/linker/view_resolver';
import {ViewMetadata} from 'angular2/src/core/metadata/view';
import {hasLifecycleHook} from 'angular2/src/core/linker/directive_lifecycle_reflector';
import {LifecycleHooks, LIFECYCLE_HOOKS_VALUES} from 'angular2/src/core/linker/interfaces';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {Injectable, Inject, Optional} from 'angular2/src/core/di';
import {PLATFORM_DIRECTIVES} from 'angular2/src/core/platform_directives_and_pipes';
import {MODULE_SUFFIX} from './util';
import {getUrlScheme} from 'angular2/src/compiler/url_resolver';

@Injectable()
export class RuntimeMetadataResolver {
  private _cache = new Map<Type, cpl.CompileDirectiveMetadata>();

  constructor(private _directiveResolver: DirectiveResolver, private _viewResolver: ViewResolver,
              @Optional() @Inject(PLATFORM_DIRECTIVES) private _platformDirectives: Type[]) {}

  getMetadata(directiveType: Type): cpl.CompileDirectiveMetadata {
    var meta = this._cache.get(directiveType);
    if (isBlank(meta)) {
      var dirMeta = this._directiveResolver.resolve(directiveType);
      var moduleUrl = null;
      var templateMeta = null;
      var changeDetectionStrategy = null;

      if (dirMeta instanceof md.ComponentMetadata) {
        var cmpMeta = <md.ComponentMetadata>dirMeta;
        moduleUrl = calcModuleUrl(directiveType, cmpMeta);
        var viewMeta = this._viewResolver.resolve(directiveType);
        templateMeta = new cpl.CompileTemplateMetadata({
          encapsulation: viewMeta.encapsulation,
          template: viewMeta.template,
          templateUrl: viewMeta.templateUrl,
          styles: viewMeta.styles,
          styleUrls: viewMeta.styleUrls
        });
        changeDetectionStrategy = cmpMeta.changeDetection;
      }
      meta = cpl.CompileDirectiveMetadata.create({
        selector: dirMeta.selector,
        exportAs: dirMeta.exportAs,
        isComponent: isPresent(templateMeta),
        dynamicLoadable: true,
        type: new cpl.CompileTypeMetadata(
            {name: stringify(directiveType), moduleUrl: moduleUrl, runtime: directiveType}),
        template: templateMeta,
        changeDetection: changeDetectionStrategy,
        inputs: dirMeta.inputs,
        outputs: dirMeta.outputs,
        host: dirMeta.host,
        lifecycleHooks: LIFECYCLE_HOOKS_VALUES.filter(hook => hasLifecycleHook(hook, directiveType))
      });
      this._cache.set(directiveType, meta);
    }
    return meta;
  }

  getViewDirectivesMetadata(component: Type): cpl.CompileDirectiveMetadata[] {
    var view = this._viewResolver.resolve(component);
    var directives = flattenDirectives(view, this._platformDirectives);
    for (var i = 0; i < directives.length; i++) {
      if (!isValidDirective(directives[i])) {
        throw new BaseException(
            `Unexpected directive value '${stringify(directives[i])}' on the View of component '${stringify(component)}'`);
      }
    }

    return directives.map(type => this.getMetadata(type));
  }
}

function flattenDirectives(view: ViewMetadata, platformDirectives: any[]): Type[] {
  let directives = [];
  if (isPresent(platformDirectives)) {
    flattenArray(platformDirectives, directives);
  }
  if (isPresent(view.directives)) {
    flattenArray(view.directives, directives);
  }
  return directives;
}

function flattenArray(tree: any[], out: Array<Type | any[]>): void {
  for (var i = 0; i < tree.length; i++) {
    var item = resolveForwardRef(tree[i]);
    if (isArray(item)) {
      flattenArray(item, out);
    } else {
      out.push(item);
    }
  }
}

function isValidDirective(value: Type): boolean {
  return isPresent(value) && (value instanceof Type);
}

function calcModuleUrl(type: Type, cmpMetadata: md.ComponentMetadata): string {
  var moduleId = cmpMetadata.moduleId;
  if (isPresent(moduleId)) {
    var scheme = getUrlScheme(moduleId);
    return isPresent(scheme) && scheme.length > 0 ? moduleId :
                                                    `package:${moduleId}${MODULE_SUFFIX}`;
  } else {
    return reflector.importUri(type);
  }
}
