# Миграция на signal inputs {#migration-to-signal-inputs}

В Angular был представлен улучшенный API для inputs, который считается готовым к использованию в продакшене начиная с v19.
Подробнее о signal inputs и их преимуществах читайте в [специальном руководстве](guide/components/inputs).

Для поддержки существующих команд, желающих использовать signal inputs, команда Angular предоставляет автоматизированную миграцию, которая преобразует поля `@Input` в новый API `input()`.

Запустите схематик с помощью следующей команды:

```bash
ng generate @angular/core:signal-input-migration
```

Кроме того, миграция доступна как [действие рефакторинга кода](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) в VSCode.
Установите последнюю версию расширения VSCode и нажмите на поле с `@Input`.
Подробнее см. в разделе [ниже](#vscode-extension).

## Что изменяет миграция?

1. Члены класса с `@Input()` обновляются до их сигнального эквивалента с `input()`.
2. Ссылки на мигрированные inputs в приложении обновляются для вызова сигнала.
   - Это включает ссылки в шаблонах, host bindings и TypeScript-коде.

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

## Параметры конфигурации

Миграция поддерживает несколько параметров для тонкой настройки под ваши конкретные нужды.

### `--path`

По умолчанию миграция обновляет всё рабочее пространство Angular CLI.
Используйте этот параметр, чтобы ограничить миграцию конкретной поддиректорией.

### `--best-effort-mode`

По умолчанию миграция пропускает inputs, которые не могут быть безопасно мигрированы.
Миграция стремится рефакторить код максимально безопасно.

Когда флаг `--best-effort-mode` включён, миграция агрессивно пытается мигрировать как можно больше, даже если это может нарушить сборку.

### `--insert-todos`

Когда этот параметр включён, миграция добавляет TODO-комментарии к inputs, которые не удалось мигрировать.
В комментариях будет указана причина пропуска. Например:

```ts
// TODO: Skipped for migration because:
//  Your application code writes to the input. This prevents migration.
@Input() myInput = false;
```

### `--analysis-dir`

В крупных проектах этот параметр позволяет сократить количество анализируемых файлов.
По умолчанию миграция анализирует всё рабочее пространство, независимо от параметра `--path`, чтобы обновить все ссылки, затронутые миграцией `@Input()`.

С помощью этого параметра можно ограничить анализ подпапкой. Обратите внимание, что в таком случае любые ссылки за пределами этой директории будут молча пропущены, что может привести к ошибкам сборки.

## Расширение VSCode {#vscode-extension}

![Снимок экрана расширения VSCode при нажатии на поле `@Input`](assets/images/migrations/signal-inputs-vscode.png 'Снимок экрана расширения VSCode при нажатии на поле `@Input`.')

Миграция доступна как [действие рефакторинга кода](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) в VSCode.

Чтобы использовать миграцию через VSCode, установите последнюю версию расширения VSCode и нажмите:

- на поле с `@Input`.
- или на директиву/компонент

Затем дождитесь появления жёлтой кнопки рефакторинга VSCode с лампочкой.
С помощью этой кнопки можно выбрать миграцию signal inputs.
