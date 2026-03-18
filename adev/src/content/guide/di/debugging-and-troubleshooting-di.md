# Отладка и устранение неполадок внедрения зависимостей {#debugging-and-troubleshooting-dependency-injection}

Проблемы с внедрением зависимостей (DI) обычно возникают из-за ошибок конфигурации, проблем с областью видимости или неправильных паттернов использования. Это руководство поможет выявить и решить распространённые проблемы DI, с которыми сталкиваются разработчики.

## Распространённые ошибки и решения {#common-pitfalls-and-solutions}

### Сервисы недоступны там, где ожидается {#services-not-available-where-expected}

Одна из наиболее распространённых проблем DI возникает, когда вы пытаетесь внедрить сервис, но Angular не может найти его в текущем инжекторе или каком-либо родительском инжекторе. Обычно это происходит, когда сервис предоставлен в неправильной области видимости или не предоставлен вовсе.

#### Несоответствие области видимости провайдера {#provider-scope-mismatch}

Когда вы предоставляете сервис в массиве `providers` компонента, Angular создаёт экземпляр в инжекторе этого компонента. Этот экземпляр доступен только этому компоненту и его потомкам. Родительские и дочерние компоненты-соседи не могут получить к нему доступ, поскольку используют другие инжекторы.

```angular-ts {header: 'child-view.ts'}
import {Component} from '@angular/core';
import {DataStore} from './data-store';

@Component({
  selector: 'app-child',
  template: '<p>Child</p>',
  providers: [DataStore], // Доступно только в этом компоненте и его потомках
})
export class ChildView {}
```

```angular-ts {header: 'parent-view.ts'}
import {Component, inject} from '@angular/core';
import {DataStore} from './data-store';

@Component({
  selector: 'app-parent',
  template: '<app-child />',
})
export class ParentView {
  private dataService = inject(DataStore); // ОШИБКА: Недоступно для родителя
}
```

Angular ищет только вверх по иерархии, никогда вниз. Родительские компоненты не могут получить доступ к сервисам, предоставленным в дочерних компонентах.

**Решение:** Предоставьте сервис на более высоком уровне (в приложении или родительском компоненте).

```ts {prefer}
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class DataStore {
  // Доступно везде
}
```

TIP: По умолчанию используйте `providedIn: 'root'` для сервисов, которым не нужно состояние, специфичное для компонента. Это делает сервисы доступными везде и включает tree-shaking.

#### Сервисы и ленивозагружаемые маршруты {#services-and-lazy-loaded-routes}

Когда вы предоставляете сервис в массиве `providers` ленивозагружаемого маршрута, Angular создаёт дочерний инжектор для этого маршрута. Этот инжектор и его сервисы становятся доступны только после загрузки маршрута. Компоненты в немедленно загружаемых частях приложения не могут получить доступ к этим сервисам, поскольку используют другие инжекторы, существующие до создания ленивозагружаемого инжектора.

```ts {header: 'feature.routes.ts'}
import {Routes} from '@angular/router';
import {FeatureClient} from './feature-client';

export const featureRoutes: Routes = [
  {
    path: 'feature',
    providers: [FeatureClient],
    loadComponent: () => import('./feature-view'),
  },
];
```

```angular-ts {header: 'eager-view.ts'}
import {Component, inject} from '@angular/core';
import {FeatureClient} from './feature-client';

@Component({
  selector: 'app-eager',
  template: '<p>Eager Component</p>',
})
export class EagerView {
  private featureService = inject(FeatureClient); // ОШИБКА: Ещё недоступно
}
```

Ленивозагружаемые маршруты создают дочерние инжекторы, которые становятся доступны только после загрузки маршрута.

NOTE: По умолчанию инжекторы маршрутов и их сервисы сохраняются даже после перехода от маршрута. Они не уничтожаются до закрытия приложения. Для автоматической очистки неиспользуемых инжекторов маршрутов см. [настройку поведения маршрута](guide/routing/customizing-route-behavior#experimental-automatic-cleanup-of-unused-route-injectors).

**Решение:** Используйте `providedIn: 'root'` для сервисов, которые должны быть общими через ленивые границы.

```ts {prefer, header: 'Предоставьте в root для общих сервисов'}
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class FeatureClient {
  // Доступно везде, включая до ленивой загрузки
}
```

Если сервис должен загружаться лениво, но оставаться доступным для немедленно загружаемых компонентов, внедряйте его только там, где нужно, и используйте необязательное внедрение для обработки доступности.

### Несколько экземпляров вместо синглтонов {#multiple-instances-instead-of-singletons}

Вы ожидаете один общий экземпляр (синглтон), но получаете отдельные экземпляры в разных компонентах.

#### Предоставление в компоненте вместо root {#providing-in-component-instead-of-root}

Когда вы добавляете сервис в массив `providers` компонента, Angular создаёт новый экземпляр этого сервиса для каждого экземпляра компонента. Каждый компонент получает собственный отдельный экземпляр сервиса, что означает, что изменения в одном компоненте не влияют на экземпляр сервиса в других компонентах. Это часто неожиданно, когда нужно общее состояние во всём приложении.

```angular-ts {avoid, header: 'Провайдер на уровне компонента создаёт несколько экземпляров'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>Profile</p>',
  providers: [UserClient], // Создаёт новый экземпляр для каждого компонента!
})
export class UserProfile {
  private userService = inject(UserClient);
}

@Component({
  selector: 'app-settings',
  template: '<p>Settings</p>',
  providers: [UserClient], // Другой экземпляр!
})
export class UserSettings {
  private userService = inject(UserClient);
}
```

Каждый компонент получает собственный экземпляр `UserClient`. Изменения в одном компоненте не влияют на другой.

**Решение:** Используйте `providedIn: 'root'` для синглтонов.

```ts {prefer, header: 'Синглтон на корневом уровне'}
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class UserClient {
  // Единственный экземпляр, общий для всех компонентов
}
```

#### Когда несколько экземпляров являются намеренными {#when-multiple-instances-are-intentional}

Иногда нужны отдельные экземпляры для каждого компонента для хранения состояния, специфичного для компонента.

```angular-ts {header: 'Намеренно: состояние, ограниченное компонентом'}
import {Injectable, signal} from '@angular/core';

@Injectable() // Нет providedIn — нужно явное предоставление
export class FormStateStore {
  private formData = signal({});

  setData(data: any) {
    this.formData.set(data);
  }

  getData() {
    return this.formData();
  }
}

@Component({
  selector: 'app-user-form',
  template: '<form>...</form>',
  providers: [FormStateStore], // Каждая форма получает собственное состояние
})
export class UserForm {
  private formState = inject(FormStateStore);
}
```

Этот паттерн полезен для:

- Управления состоянием формы (каждая форма имеет изолированное состояние)
- Кэширования, специфичного для компонента
- Временных данных, которые не должны быть общими

### Неправильное использование inject() {#incorrect-inject-usage}

Функция `inject()` работает только в определённых контекстах во время создания класса и выполнения фабрики.

#### Использование inject() в хуках жизненного цикла {#using-inject-in-lifecycle-hooks}

Когда вы вызываете функцию `inject()` внутри хуков жизненного цикла, таких как `ngOnInit()`, `ngAfterViewInit()` или `ngOnDestroy()`, Angular выбрасывает ошибку, поскольку эти методы выполняются вне контекста внедрения. Контекст внедрения доступен только во время синхронного выполнения создания класса, которое происходит до вызова хуков жизненного цикла.

```angular-ts {avoid, header: 'inject() в ngOnInit'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{userName}}</p>',
})
export class UserProfile {
  userName = '';

  ngOnInit() {
    const userService = inject(UserClient); // ОШИБКА: Не контекст внедрения
    this.userName = userService.getUser().name;
  }
}
```

**Решение:** Захватывайте зависимости и вычисляйте значения в инициализаторах полей.

```angular-ts {prefer, header: 'Вычисление значений в инициализаторах полей'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{userName}}</p>',
})
export class UserProfile {
  private userService = inject(UserClient);
  userName = this.userService.getUser().name;
}
```

#### Использование Injector для отложенного внедрения {#using-the-injector-for-deferred-injection}

Когда нужно получать сервисы вне контекста внедрения, используйте захваченный `Injector` напрямую через `injector.get()`:

```angular-ts
import {Component, inject, Injector} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<button (click)="delayedLoad()">Load Later</button>',
})
export class UserProfile {
  private injector = inject(Injector);

  delayedLoad() {
    setTimeout(() => {
      const userService = this.injector.get(UserClient);
      console.log(userService.getUser());
    }, 1000);
  }
}
```

#### Использование runInInjectionContext для колбэков {#using-runInInjectionContext-for-callbacks}

Используйте `runInInjectionContext()`, когда нужно разрешить **другому коду** вызывать `inject()`. Это полезно при принятии колбэков, которые могут использовать внедрение зависимостей:

```angular-ts
import {Component, inject, Injector, input} from '@angular/core';

@Component({
  selector: 'app-data-loader',
  template: '<button (click)="load()">Load</button>',
})
export class DataLoader {
  private injector = inject(Injector);
  onLoad = input<() => void>();

  load() {
    const callback = this.onLoad();
    if (callback) {
      // Позволяем колбэку использовать inject()
      this.injector.runInInjectionContext(callback);
    }
  }
}
```

Метод `runInInjectionContext()` создаёт временный контекст внедрения, позволяя коду внутри колбэка вызывать `inject()`.

IMPORTANT: По возможности всегда захватывайте зависимости на уровне класса. Используйте `injector.get()` для простого отложенного получения и `runInInjectionContext()` только когда внешнему коду нужно вызывать `inject()`.

TIP: Используйте `assertInInjectionContext()` для проверки того, что ваш код выполняется в допустимом контексте внедрения. Это полезно при создании повторно используемых функций, вызывающих `inject()`. Подробнее см. в разделе [Проверка контекста](guide/di/dependency-injection-context#asserts-the-context).

### Путаница с providers и viewProviders {#providers-vs-viewproviders-confusion}

Разница между `providers` и `viewProviders` влияет на сценарии проекции контента.

#### Понимание разницы {#understanding-the-difference}

**providers:** Доступны в шаблоне компонента И любому контенту, проецированному в компонент (ng-content).

**viewProviders:** Доступны только в шаблоне компонента, НЕ проецируемому контенту.

```angular-ts {header: 'parent-view.ts'}
import {Component, inject} from '@angular/core';
import {ThemeStore} from './theme-store';

@Component({
  selector: 'app-parent',
  template: `
    <div>
      <p>Theme: {{ themeService.theme() }}</p>
      <ng-content />
    </div>
  `,
  providers: [ThemeStore], // Доступно дочернему контенту
})
export class ParentView {
  protected themeService = inject(ThemeStore);
}

@Component({
  selector: 'app-parent-view',
  template: `
    <div>
      <p>Theme: {{ themeService.theme() }}</p>
      <ng-content />
    </div>
  `,
  viewProviders: [ThemeStore], // НЕ доступно дочернему контенту
})
export class ParentViewOnly {
  protected themeService = inject(ThemeStore);
}
```

```angular-ts {header: 'child-view.ts'}
import {Component, inject} from '@angular/core';
import {ThemeStore} from './theme-store';

@Component({
  selector: 'app-child',
  template: '<p>Child theme: {{theme()}}</p>',
})
export class ChildView {
  private themeService = inject(ThemeStore, {optional: true});
  theme = () => this.themeService?.theme() ?? 'none';
}
```

```angular-ts {header: 'app.ts'}
@Component({
  selector: 'app-root',
  template: `
    <app-parent>
      <app-child />
      <!-- Может получить доступ к ThemeStore -->
    </app-parent>

    <app-parent-view>
      <app-child />
      <!-- Не может получить доступ к ThemeStore -->
    </app-parent-view>
  `,
})
export class App {}
```

**При проекции в `app-parent`:** Дочерний компонент может внедрить `ThemeStore`, потому что `providers` делает его доступным для проецируемого контента.

**При проекции в `app-parent-view`:** Дочерний компонент не может внедрить `ThemeStore`, потому что `viewProviders` ограничивает его только шаблоном родителя.

#### Выбор между providers и viewProviders {#choosing-between-providers-and-viewproviders}

Используйте `providers`, когда:

- Сервис должен быть доступен проецируемому контенту
- Вы хотите, чтобы дочерние элементы контента имели доступ к сервису
- Вы предоставляете сервисы общего назначения

Используйте `viewProviders`, когда:

- Сервис должен быть доступен только в шаблоне вашего компонента
- Вы хотите скрыть детали реализации от проецируемого контента
- Вы предоставляете внутренние сервисы, которые не должны выходить наружу

**Рекомендация по умолчанию:** Используйте `providers`, если нет конкретной причины ограничивать доступ с помощью `viewProviders`.

### Проблемы с InjectionToken {#injectiontoken-issues}

При использовании `InjectionToken` для зависимостей, не являющихся классами, разработчики часто сталкиваются с проблемами, связанными с идентичностью токенов, типобезопасностью и конфигурацией провайдера. Эти проблемы обычно возникают из-за того, как JavaScript обрабатывает идентичность объектов и как TypeScript выводит типы.

#### Путаница с идентичностью токена {#token-identity-confusion}

При создании нового экземпляра `InjectionToken` JavaScript создаёт уникальный объект в памяти. Даже если создать другой `InjectionToken` с точно такой же строкой описания, это будет совершенно другой объект. Angular использует идентичность объекта токена (не его описание) для сопоставления провайдеров с точками внедрения, поэтому токены с одинаковым описанием, но разными идентичностями объектов не могут получить доступ к значениям друг друга.

```ts {header: 'config.token.ts'}
import {InjectionToken} from '@angular/core';

export interface AppConfig {
  apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app config');
```

```ts {header: 'app.config.ts'}
import {APP_CONFIG} from './config.token';

export const appConfig: AppConfig = {
  apiUrl: 'https://api.example.com',
};

bootstrapApplication(App, {
  providers: [{provide: APP_CONFIG, useValue: appConfig}],
});
```

```angular-ts {avoid, header: 'feature-view.ts'}
// Создание нового токена с тем же описанием
import {InjectionToken, inject} from '@angular/core';
import {AppConfig} from './config.token';

const APP_CONFIG = new InjectionToken<AppConfig>('app config');

@Component({
  selector: 'app-feature',
  template: '<p>Feature</p>',
})
export class FeatureView {
  private config = inject(APP_CONFIG); // ОШИБКА: Другой экземпляр токена!
}
```

Хотя оба токена имеют описание `'app config'`, они являются разными объектами. Angular сравнивает токены по ссылке, а не по описанию.

**Решение:** Импортируйте один и тот же экземпляр токена.

```angular-ts {prefer, header: 'feature-view.ts'}
import {inject} from '@angular/core';
import {APP_CONFIG, AppConfig} from './config.token';

@Component({
  selector: 'app-feature',
  template: '<p>API: {{config.apiUrl}}</p>',
})
export class FeatureView {
  protected config = inject(APP_CONFIG); // Работает: тот же экземпляр токена
}
```

TIP: Всегда экспортируйте токены из общего файла и импортируйте их везде, где они нужны. Никогда не создавайте несколько экземпляров `InjectionToken` с одинаковым описанием.

#### Попытка внедрить интерфейсы {#trying-to-inject-interfaces}

Когда вы определяете интерфейс TypeScript, он существует только во время компиляции для проверки типов. TypeScript стирает все определения интерфейсов при компиляции в JavaScript, поэтому во время выполнения нет объекта, который Angular мог бы использовать в качестве токена внедрения. Если вы пытаетесь внедрить тип интерфейса, Angular не может сопоставить его с конфигурацией провайдера.

```angular-ts {avoid, header: 'Нельзя внедрять интерфейс'}
interface UserConfig {
  name: string;
  email: string;
}

@Component({
  selector: 'app-profile',
  template: '<p>Profile</p>',
})
export class UserProfile {
  // ОШИБКА: Интерфейсы не существуют во время выполнения
  constructor(private config: UserConfig) {}
}
```

**Решение:** Используйте `InjectionToken` для типов интерфейсов.

```angular-ts {prefer, header: 'Используйте InjectionToken для интерфейсов'}
import {InjectionToken, inject} from '@angular/core';

interface UserConfig {
  name: string;
  email: string;
}

export const USER_CONFIG = new InjectionToken<UserConfig>('user configuration');

// Предоставление конфигурации
bootstrapApplication(App, {
  providers: [
    {
      provide: USER_CONFIG,
      useValue: {name: 'Alice', email: 'alice@example.com'},
    },
  ],
});

// Внедрение с использованием токена
@Component({
  selector: 'app-profile',
  template: '<p>User: {{config.name}}</p>',
})
export class UserProfile {
  protected config = inject(USER_CONFIG);
}
```

`InjectionToken` существует во время выполнения и может использоваться для внедрения, тогда как интерфейс `UserConfig` обеспечивает типобезопасность во время разработки.

### Циклические зависимости {#circular-dependencies}

Циклические зависимости возникают, когда сервисы внедряют друг друга, создавая цикл, который Angular не может разрешить. Подробные объяснения и примеры кода см. в разделе [NG0200: Циклическая зависимость](errors/NG0200).

**Стратегии решения** (в порядке предпочтения):

1. **Реструктуризация** — извлеките общую логику в третий сервис, разрывая цикл
2. **Используйте события** — замените прямые зависимости коммуникацией на основе событий (например, `Subject`)
3. **Отложенное внедрение** — используйте `Injector.get()` для отсрочки одной зависимости (последнее средство)

NOTE: Не используйте `forwardRef()` для циклических зависимостей сервисов — он решает только проблему циклических импортов в конфигурациях standalone-компонентов.

## Отладка разрешения зависимостей {#debugging-dependency-resolution}

### Понимание процесса разрешения {#understanding-the-resolution-process}

Angular разрешает зависимости, проходя вверх по иерархии инжекторов. Когда возникает `NullInjectorError`, понимание этого порядка поиска помогает определить, где добавить отсутствующий провайдер.

Angular выполняет поиск в следующем порядке:

1. **Инжектор элемента** — текущий компонент или директива
2. **Родительские инжекторы элементов** — вверх по DOM-дереву через родительские компоненты
3. **Инжектор окружения** — инжектор маршрута или приложения
4. **NullInjector** — выбрасывает `NullInjectorError`, если не найден

Когда вы видите `NullInjectorError`, сервис не предоставлен ни на одном уровне, доступном компоненту. Проверьте, что:

- Сервис имеет `@Injectable({providedIn: 'root'})`, или
- Сервис находится в массиве `providers`, доступном компоненту

Это поведение поиска можно изменить с помощью модификаторов разрешения: `self`, `skipSelf`, `host` и `optional`. Полное описание правил разрешения и модификаторов см. в [руководстве по иерархическим инжекторам](guide/di/hierarchical-dependency-injection).

### Использование Angular DevTools {#using-angular-devtools}

Angular DevTools включает инспектор дерева инжекторов, который визуализирует всю иерархию инжекторов и показывает, какие провайдеры доступны на каждом уровне. Установка и общее использование описаны в [документации по инжекторам Angular DevTools](tools/devtools/injectors).

При отладке проблем DI используйте DevTools для ответа на следующие вопросы:

- **Предоставлен ли сервис?** Выберите компонент, который не может внедрить сервис, и проверьте, отображается ли сервис в разделе Injector.
- **На каком уровне?** Пройдите вверх по дереву компонентов, чтобы найти, где фактически предоставлен сервис (уровень компонента, маршрута или приложения).
- **Несколько экземпляров?** Если сервис-синглтон появляется в нескольких инжекторах компонентов, он, вероятно, предоставлен в массивах `providers` компонентов вместо использования `providedIn: 'root'`.

Если сервис никогда не появляется ни в одном инжекторе, убедитесь, что у него есть декоратор `@Injectable()` с `providedIn: 'root'` или он указан в массиве `providers`.

### Логирование и трассировка внедрения {#logging-and-tracing-injection}

Когда DevTools недостаточно, используйте логирование для отслеживания поведения внедрения.

#### Логирование создания сервиса {#logging-service-creation}

Добавьте console.log в конструкторы сервисов, чтобы видеть, когда создаются сервисы.

```ts
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class UserClient {
  constructor() {
    console.log('UserClient created');
    console.trace(); // Показывает стек вызовов
  }

  getUser() {
    return {name: 'Alice'};
  }
}
```

При создании сервиса вы увидите сообщение в логе и трассировку стека, показывающую, где произошло внедрение.

**На что обращать внимание:**

- Сколько раз вызывается конструктор? (для синглтонов должен быть один раз)
- Где в коде происходит внедрение? (проверьте трассировку стека)
- Создаётся ли он в ожидаемое время? (при запуске приложения или при ленивой загрузке)

#### Проверка доступности сервиса {#checking-service-availability}

Используйте необязательное внедрение с логированием для определения доступности сервиса.

```angular-ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Debug Component</p>',
})
export class DebugView {
  private userService = inject(UserClient, {optional: true});

  constructor() {
    if (this.userService) {
      console.log('UserClient available:', this.userService);
    } else {
      console.warn('UserClient NOT available');
      console.trace(); // Показывает, где мы пытались внедрить
    }
  }
}
```

Этот паттерн помогает проверить доступность сервиса без сбоя приложения.

#### Логирование модификаторов разрешения {#logging-resolution-modifiers}

Протестируйте различные стратегии разрешения с логированием.

```angular-ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Debug Component</p>',
  providers: [UserClient],
})
export class DebugView {
  // Попытка получить локальный экземпляр
  private localService = inject(UserClient, {self: true, optional: true});

  // Попытка получить родительский экземпляр
  private parentService = inject(UserClient, {
    skipSelf: true,
    optional: true,
  });

  constructor() {
    console.log('Local instance:', this.localService);
    console.log('Parent instance:', this.parentService);
    console.log('Same instance?', this.localService === this.parentService);
  }
}
```

Это показывает, какие экземпляры доступны на разных уровнях инжекторов.

### Процесс отладки {#debugging-workflow}

При сбое DI следуйте этому систематическому подходу:

**Шаг 1: Прочитайте сообщение об ошибке**

- Определите код ошибки (NG0200, NG0203 и т.д.)
- Прочитайте путь зависимости
- Отметьте, какой токен не был найден

**Шаг 2: Проверьте основы**

- Есть ли у сервиса `@Injectable()`?
- Правильно ли установлен `providedIn`?
- Правильны ли импорты?
- Включён ли файл в компиляцию?

**Шаг 3: Проверьте контекст внедрения**

- Вызывается ли `inject()` в допустимом контексте?
- Проверьте асинхронные проблемы (await, setTimeout, promises)
- Проверьте время (не после уничтожения)

**Шаг 4: Используйте инструменты отладки**

- Откройте Angular DevTools
- Проверьте иерархию инжекторов
- Добавьте console.log в конструкторы
- Используйте необязательное внедрение для проверки доступности

**Шаг 5: Упростите и изолируйте**

- Удаляйте зависимости одну за другой
- Тестируйте в минимальном компоненте
- Проверяйте каждый уровень инжектора по отдельности
- Создайте воспроизводящий пример

## Справочник ошибок DI {#di-error-reference}

Этот раздел содержит подробную информацию о конкретных кодах ошибок Angular DI, с которыми вы можете столкнуться. Используйте его как справочник при появлении этих ошибок в консоли.

### NullInjectorError: No provider for [Service] {#nullinjectorerror-no-provider-for-service}

**Код ошибки:** Нет (отображается как `NullInjectorError`)

Эта ошибка возникает, когда Angular не может найти провайдер для токена в иерархии инжекторов. Сообщение об ошибке включает путь зависимости, показывающий, где было выполнено внедрение.

```
NullInjectorError: No provider for UserClient!
  Dependency path: App -> AuthClient -> UserClient
```

Путь зависимости показывает, что `App` внедрил `AuthClient`, который попытался внедрить `UserClient`, но провайдер не был найден.

#### Отсутствующий декоратор @Injectable {#missing-injectable-decorator}

Наиболее распространённая причина — забытый декоратор `@Injectable()` в классе сервиса.

```ts {avoid, header: 'Отсутствующий декоратор'}
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Angular требует декоратор `@Injectable()` для генерации метаданных, необходимых для внедрения зависимостей.

```ts {prefer, header: 'Включите @Injectable'}
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

NOTE: Классы с конструктором без аргументов могут работать без `@Injectable()`, но это не рекомендуется. Всегда включайте декоратор для единообразия и во избежание проблем при добавлении зависимостей в будущем.

#### Отсутствующая конфигурация providedIn {#missing-providedin-configuration}

У сервиса может быть `@Injectable()`, но без указания, где он должен быть предоставлен.

```ts {avoid, header: 'providedIn не указан'}
import {Injectable} from '@angular/core';

@Injectable()
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Укажите `providedIn: 'root'`, чтобы сделать сервис доступным во всём приложении.

```ts {prefer, header: 'Укажите providedIn'}
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Конфигурация `providedIn: 'root'` делает сервис доступным во всём приложении и включает tree-shaking (сервис удаляется из бандла, если никогда не внедряется).

#### Отсутствующие импорты в standalone-компоненте {#standalone-component-missing-imports}

В Angular v20+ со standalone-компонентами необходимо явно импортировать или предоставлять зависимости в каждом компоненте.

```angular-ts {avoid, header: 'Отсутствующий импорт сервиса'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{user().name}}</p>',
})
export class UserProfile {
  private userService = inject(UserClient); // ОШИБКА: Нет провайдера
  user = this.userService.getUser();
}
```

Убедитесь, что сервис использует `providedIn: 'root'` или добавьте его в массив `providers` компонента.

```angular-ts {prefer, header: 'Сервис использует providedIn: root'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{user().name}}</p>',
})
export class UserProfile {
  private userService = inject(UserClient); // Работает: providedIn: 'root'
  user = this.userService.getUser();
}
```

#### Отладка с помощью пути зависимости {#debugging-with-the-dependency-path}

Путь зависимости в сообщении об ошибке показывает цепочку внедрений, приведших к сбою.

```
NullInjectorError: No provider for LoggerStore!
  Dependency path: App -> DataStore -> ApiClient -> LoggerStore
```

Этот путь говорит:

1. `App` внедрил `DataStore`
2. `DataStore` внедрил `ApiClient`
3. `ApiClient` попытался внедрить `LoggerStore`
4. Провайдер для `LoggerStore` не найден

Начните расследование с конца цепочки (`LoggerStore`) и проверьте его конфигурацию.

#### Проверка доступности провайдера с помощью необязательного внедрения {#checking-provider-availability-with-optional-injection}

Используйте необязательное внедрение для проверки наличия провайдера без выброса ошибки.

```angular-ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Service available: {{serviceAvailable}}</p>',
})
export class DebugView {
  private userService = inject(UserClient, {optional: true});
  serviceAvailable = this.userService !== null;
}
```

Необязательное внедрение возвращает `null`, если провайдер не найден, позволяя корректно обработать его отсутствие.

### NG0203: inject() необходимо вызывать из контекста внедрения {#ng0203-inject-must-be-called-from-an-injection-context}

**Код ошибки:** NG0203

Эта ошибка возникает, когда вы вызываете `inject()` вне допустимого контекста внедрения. Angular требует, чтобы `inject()` вызывался синхронно во время создания класса или выполнения фабрики.

```
NG0203: inject() must be called from an injection context such as a
constructor, a factory function, a field initializer, or a function
used with `runInInjectionContext`.
```

#### Допустимые контексты внедрения {#valid-injection-contexts}

Angular разрешает `inject()` в следующих местах:

1. **Инициализаторы полей класса**

   ```angular-ts
   import {Component, inject} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<p>User: {{user().name}}</p>',
   })
   export class UserProfile {
     private userService = inject(UserClient); // Допустимо
     user = this.userService.getUser();
   }
   ```

2. **Конструктор класса**

   ```angular-ts
   import {Component, inject} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<p>User: {{user().name}}</p>',
   })
   export class UserProfile {
     private userService: UserClient;

     constructor() {
       this.userService = inject(UserClient); // Допустимо
     }

     user = this.userService.getUser();
   }
   ```

3. **Фабричные функции провайдеров**

   ```ts
   import {inject, InjectionToken} from '@angular/core';
   import {UserClient} from './user-client';

   export const GREETING = new InjectionToken<string>('greeting', {
     factory() {
       const userService = inject(UserClient); // Допустимо
       const user = userService.getUser();
       return `Hello, ${user.name}`;
     },
   });
   ```

4. **Внутри runInInjectionContext()**

   ```angular-ts
   import {Component, inject, Injector} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<button (click)="loadUser()">Load User</button>',
   })
   export class UserProfile {
     private injector = inject(Injector);

     loadUser() {
       this.injector.runInInjectionContext(() => {
         const userService = inject(UserClient); // Допустимо
         console.log(userService.getUser());
       });
     }
   }
   ```

Другие контексты внедрения, в которых также работает `inject()`:

- [provideAppInitializer](api/core/provideAppInitializer)
- [provideEnvironmentInitializer](api/core/provideEnvironmentInitializer)
- Функциональные [guard'ы маршрутов](guide/routing/route-guards)
- Функциональные [resolver'ы данных](guide/routing/data-resolvers)

#### Когда возникает эта ошибка {#when-this-error-occurs}

Эта ошибка возникает, когда:

- `inject()` вызывается в хуках жизненного цикла (`ngOnInit`, `ngAfterViewInit` и т.д.)
- `inject()` вызывается после `await` в асинхронных функциях
- `inject()` вызывается в колбэках (`setTimeout`, `Promise.then()` и т.д.)
- `inject()` вызывается вне фазы создания класса

Подробные примеры и решения см. в разделе «Неправильное использование inject()».

#### Решения и обходные пути {#solutions-and-workarounds}

**Решение 1:** Захватывайте зависимости в инициализаторах полей (наиболее распространённый способ)

```ts
private userService = inject(UserClient) // Захват на уровне класса
```

**Решение 2:** Используйте `runInInjectionContext()` для колбэков

```ts
private injector = inject(Injector)

someCallback() {
  this.injector.runInInjectionContext(() => {
    const service = inject(MyClient)
  })
}
```

**Решение 3:** Передавайте зависимости как параметры вместо их внедрения

```ts
// Вместо внедрения внутри колбэка
setTimeout(() => {
  const service = inject(MyClient) // ОШИБКА
}, 1000)

// Сначала захватите, затем используйте
private service = inject(MyClient)

setTimeout(() => {
  this.service.doSomething() // Использование захваченной ссылки
}, 1000)
```

### NG0200: Обнаружена циклическая зависимость {#ng0200-circular-dependency-detected}

**Код ошибки:** NG0200

Эта ошибка возникает, когда два или более сервисов зависят друг от друга, создавая циклическую зависимость, которую Angular не может разрешить.

```
NG0200: Circular dependency in DI detected for AuthClient
  Dependency path: AuthClient -> UserClient -> AuthClient
```

Путь зависимости показывает цикл: `AuthClient` зависит от `UserClient`, который зависит обратно от `AuthClient`.

#### Понимание ошибки {#understanding-the-error}

Angular создаёт экземпляры сервисов, вызывая их конструкторы и внедряя зависимости. Когда сервисы зависят друг от друга циклически, Angular не может определить, какой из них создать первым.

#### Распространённые причины {#common-causes}

- Прямая циклическая зависимость (Сервис A → Сервис B → Сервис A)
- Косвенная циклическая зависимость (Сервис A → Сервис B → Сервис C → Сервис A)
- Циклические импорты в файлах модулей, также имеющих зависимости сервисов

#### Стратегии решения {#resolution-strategies}

Подробные примеры и решения см. в разделе «Циклические зависимости»:

1. **Реструктуризация** — извлеките общую логику в третий сервис (рекомендуется)
2. **Используйте события** — замените прямые зависимости коммуникацией на основе событий
3. **Отложенное внедрение** — используйте `Injector.get()` для отсрочки одной зависимости (последнее средство)

Не используйте `forwardRef()` для циклических зависимостей сервисов. Он решает только проблему циклических импортов в конфигурациях компонентов.

### Другие коды ошибок DI {#other-di-error-codes}

Подробные объяснения и решения для этих ошибок см. в [справочнике ошибок Angular](errors):

| Код ошибки              | Описание                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| [NG0204](errors/NG0204) | Не удаётся разрешить все параметры — отсутствует декоратор `@Injectable()`                           |
| [NG0205](errors/NG0205) | Инжектор уже уничтожен — доступ к сервисам после уничтожения компонента                              |
| [NG0207](errors/NG0207) | EnvironmentProviders в неправильном контексте — использование `provideHttpClient()` в providers компонента |

## Следующие шаги {#next-steps}

При возникновении ошибок DI помните:

1. Внимательно прочитайте сообщение об ошибке и путь зависимости
2. Проверьте базовую конфигурацию (декораторы, `providedIn`, импорты)
3. Проверьте контекст внедрения и время выполнения
4. Используйте DevTools и логирование для расследования
5. Упростите и изолируйте проблему

Для более глубокого понимания конкретных тем внедрения зависимостей изучите:

- [Понимание внедрения зависимостей](guide/di) — основные концепции и паттерны DI
- [Иерархическое внедрение зависимостей](guide/di/hierarchical-dependency-injection) — как работает иерархия инжекторов
- [Тестирование с внедрением зависимостей](guide/testing) — использование TestBed и имитация зависимостей
