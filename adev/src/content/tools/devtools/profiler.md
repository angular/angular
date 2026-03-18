# Профилирование приложения

Вкладка **Profiler** позволяет визуализировать выполнение механизма обнаружения изменений Angular.
Это полезно для определения того, когда и как обнаружение изменений влияет на производительность вашего приложения.

<img src="assets/images/guide/devtools/profiler.png" alt="A screenshot of the 'Profiler' tab which reads 'Click the play button to start a new recording, or upload a json file containing profiler data.' Next to this is a record button to begin recording a new profile as well as a file picker to select an existing profile.">

Вкладка Profiler позволяет начать профилирование текущего приложения или импортировать существующий профиль из предыдущего запуска.
Чтобы начать профилирование приложения, наведите курсор на круг в верхнем левом углу вкладки **Profiler** и нажмите **Start recording**.

Во время профилирования Angular DevTools фиксирует события выполнения, такие как обнаружение изменений и выполнение lifecycle hooks.
Взаимодействуйте с приложением для запуска обнаружения изменений и генерации данных, которые Angular DevTools может использовать.
Чтобы завершить запись, снова нажмите на круг — **Stop recording**.

Вы также можете импортировать существующую запись.
Подробнее об этой функции читайте в разделе [Импорт записи](tools/devtools/profiler#import-and-export-recordings).

## Анализ выполнения приложения {#understand-your-applications-execution}

После записи или импорта профиля Angular DevTools отображает визуализацию циклов обнаружения изменений.

<img src="assets/images/guide/devtools/default-profiler-view.png" alt="A screenshot of the 'Profiler' tab after a profile has been recorded or uploaded. It displays a bar chart illustrating various change detection cycles with some text which reads 'Select a bar to preview a particular change detection cycle'.">

Каждый столбик в последовательности представляет один цикл обнаружения изменений в приложении.
Чем выше столбик, тем больше времени приложение провело в обнаружении изменений в этом цикле.
При выборе столбика DevTools отображает полезную информацию о нём, включая:

- Столбчатую диаграмму со всеми компонентами и директивами, захваченными в этом цикле
- Время, затраченное Angular на обнаружение изменений в этом цикле
- Оценочную частоту кадров, ощущаемую пользователем (если ниже 60fps)

<img src="assets/images/guide/devtools/profiler-selected-bar.png" alt="A screenshot of the 'Profiler' tab. A single bar has been selected by the user and a nearby dropdown menu displays 'Bar chart`, showing a second bar chart underneath it. The new chart has two bars which take up the majority of the space, one labeled `TodosComponent` and the other labeled `NgForOf`. The other bars are small enough to be negligible in comparison.">

## Анализ выполнения компонентов {#understand-component-execution}

Столбчатая диаграмма, отображаемая после нажатия на цикл обнаружения изменений, показывает детальное представление о том, сколько времени приложение провело в обнаружении изменений в конкретном компоненте или директиве.

В этом примере показано общее время, затраченное директивой `NgForOf`, и какой метод на ней был вызван.

<img src="assets/images/guide/devtools/directive-details.png" alt="A screenshot of the 'Profiler' tab where the `NgForOf` bar is selected. A detailed view of `NgForOf` is visible to the right where it lists 'Total time spent: 1.76 ms'. It includes a with exactly one row, listing `NgForOf` as a directives with an `ngDoCheck` method which took 1.76 ms. It also includes a list labeled 'Parent Hierarchy' containing the parent components of this directive.">

## Иерархические представления {#hierarchical-views}

<img src="assets/images/guide/devtools/flame-graph-view.png" alt="A screenshot of the 'Profiler' tab. A single bar has been selected by the user and a nearby dropdown menu now displays 'Flame graph', showing a flame graph underneath it. The flame graph starts with a row called 'Entire application' and another row called 'AppComponent'. Beneath those, the rows start to break up into multiple items, starting with `[RouterOutlet]` and `DemoAppComponent` on the third row. A few layers deep, one cell is highlighted red.">

Вы также можете визуализировать выполнение обнаружения изменений в виде flame graph.

Каждая плитка на графике представляет элемент на экране в определённой позиции в дереве рендеринга.
Например, рассмотрим цикл обнаружения изменений, в котором `LoggedOutUserComponent` удаляется и на его место Angular рендерит `LoggedInUserComponent`. В этом сценарии оба компонента будут отображены в одной плитке.

Ось X представляет полное время, затраченное на рендеринг этого цикла обнаружения изменений.
Ось Y представляет иерархию элементов. Запуск обнаружения изменений для элемента требует рендеринга его директив и дочерних компонентов.
Вместе этот граф визуализирует, какие компоненты занимают больше всего времени на рендеринг и куда уходит это время.

Каждая плитка окрашена в зависимости от того, сколько времени Angular провёл в ней.
Angular DevTools определяет интенсивность цвета по времени, затраченному относительно плитки с максимальным временем рендеринга.

При нажатии на определённую плитку вы увидите подробную информацию о ней в панели справа.
Двойной щелчок по плитке увеличивает её, что позволяет легче просматривать вложенные дочерние элементы.

## Отладка обнаружения изменений и компонентов `OnPush` {#debug-change-detection-and-onpush-components}

Обычно граф визуализирует время, затраченное на _рендеринг_ приложения для любого заданного кадра обнаружения изменений. Однако некоторые компоненты, такие как компоненты `OnPush`, перерендериваются только при изменении их input-свойств. Полезно визуализировать flame graph без этих компонентов для определённых кадров.

Чтобы визуализировать только компоненты в кадре обнаружения изменений, прошедшие через процесс обнаружения изменений, установите флажок **Change detection** вверху, над flame graph.

Это представление выделяет все компоненты, прошедшие обнаружение изменений, и отображает серым цветом те, которые не прошли, например компоненты `OnPush`, которые не перерендерились.

<img src="assets/images/guide/devtools/debugging-onpush.png" alt="A screenshot of the 'Profiler' tab displaying a flame chart visualization of a change detection cycle. A checkbox labeled 'Show only change detection' is now checked. The flame graph looks very similar to before, however the color of components has changed from orange to blue. Several tiles labeled `[RouterOutlet]` are no longer highlighted with any color.">

## Импорт и экспорт записей {#import-and-export-recordings}

Нажмите кнопку **Save Profile** в верхнем правом углу записанной сессии профилирования, чтобы экспортировать её в виде JSON-файла и сохранить на диск.
Позже импортируйте файл в начальном представлении профилировщика, нажав на поле **Choose file**.

<img src="assets/images/guide/devtools/save-profile.png" alt="A screenshot of the 'Profiler' tab displaying change detection cycles. On the right side a 'Save Profile' button is visible.">
