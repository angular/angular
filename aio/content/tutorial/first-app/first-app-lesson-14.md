# Lesson 14: Add HTTP communication to your app

This tutorial demonstrates how to integrate HTTP and an API into your app. 

Up until this point your app has read data from a static array in an Angular service. The next step is to use a JSON server that your app will communicate with over HTTP. The HTTP request will simulate the experience of working with data from a server.

**Estimated time**: ~15 minutes

**Starting code:** <live-example name="first-app-lesson-13"></live-example>

**Completed code:** <live-example name="first-app-lesson-14"></live-example>

## What you'll learn

Your app will use data from a JSON server

## Step 1 - Configure the JSON server
JSON Server is an open source tool used to create mock REST APIs. You'll use it to serve the housing location data that is currently stored in the housing service.

1.  Install `json-server` from npm by using the following command.
    <code-example language="bash" format="bash">
        npm install -g json-server
    </code-example>

1.  In the root directory of your project, create a file called `db.json`. This is where you will store the data for the `json-server`.

1.  Open `db.json` and copy the following code into the file
    <code-example language="json" format="json">
        {
            "locations": [
                {
                    "id": 0,
                    "name": "Acme Fresh Start Housing",
                    "city": "Chicago",
                    "state": "IL",
                    "photo": "https://angular.io/assets/images/tutorials/faa/bernard-hermant-CLKGGwIBTaY-unsplash.jpg",
                    "availableUnits": 4,
                    "wifi": true,
                    "laundry": true
                },
                {
                    "id": 1,
                    "name": "A113 Transitional Housing",
                    "city": "Santa Monica",
                    "state": "CA",
                    "photo": "https://angular.io/assets/images/tutorials/faa/brandon-griggs-wR11KBaB86U-unsplash.jpg",
                    "availableUnits": 0,
                    "wifi": false,
                    "laundry": true
                },
                {
                    "id": 2,
                    "name": "Warm Beds Housing Support",
                    "city": "Juneau",
                    "state": "AK",
                    "photo": "https://angular.io/assets/images/tutorials/faa/i-do-nothing-but-love-lAyXdl1-Wmc-unsplash.jpg",
                    "availableUnits": 1,
                    "wifi": false,
                    "laundry": false
                },
                {
                    "id": 3,
                    "name": "Homesteady Housing",
                    "city": "Chicago",
                    "state": "IL",
                    "photo": "https://angular.io/assets/images/tutorials/faa/ian-macdonald-W8z6aiwfi1E-unsplash.jpg",
                    "availableUnits": 1,
                    "wifi": true,
                    "laundry": false
                },
                {
                    "id": 4,
                    "name": "Happy Homes Group",
                    "city": "Gary",
                    "state": "IN",
                    "photo": "https://angular.io/assets/images/tutorials/faa/krzysztof-hepner-978RAXoXnH4-unsplash.jpg",
                    "availableUnits": 1,
                    "wifi": true,
                    "laundry": false
                },
                {
                    "id": 5,
                    "name": "Hopeful Apartment Group",
                    "city": "Oakland",
                    "state": "CA",
                    "photo": "https://angular.io/assets/images/tutorials/faa/r-architecture-JvQ0Q5IkeMM-unsplash.jpg",
                    "availableUnits": 2,
                    "wifi": true,
                    "laundry": true
                },
                {
                    "id": 6,
                    "name": "Seriously Safe Towns",
                    "city": "Oakland",
                    "state": "CA",
                    "photo": "https://angular.io/assets/images/tutorials/faa/phil-hearing-IYfp2Ixe9nM-unsplash.jpg",
                    "availableUnits": 5,
                    "wifi": true,
                    "laundry": true
                },
                {
                    "id": 7,
                    "name": "Hopeful Housing Solutions",
                    "city": "Oakland",
                    "state": "CA",
                    "photo": "https://angular.io/assets/images/tutorials/faa/r-architecture-GGupkreKwxA-unsplash.jpg",
                    "availableUnits": 2,
                    "wifi": true,
                    "laundry": true
                },
                {
                    "id": 8,
                    "name": "Seriously Safe Towns",
                    "city": "Oakland",
                    "state": "CA",
                    "photo": "https://angular.io/assets/images/tutorials/faa/saru-robert-9rP3mxf8qWI-unsplash.jpg",
                    "availableUnits": 10,
                    "wifi": false,
                    "laundry": false
                },
                {
                    "id": 9,
                    "name": "Capital Safe Towns",
                    "city": "Portland",
                    "state": "OR",
                    "photo": "https://angular.io/assets/images/tutorials/faa/webaliser-_TPTXZd9mOo-unsplash.jpg",
                    "availableUnits": 6,
                    "wifi": true,
                    "laundry": true
                }
            ]
        }
    </code-example>

1.  Save this file.

1.  Time to test your configuration. From the command line, at the root of your project run the following commands.

    <code-example language="bash" format="bash">
        json-server --watch db.json
    </code-example>

1.  In your web browser, navigate to the `http://localhost:3000/locations` and confirm that the response includes the data stored in `db.json`.

If you have any trouble with your configuration, you can find more details in the [official documentation](https://www.npmjs.com/package/json-server).

## Step 2 - Update service to use web server instead of local array
The data source has been configured, the next step is to update your web app to connect to it use the data.

1.  In `src/app/housing.service.ts`, make the following changes:

    1.  Update the code to remove `housingLocationList` property and the array containing the data.

    1.  Add a string property called `url` and set its value to `'http://localhost:3000/locations'`
        
        <code-example language="javascript" format="javascript">
        url = 'http://localhost:3000/locations';
        </code-example>

        This code will result in errors in the rest of the file because it depends on the `housingLocationList` property. We're going to update the service methods next.

    1.  Update the `getAllHousingLocations` function to make a call to the web server you configured.

        <code-example header="" path="first-app-lesson-14/src/app/housing.service.ts" region="update-getAllHousingLocations"></code-example>

        The code now uses asynchronous code to make a **GET** request over HTTP.
        
        <div class="callout is-helpful">
        For this example, the code uses `fetch`. For more advanced use cases consider using `HttpClient` provided by Angular.
        </div>

    1.  Update the `getHousingLocationsById` function to make a call to the web server you configured.

        <code-example header="" path="first-app-lesson-14/src/app/housing.service.ts" region="update-getHousingLocationById"></code-example>

    1. Once all the updates are complete, your updated service should match the following code.

        <code-example header="Final version of housing.service.ts" path="first-app-lesson-14/src/app/housing.service.ts"></code-example>

## Step 3 - Update the components to use asynchronous calls to the housing service
The server is now reading data from the HTTP request but the components that rely on the service now have errors because they were programmed to use the synchronous version of the service.

1.  In `src/app/home/home.component.ts`, update the `constructor` to use the new asynchronous version of the `getAllHousingLocations` method.

    <code-example header="" path="first-app-lesson-14/src/app/home/home.component.ts" region="update-home-component-constructor"></code-example>

1.  In `src/app/details/details.component.ts`, update the `constructor` to use the new asynchronous version of the `getHousingLocationById` method.

    <code-example header="" path="first-app-lesson-14/src/app/details/details.component.ts" region="update-details-component-constructor"></code-example>

1. Save your code.

1. Open the application in the browser and confirm that it runs without any errors.

## Lesson review
In this lesson, you updated your app to:
* use a local web server (`json-server`)
* use asynchronous service methods to retrieve data.

Congratulations! You've successfully completed this tutorial and are ready to continue your journey with building even more complex Angular Apps. If you would like to learn more, please consider completing some of Angular's other developer [tutorials](tutorial) and [guides](/guide/developer-guide-overview).

@reviewed 2023-07-12
