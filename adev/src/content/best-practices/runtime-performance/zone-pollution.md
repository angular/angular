# Устранение загрязнения зон {#resolving-zone-pollution}

**Zone.js** — это механизм сигнализации, который Angular использует для обнаружения возможных изменений состояния приложения. Он перехватывает асинхронные операции, такие как `setTimeout`, сетевые запросы и слушатели событий. Angular планирует обнаружение изменений на основе сигналов от Zone.js.

В некоторых случаях запланированные [задачи](https://developer.mozilla.org/docs/Web/API/HTML_DOM_API/Microtask_guide#tasks) или [микрозадачи](https://developer.mozilla.org/docs/Web/API/HTML_DOM_API/Microtask_guide#microtasks) не вносят никаких изменений в модель данных, что делает запуск обнаружения изменений ненужным. Распространённые примеры:

- `requestAnimationFrame`, `setTimeout` или `setInterval`
- Планирование задач или микрозадач сторонними библиотеками

В этом разделе рассматривается, как выявлять такие ситуации и как запускать код вне зоны Angular, чтобы избежать лишних вызовов обнаружения изменений.

## Выявление лишних вызовов обнаружения изменений {#identifying-unnecessary-change-detection-calls}

Лишние вызовы обнаружения изменений можно обнаружить с помощью Angular DevTools. Часто они появляются в виде последовательных столбцов на временной шкале профайлера с источником `setTimeout`, `setInterval`, `requestAnimationFrame` или обработчиком события. Если в приложении мало вызовов этих API, вызов обнаружения изменений, как правило, вызван сторонней библиотекой.

<img alt="Angular DevTools profiler preview showing Zone pollution" src="assets/images/best-practices/runtime-performance/zone-pollution.png">

На изображении выше видна серия вызовов обнаружения изменений, инициированных обработчиками событий, связанными с элементом. Это распространённая проблема при использовании сторонних нативных компонентов, не являющихся Angular-компонентами, которые не изменяют поведение `NgZone` по умолчанию.

## Запуск задач вне `NgZone` {#run-tasks-outside-ngzone}

В таких случаях можно указать Angular не вызывать обнаружение изменений для задач, запланированных конкретным фрагментом кода, с помощью [NgZone](/api/core/NgZone).

```ts {header:"Run outside of the Zone" , linenums}
import { Component, NgZone, OnInit, inject } from '@angular/core';

@Component(...)
class AppComponent implements OnInit {
  private ngZone = inject(NgZone);

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => setInterval(pollForUpdates, 500));
  }
}
```

Приведённый фрагмент инструктирует Angular вызвать `setInterval` вне зоны Angular и пропустить запуск обнаружения изменений после выполнения `pollForUpdates`.

Сторонние библиотеки нередко вызывают лишние циклы обнаружения изменений, когда их API вызываются внутри зоны Angular. Особенно это касается библиотек, устанавливающих слушатели событий или инициирующих другие задачи (например, таймеры, XHR-запросы и т. д.). Избегайте этих лишних циклов, вызывая API библиотек вне зоны Angular:

```ts {header:"Move the plot initialization outside of the Zone" , linenums}
import { Component, NgZone, OnInit, inject } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';

@Component(...)
class AppComponent implements OnInit {
  private ngZone = inject(NgZone);

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      Plotly.newPlot('chart', data);
    });
  }
}
```

Запуск `Plotly.newPlot('chart', data);` внутри `runOutsideAngular` указывает фреймворку, что не следует запускать обнаружение изменений после выполнения задач, запланированных логикой инициализации.

Например, если `Plotly.newPlot('chart', data)` добавляет слушатели событий к DOM-элементу, Angular не запускает обнаружение изменений после выполнения их обработчиков.

Однако иногда может потребоваться слушать события, генерируемые сторонними API. В таких случаях важно помнить, что эти слушатели событий также будут выполняться вне зоны Angular, если логика инициализации была выполнена там:

```ts {header:"Check whether the handler is called outside of the Zone" , linenums}
import { Component, NgZone, OnInit, output, inject } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';

@Component(...)
class AppComponent implements OnInit {
  private ngZone = inject(NgZone);

  plotlyClick = output<Plotly.PlotMouseEvent>();

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.createPlotly();
    });
  }

  private async createPlotly() {
    const plotly = await Plotly.newPlot('chart', data);

    plotly.on('plotly_click', (event: Plotly.PlotMouseEvent) => {
      // This handler will be called outside of the Angular zone because
      // the initialization logic is also called outside of the zone. To check
      // whether we're in the Angular zone, we can call the following:
      console.log(NgZone.isInAngularZone());
      this.plotlyClick.emit(event);
    });
  }
}
```

Если нужно отправлять события родительским компонентам и выполнять конкретную логику обновления представления, следует рассмотреть повторный вход в зону Angular, чтобы указать фреймворку запустить обнаружение изменений, или запустить обнаружение изменений вручную:

```ts {header:"Re-enter the Angular zone when dispatching event" , linenums}
import { Component, NgZone, OnInit, output, inject } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';

@Component(...)
class AppComponent implements OnInit {
  private ngZone = inject(NgZone);

  plotlyClick = output<Plotly.PlotMouseEvent>();

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.createPlotly();
    });
  }

  private async createPlotly() {
    const plotly = await Plotly.newPlot('chart', data);

    plotly.on('plotly_click', (event: Plotly.PlotMouseEvent) => {
      this.ngZone.run(() => {
        this.plotlyClick.emit(event);
      });
    });
  }
}
```

Сценарий отправки событий вне зоны Angular также может возникать. Важно помнить, что ручной запуск обнаружения изменений (например, вручную) может привести к созданию/обновлению представлений вне зоны Angular.
