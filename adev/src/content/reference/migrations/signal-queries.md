# Миграция к Сигнал-queries {#migration-to-signal-queries}

Angular представил улучшенные API для queries, которые считаются
готовыми к продакшену начиная с версии v19.
Подробнее о сигнал-queries и их преимуществах читайте в [специальном руководстве](guide/components/queries).

Для поддержки существующих команд, желающих использовать сигнал-queries, команда Angular
предоставляет автоматизированную миграцию, которая конвертирует существующие поля декораторов queries в новый API.

Запустите схему с помощью следующей команды:

```bash
ng generate @angular/core:signal-queries-migration
```

Кроме того, миграция доступна как [действие рефакторинга кода](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) в VSCode.
Установите последнюю версию расширения VSCode и нажмите, например, на поле `@ViewChild`.
Подробнее см. в разделе [ниже](#vscode-extension).

## Что изменяет миграция? {#what-does-the-migration-change}

1. Члены класса `@ViewChild()`, `@ViewChildren`, `@ContentChild` и `@ContentChildren`
   обновляются до их Сигнал-эквивалентов.
2. Ссылки в приложении на мигрированные queries обновляются для вызова сигнала.
   - Это включает ссылки в шаблонах, host-привязках или коде TypeScript.

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

### `--path` {#path}

По умолчанию миграция обновит всё рабочее пространство Angular CLI.
Вы можете ограничить миграцию конкретным подкаталогом с помощью этого параметра.

### `--best-effort-mode` {#best-effort-mode}

По умолчанию миграция пропускает queries, которые нельзя безопасно мигрировать.
Миграция старается рефакторить код максимально безопасно.

Когда флаг `--best-effort-mode` включён, миграция энергично
старается мигрировать как можно больше, даже если это может нарушить сборку.

### `--insert-todos` {#insert-todos}

При включении миграция добавит TODO к queries, которые не удалось мигрировать.
TODO будут включать объяснение того, почему queries были пропущены. Например:

```ts
// TODO: Skipped for migration because:
//  Your application code writes to the query. This prevents migration.
@ViewChild('ref') ref?: ElementRef;
```

### `--analysis-dir` {#analysis-dir}

В крупных проектах вы можете использовать этот параметр для уменьшения количества анализируемых файлов.
По умолчанию миграция анализирует всё рабочее пространство, независимо от параметра `--path`,
чтобы обновить все ссылки, затронутые миграцией объявления query.

С этим параметром вы можете ограничить анализ подпапкой. Обратите внимание, что это означает, что любые
ссылки за пределами этого каталога молча пропускаются, что потенциально может нарушить сборку.

## Расширение VSCode {#vscode-extension}

![Скриншот расширения VSCode и нажатия на поле `@ViewChild`](assets/images/migrations/signal-queries-vscode.png 'Скриншот расширения VSCode и нажатия на поле `@ViewChild`.')

Миграция доступна как [действие рефакторинга кода](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) в VSCode.

Для использования миграции через VSCode установите последнюю версию расширения VSCode и нажмите:

- на поле `@ViewChild`, `@ViewChildren`, `@ContentChild` или `@ContentChildren`.
- или на директиву/компонент

Затем дождитесь появления жёлтой кнопки рефакторинга VSCode с лампочкой.
Через эту кнопку можно выбрать миграцию сигнал-queries.
