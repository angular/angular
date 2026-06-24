# Создание внедряемого сервиса

Сервис — это широкая категория, охватывающая любое значение, функцию или возможность, необходимую приложению.
Обычно сервис — это класс с узкой, четко определенной целью.
Компонент — это один из типов классов, которые могут использовать DI (Внедрение зависимостей).

Angular разделяет компоненты и сервисы для повышения модульности и возможности повторного использования.
Отделяя функции компонента, связанные с представлением, от других видов обработки, вы можете сделать классы компонентов
компактными и эффективными.

В идеале задача компонента — обеспечить взаимодействие с пользователем и ничего больше.
Компонент должен предоставлять свойства и методы для привязки данных (data binding), чтобы выступать посредником между
представлением (отрисованным шаблоном) и логикой приложения (которая часто включает понятие модели).

Компонент может делегировать определенные задачи сервисам, такие как получение данных с сервера, валидация
пользовательского ввода или логирование прямо в консоль.
Определяя такие задачи обработки в классе внедряемого сервиса, вы делаете их доступными для любого компонента.
Вы также можете сделать свое приложение более адаптируемым, настроив разные провайдеры для одного и того же вида
сервиса, в зависимости от обстоятельств.

Angular не навязывает эти принципы.
Angular помогает следовать этим принципам, позволяя легко выносить логику приложения в сервисы и предоставлять эти
сервисы компонентам через DI.

## Примеры сервисов

Вот пример класса сервиса, который пишет логи в консоль браузера:

<docs-code header="logger.service.ts (class)" language="typescript">
export class Logger {
  log(msg: unknown) { console.log(msg); }
  error(msg: unknown) { console.error(msg); }
  warn(msg: unknown) { console.warn(msg); }
}
</docs-code>

Сервисы могут зависеть от других сервисов.
Например, вот `HeroService`, который зависит от сервиса `Logger`, а также использует `BackendService` для получения
героев.
Этот сервис, в свою очередь, может зависеть от сервиса `HttpClient` для асинхронного получения героев с сервера:

<docs-code header="hero.service.ts" language="typescript"
           highlight="[7,8,12,13]">
import { inject } from "@angular/core";

export class HeroService {
private heroes: Hero[] = [];

private backend = inject(BackendService);
private logger = inject(Logger);

async getHeroes() {
// Fetch
this.heroes = await this.backend.getAll(Hero);
// Log
this.logger.log(`Fetched ${this.heroes.length} heroes.`);
return this.heroes;
}
}
</docs-code>

## Создание внедряемого сервиса с помощью CLI

Angular CLI предоставляет команду для создания нового сервиса. В следующем примере вы добавите новый сервис в
существующее приложение.

Чтобы сгенерировать новый класс `HeroService` в папке `src/app/heroes`, выполните следующие шаги:

1. Запустите эту команду [Angular CLI](/tools/cli):

<docs-code language="sh">
ng generate service heroes/hero
</docs-code>

Эта команда создает следующий `HeroService` по умолчанию:

```ts {header: 'heroes/hero.service.ts (CLI-generated)'}
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeroService {}
```

Декоратор `@Injectable()` указывает, что Angular может использовать этот класс в системе DI.
Метаданные `providedIn: 'root'` означают, что `HeroService` предоставляется во всем приложении.

Добавьте метод `getHeroes()`, который возвращает героев из `mock.heroes.ts`, чтобы получить мок-данные героев:

```ts {header: 'hero.service.ts'}
import {Injectable} from '@angular/core';
import {HEROES} from './mock-heroes';

@Injectable({
  // declares that this service should be created
  // by the root application injector.
  providedIn: 'root',
})
export class HeroService {
  getHeroes() {
    return HEROES;
  }
}
```

Для ясности и удобства поддержки рекомендуется определять компоненты и сервисы в отдельных файлах.

## Внедрение сервисов

Чтобы внедрить сервис как зависимость в компонент, вы можете объявить поле класса, представляющее зависимость, и использовать функцию Angular [`inject`](/api/core/inject) для его инициализации.

В следующем примере указывается `HeroService` в `HeroListComponent`.
Тип `heroService` — `HeroService`.

```ts
import {inject} from '@angular/core';

export class HeroListComponent {
  private heroService = inject(HeroService);
}
```

Также можно внедрить сервис в компонент, используя конструктор компонента:

```ts {header: 'hero-list.component.ts (constructor signature)'}
  constructor(private heroService: HeroService)
```

Метод [`inject`](/api/core/inject) можно использовать как в классах, так и в функциях, тогда как метод с конструктором, естественно, может использоваться только в конструкторе класса. Однако в любом случае зависимость может быть внедрена только в допустимом [контексте внедрения](guide/di/dependency-injection-context), обычно при конструировании или инициализации компонента.

## Внедрение сервисов в другие сервисы

Когда сервис зависит от другого сервиса, следуйте тому же паттерну, что и при внедрении в компонент.
В следующем примере `HeroService` зависит от сервиса `Logger` для отчета о своих действиях:

```ts {header: 'hero.service.ts, highlight: [[3],[9],[12]]}
import {inject, Injectable} from '@angular/core';
import {HEROES} from './mock-heroes';
import {Logger} from '../logger.service';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private logger = inject(Logger);

  getHeroes() {
    this.logger.log('Getting heroes.');
    return HEROES;
  }
}
```

В этом примере метод `getHeroes()` использует сервис `Logger`, записывая сообщение при получении героев.

## Что дальше

<docs-pill-row>
  <docs-pill href="/guide/di/dependency-injection-providers" title="Настройка провайдеров зависимостей"/>
  <docs-pill href="/guide/di/dependency-injection-providers#using-an-injectiontoken-object" title="`InjectionTokens`"/>
</docs-pill-row>
