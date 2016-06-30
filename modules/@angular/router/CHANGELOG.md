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