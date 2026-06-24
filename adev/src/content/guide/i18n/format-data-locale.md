# Форматирование данных на основе локали

Angular предоставляет следующие встроенные [Pipe-ы](guide/templates/pipes) для преобразования данных.
Эти Pipe-ы используют токен [`LOCALE_ID`][ApiCoreLocaleId] для форматирования данных на основе правил каждой локали.

| Pipe преобразования данных              | Подробности                                   |
| :-------------------------------------- | :-------------------------------------------- |
| [`DatePipe`][ApiCommonDatepipe]         | Форматирует значение даты.                    |
| [`CurrencyPipe`][ApiCommonCurrencypipe] | Преобразует число в строку валюты.            |
| [`DecimalPipe`][ApiCommonDecimalpipe]   | Преобразует число в строку десятичного числа. |
| [`PercentPipe`][ApiCommonPercentpipe]   | Преобразует число в строку процентов.         |

## Использование DatePipe для отображения текущей даты

Чтобы отобразить текущую дату в формате для текущей локали, используйте следующий формат для `DatePipe`.

```angular-html
{{ today | date }}
```

## Переопределение текущей локали для CurrencyPipe

Добавьте параметр `locale` в Pipe, чтобы переопределить текущее значение токена `LOCALE_ID`.

Чтобы принудительно использовать американский английский \(`en-US`\) для валюты, используйте следующий формат для
`CurrencyPipe`

```angular-html
{{ amount | currency : 'en-US' }}
```

HELPFUL: Локаль, указанная для `CurrencyPipe`, переопределяет глобальный токен `LOCALE_ID` вашего приложения.

## Что дальше

<docs-pill-row>
  <docs-pill href="guide/i18n/prepare" title="Подготовка компонента к переводу"/>
</docs-pill-row>

[ApiCommonCurrencypipe]: api/common/CurrencyPipe 'CurrencyPipe | Common - API | Angular'
[ApiCommonDatepipe]: api/common/DatePipe 'DatePipe | Common - API | Angular'
[ApiCommonDecimalpipe]: api/common/DecimalPipe 'DecimalPipe | Common - API | Angular'
[ApiCommonPercentpipe]: api/common/PercentPipe 'PercentPipe | Common - API | Angular'
[ApiCoreLocaleId]: api/core/LOCALE_ID 'LOCALE_ID | Core - API | Angular'
