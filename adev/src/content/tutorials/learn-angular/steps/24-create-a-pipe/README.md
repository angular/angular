# Create a custom pipe

You can create custom pipes in Angular to fit your data transformation needs.

Note: Learn more about [creating custom pipes in the in-depth guide](/guide/templates/pipes#creating-custom-pipes).

In this activity, you will create a custom pipe and use it in your template.

<hr>

A pipe is a TypeScript class with a `@Pipe` decorator. Here's an example:

```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'star',
})
export class StarPipe implements PipeTransform {
  transform(value: string): string {
    return `⭐️ ${value} ⭐️`;
  }
}
```

The `StarPipe` accepts a string value and returns that string with stars around it. Take note that:

- the name in the `@Pipe` decorator configuration is what will be used in the template
- the `transform` function is where you put your logic

Alright, it's your turn to give this a try — you'll create the `ReversePipe`:

<docs-workflow>

<docs-step title="Create the `ReversePipe`">

In `reverse.pipe.ts` add the `@Pipe` decorator to the `ReversePipe` class and provide the following configuration:

```ts
@Pipe({
    name: 'reverse'
})
```

</docs-step>

<docs-step title="Implement the `transform` function">

Now the `ReversePipe` class is a pipe. Update the `transform` function to add the reversing logic:

<docs-code language="ts" highlight="[3,4,5,6,7,8,9]">
export class ReversePipe implements PipeTransform {
    transform(value: string): string {
        let reverse = '';

        for (let i = value.length - 1; i >= 0; i--) {
            reverse += value[i];
        }

        return reverse;
    }

}
</docs-code>

</docs-step>

<docs-step title="Use the `ReversePipe` in the template"></docs-step>
With the pipe logic implemented, the final step is to use it in the template. In `app.ts` include the pipe in the template and add it to the component imports:

<docs-code language="angular-ts" highlight="[3,4]">
@Component({
    ...
    template: `Reverse Machine: {{ word | reverse }}`
    imports: [ReversePipe]
})
</docs-code>

</docs-workflow>

And with that you've done it. Congratulations on completing this activity. You now know how to use pipes and even how to implement your own custom pipes.
