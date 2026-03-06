# Основы тестирования компонентов {#basics-of-testing-components}

Компонент, в отличие от всех остальных частей Angular-приложения, объединяет HTML-шаблон и класс TypeScript.
Компонент — это шаблон и класс, _работающие вместе_.
Чтобы полноценно протестировать компонент, нужно проверить, что они взаимодействуют так, как задумано.

Такие тесты требуют создания элемента-хоста компонента в DOM браузера — так же, как это делает Angular, — и исследования взаимодействия класса компонента с DOM, описанного его шаблоном.

Angular `TestBed` облегчает подобное тестирование, как будет показано в следующих разделах.
Но во многих случаях _тестирование только класса компонента_, без работы с DOM, позволяет проверить большую часть поведения компонента простым и очевидным способом.

## DOM-тестирование компонента {#component-dom-testing}

Компонент — это не только его класс.
Компонент взаимодействует с DOM и другими компонентами.
Один лишь класс не скажет, корректно ли отображается компонент, реагирует ли он на ввод и жесты пользователя, интегрируется ли с родительскими и дочерними компонентами.

- Привязан ли `Lightswitch.clicked()` к чему-либо, чтобы пользователь мог его вызвать?
- Отображается ли `Lightswitch.message`?
- Может ли пользователь выбрать героя, отображаемого компонентом `DashboardHero`?
- Отображается ли имя героя ожидаемым образом \(например, в верхнем регистре\)?
- Отображается ли приветственное сообщение в шаблоне компонента `Welcome`?

Для простых компонентов из предыдущих примеров эти вопросы не вызывают затруднений.
Но многие компоненты имеют сложное взаимодействие с элементами DOM, описанными в шаблонах: HTML появляется и исчезает по мере изменения состояния компонента.

Чтобы ответить на подобные вопросы, нужно создать элементы DOM, связанные с компонентами, проверить, что состояние компонента корректно отображается в DOM в нужные моменты, и сымитировать взаимодействие пользователя с экраном, чтобы убедиться, что эти взаимодействия приводят к ожидаемому поведению компонента.

Для написания таких тестов понадобятся дополнительные возможности `TestBed` и другие вспомогательные инструменты.

### Тесты, созданные CLI {#cli-generated-tests}

По умолчанию CLI создаёт начальный тестовый файл при генерации нового компонента.

Например, следующая команда CLI создаёт компонент `Banner` в папке `app/banner` \(со встроенными шаблоном и стилями\):

```shell
ng generate component banner --inline-template --inline-style
```

При этом также создаётся начальный тестовый файл `banner.spec.ts`, который выглядит следующим образом:

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Banner} from './banner';

describe('Banner', () => {
  let component: Banner;
  let fixture: ComponentFixture<Banner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Banner],
    }).compileComponents();

    fixture = TestBed.createComponent(Banner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Упрощение настройки {#reduce-the-setup}

Только последние три строки файла действительно тестируют компонент — и всё, что они делают, — утверждают, что Angular может создать этот компонент.

Остальная часть файла — шаблонный код настройки, предназначенный для более сложных тестов, которые _могут_ понадобиться, если компонент значительно вырастет.

Вы познакомитесь с расширенными возможностями тестирования в следующих разделах.
А пока можно радикально сократить тестовый файл до более управляемого размера:

```ts
describe('Banner (minimal)', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(Banner);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
  });
});
```

Позднее вы будете вызывать `TestBed.configureTestingModule()` с `imports`, `providers` и другими объявлениями в соответствии с потребностями тестирования.
Необязательные методы `override` позволяют дополнительно настроить конфигурацию.

NOTE: `TestBed.compileComponents` требуется только тогда, когда в тестируемых компонентах используются блоки `@defer`.

### `createComponent()` {#createcomponent}

После настройки `TestBed` вызовите его метод `createComponent()`.

```ts
const fixture = TestBed.createComponent(Banner);
```

`TestBed.createComponent()` создаёт экземпляр компонента `Banner`, добавляет соответствующий элемент в DOM тест-раннера и возвращает [`ComponentFixture`](#componentfixture).

IMPORTANT: Не перенастраивайте `TestBed` после вызова `createComponent`.

Метод `createComponent` замораживает текущее определение `TestBed`, закрывая его для дальнейшей конфигурации.

Нельзя вызывать какие-либо методы конфигурации `TestBed`: ни `configureTestingModule()`, ни `get()`, ни любой из методов `override...`.
Попытка сделать это приведёт к ошибке.

### `ComponentFixture` {#componentfixture}

[`ComponentFixture`](api/core/testing/ComponentFixture) — это Harness для взаимодействия с созданным компонентом и его соответствующим элементом.

Получите экземпляр компонента через fixture и убедитесь в его существовании с помощью утверждения:

```ts
const component = fixture.componentInstance;
expect(component).toBeDefined();
```

### `beforeEach()` {#beforeeach}

По мере развития компонента вы будете добавлять всё больше тестов.
Чтобы не дублировать конфигурацию `TestBed` для каждого теста, перенесите настройку в `beforeEach()` с несколькими вспомогательными переменными:

```ts
describe('Banner (with beforeEach)', () => {
  let component: Banner;
  let fixture: ComponentFixture<Banner>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Banner);
    component = fixture.componentInstance;

    await fixture.whenStable(); // necessary to wait for the initial rendering
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
```

HELPFUL: Ожидание начального рендеринга в `beforeEach` через `await fixture.whenStable` делает отдельные тесты синхронными.

Теперь добавьте тест, который получает элемент компонента из `fixture.nativeElement` и ищет ожидаемый текст.

```ts
it('should contain "banner works!"', () => {
  const bannerElement: HTMLElement = fixture.nativeElement;
  expect(bannerElement.textContent).toContain('banner works!');
});
```

### Создание функции `setup` {#create-a-setup-function}

В качестве альтернативы `beforeEach` можно создать функцию `setup`, которую вы будете вызывать в каждом тесте.
Преимущество функции `setup` — возможность настройки через параметры.

Пример того, как может выглядеть функция `setup`:

```ts
function setup(providers?: StaticProviders[]): ComponentFixture<Banner> {
  TestBed.configureTestingModule({providers});
  return TestBed.createComponent(Banner);
}
```

### `nativeElement` {#nativeelement}

Значение `ComponentFixture.nativeElement` имеет тип `any`.
Позднее вы встретите `DebugElement.nativeElement`, который тоже имеет тип `any`.

Angular не может знать на этапе компиляции, какой именно HTML-элемент представляет собой `nativeElement` и является ли он вообще HTML-элементом.
Приложение может выполняться на _платформе без браузера_, например на сервере или в среде Node, где у элемента может быть ограниченный API или он вообще может отсутствовать.

Тесты в этом руководстве разработаны для запуска в браузере, поэтому `nativeElement` здесь всегда будет `HTMLElement` или одним из его производных классов.

Зная, что это `HTMLElement` некоторого типа, используйте стандартный `querySelector`, чтобы углубиться в дерево элементов.

Вот ещё один тест, вызывающий `HTMLElement.querySelector` для получения элемента абзаца и поиска текста баннера:

```ts
it('should have <p> with "banner works!"', () => {
  const bannerElement: HTMLElement = fixture.nativeElement;
  const p = bannerElement.querySelector('p')!;
  expect(p.textContent).toEqual('banner works!');
});
```

### `DebugElement` {#debugelement}

Angular _fixture_ предоставляет элемент компонента напрямую через `fixture.nativeElement`.

```ts
const bannerElement: HTMLElement = fixture.nativeElement;
```

На самом деле это удобный метод, реализованный как `fixture.debugElement.nativeElement`.

```ts
const bannerDe: DebugElement = fixture.debugElement;
const bannerEl: HTMLElement = bannerDe.nativeElement;
```

Существует веская причина для такого обходного пути к элементу.

Свойства `nativeElement` зависят от среды выполнения.
Тесты могут выполняться на _платформе без браузера_, которая не имеет DOM или чья DOM-эмуляция не поддерживает полный API `HTMLElement`.

Angular использует абстракцию `DebugElement` для безопасной работы на _всех поддерживаемых платформах_.
Вместо создания дерева HTML-элементов Angular создаёт дерево `DebugElement`, оборачивающее _нативные элементы_ текущей платформы.
Свойство `nativeElement` разворачивает `DebugElement` и возвращает платформенно-специфичный объект элемента.

Поскольку примеры тестов в этом руководстве рассчитаны на запуск только в браузере, `nativeElement` в них всегда является `HTMLElement` с привычными методами и свойствами.

Вот предыдущий тест, переписанный с использованием `fixture.debugElement.nativeElement`:

```ts
it('should find the <p> with fixture.debugElement.nativeElement', () => {
  const bannerDe: DebugElement = fixture.debugElement;
  const bannerEl: HTMLElement = bannerDe.nativeElement;
  const p = bannerEl.querySelector('p')!;
  expect(p.textContent).toEqual('banner works!');
});
```

У `DebugElement` есть другие методы и свойства, полезные в тестах, которые будут рассмотрены далее в этом руководстве.

`DebugElement` импортируется из основной библиотеки Angular.

```ts
import {DebugElement} from '@angular/core';
```

### `By.css()` {#bycss}

Хотя все тесты в этом руководстве запускаются в браузере, некоторые приложения могут хотя бы иногда работать на другой платформе.

Например, компонент может сначала рендериться на сервере как часть стратегии ускорения запуска приложения на устройствах с медленным соединением.
Серверный рендеринг может не поддерживать полный API HTML-элементов.
Если он не поддерживает `querySelector`, предыдущий тест завершится неудачей.

`DebugElement` предлагает методы запроса, работающие на всех поддерживаемых платформах.
Эти методы принимают функцию-_предикат_, возвращающую `true`, когда узел в дереве `DebugElement` соответствует критериям выборки.

Предикат создаётся с помощью класса `By`, импортированного из библиотеки для текущей платформы.
Вот импорт `By` для браузерной платформы:

```ts
import {By} from '@angular/platform-browser';
```

Следующий пример переписывает предыдущий тест с использованием `DebugElement.query()` и метода `By.css` для браузера.

```ts
it('should find the <p> with fixture.debugElement.query(By.css)', () => {
  const bannerDe: DebugElement = fixture.debugElement;
  const paragraphDe = bannerDe.query(By.css('p'));
  const p: HTMLElement = paragraphDe.nativeElement;
  expect(p.textContent).toEqual('banner works!');
});
```

Несколько примечательных наблюдений:

- Статический метод `By.css()` выбирает узлы `DebugElement` с помощью [стандартного CSS-селектора](https://developer.mozilla.org/docs/Learn/CSS/Building_blocks/Selectors 'CSS selectors').
- Запрос возвращает `DebugElement` для абзаца.
- Необходимо развернуть этот результат, чтобы получить элемент абзаца.

Если вы фильтруете по CSS-селектору и тестируете только свойства _нативного элемента_ браузера, подход с `By.css` может быть излишним.

Зачастую удобнее и нагляднее фильтровать с помощью стандартного метода `HTMLElement`, такого как `querySelector()` или `querySelectorAll()`.
