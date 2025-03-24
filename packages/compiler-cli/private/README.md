This is a directory defining the `@angular/compiler-cli/private` entry-point. The entry-point can be used to
expose code that is needed by other Angular framework packages, without having to expose code through the primary
entry-point.

The primary entry-point has a couple of downsides when it comes to cross-package imports:
 * It exports various other things that will end up creating additional type dependencies. e.g. when
   the Angular localize package relies on it, it might end up accidentally relying on `@types/node`.
 * The primary entry-point has a larger build graph, slowing down local development as much more things
   can invalidate the dependent targets. A smaller subset leads to faster incremental builds.