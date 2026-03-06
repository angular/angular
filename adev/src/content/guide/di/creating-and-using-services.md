# Создание и использование сервисов {#creating-and-using-services}

Сервисы — это переиспользуемые фрагменты кода, которые могут использоваться во всём вашем Angular-приложении. Обычно они
отвечают за получение данных, бизнес-логику или другую функциональность, к которой необходим доступ из нескольких
компонентов.

## Создание сервиса {#creating-a-service}

Вы можете создать сервис с помощью [Angular CLI](tools/cli), используя следующую команду:

```bash
ng generate service CUSTOM_NAME
```

Это создаст отдельный файл `CUSTOM_NAME.ts` в вашей директории `src`.

Вы также можете создать сервис вручную, добавив декоратор `@Injectable()` к классу TypeScript. Это сообщает Angular, что
сервис может быть внедрён как зависимость.

Вот пример сервиса, который позволяет пользователям добавлять и запрашивать данные:

```ts
// 📄 src/app/basic-data-store.ts
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
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

Когда вы используете `@Injectable({ providedIn: 'root' })` в своём сервисе, Angular:

- **Создаёт единственный экземпляр** (синглтон) для всего вашего приложения
- **Делает его доступным везде** без какой-либо дополнительной настройки
- **Включает Tree Shaking**, чтобы сервис попадал в ваш JavaScript-бандл только в том случае, если он действительно
  используется

Это рекомендуемый подход для большинства сервисов.

## Внедрение сервиса {#injecting-a-service}

После создания сервиса с `providedIn: 'root'`, вы можете внедрить его в любом месте вашего приложения, используя функцию
`inject()` из `@angular/core`.

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
import {inject, Injectable} from '@angular/core';
import {AdvancedDataStore} from './advanced-data-store';

@Injectable({
  providedIn: 'root',
})
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

Хотя `providedIn: 'root'` покрывает большинство случаев использования, Angular предлагает дополнительные способы
предоставления сервисов для специализированных сценариев:

- **Экземпляры, специфичные для компонентов** — когда компонентам нужны собственные изолированные экземпляры сервисов
- **Ручная настройка** — для сервисов, требующих настройки во время выполнения
- **Factory-провайдеры** — для динамического создания сервисов на основе условий времени выполнения
- **Value-провайдеры** — для предоставления объектов конфигурации или констант

Вы можете узнать больше об этих продвинутых паттернах в следующем
руководстве: [определение провайдеров зависимостей](/guide/di/defining-dependency-providers).
