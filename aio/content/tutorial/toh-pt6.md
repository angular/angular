@title
HTTP

@intro
We convert our service and components to use Angular's HTTP service

@description
Our stakeholders appreciate our progress.
Now they want to get the hero data from a server, let users add, edit, and delete heroes,
and save these changes back to the server.

In this chapter we teach our application to make the corresponding HTTP calls to a remote server's web API.

Run the <live-example></live-example> for this part.

## Where We Left Off

In the [previous chapter](toh-pt5.html), we learned to navigate between the dashboard and the fixed heroes list, editing a selected hero along the way.
That's our starting point for this chapter.
The application runs and updates automatically as we continue to build the Tour of Heroes.


<h1>
  Providing HTTP Services
</h1>

### Register for HTTP services

## Simulating the web API

We recommend registering application-wide services in the root
`!{_AppModuleVsAppComp}` *providers*.  <span if-docs="dart">Here we're
registering in `main` for a special reason.</span>

Our application is in the early stages of development and far from ready for production.
We don't even have a web server that can handle requests for heroes.
Until we do, *we'll have to fake it*.

We're going to *trick* the HTTP client into fetching and saving data from
a mock service, the *in-memory web API*.
<span if-docs="dart"> The application itself doesn't need to know and
shouldn't know about this.  So we'll slip the in-memory web API into the
configuration *above* the `AppComponent`.</span>

Here is a version of <span ngio-ex>!{_appModuleTsVsMainTs}</span> that performs this trick:


{@example 'toh-pt6/ts/src/app/in-memory-data.service.ts' region='init'}


<p>
  This file replaces the   <code>    </code>   which is now safe to delete.
</p>


## Heroes and HTTP

Look at our current `HeroService` implementation
We returned a !{_Promise} resolved with mock heroes.
It may have seemed like overkill at the time, but we were anticipating the
day when we fetched heroes with an HTTP client and we knew that would have to be an asynchronous operation.

That day has arrived! Let's convert `getHeroes()` to use HTTP.
Our updated import statements are now:
Refresh the browser, and the hero data should be successfully loaded from the
mock server.

<h3 id="!{_h3id}">HTTP !{_Promise}</h3>

We're still returning a !{_Promise} but we're creating it differently.
That response JSON has a single `data` property.
The `data` property holds the !{_array} of *heroes* that the caller really wants.
So we grab that !{_array} and return it as the resolved !{_Promise} value.


~~~ {.alert.is-important}

Pay close attention to the shape of the data returned by the server.
This particular *in-memory web API* example happens to return an object with a `data` property.
Your API might return something else. Adjust the code to match *your web API*.


~~~

The caller is unaware of these machinations. It receives a !{_Promise} of *heroes* just as it did before.
It has no idea that we fetched the heroes from the (mock) server.
It knows nothing of the twists and turns required to convert the HTTP response into heroes.
Such is the beauty and purpose of delegating data access to a service like this `HeroService`.

### Error Handling

At the end of `getHeroes()` we `catch` server failures and pass them to an error handler:
This is a critical step!
We must anticipate HTTP failures as they happen frequently for reasons beyond our control.
In this demo service we log the error to the console; we would do better in real life.

We've also decided to return a user friendly form of the error to
the caller in a !{rejected_promise} so that the caller can display a proper error message to the user.

### Get hero by id
The `HeroDetailComponent` asks the `HeroService` to fetch a single hero to edit.

The `HeroService` currently fetches all heroes and then finds the desired hero 
by filtering for the one with the matching `id`.
That's fine in a simulation. It's wasteful to ask a real server for _all_ heroes when we only want one.
Most web APIs support a _get-by-id_ request in the form `api/hero/:id` (e.g., `api/hero/11`).

Update the `HeroService.getHero` method to make a _get-by-id_ request,
applying what we just learned to write `getHeroes`:It's almost the same as `getHeroes`. 
The URL identifies _which_ hero the server should update by encoding the hero id into the URL
to match the `api/hero/:id` pattern.

We also adjust to the fact that the `data` in the response is a single hero object rather than !{_an} !{_array}.

### Unchanged _getHeroes_ API

Although we made significant *internal* changes to `getHeroes()` and `getHero()`, 
the public signatures did not change.
We still return a !{_Promise} from both methods. 
We won't have to update any of the components that call them.

Our stakeholders are thrilled with the web API integration so far.
Now they want the ability to create and delete heroes.

Let's see first what happens when we try to update a hero's details.

## Update hero details

We can edit a hero's name already in the hero detail view. Go ahead and try
it. As we type, the hero name is updated in the view heading.
But when we hit the `Back` button, the changes are lost!

Updates weren't lost before. What changed?
When the app used a list of mock heroes, updates were applied directly to the
hero objects within the single, app-wide, shared list. Now that we are fetching data
from a server, if we want changes to persist, we'll need to write them back to
the server.

### Save hero details

Let's ensure that edits to a hero's name aren't lost. Start by adding,
to the end of the hero detail template, a save button with a `click` event
binding that invokes a new component method named `save`:
The `save` method persists hero name changes using the hero service
`update` method and then navigates back to the previous view:
### Hero service `update` method

The overall structure of the `update` method is similar to that of
`getHeroes`, although we'll use an HTTP _put_ to persist changes
server-side:
We identify _which_ hero the server should update by encoding the hero id in
the URL. The put body is the JSON string encoding of the hero, obtained by
calling `!{_JSON_stringify}`.  We identify the body content type
(`application/json`) in the request header.

Refresh the browser and give it a try. Changes to hero names should now persist.

## Add a hero

To add a new hero we need to know the hero's name. Let's use an input
element for that, paired with an add button.

Insert the following into the heroes component HTML, first thing after
the heading:
In response to a click event, we call the component's click handler and then
clear the input field so that it will be ready to use for another name.
When the given name is non-blank, the handler delegates creation of the
named hero to the hero service, and then adds the new hero to our !{_array}.

Finally, we implement the `create` method in the `HeroService` class.Refresh the browser and create some new heroes!

## Delete a hero

Too many heroes?
Let's add a delete button to each hero in the heroes view.

Add this button element to the heroes component HTML, right after the hero
name in the repeated `<li>` tag:
The `<li>` element should now look like this:
In addition to calling the component's `delete` method, the delete button
click handling code stops the propagation of the click event &mdash; we
don't want the `<li>` click handler to be triggered because that would
select the hero that we are going to delete!

The logic of the `delete` handler is a bit trickier:
Of course, we delegate hero deletion to the hero service, but the component
is still responsible for updating the display: it removes the deleted hero
from the !{_array} and resets the selected hero if necessary.
We want our delete button to be placed at the far right of the hero entry.
This extra CSS accomplishes that:
### Hero service `delete` method

The hero service's `delete` method uses the _delete_ HTTP method to remove the hero from the server:
Refresh the browser and try the new delete functionality.

<div id='observables'>

</div>

## !{_Observable}s
But requests aren't always "one and done". We may start one request,
then cancel it, and make a different request before the server has responded to the first request.
Such a _request-cancel-new-request_ sequence is difficult to implement with *!{_Promise}s*.
It's easy with *!{_Observable}s* as we'll see.

### Search-by-name

We're going to add a *hero search* feature to the Tour of Heroes.
As the user types a name into a search box, we'll make repeated HTTP requests for heroes filtered by that name.

We start by creating `HeroSearchService` that sends search queries to our server's web api.


{@example 'toh-pt6/ts/src/app/hero-search.service.ts'}

The `!{_priv}http.get()` call in `HeroSearchService` is similar to the one
in the `HeroService`, although the URL now has a query string.
### HeroSearchComponent

Let's create a new `HeroSearchComponent` that calls this new `HeroSearchService`.

The component template is simple &mdash; just a text box and a list of matching search results.


{@example 'toh-pt6/ts/src/app/hero-search.component.html'}

We'll also want to add styles for the new component.

{@example 'toh-pt6/ts/src/app/hero-search.component.css'}

As the user types in the search box, a *keyup* event binding calls the component's `search` method with the new search box value.

The `*ngFor` repeats *hero* objects from the component's `heroes` property. No surprise there.

But, as we'll soon see, the `heroes` property is now !{_an} *!{_Observable}* of hero !{_array}s, rather than just a hero !{_array}.
The `*ngFor` can't do anything with !{_an} `!{_Observable}` until we flow it through the `async` pipe (`AsyncPipe`).
The `async` pipe subscribes to the `!{_Observable}` and produces the !{_array} of heroes to `*ngFor`.

Time to create the `HeroSearchComponent` class and metadata.


{@example 'toh-pt6/ts/src/app/hero-search.component.ts'}

#### Search terms

Let's focus on the `!{_priv}searchTerms`:
<a id="ngoninit"></a>
#### Initialize the _**heroes**_ property (_**ngOnInit**_)

<span if-docs="ts">A `Subject` is also an `Observable`.</span>
We're going to turn the stream
of search terms into a stream of `Hero` !{_array}s and assign the result to the `heroes` property.
If we passed every user keystroke directly to the `HeroSearchService`, we'd unleash a storm of HTTP requests.
Bad idea. We don't want to tax our server resources and burn through our cellular network data plan.
### Add the search component to the dashboard

We add the hero search HTML element to the bottom of the `DashboardComponent` template.


{@example 'toh-pt6/ts/src/app/dashboard.component.html'}

Finally, we import `HeroSearchComponent` from
<span ngio-ex>hero-search.component.ts</span>
and add it to the `!{_declarations}` !{_array}:
Run the app again, go to the *Dashboard*, and enter some text in the search box.
At some point it might look like this.

<figure class='image-display'>
  <img src='/resources/images/devguide/toh/toh-hero-search.png' alt="Hero Search Component">  </img>
</figure>


## Application structure and code

Review the sample source code in the <live-example></live-example> for this chapter.
Verify that we have the following structure:

## Home Stretch

We are at the end of our journey for now, but we have accomplished a lot.
- We added the necessary dependencies to use HTTP in our application.
- We refactored `HeroService` to load heroes from a web API.
- We extended `HeroService` to support post, put and delete methods.
- We updated our components to allow adding, editing and deleting of heroes.
- We configured an in-memory web API.
- We learned how to use !{_Observable}s.

Here are the files we _added or changed_ in this chapter.

### Next Step

Return to the [learning path](../guide/learning-angular.html#architecture) where 
you can read about the concepts and practices you discovered in this tutorial.