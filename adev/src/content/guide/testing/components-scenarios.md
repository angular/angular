# Сценарии тестирования компонентов {#component-testing-scenarios}

В этом руководстве рассматриваются распространённые сценарии тестирования компонентов.

## Привязка данных компонента {#component-binding}

В примере приложения компонент `Banner` отображает статический текст заголовка в HTML-шаблоне.

После нескольких изменений компонент `Banner` отображает динамический заголовок, привязываясь к свойству `title` компонента следующим образом.

```angular-ts {header="banner.ts"}
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-banner',
  template: '<h1>{{ title() }}</h1>',
  styles: ['h1 { color: green; font-size: 350%}'],
})
export class Banner {
  title = signal('Test Tour of Heroes');
}
```

Хотя это и минимальный пример, вы решаете добавить тест, который подтверждает, что компонент действительно отображает нужный контент там, где ожидается.

### Запрос элемента `<h1>` {#query-for-the-h1}

Напишите последовательность тестов, которые проверяют значение элемента `<h1>`, оборачивающего интерполяцию привязки свойства _title_.

Обновите `beforeEach`, чтобы найти этот элемент стандартным `querySelector` и присвоить его переменной `h1`.

```ts {header: "banner.component.spec.ts"}
let component: Banner;
let fixture: ComponentFixture<Banner>;
let h1: HTMLElement;

beforeEach(() => {
  fixture = TestBed.createComponent(Banner);
  component = fixture.componentInstance; // Banner test instance
  h1 = fixture.nativeElement.querySelector('h1');
});
```

### `createComponent()` не выполняет привязку данных {#createcomponent-does-not-bind-data}

В первом тесте нужно убедиться, что на экране отображается `title` по умолчанию.
Инстинктивно хочется написать тест, который сразу проверяет `<h1>`:

```ts
it('should display original title', () => {
  expect(h1.textContent).toContain(component.title());
});
```

_Этот тест не проходит_ с сообщением:

```shell {hideCopy}
expected '' to contain 'Test Tour of Heroes'.
```

Привязка происходит, когда Angular выполняет **обнаружение изменений**.

В продакшне обнаружение изменений запускается автоматически, когда Angular создаёт компонент или пользователь нажимает клавишу, например.

`TestBed.createComponent` не запускает обнаружение изменений синхронно — это подтверждается в исправленном тесте:

```ts
it('no title in the DOM after createComponent()', () => {
  expect(h1.textContent).toEqual('');
});
```

### `whenStable()` {#whenstable}

Можно указать `TestBed` дождаться выполнения обнаружения изменений с помощью `await fixture.whenStable()`.
Только после этого `<h1>` будет содержать ожидаемый заголовок.

```ts
it('should display original title', async () => {
  await fixture.whenStable();
  expect(h1.textContent).toContain(component.title());
});
```

Отложенное обнаружение изменений — намеренное и полезное поведение.
Оно даёт тестировщику возможность проверить и изменить состояние компонента _до того, как Angular инициирует привязку данных и вызовет [хуки жизненного цикла](guide/components/lifecycle)_.

Вот ещё один тест, который изменяет свойство `title` компонента _до_ вызова `fixture.whenStable()`.

```ts
it('should display a different test title', async () => {
  component.title.set('Test Title');
  await fixture.whenStable();
  expect(h1.textContent).toContain('Test Title');
});
```

### Привязка сигналов к входным данным {#binding-signals-to-inputs}

Для отражения изменений входных данных и обработки выходных событий можно динамически привязывать сигналы к входным данным и функции к выходным событиям.

```ts
import {inputBinding, outputBinding} from '@angular/core';

const fixture = TestBed.createComponent(ValueDisplay, {
  bindings: [
    inputBinding('value', value),
    outputBinding('valueChange', () =>  (/* ... */) ),
  ],
});
```

### Изменение значения входных данных с помощью `dispatchEvent()` {#change-an-input-value-with-dispatchevent}

Для имитации пользовательского ввода найдите элемент input и установите его свойство `value`.

Но здесь есть важный промежуточный шаг.

Angular не знает, что вы установили свойство `value` элемента input.
Он не считает это свойство, пока вы не вызовете событие `input` элемента через `dispatchEvent()`.

Следующий пример с компонентом, использующим `TitleCasePipe`, демонстрирует правильную последовательность.

```ts
it('should convert hero name to Title Case', async () => {
  const hostElement = fixture.nativeElement;
  const nameInput: HTMLInputElement = hostElement.querySelector('input')!;
  const nameDisplay: HTMLElement = hostElement.querySelector('span')!;

  // simulate user entering a new name into the input box
  nameInput.value = 'quick BROWN  fOx';

  // Dispatch a DOM event so that Angular learns of input value change.
  nameInput.dispatchEvent(new Event('input'));

  // Wait for Angular to update the display binding through the title pipe
  await fixture.whenStable();

  expect(nameDisplay.textContent).toBe('Quick Brown  Fox');
});
```

## Компонент с зависимостью {#component-with-a-dependency}

Компоненты часто имеют зависимости от сервисов.

Компонент `Welcome` отображает приветственное сообщение авторизованному пользователю.
Он знает, кто является пользователем, на основе свойства внедрённого `UserAuthentication`:

```angular-ts
import {Component, inject, OnInit, signal} from '@angular/core';
import {UserAuthentication} from '../model/user.authentication';

@Component({
  selector: 'app-welcome',
  template: '<h3 class="welcome"><i>{{ welcome() }}</i></h3>',
})
export class Welcome {
  private userAuth = inject(UserAuthentication);
  welcome = signal(
    this.userAuth.isLoggedIn() ? `Welcome, ${this.userAuth.user().name}` : 'Please log in.',
  );
}
```

Компонент `Welcome` содержит логику принятия решений, взаимодействующую с сервисом, — эту логику стоит протестировать.

### Предоставление тестовых заглушек сервисов {#provide-service-test-doubles}

_Тестируемому компоненту_ не обязательно предоставлять реальные сервисы.

Внедрение реального `UserAuthentication` может быть затруднено.
Реальный сервис может запрашивать у пользователя учётные данные и пытаться обратиться к серверу аутентификации.
Эти действия сложно перехватить. Имейте в виду, что использование тестовых заглушек делает поведение теста отличным от продакшн-среды, поэтому применяйте их умеренно.

### Получение внедрённых сервисов {#get-injected-services}

Тестам нужен доступ к `UserAuthentication`, внедрённому в компонент `Welcome`.

Angular имеет иерархическую систему инъекций.
Инжекторы могут находиться на нескольких уровнях — от корневого инжектора, созданного `TestBed`, до дерева компонентов.

Безопасный способ получить внедрённый сервис, который **_всегда работает_**, — это **получить его из инжектора _тестируемого компонента_**.
Инжектор компонента является свойством `DebugElement` fixture.

```ts
// UserAuthentication actually injected into the component
userAuth = fixture.debugElement.injector.get(UserAuthentication);
```

ПОЛЕЗНО: Обычно это _не нужно_. Сервисы часто предоставляются в корне или через переопределения TestBed и могут быть получены проще с помощью `TestBed.inject()` (см. ниже).

### `TestBed.inject()` {#testbed-inject}

Это легче запомнить и менее многословно, чем получение сервиса через `DebugElement` fixture.

В этом наборе тестов единственный провайдер `UserAuthentication` — это корневой тестовый модуль, поэтому безопасно вызывать `TestBed.inject()` следующим образом:

```ts
userAuth = TestBed.inject(UserAuthentication);
```

ПОЛЕЗНО: Для случая, когда `TestBed.inject()` не работает, см. раздел [_Переопределение провайдеров компонента_](#override-component-providers), который объясняет, когда и почему необходимо получать сервис из инжектора компонента.

### Окончательная настройка и тесты {#final-setup-and-tests}

Вот полный `beforeEach()` с использованием `TestBed.inject()`:

```ts
let fixture: ComponentFixture<Welcome>;
let comp: Welcome;
let userAuth: UserAuthentication; // the TestBed injected service
let el: HTMLElement; // the DOM element with the welcome message

beforeEach(() => {
  fixture = TestBed.createComponent(Welcome);
  comp = fixture.componentInstance;

  // UserAuthentication from the root injector
  userAuth = TestBed.inject(UserAuthentication);

  //  get the "welcome" element by CSS selector (e.g., by class name)
  el = fixture.nativeElement.querySelector('.welcome');
});
```

А вот несколько тестов:

```ts
it('should welcome the user', async () => {
  await fixture.whenStable();
  const content = el.textContent;

  expect(content, '"Welcome ..."').toContain('Welcome');
  expect(content, 'expected name').toContain('Test User');
});

it('should welcome "Bubba"', async () => {
  userAuth.user.set({name: 'Bubba'}); // welcome message hasn't been shown yet
  await fixture.whenStable();

  expect(el.textContent).toContain('Bubba');
});

it('should request login if not logged in', async () => {
  userAuth.isLoggedIn.set(false); // welcome message hasn't been shown yet
  await fixture.whenStable();
  const content = el.textContent;

  expect(content, 'not welcomed').not.toContain('Welcome');
  expect(content, '"log in"').toMatch(/log in/i);
});
```

Первый — это тест на вменяемость; он подтверждает, что `UserAuthentication` вызывается и работает.

ПОЛЕЗНО: Второй аргумент `expect` \(например, `'expected name'`\) — необязательная метка сбоя.
Если ожидание не выполняется, Vitest добавляет эту метку к сообщению об ошибке ожидания.
В спецификации с несколькими ожиданиями это помогает прояснить, что пошло не так и какое ожидание не выполнилось.

Остальные тесты подтверждают логику компонента, когда сервис возвращает разные значения.
Второй тест проверяет эффект изменения имени пользователя.
Третий тест проверяет, что компонент отображает правильное сообщение при отсутствии авторизованного пользователя.

## Компонент с асинхронным сервисом {#component-with-async-service}

В этом примере шаблон компонента `About` содержит компонент `Twain`.
Компонент `Twain` отображает цитаты Марка Твена.

```angular-html
<p class="twain">
  <i>{{ quote | async }}</i>
</p>
<button type="button" (click)="getQuote()">Next quote</button>
@if (errorMessage()) {
  <p class="error">{{ errorMessage() }}</p>
}
```

ПОЛЕЗНО: Значение свойства `quote` компонента передаётся через `AsyncPipe`.
Это означает, что свойство возвращает либо `Promise`, либо `Observable`.

В этом примере метод `TwainQuotes.getQuote()` говорит о том, что свойство `quote` возвращает `Observable`.

```ts
getQuote() {
  this.errorMessage.set('');
  this.quote = this.twainQuotes.getQuote().pipe(
    startWith('...'),
    catchError((err: any) => {
      this.errorMessage.set(err.message || err.toString());
      return of('...'); // reset message to placeholder
    }),
  );
}
```

Компонент `Twain` получает цитаты из внедрённого `TwainQuotes`.
Компонент начинает возвращаемый `Observable` со значения-заполнителя \(`'...'`\) до того, как сервис вернёт первую цитату.

`catchError` перехватывает ошибки сервиса, формирует сообщение об ошибке и возвращает значение-заполнитель в канал успеха.

Все эти функции нужно протестировать.

### Тестирование путём мокирования HTTP-запросов с помощью `HttpTestingController` {#testing-by-mocking-http-requests-with-the-httptestingcontroller}

При тестировании компонента важен только публичный API сервиса.
В общем случае тесты не должны выполнять реальные вызовы к удалённым серверам.
Они должны эмулировать такие вызовы.

Если асинхронный сервис использует `HttpClient` для загрузки удалённых данных, рекомендуется возвращать мок-ответы на уровне HTTP с помощью `HttpTestingController`.

Подробнее о мокировании `HttpBackend` см. в [специальном руководстве](guide/http/testing).

### Тестирование путём предоставления заглушки реализации сервиса {#testing-by-providing-a-stubbed-implementation-of-a-service}

Если мокировать асинхронные запросы на уровне HTTP невозможно, альтернативой является использование шпионов.

Настройка в `app/twain/twain-quotes.spec.ts` показывает один из способов:

```ts {header: "twain.spec.ts"}
class TwainQuotesStub implements TwainQuotes {
  private testQuote = 'Test Quote';

  getQuote() {
    return of(this.testQuote);
  }

  // ... Implement everything to conform to the API
}

beforeEach(async () => {
  TestBed.configureTestingModule({
    providers: [{provide: TwainQuotes, useClass: TwainQuotesStub}],
  });

  fixture = TestBed.createComponent(Twain);
  component = fixture.componentInstance;
  await fixture.whenStable();
  quoteEl = fixture.nativeElement.querySelector('.twain');
});
```

Обратите внимание, как заглушка заменяет оригинальную реализацию.

```ts
TestBed.configureTestingModule({
  providers: [{provide: TwainQuotes, useClass: TwainQuotesStub}],
});
```

Заглушка спроектирована так, что любой компонент или сервис, который её внедряет, получает реализацию-заглушку.
Это значит, что любой вызов `getQuote` получает observable с тестовой цитатой.

В отличие от реального метода `getQuote()`, этот шпион обходит сервер и возвращает синхронный observable, значение которого доступно немедленно.

### Асинхронный тест с поддельными таймерами Vitest {#async-test-with-a-vitest-fake-timers}

Для мокирования асинхронных функций, таких как `setTimeout` или `Promise`, можно использовать поддельные таймеры Vitest, чтобы контролировать, когда они срабатывают.

```ts
it('should display error when TwainQuotes service fails', async () => {
  class TwainQuotesStub implements TwainQuotes {
    getQuote() {
      return defer(() => {
        return new Promise<string>((_, reject) => {
          setTimeout(() => reject('TwainService test failure'));
        });
      });
    }

    // ... Implement everything to conform to the API
  }

  TestBed.configureTestingModule({
    providers: [{provide: TwainQuotes, useClass: TwainQuotesStub}],
  });

  vi.useFakeTimers(); // setting up the fake timers
  const fixture = TestBed.createComponent(TwainComponent);

  // rendering isn't async, we need to flush
  await vi.runAllTimersAsync();

  await expect(fixture.nativeElement.querySelector('.error')!.textContent).toMatch(/test failure/);
  expect(fixture.nativeElement.querySelector('.twain')!.textContent).toBe('...');

  vi.useRealTimers(); // resets to regular async execution
});
```

### Больше асинхронных тестов {#more-async-tests}

С заглушкой сервиса, возвращающей асинхронные observable, большинство тестов также должны быть асинхронными.

Вот тест, демонстрирующий поток данных, который ожидается в реальных условиях.

```ts
it('should show quote after getQuote', async () => {
  class MockTwainQuotes implements TwainQuotes {
    private subject = new Subject<string>();

    getQuote() {
      return this.subject.asObservable();
    }

    emit(val: string) {
      this.subject.next(val);
    }
  }

  it('should show quote after getQuote (success)', async () => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [{provide: TwainQuotes, useClass: MockTwainQuotes}],
    });

    const fixture = TestBed.createComponent(TwainComponent);
    const twainQuotes = TestBed.inject(TwainQuotes) as MockTwainQuotes;
    await vi.runAllTimersAsync(); // render before the quote is received

    const quoteEl = fixture.nativeElement.querySelector('.twain');
    expect(quoteEl.textContent).toBe('...');

    twainQuotes.emit('Twain Quote'); // emits the quote
    await vi.runAllTimersAsync(); // render with the quote received

    expect(quoteEl.textContent).toBe('Twain Quote');
    expect(fixture.nativeElement.querySelector('.error')).toBeNull();

    vi.useRealTimers();
  });
});
```

Обратите внимание, что элемент цитаты отображает значение-заполнитель \(`'...'`\) при первом рендеринге.
Первая цитата ещё не получена.

Затем можно проверить, что элемент цитаты отображает ожидаемый текст.

### Асинхронные тесты с `zone.js` и `fakeAsync` {#async-tests-with-zonejs-and-fakeasync}

Вспомогательная функция `fakeAsync` — ещё один мок-таймер, который полагается на патчинг асинхронных API с помощью `zone.js`. Она широко использовалась в приложениях на основе `zone.js` для тестирования. Использование `fakeAsync` больше не рекомендуется.

ПОДСКАЗКА: Предпочитайте нативные асинхронные стратегии тестирования или другие поддельные таймеры (также называемые мок-часами), такие как в Vitest или Jasmine.

ВАЖНО: `fakeAsync` нельзя использовать с тест-раннером Vitest, так как `zone.js`-патчинг для него не применяется.

## Компонент с входными и выходными данными {#component-with-inputs-and-outputs}

Компонент с входными и выходными данными обычно находится внутри шаблона представления хост-компонента.
Хост использует привязку свойства для установки входного свойства и привязку события для прослушивания событий, генерируемых выходным свойством.

Цель тестирования — убедиться, что такие привязки работают ожидаемым образом.
Тесты должны устанавливать входные значения и прослушивать выходные события.

Компонент `DashboardHero` — небольшой пример компонента в такой роли.
Он отображает отдельного героя, предоставленного компонентом `Dashboard`.
Нажатие на героя сообщает компоненту `Dashboard`, что пользователь выбрал этого героя.

Компонент `DashboardHero` встроен в шаблон компонента `Dashboard` следующим образом:

```angular-html
@for (hero of heroes; track hero) {
  <dashboard-hero class="col-1-4" [hero]="hero" (selected)="gotoDetail($event)" />
}
```

Компонент `DashboardHero` находится в блоке `@for`, который устанавливает входное свойство `hero` каждого компонента в значение итерации и прослушивает событие `selected` компонента.

Вот полное определение компонента:

```angular-ts
@Component({
  selector: 'dashboard-hero',
  imports: [UpperCasePipe],
  template: `
    <button type="button" (click)="click()" class="hero">
      {{ hero().name | uppercase }}
    </button>
  `,
})
export class DashboardHero {
  readonly hero = input.required<Hero>();
  readonly selected = output<Hero>();

  click() {
    this.selected.emit(this.hero());
  }
}
```

Хотя тестирование столь простого компонента имеет небольшую самостоятельную ценность, важно знать, как это делается.
Используйте один из следующих подходов:

- Тестировать его как используемый компонентом `Dashboard`
- Тестировать его как отдельный компонент
- Тестировать его как используемый заменителем компонента `Dashboard`

Непосредственная цель — тестировать компонент `DashboardHero`, а не компонент `Dashboard`, поэтому попробуйте второй и третий варианты.

### Тестирование компонента `DashboardHero` как отдельного {#test-the-dashboardhero-component-standalone}

Вот основная часть настройки файла спецификации.

```ts
let fixture: ComponentFixture<DashboardHero>;
let comp: DashboardHero;
let heroDe: DebugElement;
let heroEl: HTMLElement;
let expectedHero: Hero;

beforeEach(async () => {
  fixture = TestBed.createComponent(DashboardHero);
  comp = fixture.componentInstance;

  // find the hero's DebugElement and element
  heroDe = fixture.debugElement.query(By.css('.hero'));
  heroEl = heroDe.nativeElement;

  // mock the hero supplied by the parent component
  expectedHero = {id: 42, name: 'Test Name'};

  // simulate the parent setting the input property with that hero
  fixture.componentRef.setInput('hero', expectedHero);

  // wait for initial data binding
  await fixture.whenStable();
});
```

Обратите внимание, как код настройки присваивает тестового героя \(`expectedHero`\) свойству `hero` компонента, имитируя способ, которым `Dashboard` устанавливает его через привязку свойства в своём цикле.

Следующий тест проверяет, что имя героя передаётся в шаблон через привязку.

```ts
it('should display hero name in uppercase', () => {
  const expectedPipedName = expectedHero.name.toUpperCase();
  expect(heroEl.textContent).toContain(expectedPipedName);
});
```

Поскольку шаблон передаёт имя героя через Angular `UpperCasePipe`, тест должен сравнивать значение элемента с именем в верхнем регистре.

### Нажатие кнопки {#clicking}

Нажатие на героя должно вызвать событие `selected`, которое хост-компонент \(предположительно `Dashboard`\) может прослушать:

```ts
it('should raise selected event when clicked (triggerEventHandler)', () => {
  let selectedHero: Hero | undefined;
  comp.selected.subscribe((hero: Hero) => (selectedHero = hero));

  heroDe.triggerEventHandler('click');
  expect(selectedHero).toBe(expectedHero);
});
```

Свойство `selected` компонента возвращает `EventEmitter`, который выглядит как синхронный RxJS `Observable` для потребителей.
Тест подписывается на него _явно_, так же как хост-компонент делает это _неявно_.

Если компонент ведёт себя ожидаемым образом, нажатие на элемент героя должно дать команду свойству `selected` компонента выпустить объект `hero`.

Тест обнаруживает это событие через подписку на `selected`.

### `triggerEventHandler` {#triggereventhandler}

`heroDe` в предыдущем тесте — это `DebugElement`, представляющий `<div>` героя.

Он имеет свойства и методы Angular, абстрагирующие взаимодействие с нативным элементом.
Этот тест вызывает `DebugElement.triggerEventHandler` с именем события "click".
Привязка события "click" реагирует вызовом `DashboardHero.click()`.

`DebugElement.triggerEventHandler` в Angular может вызвать _любое привязанное к данным событие_ по его _имени_.
Второй параметр — объект события, передаваемый обработчику.

Тест вызвал событие "click".

```ts
heroDe.triggerEventHandler('click');
```

В данном случае тест правильно предполагает, что обработчик событий во время выполнения — метод `click()` компонента — не заботится об объекте события.

ПОЛЕЗНО: Другие обработчики менее снисходительны.
Например, директива `RouterLink` ожидает объект со свойством `button`, определяющим, какая кнопка мыши была нажата при клике.
Директива `RouterLink` выбрасывает ошибку, если объект события отсутствует.

### Нажатие на элемент {#click-the-element}

Следующая альтернатива теста вызывает собственный метод `click()` нативного элемента — это вполне корректно _для данного компонента_.

```ts
it('should raise selected event when clicked (element.click)', () => {
  let selectedHero: Hero | undefined;
  comp.selected.subscribe((hero: Hero) => (selectedHero = hero));

  heroEl.click();
  expect(selectedHero).toBe(expectedHero);
});
```

### Вспомогательная функция `click()` {#click-helper}

Нажатие кнопки, ссылки или произвольного HTML-элемента — распространённая задача в тестировании.

Сделайте это последовательным и простым, инкапсулировав процесс _запуска клика_ во вспомогательную функцию, такую как следующая функция `click()`:

```ts
/** Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler */
export const ButtonClickEvents = {
  left: {button: 0},
  right: {button: 2},
};

/** Simulate element click. Defaults to mouse left-button click event. */
export function click(
  el: DebugElement | HTMLElement,
  eventObj: any = ButtonClickEvents.left,
): void {
  if (el instanceof HTMLElement) {
    el.click();
  } else {
    el.triggerEventHandler('click', eventObj);
  }
}
```

Первый параметр — _элемент для клика_.
При желании можно передать пользовательский объект события вторым параметром.
По умолчанию используется частичный [объект события левой кнопки мыши](https://developer.mozilla.org/docs/Web/API/MouseEvent/button), принимаемый многими обработчиками, включая директиву `RouterLink`.

ВАЖНО: Вспомогательная функция `click()` **не** является утилитой Angular для тестирования.
Это функция, определённая в _примере кода данного руководства_.
Все примеры тестов используют её.
Если она вам нравится, добавьте её в свой набор вспомогательных функций.

Вот предыдущий тест, переписанный с использованием вспомогательной функции click.

```ts
it('should raise selected event when clicked (click helper with DebugElement)', () => {
  let selectedHero: Hero | undefined;
  comp.selected.subscribe((hero: Hero) => (selectedHero = hero));

  click(heroDe); // click helper with DebugElement

  expect(selectedHero).toBe(expectedHero);
});
```

## Компонент внутри тестового хоста {#component-inside-a-test-host}

Предыдущие тесты сами выполняли роль хост-компонента `Dashboard`.
Но правильно ли работает компонент `DashboardHero`, когда он корректно привязан к данным хост-компонента?

```angular-ts
@Component({
  imports: [DashboardHero],
  template: ` <dashboard-hero [hero]="hero" (selected)="onSelected($event)" />`,
})
class TestHost {
  hero: Hero = {id: 42, name: 'Test Name'};
  selectedHero: Hero | undefined;

  onSelected(hero: Hero) {
    this.selectedHero = hero;
  }
}
```

Тестовый хост устанавливает входное свойство `hero` компонента с тестовым героем.
Он привязывает событие `selected` компонента к обработчику `onSelected`, который записывает выпущенного героя в свойство `selectedHero`.

Позже тесты смогут проверить `selectedHero`, чтобы убедиться, что событие `DashboardHero.selected` выпустило ожидаемого героя.

Настройка тестов с `test-host` аналогична настройке для отдельных тестов:

```ts
beforeEach(async () => {
  // create TestHost instead of DashboardHero
  fixture = TestBed.createComponent(TestHost);
  testHost = fixture.componentInstance;
  heroEl = fixture.nativeElement.querySelector('.hero');

  await fixture.whenStable();
});
```

Эта конфигурация тестового модуля показывает два важных отличия:

- Он _создаёт_ компонент `TestHost` вместо `DashboardHero`
- `TestHost` устанавливает `DashboardHero.hero` через привязку

`createComponent` возвращает `fixture`, содержащий экземпляр `TestHost`, а не `DashboardHero`.

Создание `TestHost` влечёт за собой создание `DashboardHero`, поскольку последний присутствует в шаблоне первого.
Запрос элемента героя \(`heroEl`\) по-прежнему находит его в тестовом DOM, хотя и на большей глубине в дереве элементов, чем раньше.

Сами тесты почти идентичны отдельной версии:

```ts
it('should display hero name', () => {
  const expectedPipedName = testHost.hero.name.toUpperCase();
  expect(heroEl.textContent).toContain(expectedPipedName);
});

it('should raise selected event when clicked', () => {
  click(heroEl);
  // selected hero should be the same data bound hero
  expect(testHost.selectedHero).toBe(testHost.hero);
});
```

Отличается только тест с событием selected.
Он подтверждает, что выбранный герой `DashboardHero` действительно проходит через привязку события к хост-компоненту.

## Компонент-маршрутизатор {#routing-component}

_Компонент-маршрутизатор_ — это компонент, который указывает `Router` перейти к другому компоненту.
Компонент `Dashboard` является _компонентом-маршрутизатором_, поскольку пользователь может перейти к компоненту `HeroDetail`, нажав на одну из _кнопок героя_ на дашборде.

Angular предоставляет тестовые вспомогательные функции для уменьшения шаблонного кода и более эффективного тестирования кода, зависящего от `HttpClient`. Функцию `provideRouter` также можно использовать непосредственно в тестовом модуле.

```ts
beforeEach(async () => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{path: '**', component: Dashboard}]),
      provideHttpClientTesting(),
      HeroService,
    ],
  });
  harness = await RouterTestingHarness.create();
  comp = await harness.navigateByUrl('/', Dashboard);
  TestBed.inject(HttpTestingController).expectOne('api/heroes').flush(getTestHeroes());
});
```

Следующий тест нажимает на отображаемого героя и подтверждает, что переход к ожидаемому URL происходит.

```ts
it('should tell navigate when hero clicked', async () => {
  // get first <dashboard-hero> DebugElement
  const heroDe = harness.routeDebugElement!.query(By.css('dashboard-hero'));
  heroDe.triggerEventHandler('selected', comp.heroes[0]);

  // expecting to navigate to id of the component's first hero
  const id = comp.heroes[0].id;
  expect(TestBed.inject(Router).url, 'should nav to HeroDetail for first hero').toEqual(
    `/heroes/${id}`,
  );
});
```

## Компоненты с маршрутизацией {#routed-components}

_Компонент с маршрутизацией_ — это цель навигации `Router`.
Тестировать его может быть сложнее, особенно когда маршрут к компоненту _включает параметры_.
`HeroDetail` — это _компонент с маршрутизацией_, являющийся целью такого маршрута.

Когда пользователь нажимает на героя в _Dashboard_, `Dashboard` указывает `Router` перейти на `heroes/:id`.
`:id` — параметр маршрута, значением которого является `id` редактируемого героя.

`Router` сопоставляет этот URL с маршрутом к `HeroDetail`.
Он создаёт объект `ActivatedRoute` с информацией о маршрутизации и внедряет его в новый экземпляр `HeroDetail`.

Вот сервисы, внедрённые в `HeroDetail`:

```ts
private heroDetailService = inject(HeroDetailService);
private route = inject(ActivatedRoute);
private router = inject(Router);
```

Компоненту `HeroDetail` нужен параметр `id`, чтобы он мог получить соответствующего героя с помощью `HeroDetailService`.
Компонент должен получить `id` из свойства `ActivatedRoute.paramMap`, которое является `Observable`.

Нельзя просто ссылаться на свойство `id` `ActivatedRoute.paramMap`.
Компонент должен _подписаться_ на observable `ActivatedRoute.paramMap` и быть готов к изменению `id` на протяжении своего жизненного цикла.

```ts
constructor() {
  // get hero when `id` param changes
  this.route.paramMap
    .pipe(takeUntilDestroyed())
    .subscribe((pmap) => this.getHero(pmap.get('id')));
}
```

Тесты могут исследовать, как `HeroDetail` реагирует на разные значения параметра `id`, переходя по разным маршрутам.

## Тестирование вложенных компонентов {#nested-component-tests}

Шаблоны компонентов часто содержат вложенные компоненты, шаблоны которых могут содержать ещё больше компонентов.

Дерево компонентов может быть очень глубоким, и иногда вложенные компоненты не играют никакой роли в тестировании компонента верхнего уровня.

Компонент `App`, например, отображает навигационную панель с якорными ссылками и их директивами `RouterLink`.

```angular-html
<app-banner />
<app-welcome />

<nav>
  <a routerLink="/dashboard">Dashboard</a>
  <a routerLink="/heroes">Heroes</a>
  <a routerLink="/about">About</a>
</nav>

<router-outlet />
```

Для проверки ссылок без выполнения навигации не нужен `Router` для перехода и `<router-outlet>` для обозначения места, куда `Router` вставляет _компоненты маршрутов_.

Компоненты `Banner` и `Welcome` \(обозначенные `<app-banner>` и `<app-welcome>`\) также не важны.

Тем не менее любой тест, создающий компонент `App` в DOM, также создаёт экземпляры этих трёх компонентов, и, если допустить это, придётся настраивать `TestBed` для их создания.

Если не объявить их, компилятор Angular не распознает теги `<app-banner>`, `<app-welcome>` и `<router-outlet>` в шаблоне `App` и выдаст ошибку.

Если объявить реальные компоненты, придётся также объявить _их_ вложенные компоненты и предоставить все сервисы, внедрённые в _любой_ компонент дерева.

В этом разделе описаны два метода минимизации настройки.
Используйте их — по отдельности или в комбинации — чтобы сосредоточиться на тестировании основного компонента.

### Заглушки ненужных компонентов {#stubbing-unneeded-components}

В первом методе создаются и объявляются заглушки-версии компонентов и директив, которые не играют существенной роли в тестах.

```ts
@Component({selector: 'app-banner', template: ''})
class BannerStub {}

@Component({selector: 'router-outlet', template: ''})
class RouterOutletStub {}

@Component({selector: 'app-welcome', template: ''})
class WelcomeStub {}
```

Селекторы заглушек совпадают с селекторами соответствующих реальных компонентов.
Но их шаблоны и классы пусты.

Затем объявите их, переопределив `imports` компонента с помощью `TestBed.overrideComponent`.

```ts
let comp: App;
let fixture: ComponentFixture<App>;

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), UserAuthentication],
  }).overrideComponent(App, {
    set: {
      imports: [RouterLink, BannerStub, RouterOutletStub, WelcomeStub],
    },
  });

  fixture = TestBed.createComponent(App);
  comp = fixture.componentInstance;
});
```

ПОЛЕЗНО: Ключ `set` в этом примере заменяет все существующие импорты компонента — убедитесь, что импортированы все зависимости, а не только заглушки. Альтернативно можно использовать ключи `remove`/`add` для выборочного удаления и добавления импортов.

### `NO_ERRORS_SCHEMA` {#no-errors-schema}

Во втором подходе добавьте `NO_ERRORS_SCHEMA` в переопределения метаданных компонента.

```ts
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), UserAuthentication],
  }).overrideComponent(App, {
    set: {
      imports: [], // resets all imports
      schemas: [NO_ERRORS_SCHEMA],
    },
  });
});
```

`NO_ERRORS_SCHEMA` указывает компилятору Angular игнорировать нераспознанные элементы и атрибуты.

Компилятор распознает элемент `<app-root>` и атрибут `routerLink`, поскольку вы объявили соответствующие компонент `App` и `RouterLink` в конфигурации `TestBed`.

Но компилятор не выдаст ошибку при встрече с `<app-banner>`, `<app-welcome>` или `<router-outlet>`.
Он просто отобразит их как пустые теги, и браузер их проигнорирует.

Заглушки компонентов больше не нужны.

### Использование обоих методов вместе {#use-both-techniques-together}

Это методы _поверхностного тестирования компонентов_, названные так потому, что они сужают визуальную поверхность компонента до тех элементов шаблона компонента, которые важны для тестов.

Подход с `NO_ERRORS_SCHEMA` проще, но не злоупотребляйте им.

`NO_ERRORS_SCHEMA` также не позволяет компилятору сообщать об отсутствующих компонентах и атрибутах, которые были случайно пропущены или написаны с ошибкой.
Можно потратить часы в погоне за призрачными ошибками, которые компилятор поймал бы мгновенно.

Подход с _заглушкой компонента_ имеет ещё одно преимущество.
Хотя заглушки в _данном_ примере были пустыми, им можно дать упрощённые шаблоны и классы, если тестам нужно взаимодействовать с ними каким-либо образом.

На практике оба метода часто комбинируются в одной настройке, как видно в этом примере.

```ts
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), UserAuthentication],
  }).overrideComponent(App, {
    remove: {imports: [RouterOutlet, Welcome]},
    set: {schemas: [NO_ERRORS_SCHEMA]},
  });
});
```

Компилятор Angular создаёт `BannerStub` для элемента `<app-banner>` и применяет `RouterLink` к якорным ссылкам с атрибутом `routerLink`, но игнорирует теги `<app-welcome>` и `<router-outlet>`.

### `By.directive` и внедрённые директивы {#by-directive-and-injected-directives}

Небольшая дополнительная настройка запускает первоначальную привязку данных и получает ссылки на навигационные ссылки:

```ts
beforeEach(async () => {
  await fixture.whenStable();

  // find DebugElements with an attached RouterLinkStubDirective
  linkDes = fixture.debugElement.queryAll(By.directive(RouterLink));

  // get attached link directive instances
  // using each DebugElement's injector
  routerLinks = linkDes.map((de) => de.injector.get(RouterLink));
});
```

Три важных момента:

- Поиск якорных элементов с прикреплённой директивой с помощью `By.directive`
- Запрос возвращает обёртки `DebugElement` вокруг совпадающих элементов
- Каждый `DebugElement` предоставляет инжектор зависимостей с конкретным экземпляром директивы, прикреплённой к этому элементу

Ссылки компонента `App` для проверки выглядят следующим образом:

```angular-html
<nav>
  <a routerLink="/dashboard">Dashboard</a>
  <a routerLink="/heroes">Heroes</a>
  <a routerLink="/about">About</a>
</nav>
```

Вот несколько тестов, подтверждающих, что эти ссылки подключены к директивам `routerLink` ожидаемым образом:

```ts
it('can get RouterLinks from template', () => {
  expect(routerLinks.length, 'should have 3 routerLinks').toBe(3);
  expect(routerLinks[0].href).toBe('/dashboard');
  expect(routerLinks[1].href).toBe('/heroes');
  expect(routerLinks[2].href).toBe('/about');
});

it('can click Heroes link in template', async () => {
  const heroesLinkDe = linkDes[1]; // heroes link DebugElement

  TestBed.inject(Router).resetConfig([{path: '**', children: []}]);
  heroesLinkDe.triggerEventHandler('click', {button: 0});

  await fixture.whenStable();

  expect(TestBed.inject(Router).url).toBe('/heroes');
});
```

## Использование объекта `page` {#use-a-page-object}

Компонент `HeroDetail` — это простое представление с заголовком, двумя полями для героя и двумя кнопками.

Но даже в такой простой форме сложность шаблона достаточно велика.

```angular-html
@if (hero) {
  <div>
    <h2>
      <span>{{ hero.name | titlecase }}</span> Details
    </h2>
    <div><span>id: </span>{{ hero.id }}</div>
    <div>
      <label for="name">name: </label>
      <input id="name" [(ngModel)]="hero.name" placeholder="name" />
    </div>
    <button type="button" (click)="save()">Save</button>
    <button type="button" (click)="cancel()">Cancel</button>
  </div>
}
```

Тестам, работающим с этим компонентом, необходимо…

- Ждать появления героя до появления элементов в DOM
- Ссылка на текст заголовка
- Ссылка на поле ввода имени для проверки и установки
- Ссылки на две кнопки для их нажатия

Даже небольшая форма может превратиться в беспорядочную условную настройку и выборку элементов по CSS.

Укротите сложность с помощью класса `Page`, который управляет доступом к свойствам компонента и инкапсулирует логику их установки.

Вот такой класс `Page` для `hero-detail.component.spec.ts`

```ts
class Page {
  // getter properties wait to query the DOM until called.
  get buttons() {
    return this.queryAll<HTMLButtonElement>('button');
  }
  get saveBtn() {
    return this.buttons[0];
  }
  get cancelBtn() {
    return this.buttons[1];
  }
  get nameDisplay() {
    return this.query<HTMLElement>('span');
  }
  get nameInput() {
    return this.query<HTMLInputElement>('input');
  }

  //// query helpers ////
  private query<T>(selector: string): T {
    return harness.routeNativeElement!.querySelector(selector)! as T;
  }

  private queryAll<T>(selector: string): T[] {
    return harness.routeNativeElement!.querySelectorAll(selector) as any as T[];
  }
}
```

Теперь важные точки для манипуляции компонентом и его проверки аккуратно организованы и доступны из экземпляра `Page`.

Метод `createComponent` создаёт объект `page` и заполняет пробелы после получения `hero`.

```ts
async function createComponent(id: number) {
  harness = await RouterTestingHarness.create();
  component = await harness.navigateByUrl(`/heroes/${id}`, HeroDetail);
  page = new Page();

  const request = TestBed.inject(HttpTestingController).expectOne(`api/heroes/?id=${id}`);
  const hero = getTestHeroes().find((h) => h.id === Number(id));
  request.flush(hero ? [hero] : []);
  await harness.fixture.whenStable();
}
```

Вот ещё несколько тестов компонента `HeroDetail` для закрепления материала.

```ts
it("should display that hero's name", () => {
  expect(page.nameDisplay.textContent).toBe(expectedHero.name);
});

it('should navigate when click cancel', () => {
  click(page.cancelBtn);
  expect(TestBed.inject(Router).url).toEqual(`/heroes/${expectedHero.id}`);
});

it('should save when click save but not navigate immediately', () => {
  click(page.saveBtn);
  expect(TestBed.inject(HttpTestingController).expectOne({method: 'PUT', url: 'api/heroes'}));
  expect(TestBed.inject(Router).url).toEqual('/heroes/41');
});

it('should navigate when click save and save resolves', async () => {
  click(page.saveBtn);
  await harness.fixture.whenStable();
  expect(TestBed.inject(Router).url).toEqual('/heroes/41');
});

it('should convert hero name to Title Case', async () => {
  // get the name's input and display elements from the DOM
  const hostElement: HTMLElement = harness.routeNativeElement!;
  const nameInput: HTMLInputElement = hostElement.querySelector('input')!;
  const nameDisplay: HTMLElement = hostElement.querySelector('span')!;

  // simulate user entering a new name into the input box
  nameInput.value = 'quick BROWN  fOx';

  // Dispatch a DOM event so that Angular learns of input value change.
  nameInput.dispatchEvent(new Event('input'));

  // Wait for Angular to update the display binding through the title pipe
  await harness.fixture.whenStable();

  expect(nameDisplay.textContent).toBe('Quick Brown  Fox');
});
```

## Переопределение провайдеров компонента {#override-component-providers}

`HeroDetail` предоставляет собственный `HeroDetailService`.

```ts
@Component({
  /* ... */
  providers: [HeroDetailService],
})
export class HeroDetail {
  private heroDetailService = inject(HeroDetailService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
}
```

Невозможно подменить `HeroDetailService` компонента в `providers` `TestBed.configureTestingModule`.
Это провайдеры для _тестового модуля_, а не для компонента.
Они подготавливают инжектор зависимостей на _уровне fixture_.

Angular создаёт компонент с _собственным_ инжектором, который является _дочерним_ по отношению к инжектору fixture.
Он регистрирует провайдеры компонента \(в данном случае `HeroDetailService`\) с дочерним инжектором.

Тест не может получить доступ к сервисам дочернего инжектора через инжектор fixture.
И `TestBed.configureTestingModule` тоже не может их настроить.

Angular всё это время создавал новые экземпляры реального `HeroDetailService`!

ПОЛЕЗНО: Эти тесты могут не пройти или завершиться по таймауту, если `HeroDetailService` делает собственные XHR-запросы к удалённому серверу.
Удалённого сервера может не быть.

К счастью, `HeroDetailService` делегирует ответственность за удалённый доступ к данным внедрённому `HeroService`.

```ts
@Injectable({providedIn: 'root'})
export class HeroDetailService {
  private heroService = inject(HeroService);
}
```

Предыдущая конфигурация тестов заменяла реальный `HeroService` на `TestHeroService`, который перехватывает запросы к серверу и имитирует их ответы.

Что если вам так не повезёт.
Что если создать заглушку для `HeroService` сложно?
Что если `HeroDetailService` делает собственные запросы к серверу?

Метод `TestBed.overrideComponent` может заменить `providers` компонента простыми в управлении _тестовыми заглушками_, как показано в следующем варианте настройки:

```ts
beforeEach(async () => {
  await TestBed.configureTestingModule({
    providers: [
      provideRouter([
        {path: 'heroes', component: HeroList},
        {path: 'heroes/:id', component: HeroDetail},
      ]),
      // HeroDetailService at this level is IRRELEVANT!
      {provide: HeroDetailService, useValue: {}},
    ],
  }).overrideComponent(HeroDetail, {
    set: {providers: [{provide: HeroDetailService, useClass: HeroDetailServiceSpy}]},
  });
});
```

Обратите внимание, что `TestBed.configureTestingModule` больше не предоставляет фиктивный `HeroService`, поскольку [он не нужен](#provide-a-spy-stub-herodetailservicespy).

### Метод `overrideComponent` {#the-overridecomponent-method}

Сосредоточьтесь на методе `overrideComponent`.

```ts
.overrideComponent(HeroDetail, {
  set: {providers: [{provide: HeroDetailService, useClass: HeroDetailServiceSpy}]},
});
```

Он принимает два аргумента: тип переопределяемого компонента \(`HeroDetail`\) и объект переопределения метаданных.
[Объект переопределения метаданных](/guide/testing/utility-apis#testbed-class-summary) — это обобщённый тип, определённый следующим образом:

```ts
type MetadataOverride<T> = {
  add?: Partial<T>;
  remove?: Partial<T>;
  set?: Partial<T>;
};
```

Объект переопределения метаданных может добавлять и удалять элементы в свойствах метаданных или полностью сбрасывать эти свойства.
В этом примере полностью сбрасываются метаданные `providers` компонента.

Параметр типа `T` — это тип метаданных, которые передаются декоратору `@Component`:

```ts
selector?: string;
template?: string;
templateUrl?: string;
providers?: any[];
…
```

### Предоставление _шпиона-заглушки_ (`HeroDetailServiceSpy`) {#provide-a-spy-stub-herodetailservicespy}

В этом примере полностью заменяется массив `providers` компонента новым массивом, содержащим `HeroDetailServiceSpy`.

`HeroDetailServiceSpy` — это заглушка реального `HeroDetailService`, которая имитирует все необходимые функции этого сервиса.
Она не внедряет и не делегирует нижнему уровню `HeroService`, поэтому нет необходимости предоставлять тестовую заглушку для него.

Связанные тесты компонента `HeroDetail` будут проверять вызовы методов `HeroDetailService`, слежа за методами сервиса.
Соответственно, заглушка реализует свои методы как шпионы:

```ts
import {vi} from 'vitest';

class HeroDetailServiceSpy {
  testHero: Hero = {...testHero};

  /* emit cloned test hero */
  getHero = vi.fn(() => asyncData({...this.testHero}));

  /* emit clone of test hero, with changes merged in */
  saveHero = vi.fn((hero: Hero) => asyncData(Object.assign(this.testHero, hero)));
}
```

### Тесты с переопределением {#the-override-tests}

Теперь тесты могут напрямую управлять героем компонента, манипулируя `testHero` шпиона-заглушки, и подтверждать, что методы сервиса были вызваны.

```ts
let hdsSpy: HeroDetailServiceSpy;

beforeEach(async () => {
  harness = await RouterTestingHarness.create();
  component = await harness.navigateByUrl(`/heroes/${testHero.id}`, HeroDetail);
  page = new Page();
  // get the component's injected HeroDetailServiceSpy
  hdsSpy = harness.routeDebugElement!.injector.get(HeroDetailService) as any;

  harness.detectChanges();
});

it('should have called `getHero`', () => {
  expect(hdsSpy.getHero, 'getHero called once').toHaveBeenCalledTimes(1);
});

it("should display stub hero's name", () => {
  expect(page.nameDisplay.textContent).toBe(hdsSpy.testHero.name);
});

it('should save stub hero change', async () => {
  const origName = hdsSpy.testHero.name;
  const newName = 'New Name';

  page.nameInput.value = newName;

  page.nameInput.dispatchEvent(new Event('input')); // tell Angular

  expect(component.hero.name, 'component hero has new name').toBe(newName);
  expect(hdsSpy.testHero.name, 'service hero unchanged before save').toBe(origName);

  click(page.saveBtn);
  expect(hdsSpy.saveHero, 'saveHero called once').toHaveBeenCalledTimes(1);

  await harness.fixture.whenStable();
  expect(hdsSpy.testHero.name, 'service hero has new name after save').toBe(newName);
  expect(TestBed.inject(Router).url).toEqual('/heroes');
});
```

### Другие переопределения {#more-overrides}

Метод `TestBed.overrideComponent` может вызываться несколько раз для одного и того же или для разных компонентов.
`TestBed` предлагает аналогичные методы `overrideDirective`, `overrideModule` и `overridePipe` для погружения в и замены частей этих других классов.

Исследуйте варианты и комбинации самостоятельно.
