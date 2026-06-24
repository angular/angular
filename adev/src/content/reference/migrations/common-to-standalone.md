# Преобразование использования CommonModule в standalone-импорты

Эта миграция помогает проектам удалить импорты `CommonModule` внутри компонентов, добавляя вместо него минимальный набор
импортов директив и пайпов, необходимых каждому конкретному шаблону (например, `NgIf`, `NgFor`, `AsyncPipe` и т.д.).

Запустите схематик с помощью следующей команды:

```shell
ng generate @angular/core:common-to-standalone
```

## Опции

| Опция  | Подробности                                                                                                                                                                |
| :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path` | Путь (относительно корня проекта) для миграции. По умолчанию `./`. Используйте этот параметр для постепенной (инкрементальной) миграции определенной части вашего проекта. |

## Пример

До:

```angular-ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  imports: [CommonModule],
  template: `
    <div *ngIf="show">
      {{ data | async | json }}
    </div>
  `
})
export class ExampleComponent {
  show = true;
  data = Promise.resolve({ message: 'Hello' });
}
```

После запуска миграции (добавлены импорты компонента, удален `CommonModule`):

```angular-ts
import { Component } from '@angular/core';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-example',
  imports: [AsyncPipe, JsonPipe, NgIf],
  template: `
    <div *ngIf="show">
      {{ data | async | json }}
    </div>
  `
})
export class ExampleComponent {
  show = true;
  data = Promise.resolve({ message: 'Hello' });
}
```
