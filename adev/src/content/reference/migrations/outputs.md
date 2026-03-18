# Миграция на функцию output

В Angular v17.3 был представлен улучшенный API для outputs, который считается готовым к использованию в продакшене начиная с v19. Этот API имитирует API `input()`, но не основан на Signals.
Подробнее о пользовательских событиях с функцией output и её преимуществах читайте в [специальном руководстве](guide/components/outputs).

Для поддержки существующих проектов, желающих использовать функцию output, команда Angular предоставляет автоматизированную миграцию, которая преобразует пользовательские события `@Output` в новый API `output()`.

Запустите схематик с помощью следующей команды:

```bash
ng generate @angular/core:output-migration
```

## Что изменяет миграция? {#what-does-the-migration-change}

1. Члены класса с `@Output()` обновляются до их эквивалента с `output()`.
2. Импорты в файлах компонентов или директив на уровне TypeScript-модуля также обновляются.
3. Вызовы API, такие как `event.next()`, использование которых не рекомендуется, мигрируются на `event.emit()`, а вызовы `event.complete()` удаляются.

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

## Параметры конфигурации {#configuration-options}

Миграция поддерживает несколько параметров для тонкой настройки под ваши конкретные нужды.

### `--path`

Если не указан, миграция запросит путь и обновит всё рабочее пространство Angular CLI.
Используйте этот параметр, чтобы ограничить миграцию конкретной поддиректорией.

### `--analysis-dir`

В крупных проектах этот параметр позволяет сократить количество анализируемых файлов.
По умолчанию миграция анализирует всё рабочее пространство, независимо от параметра `--path`, чтобы обновить все ссылки, затронутые миграцией `@Output()`.

С помощью этого параметра можно ограничить анализ подпапкой. Обратите внимание, что в таком случае любые ссылки за пределами этой директории будут молча пропущены, что может привести к ошибкам сборки.

Используйте эти параметры следующим образом:

```bash
ng generate @angular/core:output-migration --path src/app/sub-folder
```

## Исключения {#exceptions}

В некоторых случаях миграция не изменяет код.
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
