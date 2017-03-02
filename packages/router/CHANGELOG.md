# 3.0.0-rc.2 (2016-08-31)

## Features
* feat(router): use ES modules for primary build in the npm package ([#11120](https://github.com/angular/angular/issues/11120)) ([9796579](https://github.com/angular/angular/commit/9796579))

## Bug Fixes

* fix(router): use encodeUri/decodeUri to encode fragment ([bb9dfbc](https://github.com/angular/angular/commit/bb9dfbc))
* fix(router): add an option to disable initial navigation ([a2deafc](https://github.com/angular/angular/commit/a2deafc))
* fix(router): canLoad should cancel a navigation instead of failing it ([#11001](https://github.com/angular/angular/issues/11001)) ([f1ce760](https://github.com/angular/angular/commit/f1ce760))
* fix(router): do not use rx/add/operator ([c350ba2](https://github.com/angular/angular/commit/c350ba2))
* fix(router): fix the order of guards, so canActivateChild runs before canActivate ([0bb516f](https://github.com/angular/angular/commit/0bb516f))
* fix(router): lazy loading keeps refetching modules ([#10707](https://github.com/angular/angular/issues/10707)) ([cc6749c](https://github.com/angular/angular/commit/cc6749c))
* fix(router): location changes and redirects break the back button ([#10742](https://github.com/angular/angular/issues/10742)) ([04c6b2f](https://github.com/angular/angular/commit/04c6b2f))
* fix(router): make routerLinkActiveOptions public ([#10758](https://github.com/angular/angular/issues/10758)) ([73c0a9d](https://github.com/angular/angular/commit/73c0a9d))
* fix(router): support guards navigating synchronously ([#11150](https://github.com/angular/angular/issues/11150)) ([e2241a2](https://github.com/angular/angular/commit/e2241a2))
* fix(router): support relative param-only navigation ([#10613](https://github.com/angular/angular/issues/10613)) ([c7f3aa7](https://github.com/angular/angular/commit/c7f3aa7))
* fix(router): update the location before activating components ([2ffecc0](https://github.com/angular/angular/commit/2ffecc0))
* fix(router): fix type ([#11181](https://github.com/angular/angular/issues/11181)) ([0f68351](https://github.com/angular/angular/commit/0f68351))
* fix(router): merge artifacts ([fc1e45d](https://github.com/angular/angular/commit/fc1e45d)), closes [#11063](https://github.com/angular/angular/issues/11063) [#11102](https://github.com/angular/angular/issues/11102)
* fix(router): correct RxJS mapping in rollup config for umd/es5 bundles ([174c016](https://github.com/angular/angular/commit/174c016))



# 3.0.0-rc.1 (2016-08-09)

## Features
* feat(router): add support for lazily loaded modules
* feat(router): empty-path routes should inherit matrix params
* feat(router): add activate and deactivate events to RouterOutlet
* feat(router): update routerLink DSL to handle aux routes
* feat(router): add support for canActivateChild
* feat(router): guards and data resolvers can now return promises
* feat(router): rename PRIMARY_OUTLET into primary
* feat(router): rename UrlPathWithParams into UrlSegment
* feat(router): implement canLoad
* feat(router): take advantage of the new way of configuring modules
* feat(router): ActivateRoute should expose its route config
* feat(router): add isActive to router
* feat(router): add a validation to make sure pathMatch is set correctly
* feat(router): add parent, children, firstChild to ActivatedRoute
* feat(router): add queryParams and fragment to every activated route
* feat(router): add route.root returning the root of router state

## Bug Fixes
* fix(router): update links when query params change
* fix(router): handle router outlets in ngIf
* fix(router): encode/decode params and path segments
* fix(router): disallow root segments with matrix params
* fix(router): update current state and url before activating components
* fix(router): do not fire events on 'duplicate' location events
* fix(router): freeze params and queryParams to prevent common source of errors
* fix(router): expose initalNavigation
* fix(router): back button does not work in IE11 and Safari
* fix(router): navigation should not preserve query params and fragment by default
* fix(router): routerLinkActive should only set classes after the router has successfully navigated
* fix(router): handle urls with only secondary top-level segments
* fix(router): router link active should take all descendants into account
* fix(router): handle when both primary and secondary are empty-path routes have children
* fix(router): updates router module to be offline-compilation friendly
* fix(router): relax type defintion of Route to improve dev ergonomics)
* fix(router): make an outlet to unregister itself when it is removed from the DOM
* fix(router): add segmentPath to the link DSL
* fix(router): absolute redirects should work with lazy loading
* fix(router): fix matrix params check to handle 'special' objects
* fix(router): support outlets in non-absolute positions
* fix(router): route.parent should work for secondary children

## Breaking Changes

* PRIMARY_OUTLET got renamed into 'primary'
* UrlPathWithParams got renamed into UrlSegment
* Query params and fragment are not longer preserved by default

# 3.0.0-beta.2 (2016-06-30)

## Bug Fixes
* fix(router): remove private and internal annotations
* fix(router): remove the precompile warning

# 3.0.0-beta.1 (2016-06-30)

## Features
* feat(router): make router links work on non-a tags
* feat(router): add pathMatch property to replace terminal
* feat(router): use componentFactoryResolver
* feat(router): implement data and resolve

## Bug Fixes
* fix(router): fix RouterLinkActive to handle the case when the link has extra paths
* fix(router): redirect should not add unnecessary brackets
* fix(router): reexport router directives
* fix(router): make the constructor of the router service public
* fix(router): top-levels do not work in ngIf
* fix(router): canceled navigations should return a promise that is resolved with false
* fix(router): handle empty path with query params
* fix(router): preserve fragment on initial load

# 3.0.0-alpha.8 (2016-06-24)

## Features
* feat(router): add support for componentless routes
* feat(router): add UMD bundles

## Bug Fixes
* fix(router): handle path:'' redirects and matches
* fix(router): wildcard don't get notified on url changes
* fix(router): default exact to false in routerLinkActiveOptions
* fix(router): doesn't throw on canDeactivate when a route hasn't advanced

# 3.0.0-alpha.7 (2016-06-17)

## Features
* feat(router): add route config validation
* feat(router): do not support paths starting with /
* feat(router): drop index property

## Bug Fixes
* fix(router): stringify positional parameters when using routerLink
* fix(router): change serialize not to require parenthesis in query string to be encoded

## Breaking Changes

No longer supporting paths starting with /

BEFORE
The following two routes were equivalent:
{ path: '/a', component: ComponentA }
{ path: 'a', component: ComponentA }

AFTER
Only the following works:
{ path: 'a', component: ComponentA }

No longer supporting index routs

BEFORE
The following two routes were equivalent:
{ path: '', component: ComponentA }
{ index: true, component: ComponentA }

AFTER
Only the following works:
{ path: '', component: ComponentA }


# 3.0.0-alpha.6 (2016-06-16)