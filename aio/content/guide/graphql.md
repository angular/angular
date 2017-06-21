# GraphQL


GraphQL is a network protocol, a query language for your API, and a runtime for fulfilling those queries with your existing data. The GraphQL interface is a replacement or enhancement for REST and can be used in conjunction with it.

It provides a complete and understandable description of the data in your API, gives clients the power to ask for exactly what they need and nothing more, makes it easier to evolve APIs over time, and enables powerful developer tools.


**See the <live-example name="heroes-graphql"></live-example>**.

Download the completed <live-example name="heroes-graphql" downloadOnly></live-example>.

## What is GraphQL?

GraphQL is an API query language that helps your Angular app do the following:

* Fetch exactly the information it needs from the server.
* Add type safety to your API.
* Merge multiple dependencies into one single response from the server.
* Handle server data dependency in a component structure.

It’s also important to understand these key points:

* **GraphQL is not a data source**. The GraphQL runtime works on top of any data source&mdash;SQL,
NoSql, REST, Queues, .NET servers, Java servers, or any other technology or data source.
* GraphQL solves the need of sending multiple requests to the server for different resources and
then running complex joins on the client&mdash;without the need to create a custom endpoint like REST does.
* The GraphQL specification also includes protocols for real-time push updates from the server to the client.

See the official [GraphQL](http://graphql.org/) site for a more in-depth look.

## The benefits of GraphQL with Angular

For a summary of this section, see the following [video](https://www.youtube.com/watch?v=Xx39bv-5ojA&t=1s) 
by [Jeff Cross](https://twitter.com/jeffbcross) and [Uri Goldshtein](https://twitter.com/UriGoldshtein).


<iframe type='text/html' width='560' height='315' src='https://www.youtube.com/embed/Xx39bv-5ojA' frameborder='0'>
</iframe>

### Component based API

Angular components are composable, reusable, and allow encapsulation of behaviour
and state. So how does one keep these benefits when fetching data from the server?
Without GraphQL, there are three possible solutions:

1. Using the HTTP service inside components.
2. Calling a service from a component.
3. Fetching data at the parent component and passing it down the component tree.

While these solutions are valid, they have their limitations.

The following three sections cover each of these in turn.

#### Using the HTTP service in the component

There are two potential issues with this approach:

1. Multiple redundant requests; when you render multiple components,
such as an `ngFor` with many components, each sends its own
HTTP call.
2. Inconsistent data; if two components fetch the same data but in different requests,
the data might change and not be consistent across the app.


#### Using a service

Consider the following service and component:

<code-example path="toh-pt6/src/app/hero.service.ts" region="getHero" title="hero.service.ts (Fetch by Id)">
</code-example>

<code-example path="toh-pt6/src/app/hero-detail.component.ts" region="service-fetch-by-id" title="hero-detail.component.ts (Fetch by Id)">
</code-example>

There are two potential issues here.

1. A dependency between the service and all of the components that use it
make the component no longer reusable. If you change something in the service,
it might break other components that use that service.
2. There is a main, complex point to handle batching, caching, and join logic. 
Because the logic is shared between components, the potential of things breaking increases.

#### Fetching data at the parent component and passing it down the component tree

Consider an example of the third possibility:

<code-example path="toh-pt4/src/app/hero.ts" title="Declare the API type">
</code-example>

<code-example path="toh-pt4/src/app/hero-detail.component.ts" region="declaring-component-input" title="Declare the input">
</code-example>

<code-example path="toh-pt4/src/app/app.component.ts" region="calling-component" title="Using from parent">
</code-example>

This works until you change the API of the component, which means you need to change
its parent components _all the way to the top_.
Again, this creates a dependency. This time the dependency is with the child component
all the way up to the fetching component
and _all the components in between_.

#### Solution - Component based API

Here, the data dependency is inside the component. The query reflects just 
what the single component needs and is included as part of the 
component or a wrapper component. That means that when the 
data dependency changes, the component is the only thing 
impacted. You don't have to touch any services or parent components.

Now, a single component contains all of its own data dependency changes.

The `watchQuery` function tells the Apollo Client, the GraphQL client that lets you use GraphQL in your Angular app,
what data this component needs. The Apollo Client then returns the 
necessary data to the component as an Observable.
For example, adding an `age` field to the app is 
simple because you only change the component (you cover 
this syntax [later](guide/graphql#querying)) and then modify the template accordingly:


<code-example path="heroes-graphql/src/app/hero-detail.component.1.ts" region="graphql-query-new-field" title="Adding an age field to the component">
</code-example>

<code-example path="heroes-graphql/src/app/hero-detail.component.1.html" region="template-new-field" title="Adding an age field to the template">
</code-example>

So far, you've seen how to fetch data with GraphQL for a component while 
keeping the component isolated from the rest of the app.
That solves the most time-consuming and bug provoking code 
that one usually writes in order to fetch data from the server.
You can also use GraphQL to improve efficiency.

### Network Performance

The [Tour of Heroes HTTP guide](guide/latest/tutorial/toh-pt6) 
calls `getHeroes` to fetch all heroes and their information.

That might work for simple cases but but as your app grows, `getHeroes` might fetch
more information than the app really needs for each hero.
This approach also creates a dependency between the server endpoint and the UI
component&mdash;if you change or limit the amount of information you send on the
server, you might break the components that use that endpoint.

The other approach would be to call `getHeroes`, get the ids of the heroes, and call `getHero` for each id.
That might result in _multiple requests to the server_ for one single render of the page.

With a REST API, you _always have to choose between those two options_ and 
their respective problems.

With GraphQL, you just specify the dependency of each component and a 
GraphQL client library, like the [Apollo Client](http://dev.apollodata.com/),
to merge those into **one single network request**. GraphQL sends back the information
in a single response, with exactly the information you need&mdash;no more, no
less&mdash;in exactly the structure and shape you want the data to be with 
no need to do complex joins or wait for responses.


<div class="l-sub-section">

You can work with the Apollo Client 
while still keep your existing REST services in your Angular app 
and migrate gradually from them.

</div>

### Typed API, tooling and, auto documentation

Just as TypeScript provides tooling to increase productivity and best practices,
GraphQL provides a similar solution for working with APIs.

Often, APIs are written by teams you don't have access to and
can change without notice.

With GraphQL, the schema is typed and shared between the client
and the server. As a result, just as with Angular and TypeScript, 
you get the same development experience when calling calling a remote 
API&mdash;validation and autocompletion inside the IDE at development time.

## How to use GraphQL in an Angular app

This guide uses [Apollo Client](http://dev.apollodata.com/) as the GraphQL client for Angular.
Apollo helps you query GraphQL and provides a caching layer 
with common features you need for querying a server such as 
caching, mutations, optimistic UI, real-time subscriptions, 
pagination, server-side rendering, and prefetching.

<div class="l-sub-section">

This page touches on the main points of using GraphQL with Angular. 
The full documentation can be found on the [Apollo Client website](http://dev.apollodata.com/).

</div>

The starting point for the app is the Tour of Heroes tutorial app at its end state.

**Download the starter <live-example name="heroes-graphql-starter"></live-example>**.

This guide shows you how to migrate that app from REST to GraphQL.

## Installation

First, install Apollo Client and the integration libraries from npm:

<code-example language="sh" class="code-shell">
  npm install apollo-client apollo-angular graphql-tag --save
</code-example>

<div class="l-sub-section">

This example uses `system.js` so you need to also add the configuration to it.
With other build systems, the following process will be different.

</div>

Add the following configuration to your `systemjs.config.js` file under the `map` key:

<code-example path="heroes-graphql/src/systemjs.config.extras.js" region="systemjs-apollo-client-map" title="under map: { (excerpt)">
</code-example>


Add the following configuration to your `systemjs.config.js` file under the `packages` key:

<code-example path="heroes-graphql/src/systemjs.config.extras.js" region="systemjs-apollo-client-packages" title="under packages: { (excerpt)">
</code-example>

Because you also have a running server on your app with more dependencies, you need to add additional configurations to
`systemjs.config.js` as well.

Add the following configuration to your `systemjs.config.js` file under the `map` key:

<code-example path="heroes-graphql/src/systemjs.config.extras.js" region="systemjs-graphql-server-map" title="under map: { (excerpt)">
</code-example>

Additionally, add the following configuration to your `systemjs.config.js` file under the `packages` key:

<code-example path="heroes-graphql/src/systemjs.config.extras.js" region="systemjs-graphql-server-packages" title="under packages: { (excerpt)">
</code-example>

Next, initialize the client by creating a new file called `client.ts` and 
pasting in the following code:

<code-example path="heroes-graphql/src/app/client.1.ts" title="app/client.ts">
</code-example>

So what's happening here? This is how to use the default 
initialization of Apollo which calls the `/graphql` endpoint.
First, you import `ApolloClient`, then you create a constant for the new instance of the client, 
and finally export it so that it is available to the app.

<div class="l-sub-section">

### To use a different URI for the Apollo Client
In this guide you use the default `/graphql` endpoint,
but it's good to know it is possible to change those settings.
To change the [settings](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.constructor) 
of `ApolloClient`, call its constructor with different parameters. 
Go to the [Apollo documentation](http://dev.apollodata.com/angular2/initialization.html#creating-client) for further resources.

</div>

Usually you need to query an existing server.
The server for this guide is based on the [Tour of Heroes](guide/ts/latest/tutorial/) app.
The starter app (<live-example name="heroes-graphql-starter"></live-example>) already has an in-memory GraphQL server prepared. 

Now all that's left is to connect the in-memory server to the Apollo Client configuration 
by importing `networkInterface` and adding it to the `client` constant in `client.ts`.

<code-example path="heroes-graphql/src/app/client.ts" title="client.ts">
</code-example>

<div class="l-sub-section">

In order to learn how to create the GraphQL server for this example, follow the instructions on 
[Appendix 2: Setting up a GraphQL server](guide/graphql#server).

Another important ability of Apollo is to create a mock server in one line of code based on a GraphQL schema.
Check out the [Appendix 1: Mocking a GraphQL server](guide/graphql#mock-server).

</div>

After initializing the Apollo Client, import the `ApolloModule` and `getClient` 
which you just configured in `client.ts` into the app's root module:

<code-example path="heroes-graphql/src/app/app.module.ts" region="import-apollo" title="app.module.ts (excerpt)">
</code-example>

Next, add `ApolloModule.forRoot(getClient)` to the `@NgModule` imports array. This 
is an initialization function that accepts the Apollo configuration 
you created earlier as an argument and creates a new Apollo instance for the app.

<code-example path="heroes-graphql/src/app/app.module.1.ts" region="apollo-ngmodule" title="app.module.ts (excerpt)">

</code-example>

Now Apollo is initialized and ready for use in the app. 

## Performing a query

With GraphQL you query a schema, which is organized into types and fields,
that represents the data you can query. 

The schema begins with data types and fields followed by the specific queries 
you can perform on the data. These are in turn followed by 
mutations, which are _actions_ that you 
can call on the server, similar to a POST request in REST.

Here is the schema the Tour of Heroes server in the app uses:

<code-example path="heroes-graphql/src/app/schema.ts" title="schema.ts">
</code-example>


Once you have a server, which is already prepared in this app, you can start querying data.

You will convert the `heroes.component` from quering the data from the REST endpoint to the GraphQL server.

First remove all references of the exisitng `HeroService`:

<code-example path="heroes-graphql-starter/src/app/heroes.component.1.ts" title="heroes.component.ts">

</code-example>

Now add Apollo by importing `Apollo` into `heroes.component.ts`
and injecting it into the constructor:

<code-example path="heroes-graphql/src/app/heroes.component.ts" region="import-apollo" title="heroes.component.ts (excerpt)">
</code-example>

<code-example path="heroes-graphql/src/app/heroes.component.ts" region="inject-apollo" title="heroes.component.ts (excerpt)">
</code-example>

Now that the schema is available to the app, the next step is querying it. 
In the component, import `gql` from the `graphql-tag` library. 
The `gql` function turns your query string to something `Apollo` 
can accept and understand.

<code-example path="heroes-graphql/src/app/heroes.component.ts" region="import-graphql-tag" title="heroes.component.ts">
</code-example>



In order to specify the TypeScript type of the data that is recieved, import `ApolloQueryResult` from `apollo-client`:

<code-example path="heroes-graphql/src/app/heroes.component.ts" region="import-apollo-query-result" title="import type">
</code-example>

To query data with the Apollo Client, pass a GraphQL query with the 
data and structure that you want to the `Apollo` `watchQuery` function. 
The `Apollo` ` watchQuery` function returns the data from the 
server in the form of an Observable.
Replace the `getHeroes()` function with this one:

<code-example path="heroes-graphql/src/app/heroes.component.ts" region="query-heroes" title="heroes.component.ts">
</code-example>

For more information on GraphQL queries, see the GraphQL documentation on 
[Queries and Mutations](http://graphql.org/learn/queries/).

Now, the same template that worked before still displays the results of the new query:

<code-example path="heroes-graphql/src/app/heroes.component.1.html" region="render-heroes" title="heroes.component.html">
</code-example>

At this point, if you go to the `heroes` tab, and you have a running [GraphQL server](guide/graphql#server),
the browser displays the fetched data.

## Performing a mutation

In addition to fetching data using queries, GraphQL also makes it possible to change data through mutations.

Mutations are identical to queries in syntax, the only difference being that you use the keyword `mutation` instead of `query` to indicate that you are performing writes to the backend.


<div class="l-sub-section">

You can look at a mutation as the equivalent of a POST request in REST.

</div>

GraphQL mutations, like queries, are straightforward with minimal syntax. 
Consider this example of a mutation:

<code-example language="json">
  mutation {
    addHero(heroName: "Russell Brand") {
      id
      name
    }
  }
</code-example>

First, you declare that you're writing a mutation and then specify what it does. 
To break it down, GraphQL mutations consist of two parts:
1. The mutation name with arguments (`addHero`), which represents the actual 
operation to be done on the server (just like calling a function).
2. The fields you want back from the result of the mutation, which are sent back to the client. 
In this example, they are `id` and `name`. This allows you to decide 
which fields you get back from the server, 
rather than the server dictating what's returned.

The result of the above mutation might be:

<code-example language="json">
  {
    "data": {
      "addHero": {
        "id": "69",
        "name": "Russel Brand"
      }
    }
  }
</code-example>

<div class="l-sub-section">

For an in-depth look at mutation syntax, see the [Mutations 
documentation](http://graphql.org/learn/queries/#mutations) 
at [GraphQL.org](http://graphql.org).

</div>

To use a mutation, you can use the same existing template with a function to add a hero:

<code-example path="heroes-graphql/src/app/heroes.component.html" region="add" title="heroes.component.html">
</code-example>

In the component class, there is already an `add()` function. It expects a name argument of type `string` 
and is `void` because it returns nothing.  

<code-example path="heroes-graphql/src/app/heroes.component.1.ts" region="add" title="heroes.component.ts">
</code-example>

Now for the fun part. Inside of the `add()` function, add an `addHero` mutation 
using the `apollo.mutate` function as follows:

<code-example path="heroes-graphql/src/app/heroes.component.2.ts" region="add-mutation" title="heroes.component.ts">
</code-example>

The mutation requires a variable and you pass it to the `mutate` function through the `variables` parameter.

As mentioned above, with GraphQL mutations, you specify the result you want to get back from the server.

Apollo's `mutate` function returns the result as an Observable.
The Observable returns a `mutationResult` variable that is structured 
like the `ApolloQueryResult` TypeScript type, where the generic `T` type is a `Hero` type:

<code-example language="json">
  type ApolloQueryResult&lt;T> = {
    data: T;
    loading: boolean;
    networkStatus: NetworkStatus;
  };
</code-example>

If that looks familiar, it's because that's also how you reference the `mutationResult` variable in TypeScript.
To access the hero data `mutationResult` returns, use dot notation to traverse `mutationResult` and assign it to a new hero object:

<code-example path="heroes-graphql/src/app/heroes.component.ts" region="access-mutation-result" title="heroes.component.ts">
</code-example>

Now that you have created the new object with the data, push it into the `heroes` array.

Just like a query, the `mutate` function returns an Observable you can subscribe to 
that handles the data you request.

Now your existing heroes app can add a hero using GraphQL.

<figure class='image-display'>
  <img src='generated/images/guide/graphql/heroes-graphql-mutation.gif' alt="Heroes GraphQL Mutation"></img>
</figure>

## Appendix 1: Mocking a GraphQL server

When writing a GraphQL Angular app, you are quering a shared Schema. 
Both the client and the server agree on a single schema that describes the data the client can query and the actions it can perform
on the server.

Once you have that schema, there is no need for an actual server and you can mock your server with one line of code.
That mocking is good for day to day development as well as for automatic tests for your Angular app.

Create the schema that is based on the [Tour of Heroes](guide/ts/latest/tutorial/) app.

Create a file called `schema.ts` in the `app` directory and paste in the following schema:

<code-example path="heroes-graphql/src/app/schema.ts" title="schema.ts">
</code-example>

Now that you have the schema, mock the server so you would be able to use actual data in your app.
First install the `Apollo Test Utils` library:

<code-example language="sh" class="code-shell">
  npm install apollo-test-utils --save
</code-example>

<div class="l-sub-section">

This example uses `system.js` so you need to add the configuration to it.
With other build systems, or when running on Node, the following process will be different.  

</div>

Add the following configuration to your `systemjs.config.js` file under the `map` key:

<code-example path="heroes-graphql/src/systemjs.config.extras.js" region="systemjs-apollo-test-utils-map" title="under map: { (excerpt)">
</code-example>

Add the following configuration to your `systemjs.config.js` file under the `packages` key:

<code-example path="heroes-graphql/src/systemjs.config.extras.js" region="systemjs-apollo-test-utils-packages" title="under packages: { (excerpt)">
</code-example>

Create a mocked network interface to use `apollo-test-utils` and the schema you created.

Create a file called `mockedNetworkInterface.ts` and import the schema and the tools to create a mock network interface:

<code-example path="heroes-graphql/src/app/mockedNetworkInterface.ts" region="imports" title="imports">
</code-example>

Now you need to make the schema executable, add the mocking functions to it, create the network interface, and export it:

<code-example path="heroes-graphql/src/app/mockedNetworkInterface.ts" region="create-interface" title="Create Network Interface">
</code-example>

Next, all you need to do is use that network interface in your Apollo Client instead of your regular network interface:

<code-example path="heroes-graphql/src/app/client.3.ts" region="import-and-use" title="Use Network Interface">
</code-example>

Now every time you will query Apollo Client it will return a mocked data for your client.

To dive deeper to more advanced mocking, check out the [Apollo-Test-Utils repository](https://github.com/apollographql/apollo-test-utils).

{@a server}

## Appendix 2: Setting up a GraphQL server

This example shows how to run GraphQL in the browser but running a GraphQL server on 
Node.js or in the browser is very similar.

If you don't have the option of running GraphQL on the server, 
this method makes it possible to still use GraphQL in your app with the
benefit of not needing to sync multiple REST requests and join logic 
on the client.

<div class="l-sub-section">

To read more about how to run a full GraphQL backend, see the [Apollo Server documentation](http://dev.apollodata.com/tools/).
Because the real, backend server is written in Isomorphic Javascript, 
it is almost identical to the local server in this appendix.
Everything you learn here applies to writing an actual GraphQL backend server.

Additionally, there are a few GraphQL backend-as-a-service platforms available, 
similar to Firebase, but based on the GraphQL API spec.
For help on getting up and running, see [Scaphold.io](https://www.scaphold.io/) and [Graph.Cool](https://www.graph.cool/).

</div>

In order to create a GraphQL schema, you need the `graphql-tools` library.
It allows you to write a GraphQL schema as a string and make it executable. 
In a terminal window, issue the following command:

<code-example language="sh" class="code-shell">
  npm install graphql-tools --save

</code-example>

Add the following configuration to your `systemjs.config.js` file under the `map` key:

<code-example path="heroes-graphql/src/systemjs.config.extras.js" region="systemjs-graphql-server-map" title="under map: { (excerpt)">
</code-example>

Add the following configuration to your `systemjs.config.js` file under the `packages` key:

<code-example path="heroes-graphql/src/systemjs.config.extras.js" region="systemjs-graphql-server-packages" title="under packages: { (excerpt)">

</code-example>

Next, create a file called `schema.ts` in the `app` directory 
and paste in the following schema:

<code-example path="heroes-graphql/src/app/schema.ts" title="schema.ts">
</code-example>

The schema starts with a represention of the model of data the server exposes. 
Then the schema specifies what queries are allowed on that data, followed by 
what mutations, or actions, clients are allowed to do on the server.
The end of the schema provides the definitions as the root types the GraphQL server will expose.

<div class="l-sub-section">

While the schema includes the major points covered in this cookbook, 
you can read more in the [GraphQL.org Introduction to GraphQL](http://graphql.org/learn/).

</div>

Now, create another file called `in-memory-graphql.ts` and import the schema into it:

<code-example path="heroes-graphql/src/app/in-memory-graphql.ts" region="graphql-schema" title="in-memory-graphql.ts">

</code-example>

Next, create your in-memory data:

<code-example path="heroes-graphql/src/app/in-memory-graphql.ts" region="heroes-array" title="in-memory-graphql.ts (excerpt)">

</code-example>

The next step is writing a server that _resolves_ 
the queries from the client based on the schema. 
Hence, the GraphQL server consists of _resolver 
functions_ that correspond to the _types_ of the schema.

In some server functions you use the `lodash` library so don't 
forget to install them from npm and import them:

<code-example language="sh" class="code-shell">
  npm install lodash --save  
</code-example>

<code-example path="heroes-graphql/src/app/in-memory-graphql.ts" region="import-lodash" title="in-memory-graphql.ts (imports)">

</code-example>

To create the resolvers, copy the following code and add it to `in-memory-graphql.ts`.

<code-example path="heroes-graphql/src/app/in-memory-graphql.ts" region="resolvers" title="in-memory-graphql.ts (excerpt)">

</code-example>

<div class="l-sub-section">

For the full explanation about how GraphQL resolvers work see
[Execution](http://graphql.org/learn/execution/) on [GraphQL.org](http://graphql.org/).

</div>

Notice that the server includes functions that correspond to each 
type in the schema _and_ the mutations.

This mechanism makes writing simple GraphQL servers straightforward&mdash;you simply 
resolve a specific type of data. 
This removes the coupling between the frontend and backend because you don't need to know the specific
query the client makes to create the server implementation.

Now, connect the schema to the resolvers with the `makeExecutableSchema` function from
the [graphql-tools](http://dev.apollodata.com/tools/graphql-tools/index.html) library:

<code-example path="heroes-graphql/src/app/in-memory-graphql.ts" region="import-graphql-tools" title="in-memory-graphql.ts (excerpt)">

</code-example>

<code-example path="heroes-graphql/src/app/in-memory-graphql.ts" region="make-executable-schema" title="in-memory-graphql.ts (excerpt)">

</code-example>

In the constant `schema`, `makeExecutableSchema` has two properties, 
`typeDefs` and `resolvers`. Here, you define them with the `typeDefinitions` 
and `resolveFunctions` that you created earlier in `in-memory-graphql.ts`. 
This way, your GraphQL server knows where to look for definitions and resolvers.

Now that you have an executable schema, execute it using the `graphql` 
library and export it so you can use it with the Apollo Client. 
First, `npm install`:

<code-example language="sh" class="code-shell">
  npm install graphql --save

</code-example>

Next, add an import statement for `execute`.

<code-example path="heroes-graphql/src/app/in-memory-graphql.ts" region="import-graphql" title="in-memory-graphql.ts (excerpt)">
</code-example>

Now create a new `networkInterface` class and call it `InBrowserNetworkInterface`.

This class has a `schema` property which it initializes in the constructor.

Next, the `query` function takes as an argument the query request and executes 
that query using the GraphQL `execute` function against the schema property.

You send empty objects to the `rootValue` and `contextValue` arguments of the function with `{}` and `{}` respectively 
and send the `variables` and `operationName` arguments that are related to the query request.

Lastly, export the new `InBrowserNetworkInterface` class in order to import it to the Apollo Client.

<code-example path="heroes-graphql/src/app/in-memory-graphql.ts" region="execute-and-export" title="in-memory-graphql.ts (excerpt)">

</code-example>

Now all that's left is to connect the new in-memory server to the Apollo Client configuration 
by importing `networkInterface` and adding it to the `client` constant in `client.ts`.

<code-example path="heroes-graphql/src/app/client.ts" title="client.ts">
</code-example>

That's it.  Now you can run your application as if you had a GraphQL server connected to it. 
However, there is no persistance&mdash;everything is running in-memory in the browser, 
so when you refresh the page, all changes will be lost.

Now that you have a local server set up, you have some options:
* You can store everything on the browser's local-storage using local-storage database libraries.
* You can make the resolver functions call your server's existing REST endpoint.
* You can start a separate Node GraphQL server and simply move the code into it for persistance.


## Full Example

<code-tabs>

  <code-pane title="app.comp...ts" path="heroes-graphql/src/app/app.component.ts">

  </code-pane>

  <code-pane title="app.mod...ts" path="heroes-graphql/src/app/app.module.ts">

  </code-pane>

  <code-pane title="heroes.comp...ts" path="heroes-graphql/src/app/heroes.component.ts">

  </code-pane>

  <code-pane title="heroes.comp...html" path="heroes-graphql/src/app/heroes.component.html">

  </code-pane>

  <code-pane title="heroes.comp...css" path="heroes-graphql/src/app/heroes.component.css">

  </code-pane>

  <code-pane title="hero-detail.comp...ts" path="heroes-graphql/src/app/hero-detail.component.ts">

  </code-pane>

  <code-pane title="hero-detail.comp...html" path="heroes-graphql/src/app/hero-detail.component.html">

  </code-pane>

  <code-pane title="in-memory-graphql.ts" path="heroes-graphql/src/app/in-memory-graphql.ts">

  </code-pane>

  <code-pane title="client.ts" path="heroes-graphql/src/app/client.ts">

  </code-pane>

</code-tabs>



<code-tabs>

  <code-pane title="app-routing.modules.ts" path="heroes-graphql/src/app/app-routing.module.ts">

  </code-pane>

  <code-pane title="hero-search.component.ts" path="heroes-graphql/src/app/hero-search.component.ts">

  </code-pane>

  <code-pane title="hero-search.component.html" path="heroes-graphql/src/app/hero-search.component.html">

  </code-pane>

  <code-pane title="hero-search.component.css" path="heroes-graphql/src/app/hero-search.component.css">

  </code-pane>

</code-tabs>

## Conclusion

This page covered:

- What GraphQL is and why it can benefit Angular developers.
- How to create a basic GraphQL query.
- How to create a basic GraphQL mutation.
- How to mock a GraphQL server.
- How to build a GraphQL server.


## Further resources

* [GraphQL.org](http://graphql.org/)&mdash;learn GraphQL 
for different languages and and connect with the community.
* [Apollo Developer resources](http://dev.apollodata.com/).
* [Apollo Dev Blog](https://dev-blog.apollodata.com/)&mdash;The most popular GraphQL blog.
* [Apollo Client Developer Tools](https://dev-blog.apollodata.com/apollo-client-developer-tools-ff89181ebcf#.n5f3fhbg2)&mdash;GraphQL debugging tools for Apollo Client in the Chrome developer console.
