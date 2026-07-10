# Pipes

## Обзор {#overview}

Pipes — специальные операторы в выражениях шаблонов Angular, позволяющие декларативно преобразовывать данные в шаблоне. Pipes позволяют объявить функцию преобразования один раз и затем использовать это преобразование в нескольких шаблонах. Pipes Angular используют символ вертикальной черты (`|`), вдохновлённый [Unix pipe](<https://en.wikipedia.org/wiki/Pipeline_(Unix)>).

NOTE: Синтаксис pipes Angular отличается от стандартного JavaScript, где вертикальная черта используется для [bitwise OR](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR). Выражения шаблонов Angular не поддерживают bitwise-операторы.

Вот пример с некоторыми встроенными pipes, которые предоставляет Angular:

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

Когда Angular отрисовывает компонент, он обеспечивает, что соответствующий формат даты и валюты основан на locale пользователя. Если пользователь в США, отрисуется:

```angular-html
<main>
  <h1>Purchases from Acme Corporation on Jul 8, 2024</h1>
  <p>Total: $123.45</p>
</main>
```

См. [подробное руководство по i18n](/guide/i18n), чтобы узнать больше о том, как Angular локализует значения.

### Встроенные pipes {#built-in-pipes}

Angular включает набор встроенных pipes в пакете `@angular/common`:

| Имя                                           | Описание                                                                                      |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [`AsyncPipe`](api/common/AsyncPipe)           | Читает значение из `Promise` или RxJS `Observable`.                                           |
| [`CurrencyPipe`](api/common/CurrencyPipe)     | Преобразует число в строку валюты, отформатированную по правилам locale.                      |
| [`DatePipe`](api/common/DatePipe)             | Форматирует значение `Date` по правилам locale.                                               |
| [`DecimalPipe`](api/common/DecimalPipe)       | Преобразует число в строку с десятичной точкой, отформатированную по правилам locale.         |
| [`I18nPluralPipe`](api/common/I18nPluralPipe) | Сопоставляет значение со строкой, плюрализующей значение по правилам locale.                  |
| [`I18nSelectPipe`](api/common/I18nSelectPipe) | Сопоставляет ключ с пользовательским селектором, возвращающим нужное значение.                |
| [`JsonPipe`](api/common/JsonPipe)             | Преобразует объект в строковое представление через `JSON.stringify`, предназначен для отладки. |
| [`KeyValuePipe`](api/common/KeyValuePipe)     | Преобразует Object или Map в массив пар ключ–значение.                                        |
| [`LowerCasePipe`](api/common/LowerCasePipe)   | Преобразует текст в нижний регистр.                                                           |
| [`PercentPipe`](api/common/PercentPipe)       | Преобразует число в строку процента, отформатированную по правилам locale.                    |
| [`SlicePipe`](api/common/SlicePipe)           | Создаёт новый Array или String, содержащий подмножество (slice) элементов.                    |
| [`TitleCasePipe`](api/common/TitleCasePipe)   | Преобразует текст в title case.                                                               |
| [`UpperCasePipe`](api/common/UpperCasePipe)   | Преобразует текст в верхний регистр.                                                          |

## Использование pipes {#using-pipes}

Оператор pipe Angular использует символ вертикальной черты (`|`) внутри выражения шаблона. Оператор pipe — бинарный: левый операнд — значение, передаваемое в функцию преобразования, правый — имя pipe и любые дополнительные аргументы (описаны ниже).

```angular-html
<p>Total: {{ amount | currency }}</p>
```

В этом примере значение `amount` передаётся в `CurrencyPipe`, где имя pipe — `currency`. Затем отрисовывается валюта по умолчанию для locale пользователя.

### Комбинирование нескольких pipes в одном выражении {#combining-multiple-pipes-in-the-same-expression}

Можно применить несколько преобразований к значению, используя несколько операторов pipe. Angular выполняет pipes слева направо.

Следующий пример демонстрирует комбинацию pipes для отображения локализованной даты в верхнем регистре:

```angular-html
<p>The event will occur on {{ scheduledOn | date | uppercase }}.</p>
```

### Передача параметров в pipes {#passing-parameters-to-pipes}

Некоторые pipes принимают параметры для настройки преобразования. Чтобы указать параметр, добавьте к имени pipe двоеточие (`:`) и значение параметра.

Например, `DatePipe` может принимать параметры для форматирования даты определённым образом.

```angular-html
<p>The event will occur at {{ scheduledOn | date: 'hh:mm' }}.</p>
```

Некоторые pipes могут принимать несколько параметров. Дополнительные значения параметров указываются через двоеточие (`:`).

Например, можно также передать второй опциональный параметр для управления timezone.

```angular-html
<p>The event will occur at {{ scheduledOn | date: 'hh:mm' : 'UTC' }}.</p>
```

## Как работают pipes {#how-pipes-work}

Концептуально pipes — функции, которые принимают входное значение и возвращают преобразованное значение.

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
1. Данные `amount` передаются в pipe `currency`

### Приоритет оператора pipe {#pipe-operator-precedence}

Оператор pipe имеет более низкий приоритет, чем другие бинарные операторы, включая `+`, `-`, `*`, `/`, `%`, `&&`, `||` и `??`.

```angular-html
<!-- firstName and lastName are concatenated before the result is passed to the uppercase pipe -->
{{ firstName + lastName | uppercase }}
```

Оператор pipe имеет более высокий приоритет, чем условный (тернарный) оператор.

```angular-html
{{ (isAdmin ? 'Access granted' : 'Access denied') | uppercase }}
```

Если то же выражение написать без скобок:

<!-- prettier-ignore -->
```angular-html
{{ isAdmin ? 'Access granted' : 'Access denied' | uppercase }}
```

Оно будет разобрано как:

```angular-html
{{ isAdmin ? 'Access granted' : ('Access denied' | uppercase) }}
```

Всегда используйте скобки в выражениях, когда приоритет операторов может быть неоднозначным.

### Change detection с pipes {#change-detection-with-pipes}

По умолчанию все pipes считаются `pure`, что означает, что они выполняются только при изменении примитивного входного значения (например, `String`, `Number`, `Boolean` или `Symbol`) или ссылки на объект (например, `Array`, `Object`, `Function` или `Date`). Pure pipes дают преимущество в производительности, потому что Angular может избежать вызова функции преобразования, если переданное значение не изменилось.

В результате мутации свойств объектов или элементов массивов не обнаруживаются, пока вся ссылка на объект или массив не будет заменена другим экземпляром. Если нужен такой уровень change detection, см. [обнаружение изменений внутри массивов или объектов](#detecting-change-within-arrays-or-objects).

## Создание пользовательских pipes {#creating-custom-pipes}

Пользовательский pipe можно определить, реализовав класс TypeScript с декоратором `@Pipe`. У pipe должно быть две вещи:

- Имя, указанное в декораторе pipe
- Метод с именем `transform`, выполняющий преобразование значения.

Класс TypeScript дополнительно должен реализовывать интерфейс `PipeTransform`, чтобы гарантировать соответствие сигнатуре типа для pipe.

Вот пример пользовательского pipe, преобразующего строки в kebab case:

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

При создании пользовательского pipe импортируйте `Pipe` из пакета `@angular/core` и используйте его как декоратор для класса TypeScript.

```angular-ts
import {Pipe} from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe {}
```

Декоратор `@Pipe` требует `name`, которое контролирует, как pipe используется в шаблоне.

### Соглашение об именовании пользовательских pipes {#naming-convention-for-custom-pipes}

Соглашение об именовании пользовательских pipes состоит из двух правил:

- `name` — рекомендуется camelCase. Не используйте дефисы.
- `class name` — PascalCase-версия `name` с `Pipe` в конце

### Реализация интерфейса `PipeTransform` {#implement-the-pipetransform-interface}

В дополнение к декоратору `@Pipe` пользовательские pipes всегда должны реализовывать интерфейс `PipeTransform` из `@angular/core`.

```angular-ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {}
```

Реализация этого интерфейса гарантирует, что у класса pipe правильная структура.

### Преобразование значения pipe {#transforming-the-value-of-a-pipe}

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

### Добавление параметров в пользовательский pipe {#adding-parameters-to-a-custom-pipe}

Параметры преобразования можно добавить, добавив дополнительные параметры в метод `transform`:

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

Когда pipe должен обнаруживать изменения внутри массивов или объектов, его нужно пометить как impure-функцию, передав флаг `pure` со значением `false`.

IMPORTANT: Избегайте создания impure pipes, если это не абсолютно необходимо — они могут существенно снизить производительность при неосторожном использовании.

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

Разработчики Angular часто принимают соглашение включать `Impure` в `name` pipe и имя класса, чтобы указать другим разработчикам на потенциальную ловушку производительности.
