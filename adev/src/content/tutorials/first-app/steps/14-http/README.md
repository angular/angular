# Добавление HTTP-взаимодействия в приложение {#add-http-communication-to-your-app}

В этом уроке показано, как интегрировать HTTP и API в приложение.

До этого момента приложение считывало данные из статического массива в Angular-Сервисе. Следующий шаг — использование JSON-сервера, с которым приложение будет взаимодействовать по HTTP. HTTP-запрос будет имитировать опыт работы с данными с сервера.

<docs-video src="https://www.youtube.com/embed/5K10oYJ5Y-E?si=TiuNKx_teR9baO7k"/>

IMPORTANT: Для этого шага урока рекомендуется использовать локальную среду.

## Что вы узнаете {#what-youll-learn}

Ваше приложение будет использовать данные от JSON-сервера

<docs-workflow>

<docs-step title="Настройте JSON-сервер">
JSON Server — это инструмент с открытым исходным кодом, используемый для создания имитационных REST API. Вы будете использовать его для предоставления данных об объектах жилья, которые в данный момент хранятся в Сервисе жилья.

1. Установите `json-server` из npm с помощью следующей команды.

   ```bash
   npm install -g json-server
   ```

1. В корневой директории проекта создайте файл `db.json`. Здесь будут храниться данные для `json-server`.

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

1. Время протестировать конфигурацию. Из командной строки в корневой директории проекта выполните следующие команды.

   ```bash
   json-server --watch db.json
   ```

1. В браузере перейдите по адресу `http://localhost:3000/locations` и убедитесь, что ответ содержит данные, хранящиеся в `db.json`.

При возникновении проблем с конфигурацией более подробная информация доступна в [официальной документации](https://www.npmjs.com/package/json-server).
</docs-step>

<docs-step title="Обновите Сервис для использования веб-сервера вместо локального массива">
Источник данных настроен, следующий шаг — обновить веб-приложение для подключения к нему и использования данных.

1.  В `src/app/housing.service.ts` внесите следующие изменения:

1.  Обновите код, удалив свойство `housingLocationList` и массив с данными, а также свойство `baseUrl`.

1.  Добавьте строковое свойство `url` и установите его значение равным `'http://localhost:3000/locations'`

    <docs-code header="Add url property to housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[8]"/>

    Этот код приведёт к ошибкам в остальной части файла, поскольку она зависит от свойства `housingLocationList`. Далее мы обновим методы Сервиса.

1.  Обновите функцию `getAllHousingLocations` для выполнения запроса к настроенному веб-серверу.

     <docs-code header="Update the getAllHousingLocations method in housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[10,13]"/>

    Теперь код использует асинхронный код для выполнения **GET**-запроса по HTTP.

    HELPFUL: В этом примере используется `fetch`. Для более сложных случаев использования рассмотрите `HttpClient`, предоставляемый Angular.

1.  Обновите функцию `getHousingLocationsById` для выполнения запроса к настроенному веб-серверу.

    HELPFUL: Обратите внимание, что метод `fetch` был обновлён для _запроса_ данных объекта с совпадающим значением свойства `id`. Дополнительную информацию см. в [URL Search Parameter](https://developer.mozilla.org/en-US/docs/Web/API/URL/search).

     <docs-code header="Update the getHousingLocationById method in housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[15,19]"/>

1.  После завершения всех обновлений ваш обновлённый Сервис должен соответствовать следующему коду.

     <docs-code header="Final version of housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[1,25]" />

</docs-step>

<docs-step title="Обновите Компоненты для использования асинхронных вызовов Сервиса жилья">
Сервер теперь считывает данные из HTTP-запроса, но Компоненты, которые зависят от Сервиса, теперь содержат ошибки, потому что они были запрограммированы для использования синхронной версии Сервиса.

1.  В `src/app/home/home.ts` обновите `constructor` для использования новой асинхронной версии метода `getAllHousingLocations`. Поскольку мы не использовали Сигналы для нашего состояния, необходимо уведомить Angular об изменении, требующем синхронизации. Вызовите `this.changeDetectorRef.markForCheck()` для этого.

      <docs-code header="Update constructor in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/home/home.ts" visibleLines="[30,38]"/>

1.  В `src/app/details/details.ts` обновите `constructor` для использования новой асинхронной версии метода `getHousingLocationById`. Как и прежде, необходимо также вызвать `this.changeDetectorRef.markForCheck()`, чтобы уведомить Angular об изменениях.

      <docs-code header="Update constructor in details.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/details/details.ts" visibleLines="[60,66]"/>

1.  Сохраните код.

1.  Откройте приложение в браузере и убедитесь, что оно работает без ошибок.
    </docs-step>

</docs-workflow>

NOTE: Этот урок использует браузерный API `fetch`. Для поддержки перехватчиков обратитесь к [документации по Http Client](/guide/http)

SUMMARY: В этом уроке вы обновили приложение для использования локального веб-сервера (`json-server`) и асинхронных методов Сервиса для получения данных.

Поздравляем! Вы успешно завершили этот урок и готовы продолжить создание более сложных Angular-приложений.

Для получения дополнительных знаний рекомендуем пройти другие [уроки](tutorials) и [руководства](overview) для разработчиков Angular.
