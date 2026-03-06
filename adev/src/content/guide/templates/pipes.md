# Pipe {#pipes}

## Обзор {#overview}

Pipe — это специальный оператор в выражениях шаблонов Angular, позволяющий декларативно преобразовывать данные в шаблоне. Pipe позволяют объявить функцию преобразования один раз и затем использовать это преобразование в нескольких шаблонах. Pipe в Angular используют символ вертикальной черты (`|`), вдохновленный [конвейером Unix](<https://en.wikipedia.org/wiki/Pipeline_(Unix)>).

NOTE: Синтаксис pipe в Angular отличается от стандартного JavaScript, который использует символ вертикальной черты для [побитового оператора ИЛИ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR). Выражения шаблонов Angular не поддерживают побитовые операторы.

Вот пример использования некоторых встроенных pipe, которые предоставляет Angular:

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

При рендеринге компонента Angular обеспечивает соответствие формата даты и валюты локали пользователя. Если пользователь находится в США, результат рендеринга будет таким:

```angular-html
<main>
  <h1>Purchases from Acme Corporation on Jul 8, 2024</h1>
  <p>Total: $123.45</p>
</main>
```

Подробнее о локализации значений в Angular см. [руководство по i18n](/guide/i18n).

### Встроенные Pipe {#built-in-pipes}

Angular включает набор встроенных pipe в пакете `@angular/common`:

| Название                                      | Описание                                                                                        |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [`AsyncPipe`](api/common/AsyncPipe)           | Считывает значение из `Promise` или RxJS `Observable`.                                          |
| [`CurrencyPipe`](api/common/CurrencyPipe)     | Преобразует число в строку валюты, форматированную в соответствии с правилами локали.             |
| [`DatePipe`](api/common/DatePipe)             | Форматирует значение `Date` в соответствии с правилами локали.                                   |
| [`DecimalPipe`](api/common/DecimalPipe)       | Преобразует число в строку с десятичной точкой, форматированную в соответствии с правилами локали. |
| [`I18nPluralPipe`](api/common/I18nPluralPipe) | Сопоставляет значение со строкой множественного числа в соответствии с правилами локали.          |
| [`I18nSelectPipe`](api/common/I18nSelectPipe) | Сопоставляет ключ с пользовательским селектором, возвращающим нужное значение.                    |
| [`JsonPipe`](api/common/JsonPipe)             | Преобразует объект в строковое представление через `JSON.stringify`, предназначено для отладки.    |
| [`KeyValuePipe`](api/common/KeyValuePipe)     | Преобразует Object или Map в массив пар ключ-значение.                                           |
| [`LowerCasePipe`](api/common/LowerCasePipe)   | Преобразует текст в нижний регистр.                                                              |
| [`PercentPipe`](api/common/PercentPipe)       | Преобразует число в строку процентов, форматированную в соответствии с правилами локали.          |
| [`SlicePipe`](api/common/SlicePipe)           | Создает новый массив или строку, содержащую подмножество (срез) элементов.                       |
| [`TitleCasePipe`](api/common/TitleCasePipe)   | Преобразует текст в регистр заголовка (Title Case).                                              |
| [`UpperCasePipe`](api/common/UpperCasePipe)   | Преобразует текст в верхний регистр.                                                             |

## Использование pipe {#using-pipes}

Оператор pipe в Angular использует символ вертикальной черты (`|`) внутри выражения шаблона. Оператор pipe является бинарным — левый операнд передается как значение в функцию преобразования, а правый операнд — это имя pipe и любые дополнительные аргументы (описаны ниже).

```angular-html
<p>Total: {{ amount | currency }}</p>
```

В этом примере значение `amount` передается в `CurrencyPipe`, имя pipe — `currency`. Затем рендерится валюта по умолчанию для локали пользователя.

### Объединение нескольких pipe в одном выражении {#combining-multiple-pipes-in-the-same-expression}

Вы можете применить несколько преобразований к значению, используя несколько операторов pipe. Angular выполняет pipe слева направо.

Следующий пример демонстрирует комбинацию pipe для отображения локализованной даты в верхнем регистре:

```angular-html
<p>The event will occur on {{ scheduledOn | date | uppercase }}.</p>
```

### Передача параметров в pipe {#passing-parameters-to-pipes}

Некоторые pipe принимают параметры для настройки преобразования. Для указания параметра добавьте двоеточие (`:`) после имени pipe, за которым следует значение параметра.

Например, `DatePipe` может принимать параметры для форматирования даты определенным образом.

```angular-html
<p>The event will occur at {{ scheduledOn | date: 'hh:mm' }}.</p>
```

Некоторые pipe могут принимать несколько параметров. Дополнительные значения параметров разделяются символом двоеточия (`:`).

Например, можно также передать второй необязательный параметр для управления часовым поясом.

```angular-html
<p>The event will occur at {{ scheduledOn | date: 'hh:mm' : 'UTC' }}.</p>
```

## Как работают pipe {#how-pipes-work}

Концептуально pipe — это функции, которые принимают входное значение и возвращают преобразованное значение.

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

Если то же выражение написано без скобок:

<!-- prettier-ignore -->
```angular-html
{{ isAdmin ? 'Access granted' : 'Access denied' | uppercase }}
```

Оно будет разобрано как:

```angular-html
{{ isAdmin ? 'Access granted' : ('Access denied' | uppercase) }}
```

Всегда используйте скобки в выражениях, когда приоритет операторов может быть неоднозначным.

### Обнаружение изменений с помощью pipe {#change-detection-with-pipes}

По умолчанию все pipe считаются `pure` (чистыми), что означает их выполнение только при изменении примитивного входного значения (такого как `String`, `Number`, `Boolean` или `Symbol`) или ссылки на объект (такого как `Array`, `Object`, `Function` или `Date`). Чистые pipe предоставляют преимущество в производительности, поскольку Angular может избежать вызова функции преобразования, если переданное значение не изменилось.

В результате это означает, что мутации свойств объектов или элементов массивов не обнаруживаются, если вся ссылка на объект или массив не заменена другим экземпляром. Если необходим такой уровень обнаружения изменений, обратитесь к разделу [обнаружение изменений внутри массивов или объектов](#detecting-change-within-arrays-or-objects).

## Создание пользовательских pipe {#creating-custom-pipes}

Вы можете определить пользовательский pipe, реализовав TypeScript-класс с декоратором `@Pipe`. Pipe должен иметь два элемента:

- Имя, указанное в декораторе pipe
- Метод `transform`, выполняющий преобразование значения.

TypeScript-класс должен дополнительно реализовать интерфейс `PipeTransform`, чтобы гарантировать соответствие типовой сигнатуре pipe.

Вот пример пользовательского pipe, преобразующего строки в kebab-case:

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

При создании пользовательского pipe импортируйте `Pipe` из пакета `@angular/core` и используйте его в качестве декоратора для TypeScript-класса.

```angular-ts
import {Pipe} from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe {}
```

Декоратор `@Pipe` требует указания `name`, которое определяет, как pipe используется в шаблоне.

### Соглашение об именовании пользовательских pipe {#naming-convention-for-custom-pipes}

Соглашение об именовании пользовательских pipe состоит из двух правил:

- `name` — рекомендуется camelCase. Не используйте дефисы.
- `class name` — PascalCase-версия `name` с добавлением `Pipe` в конце

### Реализация интерфейса `PipeTransform` {#implement-the-pipetransform-interface}

Помимо декоратора `@Pipe`, пользовательские pipe всегда должны реализовать интерфейс `PipeTransform` из `@angular/core`.

```angular-ts
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {}
```

Реализация этого интерфейса гарантирует правильную структуру вашего класса pipe.

### Преобразование значения pipe {#transforming-the-value-of-a-pipe}

Каждое преобразование вызывается методом `transform`, первый параметр которого — передаваемое значение, а возвращаемое значение — результат преобразования.

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

### Добавление параметров к пользовательскому pipe {#adding-parameters-to-a-custom-pipe}

Вы можете добавить параметры к преобразованию, добавив дополнительные параметры в метод `transform`:

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

Когда необходимо, чтобы pipe обнаруживал изменения внутри массивов или объектов, его нужно пометить как нечистый (impure), передав флаг `pure` со значением `false`.

IMPORTANT: Избегайте создания нечистых pipe без крайней необходимости, так как они могут значительно снизить производительность при неосторожном использовании.

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

Разработчики Angular часто придерживаются соглашения включать `Impure` в имя pipe и имя класса, чтобы указать другим разработчикам на потенциальное снижение производительности.
