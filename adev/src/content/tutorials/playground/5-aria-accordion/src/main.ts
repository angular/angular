import {Component} from '@angular/core';
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
} from '@angular/aria/accordion';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `
    <h2>Frequently asked questions</h2>

    <div ngAccordionGroup class="basic-accordion" [multiExpandable]="false">
      <h3>
        <span ngAccordionTrigger [panel]="panel1" #trigger1="ngAccordionTrigger" [expanded]="true">
          How do I start a new Angular project?
          <span
            aria-hidden="true"
            class="expand-icon"
            [class.expand-icon__expanded]="trigger1.expanded()"
          ></span>
        </span>
      </h3>
      <div ngAccordionPanel #panel1="ngAccordionPanel">
        <ng-template ngAccordionContent>
          <p>
            Install the CLI with <code>npm install -g &#64;angular/cli</code>, then run
            <code>ng new &lt;project-name&gt;</code>.
          </p>
        </ng-template>
      </div>

      <h3>
        <span ngAccordionTrigger [panel]="panel2" #trigger2="ngAccordionTrigger">
          What are signals?
          <span
            aria-hidden="true"
            class="expand-icon"
            [class.expand-icon__expanded]="trigger2.expanded()"
          ></span>
        </span>
      </h3>
      <div ngAccordionPanel #panel2="ngAccordionPanel">
        <ng-template ngAccordionContent>
          <p>Signals are reactive values that track reads and notify dependents on write.</p>
        </ng-template>
      </div>

      <h3>
        <span ngAccordionTrigger [panel]="panel3" #trigger3="ngAccordionTrigger">
          What is zoneless?
          <span
            aria-hidden="true"
            class="expand-icon"
            [class.expand-icon__expanded]="trigger3.expanded()"
          ></span>
        </span>
      </h3>
      <div ngAccordionPanel #panel3="ngAccordionPanel">
        <ng-template ngAccordionContent>
          <p>
            Zoneless is a mode where Angular drops its Zone.js dependency and relies on signals to
            schedule change detection, reducing bundle size and making reactivity explicit.
          </p>
        </ng-template>
      </div>
    </div>
  `,
  styleUrl: 'main.css',
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
})
export class AccordionApp {}

bootstrapApplication(AccordionApp);
