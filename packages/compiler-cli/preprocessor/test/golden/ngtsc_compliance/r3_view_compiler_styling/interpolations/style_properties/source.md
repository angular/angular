# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "style_properties.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /style_properties.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
    <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
    <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
    <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
    <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
    <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
    <div style.color="a{{one}}b{{two}}c{{three}}d"></div>
    <div style.color="a{{one}}b{{two}}c"></div>
    <div style.color="a{{one}}b"></div>
    <div style.color="{{one}}"></div>
  `,
    standalone: false
})
export class MyComponent {
  one = '';
  two = '';
  three = '';
  four = '';
  five = '';
  six = '';
  seven = '';
  eight = '';
  nine = '';
}
```
