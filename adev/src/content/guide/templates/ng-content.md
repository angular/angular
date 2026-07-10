# Рендер шаблонов из родительского компонента с `ng-content`

`<ng-content>` — специальный элемент, который принимает разметку или фрагмент шаблона и управляет тем, как компоненты рендерят контент. Он не создаёт реальный DOM-элемент.

Ниже пример компонента `BaseButton`, который принимает любую разметку от родителя.

```angular-ts {header:'base-button/base-button.ts'}
import {Component} from '@angular/core';

@Component({
  selector: 'button[baseButton]',
  template: `<ng-content />`,
})
export class BaseButton {}
```

```angular-ts {header:'app.ts'}
import {Component} from '@angular/core';
import {BaseButton} from './base-button';

@Component({
  selector: 'app-root',
  imports: [BaseButton],
  template: `<button baseButton>Next <span class="icon arrow-right"></span></button>`,
})
export class App {}
```

Подробнее см. [подробное руководство по `<ng-content>`](/guide/components/content-projection) — там описаны и другие способы использования этого паттерна.
