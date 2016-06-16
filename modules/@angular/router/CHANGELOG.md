# 3.0.0-alpha.7 (--)

## Features
* feat(router): add route config validation
* feat(router): do not support paths starting with /
* feat(router): drop index property

## Bug Fixes
* fix(router): stringify positional parameters when using routerLink

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