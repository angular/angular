import {RouterConfig} from '../src/config';
import {recognize} from '../src/recognize';
import {resolve} from '../src/resolve';
import {RouterStateSnapshot} from '../src/router_state';
import {DefaultUrlSerializer, UrlSegment, UrlTree} from '../src/url_tree';

describe('resolve', () => {
  it('should resolve components', () => {
    checkResolve(
        [{path: 'a', component: 'ComponentA'}], 'a', {ComponentA: 'ResolvedComponentA'},
        (resolved: RouterStateSnapshot) => {
          expect(resolved.firstChild(resolved.root)._resolvedComponentFactory)
              .toEqual('ResolvedComponentA');
        });
  });

  it('should not resolve componentless routes', () => {
    checkResolve([{path: 'a', children: []}], 'a', {}, (resolved: RouterStateSnapshot) => {
      expect(resolved.firstChild(resolved.root)._resolvedComponentFactory).toEqual(null);
    });
  });
});

function checkResolve(
    config: RouterConfig, url: string, resolved: {[k: string]: string}, callback: any): void {
  const resolver = {
    resolveComponent: (component: string): Promise<any> => {
      if (resolved[component]) {
        return Promise.resolve(resolved[component]);
      } else {
        return Promise.reject('unknown component');
      }
    }
  };

  recognize(RootComponent, config, tree(url), url)
      .mergeMap(s => resolve(<any>resolver, s))
      .subscribe(callback, e => { throw e; });
}

function tree(url: string): UrlTree {
  return new DefaultUrlSerializer().parse(url);
}

class RootComponent {}
class ComponentA {}
class ComponentB {}
class ComponentC {}
