# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import { Component, viewChild, contentChildren } from '@angular/core';

const nonAnalyzableRefersToString = "mySelector";

@Component({
  selector: 'test-comp',
  template: '<div></div>',
  standalone: true,
})
export class TestComp {
  // String literal predicate: should compile to a string array
  stringQuery = viewChild('myDiv');
  
  // Constant identifier reference: should compile to the raw identifier expression (NOT evaluated to a string array)
  constantQuery = contentChildren(nonAnalyzableRefersToString, { descendants: true });
}
```
