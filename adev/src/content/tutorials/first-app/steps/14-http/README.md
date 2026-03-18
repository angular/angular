# Добавление HTTP-взаимодействия в приложение {#add-http-communication-to-your-app}

В этом уроке показано, как интегрировать HTTP и API в ваше приложение.

До этого момента ваше приложение читало данные из статического массива в сервисе Angular. Следующий шаг — использовать JSON-сервер, с которым ваше приложение будет общаться через HTTP. HTTP-запросы будут имитировать работу с данными, поступающими с сервера.

<docs-video src="https://www.youtube.com/embed/5K10oYJ5Y-E?si=TiuNKx_teR9baO7k"/>

ВАЖНО: Для этого шага руководства рекомендуется использовать локальную среду.

## Чему вы научитесь {#what-youll-learn}

Ваше приложение будет использовать данные с JSON-сервера.

<docs-workflow>

<docs-step title="Configure the JSON server">
JSON Server — это инструмент с открытым исходным кодом для создания имитации REST API. Вы будете использовать его для предоставления данных об объектах жилья, которые в настоящее время хранятся в сервисе жилья.

1. Установите `json-server` из npm с помощью следующей команды.

   ```bash
   npm install -g json-server
   ```

1. В корневой директории вашего проекта создайте файл `db.json`. В нём будут храниться данные для `json-server`.

1. Откройте `db.json` и скопируйте следующий код в файл

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

1. Сохраните этот файл.

1. Время протестировать конфигурацию. В командной строке в корне проекта выполните следующие команды.

   ```bash
   json-server --watch db.json
   ```

1. В браузере перейдите на `http://localhost:3000/locations` и убедитесь, что ответ содержит данные из `db.json`.

Если у вас возникли трудности с конфигурацией, дополнительные сведения можно найти в [официальной документации](https://www.npmjs.com/package/json-server).
</docs-step>

<docs-step title="Update service to use web server instead of local array">
Источник данных настроен, следующий шаг — обновить веб-приложение для подключения к нему.

1.  В `src/app/housing.service.ts` внесите следующие изменения:

1.  Удалите свойство `housingLocationList` и массив с данными, а также свойство `baseUrl`.

1.  Добавьте строковое свойство `url` и установите его значение равным `'http://localhost:3000/locations'`

    <docs-code header="Add url property to housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[8]"/>

    Этот код вызовет ошибки в остальной части файла, поскольку он зависит от свойства `housingLocationList`. Далее мы обновим методы сервиса.

1.  Обновите функцию `getAllHousingLocations`, чтобы она выполняла вызов к настроенному веб-серверу.

     <docs-code header="Update the getAllHousingLocations method in housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[10,13]"/>

    Теперь код использует асинхронный код для выполнения **GET**-запроса через HTTP.

    ПОЛЕЗНО: В данном примере код использует `fetch`. Для более сложных случаев использования рассмотрите `HttpClient`, предоставляемый Angular.

1.  Обновите функцию `getHousingLocationsById`, чтобы она выполняла вызов к настроенному веб-серверу.

    ПОЛЕЗНО: Обратите внимание, что метод `fetch` обновлён для _запроса_ данных о локации с соответствующим значением свойства `id`. Подробнее см. [URL Search Parameter](https://developer.mozilla.org/en-US/docs/Web/API/URL/search).

     <docs-code header="Update the getHousingLocationById method in housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[15,19]"/>

1.  После внесения всех обновлений ваш обновлённый сервис должен соответствовать следующему коду.

     <docs-code header="Final version of housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[1,25]" />

</docs-step>

<docs-step title="Update the components to use asynchronous calls to the housing service">
Теперь сервер читает данные из HTTP-запроса, но компоненты, которые зависят от сервиса, имеют ошибки, поскольку они были запрограммированы для использования синхронной версии сервиса.

1.  В `src/app/home/home.ts` обновите `constructor` для использования новой асинхронной версии метода `getAllHousingLocations`. Поскольку мы не использовали сигналы для состояния, вам нужно уведомить Angular об изменении, требующем синхронизации. Вызовите `this.changeDetectorRef.markForCheck()` для этого.

      <docs-code header="Update constructor in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/home/home.ts" visibleLines="[30,38]"/>

1.  В `src/app/details/details.ts` обновите `constructor` для использования новой асинхронной версии метода `getHousingLocationById`. Как и прежде, вам также нужно вызвать `this.changeDetectorRef.markForCheck()` для уведомления Angular об изменениях.

      <docs-code header="Update constructor in details.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/details/details.ts" visibleLines="[60,66]"/>

1.  Сохраните код.

1.  Откройте приложение в браузере и убедитесь, что оно работает без ошибок.
    </docs-step>

</docs-workflow>

ПРИМЕЧАНИЕ: Этот урок использует браузерный API `fetch`. Для поддержки перехватчиков обратитесь к [документации Http Client](/guide/http).

РЕЗЮМЕ: В этом уроке вы обновили приложение для использования локального веб-сервера (`json-server`) и асинхронных методов сервиса для получения данных.

Поздравляем! Вы успешно завершили это руководство и готовы продолжить своё путешествие по созданию ещё более сложных приложений Angular.

Если вы хотите узнать больше, рассмотрите возможность прохождения других [руководств](tutorials) и изучения [гайдов](overview) Angular.
