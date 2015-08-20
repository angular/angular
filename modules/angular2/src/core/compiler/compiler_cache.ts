import {Injectable} from 'angular2/di';
import {Map} from 'angular2/src/facade/collection';
import {Type, normalizeBlank} from 'angular2/src/facade/lang';
import {AppProtoView} from './view';

/**
 * Cache that stores the AppProtoView of the template of a component.
 * Used to prevent duplicate work and resolve cyclic dependencies.
 */
@Injectable()
export class CompilerCache {
  _cache: Map<string, AppProtoView> = new Map();

  setProtView(protoView: AppProtoView): void { this._cache.set(protoView.id, protoView); }

  getProtoView(protoViewId: string): AppProtoView {
    var result = this._cache.get(protoViewId);
    return normalizeBlank(result);
  }

  clear(): void {
    this._cache.clear();
  }
}
