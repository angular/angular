import {Binding, resolveForwardRef, Injectable, Inject} from 'angular2/di';
import {
  Type,
  isBlank,
  isType,
  isPresent,
  BaseException,
  normalizeBlank,
  stringify,
  isArray,
  isPromise
} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';

import {DirectiveResolver} from './directive_resolver';

import {AppProtoView, AppProtoViewMergeMapping} from './view';
import {ProtoViewRef} from './view_ref';
import {DirectiveBinding} from './element_injector';
import {ViewResolver} from './view_resolver';
import {PipeResolver} from './pipe_resolver';
import {ViewMetadata} from 'angular2/metadata';
import {ComponentUrlMapper} from './component_url_mapper';
import {ProtoViewFactory} from './proto_view_factory';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {AppRootUrl} from 'angular2/src/services/app_root_url';
import {ElementBinder} from './element_binder';
import {wtfStartTimeRange, wtfEndTimeRange} from '../../profile/profile';
import {PipeBinding} from '../pipes/pipe_binding';
import {DEFAULT_PIPES_TOKEN} from 'angular2/pipes';

import {
  RenderDirectiveMetadata,
  ViewDefinition,
  RenderCompiler,
  ViewType,
  RenderProtoViewMergeMapping,
  RenderProtoViewRef
} from 'angular2/src/render/api';

import {PostCompiler} from './post_compiler';

/**
 *
 * ## URL Resolution
 *
 * ```
 * var appRootUrl: AppRootUrl = ...;
 * var componentUrlMapper: ComponentUrlMapper = ...;
 * var urlResolver: UrlResolver = ...;
 *
 * var componentType: Type = ...;
 * var componentAnnotation: ComponentAnnotation = ...;
 * var viewAnnotation: ViewAnnotation = ...;
 *
 * // Resolving a URL
 *
 * var url = viewAnnotation.templateUrl;
 * var componentUrl = componentUrlMapper.getUrl(componentType);
 * var componentResolvedUrl = urlResolver.resolve(appRootUrl.value, componentUrl);
 * var templateResolvedUrl = urlResolver.resolve(componetResolvedUrl, url);
 * ```
 */
@Injectable()
export class Compiler {
  /**
   * @private
   */
  constructor(private _postCompiler: PostCompiler) {
  }

  // Create a hostView as if the compiler encountered <hostcmp></hostcmp>.
  // Used for bootstrapping.
  compileInHost(componentType: Type): Promise<ProtoViewRef> {
    var r = wtfStartTimeRange('Compiler#compile()', stringify(componentType));
    // TODO: call the PreCompiler if needed!
    var protoViewRef = this._postCompiler.compileHost(componentType);
    wtfEndTimeRange(r);    
    return PromiseWrapper.resolve(protoViewRef);
  }
}
