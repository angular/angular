# Understanding Angular animation

Animation provides the illusion of motion: HTML elements change styling over time. Well-designed animations can make your application more fun and straightforward to use, but they aren't just cosmetic.

## Prerequisites

Before learning Angular animations, you should be familiar with building basic Angular apps:

*   [Tutorial](tutorial)
*   [Architecture Overview](guide/architecture)

Animations can improve your application and user experience in many ways:

*   Without animations, web page transitions can seem abrupt and jarring
*   Motion greatly enhances the user experience, so animations give users a chance to detect the application's response to their actions
*   Good animations intuitively call the user's attention to where it is needed

Typically, animations involve multiple style *transformations* over time.
An HTML element can move, change color, grow, shrink, fade, or slide off the page. These changes can occur simultaneously or sequentially. You can control the timing of each transformation.

Angular's animation system is built on CSS capability, which means you can animate any property that the browser considers animatable. This includes positions, sizes, transforms, colors, borders, and more.

The W3C maintains a list of animatable properties on its [CSS Transitions](https://www.w3.org/TR/css-transitions-1) page.

## Animation transition states

Animation transition states represent a style at certain points in your animations that you can animate to and from. For example, you can animate a state as the starting point to a different state and the end of an animation.

Animate a transition that changes a single HTML element from one state to another. For example, you can specify that a button displays either **Open** or **Closed** based on the user's last action. When the button is in the `open` state, it's visible and yellow. When it's in the `closed` state, it's translucent and blue.

In HTML, these attributes are set using ordinary CSS styles such as color and opacity. In Angular, use the `style()` function to specify a set of CSS styles for use with animations. Collect a set of styles in an animation state, and give the state a name, such as `open` or `closed`.

<div class="alert is-helpful">

To create a new `open-close` component to animate with simple transitions, run the following command in the command line tool to create the component:

<code-example format="shell" language="shell">

ng g component open-close

</code-example>

This creates the component at `src/app/open-close.component.ts`.

</div>

@reviewed 2022-12-19
