# Руководство по стилю кода Angular

## Введение {#introduction}

Это руководство охватывает ряд стилевых соглашений для кода Angular-приложений. Эти рекомендации
не обязательны для работы Angular, а задают набор практик, способствующих
согласованности в экосистеме Angular. Единый набор практик упрощает обмен
кодом и переход между проектами.

Это руководство _не_ охватывает TypeScript или общие практики кодирования, не связанные с Angular. Для
TypeScript см.
[руководство по стилю TypeScript от Google](https://google.github.io/styleguide/tsguide.html).

### В сомнениях предпочитайте согласованность {#when-in-doubt-prefer-consistency}

Когда эти правила противоречат стилю конкретного файла,
приоритет — сохранять согласованность внутри файла. Смешение разных стилевых соглашений в одном
файле создаёт больше путаницы, чем отклонение от рекомендаций этого руководства.

## Именование {#naming}

### Разделяйте слова в именах файлов дефисами {#separate-words-in-file-names-with-hyphens}

Разделяйте слова в имени файла дефисами (`-`). Например, компонент с именем `UserProfile`
имеет имя файла `user-profile.ts`.

### Используйте то же имя для тестов файла с `.spec` в конце {#use-the-same-name-for-a-files-tests-with-spec-at-the-end}

Для unit-тестов заканчивайте имена файлов на `.spec.ts`. Например, файл unit-теста для
компонента `UserProfile` имеет имя `user-profile.spec.ts`.

### Сопоставляйте имена файлов с идентификатором TypeScript внутри {#match-file-names-to-the-typescript-identifier-within}

Имена файлов обычно должны описывать содержимое кода в файле. Когда файл содержит
класс TypeScript, имя файла должно отражать имя этого класса. Например, файл с
компонентом `UserProfile` имеет имя `user-profile.ts`.

Если в файле больше одного основного именованного идентификатора, выберите имя, описывающее
общую тему кода. Если код в файле не укладывается в общую тему или область
функции, рассмотрите разбиение на разные файлы. Избегайте слишком общих имён файлов
вроде `helpers.ts`, `utils.ts` или `common.ts`.

### Используйте одно имя файла для TypeScript, шаблона и стилей компонента {#use-the-same-file-name-for-a-components-typescript-template-and-styles}

Компоненты обычно состоят из одного файла TypeScript, одного файла шаблона и одного файла стилей. Эти
файлы должны иметь одно имя с разными расширениями. Например, компонент `UserProfile`
может иметь файлы `user-profile.ts`, `user-profile.html` и `user-profile.css`.

Если у компонента больше одного файла стилей, добавьте к имени слова, описывающие
стили, специфичные для этого файла. Например, у `UserProfile` могут быть файлы стилей
`user-profile-settings.css` и `user-profile-subscription.css`.

## Структура проекта {#project-structure}

### Весь код приложения — в каталоге `src` {#all-the-applications-code-goes-in-a-directory-named-src}

Весь UI-код Angular (TypeScript, HTML и стили) должен жить в каталоге
с именем `src`. Код, не связанный с UI, — конфигурационные файлы или скрипты — должен жить
вне каталога `src`.

Это сохраняет корневой каталог приложения согласованным между разными Angular-проектами и создаёт
чёткое разделение между UI-кодом и остальным кодом проекта.

### Bootstrap приложения — в файле `main.ts` прямо внутри `src` {#bootstrap-your-application-in-a-file-named-maints-directly-inside-src}

Код запуска, или **bootstrap**, Angular-приложения всегда должен жить в файле
с именем `main.ts`. Это основная точка входа в приложение.

### Группируйте тесно связанные файлы в одном каталоге {#group-closely-related-files-together-in-the-same-directory}

Компоненты Angular состоят из файла TypeScript и, опционально, шаблона и одного или нескольких файлов
стилей. Их следует группировать в одном каталоге.

Unit-тесты должны жить в том же каталоге, что и тестируемый код. Избегайте сбора несвязанных
тестов в один каталог `tests`.

### Организуйте проект по областям функций {#organize-your-project-by-feature-areas}

Организуйте проект в подкаталоги по функциям приложения или общим темам
кода в этих каталогах. Например, структура проекта сайта кинотеатра
MovieReel может выглядеть так:

```
src/
├─ movie-reel/
│ ├─ show-times/
│ │ ├─ film-calendar/
│ │ ├─ film-details/
│ ├─ reserve-tickets/
│ │ ├─ payment-info/
│ │ ├─ purchase-confirmation/
```

Избегайте создания подкаталогов по типу кода в них. Например,
избегайте каталогов вроде `components`, `directives` и `services`.

Избегайте помещать в один каталог столько файлов, что в нём становится трудно ориентироваться. По мере
роста числа файлов в каталоге рассмотрите дальнейшее разбиение на подкаталоги.

### Одна концепция на файл {#one-concept-per-file}

Предпочитайте фокусировать исходные файлы на одной _концепции_. Для классов Angular это обычно
означает один компонент, директиву или сервис на файл. Однако допустимо, если файл содержит больше
одного компонента или директивы, когда классы относительно малы и связаны как часть
одной концепции.

В сомнениях выбирайте подход, ведущий к меньшим файлам.

## Внедрение зависимостей {#dependency-injection}

### Предпочитайте функцию `inject` внедрению через параметры конструктора {#prefer-the-inject-function-over-constructor-parameter-injection}

Предпочитайте функцию [`inject`](/api/core/inject) внедрению через параметры конструктора. [`inject`](/api/core/inject) работает так же, как внедрение через параметры конструктора, но даёт несколько стилевых преимуществ:

- [`inject`](/api/core/inject) обычно читабельнее, особенно когда класс внедряет много зависимостей.
- Синтаксически проще добавлять комментарии к внедрённым зависимостям
- [`inject`](/api/core/inject) даёт лучший вывод типов.
- При таргете ES2022+ с [`useDefineForClassFields`](https://www.typescriptlang.org/tsconfig/#useDefineForClassFields) можно избежать разделения объявления и инициализации полей, когда поля читают внедрённые зависимости.

[Существующий код можно рефакторить на `inject` автоматическим инструментом](reference/migrations/inject-function).

## Компоненты и директивы {#components-and-directives}

### Выбор селекторов компонентов {#choosing-component-selectors}

См.
[руководство по компонентам о выборе селекторов компонентов](guide/components/selectors#choosing-a-selector).

### Именование членов компонентов и директив {#naming-component-and-directive-members}

См. руководство по компонентам о
[именовании input-свойств](guide/components/inputs#choosing-input-names)
и [именовании output-свойств](guide/components/outputs#choosing-event-names).

### Выбор селекторов директив {#choosing-directive-selectors}

Директивы должны использовать тот же
[префикс, специфичный для приложения](guide/components/selectors#selector-prefixes),
что и компоненты.

При использовании attribute-селектора для директивы используйте имя атрибута в camelCase. Например, если
приложение называется «MovieReel» и вы создаёте директиву, добавляющую tooltip к элементу,
можно использовать селектор `[mrTooltip]`.

### Группируйте Angular-специфичные свойства перед методами {#group-angular-specific-properties-before-methods}

Компоненты и директивы должны группировать Angular-специфичные свойства вместе, обычно ближе к началу
объявления класса. Это включает внедрённые зависимости, input, output и queries. Определяйте
их и другие свойства перед методами класса.

Так проще находить template API и зависимости класса.

### Держите компоненты и директивы сфокусированными на представлении {#keep-components-and-directives-focused-on-presentation}

Код внутри компонентов и директив обычно должен относиться к UI на странице. Для
кода, имеющего смысл сам по себе, отдельно от UI, предпочитайте рефакторинг в другие файлы. Например,
правила валидации форм или преобразования данных можно вынести в отдельные функции или
классы.

### Избегайте излишне сложной логики в шаблонах {#avoid-overly-complex-logic-in-templates}

Шаблоны Angular рассчитаны на
[выражения, похожие на JavaScript](guide/templates/expression-syntax).
Используйте эти выражения, чтобы выражать относительно простую логику прямо
в выражениях шаблона.

Когда код в шаблоне становится слишком сложным, рефакторьте логику в код TypeScript (обычно с [computed](guide/signals#computed-signals)).

Нет жёсткого правила, что считать «сложным». Используйте здравый смысл.

### Используйте `protected` для членов класса, используемых только шаблоном компонента {#use-protected-on-class-members-that-are-only-used-by-a-components-template}

Публичные члены класса компонента по сути определяют публичный API, доступный через
внедрение зависимостей и [queries](guide/components/queries). Предпочитайте доступ `protected`
для любых членов, предназначенных для чтения из шаблона компонента.

```ts
@Component({
  ...,
  template: `<p>{{ fullName() }}</p>`,
})
export class UserProfile {
  firstName = input();
  lastName = input();

// `fullName` is not part of the component's public API, but is used in the template.
  protected fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
}
```

### Используйте `readonly` для свойств, которые не должны меняться {#use-readonly-for-properties-that-shouldnt-change}

Помечайте свойства компонентов и директив, инициализируемые Angular, как `readonly`. Это включает
свойства, инициализируемые через `input`, `model`, `output` и queries. Модификатор доступа readonly
гарантирует, что значение, установленное Angular, не будет перезаписано.

```ts
@Component(/* ... */)
export class UserProfile {
  readonly userId = input();
  readonly userSaved = output();
  readonly userName = model();
}
```

Для компонентов и директив, использующих декораторные API `@Input`, `@Output` и queries, этот
совет относится к output-свойствам и queries, но не к input-свойствам.

```ts
@Component(/* ... */)
export class UserProfile {
  @Output() readonly userSaved = new EventEmitter<void>();
  @ViewChildren(PaymentMethod) readonly paymentMethods?: QueryList<PaymentMethod>;
}
```

### Предпочитайте `class` и `style` вместо `ngClass` и `ngStyle` {#prefer-class-and-style-over-ngclass-and-ngstyle}

Предпочитайте привязки `class` и `style` использованию директив [`NgClass`](/api/common/NgClass) и [`NgStyle`](/api/common/NgStyle).

```html {prefer}
<div [class.admin]="isAdmin" [class.dense]="density === 'high'">
  <div [style.color]="textColor" [style.background-color]="backgroundColor">
    <!-- OR -->
    <div [class]="{admin: isAdmin, dense: density === 'high'}">
      <div [style]="{'color': textColor, 'background-color': backgroundColor}"></div>
    </div>
  </div>
</div>
```

```html {avoid}
<div [ngClass]="{admin: isAdmin, dense: density === 'high'}">
  <div [ngStyle]="{'color': textColor, 'background-color': backgroundColor}"></div>
</div>
```

Привязки `class` и `style` используют более прямой синтаксис, близкий к
стандартным HTML-атрибутам. Это делает шаблоны проще для чтения и понимания, особенно для
разработчиков, знакомых с базовым HTML.

Кроме того, директивы `NgClass` и `NgStyle` несут дополнительную стоимость производительности по сравнению
со встроенным синтаксисом привязок `class` и `style`.

Подробнее — в [руководстве по привязкам](/guide/templates/binding#css-class-and-style-property-bindings)

### Называйте обработчики событий по тому, что они _делают_, а не по событию-триггеру {#name-event-handlers-for-what-they-do-not-for-the-triggering-event}

Предпочитайте именовать обработчики событий по выполняемому действию, а не по событию-триггеру:

```html {prefer}
<button (click)="saveUserData()">Save</button>
```

```html {avoid}
<button (click)="handleClick()">Save</button>
```

Осмысленные имена упрощают понимание того, что делает событие, при чтении
шаблона.

Для событий клавиатуры можно использовать модификаторы клавиш Angular с конкретными именами обработчиков:

```html
<textarea (keydown.control.enter)="commitNotes()" (keydown.control.space)="showSuggestions()">
```

Иногда логика обработки события особенно длинная или сложная, и объявить один
хорошо названный обработчик непрактично. В таких случаях допустимо имя вроде 'handleKeydown' с
последующей делегацией более конкретным поведениям на основе деталей события:

```ts
@Component(/* ... */)
class RichText {
  handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey) {
      if (event.key === 'B') {
        this.activateBold();
      } else if (event.key === 'I') {
        this.activateItalic();
      }
      // ...
    }
  }
}
```

### Держите методы жизненного цикла простыми {#keep-lifecycle-methods-simple}

Избегайте длинной или сложной логики внутри хуков жизненного цикла вроде `ngOnInit`. Вместо этого создавайте
хорошо названные методы с этой логикой и _вызывайте эти методы_ в хуках жизненного цикла.
Имена хуков описывают _когда_ они выполняются, то есть код внутри не имеет
осмысленного имени, описывающего, что он делает.

```ts {prefer}
ngOnInit() {
  this.startLogging();
  this.runBackgroundTask();
}
```

```ts {avoid}
ngOnInit() {
  this.logger.setMode('info');
  this.logger.monitorErrors();
  // ...and all the rest of the code that would be unrolled from these methods.
}
```

### Используйте интерфейсы хуков жизненного цикла {#use-lifecycle-hook-interfaces}

Angular предоставляет интерфейс TypeScript для каждого метода жизненного цикла. При добавлении хука жизненного цикла в
класс импортируйте и `implement` эти интерфейсы, чтобы методы были названы правильно.

```ts
import {Component, OnInit} from '@angular/core';

@Component(/* ... */)
export class UserProfile implements OnInit {
  // The `OnInit` interface ensures this method is named correctly.
  ngOnInit() {
    /* ... */
  }
}
```
