# Устранение загрязнения зоны (Zone pollution)

**Zone.js** — это механизм сигнализации, который Angular использует для определения того, когда состояние приложения
могло измениться. Он перехватывает асинхронные операции, такие как `setTimeout`, сетевые запросы и слушатели событий.
Angular планирует обнаружение изменений на основе сигналов от Zone.js.

В некоторых случаях
запланированные [задачи](https://developer.mozilla.org/docs/Web/API/HTML_DOM_API/Microtask_guide#tasks)
или [микрозадачи](https://developer.mozilla.org/docs/Web/API/HTML_DOM_API/Microtask_guide#microtasks) не вносят никаких
изменений в модель данных, что делает запуск обнаружения изменений ненужным. Распространенные примеры:

- `requestAnimationFrame`, `setTimeout` или `setInterval`
- Планирование задач или микрозадач сторонними библиотеками

В этом разделе рассматривается, как выявить такие условия и как выполнять код за пределами зоны Angular, чтобы избежать
ненужных вызовов обнаружения изменений.

## Выявление ненужных вызовов обнаружения изменений

Вы можете обнаружить ненужные вызовы обнаружения изменений с помощью Angular DevTools. Часто они отображаются в виде
последовательных полос на временной шкале профилировщика с источником `setTimeout`, `setInterval`,
`requestAnimationFrame` или обработчиком событий. Если в вашем приложении использование этих API ограничено, вызов
обнаружения изменений обычно вызван сторонней библиотекой.

<img alt="Предварительный просмотр профилировщика Angular DevTools, показывающий загрязнение зоны" src="assets/images/best-practices/runtime-performance/zone-pollution.png">

На изображении выше показана серия вызовов обнаружения изменений, инициированных обработчиками событий, связанными с
элементом. Это распространенная проблема при использовании сторонних компонентов, не являющихся нативными для Angular,
которые не изменяют поведение `NgZone` по умолчанию.

## Запуск задач за пределами `NgZone`

В таких случаях вы можете указать Angular не вызывать обнаружение изменений для задач, запланированных определенным
фрагментом кода, используя [NgZone](/api/core/NgZone).

<docs-code header="Запуск за пределами Zone" language='ts' linenums>
import { Component, NgZone, OnInit } from '@angular/core';

@Component(...)
class AppComponent implements OnInit {
private ngZone = inject(NgZone);

ngOnInit() {
this.ngZone.runOutsideAngular(() => setInterval(pollForUpdates), 500);
}
}
</docs-code>

Приведенный выше фрагмент указывает Angular вызывать `setInterval` за пределами зоны Angular и пропускать запуск
обнаружения изменений после выполнения `pollForUpdates`.

Сторонние библиотеки часто вызывают ненужные циклы обнаружения изменений, когда их API вызываются внутри зоны Angular.
Это явление особенно затрагивает библиотеки, которые устанавливают слушатели событий или инициируют другие задачи (такие
как таймеры, XHR-запросы и т. д.). Избегайте этих лишних циклов, вызывая API библиотек за пределами зоны Angular:

<docs-code header="Вынос инициализации графика за пределы Zone" language='ts' linenums>
import { Component, NgZone, OnInit } from '@angular/core';
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
</docs-code>

Запуск `Plotly.newPlot('chart', data);` внутри `runOutsideAngular` сообщает фреймворку, что не следует запускать
обнаружение изменений после выполнения задач, запланированных логикой инициализации.

Например, если `Plotly.newPlot('chart', data)` добавляет слушатели событий к DOM-элементу, Angular не будет запускать
обнаружение изменений после выполнения их обработчиков.

Но иногда вам может потребоваться слушать события, отправляемые сторонними API. В таких случаях важно помнить, что эти
слушатели событий также будут выполняться за пределами зоны Angular, если логика инициализации была выполнена там:

<docs-code header="Проверка того, вызывается ли обработчик за пределами Zone" language='ts' linenums>
import { Component, NgZone, OnInit, output } from '@angular/core';
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
      // Этот обработчик будет вызван за пределами зоны Angular, так как
      // логика инициализации также вызывается за пределами зоны. Чтобы проверить,
      // находимся ли мы в зоне Angular, можно вызвать следующее:
      console.log(NgZone.isInAngularZone());
      this.plotlyClick.emit(event);
    });

}
}
</docs-code>

Если вам нужно отправлять события родительским компонентам и выполнять определенную логику обновления представления, вам
следует рассмотреть возможность повторного входа в зону Angular, чтобы указать фреймворку запустить обнаружение
изменений, или запустить обнаружение изменений вручную:

<docs-code header="Повторный вход в зону Angular при отправке события" language='ts' linenums>
import { Component, NgZone, OnInit, output } from '@angular/core';
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
</docs-code>

Также может возникнуть сценарий отправки событий за пределами зоны Angular. Важно помнить, что запуск обнаружения
изменений (например, вручную) может привести к созданию/обновлению представлений за пределами зоны Angular.
