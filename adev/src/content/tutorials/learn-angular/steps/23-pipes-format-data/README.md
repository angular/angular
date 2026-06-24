# Форматирование данных с помощью Pipe

Вы можете расширить возможности использования Pipe, настроив их. Pipe можно конфигурировать, передавая им параметры.

Примечание: Узнайте больше о [форматировании данных с помощью Pipe в подробном руководстве](/guide/templates/pipes).

В этом упражнении вы поработаете с некоторыми Pipe и их параметрами.

<hr>

Чтобы передать параметры в Pipe, используйте синтаксис `:` с последующим значением параметра. Вот пример:

```ts
template: `{{ date | date:'medium' }}`;
```

Результат вывода: `Jun 15, 2015, 9:43:11 PM`.

Пришло время настроить вывод Pipe:

<docs-workflow>

<docs-step title="Форматирование числа с помощью `DecimalPipe`">

В `app.ts` обновите шаблон, чтобы включить параметр для `decimal` Pipe.

<docs-code language="ts" highlight="[3]">
template: `
  ...
  <li>Number with "decimal" {{ num | number:'3.2-2' }}</li>
`
</docs-code>

ПРИМЕЧАНИЕ: Что это за формат? Параметр для `DecimalPipe` называется `digitsInfo`, этот параметр использует формат:
`{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`

</docs-step>

<docs-step title="Форматирование даты с помощью `DatePipe`">

Теперь обновите шаблон, чтобы использовать `date` Pipe.

<docs-code language="ts" highlight="[3]">
template: `
  ...
  <li>Date with "date" {{ birthday | date: 'medium' }}</li>
`
</docs-code>

Ради интереса попробуйте разные параметры для `date`. Дополнительную информацию можно найти
в [документации Angular](guide/templates/pipes).

</docs-step>

<docs-step title="Форматирование валюты с помощью `CurrencyPipe`">

В качестве последнего задания обновите шаблон, чтобы использовать `currency` Pipe.

<docs-code language="ts" highlight="[3]">
template: `
  ...
  <li>Currency with "currency" {{ cost | currency }}</li>
`
</docs-code>

Вы также можете попробовать разные параметры для `currency`. Дополнительную информацию можно найти
в [документации Angular](guide/templates/pipes).

</docs-step>

</docs-workflow>

Отличная работа с Pipe. Вы добились большого прогресса.

Существует еще больше встроенных Pipe, которые вы можете использовать в своих приложениях. Список можно найти
в [документации Angular](guide/templates/pipes).

Если встроенные Pipe не покрывают ваши потребности, вы также можете создать пользовательский Pipe. Переходите к
следующему уроку, чтобы узнать больше.
