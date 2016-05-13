# TypeScript Decorator metadata collector

The `.d.ts` format does not preserve information about the Decorators applied to symbols.
Some tools, such as Angular 2 template compiler, need access to statically analyzable
information about Decorators, so this library allows programs to produce a `foo.metadata.json`
to accompany a `foo.d.ts` file, and preserves the information that was lost in the declaration
emit.

## Releasing
```
$ gulp build.tools
$ cp tools/metadata/package.json dist/tools/metadata/
$ npm login [angularcore]
$ npm publish dist/tools/metadata
```