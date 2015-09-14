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
import {MapWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
import * as cpl from './directive_metadata';
import * as dirAnn from 'angular2/src/core/metadata/directives';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {ViewResolver} from 'angular2/src/core/compiler/view_resolver';
import {ViewMetadata} from 'angular2/src/core/metadata/view';
import {hasLifecycleHook} from 'angular2/src/core/compiler/directive_lifecycle_reflector';
import {LifecycleHooks} from 'angular2/src/core/compiler/interfaces';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {Injectable} from 'angular2/src/core/di';

// group 1: "property" from "[property]"
// group 2: "event" from "(event)"
var HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))$/g;

@Injectable()
export class RuntimeMetadataResolver {
  private _directiveCounter = 0;
  private _cache: Map<Type, cpl.DirectiveMetadata> = new Map();

  constructor(private _directiveResolver: DirectiveResolver, private _viewResolver: ViewResolver) {}

  getMetadata(directiveType: Type): cpl.DirectiveMetadata {
    var meta = this._cache.get(directiveType);
    if (isBlank(meta)) {
      var directiveAnnotation = this._directiveResolver.resolve(directiveType);
      var moduleId = calcModuleId(directiveType, directiveAnnotation);
      var templateMeta = null;
      var hostListeners = {};
      var hostProperties = {};
      var hostAttributes = {};
      var changeDetectionStrategy = null;
      var dynamicLoadable: boolean = false;

      if (isPresent(directiveAnnotation.host)) {
        StringMapWrapper.forEach(directiveAnnotation.host, (value: string, key: string) => {
          var matches = RegExpWrapper.firstMatch(HOST_REG_EXP, key);
          if (isBlank(matches)) {
            hostAttributes[key] = value;
          } else if (isPresent(matches[1])) {
            hostProperties[matches[1]] = value;
          } else if (isPresent(matches[2])) {
            hostListeners[matches[2]] = value;
          }
        });
      }
      if (directiveAnnotation instanceof dirAnn.ComponentMetadata) {
        var compAnnotation = <dirAnn.ComponentMetadata>directiveAnnotation;
        var viewAnnotation = this._viewResolver.resolve(directiveType);
        templateMeta = new cpl.TemplateMetadata({
          encapsulation: viewAnnotation.encapsulation,
          template: viewAnnotation.template,
          templateUrl: viewAnnotation.templateUrl,
          styles: viewAnnotation.styles,
          styleUrls: viewAnnotation.styleUrls,
          hostAttributes: hostAttributes
        });
        changeDetectionStrategy = compAnnotation.changeDetection;
        dynamicLoadable = compAnnotation.dynamicLoadable;
      }
      meta = new cpl.DirectiveMetadata({
        selector: directiveAnnotation.selector,
        isComponent: isPresent(templateMeta),
        dynamicLoadable: dynamicLoadable,
        type: new cpl.TypeMetadata({
          id: this._directiveCounter++,
          name: stringify(directiveType),
          moduleId: moduleId,
          runtime: directiveType
        }),
        template: templateMeta,
        changeDetection: new cpl.ChangeDetectionMetadata({
          changeDetection: changeDetectionStrategy,
          properties: directiveAnnotation.properties,
          events: directiveAnnotation.events,
          hostListeners: hostListeners,
          hostProperties: hostProperties,
          callAfterContentInit: hasLifecycleHook(LifecycleHooks.AfterContentInit, directiveType),
          callAfterContentChecked:
              hasLifecycleHook(LifecycleHooks.AfterContentChecked, directiveType),
          callAfterViewInit: hasLifecycleHook(LifecycleHooks.AfterViewInit, directiveType),
          callAfterViewChecked: hasLifecycleHook(LifecycleHooks.AfterViewChecked, directiveType),
          callOnChanges: hasLifecycleHook(LifecycleHooks.OnChanges, directiveType),
          callDoCheck: hasLifecycleHook(LifecycleHooks.DoCheck, directiveType),
          callOnInit: hasLifecycleHook(LifecycleHooks.OnInit, directiveType),
        })
      });
      this._cache.set(directiveType, meta);
    }
    return meta;
  }

  getViewDirectivesMetadata(component: Type): cpl.DirectiveMetadata[] {
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

function removeDuplicatedDirectives(directives: cpl.DirectiveMetadata[]): cpl.DirectiveMetadata[] {
  var directivesMap: Map<number, cpl.DirectiveMetadata> = new Map();
  directives.forEach((dirMeta) => { directivesMap.set(dirMeta.type.id, dirMeta); });
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

function calcModuleId(type: Type, directiveAnnotation: dirAnn.DirectiveMetadata): string {
  if (isPresent(directiveAnnotation.moduleId)) {
    return directiveAnnotation.moduleId;
  } else {
    return reflector.moduleId(type);
  }
}
