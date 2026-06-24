# Очистка неиспользуемых импортов

Начиная с версии 19, Angular сообщает, если массив `imports` компонента содержит символы, которые не используются в его
шаблоне.

Запуск этой схематики удалит все неиспользуемые импорты в проекте.

Запустите схематику с помощью следующей команды:

```shell
ng generate @angular/core:cleanup-unused-imports
```

#### До

```angular-ts
import {Component} from '@angular/core';
import {UnusedDirective} from './unused';

@Component({
  template: 'Hello',
  imports: [UnusedDirective],
})
export class MyComp {}
```

#### После

```angular-ts
import {Component} from '@angular/core';

@Component({
  template: 'Hello',
  imports: [],
})
export class MyComp {}
```
