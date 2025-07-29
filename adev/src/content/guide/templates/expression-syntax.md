# Expression Syntax

Angular expressions are based on JavaScript, but differ in some key ways. This guide walks through the similarities and differences between Angular expressions and standard JavaScript.

## Value literals

Angular supports a subset of [literal values](https://developer.mozilla.org/en-US/docs/Glossary/Literal) from JavaScript.

### Supported value literals

| Literal type           | Example values                  |
| ---------------------- | ------------------------------- |
| String                 | `'Hello'`, `"World"`            |
| Boolean                | `true`, `false`                 |
| Number                 | `123`, `3.14`                   |
| Object                 | `{name: 'Alice'}`               |
| Array                  | `['Onion', 'Cheese', 'Garlic']` |
| null                   | `null`                          |
| Template string        | `` `Hello ${name}` ``           |

### Unsupported literals

| Literal type           | Example value            |
| ---------------------- | ------------------------ |
| RegExp                 | `/\d+/`                  |

## Globals

Angular expressions support the following [globals](https://developer.mozilla.org/en-US/docs/Glossary/Global_object):

- [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
- [$any](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any)

No other JavaScript globals are supported. Common JavaScript globals include `Number`, `Boolean`, `NaN`, `Infinity`, `parseInt`, and more.

## Local variables

Angular automatically makes special local variables available for use in expressions in specific contexts. These special variables always start with the dollar sign character (`$`).

For example, `@for` blocks make several local variables corresponding to information about the loop, such as `$index`.

## What operators are supported?

### Supported operators

Angular supports the following operators from standard JavaScript.

| Operator                        | Example(s)                               |
| ------------------------------- | ---------------------------------------- |
| Add / Concatenate               | `1 + 2`                                  |
| Subtract                        | `52 - 3`                                 |
| Multiply                        | `41 * 6`                                 |
| Divide                          | `20 / 4`                                 |
| Remainder (Modulo)              | `17 % 5`                                 |
| Exponentiation                  | `10 ** 3`                                |
| Parenthesis                     | `9 * (8 + 4)`                            |
| Conditional (Ternary)           | `a > b ? true : false`                   |
| And (Logical)                   | `&&`                                     |
| Or (Logical)                    | `\|\|`                                   |
| Not (Logical)                   | `!`                                      |
| Nullish Coalescing              | `possiblyNullValue ?? 'default'`         |
| Comparison Operators            | `<`, `<=`, `>`, `>=`, `==`, `===`, `!==` |
| Unary Negation                  | `-x`                                     |
| Unary Plus                      | `+y`                                     |
| Property Accessor               | `person['name']`                         |
| Assignment                      | `a = b`                                  |
| Addition Assignment             | `a += b`                                 |
| Subtraction Assignment          | `a -= b`                                 |
| Multiplication Assignment       | `a *= b`                                 |
| Division Assignment             | `a /= b`                                 |
| Remainder Assignment            | `a %= b`                                 |
| Exponentiation Assignment       | `a **= b`                                |
| Logical AND Assignment          | `a &&= b`                                |
| Logical OR Assignment           | `a \|\|= b`                              |
| Nullish Coalescing Assignment   | `a ??= b`                                |

Angular expressions additionally also support the following non-standard operators:

| Operator                        | Example(s)                     |
| ------------------------------- | ------------------------------ |
| [Pipe](/guide/templates/pipes) | `{{ total \| currency }}`      |
| Optional chaining\*             | `someObj.someProp?.nestedProp` |
| Non-null assertion (TypeScript) | `someObj!.someProp`            |

NOTE: Optional chaining behaves differently from the standard JavaScript version in that if the left side of Angular’s optional chaining operator is `null` or `undefined`, it returns `null` instead of `undefined`.

### Unsupported operators

| Operator              | Example(s)                        |
| --------------------- | --------------------------------- |
| All bitwise operators | `&`, `&=`, `~`, `\|=`, `^=`, etc. |
| Object destructuring  | `const { name } = person`         |
| Array destructuring   | `const [firstItem] = items`       |
| Comma operator        | `x = (x++, x)`                    |
| instanceof            | `car instanceof Automobile`       |
| new                   | `new Car()`                       |

## Lexical context for expressions

Angular expressions are evaluated within the context of the component class as well as any relevant [template variables](/guide/templates/variables), locals, and globals.

When referring to component class members, `this` is always implied. However, if a template declares a [template variables](guide/templates/variables) with the same name as a member, the variable shadows that member. You can unambiguously reference such a class member by explicitly using `this.`. This can be useful when creating an `@let` declaration that shadows a class member, e.g. for signal narrowing purposes.

## Declarations

Generally speaking, declarations are not supported in Angular expressions. This includes, but is not limited to:

| Declarations    | Example(s)                                  |
| --------------- | ------------------------------------------- |
| Variables       | `let label = 'abc'`, `const item = 'apple'` |
| Functions       | `function myCustomFunction() { }`           |
| Arrow Functions | `() => { }`                                 |
| Classes         | `class Rectangle { }`                       |

# Event listener statements

Event handlers are **statements** rather than expressions. While they support all of the same syntax as Angular expressions, the are two key differences:

1. Statements **do support** assignment operators (but not destructing assignments)
1. Statements **do not support** pipes
