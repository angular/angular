# Миграция на сигнальные запросы

В Angular представлены улучшенные API для запросов, которые считаются готовыми к использованию в продакшене начиная с
версии v19.
Подробнее о сигнальных запросах и их преимуществах читайте в [специальном руководстве](guide/signals/queries).

Чтобы поддержать команды, желающие использовать сигнальные запросы, команда Angular предоставляет автоматическую
миграцию, которая преобразует существующие поля с декораторами запросов в новый API.

Запустите схематик, используя следующую команду:

```bash
ng generate @angular/core:signal-queries-migration
```

Кроме того, миграция доступна
как [действие по рефакторингу кода](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) в
VSCode.
Установите последнюю версию расширения VSCode и нажмите, например, на поле `@ViewChild`.
Подробнее см. в разделе [ниже](#vscode-extension).

## Что меняет миграция?

1. Члены класса с `@ViewChild()`, `@ViewChildren`, `@ContentChild` и `@ContentChildren` обновляются до их сигнальных
   эквивалентов.
2. Ссылки на мигрированные запросы в вашем приложении обновляются для вызова сигнала.

- Это включает ссылки в шаблонах, привязках хоста (host bindings) или TypeScript-коде.

**До**

```angular-ts
import {Component, ContentChild} from '@angular/core';

@Component({
  template: `Has ref: {{someRef ? 'Yes' : 'No'}}`
})
export class MyComponent {
  @ContentChild('someRef') ref: ElementRef|undefined = undefined;

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
  template: `Has ref: {{someRef() ? 'Yes' : 'No'}}`
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

## Опции конфигурации

Миграция поддерживает несколько опций для тонкой настройки процесса под ваши конкретные нужды.

### `--path`

По умолчанию миграция обновляет всё рабочее пространство Angular CLI.
Вы можете ограничить миграцию конкретным подкаталогом, используя эту опцию.

### `--best-effort-mode`

По умолчанию миграция пропускает запросы, которые нельзя безопасно мигрировать.
Миграция пытается рефакторить код максимально безопасно.

Когда включен флаг `--best-effort-mode`, миграция активно пытается мигрировать как можно больше кода, даже если это
может сломать вашу сборку.

### `--insert-todos`

Если эта опция включена, миграция добавит комментарии `TODO` к запросам, которые не удалось мигрировать.
Эти `TODO` будут содержать причину, по которой запросы были пропущены. Например:

```ts
// TODO: Skipped for migration because:
//  Your application code writes to the query. This prevents migration.
// (TODO: Пропущено при миграции, так как:
//  Ваш код приложения записывает данные в запрос. Это препятствует миграции.)
@ViewChild('ref') ref?: ElementRef;
```

### `--analysis-dir`

В больших проектах вы можете использовать эту опцию, чтобы уменьшить количество анализируемых файлов.
По умолчанию миграция анализирует всё рабочее пространство, независимо от опции `--path`, чтобы обновить все ссылки,
затронутые миграцией объявления запроса.

С помощью этой опции можно ограничить анализ подпапкой. Обратите внимание: это означает, что любые ссылки за пределами
этой директории будут молча пропущены, что потенциально может сломать вашу сборку.

## Расширение VSCode {#vscode-extension}

![Скриншот расширения VSCode и клика по полю
`@ViewChild`](assets/images/migrations/signal-queries-vscode.png 'Скриншот расширения VSCode и клика по полю
`@ViewChild`.')

Миграция доступна
как [действие по рефакторингу кода](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) в
VSCode.

Чтобы воспользоваться миграцией через VSCode, установите последнюю версию расширения VSCode и нажмите либо:

- на поле `@ViewChild`, `@ViewChildren`, `@ContentChild` или `@ContentChildren`.
- на директиву или компонент.

Затем дождитесь появления желтой лампочки (кнопки рефакторинга VSCode).
Через эту кнопку вы сможете выбрать миграцию на сигнальные запросы.
