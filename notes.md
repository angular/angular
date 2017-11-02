# Notes

* TreeNode is not public. Decision: change it to a POJO, so tree information is "easily" serializable.



# DEFINE:

# TODOS:

* DONE Replace TreeNode with a POJO
* DONE Implement a function to convert a "tree node" of RouteSnapshot into RouterStateSnapshot
* DONE Change recognize to construct a TreeNode<RouteSnapshot> and then convert it to RouterStateSnapshot in the router
* DONE Change Preactivation
  * DONE Fix type errors (mostly tests)
  * DONE Make guards pass locally
  * DONE Inherit resolve
    * DONE Needs something like a `map` function for a TreeNode. Need to inherit resolve data immutably for new data structures, but must mutate old data structures.
  * DONE Make resolve pass locally
* Update Router to new TreeNode<RouteConfig>
* Fix "boom" error message
* equalParamsAndUrlSegments needs to have the logic to check all the way to the root
* _MILESTONE_: All tests should pass
* Change Activation

# DESIGN

## Scrolling (non breaking)

  ### Action Items:
  * Victor: Finish the implementation and send out a PR
  * Jason: Review the PR and provide feedback

## Testing Improvements

### Actions Items:

  * Victor: Implement it and send out a PR
  * Jason: Review the PR and provide feedback

## Introduce RouteSnapshot (non breaking)

### Goal:

  * The Router class only stores TreeNode<RouteSnapshot> and does not store RouterStateSnapshot
  * RouterStateSnapshot can still be created but should not be stored (only in runNavigate)
  * RouteSnapshot is serializable and immutable, so we can improve {enableTracing} by adding it to the events, so we can do something like `event.toJSON()`
  * RouterStateSnapshot is not immutable and is only supported not to break folks
  * RouterStateSnapshot is derived from TreeNode<RouteSnapshot> (with some exceptions when running resolvers)
  * It is easier to troubleshoot the router (we can also do JSON.stringify)
  * Makes universal/redux devtools easier

### Action Items:

  * Finish updating resolvers to work with RouteSnapshot
  * Update Activation to use RouteSnapshot
  * Replace the currently stored RouterStateSnapshot with the new RouteSnapshot

## RouterStateSnapshot with TreeNode<RouteSnapshot>

### Action Items:

  * Expose TreeNode<RouteSnapshot> as a primary way of dealing with the router state
  * Deprecate RouterStateSnapshot

## Refactor UrlTree

### Goals:

  * Get rid of edge cases when running recognize and createUrlTree
  * Change UrlSegmentGroup not to have _sourceSegment and _segmentIndexShift
  * Make UrlTree an interface and make impl a POJO

### Action Items:

  * Look at recognize and remove all crazy split logic to create a list of scenarios that would fail
  * Change validateConfig to warn about those scenarios (=== deprecation)
  * Write in release notes that `instanceof UrlTree` will no longer work.

  An example of a configuration that should be deprecated:

    {
      path: '',
      component: Container,
      children: [
        {path: '', component: A},
        {path: '', component: B, outlet: 'aux'}
      ]
    }

## Make Activation router-independent

### Goals:

  * Being able to run activation independently, without having to run navigation (== without the router class)
  * createUrlTree and navigate should be treated differently: the first one is always available, the second is not / or is async
  * we can use activate to improve integration testing (can render a tree of components without worrying about urls or location)
  * rehydrate the content on the client

### Action Items:

  * Extract Activation into a separate function
  * Make the router without preactivation and activation and load them on demand

## Make Router use shared data structure

### Goals

  * Router to have access to singleton containing reference to data it needs
  * Separate serializable (frequently changing) state and non-serializable (largely static for lifecycle of the router) state

### Action Items:

  * Create new tuple containing route config and root component type (non-serializable state)
  * Create class to store serializable router state (mostly TreeNode<RouteSnapshot> plus URL)
  * Create class with access to both and selectors to get data needed for public API

```
  class Router {
    config: [Route[], rootComponentType];
    routerState: RouterState;
    state: SuperRouterStateSnapshot;
  }

  type RealConfig: [Route[], rootComponentType];

  SuperRouterStateSnapshot: {current tree, future tree, url, resolved data}; // immutable and serializable
    - data + selectors (i.e., getActivatedRoute(pathOrRoute, RealConfig): ActivatedRouteSnapshot)
```

## Convert to new RxJS `pipe` API

### Action Items

  * All rxjs code to use the new api (no ugly `map.call`)

## Fixing data merge and "resolve"

### Goals:

  * Simplify merging of params and data (from the node to the root)
  * We can store resolvedData separately (required for resolvers, and OK for components)
  * Make ".parent" rarely needed

### Action Items:

  * Update the merging strategy (inheritedParamsDataResolve should not require "routes")
  * Expose a function to get a node's parent

  ```
  class Resolver implements Resolve {
    resolve(route: RouteSnapshot, resolvedData: {[k: string]: any}) {
    }
  }
  ```



## Optional work:

* Change ActivatedRouteSnapshot to store a proper URL tree address ({node: number[], segmentIndex: number}) instead of the group itself. Change createUrlTree to use that.
* Maybe make UrlSegment a POJO? or map the data into url segments in our helper function
* Make TreeNode.children optional


```
RouterModule.forRoot([
  {
    path: 'company/:id',
    resolve: {company: FetchCompany},
    children: [
      {
        path: 'employee/:id',
        resolve: {employee: FetchEmployee}
      }
    ]
  }
])


class FetchEmployee {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return fetchEmployee(route.parent.data.company.name, route.paramd.id);
  }
}
```



