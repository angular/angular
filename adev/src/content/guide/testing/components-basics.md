# Основы тестирования компонентов

Компонент, в отличие от всех остальных частей приложения Angular, объединяет HTML-шаблон и класс TypeScript.
Компонент — это действительно шаблон и класс, _работающие вместе_.
Чтобы адекватно протестировать компонент, нужно проверить, что они работают вместе как задумано.

Такие тесты требуют создания host-элемента компонента в DOM браузера, как это делает Angular, и исследования взаимодействия класса компонента с DOM, описанного его шаблоном.

Angular `TestBed` упрощает такого рода тестирование, как вы увидите в следующих разделах.
Но во многих случаях _тестирование только класса компонента_, без участия DOM, может подтвердить большую часть поведения компонента более прямолинейным и очевидным способом.

## Тестирование DOM компонента {#component-dom-testing}

Компонент — это больше, чем просто его класс.
Компонент взаимодействует с DOM и с другими компонентами.
Одни только классы не скажут вам, будет ли компонент корректно рендериться, реагировать на пользовательский ввод и жесты или интегрироваться с родительскими и дочерними компонентами.

- Привязан ли `Lightswitch.clicked()` к чему-либо так, что пользователь может его вызвать?
- Отображается ли `Lightswitch.message`?
- Может ли пользователь действительно выбрать героя, отображаемого компонентом `DashboardHero`?
- Отображается ли имя героя как ожидается \(например, в верхнем регистре\)?
- Отображается ли приветственное сообщение шаблоном компонента `Welcome`?

Для простых компонентов из предыдущих примеров эти вопросы могут не вызывать беспокойства.
Но многие компоненты имеют сложные взаимодействия с DOM-элементами, описанными в их шаблонах, из-за чего HTML появляется и исчезает при изменении состояния компонента.

Чтобы ответить на такие вопросы, нужно создать DOM-элементы, связанные с компонентами, исследовать DOM, чтобы подтвердить, что состояние компонента отображается корректно в нужные моменты, и симулировать взаимодействие пользователя с экраном, чтобы определить, вызывают ли эти взаимодействия ожидаемое поведение компонента.

Чтобы писать такие тесты, вы будете использовать дополнительные возможности `TestBed`, а также другие вспомогательные средства тестирования.

### Тесты, сгенерированные CLI {#cli-generated-tests}

CLI по умолчанию создаёт начальный тестовый файл, когда вы просите сгенерировать новый компонент.

Например, следующая команда CLI генерирует компонент `Banner` в папке `app/banner` \(с inline-шаблоном и стилями\):

```shell
ng generate component banner --inline-template --inline-style
```

Она также генерирует начальный тестовый файл для компонента, `banner.spec.ts`, который выглядит так:

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Banner} from './banner';

describe('Banner', () => {
  let component: Banner;
  let fixture: ComponentFixture<Banner>;

  beforeEach(async () => {
    TestBed.configureTestingModule({});

    fixture = TestBed.createComponent(Banner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Уменьшение setup {#reduce-the-setup}

Только последние три строки этого файла действительно тестируют компонент, и всё, что они делают — утверждают, что Angular может создать компонент.

Остальная часть файла — шаблонный код setup в ожидании более продвинутых тестов, которые _могут_ понадобиться, если компонент разовьётся во что-то существенное.

Вы узнаете об этих продвинутых возможностях тестирования в следующих разделах.
Пока можно радикально сократить этот тестовый файл до более управляемого размера:

```ts
describe('Banner (minimal)', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(Banner);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
  });
});
```

Позже вы вызовете `TestBed.configureTestingModule()` с imports, providers и другими declarations под ваши нужды тестирования.
Опциональные методы `override` могут дополнительно тонко настроить аспекты конфигурации.

NOTE: `TestBed.compileComponents` требуется только когда в тестируемых компонентах используются блоки `@defer`.

### `createComponent()` {#createcomponent}

После настройки `TestBed` вы вызываете его метод `createComponent()`.

```ts
const fixture = TestBed.createComponent(Banner);
```

`TestBed.createComponent()` создаёт экземпляр компонента `Banner`, добавляет соответствующий элемент в DOM test-runner и возвращает [`ComponentFixture`](#componentfixture).

IMPORTANT: Не перенастраивайте `TestBed` после вызова `createComponent`.

Метод `createComponent` фиксирует текущее определение `TestBed`, закрывая его для дальнейшей конфигурации.

Вы не можете вызывать больше методов конфигурации `TestBed` — ни `configureTestingModule()`, ни `get()`, ни какие-либо из методов `override...`.
Если попробуете, `TestBed` выбросит ошибку.

### `ComponentFixture` {#componentfixture}

[`ComponentFixture`](api/core/testing/ComponentFixture) — это test harness для взаимодействия с созданным компонентом и его соответствующим элементом.

Получите доступ к экземпляру компонента через fixture и подтвердите, что он существует, с помощью expectation:

```ts
const component = fixture.componentInstance;
expect(component).toBeDefined();
```

### `beforeEach()` {#beforeeach}

Вы будете добавлять больше тестов по мере развития этого компонента.
Вместо дублирования конфигурации `TestBed` для каждого теста сделайте рефакторинг: вынесите setup в `beforeEach()` и несколько вспомогательных переменных:

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

HELPFUL: Ожидая начальный рендеринг в `beforeEach` с `await fixture.whenStable`, отдельные тесты становятся синхронными.

Теперь добавьте тест, который получает элемент компонента из `fixture.nativeElement` и ищет ожидаемый текст.

```ts
it('should contain "banner works!"', () => {
  const bannerElement: HTMLElement = fixture.nativeElement;
  expect(bannerElement.textContent).toContain('banner works!');
});
```

### создание функции `setup` {#create-a-setup-function}

Как альтернативу `beforeEach` можно также создать функцию setup, которую вы будете вызывать в каждом тесте.
Функция setup имеет преимущество настраиваемости через параметры.

Вот пример того, как может выглядеть функция setup:

```ts
function setup(providers?: StaticProviders[]): ComponentFixture<Banner> {
  TestBed.configureTestingModule({providers});
  return TestBed.createComponent(Banner);
}
```

### `nativeElement` {#nativeelement}

Значение `ComponentFixture.nativeElement` имеет тип `any`.
Позже вы встретите `DebugElement.nativeElement`, и у него тоже тип `any`.

Angular не может знать на этапе компиляции, какого рода HTML-элемент представляет `nativeElement` и является ли он вообще HTML-элементом.
Приложение может работать на _не-браузерной платформе_, например на сервере или в node-окружении, где у элемента может быть урезанный API или он может вовсе не существовать.

Тесты в этом руководстве рассчитаны на запуск в браузере, поэтому значение `nativeElement` всегда будет `HTMLElement` или одним из его производных классов.

Зная, что это `HTMLElement` какого-то рода, используйте стандартный HTML `querySelector`, чтобы углубиться в дерево элементов.

Вот ещё один тест, который вызывает `HTMLElement.querySelector`, чтобы получить элемент paragraph и найти текст баннера:

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

Есть веская причина для такого окольного пути к элементу.

Свойства `nativeElement` зависят от runtime-окружения.
Вы можете запускать эти тесты на _не-браузерной_ платформе, у которой нет DOM или чья эмуляция DOM не поддерживает полный API `HTMLElement`.

Angular опирается на абстракцию `DebugElement`, чтобы безопасно работать на _всех поддерживаемых платформах_.
Вместо создания дерева HTML-элементов Angular создаёт дерево `DebugElement`, которое оборачивает _native elements_ для runtime-платформы.
Свойство `nativeElement` разворачивает `DebugElement` и возвращает объект элемента, специфичный для платформы.

Поскольку примеры тестов для этого руководства рассчитаны на запуск только в браузере, `nativeElement` в этих тестах всегда является `HTMLElement`, чьи знакомые методы и свойства вы можете исследовать в тесте.

Вот предыдущий тест, переписанный с `fixture.debugElement.nativeElement`:

```ts
it('should find the <p> with fixture.debugElement.nativeElement', () => {
  const bannerDe: DebugElement = fixture.debugElement;
  const bannerEl: HTMLElement = bannerDe.nativeElement;
  const p = bannerEl.querySelector('p')!;
  expect(p.textContent).toEqual('banner works!');
});
```

У `DebugElement` есть и другие методы и свойства, полезные в тестах, как вы увидите в других местах этого руководства.

Вы импортируете символ `DebugElement` из основной библиотеки Angular.

```ts
import {DebugElement} from '@angular/core';
```

### `By.css()` {#bycss}

Хотя тесты в этом руководстве все запускаются в браузере, некоторые приложения могут хотя бы иногда работать на другой платформе.

Например, компонент может сначала рендериться на сервере как часть стратегии, чтобы приложение быстрее запускалось на устройствах с плохим соединением.
Server-side renderer может не поддерживать полный API HTML-элементов.
Если он не поддерживает `querySelector`, предыдущий тест может упасть.

`DebugElement` предлагает методы запросов, которые работают на всех поддерживаемых платформах.
Эти методы запросов принимают функцию-_предикат_, которая возвращает `true`, когда узел в дереве `DebugElement` соответствует критериям выбора.

Вы создаёте _предикат_ с помощью класса `By`, импортированного из библиотеки для runtime-платформы.
Вот импорт `By` для браузерной платформы:

```ts
import {By} from '@angular/platform-browser';
```

Следующий пример переписывает предыдущий тест с `DebugElement.query()` и методом браузера `By.css`.

```ts
it('should find the <p> with fixture.debugElement.query(By.css)', () => {
  const bannerDe: DebugElement = fixture.debugElement;
  const paragraphDe = bannerDe.query(By.css('p'));
  const p: HTMLElement = paragraphDe.nativeElement;
  expect(p.textContent).toEqual('banner works!');
});
```

Несколько важных наблюдений:

- Статический метод `By.css()` выбирает узлы `DebugElement` со [стандартным CSS-селектором](https://developer.mozilla.org/docs/Learn/CSS/Building_blocks/Selectors 'CSS selectors').
- Запрос возвращает `DebugElement` для paragraph.
- Нужно развернуть этот результат, чтобы получить элемент paragraph.

Когда вы фильтруете по CSS-селектору и тестируете только свойства _native element_ браузера, подход `By.css` может быть избыточным.

Часто проще и понятнее фильтровать стандартным методом `HTMLElement`, таким как `querySelector()` или `querySelectorAll()`.
