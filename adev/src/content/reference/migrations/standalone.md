# Переход существующего проекта Angular на standalone

**Standalone-компоненты** предоставляют упрощенный способ создания приложений Angular. Standalone-компоненты, директивы
и пайпы (pipes) призваны упростить процесс разработки, уменьшая необходимость в `NgModule`. Существующие приложения
могут опционально и постепенно переходить на новый стиль standalone без каких-либо критических изменений.

<docs-video src="https://www.youtube.com/embed/x5PZwb4XurU" title="Начало работы со standalone-компонентами"/>

Этот схематик помогает преобразовать компоненты, директивы и пайпы в существующих проектах в standalone. Схематик
стремится автоматически преобразовать как можно больше кода, но может потребовать некоторых ручных исправлений со
стороны автора проекта.

Запустите схематик, используя следующую команду:

```shell
ng generate @angular/core:standalone
```

## Перед обновлением {#before-updating}

Перед использованием схематика убедитесь, что проект:

1. Использует Angular 15.2.0 или новее.
2. Собирается без ошибок компиляции.
3. Находится на чистой ветке Git, и вся работа сохранена.

## Опции схематика {#schematic-options}

| Опция  | Подробности                                                                                                                      |
| :----- | :------------------------------------------------------------------------------------------------------------------------------- |
| `mode` | Выполняемое преобразование. См. [Режимы миграции](#migration-modes) ниже для подробностей о доступных опциях.                    |
| `path` | Путь для миграции относительно корня проекта. Вы можете использовать эту опцию для постепенной миграции разделов вашего проекта. |

## Шаги миграции {#migration-steps}

Процесс миграции состоит из трех этапов. Вам придется запускать его несколько раз и вручную проверять, что проект
собирается и работает так, как ожидается.

ПРИМЕЧАНИЕ: Хотя схематик может автоматически обновить большую часть кода, некоторые граничные случаи требуют
вмешательства разработчика.
Вам следует запланировать ручные исправления после каждого этапа миграции. Кроме того, новый код, сгенерированный
схематиком, может не соответствовать правилам форматирования вашего кода.

Запускайте миграцию в указанном ниже порядке, проверяя, что ваш код собирается и запускается между каждым шагом:

1. Запустите `ng g @angular/core:standalone` и выберите "Convert all components, directives and pipes to standalone" (
   Преобразовать все компоненты, директивы и пайпы в standalone).
2. Запустите `ng g @angular/core:standalone` и выберите "Remove unnecessary NgModule classes" (Удалить ненужные классы
   NgModule).
3. Запустите `ng g @angular/core:standalone` и выберите "Bootstrap the project using standalone APIs" (Загрузить проект,
   используя standalone API).
4. Запустите любые проверки линтинга и форматирования, исправьте ошибки и зафиксируйте (commit) результат.

## После миграции {#after-the-migration}

Поздравляем, ваше приложение было переведено на standalone! Вот несколько дополнительных шагов, которые вы можете
предпринять сейчас:

- Найдите и удалите оставшиеся объявления `NgModule`: так как
  шаг ["Удаление ненужных NgModules"](#remove-unnecessary-ngmodules) не может удалить все модули автоматически, вам
  может потребоваться удалить оставшиеся объявления вручную.
- Запустите модульные тесты проекта и исправьте все ошибки.
- Запустите форматировщики кода, если проект использует автоматическое форматирование.
- Запустите линтеры в вашем проекте и исправьте новые предупреждения. Некоторые линтеры поддерживают флаг `--fix`,
  который может автоматически устранить некоторые предупреждения.

## Режимы миграции {#migration-modes}

Миграция имеет следующие режимы:

1. Преобразование объявлений в standalone.
2. Удаление ненужных NgModules.
3. Переход на API начальной загрузки (bootstrapping) standalone.
   Вам следует запускать эти миграции в указанном порядке.

### Преобразование объявлений в standalone {#convert-declarations-to-standalone}

В этом режиме миграция преобразует все компоненты, директивы и пайпы в standalone, удаляя `standalone: false` и добавляя
зависимости в их массив `imports`.

ПОЛЕЗНО: На этом этапе схематик игнорирует NgModules, которые загружают (bootstrap) компонент, так как они, вероятно,
являются корневыми модулями, используемыми `bootstrapModule`, а не `bootstrapApplication`, совместимым со standalone.
Схематик преобразует эти объявления автоматически в рамках
шага ["Переход на API начальной загрузки standalone"](#switch-to-standalone-bootstrapping-api).

**До:**

```typescript
// shared.module.ts
@NgModule({
  imports: [CommonModule],
  declarations: [Greeter],
  exports: [Greeter],
})
export class SharedModule {}
```

```angular-ts
// greeter.ts
@Component({
  selector: 'greeter',
  template: '<div *ngIf="showGreeting">Hello</div>',
  standalone: false,
})
export class Greeter {
  showGreeting = true;
}
```

**После:**

```typescript
// shared.module.ts
@NgModule({
  imports: [CommonModule, Greeter],
  exports: [Greeter],
})
export class SharedModule {}
```

```angular-ts
// greeter.ts
@Component({
  selector: 'greeter',
  template: '<div *ngIf="showGreeting">Hello</div>',
  imports: [NgIf],
})
export class Greeter {
  showGreeting = true;
}
```

### Удаление ненужных NgModules {#remove-unnecessary-ngmodules}

После преобразования всех объявлений в standalone многие NgModules могут быть безопасно удалены. Этот шаг удаляет
объявления таких модулей и как можно больше соответствующих ссылок. Если миграция не может удалить ссылку автоматически,
она оставляет следующий комментарий TODO, чтобы вы могли удалить NgModule вручную:

```typescript
/* TODO(standalone-migration): clean up removed NgModule reference manually */
```

Миграция считает модуль безопасным для удаления, если этот модуль:

- Не имеет `declarations` (объявлений).
- Не имеет `providers` (провайдеров).
- Не имеет `bootstrap` компонентов.
- Не имеет `imports`, ссылающихся на символ `ModuleWithProviders` или модуль, который не может быть удален.
- Не имеет членов класса. Пустые конструкторы игнорируются.

**До:**

```typescript
// importer.module.ts
@NgModule({
  imports: [FooComponent, BarPipe],
  exports: [FooComponent, BarPipe],
})
export class ImporterModule {}
```

**После:**

```typescript
// importer.module.ts
// Не существует!
```

### Переход на API начальной загрузки standalone {#switch-to-standalone-bootstrapping-api}

Этот шаг преобразует любые использования `bootstrapModule` в новый `bootstrapApplication` на основе standalone. Он также
удаляет `standalone: false` из корневого компонента и удаляет корневой NgModule. Если корневой модуль имеет какие-либо
`providers` или `imports`, миграция пытается скопировать как можно больше этой конфигурации в новый вызов bootstrap.

**До:**

```typescript
// ./app/app.module.ts
import {NgModule} from '@angular/core';
import {App} from './app';

@NgModule({
  declarations: [App],
  bootstrap: [App],
})
export class AppModule {}
```

```typescript
// ./app/app.ts
@Component({
  selector: 'app',
  template: 'hello',
  standalone: false,
})
export class App {}
```

```typescript
// ./main.ts
import {platformBrowser} from '@angular/platform-browser';
import {AppModule} from './app/app.module';

platformBrowser()
  .bootstrapModule(AppModule)
  .catch((e) => console.error(e));
```

**После:**

```typescript
// ./app/app.module.ts
// Не существует!
```

```typescript
// ./app/app.ts
@Component({
  selector: 'app',
  template: 'hello',
})
export class App {}
```

```typescript
// ./main.ts
import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app';

bootstrapApplication(App).catch((e) => console.error(e));
```

## Распространенные проблемы {#common-problems}

Некоторые распространенные проблемы, которые могут помешать правильной работе схематика, включают:

- Ошибки компиляции — если в проекте есть ошибки компиляции, Angular не сможет правильно проанализировать и мигрировать
  его.
- Файлы, не включенные в tsconfig — схематик определяет, какие файлы мигрировать, анализируя файлы `tsconfig.json`
  вашего проекта. Схематик исключает любые файлы, не охваченные tsconfig.
- Код, который невозможно проанализировать статически — схематик использует статический анализ, чтобы понять ваш код и
  определить, где внести изменения. Миграция может пропустить любые классы с метаданными, которые невозможно
  проанализировать статически во время сборки.

## Ограничения {#limitations}

Из-за размера и сложности миграции существуют некоторые случаи, которые схематик не может обработать:

- Поскольку модульные тесты не компилируются с опережением (AoT), `imports`, добавленные в компоненты в модульных
  тестах, могут быть не совсем корректными.
- Схематик полагается на прямые вызовы API Angular. Схематик не может распознать пользовательские обертки вокруг API
  Angular. Например, если вы определите пользовательскую функцию `customConfigureTestModule`, которая оборачивает
  `TestBed.configureTestingModule`, компоненты, которые она объявляет, могут быть не распознаны.
