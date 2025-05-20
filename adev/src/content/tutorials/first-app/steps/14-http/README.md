# Add HTTP communication to your app

This tutorial demonstrates how to integrate HTTP and an API into your app.

Up until this point your app has read data from a static array in an Angular service. The next step is to use a JSON server that your app will communicate with over HTTP. The HTTP request will simulate the experience of working with data from a server.

<docs-video src="https://www.youtube.com/embed/5K10oYJ5Y-E?si=TiuNKx_teR9baO7k"/>

IMPORTANT: We recommend using your local environment for this step of the tutorial.

## What you'll learn

Your app will use data from a JSON server

<docs-workflow>

<docs-step title="Configure the JSON server">
JSON Server is an open source tool used to create mock REST APIs. You'll use it to serve the housing location data that is currently stored in the housing service.

1. Install `json-server` from npm by using the following command.
    <docs-code language="bash">
        npm install -g json-server
    </docs-code>

1. In the root directory of your project, create a file called `db.json`. This is where you will store the data for the `json-server`.

1. Open `db.json` and copy the following code into the file
    <docs-code language="json">
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
    </docs-code>

1. Save this file.

1. Time to test your configuration. From the command line, at the root of your project run the following commands.

    <docs-code language="bash">
        json-server --watch db.json
    </docs-code>

1. In your web browser, navigate to the `http://localhost:3000/locations` and confirm that the response includes the data stored in `db.json`.

If you have any trouble with your configuration, you can find more details in the [official documentation](https://www.npmjs.com/package/json-server).
</docs-step>

<docs-step title="Update service to use web server instead of local array">
The data source has been configured, the next step is to update your web app to connect to it use the data.

1. In `src/app/housing.service.ts`, make the following changes:

    1. Update the code to remove `housingLocationList` property and the array containing the data.

    1. Add a string property called `url` and set its value to `'http://localhost:3000/locations'`

        <docs-code language="javascript">
        url = 'http://localhost:3000/locations';
        </docs-code>

        This code will result in errors in the rest of the file because it depends on the `housingLocationList` property. We're going to update the service methods next.

    1. Update the `getAllHousingLocations` function to make a call to the web server you configured.

        <docs-code header="" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[10,13]"/>

        The code now uses asynchronous code to make a **GET** request over HTTP.

        HELPFUL: For this example, the code uses `fetch`. For more advanced use cases consider using `HttpClient` provided by Angular.

    1. Update the `getHousingLocationsById` function to make a call to the web server you configured.
  
       HELPFUL: Notice the `fetch` method has been updated to _query_ the data for location with a matching `id` property value. See [URL Search Parameter](https://developer.mozilla.org/en-US/docs/Web/API/URL/search) for more information.

        <docs-code header="" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[15,18]"/>

    1. Once all the updates are complete, your updated service should match the following code.

        <docs-code header="Final version of housing.service.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/housing.service.ts" visibleLines="[1,24]" />

</docs-step>

<docs-step title="Update the components to use asynchronous calls to the housing service">
The server is now reading data from the HTTP request but the components that rely on the service now have errors because they were programmed to use the synchronous version of the service.

1. In `src/app/home/home.ts`, update the `constructor` to use the new asynchronous version of the `getAllHousingLocations` method.

    <docs-code header="" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/home/home.ts" visibleLines="[32,37]"/>

1. In `src/app/details/details.ts`, update the `constructor` to use the new asynchronous version of the `getHousingLocationById` method.

    <docs-code header="" path="adev/src/content/tutorials/first-app/steps/14-http/src-final/app/details/details.ts" visibleLines="[61,66]"/>

1. Save your code.

1. Open the application in the browser and confirm that it runs without any errors.
</docs-step>

</docs-workflow>

NOTE: This lesson relies on the `fetch` browser API. For the support of interceptors, please refer to the [Http Client documentation](/guide/http)

SUMMARY: In this lesson, you updated your app to use a local web server (`json-server`), and use asynchronous service methods to retrieve data.

Congratulations! You've successfully completed this tutorial and are ready to continue your journey with building even more complex Angular Apps.

If you would like to learn more, please consider completing some of Angular's other developer [tutorials](tutorials) and [guides](overview).
