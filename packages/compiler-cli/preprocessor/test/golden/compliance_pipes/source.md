# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["pipes.ts"]
}
```

# /pipes.ts
```ts
import {Component, NgModule, OnDestroy, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'myPipe', pure: false,
    standalone: false
})
export class MyPipe implements PipeTransform, OnDestroy {
  transform(value: any, ...args: any[]) {
    return value;
  }
  ngOnDestroy(): void {}
}

@Pipe({
    name: 'myPurePipe',
    pure: true,
    standalone: false
})
export class MyPurePipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    return value;
  }
}

@Pipe(null!)
export class PipeWithoutName implements PipeTransform {
  transform(value: unknown) {
    return value;
  }
}

@Component({
    selector: 'my-app',
    template: '{{name | myPipe:size | myPurePipe:size }}<p>{{ name | myPipe:1:2:3:4:5 }} {{ name ? 1 : 2 | myPipe }}</p>',
    standalone: false
})
export class MyApp {
  name = 'World';
  size = 0;
}

@NgModule({declarations: [MyPipe, MyPurePipe, MyApp, PipeWithoutName]})
export class MyModule {
}
```
