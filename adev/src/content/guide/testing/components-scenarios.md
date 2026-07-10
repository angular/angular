# Сценарии тестирования компонентов

Это руководство рассматривает типичные сценарии тестирования компонентов.

## Привязка компонента {#component-binding}

В примере приложения компонент `Banner` показывает статический текст заголовка в HTML-шаблоне.

После нескольких изменений компонент `Banner` показывает динамический заголовок, привязываясь к свойству `title` компонента следующим образом.

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

Как бы минимально это ни было, вы решаете добавить тест, подтверждающий, что компонент действительно отображает нужный контент там, где вы ожидаете.

### Запрос `<h1>` {#query-for-the-h1}

Вы напишете последовательность тестов, которые проверяют значение элемента `<h1>`, оборачивающего интерполяционную привязку свойства _title_.

Обновите `beforeEach`, чтобы найти этот элемент стандартным HTML `querySelector` и присвоить его переменной `h1`.

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

### `createComponent()` не привязывает данные {#createcomponent-does-not-bind-data}

В первом тесте хочется увидеть, что на экране отображается `title` по умолчанию.
Инстинктивно пишется тест, который сразу проверяет `<h1>` так:

```ts
it('should display original title', () => {
  expect(h1.textContent).toContain(component.title());
});
```

_Этот тест падает_ с сообщением:

```shell {hideCopy}
expected '' to contain 'Test Tour of Heroes'.
```

Привязка происходит, когда Angular выполняет **обнаружение изменений**.

В production обнаружение изменений запускается автоматически, когда Angular создаёт компонент или, например, пользователь нажимает клавишу.

`TestBed.createComponent` не запускает обнаружение изменений синхронно; это подтверждается в пересмотренном тесте:

```ts
it('no title in the DOM after createComponent()', () => {
  expect(h1.textContent).toEqual('');
});
```

### `whenStable()` {#whenstable}

Можно указать `TestBed` дождаться выполнения обнаружения изменений через `await fixture.whenStable()`.
Только тогда у `<h1>` появляется ожидаемый заголовок.

```ts
it('should display original title', async () => {
  await fixture.whenStable();
  expect(h1.textContent).toContain(component.title());
});
```

Отложенное обнаружение изменений намеренно и полезно.
Оно даёт тестировщику возможность проверить и изменить состояние компонента _до того, как Angular инициирует привязку данных и вызовет [хуки жизненного цикла](guide/components/lifecycle)_.

Вот ещё один тест, который меняет свойство `title` компонента _перед_ вызовом `fixture.whenStable()`.

```ts
it('should display a different test title', async () => {
  component.title.set('Test Title');
  await fixture.whenStable();
  expect(h1.textContent).toContain('Test Title');
});
```

### Привязка сигналов к inputs {#binding-signals-to-inputs}

Чтобы отражать изменения inputs и слушать outputs, можно динамически привязывать сигналы к inputs и функции к outputs.

```ts
import {inputBinding, outputBinding} from '@angular/core';

const fixture = TestBed.createComponent(ValueDisplay, {
  bindings: [
    inputBinding('value', value),
    outputBinding('valueChange', () =>  (/* ... */) ),
  ],
});
```

### Изменение значения input через `dispatchEvent()` {#change-an-input-value-with-dispatchevent}

Чтобы симулировать ввод пользователя, найдите элемент input и установите его свойство `value`.

Но есть важный промежуточный шаг.

Angular не знает, что вы установили свойство `value` элемента input.
Он не прочитает это свойство, пока вы не поднимете событие `input` элемента вызовом `dispatchEvent()`.

Следующий пример компонента с `TitleCasePipe` демонстрирует правильную последовательность.

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

У компонентов часто есть зависимости от сервисов.

Компонент `Welcome` показывает приветственное сообщение вошедшему пользователю.
Он знает, кто пользователь, на основе свойства внедрённого `UserAuthentication`:

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

У компонента `Welcome` есть логика принятия решений, взаимодействующая с сервисом — логика, из-за которой этот компонент стоит тестировать.

### Предоставление тестовых двойников сервисов {#provide-service-test-doubles}

_Тестируемый компонент_ не обязан получать реальные сервисы.

Внедрение реального `UserAuthentication` может быть затруднительным.
Реальный сервис может запрашивать учётные данные и пытаться достучаться до сервера аутентификации.
Такое поведение сложно перехватить. Имейте в виду, что тестовые двойники заставляют тест вести себя иначе, чем в production, поэтому используйте их умеренно.

### Получение внедрённых сервисов {#get-injected-services}

Тестам нужен доступ к `UserAuthentication`, внедрённому в компонент `Welcome`.

У Angular иерархическая система внедрения.
Инжекторы могут быть на нескольких уровнях — от корневого инжектора, созданного `TestBed`, вниз по дереву компонентов.

Самый безопасный способ получить внедрённый сервис — способ, который **_всегда работает_**, —
это **получить его из инжектора _тестируемого компонента_**.
Инжектор компонента — свойство `DebugElement` фикстуры.

```ts
// UserAuthentication actually injected into the component
userAuth = fixture.debugElement.injector.get(UserAuthentication);
```

HELPFUL: Обычно это _не обязательно_. Сервисы часто предоставляются в корне или через переопределения TestBed и их проще получить через `TestBed.inject()` (см. ниже).

### `TestBed.inject()` {#testbedinject}

Это проще запомнить и менее многословно, чем получение сервиса через `DebugElement` фикстуры.

В этом наборе тестов _единственный_ провайдер `UserAuthentication` — корневой тестовый модуль, поэтому безопасно вызывать `TestBed.inject()` так:

```ts
userAuth = TestBed.inject(UserAuthentication);
```

HELPFUL: Сценарий, в котором `TestBed.inject()` не работает, см. в разделе [_Переопределение провайдеров компонента_](#override-component-providers), где объясняется, когда и почему сервис нужно брать из инжектора компонента.

### Финальная настройка и тесты {#final-setup-and-tests}

Вот полный `beforeEach()`, использующий `TestBed.inject()`:

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

И вот несколько тестов:

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

Первый — sanity-тест; он подтверждает, что `UserAuthentication` вызывается и работает.

HELPFUL: Второй аргумент `expect` \(например, `'expected name'`\) — необязательная метка при падении.
Если ожидание не выполняется, Vitest добавляет эту метку к сообщению о падении.
В спецификации с несколькими ожиданиями это помогает понять, что пошло не так и какое ожидание упало.

Остальные тесты подтверждают логику компонента, когда сервис возвращает разные значения.
Второй тест проверяет эффект смены имени пользователя.
Третий проверяет, что компонент показывает правильное сообщение, когда нет вошедшего пользователя.

## Компонент с асинхронным сервисом {#component-with-async-service}

В этом примере шаблон компонента `About` содержит компонент `Twain`.
Компонент `Twain` показывает цитаты Марка Твена.

```angular-html
<p class="twain">
  <i>{{ quote | async }}</i>
</p>
<button type="button" (click)="getQuote()">Next quote</button>
@if (errorMessage()) {
  <p class="error">{{ errorMessage() }}</p>
}
```

HELPFUL: Значение свойства `quote` компонента проходит через `AsyncPipe`.
Это значит, что свойство возвращает либо `Promise`, либо `Observable`.

В этом примере метод `TwainQuotes.getQuote()` показывает, что свойство `quote` возвращает `Observable`.

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
Компонент начинает возвращённый `Observable` с placeholder-значения \(`'...'`\) до того, как сервис вернёт первую цитату.

`catchError` перехватывает ошибки сервиса, готовит сообщение об ошибке и возвращает placeholder в канале успеха.

Всё это — функции, которые стоит протестировать.

### Тестирование через мокирование HTTP-запросов с `HttpTestingController` {#testing-by-mocking-http-requests-with-the-httptestingcontroller}

При тестировании компонента важны только публичные API сервиса.
В общем случае сами тесты не должны обращаться к удалённым серверам.
Они должны эмулировать такие вызовы.

Если асинхронный сервис опирается на `HttpClient` для загрузки удалённых данных, рекомендуется возвращать mock-ответы на уровне HTTP через `HttpTestingController`.

Подробнее о мокировании `HttpBackend` см. в [отдельном руководстве](guide/http/testing).

### Тестирование через stub-реализацию сервиса {#testing-by-providing-a-stubbed-implementation-of-a-service}

Когда мокирование асинхронного запроса на уровне HTTP невозможно, альтернатива — использовать spies.

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

Обратите внимание, как stub-реализация заменяет оригинальную.

```ts
TestBed.configureTestingModule({
  providers: [{provide: TwainQuotes, useClass: TwainQuotesStub}],
});
```

Stub спроектирован так, что любой компонент или сервис, который его внедряет, получит stub-реализацию.
Это значит, что любой вызов `getQuote` получает observable с тестовой цитатой.

В отличие от реального метода `getQuote()`, этот spy обходит сервер и возвращает синхронный observable, значение которого доступно сразу.

### Асинхронный тест с fake timers Vitest {#async-test-with-a-vitest-fake-timers}

Чтобы мокировать асинхронные функции вроде `setTimeout` или `Promise`, можно использовать fake timers Vitest и контролировать, когда они срабатывают.

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

### Дополнительные асинхронные тесты {#more-async-tests}

Когда stub-сервис возвращает асинхронные observables, большинство тестов тоже должны быть асинхронными.

Вот тест, демонстрирующий поток данных, который ожидается в реальном мире.

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

Обратите внимание: элемент цитаты при первом рендере показывает placeholder \(`'...'`\).
Первая цитата ещё не пришла.

Затем можно утверждать, что элемент цитаты показывает ожидаемый текст.

### Асинхронные тесты с `zone.js` и `fakeAsync` {#async-tests-with-zonejs-and-fakeasync}

Вспомогательная функция `fakeAsync` — ещё одни mock-часы, опирающиеся на патчинг асинхронных API через `zone.js`. Она часто использовалась в приложениях на `zone.js` для тестирования. Использование `fakeAsync` больше не рекомендуется.

TIP: Предпочитайте нативные стратегии асинхронного тестирования или другие fake timers (также называемые mock clocks), например из Vitest или Jasmine.

IMPORTANT: `fakeAsync` нельзя использовать с test runner Vitest, так как для этого runner патч `zone.js` не применяется.

## Компонент с inputs и outputs {#component-with-inputs-and-outputs}

Компонент с inputs и outputs обычно появляется внутри шаблона представления host-компонента.
Host использует property binding для установки input-свойства и event binding для прослушивания событий, поднимаемых output-свойством.

Цель тестирования — убедиться, что такие привязки работают как ожидается.
Тесты должны устанавливать значения inputs и слушать события outputs.

Компонент `DashboardHero` — крошечный пример компонента в этой роли.
Он отображает отдельного героя, предоставленного компонентом `Dashboard`.
Клик по этому герою сообщает компоненту `Dashboard`, что пользователь выбрал героя.

Компонент `DashboardHero` встроен в шаблон компонента `Dashboard` так:

```angular-html
@for (hero of heroes; track hero) {
  <dashboard-hero class="col-1-4" [hero]="hero" (selected)="gotoDetail($event)" />
}
```

Компонент `DashboardHero` появляется в блоке `@for`, который устанавливает input-свойство `hero` каждого компонента в значение цикла и слушает событие `selected` компонента.

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

Хотя тестирование такого простого компонента имеет мало внутренней ценности, полезно знать, как это делать.
Используйте один из подходов:

- Тестировать его так, как использует компонент `Dashboard`
- Тестировать его как standalone-компонент
- Тестировать его так, как использует заменитель компонента `Dashboard`

Непосредственная цель — протестировать компонент `DashboardHero`, а не `Dashboard`, поэтому попробуйте второй и третий варианты.

### Тестирование компонента `DashboardHero` отдельно {#test-the-dashboardhero-component-standalone}

Вот суть настройки файла спецификации.

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

Обратите внимание, как код настройки присваивает тестового героя \(`expectedHero`\) свойству `hero` компонента, эмулируя то, как `Dashboard` установил бы его через property binding в своём repeater.

Следующий тест проверяет, что имя героя попадает в шаблон через привязку.

```ts
it('should display hero name in uppercase', () => {
  const expectedPipedName = expectedHero.name.toUpperCase();
  expect(heroEl.textContent).toContain(expectedPipedName);
});
```

Поскольку шаблон пропускает имя героя через Angular `UpperCasePipe`, тест должен сопоставить значение элемента с именем в верхнем регистре.

### Клики {#clicking}

Клик по герою должен поднять событие `selected`, которое host-компонент \(предположительно `Dashboard`\) может услышать:

```ts
it('should raise selected event when clicked (triggerEventHandler)', () => {
  let selectedHero: Hero | undefined;
  comp.selected.subscribe((hero: Hero) => (selectedHero = hero));

  heroDe.triggerEventHandler('click');
  expect(selectedHero).toBe(expectedHero);
});
```

Свойство `selected` компонента возвращает `EventEmitter`, который для потребителей выглядит как синхронный RxJS `Observable`.
Тест подписывается на него _явно_, так же как host-компонент делает это _неявно_.

Если компонент ведёт себя как ожидается, клик по элементу героя должен сказать свойству `selected` компонента эмитировать объект `hero`.

Тест обнаруживает это событие через подписку на `selected`.

### `triggerEventHandler` {#triggereventhandler}

`heroDe` в предыдущем тесте — это `DebugElement`, представляющий `<div>` героя.

У него есть свойства и методы Angular, абстрагирующие взаимодействие с нативным элементом.
Этот тест вызывает `DebugElement.triggerEventHandler` с именем события "click".
Привязка события "click" отвечает вызовом `DashboardHero.click()`.

Angular `DebugElement.triggerEventHandler` может поднять _любое data-bound событие_ по его _имени события_.
Второй параметр — объект события, передаваемый обработчику.

Тест вызвал событие "click".

```ts
heroDe.triggerEventHandler('click');
```

В этом случае тест корректно предполагает, что runtime-обработчик события — метод `click()` компонента — не заботится об объекте события.

HELPFUL: Другие обработчики менее снисходительны.
Например, директива `RouterLink` ожидает объект со свойством `button`, идентифицирующим, какая кнопка мыши, если какая-либо, была нажата во время клика.
Директива `RouterLink` выбрасывает ошибку, если объект события отсутствует.

### Клик по элементу {#click-the-element}

Следующая альтернатива теста вызывает собственный метод `click()` нативного элемента, что для _этого компонента_ вполне нормально.

```ts
it('should raise selected event when clicked (element.click)', () => {
  let selectedHero: Hero | undefined;
  comp.selected.subscribe((hero: Hero) => (selectedHero = hero));

  heroEl.click();
  expect(selectedHero).toBe(expectedHero);
});
```

### Хелпер `click()` {#click-helper}

Клик по кнопке, якорю или произвольному HTML-элементу — типичная задача теста.

Сделайте это единообразным и простым, инкапсулировав процесс _вызова клика_ в хелпер вроде следующей функции `click()`:

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
При желании передайте пользовательский объект события вторым параметром.
По умолчанию — частичный [объект события левой кнопки мыши](https://developer.mozilla.org/docs/Web/API/MouseEvent/button), принимаемый многими обработчиками, включая директиву `RouterLink`.

IMPORTANT: Вспомогательная функция `click()` **не** входит в утилиты тестирования Angular.
Это функция, определённая в _примерах кода этого руководства_.
Все примеры тестов её используют.
Если она вам нравится, добавьте её в свою коллекцию хелперов.

Вот предыдущий тест, переписанный с хелпером click.

```ts
it('should raise selected event when clicked (click helper with DebugElement)', () => {
  let selectedHero: Hero | undefined;
  comp.selected.subscribe((hero: Hero) => (selectedHero = hero));

  click(heroDe); // click helper with DebugElement

  expect(selectedHero).toBe(expectedHero);
});
```

## Компонент внутри тестового host {#component-inside-a-test-host}

Предыдущие тесты сами играли роль host-компонента `Dashboard`.
Но корректно ли работает компонент `DashboardHero`, когда правильно data-bound к host-компоненту?

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

Тестовый host устанавливает input-свойство `hero` компонента своим тестовым героем.
Он привязывает событие `selected` компонента к своему обработчику `onSelected`, который записывает эмитированного героя в свойство `selectedHero`.

Позже тесты смогут проверить `selectedHero`, чтобы убедиться, что событие `DashboardHero.selected` эмитировало ожидаемого героя.

Настройка тестов `test-host` похожа на настройку standalone-тестов:

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

- Она _создаёт_ компонент `TestHost` вместо `DashboardHero`
- Компонент `TestHost` устанавливает `DashboardHero.hero` через привязку

`createComponent` возвращает `fixture`, которая держит экземпляр `TestHost` вместо экземпляра `DashboardHero`.

Создание `TestHost` имеет побочный эффект создания `DashboardHero`, потому что последний появляется в шаблоне первого.
Запрос элемента героя \(`heroEl`\) по-прежнему находит его в тестовом DOM, хотя и на большей глубине в дереве элементов, чем раньше.

Сами тесты почти идентичны standalone-версии:

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

Отличается только тест события selected.
Он подтверждает, что выбранный герой `DashboardHero` действительно проходит вверх через event binding к host-компоненту.

## Routing-компонент {#routing-component}

_Routing-компонент_ — это компонент, который говорит `Router` перейти к другому компоненту.
Компонент `Dashboard` — _routing-компонент_, потому что пользователь может перейти к компоненту `HeroDetail`, кликнув по одной из _кнопок героев_ на dashboard.

Angular предоставляет тестовые хелперы, чтобы уменьшить boilerplate и эффективнее тестировать код, зависящий от `HttpClient`. Функцию `provideRouter` также можно использовать напрямую в тестовом модуле.

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

Следующий тест кликает по отображённому герою и подтверждает навигацию к ожидаемому URL.

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

## Routed-компоненты {#routed-components}

_Routed-компонент_ — это назначение навигации `Router`.
Его может быть сложнее тестировать, особенно когда маршрут к компоненту _включает параметры_.
`HeroDetail` — _routed-компонент_, являющийся назначением такого маршрута.

Когда пользователь кликает по герою на _Dashboard_, `Dashboard` говорит `Router` перейти к `heroes/:id`.
`:id` — параметр маршрута, значение которого — `id` героя для редактирования.

`Router` сопоставляет этот URL с маршрутом к `HeroDetail`.
Он создаёт объект `ActivatedRoute` с информацией о маршрутизации и внедряет его в новый экземпляр `HeroDetail`.

Вот сервисы, внедрённые в `HeroDetail`:

```ts
private heroDetailService = inject(HeroDetailService);
private route = inject(ActivatedRoute);
private router = inject(Router);
```

Компоненту `HeroDetail` нужен параметр `id`, чтобы получить соответствующего героя через `HeroDetailService`.
Компонент должен получить `id` из свойства `ActivatedRoute.paramMap`, которое является `Observable`.

Нельзя просто сослаться на свойство `id` у `ActivatedRoute.paramMap`.
Компонент должен _подписаться_ на observable `ActivatedRoute.paramMap` и быть готовым к тому, что `id` изменится в течение его жизни.

```ts
constructor() {
  // get hero when `id` param changes
  this.route.paramMap
    .pipe(takeUntilDestroyed())
    .subscribe((pmap) => this.getHero(pmap.get('id')));
}
```

Тесты могут исследовать, как `HeroDetail` реагирует на разные значения параметра `id`, навигируя к разным маршрутам.

## Тесты вложенных компонентов {#nested-component-tests}

Шаблоны компонентов часто содержат вложенные компоненты, чьи шаблоны могут содержать ещё компоненты.

Дерево компонентов может быть очень глубоким, и иногда вложенные компоненты не играют роли в тестировании компонента на вершине дерева.

Компонент `App`, например, показывает панель навигации с якорями и их директивами `RouterLink`.

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

Чтобы проверить ссылки, но не навигацию, вам не нужен `Router` для навигации и не нужен `<router-outlet>`, чтобы отмечать, куда `Router` вставляет _routed-компоненты_.

Компоненты `Banner` и `Welcome` \(обозначенные `<app-banner>` и `<app-welcome>`\) тоже нерелевантны.

И всё же любой тест, создающий компонент `App` в DOM, также создаёт экземпляры этих трёх компонентов, и если вы это допустите, придётся настроить `TestBed` для их создания.

Если забыть объявить их, компилятор Angular не распознает теги `<app-banner>`, `<app-welcome>` и `<router-outlet>` в шаблоне `App` и выбросит ошибку.

Если объявить реальные компоненты, придётся также объявить _их_ вложенные компоненты и предоставить _все_ сервисы, внедрённые в _любой_ компонент дерева.

Этот раздел описывает две техники минимизации настройки.
Используйте их по отдельности или вместе, чтобы оставаться сосредоточенными на тестировании основного компонента.

### Stubbing ненужных компонентов {#stubbing-unneeded-components}

В первой технике вы создаёте и объявляете stub-версии компонентов и директив, которые играют малую роль или не играют роли в тестах.

```ts
@Component({selector: 'app-banner', template: ''})
class BannerStub {}

@Component({selector: 'router-outlet', template: ''})
class RouterOutletStub {}

@Component({selector: 'app-welcome', template: ''})
class WelcomeStub {}
```

Селекторы stub совпадают с селекторами соответствующих реальных компонентов.
Но их шаблоны и классы пусты.

Затем объявите их, переопределив `imports` вашего компонента через `TestBed.overrideComponent`.

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

HELPFUL: Ключ `set` в этом примере заменяет все существующие imports вашего компонента — убедитесь, что импортируете все зависимости, а не только stubs. Альтернативно можно использовать ключи `remove`/`add` для выборочного удаления и добавления imports.

### `NO_ERRORS_SCHEMA` {#noerrorsschema}

Во втором подходе добавьте `NO_ERRORS_SCHEMA` в переопределения метаданных вашего компонента.

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

`NO_ERRORS_SCHEMA` говорит компилятору Angular игнорировать нераспознанные элементы и атрибуты.

Компилятор распознаёт элемент `<app-root>` и атрибут `routerLink`, потому что вы объявили соответствующий компонент `App` и `RouterLink` в конфигурации `TestBed`.

Но компилятор не выбросит ошибку, когда встретит `<app-banner>`, `<app-welcome>` или `<router-outlet>`.
Он просто отрендерит их как пустые теги, и браузер их проигнорирует.

Stub-компоненты больше не нужны.

### Использование обеих техник вместе {#use-both-techniques-together}

Это техники _Shallow Component Testing_ — так названные, потому что они уменьшают визуальную поверхность компонента до тех элементов в шаблоне, которые важны для тестов.

Подход с `NO_ERRORS_SCHEMA` проще из двух, но не злоупотребляйте им.

`NO_ERRORS_SCHEMA` также мешает компилятору сообщать о пропущенных компонентах и атрибутах, которые вы случайно опустили или опечатали.
Можно потратить часы на поиск фантомных багов, которые компилятор поймал бы мгновенно.

Подход со _stub-компонентами_ имеет ещё одно преимущество.
Хотя stubs в _этом_ примере были пустыми, им можно дать урезанные шаблоны и классы, если тестам нужно как-то с ними взаимодействовать.

На практике вы комбинируете обе техники в одной настройке, как в этом примере.

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

Компилятор Angular создаёт `BannerStub` для элемента `<app-banner>` и применяет `RouterLink` к якорям с атрибутом `routerLink`, но игнорирует теги `<app-welcome>` и `<router-outlet>`.

### `By.directive` и внедрённые директивы {#bydirective-and-injected-directives}

Немного дополнительной настройки запускает начальную привязку данных и получает ссылки на навигационные ссылки:

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

Три момента особого интереса:

- Найдите элементы-якоря с прикреплённой директивой через `By.directive`
- Запрос возвращает обёртки `DebugElement` вокруг совпадающих элементов
- Каждый `DebugElement` открывает dependency injector с конкретным экземпляром директивы, прикреплённой к этому элементу

Ссылки компонента `App` для проверки выглядят так:

```angular-html
<nav>
  <a routerLink="/dashboard">Dashboard</a>
  <a routerLink="/heroes">Heroes</a>
  <a routerLink="/about">About</a>
</nav>
```

Вот несколько тестов, подтверждающих, что эти ссылки подключены к директивам `routerLink` как ожидается:

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

Компонент `HeroDetail` — простое представление с заголовком, двумя полями героя и двумя кнопками.

Но даже в этой простой форме достаточно сложности шаблона.

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

Тестам, упражняющим компонент, нужно …

- Дождаться появления героя, прежде чем элементы появятся в DOM
- Ссылка на текст заголовка
- Ссылка на поле ввода имени для проверки и установки
- Ссылки на две кнопки, чтобы кликать по ним

Даже такая небольшая форма может породить хаос мучительной условной настройки и CSS-выбора элементов.

Укротите сложность классом `Page`, который обрабатывает доступ к свойствам компонента и инкапсулирует логику их установки.

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

Теперь важные точки для манипуляции и проверки компонента аккуратно организованы и доступны из экземпляра `Page`.

Метод `createComponent` создаёт объект `page` и заполняет пробелы, как только прибывает `hero`.

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

Вот ещё несколько тестов компонента `HeroDetail`, чтобы закрепить мысль.

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

`HeroDetail` предоставляет свой собственный `HeroDetailService`.

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

Невозможно stub'ить `HeroDetailService` компонента в `providers` у `TestBed.configureTestingModule`.
Это провайдеры для _тестового модуля_, а не компонента.
Они готовят dependency injector на _уровне фикстуры_.

Angular создаёт компонент с _собственным_ инжектором, который является _дочерним_ по отношению к инжектору фикстуры.
Он регистрирует провайдеры компонента \(в данном случае `HeroDetailService`\) в дочернем инжекторе.

Тест не может получить сервисы дочернего инжектора из инжектора фикстуры.
И `TestBed.configureTestingModule` тоже не может их настроить.

Angular всё это время создавал новые экземпляры реального `HeroDetailService`!

HELPFUL: Эти тесты могут упасть или уйти в timeout, если `HeroDetailService` сам делал XHR-вызовы к удалённому серверу.
Удалённого сервера для вызова может не быть.

К счастью, `HeroDetailService` делегирует ответственность за удалённый доступ к данным внедрённому `HeroService`.

```ts
@Service()
export class HeroDetailService {
  private heroService = inject(HeroService);
}
```

Предыдущая конфигурация тестов заменяет реальный `HeroService` на `TestHeroService`, который перехватывает серверные запросы и подделывает их ответы.

А что, если вам не так повезло.
Что, если подделать `HeroService` сложно?
Что, если `HeroDetailService` сам делает серверные запросы?

Метод `TestBed.overrideComponent` может заменить `providers` компонента на удобные в управлении _тестовые двойники_, как в следующем варианте настройки:

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

Обратите внимание: `TestBed.configureTestingModule` больше не предоставляет fake `HeroService`, потому что он [не нужен](#provide-a-spy-stub-herodetailservicespy).

### Метод `overrideComponent` {#the-overridecomponent-method}

Сосредоточьтесь на методе `overrideComponent`.

```ts
.overrideComponent(HeroDetail, {
  set: {providers: [{provide: HeroDetailService, useClass: HeroDetailServiceSpy}]},
});
```

Он принимает два аргумента: тип компонента для переопределения \(`HeroDetail`\) и объект переопределения метаданных.
[Объект переопределения метаданных](/guide/testing/utility-apis#testbed-class-summary) — generic, определённый так:

```ts
type MetadataOverride<T> = {
  add?: Partial<T>;
  remove?: Partial<T>;
  set?: Partial<T>;
};
```

Объект переопределения метаданных может либо добавлять-и-удалять элементы в свойствах метаданных, либо полностью сбрасывать эти свойства.
Этот пример сбрасывает метаданные `providers` компонента.

Параметр типа `T` — это вид метаданных, который вы передали бы декоратору `@Component`:

```ts
selector?: string;
template?: string;
templateUrl?: string;
providers?: any[];
…
```

### Предоставление _spy stub_ (`HeroDetailServiceSpy`) {#provide-a-spy-stub-herodetailservicespy}

Этот пример полностью заменяет массив `providers` компонента новым массивом, содержащим `HeroDetailServiceSpy`.

`HeroDetailServiceSpy` — stub-версия реального `HeroDetailService`, которая подделывает все необходимые возможности этого сервиса.
Она не внедряет и не делегирует нижнеуровневому `HeroService`, поэтому тестовый двойник для него не нужен.

Связанные тесты компонента `HeroDetail` будут утверждать, что методы `HeroDetailService` вызывались, шпионя за методами сервиса.
Соответственно, stub реализует свои методы как spies:

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

### Тесты переопределения {#the-override-tests}

Теперь тесты могут напрямую управлять героем компонента, манипулируя `testHero` spy-stub, и подтверждать, что методы сервиса вызывались.

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

### Дополнительные переопределения {#more-overrides}

Метод `TestBed.overrideComponent` можно вызывать несколько раз для одного или разных компонентов.
`TestBed` предлагает похожие методы `overrideDirective`, `overrideModule` и `overridePipe` для углубления и замены частей этих других классов.

Исследуйте варианты и комбинации самостоятельно.
