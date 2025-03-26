# Migrating away from Angular's Animations package

Almost all of what the Angular Animations package provides can now be accomplished via native CSS animations.
You may consider removing the Angular Animations package from your application to save on some bytes, as the
package adds ~60 kilobytes to every application that uses it. We'll guide you through the process of how to
migrate your app off of the Animations Package and on to native CSS animations.

## How to write animations in native CSS

If you've never written any native CSS animations, there are a number of excellent guides to get you started.
[MDN's CSS Animations guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations]) is a great primer.
Start there and then come back to this guide.

## Route transitions

View transitions

## Animating entering a view




 

## Animating leaving a view

The web platform does not provide any native solution for animating items as they are exiting the DOM.

## Creating Reusable Animations

You can create re-usable animations natively in CSS with `@keyframe`