# Основы тестирования компонентов {#basics-of-testing-components}

Компонент, в отличие от всех других частей Angular-приложения, объединяет HTML-шаблон и класс TypeScript.
Компонент — это именно шаблон и класс, _работающие вместе_.
Для полноценного тестирования компонента следует проверять их совместную работу.

Такие тесты требуют создания хост-элемента компонента в DOM браузера, как это делает Angular, и изучения взаимодействия класса компонента с DOM в соответствии с описанием шаблона.

Angular `TestBed` упрощает такой вид тестирования, как показано в следующих разделах.
Однако во многих случаях _тестирование только класса компонента_, без участия DOM, может достаточно полно проверить поведение компонента — более прямолинейным и очевидным способом.

## DOM-тестирование компонентов {#component-dom-testing}

Компонент — это нечто большее, чем просто его класс.
Компонент взаимодействует с DOM и с другими компонентами.
Одни только классы не могут сказать вам, будет ли компонент корректно отображаться, реагировать на действия пользователя и жесты или взаимодействовать с родительскими и дочерними компонентами.

- Связан ли `Lightswitch.clicked()` с чем-либо, чтобы пользователь мог его вызвать?
- Отображается ли `Lightswitch.message`?
- Может ли пользователь фактически выбрать героя, отображаемого компонентом `DashboardHero`?
- Отображается ли имя героя ожидаемым образом (например, в верхнем регистре)?
- Отображается ли приветственное сообщение шаблоном компонента `Welcome`?

Для простых компонентов, описанных выше, это, возможно, не является проблемными вопросами.
Однако многие компоненты имеют сложные взаимодействия с элементами DOM, описанными в их шаблонах, из-за чего HTML появляется и исчезает по мере изменения состояния компонента.

Чтобы ответить на подобные вопросы, нужно создать элементы DOM, связанные с компонентами, исследовать DOM для подтверждения, что состояние компонента отображается корректно в нужные моменты, и имитировать взаимодействие пользователя с экраном для определения того, приводят ли эти взаимодействия к ожидаемому поведению компонента.

Для написания таких тестов используются дополнительные возможности `TestBed`, а также другие вспомогательные инструменты для тестирования.

### Тесты, сгенерированные CLI {#cli-generated-tests}

CLI по умолчанию создаёт начальный тестовый файл при генерации нового компонента.

Например, следующая команда CLI генерирует компонент `Banner` в папке `app/banner` (со встроенным шаблоном и стилями):

```shell
ng generate component banner --inline-template --inline-style
```

Также генерируется начальный тестовый файл для компонента `banner.spec.ts`, который выглядит следующим образом:

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

Только последние три строки этого файла фактически тестируют компонент, и всё, что они делают — это проверка того, что Angular может создать компонент.

Остальная часть файла — это шаблонный код настройки, рассчитанный на более продвинутые тесты, которые _могут_ потребоваться по мере развития компонента.

Об этих продвинутых возможностях тестирования вы узнаете в следующих разделах.
Пока что вы можете значительно сократить этот тестовый файл до более управляемого размера:

```ts
describe('Banner (minimal)', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(Banner);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
  });
});
```

Позже вы будете вызывать `TestBed.configureTestingModule()` с импортами, провайдерами и другими объявлениями для ваших нужд тестирования.
Дополнительные методы `override` позволяют тонко настроить аспекты конфигурации.

ПРИМЕЧАНИЕ: `TestBed.compileComponents` требуется только при использовании блоков `@defer` в тестируемых компонентах.

### `createComponent()` {#createcomponent}

После настройки `TestBed` вызываете его метод `createComponent()`.

```ts
const fixture = TestBed.createComponent(Banner);
```

`TestBed.createComponent()` создаёт экземпляр компонента `Banner`, добавляет соответствующий элемент в DOM средства запуска тестов и возвращает [`ComponentFixture`](#componentfixture).

ВАЖНО: Не изменяйте конфигурацию `TestBed` после вызова `createComponent`.

Метод `createComponent` фиксирует текущее определение `TestBed`, закрывая его для дальнейшей настройки.

Нельзя вызывать какие-либо методы конфигурации `TestBed`: ни `configureTestingModule()`, ни `get()`, ни какой-либо из методов `override...`.
При попытке это сделать `TestBed` выдаст ошибку.

### `ComponentFixture` {#componentfixture}

[`ComponentFixture`](api/core/testing/ComponentFixture) — это тестовый harness для взаимодействия с созданным компонентом и соответствующим ему элементом.

Получите доступ к экземпляру компонента через fixture и проверьте его существование:

```ts
const component = fixture.componentInstance;
expect(component).toBeDefined();
```

### `beforeEach()` {#beforeeach}

По мере развития компонента вы будете добавлять больше тестов.
Вместо дублирования конфигурации `TestBed` для каждого теста выполните рефакторинг, вынося настройку в `beforeEach()` и вспомогательные переменные:

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

ПОЛЕЗНО: Ожидая начального рендеринга в `beforeEach` с помощью `await fixture.whenStable`, отдельные тесты становятся синхронными.

Теперь добавьте тест, который получает элемент компонента из `fixture.nativeElement` и ищет ожидаемый текст.

```ts
it('should contain "banner works!"', () => {
  const bannerElement: HTMLElement = fixture.nativeElement;
  expect(bannerElement.textContent).toContain('banner works!');
});
```

### Создание функции `setup` {#create-a-setup-function}

В качестве альтернативы `beforeEach` вы также можете создать функцию setup, которую будете вызывать в каждом тесте.
Преимущество функции setup в том, что её можно настраивать через параметры.

Вот пример того, как может выглядеть функция setup:

```ts
function setup(providers?: StaticProviders[]): ComponentFixture<Banner> {
  TestBed.configureTestingModule({providers});
  return TestBed.createComponent(Banner);
}
```

### `nativeElement` {#nativeelement}

Значение `ComponentFixture.nativeElement` имеет тип `any`.
Позже вы встретите `DebugElement.nativeElement`, который также имеет тип `any`.

Angular не может знать во время компиляции, каким HTML-элементом является `nativeElement`, или вообще является ли он HTML-элементом.
Приложение может работать на _платформе, отличной от браузера_, например на сервере или в среде Node, где элемент может иметь ограниченный API или вовсе отсутствовать.

Тесты в этом руководстве рассчитаны на работу в браузере, поэтому значение `nativeElement` всегда будет `HTMLElement` или одним из его производных классов.

Зная, что это `HTMLElement` какого-то типа, используйте стандартный HTML-метод `querySelector` для более глубокого проникновения в дерево элементов.

Вот ещё один тест, который вызывает `HTMLElement.querySelector` для получения параграфа и поиска текста баннера:

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

Для такого обходного пути к элементу есть веская причина.

Свойства `nativeElement` зависят от среды выполнения.
Тесты могут запускаться на _платформе без браузера_, у которой нет DOM или чья эмуляция DOM не поддерживает полный API `HTMLElement`.

Angular использует абстракцию `DebugElement` для безопасной работы на _всех поддерживаемых платформах_.
Вместо создания дерева HTML-элементов Angular создаёт дерево `DebugElement`, которое оборачивает _нативные элементы_ для платформы выполнения.
Свойство `nativeElement` разворачивает `DebugElement` и возвращает объект элемента, специфичный для платформы.

Поскольку примеры тестов в этом руководстве рассчитаны только на браузер, `nativeElement` в этих тестах всегда является `HTMLElement`, знакомые методы и свойства которого можно исследовать в тесте.

Вот предыдущий тест, переписанный с использованием `fixture.debugElement.nativeElement`:

```ts
it('should find the <p> with fixture.debugElement.nativeElement', () => {
  const bannerDe: DebugElement = fixture.debugElement;
  const bannerEl: HTMLElement = bannerDe.nativeElement;
  const p = bannerEl.querySelector('p')!;
  expect(p.textContent).toEqual('banner works!');
});
```

`DebugElement` имеет и другие методы и свойства, полезные в тестах, как вы увидите в других частях этого руководства.

`DebugElement` импортируется из основной библиотеки Angular.

```ts
import {DebugElement} from '@angular/core';
```

### `By.css()` {#bycss}

Хотя тесты в этом руководстве запускаются в браузере, некоторые приложения могут работать на другой платформе хотя бы часть времени.

Например, компонент может сначала отрисовываться на сервере как часть стратегии ускорения загрузки на устройствах с плохим соединением.
Серверный рендерер может не поддерживать полный API HTML-элементов.
Если он не поддерживает `querySelector`, предыдущий тест может завершиться ошибкой.

`DebugElement` предлагает методы запроса, работающие на всех поддерживаемых платформах.
Эти методы принимают _предикат_ — функцию, которая возвращает `true`, когда узел в дереве `DebugElement` соответствует критериям выборки.

Предикат создаётся с помощью класса `By`, импортированного из библиотеки для платформы выполнения.
Вот импорт `By` для браузерной платформы:

```ts
import {By} from '@angular/platform-browser';
```

В следующем примере предыдущий тест переписан с использованием `DebugElement.query()` и метода `By.css` браузера.

```ts
it('should find the <p> with fixture.debugElement.query(By.css)', () => {
  const bannerDe: DebugElement = fixture.debugElement;
  const paragraphDe = bannerDe.query(By.css('p'));
  const p: HTMLElement = paragraphDe.nativeElement;
  expect(p.textContent).toEqual('banner works!');
});
```

Несколько важных замечаний:

- Статический метод `By.css()` выбирает узлы `DebugElement` с помощью [стандартных CSS-селекторов](https://developer.mozilla.org/docs/Learn/CSS/Building_blocks/Selectors 'CSS selectors').
- Запрос возвращает `DebugElement` для параграфа.
- Нужно развернуть этот результат для получения элемента параграфа.

Если фильтрация выполняется по CSS-селектору и проверяются только свойства нативного элемента браузера, подход `By.css` может быть избыточным.

Зачастую более прямолинейно и понятно использовать стандартный метод `HTMLElement`, такой как `querySelector()` или `querySelectorAll()`.
