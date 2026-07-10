# Расширенная конфигурация компонентов

TIP: Это руководство предполагает, что вы уже прочитали [Essentials Guide](essentials). Если вы новичок в Angular, начните с него.

## ChangeDetectionStrategy {#changedetectionstrategy}

Декоратор `@Component` принимает опцию `changeDetection`, которая управляет **режимом обнаружения изменений** компонента. Есть два режима.

**`ChangeDetectionStrategy.Eager`/`Default`** — опциональный режим. В нём Angular проверяет, нужно ли обновить DOM компонента, при любой активности в приложении. К такой активности относятся взаимодействие пользователя, сетевой ответ, таймеры и другое.

**`ChangeDetectionStrategy.OnPush`** — стратегия по умолчанию (начиная с v22). Этот режим уменьшает объём проверок, которые выполняет Angular. Фреймворк проверяет, нужно ли обновить DOM компонента, только когда:

- изменился input компонента в результате привязки в шаблоне, или
- сработал слушатель события в этом компоненте
- компонент явно помечен для проверки через `ChangeDetectorRef.markForCheck` или обёртку над ним, например `AsyncPipe`.

Кроме того, когда проверяется OnPush-компонент, Angular _также_ проверяет всех его предков, поднимаясь вверх по дереву приложения.

## PreserveWhitespaces {#preservewhitespaces}

По умолчанию Angular удаляет и схлопывает лишние пробелы в шаблонах — чаще всего из переводов строк и отступов. Это поведение можно изменить, явно задав `preserveWhitespaces` в `true` в метаданных компонента.

## Схемы кастомных элементов {#custom-element-schemas}

По умолчанию Angular выбрасывает ошибку при встрече неизвестного HTML-элемента. Это поведение можно отключить для компонента, включив `CUSTOM_ELEMENTS_SCHEMA` в свойство `schemas` метаданных компонента.

```angular-ts
import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

@Component({
  ...,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: '<some-unknown-component />'
})
export class ComponentWithCustomElements { }
```

На данный момент Angular не поддерживает другие схемы.
