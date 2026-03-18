# Миграция на signal queries {#migration-to-signal-queries}

В Angular были представлены улучшенные API для запросов, которые считаются готовыми к использованию в продакшене начиная с v19.
Подробнее о signal queries и их преимуществах читайте в [специальном руководстве](guide/components/queries).

Для поддержки существующих команд, желающих использовать signal queries, команда Angular предоставляет автоматизированную миграцию, которая преобразует существующие поля запросов с декораторами в новый API.

Запустите схематик с помощью следующей команды:

```bash
ng generate @angular/core:signal-queries-migration
```

Кроме того, миграция доступна как [действие рефакторинга кода](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) в VSCode.
Установите последнюю версию расширения VSCode и нажмите, например, на поле с `@ViewChild`.
Подробнее см. в разделе [ниже](#vscode-extension).

## Что изменяет миграция? {#what-does-the-migration-change}

1. Члены класса с `@ViewChild()`, `@ViewChildren`, `@ContentChild` и `@ContentChildren`
   обновляются до их сигнальных эквивалентов.
2. Ссылки в приложении на мигрированные запросы обновляются для вызова сигнала.
   - Это включает ссылки в шаблонах, host bindings и TypeScript-коде.

**До**

```angular-ts
import {Component, ContentChild} from '@angular/core';

@Component({
  template: `Has ref: {{ someRef ? 'Yes' : 'No' }}`,
})
export class MyComponent {
  @ContentChild('someRef') ref: ElementRef | undefined = undefined;

  someMethod(): void {
    if (this.ref) {
      this.ref.nativeElement;
    }
  }
}
```

**После**

```angular-ts
import {Component, contentChild} from '@angular/core';

@Component({
  template: `Has ref: {{ someRef() ? 'Yes' : 'No' }}`,
})
export class MyComponent {
  readonly ref = contentChild<ElementRef>('someRef');

  someMethod(): void {
    const ref = this.ref();
    if (ref) {
      ref.nativeElement;
    }
  }
}
```

## Параметры конфигурации {#configuration-options}

Миграция поддерживает несколько параметров для тонкой настройки под ваши конкретные нужды.

### `--path`

По умолчанию миграция обновляет всё рабочее пространство Angular CLI.
Используйте этот параметр, чтобы ограничить миграцию конкретной поддиректорией.

### `--best-effort-mode`

По умолчанию миграция пропускает запросы, которые не могут быть безопасно мигрированы.
Миграция стремится рефакторить код максимально безопасно.

Когда флаг `--best-effort-mode` включён, миграция агрессивно пытается мигрировать как можно больше, даже если это может нарушить сборку.

### `--insert-todos`

Когда этот параметр включён, миграция добавляет TODO-комментарии к запросам, которые не удалось мигрировать.
В комментариях будет указана причина пропуска. Например:

```ts
// TODO: Skipped for migration because:
//  Your application code writes to the query. This prevents migration.
@ViewChild('ref') ref?: ElementRef;
```

### `--analysis-dir`

В крупных проектах этот параметр позволяет сократить количество анализируемых файлов.
По умолчанию миграция анализирует всё рабочее пространство, независимо от параметра `--path`, чтобы обновить все ссылки, затронутые миграцией объявления запроса.

С помощью этого параметра можно ограничить анализ подпапкой. Обратите внимание, что в таком случае любые ссылки за пределами этой директории будут молча пропущены, что может привести к ошибкам сборки.

## Расширение VSCode {#vscode-extension}

![Снимок экрана расширения VSCode при нажатии на поле `@ViewChild`](assets/images/migrations/signal-queries-vscode.png 'Снимок экрана расширения VSCode при нажатии на поле `@ViewChild`.')

Миграция доступна как [действие рефакторинга кода](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) в VSCode.

Чтобы использовать миграцию через VSCode, установите последнюю версию расширения VSCode и нажмите:

- на поле с `@ViewChild`, `@ViewChildren`, `@ContentChild` или `@ContentChildren`.
- или на директиву/компонент

Затем дождитесь появления жёлтой кнопки рефакторинга VSCode с лампочкой.
С помощью этой кнопки можно выбрать миграцию signal queries.
