# Elements

## Release Status

**Angular Labs Project** - experimental and unstable. **Breaking Changes Possible** 

Targeted to land in the [6.x release cycle](https://github.com/angular/angular/blob/master/docs/RELEASE_SCHEDULE.md) of Angular - subject to change

## Overview

Elements provides an API that allows developers to register Angular Components as Custom Elements 
("Web Components"), and bridges the built-in DOM API to Angular's component interface and change 
detection APIs.

```ts
//hello-world.ts
import { Component, Input, NgModule } from '@angular/core';
import { createNgElementConstructor, getConfigFromComponentFactory } from '@angular/elements';

@Component({
  selector: 'hello-world',
  template: `<h1>Hello {{name}}</h1>`
})
export class HelloWorld {
  @Input() name: string = 'World!';
}

@NgModule({
  declarations: [ HelloWorld ],
  entryComponents: [ HelloWorld ]
})
export class HelloWorldModule {}
```

```ts
//app.component.ts
import { Component, NgModuleRef } from '@angular/core';
import { createNgElementConstructor } from '@angular/elements';

import { HelloWorld } from './hello-world.ngfactory';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(ngModuleRef: NgModuleRef) {
    const ngElementConfig = getConfigFromComponentFactory(HelloWorld, injector);
    const NgElementConstructor = createNgElementConstructor(ngElementConfig);
    customElements.register('hello-world', NgElementConstructor);
  }
}

```
Once registered, these components can be used just like built-in HTML elements, because they *are* 
HTML Elements!

They can be used in any HTML page:

```html
<hello-world name="Angular"></hello-world>
<hello-world name="Typescript"></hello-world>
```

Custom Elements are "self-bootstrapping" - they are automatically started when they are added to the 
DOM, and automatically destroyed when removed from the DOM.
