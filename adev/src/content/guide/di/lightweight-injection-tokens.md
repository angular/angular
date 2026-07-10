# Оптимизация размера клиентского приложения с помощью lightweight injection tokens

На этой странице — концептуальный обзор техники внедрения зависимостей, рекомендуемой разработчикам библиотек.
Проектирование библиотеки с _lightweight injection tokens_ помогает оптимизировать размер бандла клиентских приложений, использующих вашу библиотеку.

Структуру зависимостей между компонентами и injectable-сервисами можно управлять для оптимизации размера бандла с помощью tree-shakable провайдеров.
Обычно это гарантирует: если предоставленный компонент или сервис приложение фактически не использует, компилятор может удалить его код из бандла.

Из-за того, как Angular хранит injection tokens, неиспользуемый компонент или сервис всё же может попасть в бандл.
На этой странице описан паттерн проектирования DI, который обеспечивает корректный tree-shaking за счёт lightweight injection tokens.

Паттерн lightweight injection token особенно важен для авторов библиотек.
Он гарантирует: когда приложение использует лишь часть возможностей библиотеки, неиспользуемый код можно исключить из бандла клиента.

Когда приложение использует вашу библиотеку, часть поставляемых ею сервисов клиент может не применять.
В этом случае разработчик приложения ожидает, что сервис будет tree-shaken и не увеличит размер скомпилированного приложения.
Поскольку разработчик приложения не может знать о проблеме tree-shaking в библиотеке или исправить её, ответственность лежит на авторе библиотеки.
Чтобы неиспользуемые компоненты не удерживались в бандле, библиотека должна использовать паттерн lightweight injection token.

## Когда токены удерживаются {#when-tokens-are-retained}

Чтобы лучше объяснить условие удержания токена, рассмотрим библиотеку с компонентом library-card.
Компонент содержит body и может содержать опциональный header:

```html
<lib-card>
  <lib-header>…</lib-header>
</lib-card>
```

В типичной реализации `<lib-card>` использует `contentChild` или `contentChildren` для получения `<lib-header>` и `<lib-body>`, как ниже:

```ts {highlight: [14]}
import {Component, contentChild} from '@angular/core';

@Component({
  selector: 'lib-header',
  …,
})
class LibHeader {}

@Component({
  selector: 'lib-card',
  …,
})
class LibCard {
  readonly header = contentChild(LibHeader);
}
```

Поскольку `<lib-header>` опционален, элемент может появиться в шаблоне в минимальной форме `<lib-card />`.
В этом случае `<lib-header>` не используется, и ожидается tree-shaking — но этого не происходит.
Причина в том, что `LibCard` фактически содержит две ссылки на `LibHeader`:

```ts
readonly header = contentChild(LibHeader);
```

- Одна ссылка — в _позиции типа_: она указывает `LibHeader` как тип: `readonly header: Signal<LibHeader|undefined>`.
- Другая — в _позиции значения_: `LibHeader` передаётся в функцию `contentChild`: `contentChild(LibHeader)`.

Компилятор обрабатывает ссылки на токены в этих позициях по-разному:

- Ссылки в _позиции типа_ стираются после преобразования из TypeScript и не влияют на tree-shaking.
- Ссылки в _позиции значения_ компилятор обязан сохранить в runtime, что **мешает** tree-shaking компонента.

В примере компилятор удерживает токен `LibHeader` из позиции значения.
Это мешает tree-shaking ссылаемого компонента, даже если приложение нигде не использует `<lib-header>`.
Если код, шаблон и стили `LibHeader` вместе становятся слишком большими, ненужное включение заметно увеличивает размер клиентского приложения.

## Когда использовать паттерн lightweight injection token {#when-to-use-the-lightweight-injection-token-pattern}

Проблема tree-shaking возникает, когда компонент используется как injection token.
Это возможно в двух случаях:

- Токен используется в позиции значения [content query](guide/components/queries#content-queries).
- Токен используется с функцией `inject`.

В следующем примере оба использования токена `CustomOther` удерживают `CustomOther` и мешают tree-shaking, когда он не используется:

```ts {highlight: [[2],[4]]}
class App {
  private readonly other = inject(CustomOther, {optional: true});

  readonly header = contentChild(CustomOther);
}
```

Хотя токены, используемые только как спецификаторы типов, удаляются при преобразовании в JavaScript, все токены для внедрения зависимостей нужны в runtime.
При `inject(CustomOther)` `CustomOther` передаётся как аргумент-значение.
Токен оказывается в позиции значения, и tree-shaker сохраняет ссылку.

HELPFUL: Библиотекам следует использовать [tree-shakable провайдеры](guide/di/defining-dependency-providers) для всех сервисов, предоставляя зависимости на уровне root, а не в компонентах или модулях.

## Использование lightweight injection tokens {#using-lightweight-injection-tokens}

Паттерн lightweight injection token состоит в использовании небольшого абстрактного класса как injection token и предоставлении реальной реализации позже.
Абстрактный класс удерживается (не tree-shaken), но он мал и существенно не влияет на размер приложения.

Следующий пример показывает, как это работает для `LibHeader`:

```ts {highlight: [[1],[5], [15]]}
abstract class LibHeaderToken {}

@Component({
  selector: 'lib-header',
  providers: [{provide: LibHeaderToken, useExisting: LibHeader}],
  …,
})
class LibHeader extends LibHeaderToken {}

@Component({
  selector: 'lib-card',
  …,
})
class LibCard {
  readonly header = contentChild(LibHeaderToken);
}
```

В этом примере реализация `LibCard` больше не ссылается на `LibHeader` ни в позиции типа, ни в позиции значения.
Это позволяет полностью tree-shake'ить `LibHeader`.
`LibHeaderToken` удерживается, но это лишь объявление класса без конкретной реализации.
Он мал и после компиляции существенно не влияет на размер приложения.

Вместо этого сам `LibHeader` реализует абстрактный класс `LibHeaderToken`.
Этот токен можно безопасно использовать как провайдер в определении компонента, позволяя Angular корректно внедрять конкретный тип.

Итого, паттерн lightweight injection token включает:

1. Lightweight injection token в виде абстрактного класса.
2. Определение компонента, реализующего абстрактный класс.
3. Внедрение по lightweight-паттерну через `contentChild` или `contentChildren`.
4. Провайдер в реализации, связывающий lightweight injection token с реализацией.

### Использование lightweight injection token для определения API {#use-the-lightweight-injection-token-for-api-definition}

Компоненту, внедряющему lightweight injection token, может понадобиться вызвать метод внедрённого класса.
Токен теперь — абстрактный класс. Поскольку injectable-компонент его реализует, в абстрактном классе токена нужно объявить и абстрактный метод.
Реализация метода со всем кодом остаётся в injectable-компоненте, который можно tree-shake'ить.
Так родитель может типобезопасно общаться с дочерним элементом, если он присутствует.

Например, `LibCard` теперь запрашивает `LibHeaderToken`, а не `LibHeader`.
Следующий пример показывает, как паттерн позволяет `LibCard` общаться с `LibHeader`, не ссылаясь на `LibHeader` напрямую:

```ts {highlight: [[2],[7],[11],[19]]}
abstract class LibHeaderToken {
  abstract doSomething(): void;
}

@Component({
  selector: 'lib-header',
  providers: [{provide: LibHeaderToken, useExisting: LibHeader}],
})
class LibHeader extends LibHeaderToken {
  doSomething(): void {
    // Concrete implementation of `doSomething`
  }
}

@Component({
  selector: 'lib-card',
})
class LibCard implements AfterContentInit {
  readonly header = contentChild(LibHeaderToken);

  ngAfterContentInit(): void {
    if (this.header() !== undefined) {
      this.header()!.doSomething();
    }
  }
}
```

В этом примере родитель запрашивает токен, чтобы получить дочерний компонент, и сохраняет ссылку, если он есть.
Перед вызовом метода у дочернего элемента родитель проверяет его наличие.
Если дочерний компонент был tree-shaken, в runtime на него нет ссылки и вызова его метода нет.

### Именование lightweight injection token {#naming-your-lightweight-injection-token}

Lightweight injection tokens полезны только с компонентами.
[Руководство по стилю Angular](style-guide) рекомендует именовать компоненты без суффикса `Component`.
Пример `LibHeader` следует этому соглашению.

Нужно сохранять связь между компонентом и его токеном, при этом различая их.
Рекомендуемый стиль — базовое имя компонента с суффиксом `Token`: `LibHeaderToken`.
