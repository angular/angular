# Optimizing client application size with lightweight injection tokens

This page provides a conceptual overview of a dependency injection technique that is recommended for library developers.
Designing your library with *lightweight injection tokens* helps optimize the bundle size of client applications that use your library.

You can manage the dependency structure among your components and injectable services to optimize bundle size by using [tree-shakable providers](guide/architecture-services#introduction-to-services-and-dependency-injection).
This normally ensures that if a provided component or service is never actually used by the application, the compiler can remove its code from the bundle.

Due to the way Angular stores injection tokens, it is possible that such an unused component or service can end up in the bundle anyway.
This page describes a dependency-injection design pattern that supports proper tree-shaking by using lightweight injection tokens.

The lightweight injection token design pattern is especially important for library developers.
It ensures that when an application uses only some of your library's capabilities, the unused code can be eliminated from the client's application bundle.

When an application uses your library, there might be some services that your library supplies which the client application doesn't use.
In this case, the application developer should expect that service to be tree-shaken, and not contribute to the size of the compiled application.
Because the application developer cannot know about or remedy a tree-shaking problem in the library, it is the responsibility of the library developer to do so.
To prevent the retention of unused components, your library should use the lightweight injection token design pattern.

## When tokens are retained

To better explain the condition under which token retention occurs, consider a library that provides a library-card component. This component contains a body and can contain an optional header.

<code-example format="html" language="html">

&lt;lib-card&gt;
  &lt;lib-header&gt;&hellip;&lt;/lib-header&gt;
&lt;/lib-card&gt;

</code-example>

In a likely implementation, the `<lib-card>` component uses `@ContentChild()` or `@ContentChildren()` to get `<lib-header>` and `<lib-body>`, as in the following.

<code-example format="typescript" language="typescript">

&commat;Component({
  selector: 'lib-header',
  &hellip;,
})
class LibHeaderComponent {}

&commat;Component({
  selector: 'lib-card',
  &hellip;,
})
class LibCardComponent {
  &commat;ContentChild(LibHeaderComponent)
  header: LibHeaderComponent|null = null;
}

</code-example>

Because `<lib-header>` is optional, the element can appear in the template in its minimal form, `<lib-card></lib-card>`.
In this case, `<lib-header>` is not used and you would expect it to be tree-shaken, but that is not what happens.
This is because `LibCardComponent` actually contains two references to the `LibHeaderComponent`.

<code-example format="typescript" language="typescript">

&commat;ContentChild(LibHeaderComponent) header: LibHeaderComponent;

</code-example>

*   One of these reference is in the *type position*-- that is, it specifies `LibHeaderComponent` as a type: `header: LibHeaderComponent;`.

*   The other reference is in the *value position*-- that is, LibHeaderComponent is the value of the `@ContentChild()` parameter decorator: `@ContentChild(LibHeaderComponent)`.

The compiler handles token references in these positions differently.

*   The compiler erases *type position* references after conversion from TypeScript, so they have no impact on tree-shaking.

*   The compiler must keep *value position* references at runtime, which prevents the component from being tree-shaken.

In the example, the compiler retains the `LibHeaderComponent` token that occurs in the value position. This prevents the referenced component from being tree-shaken, even if the application developer does not actually use `<lib-header>` anywhere.
If `LibHeaderComponent` 's code, template, and styles combined becomes too large, including it unnecessarily can significantly increase the size of the client application.

## When to use the lightweight injection token pattern

The tree-shaking problem arises when a component is used as an injection token.
There are two cases when that can happen.

*   The token is used in the value position of a [content query](guide/lifecycle-hooks#using-aftercontent-hooks "See more about using content queries.").
*   The token is used as a type specifier for constructor injection.

In the following example, both uses of the `OtherComponent` token cause retention of `OtherComponent`, preventing it from being tree-shaken when it is not used.

<code-example format="typescript" language="typescript">

class MyComponent {
  constructor(&commat;Optional() other: OtherComponent) {}

  &commat;ContentChild(OtherComponent)
  other: OtherComponent|null;
}

</code-example>

Although tokens used only as type specifiers are removed when converted to JavaScript, all tokens used for dependency injection are needed at runtime.
These effectively change `constructor(@Optional() other: OtherComponent)` to `constructor(@Optional() @Inject(OtherComponent) other)`.
The token is now in a value position, and causes the tree shaker to keep the reference.

<div class="alert is helpful">

For all services, a library should use [tree-shakable providers](guide/architecture-services#introduction-to-services-and-dependency-injection), providing dependencies at the root level rather than in component constructors.

</div>

## Using lightweight injection tokens

The lightweight injection token design pattern consists of using a small abstract class as an injection token, and providing the actual implementation at a later stage.
The abstract class is retained, not tree-shaken, but it is small and has no material impact on the application size.

The following example shows how this works for the `LibHeaderComponent`.

<code-example format="typescript" language="typescript">

abstract class LibHeaderToken {}

&commat;Component({
  selector: 'lib-header',
  providers: [
    {provide: LibHeaderToken, useExisting: LibHeaderComponent}
  ]
  &hellip;,
})
class LibHeaderComponent extends LibHeaderToken {}

&commat;Component({
  selector: 'lib-card',
  &hellip;,
})
class LibCardComponent {
  &commat;ContentChild(LibHeaderToken) header: LibHeaderToken|null = null;
}

</code-example>

In this example, the `LibCardComponent` implementation no longer refers to `LibHeaderComponent` in either the type position or the value position.
This lets full tree shaking of `LibHeaderComponent` take place.
The `LibHeaderToken` is retained, but it is only a class declaration, with no concrete implementation.
It is small and does not materially impact the application size when retained after compilation.

Instead, `LibHeaderComponent` itself implements the abstract `LibHeaderToken` class.
You can safely use that token as the provider in the component definition, allowing Angular to correctly inject the concrete type.

To summarize, the lightweight injection token pattern consists of the following.

1.  A lightweight injection token that is represented as an abstract class.
1.  A component definition that implements the abstract class.
1.  Injection of the lightweight pattern, using ` @ContentChild()` or `@ContentChildren()`.
1.  A provider in the implementation of the lightweight injection token which associates the lightweight injection token with the implementation.

### Use the lightweight injection token for API definition

A component that injects a lightweight injection token might need to invoke a method in the injected class.
The token is now an abstract class. Since the injectable component implements that class, you must also declare an abstract method in the abstract lightweight injection token class.
The implementation of the method, with all its code overhead, resides in the injectable component that can be tree-shaken.
This lets the parent communicate with the child, if it is present, in a type-safe manner.

For example, the `LibCardComponent` now queries `LibHeaderToken` rather than `LibHeaderComponent`.
The following example shows how the pattern lets `LibCardComponent` communicate with the `LibHeaderComponent` without actually referring to `LibHeaderComponent`.

<code-example format="typescript" language="typescript">

abstract class LibHeaderToken {
  abstract doSomething(): void;
}

&commat;Component({
  selector: 'lib-header',
  providers: [
    {provide: LibHeaderToken, useExisting: LibHeaderComponent}
  ]
  &hellip;,
})
class LibHeaderComponent extends LibHeaderToken {
  doSomething(): void {
    // Concrete implementation of `doSomething`
  }
}

&commat;Component({
  selector: 'lib-card',
  &hellip;,
})
class LibCardComponent implement AfterContentInit {
  &commat;ContentChild(LibHeaderToken)
  header: LibHeaderToken|null = null;

  ngAfterContentInit(): void {
    this.header &amp;&amp; this.header.doSomething();
  }
}

</code-example>

In this example the parent  queries the token to get the child component, and stores the resulting component reference if it is present.
Before calling a method in the child, the parent component checks to see if the child component is present.
If the child component has been tree-shaken, there is no runtime reference to it, and no call to its method.

### Naming your lightweight injection token

Lightweight injection tokens are only useful with components.
The Angular style guide suggests that you name components using the "Component" suffix.
The example "LibHeaderComponent" follows this convention.

You should maintain the relationship between the component and its token while still distinguishing between them. The recommended style is to use the component base name with the suffix "`Token`" to name your lightweight injection tokens: "`LibHeaderToken`."

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
