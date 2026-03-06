# Создание внедряемого сервиса {#creating-an-injectable-service}

Сервис — это широкая категория, охватывающая любое значение, функцию или возможность, которая нужна приложению.
Как правило, сервис — это класс с чётко определённой и узкой областью ответственности.
Компонент — это один из видов классов, который может использовать внедрение зависимостей.

Angular разграничивает компоненты и сервисы, чтобы повысить модульность и возможность повторного использования.
Отделяя функциональность, связанную с представлением, от другой логики обработки, вы делаете классы компонентов лаконичными и эффективными.

В идеале задача компонента — обеспечить взаимодействие с пользователем и ничего более.
Компонент должен предоставлять свойства и методы для привязки данных, служа посредником между представлением (отображаемым шаблоном) и логикой приложения (которая часто включает некоторую модель данных).

Компонент может делегировать отдельные задачи сервисам, например получение данных с сервера, проверку пользовательского ввода или запись в консоль.
Определяя подобные задачи в внедряемом классе сервиса, вы делаете их доступными для любого компонента.
Кроме того, вы можете сделать приложение более гибким, настраивая различных провайдеров одного и того же типа сервиса в зависимости от обстоятельств.

Angular не принуждает вас следовать этим принципам.
Angular помогает их соблюдать, упрощая вынесение логики приложения в сервисы и их доступность для компонентов через внедрение зависимостей.

## Примеры сервисов {#service-examples}

Вот пример класса сервиса, который выполняет запись в консоль браузера:

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
Например, вот `HeroService`, который зависит от сервиса `Logger` и использует `BackendService` для получения героев.
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

## Создание внедряемого сервиса с помощью CLI {#creating-an-injectable-service-with-the-cli}

Angular CLI предоставляет команду для создания нового сервиса. В следующем примере вы добавляете новый сервис в существующее приложение.

Чтобы сгенерировать новый класс `HeroService` в папке `src/app/heroes`, выполните следующие шаги:

1. Запустите команду [Angular CLI](/tools/cli):

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

Декоратор `@Injectable()` указывает, что Angular может использовать этот класс в системе внедрения зависимостей.
Метаданные `providedIn: 'root'` означают, что `HeroService` доступен во всём приложении.

Добавьте метод `getHeroes()`, который возвращает героев из `mock.heroes.ts` для получения тестовых данных:

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

## Внедрение сервисов {#injecting-services}

Чтобы внедрить сервис как зависимость в компонент, можно объявить поле класса, представляющее зависимость, и использовать функцию Angular [`inject`](/api/core/inject) для его инициализации.

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

Метод [`inject`](/api/core/inject) можно использовать как в классах, так и в функциях, тогда как метод конструктора, естественно, применим только в конструкторе класса. Однако в обоих случаях зависимость может быть внедрена только в допустимом [контексте внедрения](guide/di/dependency-injection-context) — обычно при создании или инициализации компонента.

## Внедрение сервисов в другие сервисы {#injecting-services-in-other-services}

Когда сервис зависит от другого сервиса, используйте тот же шаблон, что и при внедрении в компонент.
В следующем примере `HeroService` зависит от сервиса `Logger` для записи информации о своей работе:

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

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/di/defining-dependency-providers" title="Настройка провайдеров зависимостей"/>
  <docs-pill href="guide/di/defining-dependency-providers#automatic-provision-for-non-class-dependencies" title="`InjectionTokens`"/>
</docs-pill-row>
