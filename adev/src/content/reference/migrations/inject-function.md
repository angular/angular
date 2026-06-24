# Миграция на функцию `inject`

Функция `inject` в Angular предлагает более точные типы и лучшую совместимость со стандартными декораторами по сравнению
с внедрением зависимостей через конструктор.

Эта схематика преобразует внедрение через конструктор в ваших классах для использования функции `inject`.

Запустите схематику, используя следующую команду:

```shell
ng generate @angular/core:inject
```

#### До (Before)

```typescript
import { Component, Inject, Optional } from '@angular/core';
import { MyService } from './service';
import { DI_TOKEN } from './token';

@Component()
export class MyComp {
  constructor(
    private service: MyService,
    @Inject(DI_TOKEN) @Optional() readonly token: string
  ) {}
}
```

#### После (After)

```typescript
import { Component, inject } from '@angular/core';
import { MyService } from './service';
import { DI_TOKEN } from './token';

@Component()
export class MyComp {
  private service = inject(MyService);
  readonly token = inject(DI_TOKEN, { optional: true });
}
```

## Опции миграции

Миграция включает несколько опций для настройки результата.

### `path`

Определяет, какой подпуть в вашем проекте следует мигрировать. Передайте `.` или оставьте поле пустым, чтобы мигрировать
весь каталог.

### `migrateAbstractClasses`

Angular не проверяет, что параметры абстрактных классов доступны для внедрения. Это означает, что миграция не может
надежно перевести их на `inject` без риска поломок, поэтому по умолчанию эта опция отключена. Включите эту опцию, если
хотите мигрировать абстрактные классы, но учтите, что вам, возможно, придется **исправлять некоторые ошибки вручную**.

### `backwardsCompatibleConstructors`

По умолчанию миграция пытается максимально очистить код, что включает удаление параметров из конструктора или даже всего
конструктора, если он не содержит кода. В некоторых случаях это может привести к ошибкам компиляции, когда классы с
декораторами Angular наследуются от других классов с декораторами Angular. Если вы включите эту опцию, миграция
сгенерирует дополнительную сигнатуру конструктора для сохранения обратной совместимости ценой увеличения объема кода.

#### До (Before)

```typescript
import { Component } from '@angular/core';
import { MyService } from './service';

@Component()
export class MyComp {
  constructor(private service: MyService) {}
}
```

#### После (After)

```typescript
import { Component } from '@angular/core';
import { MyService } from './service';

@Component()
export class MyComp {
private service = inject(MyService);

/\*_ Inserted by Angular inject() migration for backwards compatibility _/
constructor(...args: unknown[]);

constructor() {}
}
```

### `nonNullableOptional`

Если внедрение не удается для параметра с декоратором `@Optional`, Angular возвращает `null`, что означает, что реальный
тип любого параметра `@Optional` будет `| null`. Однако, поскольку декораторы не могут влиять на свои типы, существует
много кода с некорректными типами. Тип исправляется при использовании `inject()`, что может привести к появлению новых
ошибок компиляции. Если вы включите эту опцию, миграция добавит утверждение non-null (оператор `!`) после вызова
`inject()`, чтобы соответствовать старому типу, ценой потенциального сокрытия ошибок типизации.

**ПРИМЕЧАНИЕ:** Утверждения non-null не будут добавлены к параметрам, которые уже типизированы как допускающие null,
поскольку код, зависящий от них, вероятно, уже учитывает их возможность быть null.

#### До (Before)

```typescript
import { Component, Inject, Optional } from '@angular/core';
import { TOKEN_ONE, TOKEN_TWO } from './token';

@Component()
export class MyComp {
  constructor(
    @Inject(TOKEN_ONE) @Optional() private tokenOne: number,
    @Inject(TOKEN_TWO) @Optional() private tokenTwo: string | null
  ) {}
}
```

#### После (After)

```typescript
import { Component, inject } from '@angular/core';
import { TOKEN_ONE, TOKEN_TWO } from './token';

@Component()
export class MyComp {
  // Note the `!` at the end.
  private tokenOne = inject(TOKEN_ONE, { optional: true })!;

  // Does not have `!` at the end, because the type was already nullable.
  private tokenTwo = inject(TOKEN_TWO, { optional: true });
}
```
