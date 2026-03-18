# Pipe (Пайп) {#pipes}

## Обзор {#overview}

Пайпы — это специальный оператор в выражениях шаблонов Angular, позволяющий декларативно преобразовывать данные в шаблоне. Пайпы позволяют объявить функцию преобразования один раз, а затем использовать её в нескольких шаблонах. Пайпы Angular используют символ вертикальной черты (`|`), вдохновлённый [Unix-каналами](https://en.wikipedia.org/wiki/Pipeline_(Unix)).

NOTE: Синтаксис пайпов Angular отличается от стандартного JavaScript, который использует символ вертикальной черты для [побитового оператора OR](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR). Выражения шаблонов Angular не поддерживают побитовые операторы.

Пример использования некоторых встроенных пайпов Angular:

```angular-ts
import {Component} from '@angular/core';
import {CurrencyPipe, DatePipe, TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe, DatePipe, TitleCasePipe],
  template: `
    <main>
      <!-- Transform the company name to title-case and
       transform the purchasedOn date to a locale-formatted string -->
      <h1>Purchases from {{ company | titlecase }} on {{ purchasedOn | date }}</h1>

      <!-- Transform the amount to a currency-formatted string -->
      <p>Total: {{ amount | currency }}</p>
    </main>
  `,
})
export class ShoppingCart {
  amount = 123.45;
  company = 'acme corporation';
  purchasedOn = '2024-07-08';
}
```

При рендеринге компонента Angular обеспечит соответствующий формат даты и валюты на основе локали пользователя. Для пользователей из США результат будет:

```angular-html
<main>
  <h1>Purchases from Acme Corporation on Jul 8, 2024</h1>
  <p>Total: $123.45</p>
</main>
```

Подробнее о локализации значений в Angular см. в [подробном руководстве по i18n](guide/i18n).

### Встроенные пайпы {#built-in-pipes}

Angular включает набор встроенных пайпов в пакете `@angular/common`:

| Название                                          | Описание                                                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [`AsyncPipe`](api/common/AsyncPipe)               | Читает значение из `Promise` или RxJS `Observable`.                                                  |
| [`CurrencyPipe`](api/common/CurrencyPipe)         | Преобразует число в строку валюты, отформатированную согласно правилам локали.                       |
| [`DatePipe`](api/common/DatePipe)                 | Форматирует значение `Date` согласно правилам локали.                                                |
| [`DecimalPipe`](api/common/DecimalPipe)           | Преобразует число в строку с десятичной точкой, отформатированную согласно правилам локали.          |
| [`I18nPluralPipe`](api/common/I18nPluralPipe)     | Отображает значение на строку, склоняя значение согласно правилам локали.                            |
| [`I18nSelectPipe`](api/common/I18nSelectPipe)     | Отображает ключ на пользовательский селектор, возвращающий нужное значение.                          |
| [`JsonPipe`](api/common/JsonPipe)                 | Преобразует объект в строковое представление через `JSON.stringify`, предназначено для отладки.       |
| [`KeyValuePipe`](api/common/KeyValuePipe)         | Преобразует Object или Map в массив пар ключ-значение.                                               |
| [`LowerCasePipe`](api/common/LowerCasePipe)       | Преобразует текст в нижний регистр.                                                                  |
| [`PercentPipe`](api/common/PercentPipe)           | Преобразует число в строку процентов, отформатированную согласно правилам локали.                    |
| [`SlicePipe`](api/common/SlicePipe)               | Создаёт новый Array или String, содержащий подмножество (срез) элементов.                            |
| [`TitleCasePipe`](api/common/TitleCasePipe)       | Преобразует текст в регистр заголовка.                                                               |
| [`UpperCasePipe`](api/common/UpperCasePipe)       | Преобразует текст в верхний регистр.                                                                 |

## Использование пайпов {#using-pipes}

Оператор пайпа Angular использует символ вертикальной черты (`|`) в выражении шаблона. Оператор пайпа является бинарным — левый операнд — это значение, передаваемое в функцию преобразования, а правый операнд — имя пайпа и любые дополнительные аргументы (описаны ниже).

```angular-html
<p>Total: {{ amount | currency }}</p>
```

В этом примере значение `amount` передаётся в `CurrencyPipe`, где имя пайпа — `currency`. Затем рендерится валюта по умолчанию для локали пользователя.

### Объединение нескольких пайпов в одном выражении {#combining-multiple-pipes-in-the-same-expression}

Можно применить несколько преобразований к значению, используя несколько операторов пайпов. Angular запускает пайпы слева направо.

Следующий пример демонстрирует комбинацию пайпов для отображения локализованной даты в верхнем регистре:

```angular-html
<p>The event will occur on {{ scheduledOn | date | uppercase }}.</p>
```

### Передача параметров в пайпы {#passing-parameters-to-pipes}

Некоторые пайпы принимают параметры для настройки преобразования. Для указания параметра после имени пайпа ставится двоеточие (`:`) с последующим значением параметра.

Например, `DatePipe` может принимать параметры для форматирования даты определённым образом.

```angular-html
<p>The event will occur at {{ scheduledOn | date: 'hh:mm' }}.</p>
```

Некоторые пайпы могут принимать несколько параметров. Дополнительные значения параметров указываются через символ двоеточия (`:`).

Например, можно передать второй необязательный параметр для управления часовым поясом.

```angular-html
<p>The event will occur at {{ scheduledOn | date: 'hh:mm' : 'UTC' }}.</p>
```

## Как работают пайпы {#how-pipes-work}

Концептуально пайпы — это функции, принимающие входное значение и возвращающие преобразованное значение.

```angular-ts
import {Component} from '@angular/core';
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe],
  template: `
    <main>
      <p>Total: {{ amount | currency }}</p>
    </main>
  `,
})
export class AppComponent {
  amount = 123.45;
}
```

В этом примере:

1. `CurrencyPipe` импортируется из `@angular/common`
1. `CurrencyPipe` добавляется в массив `imports`
1. Данные `amount` передаются в пайп `currency`

### Приоритет оператора пайпа {#pipe-operator-precedence}

Оператор пайпа имеет более низкий приоритет, чем другие бинарные операторы, включая `+`, `-`, `*`, `/`, `%`, `&&`, `||` и `??`.

```angular-html
<!-- firstName and lastName are concatenated before the result is passed to the uppercase pipe -->
{{ firstName + lastName | uppercase }}
```

Оператор пайпа имеет более высокий приоритет, чем условный (тернарный) оператор.

```angular-html
{{ (isAdmin ? 'Access granted' : 'Access denied') | uppercase }}
```

Если то же выражение записать без скобок:

<!-- prettier-ignore -->
```angular-html
{{ isAdmin ? 'Access granted' : 'Access denied' | uppercase }}
```

Оно будет разобрано как:

```angular-html
{{ isAdmin ? 'Access granted' : ('Access denied' | uppercase) }}
```

Всегда используйте скобки в выражениях, когда приоритет операторов может быть неоднозначным.

### Обнаружение изменений с пайпами {#change-detection-with-pipes}

По умолчанию все пайпы считаются `pure` (чистыми), то есть выполняются только при изменении примитивного входного значения (например, `String`, `Number`, `Boolean` или `Symbol`) или ссылки на объект (например, `Array`, `Object`, `Function` или `Date`). Чистые пайпы обеспечивают преимущество в производительности, поскольку Angular может не вызывать функцию преобразования, если переданное значение не изменилось.

Это означает, что мутации свойств объектов или элементов массивов не обнаруживаются, если не заменить весь объект или массив другим экземпляром. Если нужен такой уровень обнаружения изменений, обратитесь к разделу [Обнаружение изменений внутри массивов или объектов](#detecting-change-within-arrays-or-objects).

## Создание пользовательских пайпов {#creating-custom-pipes}

Пользовательский пайп определяется реализацией TypeScript-класса с декоратором `@Pipe`. Пайп должен иметь две вещи:

- Имя, указанное в декораторе пайпа
- Метод `transform`, выполняющий преобразование значения.

TypeScript-класс должен дополнительно реализовывать интерфейс `PipeTransform`, чтобы обеспечить соответствие типовой сигнатуре пайпа.

Пример пользовательского пайпа, преобразующего строки в kebab-case:

```angular-ts
// kebab-case.pipe.ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'kebabCase',
})
export class KebabCasePipe implements PipeTransform {
  transform(value: string): string {
    return value.toLowerCase().replace(/ /g, '-');
  }
}
```

### Использование декоратора `@Pipe` {#using-the-pipe-decorator}

При создании пользовательского пайпа импортируйте `Pipe` из пакета `@angular/core` и используйте его как декоратор для TypeScript-класса.

```angular-ts
import {Pipe} from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe {}
```

Декоратор `@Pipe` требует `name`, управляющего тем, как пайп используется в шаблоне.

### Соглашение об именовании для пользовательских пайпов {#naming-convention-for-custom-pipes}

Соглашение об именовании для пользовательских пайпов состоит из двух частей:

- `name` — рекомендуется camelCase. Не используйте дефисы.
- `class name` — PascalCase-версия `name` с добавлением `Pipe` в конце

### Реализация интерфейса `PipeTransform` {#implement-the-pipetransform-interface}

Помимо декоратора `@Pipe`, пользовательские пайпы всегда должны реализовывать интерфейс `PipeTransform` из `@angular/core`.

```angular-ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {}
```

Реализация этого интерфейса гарантирует, что класс пайпа имеет правильную структуру.

### Преобразование значения пайпа {#transforming-the-value-of-a-pipe}

Каждое преобразование вызывается методом `transform`, где первый параметр — передаваемое значение, а возвращаемое значение — преобразованное значение.

```angular-ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {
  transform(value: string): string {
    return `My custom transformation of ${value}.`;
  }
}
```

### Добавление параметров в пользовательский пайп {#adding-parameters-to-a-custom-pipe}

Можно добавлять параметры в преобразование, добавляя дополнительные параметры в метод `transform`:

```angular-ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {
  transform(value: string, format: string): string {
    let msg = `My custom transformation of ${value}.`;

    if (format === 'uppercase') {
      return msg.toUpperCase();
    } else {
      return msg;
    }
  }
}
```

### Обнаружение изменений внутри массивов или объектов {#detecting-change-within-arrays-or-objects}

Если нужно, чтобы пайп обнаруживал изменения внутри массивов или объектов, его необходимо пометить как нечистую функцию, передав флаг `pure` со значением `false`.

IMPORTANT: Избегайте создания нечистых пайпов без крайней необходимости, поскольку они могут значительно снизить производительность при неосторожном использовании.

```angular-ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'joinNamesImpure',
  pure: false,
})
export class JoinNamesImpurePipe implements PipeTransform {
  transform(names: string[]): string {
    return names.join();
  }
}
```

Разработчики Angular часто включают слово `Impure` в `name` пайпа и имя класса, чтобы обозначить потенциальные проблемы с производительностью для других разработчиков.
