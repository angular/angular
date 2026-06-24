# Pipes

## Обзор

Pipes (пайпы) — это специальные операторы в выражениях шаблонов Angular, которые позволяют декларативно преобразовывать
данные прямо в шаблоне. Pipe позволяют объявить функцию преобразования один раз, а затем использовать это преобразование
в нескольких шаблонах. В Angular для Pipe используется символ вертикальной черты (`|`),
вдохновленный [Unix pipe](<https://en.wikipedia.org/wiki/Pipeline_(Unix)>).

ПРИМЕЧАНИЕ: Синтаксис Pipe в Angular отличается от стандартного JavaScript, где символ вертикальной черты используется
для [побитового оператора ИЛИ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR).
Выражения шаблонов Angular не поддерживают побитовые операторы.

Ниже приведен пример использования некоторых встроенных Pipe, предоставляемых Angular:

```angular-ts
import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe, DatePipe, TitleCasePipe],
  template: `
    <main>
       <!-- Преобразовать название компании в title-case и
       преобразовать дату purchasedOn в строку, отформатированную согласно локали -->
<h1>Purchases from {{ company | titlecase }} on {{ purchasedOn | date }}</h1>

	    <!-- Преобразовать сумму в строку валюты -->
      <p>Total: {{ amount | currency }}</p>
    </main>
  `,
})
export class ShoppingCartComponent {
  amount = 123.45;
  company = 'acme corporation';
  purchasedOn = '2024-07-08';
}
```

Когда Angular рендерит компонент, он гарантирует, что формат даты и валюты будет соответствовать локали пользователя.
Если пользователь находится в США, результат будет следующим:

```angular-html
<main>
  <h1>Purchases from Acme Corporation on Jul 8, 2024</h1>
  <p>Total: $123.45</p>
</main>
```

Ознакомьтесь с [подробным руководством по i18n](/guide/i18n), чтобы узнать больше о том, как Angular локализует
значения.

### Встроенные Pipes

Angular включает набор встроенных Pipe в пакете `@angular/common`:

| Имя                                           | Описание                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [`AsyncPipe`](api/common/AsyncPipe)           | Считывает значение из `Promise` или RxJS `Observable`.                                                |
| [`CurrencyPipe`](api/common/CurrencyPipe)     | Преобразует число в строку валюты, отформатированную в соответствии с правилами локали.               |
| [`DatePipe`](api/common/DatePipe)             | Форматирует значение `Date` в соответствии с правилами локали.                                        |
| [`DecimalPipe`](api/common/DecimalPipe)       | Преобразует число в строку с десятичной точкой, отформатированную в соответствии с правилами локали.  |
| [`I18nPluralPipe`](api/common/I18nPluralPipe) | Сопоставляет значение со строкой, которая плюрализирует (склоняет) значение согласно правилам локали. |
| [`I18nSelectPipe`](api/common/I18nSelectPipe) | Сопоставляет ключ с пользовательским селектором, который возвращает желаемое значение.                |
| [`JsonPipe`](api/common/JsonPipe)             | Преобразует объект в строковое представление через `JSON.stringify`, предназначено для отладки.       |
| [`KeyValuePipe`](api/common/KeyValuePipe)     | Преобразует Object или Map в массив пар ключ-значение.                                                |
| [`LowerCasePipe`](api/common/LowerCasePipe)   | Преобразует текст в нижний регистр.                                                                   |
| [`PercentPipe`](api/common/PercentPipe)       | Преобразует число в строку с процентами, отформатированную в соответствии с правилами локали.         |
| [`SlicePipe`](api/common/SlicePipe)           | Создает новый массив (Array) или строку (String), содержащую подмножество (срез) элементов.           |
| [`TitleCasePipe`](api/common/TitleCasePipe)   | Преобразует текст в формат Title Case (первая буква каждого слова заглавная).                         |
| [`UpperCasePipe`](api/common/UpperCasePipe)   | Преобразует текст в верхний регистр.                                                                  |

## Использование Pipe

Оператор Pipe в Angular использует символ вертикальной черты (`|`) внутри выражения шаблона. Оператор Pipe является
бинарным оператором: левый операнд — это значение, передаваемое в функцию преобразования, а правый операнд — имя Pipe и
любые дополнительные аргументы (описанные ниже).

```angular-html
<p>Total: {{ amount | currency }}</p>
```

В этом примере значение `amount` передается в `CurrencyPipe`, где имя Pipe — `currency`. Затем отображается валюта по
умолчанию для локали пользователя.

### Объединение нескольких Pipe в одном выражении

Вы можете применить несколько преобразований к значению, используя несколько операторов Pipe. Angular выполняет Pipe
слева направо.

Следующий пример демонстрирует комбинацию Pipe для отображения локализованной даты в верхнем регистре:

```angular-html
<p>The event will occur on {{ scheduledOn | date | uppercase }}.</p>
```

### Передача параметров в Pipe

Некоторые Pipe принимают параметры для настройки преобразования. Чтобы указать параметр, добавьте после имени Pipe
двоеточие (`:`), за которым следует значение параметра.

Например, `DatePipe` может принимать параметры для форматирования даты определенным образом.

```angular-html
<p>The event will occur at {{ scheduledOn | date:'hh:mm' }}.</p>
```

Некоторые Pipe могут принимать несколько параметров. Вы можете указать дополнительные значения параметров, разделяя их
символом двоеточия (`:`).

Например, мы также можем передать второй необязательный параметр для управления часовым поясом.

```angular-html
<p>The event will occur at {{ scheduledOn | date:'hh:mm':'UTC' }}.</p>
```

## Как работают Pipe

Концептуально Pipe — это функции, которые принимают входное значение и возвращают преобразованное значение.

```angular-ts
import { Component } from '@angular/core';
import { CurrencyPipe} from '@angular/common';

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

1. `CurrencyPipe` импортируется из `@angular/common`.
1. `CurrencyPipe` добавляется в массив `imports`.
1. Данные `amount` передаются в Pipe `currency`.

### Приоритет оператора Pipe

Оператор Pipe имеет более низкий приоритет, чем другие бинарные операторы, включая `+`, `-`, `*`, `/`, `%`, `&&`, `||` и
`??`.

```angular-html
<!-- firstName и lastName конкатенируются до того, как результат будет передан в uppercase pipe -->
{{ firstName + lastName | uppercase }}
```

Оператор Pipe имеет более высокий приоритет, чем условный (тернарный) оператор.

```angular-html
{{ (isAdmin ? 'Access granted' : 'Access denied') | uppercase }}
```

Если бы то же самое выражение было написано без скобок:

```angular-html
{{ isAdmin ? 'Access granted' : 'Access denied' | uppercase }}
```

Оно было бы проанализировано как:

```angular-html
{{ isAdmin ? 'Access granted' : ('Access denied' | uppercase) }}
```

Всегда используйте скобки в выражениях, когда приоритет операторов может быть неоднозначным.

### Обнаружение изменений и Pipe

По умолчанию все Pipe считаются `pure` (чистыми). Это означает, что они выполняются только тогда, когда изменяется
примитивное входное значение (например, `String`, `Number`, `Boolean` или `Symbol`) или ссылка на объект (например,
`Array`, `Object`, `Function` или `Date`). Чистые Pipe обеспечивают преимущество в производительности, так как Angular
может избежать вызова функции преобразования, если переданное значение не изменилось.

В результате это означает, что мутации свойств объекта или элементов массива не обнаруживаются, пока ссылка на весь
объект или массив не будет заменена другим экземпляром. Если вам нужен такой уровень обнаружения изменений, обратитесь к
разделу [обнаружение изменений внутри массивов или объектов](#detecting-change-within-arrays-or-objects).

## Создание пользовательских Pipe

Вы можете определить собственный Pipe, реализовав класс TypeScript с декоратором `@Pipe`. Pipe должен иметь две вещи:

- Имя, указанное в декораторе Pipe.
- Метод с именем `transform`, который выполняет преобразование значения.

Класс TypeScript должен дополнительно реализовывать интерфейс `PipeTransform`, чтобы гарантировать соответствие
сигнатуре типа для Pipe.

Вот пример пользовательского Pipe, который преобразует строки в kebab-case:

```angular-ts
// kebab-case.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'kebabCase',
})
export class KebabCasePipe implements PipeTransform {
  transform(value: string): string {
    return value.toLowerCase().replace(/ /g, '-');
  }
}
```

### Использование декоратора `@Pipe`

При создании пользовательского Pipe импортируйте `Pipe` из пакета `@angular/core` и используйте его как декоратор для
класса TypeScript.

```angular-ts
import { Pipe } from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe {}
```

Декоратор `@Pipe` требует указания свойства `name`, которое управляет тем, как Pipe используется в шаблоне.

### Соглашение об именовании пользовательских Pipe

Соглашение об именовании пользовательских Pipe состоит из двух правил:

- `name` — рекомендуется использовать camelCase. Не используйте дефисы.
- `class name` — версия `name` в PascalCase с добавлением `Pipe` в конце.

### Реализация интерфейса `PipeTransform`

В дополнение к декоратору `@Pipe`, пользовательские Pipe всегда должны реализовывать интерфейс `PipeTransform` из
`@angular/core`.

```angular-ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {}
```

Реализация этого интерфейса гарантирует, что ваш класс Pipe имеет правильную структуру.

### Преобразование значения Pipe

Каждое преобразование вызывается методом `transform`, где первый параметр — это передаваемое значение, а возвращаемое
значение — результат преобразования.

```angular-ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {
  transform(value: string): string {
    return `My custom transformation of ${value}.`
  }
}
```

### Добавление параметров в пользовательский Pipe

Вы можете добавить параметры в преобразование, добавив дополнительные аргументы в метод `transform`:

```angular-ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {
  transform(value: string, format: string): string {
    let msg = `My custom transformation of ${value}.`

    if (format === 'uppercase') {
      return msg.toUpperCase()
    } else {
      return msg
    }
  }
}
```

### Обнаружение изменений внутри массивов или объектов {#detecting-change-within-arrays-or-objects}

Если вы хотите, чтобы Pipe обнаруживал изменения внутри массивов или объектов, он должен быть помечен как impure (
нечистая) функция путем передачи флага `pure` со значением `false`.

Избегайте создания impure Pipe без крайней необходимости, так как они могут привести к значительному снижению
производительности при неосторожном использовании.

```angular-ts
import { Pipe, PipeTransform } from '@angular/core';

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

Разработчики Angular часто придерживаются соглашения включать слово `Impure` в `name` и имя класса Pipe, чтобы указать
другим разработчикам на потенциальные проблемы с производительностью.
