# Тестирование пайпов

Вы можете тестировать [пайпы](guide/templates/pipes) без использования утилит тестирования Angular.

## Тестирование `TitleCasePipe`

Класс пайпа (Pipe) имеет один метод, `transform`, который преобразует входное значение в выходное.
Реализация `transform` редко взаимодействует с DOM.
Большинство пайпов не зависят от Angular, за исключением метаданных `@Pipe` и интерфейса.

Рассмотрим `TitleCasePipe`, который делает заглавной первую букву каждого слова.
Вот реализация с использованием регулярного выражения.

<docs-code header="title-case.pipe.ts" path="adev/src/content/examples/testing/src/app/shared/title-case.pipe.ts"/>

Все, что использует регулярные выражения, стоит тщательно тестировать. Вы можете использовать стандартные техники
модульного тестирования для проверки ожидаемых сценариев и граничных случаев.

<docs-code header="title-case.pipe.spec.ts" path="adev/src/content/examples/testing/src/app/shared/title-case.pipe.spec.ts" region="excerpt"/>

## Написание DOM-тестов для поддержки тестирования пайпа

Это тесты пайпа _в изоляции_.
Они не могут показать, правильно ли работает `TitleCasePipe` при применении в компонентах приложения.

Рассмотрите возможность добавления тестов компонента, таких как этот:

<docs-code header="hero-detail.component.spec.ts (pipe test)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.spec.ts" region="title-case-pipe"/>
