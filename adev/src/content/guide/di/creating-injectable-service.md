# Создание Injectable-сервиса {#creating-an-injectable-service}

Сервис — это широкая категория, охватывающая любое значение, функцию или возможность, необходимую приложению.
Сервис — это, как правило, класс с чётко определённой и узкой целью.
Компонент — один из типов классов, который может использовать DI.

Angular разделяет компоненты и сервисы, чтобы повысить модульность и возможность повторного использования.
Отделяя функциональность, связанную с представлением (view), от другой логики обработки, вы делаете классы компонентов компактными и эффективными.

В идеале задача компонента — обеспечивать пользовательский опыт и ничего более.
Компонент должен предоставлять свойства и методы для привязки данных, выступая посредником между представлением (которое рендерит шаблон) и логикой приложения (которая часто включает некоторую модель).

Компонент может делегировать определённые задачи сервисам: например, получение данных с сервера, валидацию пользовательского ввода или логирование в консоль.
Определив такие задачи обработки в injectable-классе сервиса, вы делаете их доступными для любого компонента.
Также можно сделать приложение более гибким, настроив различных провайдеров одного и того же типа сервиса в зависимости от обстоятельств.

Angular не навязывает эти принципы принудительно.
Angular помогает им следовать, упрощая разбиение логики приложения на сервисы и предоставление этих сервисов компонентам через DI.

## Примеры сервисов {#service-examples}

Вот пример класса сервиса, который выполняет логирование в консоль браузера:

```ts {header: "logger.service.ts (class)"}
export class Logger {
  log(msg: unknown) {
    console.log(msg);
  }
  error(msg: unknown) {
    console.error(msg);
  }
  warn(msg: unknown) {
    console.warn(msg);
  }
}
```

Сервисы могут зависеть от других сервисов.
Например, вот `HeroService`, который зависит от сервиса `Logger` и также использует `BackendService` для получения героев.
В свою очередь, `BackendService` может зависеть от сервиса `HttpClient` для асинхронного получения героев с сервера:

```ts {header: "hero.service.ts", highlight="[7,8,12,13]"}
import {inject} from '@angular/core';

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
```

## Создание injectable-сервиса с помощью CLI {#creating-an-injectable-service-with-the-cli}

Angular CLI предоставляет команду для создания нового сервиса. В следующем примере вы добавляете новый сервис в существующее приложение.

Чтобы сгенерировать новый класс `HeroService` в папке `src/app/heroes`, выполните следующие шаги:

1. Выполните эту команду [Angular CLI](/tools/cli):

```sh
ng generate service heroes/hero
```

Эта команда создаёт следующий `HeroService` по умолчанию:

```ts {header: 'heroes/hero.service.ts (CLI-generated)'}
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeroService {}
```

Декоратор `@Injectable()` указывает, что Angular может использовать этот класс в системе DI.
Метаданные `providedIn: 'root'` означают, что `HeroService` доступен во всём приложении.

Добавьте метод `getHeroes()`, возвращающий героев из `mock.heroes.ts`, чтобы получить mock-данные героев:

```ts {header: 'hero.service.ts'}
import {Injectable} from '@angular/core';
import {HEROES} from './mock-heroes';

@Injectable({
  // объявляет, что этот сервис должен быть создан
  // корневым инжектором приложения.
  providedIn: 'root',
})
export class HeroService {
  getHeroes() {
    return HEROES;
  }
}
```

Для ясности и удобства сопровождения рекомендуется определять компоненты и сервисы в отдельных файлах.

## Внедрение сервисов {#injecting-services}

Чтобы внедрить сервис как зависимость в компонент, можно объявить поле класса, представляющее зависимость, и инициализировать его с помощью функции [`inject`](/api/core/inject) Angular.

В следующем примере `HeroService` указывается в `HeroList`.
Тип `heroService` — `HeroService`.

```ts
import {inject} from '@angular/core';

export class HeroList {
  private heroService = inject(HeroService);
}
```

Также можно внедрить сервис в компонент через конструктор компонента:

```ts {header: 'hero-list.ts (constructor signature)'}
  constructor(private heroService: HeroService)
```

Метод [`inject`](/api/core/inject) можно использовать как в классах, так и в функциях, тогда как метод через конструктор применим только в конструкторе класса. Однако в обоих случаях зависимость может быть внедрена только в допустимом [контексте внедрения](guide/di/dependency-injection-context), как правило, при создании или инициализации компонента.

## Внедрение сервисов в другие сервисы {#injecting-services-in-other-services}

Когда один сервис зависит от другого, используйте тот же паттерн, что и при внедрении в компонент.
В следующем примере `HeroService` зависит от сервиса `Logger` для отчётности о своей деятельности:

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

В этом примере метод `getHeroes()` использует сервис `Logger`, записывая сообщение в лог при получении героев.

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/di/defining-dependency-providers" title="Настройка провайдеров зависимостей"/>
  <docs-pill href="guide/di/defining-dependency-providers#automatic-provision-for-non-class-dependencies" title="`InjectionTokens`"/>
</docs-pill-row>
