The source-map merging in these tests work out as follows:

Original code:

```
declare const $localize: any;

export function foo() {
  let name: string = 'World';
  let message: string = $localize `Hello, ${name}!`;
  console.log(message);
}
```

Translated code:

```
"use strict";Object.defineProperty(exports,"__esModule",{value:true});function foo(){let name="World";let message="Guten Tag, "+name+"!";console.log(message)}exports.foo=foo;//# sourceMappingURL=test.js.map
```

Merged source-map

```
{"version":3,"file":"","sources":[null,"packages/localize/src/tools/test/translate/integration/test_files/test.ts"],"sourceRoot":"","sourcesContent":[null,null],"names":["Object","defineProperty","exports","value","foo","name","message","console","log"],"mappings":"AAAA,aACAA,MAAM,CAACC,cAAP,CAAsBC,OAAtB,CAA+B,YAA/B,CAA6C,CAAEC,KAAK,CAAE,IAAT,CAA7C,ECCA,QAAgBC,CAAAA,GAAhB,EAAsB,CACpB,GAAIC,CAAAA,IAAI,CAAW,OAAnB,CACA,GAAIC,CAAAA,OAAO,GAAW,SAAS,CAAC,EAAUD,IAA/B,GAAW,CAAtB,CACAE,OAAO,CAACC,GAAR,CAAYF,OAAZ,CACD,CAJDJ,OAAO,IAAP,IAAA"}
```

Paste these files into http://evanw.github.io/source-map-visualization/ to see the result of the merging.