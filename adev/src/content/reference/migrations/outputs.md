# Миграция на функцию output

В Angular v17.3 появился улучшенный API для outputs, который считается
готовым к production начиная с v19. Этот API похож на API `input()`, но не основан на Signals.
Подробнее о функции output для пользовательских событий и её преимуществах читайте в [отдельном руководстве](guide/components/outputs).

Для поддержки существующих проектов, которые хотели бы использовать функцию output, команда Angular
предоставляет автоматизированную миграцию, преобразующую пользовательские события `@Output` в новый API `output()`.

Запустите schematic следующей командой:

```bash
ng generate @angular/core:output-migration
```

## Что меняет миграция? {#what-does-the-migration-change}

1. Члены класса `@Output()` обновляются до их эквивалента `output()`.
2. Импорты в файле компонентов или директив на уровне модуля TypeScript также обновляются.
3. Вызовы API вроде `event.next()`, использование которых не рекомендуется, мигрируют на `event.emit()`, а вызовы `event.complete()` удаляются.

**До**

```typescript
import {Component, Output, EventEmitter} from '@angular/core';

@Component({
  template: `<button (click)="someMethod('test')">emit</button>`,
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
  template: `<button (click)="someMethod('test')">emit</button>`,
})
export class MyComponent {
  readonly someChange = output<string>();

  someMethod(value: string): void {
    this.someChange.emit(value);
  }
}
```

## Опции конфигурации {#configuration-options}

Миграция поддерживает несколько опций для тонкой настройки под конкретные нужды.

### `--path` {#--path}

Если не указано, миграция запросит путь и обновит весь Angular CLI workspace.
С помощью этой опции можно ограничить миграцию конкретным подкаталогом.

### `--analysis-dir` {#--analysis-dir}

В крупных проектах эту опцию можно использовать, чтобы уменьшить число анализируемых файлов.
По умолчанию миграция анализирует весь workspace независимо от опции `--path`, чтобы
обновить все ссылки, затронутые миграцией `@Output()`.

С этой опцией анализ можно ограничить подпапкой. Обратите внимание: это означает, что любые
ссылки вне этого каталога молча пропускаются, потенциально ломая сборку.

Используйте эти опции, как показано ниже:

```bash
ng generate @angular/core:output-migration --path src/app/sub-folder
```

## Исключения {#exceptions}

В некоторых случаях миграция не затрагивает код.
Одно из таких исключений — когда событие используется с методом `pipe()`.
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
