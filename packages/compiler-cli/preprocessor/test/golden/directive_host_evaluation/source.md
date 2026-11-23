# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["consts.ts", "host.ts"]
}
```

# /consts.ts
```ts
export declare function mk(): string;

export const PREFIX = 'pre';
export const SHARED_HOST = { 'data-shared': 'shared', '[attr.t]': 'title' };
export const FOREIGN_DYN = mk();
```

# /host.ts
```ts
import { Component, Directive } from '@angular/core';
import { PREFIX, SHARED_HOST, FOREIGN_DYN } from './consts';

const A = 'foo';
const B = 'bar';
const KEY = 'data-key';
const EXPR = 'title';
const LOCAL_HOST = { 'data-whole': 'whole-value', '[attr.x]': 'title' };

enum E {
  Val = 'enum-value',
}

declare const dyn: any;

// A `+` concatenation is folded by the partial evaluator, so the attribute value is the
// coerced result rather than the source text.
@Directive({ selector: '[numAttr]', host: { 'data-num': '' + 42 } })
export class NumAttr {}

// Concatenation, template literals and constant references all fold to their value.
@Directive({
  selector: '[folded]',
  host: { 'data-concat': A + B, 'data-tmpl': `${A}-${B}`, 'data-const': A, 'data-enum': E.Val },
})
export class Folded {}

// A computed key is evaluated too, so the attribute is named `data-key`, not `KEY`.
@Directive({ selector: '[computedKey]', host: { [KEY]: 'v' } })
export class ComputedKey {}

// The whole `host` object may be reached through a constant.
@Directive({ selector: '[wholeObject]', host: LOCAL_HOST })
export class WholeObject {
  title = 'x';
}

// Folding happens before host bindings are parsed, so a constant may carry the binding
// and listener expressions themselves.
@Directive({ selector: '[foldedExpr]', host: { '[attr.b]': EXPR, '(click)': A + '()' } })
export class FoldedExpr {
  title = 'x';
  foo() {}
}

// A value that is not statically evaluable is emitted verbatim, as ngtsc's `WrappedNodeExpr`
// passthrough does.
@Directive({ selector: '[dynamicValue]', host: { 'data-dyn': dyn.thing } })
export class DynamicValue {}

// A local constant that is itself unevaluable reports the *reference*, not the constant's
// initializer, so `LOCAL_DYN` is emitted rather than `mkLocal()`.
declare function mkLocal(): string;
const LOCAL_DYN = mkLocal();

@Directive({ selector: '[localDynamicConst]', host: { 'data-l': LOCAL_DYN } })
export class LocalDynamicConst {}

// Constants imported from another file resolve in optimized (whole-program) mode. The
// unoptimized mode is single-file, so it emits the unresolved reference verbatim instead —
// note that this is the pipeline's own local mode, not ngtsc's `compilationMode: local`,
// which does resolve across files.
@Directive({ selector: '[crossFile]', host: { 'data-x': PREFIX + '-suffix' } })
export class CrossFile {}

@Directive({ selector: '[crossFileObject]', host: SHARED_HOST })
export class CrossFileObject {
  title = 'x';
}

// An imported constant that does not fold must still name the local reference in both modes:
// resolving it across files must not re-anchor the value onto a node in `consts.ts`, which
// this file could not emit.
@Directive({ selector: '[crossFileDynamic]', host: { 'data-g': FOREIGN_DYN } })
export class CrossFileDynamic {}

@Component({ selector: 'cmp-host', template: '', host: { 'data-c': A + B, '[attr.a]': EXPR } })
export class CmpHost {
  title = 'x';
}
```
