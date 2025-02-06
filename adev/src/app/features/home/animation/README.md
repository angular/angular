# `Animation` API

The `Animation` class provides a simplistic interface for creating and processing CSS-based animations. In essence, it represents a CSS animation player.

## API

Anyone capable of writing CSS, and a certain dose of creativity, should be able to create animations with the `Animation` API.

### Layers

To start, you need to divide your animation template into layers that make logical sense. These layers should use the `AnimationLayerDirective` which requires a mandatory `layerId` property to be set. The layer ID should be unique for the `Animation` instance.

```html
<div adevAnimationLayer layerId="layer-1">
  <div class="circle"></div>
</div>
<div adevAnimationLayer layerId="layer-2">
  <div class="square"></div>
</div>
```

The layers should be styled as normal elements/components in the animation host component stylesheet. These styles will act as the initial animation styles.

> [!CAUTION]
> Do not style elements via the `style` attribute, if you plan to animate them. Stale styles are removed by the animation processor which means that any initial styles set via `style` will be cleared as well.

### Creating an `Animation` instance

To create a new animation instance, you should use the `AnimationCreatorService` service in your animation host component as follows:

```typescript
class AnimationHost implements AfterViewInit {
  private animationCreator = inject(AnimationCreatorService);
  layers = viewChildren(AnimationLayerDirective);

  constructor() {
    afterNextRender({ read: () => {
      // The layers must be provided
      const animation = this.animationCreator.createAnimation(this.layers());
      // ...
    }});
  }
}
```

### Definition

After you create an `Animation` instance, you have to provide your `AnimationDefinition` to the `define()` method:

```typescript
animation.define(DEFINITION);
```

The definition is where the actual animation is described. The API is very similar to CSS `@keyframes` where you provide start (`from`) and end (`to`) styles with the added extra that you now have control over the timing – when the animation processor should start applying the styles. Additionally, you have to specify the target element or layer in the following format:

```
<LAYER_ID> >> .<CLASS_NAME>
```

The class name should be of an element within the layer. Accessing the layer directly without a specified element is supported as well (i.e. just use `<LAYER_ID>`). Pay attention to the dot in front of the class name. Although, internally, we are using `getElementsByClassName` the dot is still there in case we want to add support for other types of selectors in the future which will require switching to `getQuerySelectorAll`, for instance. It also provides some form of differentiation between the layer ID and the class name.

> [!TIP]
> You can achieve `@keyframes` percentage-based sequencing by combining multiple `AnimationRule`-s with different timings and change rates. The same can be said about CSS timing functions – you can achieve similar resemblance by animation rule composition (currently, only linear transitions are supported but that might change if there is a need for that).

```typescript
const DEFINITION: AnimationDefinition = [
  // Changes the color of the circle from black to white.
  {
    selector: `layer-1 >> .circle`,
    timeframe: [3, 5], // Starts at the 3rd and ends at the 5th second.
    from: {
      'background-color': '#000',
    },
    to: {
      'background-color': '#fff',
    }
  }
];
```

It is suggested that the start styles match the initial styles of the element. Generally, it shouldn't matter but it can cause issues with the visualizations if you add `transition`-s to the animated CSS properties.

> [!IMPORTANT]
> The `from` and `to` CSS properties should match.

#### Static rules

If you want to apply certain styles at a concrete time, you should use a static animation rule instead:

```typescript
// Hides the layer at the 7th second.
{
  selector: `layer-2`,
  at: 7,
  styles: {
    'display': 'none',
  },
}
```

> [!NOTE]
> Static values like `display: none` will be applied immediately in the case of dynamic rules (`timeframe`). They can't be animated.

### Animation duration and animation control methods

As mentioned in the description, the `Animation` is essentially a CSS player. Hence, you can use the control methods `play`, `pause`, `stop`, `seek` and `reset` to start and play with an animation after providing a definition.

Note that animation duration is automatically inferred by the rule that ends its execution last.

#### Plugins

The plugin system allows for extending the animation functionality. Currently, there are two available plugins:

- `AnimationPlayer` – Used for development. As the name suggests, it renders animation controls for ease of use.
- `AnimationScrollHandler` – Enables page scroll control over the animation.

```typescript
animation.addPlugin(new AnimationScrollHandler(...));
```

> [!TIP]
> You can create your own plugin by extending the `AnimationPlugin` interface.

> [!CAUTION]
> Use `animation.dispose()` on host component destroy, if you add any plugins as they might result in memory leaks or stale UI leftovers.

##### Scroll handler plugin

It's worth mentioning that the speed of animation progression in the context of the scroll handler plugin is determined by both the animation duration and the provided timestep (check `AnimationConfig` for detailed info). The timings in the definition merely act as a way to describe relative timing among the different animation rules not absolute time of execution.

By default, the plugin will add a spacer to the host element that will be tall enough to match the whole animation duration. This means it's implied that the animation layers use `position: fixed`. You can disable the spacer and use an alternative layout if you desire.

> [!TIP]
> Apply transitions, as part of the initial styles, to the animated properties when using the scroll handler. This might be needed since scrolling via mouse scroll wheel results in non-continuous `scrollY` which results in jagged animation.

## Limitations

There are certain limitations that come with the usage of the `Animation` API. Most of them are related to CSS property values parsing. So, it's crucial to understand that there are several data types – `numeric`, `transition`, `color` and `static` values. All values can be animated with the exclusion of `static` values. For example `display: block` is considered static (i.e. non-animatable). However, there are certain cases where the parser is unable to process a value that might be deemed animatable/continuous which will then be treated as static one. These cases are as follows:

- _Parsing shorthand CSS properties like `border`_ – The animation processor won't be able to animate `1px solid red` <=> `20px solid red`, for example. In such cases, it is suggested to use the standard CSS properties that describe only the numeric part of the property, i.e. `border-width: 1px <=> 20px`.
- _Only hex, `rgb` and `rgba` colors are supported_ – At this stage, color spaces like `hsl` or `lch`, for instance, are not supported.
- _Not all transform functions are supported_ – You can check the list [here](https://github.com/angular/angular/blob/main/adev/src/app/features/home/animation/parser/css-value-parser.ts#L13). It's merely a preventative measure in case a new function is added to the standard that requires additional changes to the parser. You can try adding your desired function to the list and verifying if it works or not.
- _`calc` and `var` (and probably more) are not supported_ – The parser is not fully CSS-spec-compliant. There are probably more CSS perks that won't be parsable but the current functionality should be sufficient enough for rich animations.

**Other limitations**

- _Definition can't be changed dynamically_ – This means that you can't add additional layers or animation rules to the animation during its runtime.
- _Number of animated elements_ – This is probably obvious but rendering a lot of elements and animating them can be computationally expensive and, respectively, degrade the user experience. For such animations, use HTML Canvas solutions.

## How it works?

The principle is simple: we calculate the value progression based on time progression (e.g. timeframe = [0, 4]; current time = 3s => progression = 75% => we apply 75% of the defined CSS property value span between `from` and `to` styles, unless the value is static). This happens for each frame via the `updateFrame` method that is called internally.

Other than that the different phases of `Animation` are:

- Instantiation
- Animation definition
- Object reference extraction and validation; Property validation
- Parsing of the animation definition to the internal data format (CSS value parsing happens here)
- Value processing/calculations on play/seek/forward/back (i.e. frame update)
