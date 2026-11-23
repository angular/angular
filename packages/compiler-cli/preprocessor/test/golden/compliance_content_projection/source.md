# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["ng_project_as_attribute.ts"]
}
```

# /ng_project_as_attribute.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'my-app', template: '<div *ngIf="show" ngProjectAs=".someclass"></div>',
    standalone: false
})
export class MyApp {
  show = true;
}
```
