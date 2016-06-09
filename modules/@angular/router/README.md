# Router

Managing state transitions is one of the hardest parts of building applications. This is especially true on the web, where you also need to ensure that the state is reflected in the URL. In addition, we often want to split applications into multiple bundles and load them on demand. Doing this transparently isn’t trivial.

The Angular router is designed to solve these problems. Using the router, you can declaratively specify application state, manage state transitions while taking care of the URL, and load components on demand. In this article I will discuss the API of the router, as well as the mental model and the design principles behind it.

Read the in-depth overview of the Router [here](http://victorsavkin.com/post/145672529346/angular-router).