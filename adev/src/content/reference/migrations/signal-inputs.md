# Миграция к Сигнал-inputs {#migration-to-signal-inputs}

Angular представил улучшенный API для inputs, который считается
готовым к продакшену начиная с версии v19.
Подробнее о сигнал-inputs и их преимуществах читайте в [специальном руководстве](guide/components/inputs).

Для поддержки существующих команд, желающих использовать сигнал-inputs, команда Angular
предоставляет автоматизированную миграцию, которая конвертирует поля `@Input` в новый API `input()`.

Запустите схему с помощью следующей команды:

```bash
ng generate @angular/core:signal-input-migration
```

Кроме того, миграция доступна как [действие рефакторинга кода](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) в VSCode.
Установите последнюю версию расширения VSCode и нажмите на поле `@Input`.
Подробнее см. в разделе [ниже](#vscode-extension).

## Что изменяет миграция? {#what-does-the-migration-change}

1. Члены класса `@Input()` обновляются до их Сигнал-эквивалента `input()`.
2. Ссылки на мигрированные inputs обновляются для вызова сигнала.
   - Это включает ссылки в шаблонах, host-привязках или коде TypeScript.

**До**

```angular-ts
import {Component, Input} from '@angular/core';

@Component({
  template: `Name: {{ name ?? '' }}`,
})
export class MyComponent {
  @Input() name: string | undefined = undefined;

  someMethod(): number {
    if (this.name) {
      return this.name.length;
    }
    return -1;
  }
}
```

**После**

```angular-ts {[[4],[7], [10,12]]}
import {Component, input} from '@angular/core';

@Component({
  template: `Name: {{ name() ?? '' }}`,
})
export class MyComponent {
  readonly name = input<string>();

  someMethod(): number {
    const name = this.name();
    if (name) {
      return name.length;
    }
    return -1;
  }
}
```

## Параметры конфигурации {#configuration-options}

Миграция поддерживает несколько параметров для тонкой настройки под ваши конкретные нужды.

### `--path` {#path}

По умолчанию миграция обновит всё рабочее пространство Angular CLI.
Вы можете ограничить миграцию конкретным подкаталогом с помощью этого параметра.

### `--best-effort-mode` {#best-effort-mode}

По умолчанию миграция пропускает inputs, которые нельзя безопасно мигрировать.
Миграция старается рефакторить код максимально безопасно.

Когда флаг `--best-effort-mode` включён, миграция энергично
старается мигрировать как можно больше, даже если это может нарушить сборку.

### `--insert-todos` {#insert-todos}

При включении миграция добавит TODO к inputs, которые не удалось мигрировать.
TODO будут включать объяснение того, почему inputs были пропущены. Например:

```ts
// TODO: Skipped for migration because:
//  Your application code writes to the input. This prevents migration.
@Input() myInput = false;
```

### `--analysis-dir` {#analysis-dir}

В крупных проектах вы можете использовать этот параметр для уменьшения количества анализируемых файлов.
По умолчанию миграция анализирует всё рабочее пространство, независимо от параметра `--path`,
чтобы обновить все ссылки, затронутые миграцией `@Input()`.

С этим параметром вы можете ограничить анализ подпапкой. Обратите внимание, что это означает, что любые
ссылки за пределами этого каталога молча пропускаются, что потенциально может нарушить сборку.

## Расширение VSCode {#vscode-extension}

![Скриншот расширения VSCode и нажатия на поле `@Input`](assets/images/migrations/signal-inputs-vscode.png 'Скриншот расширения VSCode и нажатия на поле `@Input`.')

Миграция доступна как [действие рефакторинга кода](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) в VSCode.

Для использования миграции через VSCode установите последнюю версию расширения VSCode и нажмите:

- на поле `@Input`.
- или на директиву/компонент

Затем дождитесь появления жёлтой кнопки рефакторинга VSCode с лампочкой.
Через эту кнопку можно выбрать миграцию сигнал-inputs.
