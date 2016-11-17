# Generating API Docs with Typedoc
[Typedoc](http://typedoc.org/) is a documentation generator for TypeScript projects.

Refer to `typedoc.json` for build configuration.

1. `npm install`
2. `npm run api`

TypeDoc will leverage the typings file to generate docs. The output will be located in `/dist/api/api.json`.

## FAQ

### How do I stop HTML generation and focus only on JSON?
Currently not possible, submitted a feature request: https://github.com/TypeStrong/typedoc/issues/337

### How do I prevent `Cannot find name` errors?
When typedoc is invoked tsconfig and typings file must be in the path.

### How do we omit constructors or other methods from the components?
You can either ignore them from the output file, or use the `@hidden` tag in the source code to omit a method or
property from being generated as docs. The recommended approach is to ignore them since adding the hidden tag will
create a lot of noise

### Can we detect Inputs and Outputs from Angular components?
Yes, check the decorators key-value on the json file for that particular component.

### Can we generate a json file for a specific component?
Yes, if we were to invoke `./node_modules/.bin/typedoc --options ./src/lib/typedoc.json --ignoreCompilerErrors ./src/lib/button`
We could theoretically generate a json file just for button, but we would ignore compiler errors because button does
not have a tsconfig or typings file local to its implementation.