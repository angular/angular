# Форматирование данных с помощью pipes {#formatting-data-with-pipes}

Возможности pipes можно расширить с помощью их настройки. Pipes принимают параметры, которые позволяют управлять их выводом.

Примечание: Подробнее
о [форматировании данных с помощью pipes читайте в углублённом руководстве](/guide/templates/pipes).

В этом упражнении вы поработаете с несколькими pipes и их параметрами.

<hr>

Чтобы передать параметр в pipe, используйте синтаксис `:` за которым следует значение параметра. Вот пример:

```angular-html
template: `{{ date | date: 'medium' }}`;
```

Результат: `Jun 15, 2015, 9:43:11 PM`.

Время настроить вывод некоторых pipes:

<docs-workflow>

<docs-step title="Format a number with `DecimalPipe`">

В `app.ts` обновите шаблон, добавив параметр для pipe `decimal`.

```angular-html {highlight:[3]}
template: ` ...
<li>Number with "decimal" {{ num | number: '3.2-2' }}</li>
`
```

Примечание: что означает этот формат? Параметр `DecimalPipe` называется `digitsInfo` и использует формат: `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`

</docs-step>

<docs-step title="Format a date with `DatePipe`">

Теперь обновите шаблон, чтобы использовать pipe `date`.

```angular-html {highlight:[3]}
template: ` ...
<li>Date with "date" {{ birthday | date: 'medium' }}</li>
`
```

Для интереса попробуйте разные параметры для `date`. Дополнительную информацию можно найти в [документации Angular](guide/templates/pipes).

</docs-step>

<docs-step title="Format a currency with `CurrencyPipe`">

Для последнего задания обновите шаблон, чтобы использовать pipe `currency`.

```angular-html {highlight:[3]}
template: ` ...
<li>Currency with "currency" {{ cost | currency }}</li>
`
```

Также можно попробовать разные параметры для `currency`. Дополнительную информацию можно найти в [документации Angular](guide/templates/pipes).

</docs-step>

</docs-workflow>

Отличная работа с pipes. Вы добились значительного прогресса.

Есть ещё много встроенных pipes, которые можно использовать в своих приложениях. Полный список можно найти в [документации Angular](guide/templates/pipes).

Если встроенные pipes не покрывают ваши нужды, вы также можете создать собственный pipe. Ознакомьтесь со следующим уроком, чтобы узнать подробности.
