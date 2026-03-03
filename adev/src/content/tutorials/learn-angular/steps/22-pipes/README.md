# Pipes

Pipes — это функции, которые используются для преобразования данных в шаблонах. В целом, pipes — это «чистые» (pure)
функции, которые не вызывают побочных эффектов. В Angular есть множество полезных встроенных pipes, которые вы можете
импортировать и использовать в своих компонентах. Вы также можете создать собственный pipe.

Примечание: Подробнее о [pipes читайте в углубленном руководстве](/guide/templates/pipes).

В этом задании вы импортируете pipe и используете его в шаблоне.

<hr>

Чтобы использовать pipe в шаблоне, включите его в выражение интерполяции. Взгляните на этот пример:

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

<docs-step title="Импортируйте pipe LowerCase">
Сначала обновите `app.ts`, добавив импорт `LowerCasePipe` из `@angular/common` на уровне файла.

```ts
import {LowerCasePipe} from '@angular/common';
```

</docs-step>

<docs-step title="Добавьте pipe в imports">
Далее обновите массив `imports` в декораторе `@Component()`, добавив туда ссылку на `LowerCasePipe`.

```ts {highlight:[3]}
@Component({
  ...
  imports: [LowerCasePipe]
})
```

</docs-step>

<docs-step title="Добавьте pipe в шаблон">
И наконец, в `app.ts` обновите шаблон, чтобы включить pipe `lowercase`:

```angular-html
template: `{{ username | lowercase }}`
```

</docs-step>

</docs-workflow>

Pipes также могут принимать параметры, которые используются для настройки их вывода. Узнайте больше в следующем задании.

P.S. вы отлично справляетесь ⭐️
