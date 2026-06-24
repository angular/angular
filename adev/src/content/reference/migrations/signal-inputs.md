# Миграция на input-сигналы

Angular представил улучшенный API для input'ов, который считается готовым к использованию в продакшене начиная с версии 19.
Подробнее о input-сигналах и их преимуществах читайте в [специальном руководстве](guide/signals/inputs).

Чтобы поддержать существующие команды, желающие использовать input-сигналы, команда Angular предоставляет автоматическую
миграцию, которая преобразует поля `@Input` в новый API `input()`.

Запустите схематик, используя следующую команду:

```bash
ng generate @angular/core:signal-input-migration
```

В качестве альтернативы, миграция доступна
как [действие рефакторинга кода](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) в
VSCode.
Установите последнюю версию расширения VSCode и нажмите на поле `@Input`.
Подробнее см. в разделе [ниже](#vscode-extension).

## Что меняет миграция?

1. Члены класса `@Input()` обновляются до их эквивалента `input()` на основе сигналов.
2. Ссылки на мигрированные input'ы обновляются для вызова сигнала.

- Это включает ссылки в шаблонах, привязках хоста или TypeScript-коде.

**До**

```angular-ts
import {Component, Input} from '@angular/core';

@Component({
  template: `Name: {{name ?? ''}}`
})
export class MyComponent {
  @Input() name: string|undefined = undefined;

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
  template: `Name: {{name() ?? ''}}`
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

## Опции конфигурации

Миграция поддерживает несколько опций для точной настройки под ваши конкретные нужды.

### `--path`

По умолчанию миграция обновляет все рабочее пространство Angular CLI.
Вы можете ограничить миграцию конкретным подкаталогом, используя эту опцию.

### `--best-effort-mode`

По умолчанию миграция пропускает input'ы, которые нельзя безопасно мигрировать.
Миграция пытается выполнить рефакторинг кода максимально безопасно.

Когда включен флаг `--best-effort-mode`, миграция активно пытается мигрировать как можно больше, даже если это может
нарушить сборку.

### `--insert-todos`

Если включено, миграция добавит комментарии TODO к input'ам, которые не удалось мигрировать.
TODO будут содержать причину, по которой input'ы были пропущены. Например:

```ts
// TODO: Skipped for migration because:
//  Your application code writes to the input. This prevents migration.
@Input() myInput = false;
```

### `--analysis-dir`

В крупных проектах вы можете использовать эту опцию, чтобы сократить количество анализируемых файлов.
По умолчанию миграция анализирует все рабочее пространство, независимо от опции `--path`, чтобы обновить все ссылки,
затронутые миграцией `@Input()`.

С помощью этой опции можно ограничить анализ подпапкой. Обратите внимание, что это означает, что любые ссылки за
пределами этого каталога будут молча пропущены, что потенциально может нарушить сборку.

## Расширение VSCode {#vscode-extension}

![Скриншот расширения VSCode и клик по полю
`@Input`](assets/images/migrations/signal-inputs-vscode.png 'Скриншот расширения VSCode и клик по полю `@Input`.')

Миграция доступна
как [действие рефакторинга кода](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) в
VSCode.

Чтобы воспользоваться миграцией через VSCode, установите последнюю версию расширения VSCode и нажмите либо:

- на поле `@Input`.
- либо на директиву/компонент.

Затем дождитесь появления желтой лампочки (кнопки рефакторинга) VSCode.
Через эту кнопку вы сможете выбрать миграцию на input-сигналы.
