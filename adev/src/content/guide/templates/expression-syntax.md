# Синтаксис выражений

Выражения Angular основаны на JavaScript, но отличаются в ряде ключевых моментов. Это руководство проходит по сходствам и различиям между выражениями Angular и стандартным JavaScript.

## Литералы значений {#value-literals}

Angular поддерживает подмножество [литеральных значений](https://developer.mozilla.org/en-US/docs/Glossary/Literal) из JavaScript.

### Поддерживаемые литералы значений {#supported-value-literals}

| Тип литерала           | Примеры значений                |
| ---------------------- | ------------------------------- |
| String                 | `'Hello'`, `"World"`            |
| Boolean                | `true`, `false`                 |
| Number                 | `123`, `3.14`                   |
| Object                 | `{name: 'Alice'}`               |
| Array                  | `['Onion', 'Cheese', 'Garlic']` |
| null                   | `null`                          |
| RegExp                 | `/\d+/`                         |
| Template string        | `` `Hello ${name}` ``           |
| Tagged template string | `` tag`Hello ${name}` ``        |

### Неподдерживаемые литералы значений {#unsupported-value-literals}

| Тип литерала | Примеры значений |
| ------------ | ---------------- |
| BigInt       | `1n`             |

## Globals {#globals}

Выражения Angular поддерживают следующие [globals](https://developer.mozilla.org/en-US/docs/Glossary/Global_object):

- [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
- [$any](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any)

Другие JavaScript globals не поддерживаются. К распространённым JavaScript globals относятся `Number`, `Boolean`, `NaN`, `Infinity`, `parseInt` и другие.

## Локальные переменные {#local-variables}

Angular автоматически делает специальные локальные переменные доступными для использования в выражениях в определённых контекстах. Эти специальные переменные всегда начинаются с символа доллара (`$`).

Например, блоки `@for` предоставляют несколько локальных переменных с информацией о цикле, например `$index`.

## Какие операторы поддерживаются? {#what-operators-are-supported}

### Поддерживаемые операторы {#supported-operators}

Angular поддерживает следующие операторы из стандартного JavaScript.

| Оператор                      | Пример(ы)                                      |
| ----------------------------- | ---------------------------------------------- |
| Add / Concatenate             | `1 + 2`                                        |
| Subtract                      | `52 - 3`                                       |
| Multiply                      | `41 * 6`                                       |
| Divide                        | `20 / 4`                                       |
| Remainder (Modulo)            | `17 % 5`                                       |
| Exponentiation                | `10 ** 3`                                      |
| Parenthesis                   | `9 * (8 + 4)`                                  |
| Conditional (Ternary)         | `a > b ? true : false`                         |
| And (Logical)                 | `&&`                                           |
| Or (Logical)                  | `\|\|`                                         |
| Not (Logical)                 | `!`                                            |
| Nullish Coalescing            | `possiblyNullValue ?? 'default'`               |
| Comparison Operators          | `<`, `<=`, `>`, `>=`, `==`, `===`, `!==`, `!=` |
| Unary Negation                | `-x`                                           |
| Unary Plus                    | `+y`                                           |
| Property Accessor             | `person['name']`                               |
| typeof                        | `typeof 42`                                    |
| void                          | `void 1`                                       |
| in                            | `'model' in car`                               |
| instanceof                    | `car instanceof Automobile`                    |
| Assignment                    | `a = b`                                        |
| Addition Assignment           | `a += b`                                       |
| Subtraction Assignment        | `a -= b`                                       |
| Multiplication Assignment     | `a *= b`                                       |
| Division Assignment           | `a /= b`                                       |
| Remainder Assignment          | `a %= b`                                       |
| Exponentiation Assignment     | `a **= b`                                      |
| Logical AND Assignment        | `a &&= b`                                      |
| Logical OR Assignment         | `a \|\|= b`                                    |
| Nullish Coalescing Assignment | `a ??= b`                                      |
| Spread in object literals     | `{...obj, foo: 'bar'}`                         |
| Spread in array literals      | `[...arr, 1, 2, 3]`                            |
| Rest in function calls        | `fn(...args)`                                  |

Выражения Angular дополнительно поддерживают следующие нестандартные операторы:

| Оператор                        | Пример(ы)                      |
| ------------------------------- | ------------------------------ |
| [Pipe](/guide/templates/pipes)  | `{{ total \| currency }}`      |
| Optional chaining\*             | `someObj.someProp?.nestedProp` |
| Non-null assertion (TypeScript) | `someObj!.someProp`            |

### Миграция safe navigation {#safe-navigation-migration}

До Angular 22 оператор optional chaining (`?.`) возвращал `null`, когда левая сторона равна `null` или `undefined`, тогда как стандартный JavaScript `?.` возвращает `undefined`.
Начиная с Angular 22, поведение оператора optional chaining в выражениях Angular выровнено со стандартным поведением JavaScript.

Во время миграции на v22 schematics `ng update` добавили magic-функцию `$safeNavigationMigration` к существующим выражениям, чтобы сохранить прежнее поведение с возвратом `null`.

```html
{{ $safeNavigationMigration(foo?.bar) }}
```

`$safeNavigationMigration` — **только временная помощь при миграции**. Она указывает компилятору компилировать обёрнутое выражение safe-navigation с legacy-семантикой возврата `null`, а не со стандартной семантикой JavaScript `?.`. Это не настоящая функция и её нельзя вызвать из TypeScript.

NOTE: Предпочитайте мигрировать выражения так, чтобы они больше не опирались на различия `null` и `undefined`, и `$safeNavigationMigration` можно было удалить. Эта функция может быть удалена в будущей версии Angular.

### Неподдерживаемые операторы {#unsupported-operators}

| Оператор              | Пример(ы)                         |
| --------------------- | --------------------------------- |
| All bitwise operators | `&`, `&=`, `~`, `\|=`, `^=`, etc. |
| Object destructuring  | `const { name } = person`         |
| Array destructuring   | `const [firstItem] = items`       |
| Comma operator        | `x = (x++, x)`                    |
| new                   | `new Car()`                       |

## Лексический контекст для выражений {#lexical-context-for-expressions}

Выражения Angular вычисляются в контексте класса компонента, а также любых релевантных [переменных шаблона](/guide/templates/variables), locals и globals.

При обращении к членам класса компонента `this` всегда подразумевается. Однако если шаблон объявляет [переменную шаблона](guide/templates/variables) с тем же именем, что и член, переменная затеняет этот член. К такому члену класса можно однозначно обратиться, явно используя `this.`. Это полезно при создании объявления `@let`, которое затеняет член класса, например для сужения сигналов.

## Объявления {#declarations}

В целом объявления в выражениях Angular не поддерживаются. Это включает, но не ограничивается:

| Объявления      | Пример(ы)                                   |
| --------------- | ------------------------------------------- |
| Variables       | `let label = 'abc'`, `const item = 'apple'` |
| Functions       | `function myCustomFunction() { }`           |
| Arrow Functions | `() => { }`                                 |
| Classes         | `class Rectangle { }`                       |

## Statements слушателей событий {#event-listener-statements}

Обработчики событий — это **statements**, а не выражения. Хотя они поддерживают весь тот же синтаксис, что и выражения Angular, есть два ключевых различия:

1. Statements **поддерживают** операторы присваивания (но не destructuring assignments)
1. Statements **не поддерживают** pipes
