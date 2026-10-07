# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node",
    "experimentalDecorators": true
  },
  "angularCompilerOptions": {
    "annotateForClosureCompiler": true
  },
  "files": ["index.ts"]
}
```

# /index.ts
```ts
import {Component, Injectable, Pipe, PipeTransform} from '@angular/core';

declare function Custom(): ClassDecorator;

@Injectable({providedIn: 'root'})
export class HybridService {
  static readonly $inject: readonly string[] = ['depA', 'depB'];
  /** Documented on a single line. */
  static readonly documented = 1;
  /**
   * Documented over several lines.
   * @export
   */
  static readonly multiLine = 2;
  /** @nocollapse */
  static readonly alreadyTagged = 3;
  static #secret = 4;
  instanceField = 5;

  static method(): number {
    return HybridService.#secret;
  }
}

@Component({
  selector: 'my-cmp',
  template: '',
})
export class MyCmp {
  static readonly $inject = ['$scope'];
}

@Pipe({name: 'myPipe'})
export class MyPipe implements PipeTransform {
  static readonly $inject = ['$filter'];
  transform(value: string): string {
    return value;
  }
}

// Still decorated after the Angular decorator is stripped: tsickle adds `@nocollapse` itself.
@Custom()
@Injectable()
export class StillDecorated {
  static readonly $inject = ['depA'];
}
```
