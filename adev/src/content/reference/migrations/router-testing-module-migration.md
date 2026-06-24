# Миграция RouterTestingModule

Эта схематика переносит использование `RouterTestingModule` в тестах на `RouterModule`.

Если тест импортирует `SpyLocation` из `@angular/common/testing` и использует свойство `urlChanges`, схематика также
добавит `provideLocationMocks()` для сохранения исходного поведения.

Запустите схематику с помощью команды:

```shell
ng generate @angular/core:router-testing-module-migration
```

## Опции

| Опция  | Описание                                                                                                                        |
| :----- | :------------------------------------------------------------------------------------------------------------------------------ |
| `path` | Путь (относительно корня проекта) для миграции. По умолчанию `./`. Используйте это для поэтапной миграции части вашего проекта. |

## Примеры

### Сохранение настроек маршрутизатора

До:

```ts
import { RouterTestingModule } from '@angular/router/testing';
import { SpyLocation } from '@angular/common/testing';

describe('test', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
       imports: [RouterTestingModule.withRoutes(routes, { initialNavigation: 'enabledBlocking' })]
    });
  });

});
```

После:

```ts
import { RouterModule } from '@angular/router';
import { SpyLocation } from '@angular/common/testing';

describe('test', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
       imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking' })]
    });
  });

});
```

### Добавление provideLocationMocks при импорте `SpyLocation` и использовании `urlChanges`

До:

```ts
import { RouterTestingModule } from '@angular/router/testing';
import { SpyLocation } from '@angular/common/testing';

describe('test', () => {
  let spy : SpyLocation;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    spy = TestBed.inject(SpyLocation);
  });

  it('Awesome test', () => {
    expect(spy.urlChanges).toBeDefined()
  })
});
```

После:

```ts
import { RouterModule } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { SpyLocation } from '@angular/common/testing';

describe('test', () => {
  let spy : SpyLocation;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [provideLocationMocks()]
    });
    spy = TestBed.inject(SpyLocation);
  });

  it('Awesome test', () => {
    expect(spy.urlChanges).toBeDefined()
  })
});
```
