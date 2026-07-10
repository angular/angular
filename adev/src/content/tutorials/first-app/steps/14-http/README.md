# Добавьте HTTP-взаимодействие в приложение

Этот туториал показывает, как интегрировать HTTP и API в приложение.

До этого момента приложение читало данные из статического массива в Angular-сервисе. Следующий шаг — использовать JSON-сервер, с которым приложение будет общаться по HTTP. HTTP-запрос имитирует работу с данными с сервера.

<docs-video src="https://www.youtube.com/embed/5K10oYJ5Y-E?si=TiuNKx_teR9baO7k"/>

IMPORTANT: Для этого шага туториала рекомендуем использовать локальную среду.

## Чему вы научитесь {#what-youll-learn}

Приложение будет использовать данные с JSON-сервера

<docs-workflow>

<docs-step title="Configure the JSON server">
JSON Server — открытый инструмент для создания mock REST API. Вы используете его для отдачи данных о жилье, которые сейчас хранятся в housing-сервисе.

1. Установите `json-server` из npm следующей командой.

   ```bash
   npm install -g json-server
   ```

1. В корневом каталоге проекта создайте файл `db.json`. Здесь будут храниться данные для `json-server`.

1. Откройте `db.json` и скопируйте в файл следующий код

   ```json
   {
     "locations": [
       {
         "id": 0,
         "name": "Acme Fresh Start Housing",
         "city": "Chicago",
         "state": "IL",
         "photo": "https://angular.dev/assets/images/tutorials/common/bernard-hermant-CLKGGwIBTaY-unsplash.jpg",
         "availableUnits": 4,
         "wifi": true,
         "laundry": true
       },
       {
         "id": 1,
         "name": "A113 Transitional Housing",
         "city": "Santa Monica",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/brandon-griggs-wR11KBaB86U-unsplash.jpg",
         "availableUnits": 0,
         "wifi": false,
         "laundry": true
       },
       {
         "id": 2,
         "name": "Warm Beds Housing Support",
         "city": "Juneau",
         "state": "AK",
         "photo": "https://angular.dev/assets/images/tutorials/common/i-do-nothing-but-love-lAyXdl1-Wmc-unsplash.jpg",
         "availableUnits": 1,
         "wifi": false,
         "laundry": false
       },
       {
         "id": 3,
         "name": "Homesteady Housing",
         "city": "Chicago",
         "state": "IL",
         "photo": "https://angular.dev/assets/images/tutorials/common/ian-macdonald-W8z6aiwfi1E-unsplash.jpg",
         "availableUnits": 1,
         "wifi": true,
         "laundry": false
       },
       {
         "id": 4,
         "name": "Happy Homes Group",
         "city": "Gary",
         "state": "IN",
         "photo": "https://angular.dev/assets/images/tutorials/common/krzysztof-hepner-978RAXoXnH4-unsplash.jpg",
         "availableUnits": 1,
         "wifi": true,
         "laundry": false
       },
       {
         "id": 5,
         "name": "Hopeful Apartment Group",
         "city": "Oakland",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/r-architecture-JvQ0Q5IkeMM-unsplash.jpg",
         "availableUnits": 2,
         "wifi": true,
         "laundry": true
       },
       {
         "id": 6,
         "name": "Seriously Safe Towns",
         "city": "Oakland",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/phil-hearing-IYfp2Ixe9nM-unsplash.jpg",
         "availableUnits": 5,
         "wifi": true,
         "laundry": true
       },
       {
         "id": 7,
         "name": "Hopeful Housing Solutions",
         "city": "Oakland",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/r-architecture-GGupkreKwxA-unsplash.jpg",
         "availableUnits": 2,
         "wifi": true,
         "laundry": true
       },
       {
         "id": 8,
         "name": "Seriously Safe Towns",
         "city": "Oakland",
         "state": "CA",
         "photo": "https://angular.dev/assets/images/tutorials/common/saru-robert-9rP3mxf8qWI-unsplash.jpg",
         "availableUnits": 10,
         "wifi": false,
         "laundry": false
       },
       {
         "id": 9,
         "name": "Capital Safe Towns",
         "city": "Portland",
         "state": "OR",
         "photo": "https://angular.dev/assets/images/tutorials/common/webaliser-_TPTXZd9mOo-unsplash.jpg",
         "availableUnits": 6,
         "wifi": true,
         "laundry": true
       }
     ]
   }
   ```

1. Сохраните файл.

1. Время проверить конфигурацию. Из командной строки в корне проекта выполните следующие команды.

   ```bash
   json-server --watch db.json
   ```

1. В браузере откройте `http://localhost:3000/locations` и убедитесь, что ответ включает данные из `db.json`.

Если возникнут проблемы с конфигурацией, подробности — в [официальной документации](https://www.npmjs.com/package/json-server).
</docs-step>

<docs-step title="Update service to use web server instead of local array">
Источник данных настроен; следующий шаг — обновить веб-приложение, чтобы подключиться к нему и использовать данные.

1.  В `src/app/housing.service.ts` внесите следующие изменения:

1.  Обновите код: удалите свойство `housingLocationList` и массив с данными, а также свойство `baseUrl`.

1.  Добавьте строковое свойство `url` со значением `'http://localhost:3000/locations'`

    <docs-code header="Add url property to housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[8]"/>

    Этот код приведёт к ошибкам в остальной части файла, потому что она зависит от свойства `housingLocationList`. Далее мы обновим методы сервиса.

1.  Обновите функцию `getAllHousingLocations`, чтобы она обращалась к настроенному веб-серверу.

     <docs-code header="Update the getAllHousingLocations method in housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[10,13]"/>

    Код теперь использует асинхронный код для **GET**-запроса по HTTP.

    HELPFUL: В этом примере код использует `fetch`. Для более сложных сценариев рассмотрите `HttpClient` от Angular.

1.  Обновите функцию `getHousingLocationsById`, чтобы она обращалась к настроенному веб-серверу.

    HELPFUL: Обратите внимание: метод `fetch` обновлён, чтобы _запрашивать_ данные локации с совпадающим значением свойства `id`. См. [URL Search Parameter](https://developer.mozilla.org/en-US/docs/Web/API/URL/search) для подробностей.

     <docs-code header="Update the getHousingLocationById method in housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[15,19]"/>

1.  После всех обновлений сервис должен соответствовать следующему коду.

     <docs-code header="Final version of housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[1,25]" />

</docs-step>

<docs-step title="Update the components to use asynchronous calls to the housing service">
Сервер теперь читает данные из HTTP-запроса, но компоненты, зависящие от сервиса, имеют ошибки, потому что были написаны под синхронную версию сервиса.

1.  В `src/app/home/home.ts` обновите `constructor`, чтобы использовать новую асинхронную версию метода `getAllHousingLocations`. Поскольку для состояния не использовались сигналы, нужно уведомить Angular об изменении, требующем синхронизации. Вызовите `this.changeDetectorRef.markForCheck()` для этого.

      <docs-code header="Update constructor in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/home/home.ts" visibleLines="[30,38]"/>

1.  В `src/app/details/details.ts` обновите `constructor`, чтобы использовать новую асинхронную версию метода `getHousingLocationById`. Как и раньше, также вызовите `this.changeDetectorRef.markForCheck()`, чтобы уведомить Angular об изменениях.

      <docs-code header="Update constructor in details.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/details/details.ts" visibleLines="[60,66]"/>

1.  Сохраните код.

1.  Откройте приложение в браузере и убедитесь, что оно работает без ошибок.
    </docs-step>

</docs-workflow>

NOTE: Этот урок опирается на browser API `fetch`. Для поддержки interceptor см. [документацию HTTP-клиента](/guide/http)

SUMMARY: В этом уроке вы обновили приложение для работы с локальным веб-сервером (`json-server`) и асинхронными методами сервиса для получения данных.

Поздравляем! Вы успешно завершили этот туториал и готовы продолжать путь, создавая ещё более сложные Angular-приложения.

Чтобы узнать больше, рассмотрите другие [туториалы](tutorials) и [руководства](overview) Angular для разработчиков.
