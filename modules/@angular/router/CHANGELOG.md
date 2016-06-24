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