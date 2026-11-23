# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /app.ts
```ts
import {Component, Input, Output, EventEmitter} from '@angular/core';

const COMPUTED_KEY = 'computedInput';

function CustomPropDec(): PropertyDecorator {
  return () => {};
}

@Component({
  selector: 'app-comp',
  template: '',
})
export class AppComp {
  @Input() static staticInput = 'static';
  @CustomPropDec() static customStatic = 'custom';
  @Input() #privateInput = 'private';
  @Output() [COMPUTED_KEY] = new EventEmitter<void>();
  @Input() normalInput = 'normal';
}
```
