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
import {Component} from '@angular/core';

@Component({
  selector: 'first-comp',
  template: '<div class="shared-box">First</div>',
  styles: ['.shared-box { display: flex; align-items: center; justify-content: space-between; }'],
})
export class FirstComp {}

@Component({
  selector: 'second-comp',
  template: '<div class="shared-box">Second</div>',
  styles: ['.shared-box { display: flex; align-items: center; justify-content: space-between; }'],
})
export class SecondComp {}
```
