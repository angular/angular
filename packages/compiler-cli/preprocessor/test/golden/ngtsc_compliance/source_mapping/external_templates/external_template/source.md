# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node",
    "sourceMap": true,
    "inlineSources": true
  },
  "files": [
    "external_template.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /external_template.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    templateUrl: './dir/test.html',
    standalone: false
})
export class TestCmp {
}
```

# /escaped_chars.html
```html
<!--
  NOTE: This template has escaped `\r\n` line-endings markers that will be converted to real `\r\n` line-ending chars when loaded from the test file-system.
        This conversion happens in the monkeyPatchReadFile() function, which changes `fs.readFile()`.
-->
<div>
  Some Message
  Encoded character: 🚀
</div>
```
