# Создание собственного пайпа {#create-a-pipe}

Вы можете создавать собственные пайпы в Angular для преобразования данных в соответствии с вашими потребностями.

Примечание: Подробнее
о [создании собственных пайпов читайте в подробном руководстве](/guide/templates/pipes#creating-custom-pipes).

В этом упражнении вы создадите собственный пайп и используете его в шаблоне.

<hr>

Пайп — это класс TypeScript с декоратором `@Pipe`. Вот пример:

```ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'star',
})
export class StarPipe implements PipeTransform {
  transform(value: string): string {
    return `⭐️ ${value} ⭐️`;
  }
}
```

`StarPipe` принимает строковое значение и возвращает эту строку, окруженную звездочками. Обратите внимание, что:

- имя в конфигурации декоратора `@Pipe` — это то, что будет использоваться в шаблоне
- функция `transform` — это место, где вы размещаете свою логику

Хорошо, теперь ваша очередь попробовать — вы создадите `ReversePipe`:

<docs-workflow>

<docs-step title="Создайте ReversePipe">

В файле `reverse.pipe.ts` добавьте декоратор `@Pipe` к классу `ReversePipe` и укажите следующую конфигурацию:

```ts
@Pipe({
  name: 'reverse'
})
```

</docs-step>

<docs-step title="Реализуйте функцию transform">

Теперь класс `ReversePipe` является пайпом. Обновите функцию `transform`, добавив логику переворота строки:

```ts {highlight:[3,4,5,6,7,8,9]}
export class ReversePipe implements PipeTransform {
  transform(value: string): string {
    let reverse = '';

    for (let i = value.length - 1; i >= 0; i--) {
      reverse += value[i];
    }

    return reverse;
  }
}
```

</docs-step>

<docs-step title="Используйте ReversePipe в шаблоне"></docs-step>
Логика пайпа реализована, последний шаг — использовать его в шаблоне. В `app.ts` включите пайп в шаблон и добавьте его в
импорты компонента:

```angular-ts {highlight:[3,4]}
@Component({
  ...
  template: `Reverse Machine: {{ word | reverse }}`
  imports: [ReversePipe]
})
```

</docs-workflow>

Вот и всё, у вас получилось. Поздравляем с завершением этого упражнения. Теперь вы знаете, как использовать пайпы и даже
как реализовывать собственные пайпы.
