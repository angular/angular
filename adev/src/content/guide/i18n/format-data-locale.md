# Форматирование данных на основе локали

Angular предоставляет следующие встроенные [pipes](guide/templates/pipes) преобразования данных.
Pipes преобразования данных используют токен [`LOCALE_ID`][ApiCoreLocaleId] для форматирования данных по правилам каждой локали.

| Pipe преобразования данных              | Подробности                                       |
| :-------------------------------------- | :------------------------------------------------ |
| [`DatePipe`][ApiCommonDatepipe]         | Форматирует значение даты.                        |
| [`CurrencyPipe`][ApiCommonCurrencypipe] | Преобразует число в строку валюты.                |
| [`DecimalPipe`][ApiCommonDecimalpipe]   | Преобразует число в строку десятичного числа.     |
| [`PercentPipe`][ApiCommonPercentpipe]   | Преобразует число в строку процента.              |

## Использование DatePipe для отображения текущей даты {#use-datepipe-to-display-the-current-date}

Чтобы отобразить текущую дату в формате текущей локали, используйте следующий формат для `DatePipe`.

```angular-html
{{ today | date }}
```

## Переопределение текущей локали для CurrencyPipe {#override-current-locale-for-currencypipe}

Добавьте параметр `locale` к pipe, чтобы переопределить текущее значение токена `LOCALE_ID`.

Чтобы принудительно использовать американский английский \(`en-US`\) для валюты, используйте следующий формат для `CurrencyPipe`

```angular-html
{{ amount | currency: 'USD' : 'symbol' : '1.2-2' : 'en-US' }}
```

HELPFUL: Локаль, указанная для `CurrencyPipe`, переопределяет глобальный токен `LOCALE_ID` вашего приложения.

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/i18n/prepare" title="Prepare component for translation"/>
</docs-pill-row>

[ApiCommonCurrencypipe]: api/common/CurrencyPipe 'CurrencyPipe | Common - API | Angular'
[ApiCommonDatepipe]: api/common/DatePipe 'DatePipe | Common - API | Angular'
[ApiCommonDecimalpipe]: api/common/DecimalPipe 'DecimalPipe | Common - API | Angular'
[ApiCommonPercentpipe]: api/common/PercentPipe 'PercentPipe | Common - API | Angular'
[ApiCoreLocaleId]: api/core/LOCALE_ID 'LOCALE_ID | Core - API | Angular'
