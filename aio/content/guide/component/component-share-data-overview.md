# Component data sharing and inheritance

A common pattern for Angular is to share data between a parent component and one or more child components.
Implement the pattern with the `@Input` and `@Output` decorator functions.

The following code example shows a hierarchy of elements in a component.

<code-example format="html" header="Hierarchy of elements" hideCopy language="html">

&lt;parent-component&gt;
    &lt;child-component&gt;&lt;/child-component&gt;
&lt;/parent-component&gt;

</code-example>

The `parent-component` element tag serves as the context for the `child-component` element tag.

A child component uses the `@Input` and `@Output` decorator functions to communicate with the parent component.
A parent component uses the `@Input` decorator function to update data in the child component.
A child component uses the `@Output` decorator function to send data to a parent component.

### Learn about how to share data

<div class="card-container">
    <a href="guide/component/component-share-data-to-child" class="docs-card" title="Send data to a child component">
        <section>Send data to a child component</section>
        <p>Learn how to use <code>&commat;input</code> decorator to send data from a parent component to a child component</p>
        <p class="card-footer">Send data to a child component</p>
    </a>
    <a href="guide/component/component-share-data-to-parent" class="docs-card" title="Send data to a parent component">
        <section>Send data to a parent component</section>
        <p>Learn how to use <code>&commat;output</code> decorator to send data from a child component to a parent component.</p>
        <p class="card-footer">Send data to a parent component</p>
    </a>
    <a href="guide/component/component-exchange-data" class="docs-card" title="Exchange data between to a child component and a parent component">
        <section>Exchange data between to a child component and a parent component</section>
        <p>Learn how to use <code>&commat;Input</code> and <code>&commat;Output</code> to exchange data between a child component and a parent component.</p>
        <p class="card-footer">Exchange data between to a child component and a parent component</p>
    </a>
</div>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-08-24
