import { AsyncPipe } from "@angular/common";
import { Component, computed, inject, input } from "@angular/core";
import { CodeHighligher } from "../../code-highlighting/code-highlighter";

@Component({
    selector: 'adev-code-block',
    template: `<pre><code [innerHTML]="highlightedCode() | async"></code></pre>`,
    imports: [AsyncPipe],
})
export class CodeBlock {
    codeHighlighter = inject(CodeHighligher);
    code = input.required<string>();

    highlightedCode = computed(() => this.codeHighlighter.codeToHtml(this.code(), { lang: 'typescript', theme: 'github-light' }));
}