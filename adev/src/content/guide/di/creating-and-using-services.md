# Создание и использование сервисов

Сервисы — переиспользуемые фрагменты кода, которыми можно делиться в приложении Angular. Обычно их применяют для загрузки данных, бизнес-логики или другой функциональности, к которой нужен доступ из нескольких компонентов.

## Создание сервиса {#creating-a-service}

Сервис можно создать с помощью [Angular CLI](tools/cli) командой:

```bash
ng generate service CUSTOM_NAME
```

Команда создаёт отдельный файл `CUSTOM_NAME.ts` в каталоге `src`.

Сервис также можно создать вручную, добавив декоратор `@Service()` к классу TypeScript. Так Angular узнаёт, что класс можно использовать как внедряемую зависимость.

В следующем примере определён сервис, позволяющий добавлять и получать данные:

```ts {header: "src/app/basic-data-store.ts"}
import {Service} from '@angular/core';

@Service()
export class BasicDataStore {
  private data: string[] = [];

  addData(item: string): void {
    this.data.push(item);
  }

  getData(): string[] {
    return [...this.data];
  }
}
```

## Как сервисы становятся доступными {#how-services-become-available}

По умолчанию сервисы регистрируются на уровне root. При глобальном предоставлении Angular гарантирует три основных преимущества:

- **Экземпляр-синглтон:** создаётся один общий экземпляр на всё приложение.
- **Глобальная доступность:** сервис доступен везде без ручной регистрации провайдера.
- **Tree-shakability:** сервис исключается из финального production-бандла, если код его явно не использует.

### Декораторы `@Service` и `@Injectable` {#using-the-service-vs-injectable-decorator}

Декоратор `@Service` — современный удобный сокращённый вариант традиционного синтаксиса `@Injectable({ providedIn: 'root' })`.

Краткая справка, какой декоратор выбрать:

| Возможность / требование                     | `@Service` | `@Injectable`                           |
| --------------------------------------------- | ---------- | --------------------------------------- |
| **Поддержка функции `inject()`**              | Да         | Да                                      |
| **DI через конструктор**                      | ❌ Нет     | Да                                      |
| **Неявный root-синглтон**                     | Да         | ❌ Нет (нужен `{providedIn: 'root'}`)   |
| **Расширенные ключи провайдера (`useClass` и др.)** | ❌ Нет | Да                                      |
| **Пользовательские фабрики инициализации**    | Да         | Да                                      |
| **Области вне root (`platform` и др.)**       | ❌ Нет     | Да                                      |

### Замена реализации через фабрику {#replacing-the-implementation-with-a-factory}

Если нужно контролировать создание синглтона — например, подставлять другую реализацию в зависимости от окружения — передайте функцию `factory`.

Фабрика выполняется в [контексте внедрения](guide/di/dependency-injection-context), поэтому внутри неё можно вызывать [`inject()`](api/core/inject) для чтения других зависимостей.

Следующий сервис `Analytics` локально — no-op, чтобы события не засоряли консоль при разработке. В production фабрика читает токен `ANALYTICS_ENABLED` и возвращает подкласс `GoogleAnalytics`, который отправляет события в реальный трекер:

```ts {header: "src/app/analytics.ts"}
import {inject, InjectionToken, Service} from '@angular/core';
import {ANALYTICS_ENABLED} from './token';

@Service({
  factory: () => (inject(ANALYTICS_ENABLED) ? new GoogleAnalytics() : new Analytics()),
})
export class Analytics {
  track(event: string, payload?: Record<string, unknown>) {
    // No-op by default.
  }
}

class GoogleAnalytics extends Analytics {
  override track(event: string, payload?: Record<string, unknown>) {
    // Dispatches an analytics event to Google Analytics
  }
}
```

NOTE: Опция `factory` заменяет опции `useClass`, `useValue`, `useExisting` и `useFactory` у `@Injectable`. Если они нужны — продолжайте использовать `@Injectable`.

### Отказ от автоматической регистрации {#opting-out-of-automatic-provisioning}

По умолчанию `@Service` регистрирует класс в root-инжекторе. Чтобы регистрировать вручную — например, ограничить область маршрутом или компонентом — задайте `autoProvided: false`:

```ts {header: "src/app/analytics-logger.ts"}
import {Service} from '@angular/core';

@Service({autoProvided: false})
export class AnalyticsLogger {
  trackEvent(name: string) {
    console.log('event:', name);
  }
}
```

Тогда сервис нужно добавить в массив `providers` самостоятельно, как и с обычным `@Injectable()`:

### Когда выбирать `@Service` или `@Injectable` {#when-to-use-service-vs-injectable}

Выбирайте `@Service`, когда создаёте новый синглтон-класс с зависимостями через `inject()`. Оставляйте `@Injectable`, если нужно любое из следующего:

- **Внедрение зависимостей через конструктор.** `@Service` поддерживает только функцию [`inject()`](api/core/inject).
- **Расширенная конфигурация провайдера** — `useClass`, `useValue`, `useExisting` или `useFactory`. У `@Service` вместо этого одна опция `factory`.
- **Области вне root**, например `providedIn: 'platform'`.

## Внедрение сервиса {#injecting-a-service}

После создания сервиса с `providedIn: 'root'` его можно внедрять в любом месте приложения функцией `inject()` из `@angular/core`.

### Внедрение в компонент {#injecting-into-a-component}

```angular-ts
import {Component, inject} from '@angular/core';
import {BasicDataStore} from './basic-data-store';

@Component({
  selector: 'app-example',
  template: `
    <div>
      <p>{{ dataStore.getData() }}</p>
      <button (click)="dataStore.addData('More data')">Add more data</button>
    </div>
  `,
})
export class Example {
  dataStore = inject(BasicDataStore);
}
```

### Внедрение в другой сервис {#injecting-into-another-service}

```ts
import {inject, Service} from '@angular/core';
import {AdvancedDataStore} from './advanced-data-store';

@Service()
export class BasicDataStore {
  private advancedDataStore = inject(AdvancedDataStore);
  private data: string[] = [];

  addData(item: string): void {
    this.data.push(item);
  }

  getData(): string[] {
    return [...this.data, ...this.advancedDataStore.getData()];
  }
}
```

## Следующие шаги {#next-steps}

Хотя `providedIn: 'root'` покрывает большинство сценариев, Angular также предлагает дополнительные способы настройки сервисов для более специальных случаев:

- **Экземпляры на уровне компонента** — когда компонентам нужны изолированные экземпляры сервиса
- **Ручная конфигурация** — для сервисов, требующих настройки во время выполнения
- **Фабричные провайдеры** — для динамического создания сервисов по условиям runtime
- **Value-провайдеры** — для объектов конфигурации или констант

Подробнее об этих продвинутых паттернах — в следующем руководстве: [определение провайдеров зависимостей](/guide/di/defining-dependency-providers).
