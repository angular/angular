# Пайпы {#pipes}

Пайпы — это функции, которые используются для преобразования данных в шаблонах. В целом, пайпы — это «чистые» (pure)
функции, которые не вызывают побочных эффектов. В Angular есть множество полезных встроенных пайпов, которые вы можете
импортировать и использовать в своих компонентах. Вы также можете создать собственный пайп.

Примечание: Подробнее о [пайпах читайте в углубленном руководстве](/guide/templates/pipes).

В этом задании вы импортируете пайп и используете его в шаблоне.

<hr>

Чтобы использовать пайп в шаблоне, включите его в выражение интерполяции. Взгляните на этот пример:

```angular-ts {highlight:[1,5,6]}
import {UpperCasePipe} from '@angular/common';

@Component({
  ...
  template: `{{ loudMessage | uppercase }}`,
  imports: [UpperCasePipe],
})
export class App {
  loudMessage = 'we think you are doing great!'
}
```

Теперь ваша очередь попробовать:

<docs-workflow>

<docs-step title="Импортируйте пайп LowerCase">
Сначала обновите `app.ts`, добавив импорт `LowerCasePipe` из `@angular/common` на уровне файла.

```ts
import {LowerCasePipe} from '@angular/common';
```

</docs-step>

<docs-step title="Добавьте пайп в imports">
Далее обновите массив `imports` в декораторе `@Component()`, добавив туда ссылку на `LowerCasePipe`.

```ts {highlight:[3]}
@Component({
  ...
  imports: [LowerCasePipe]
})
```

</docs-step>

<docs-step title="Добавьте пайп в шаблон">
И наконец, в `app.ts` обновите шаблон, чтобы включить пайп `lowercase`:

```angular-html
template: `{{ username | lowercase }}`
```

</docs-step>

</docs-workflow>

Пайпы также могут принимать параметры, которые используются для настройки их вывода. Узнайте больше в следующем задании.

P.S. вы отлично справляетесь ⭐️
