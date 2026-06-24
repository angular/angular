# Рендеринг шаблонов из родительского компонента с помощью `ng-content`

`<ng-content>` — это специальный элемент, который принимает разметку или фрагмент шаблона и управляет тем, как
компоненты отображают контент. Он не создает реальный DOM-элемент.

Ниже приведен пример компонента `BaseButton`, который принимает любую разметку от своего родительского компонента.

```angular-ts
// ./base-button/base-button.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'button[baseButton]',
  template: `
      <ng-content />
  `,
})
export class BaseButton {}
```

```angular-ts
// ./app.component.ts
import { Component } from '@angular/core';
import { BaseButton } from './base-button/base-button.component';

@Component({
  selector: 'app-root',
  imports: [BaseButton],
  template: `
    <button baseButton>
      Next <span class="icon arrow-right"></span>
    </button>
  `,
})
export class AppComponent {}
```

Чтобы узнать больше о других способах использования этого паттерна, ознакомьтесь с [подробным руководством по
`<ng-content>`](/guide/components/content-projection).
