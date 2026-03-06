# Форматирование данных с помощью Pipe {#formatting-data-with-pipes}

Можно расширить использование Pipe, настраивая их. Pipe можно настраивать, передавая им параметры.

NOTE: Подробнее о [форматировании данных с помощью Pipe в подробном руководстве](/guide/templates/pipes).

В этом упражнении вы будете работать с некоторыми Pipe и их параметрами.

<hr>

Чтобы передать параметры Pipe, используйте синтаксис `:` с последующим значением параметра. Пример:

```angular-html
template: `{{ date | date: 'medium' }}`;
```

Вывод: `Jun 15, 2015, 9:43:11 PM`.

Пора настроить вывод некоторых Pipe:

<docs-workflow>

<docs-step title="Форматирование числа с помощью `DecimalPipe`">

В `app.ts` обновите Шаблон, включив параметр для Pipe `decimal`.

```angular-html {highlight:[3]}
template: ` ...
<li>Number with "decimal" {{ num | number: '3.2-2' }}</li>
`
```

NOTE: Что это за формат? Параметр для `DecimalPipe` называется `digitsInfo` и использует формат: `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`

</docs-step>

<docs-step title="Форматирование даты с помощью `DatePipe`">

Теперь обновите Шаблон, используя Pipe `date`.

```angular-html {highlight:[3]}
template: ` ...
<li>Date with "date" {{ birthday | date: 'medium' }}</li>
`
```

Для дополнительного интереса попробуйте разные параметры для `date`. Дополнительную информацию можно найти в [документации Angular](guide/templates/pipes).

</docs-step>

<docs-step title="Форматирование валюты с помощью `CurrencyPipe`">

В качестве последнего задания обновите Шаблон, используя Pipe `currency`.

```angular-html {highlight:[3]}
template: ` ...
<li>Currency with "currency" {{ cost | currency }}</li>
`
```

Также можно попробовать разные параметры для `currency`. Дополнительную информацию можно найти в [документации Angular](guide/templates/pipes).

</docs-step>

</docs-workflow>

Отличная работа с Pipe! Вы делаете значительные успехи.

В Angular есть ещё больше встроенных Pipe, которые можно использовать в приложениях. Полный список доступен в [документации Angular](guide/templates/pipes).

Если встроенных Pipe недостаточно для ваших нужд, можно также создать собственный Pipe. Подробности — в следующем уроке.
