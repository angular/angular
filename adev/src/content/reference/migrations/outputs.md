# Миграция на функцию output

В Angular v17.3 был представлен улучшенный API для выходных свойств (outputs), который считается готовым к использованию
в продакшене (production ready) начиная с версии v19. Этот API имитирует API `input()`, но не основан на Сигналах.
Подробнее о функции output для пользовательских событий и ее преимуществах читайте
в [специальном руководстве](guide/components/outputs).

Чтобы поддержать существующие проекты, желающие использовать функцию output, команда Angular предоставляет
автоматизированную миграцию, которая преобразует пользовательские события `@Output` в новый API `output()`.

Запустите схематик, используя следующую команду:

```bash
ng generate @angular/core:output-migration
```

## Что меняет миграция?

1. Члены класса с `@Output()` обновляются до их эквивалента `output()`.
2. Импорты в файлах компонентов или директив (на уровне модуля TypeScript) также обновляются.
3. Мигрирует функции API, такие как `event.next()` (использование которого не рекомендуется) на `event.emit()`, и
   удаляет вызовы `event.complete()`.

**До**

```typescript
import {Component, Output, EventEmitter} from '@angular/core';

@Component({
  template: `<button (click)="someMethod('test')">emit</button>`
})
export class MyComponent {
  @Output() someChange = new EventEmitter<string>();

  someMethod(value: string): void {
    this.someChange.emit(value);
  }
}
```

**После**

```typescript
import {Component, output} from '@angular/core';

@Component({
  template: `<button (click)="someMethod('test')">emit</button>`
})
export class MyComponent {
  readonly someChange = output<string>();

  someMethod(value: string): void {
    this.someChange.emit(value);
  }
}
```

## Опции конфигурации

Миграция поддерживает несколько опций для точной настройки под ваши конкретные нужды.

### `--path`

Если не указано, миграция запросит путь и обновит все рабочее пространство Angular CLI.
Вы можете ограничить миграцию конкретным подкаталогом, используя эту опцию.

### `--analysis-dir`

В крупных проектах вы можете использовать эту опцию, чтобы сократить количество анализируемых файлов.
По умолчанию миграция анализирует все рабочее пространство, независимо от опции `--path`, чтобы обновить все ссылки,
затронутые миграцией `@Output()`.

С помощью этой опции можно ограничить анализ подпапкой. Обратите внимание: это означает, что любые ссылки за пределами
этого каталога будут пропущены без предупреждения, что потенциально может нарушить сборку.

Используйте эти опции, как показано ниже:

```bash
ng generate @angular/core:output-migration --path src/app/sub-folder
```

## Исключения

В некоторых случаях миграция не затронет код.
Одним из таких исключений является случай, когда событие используется с методом `pipe()`.
Следующий код не будет мигрирован:

```typescript
export class MyDialogComponent {
  @Output() close = new EventEmitter<void>();
  doSome(): void {
    this.close.complete();
  }
  otherThing(): void {
    this.close.pipe();
  }
}
```
