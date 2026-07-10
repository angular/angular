# Создание внедряемого сервиса

Сервис — широкая категория: любое значение, функция или возможность, нужная приложению.
Обычно сервис — это класс с узкой и чётко определённой целью.
Компонент — один из типов классов, которые можно использовать с внедрением зависимостей (DI).

Angular разделяет компоненты и сервисы, чтобы повысить модульность и переиспользуемость.
Отделяя связанную с представлением логику компонента от других видов обработки, вы сохраняете классы компонентов компактными и эффективными.

В идеале ответственность компонента — только пользовательский опыт.
Компонент должен предоставлять свойства и методы для привязки данных, опосредуя представление (рендер шаблона) и логику приложения (часто включая модель).

Задачи можно делегировать из компонента сервисам: загрузка данных с сервера, валидация ввода, логирование в консоль.
Определив такие задачи в внедряемом классе сервиса, вы делаете эти возможности доступными любому компоненту.
Приложение также становится гибче: для одного типа сервиса можно настроить разные провайдеры в зависимости от обстоятельств.

Angular не навязывает эти принципы жёстко.
Он помогает им следовать, упрощая организацию логики в сервисы и предоставление этих сервисов компонентам через DI.

## Примеры сервисов {#service-examples}

Пример класса сервиса, который пишет в консоль браузера:

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
Например, `HeroService` зависит от `Logger` и использует `BackendService` для получения героев.
Тот, в свою очередь, может зависеть от `HttpClient`, чтобы асинхронно загружать героев с сервера:

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

## Создание внедряемого сервиса через CLI {#creating-an-injectable-service-with-the-cli}

Angular CLI предоставляет команду для создания нового сервиса. В следующем примере вы добавляете сервис в существующее приложение.

Чтобы сгенерировать класс `HeroService` в папке `src/app/heroes`, выполните шаги:

1. Запустите эту команду [Angular CLI](/tools/cli):

```sh
ng generate service heroes/hero
```

Команда создаёт следующий `HeroService` по умолчанию:

```ts {header: 'heroes/hero.service.ts (CLI-generated)'}
import {Service} from '@angular/core';

@Service()
export class HeroService {}
```

Декоратор `@Service()` указывает, что Angular может использовать этот класс в системе DI и что `HeroService` доступен во всём приложении.

Добавьте метод `getHeroes()`, возвращающий героев из `mock.heroes.ts`:

```ts {header: 'hero.service.ts'}
import {Service} from '@angular/core';
import {HEROES} from './mock-heroes';

@Service()
export class HeroService {
  getHeroes() {
    return HEROES;
  }
}
```

Для ясности и сопровождаемости рекомендуется определять компоненты и сервисы в отдельных файлах.

## Внедрение сервисов {#injecting-services}

Чтобы внедрить сервис в компонент, объявите поле класса для зависимости и инициализируйте его функцией Angular [`inject`](/api/core/inject).

В следующем примере `HeroService` указан в `HeroList`.
Тип `heroService` — `HeroService`.

```ts
import {inject} from '@angular/core';

export class HeroList {
  private heroService = inject(HeroService);
}
```

Сервис также можно внедрить через конструктор компонента:

```ts {header: 'hero-list.ts (constructor signature)'}
  constructor(private heroService: HeroService)
```

Метод [`inject`](/api/core/inject) можно использовать и в классах, и в функциях, а конструктор — только в конструкторе класса. В обоих случаях зависимость можно внедрять только в допустимом [контексте внедрения](guide/di/dependency-injection-context), обычно при создании или инициализации компонента.

## Внедрение сервисов в другие сервисы {#injecting-services-in-other-services}

Когда сервис зависит от другого сервиса, используйте тот же паттерн, что и при внедрении в компонент.
В следующем примере `HeroService` зависит от `Logger`, чтобы сообщать о своих действиях:

```ts {header: 'hero.service.ts, highlight: [[3],[9],[12]]}
import {inject, Service} from '@angular/core';
import {HEROES} from './mock-heroes';
import {Logger} from '../logger.service';

@Service()
export class HeroService {
  private logger = inject(Logger);

  getHeroes() {
    this.logger.log('Getting heroes.');
    return HEROES;
  }
}
```

В этом примере метод `getHeroes()` использует сервис `Logger`, логируя сообщение при получении героев.

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/di/defining-dependency-providers" title="Configuring dependency providers"/>
  <docs-pill href="guide/di/defining-dependency-providers#automatic-provision-for-non-class-dependencies" title="`InjectionTokens`"/>
</docs-pill-row>
