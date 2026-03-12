# Angular AI Tutor

The Angular AI Tutor is designed to interactively guide you step-by-step through building a complete, modern Angular application from the ground up. You'll learn the latest patterns and best practices by building a real, tangible project: a **"Smart Recipe Box"** for creating and managing recipes.

Our goal is to foster critical thinking and help you retain what you learn. Instead of just giving you code, the tutor will explain concepts, show you examples, and then give you project-specific exercises to solve on your own.

## Get Started

You can access the AI tutor via the [Angular MCP server](ai/mcp).

1. [Install](ai/mcp#get-started) the Angular MCP server
2. Create a new Angular project `ng new <project-name>`
3. Navigate to your new project (`cd <project-name>`) in an AI-powered editor or tool, like the [Gemini CLI](https://geminicli.com/)
4. Enter a prompt like `launch the Angular AI tutor`
   ![A screenshot demonstrating how to launch the Angular AI Tutor in the Gemini CLI.](assets/images/launch-ai-tutor.png 'Launch the Angular AI Tutor')

## Using the AI Tutor

Each module begins with a brief concept explanation.
![A screenshot of the Angular AI Tutor presenting a brief concept explanation.](assets/images/ai-tutor-preview-1.png 'Angular AI Tutor explanation')
If applicable, the tutor will present a code example to demonstrate the concept.
![A screenshot of the Angular AI Tutor showing a code example.](assets/images/ai-tutor-preview-2.png 'Angular AI Tutor code example')
The tutor will also provide an open-ended exercise to test your understanding.
![A screenshot of the Angular AI Tutor providing an exercise.](assets/images/ai-tutor-preview-3.png 'Angular AI Tutor exercise')
Finally, the tutor will check your work before moving onto the next module.
![A screenshot of the Angular AI Tutor checking the user's work.](assets/images/ai-tutor-preview-4.png 'Angular AI Tutor check')

## How It Works: The Learning Cycle

For each new topic, you'll follow a learning loop that emphasizes critical thinking to help you better retain what you learn.

1. **Learn the Concept:** The tutor will briefly explain a core Angular feature and show you a generic code example to illustrate it.
2. **Apply Your Knowledge:** You'll immediately get a hands-on exercise. The tutor presents these exercises at a high level with objectives and expected outcomes, encouraging you to think through the solution yourself.
3. **Get Feedback & Support:** When you're ready, let the tutor know. It will **automatically read your project files** to verify your solution is correct. If you get stuck, you are in complete control. You can ask for a **"hint"** for more guidance, or get step-by-step instructions by typing **"detailed guide"** or **"step-by-step instructions."**

Once you've succeeded, the tutor will move directly to the next topic. You can also ask the tutor for more information on a topic or ask any related Angular questions at any time.

---

## **Features & Commands**

You are in control of your learning experience. Use these features at any time:

### **Leave and Come Back**

Feel free to take a break. Your progress is tied to your project's code. When you return for a new session, the tutor will automatically analyze your files to determine exactly where you left off, allowing you to seamlessly pick up right where you were.

**Pro Tip:** We highly recommend using Git to save your progress. After completing a module, it's a great idea to commit your changes (e.g., `git commit -m "Complete Phase 1, Module 8"`). This acts as a personal checkpoint you can always return to.

### **Adjust Your Experience Level**

You can set your experience level to **Beginner (1-3)**, **Intermediate (4-7)**, or **Experienced (8-10)**. You can change this setting at any time during your session, and the tutor will immediately adapt its teaching style to match.

**Example Prompts:**

- "Set my experience level to beginner."
- "Change my rating to 8."

### **See the Full Learning Plan**

Want to see the big picture or check how far you've come? Just ask for the table of contents.

**Example Prompts:**

- "Where are we?"
- "Show the table of contents."
- "Show the plan."

The tutor will display the full learning plan and mark your current location.

### **A Note on Styling**

The tutor will apply basic styling to your application to keep things looking clean. You are highly encouraged to apply your own styling to make the app your own.

### **Skip the Current Module**

If you'd rather move on to the next topic in the learning path, you can ask the tutor to skip the current exercise.

**Example Prompts:**

- "Skip this section."
- "Auto-complete this step for me."

The tutor will ask for confirmation and then present you with the complete code solution for the current module and attempt to automatically apply any required updates to ensure you can continue smoothly with the next module.

### **Jump to Any Topic**

If you want to learn about a specific topic out of order (e.g., jump from the basics to forms), you can. The tutor will provide the necessary code to update your project to the correct starting point for the selected module and attempt to automatically apply any required updates.

**Example Prompts:**

- "Take me to the forms lesson."
- "I want to learn about Route Guards now."
- "Jump to the section on Services."

---

## **Troubleshooting**

If the tutor doesn't respond correctly or you suspect an issue with your application, here are a few things to try:

1. **Type "proceed":** This can often nudge the tutor to continue to the next step in the event it gets stuck.
2. **Correct the Tutor:** If the tutor is mistaken about your progress (e.g., it says you're on Module 3 but you've completed Module 8), just tell it. For example: _"I'm actually on Module 8."_ The tutor will re-evaluate your code and adjust.
3. **Verify Your UI:** If you want to confirm what your application's user interface should look like, just ask the tutor. For example: _"What should I see in my UI?"_
4. **Reload the Browser Window:** A refresh can solve many issues related to your application.
5. **Hard Restart the Browser:** Errors are sometimes only surfaced in the browser's developer console. A hard restart can help clear underlying issues related to the application.
6. **Start a New Chat:** You can always start a new chat to remove the existing history and begin fresh. The tutor will read your files to find the latest step you were on.

## **Your Learning Journey: The Phased Path**

You will build your application over a five-phase journey. You can follow this path from start to finish to create a complete, fully-functional Angular application. Each module builds logically upon the last, taking you from the basics to advanced, real-world features.

**A Note on Automated Setup:** Some modules require a setup step, like creating interfaces or mock data. In these cases, the tutor will present you with the code and file instructions. You will be responsible for creating and modifying these files as instructed before the exercise begins.

### **Phase 1: Angular Fundamentals**

- **Module 1:** Getting Started
- **Module 2:** Dynamic Text with Interpolation
- **Module 3:** Event Listeners (`(click)`)

### **Phase 2: State and Signals**

- **Module 4:** State Management with Writable Signals (Part 1: `set`)
- **Module 5:** State Management with Writable Signals (Part 2: `update`)
- **Module 6:** Computed Signals

### **Phase 3: Component Architecture**

- **Module 7:** Template Binding (Properties & Attributes)
- **Module 8:** Creating & Nesting Components
- **Module 9:** Component Inputs with Signals
- **Module 10:** Styling Components
- **Module 11:** List Rendering with `@for`
- **Module 12:** Conditional Rendering with `@if`

### **Phase 4: Advanced Features & Architecture**

- **Module 13:** Two-Way Binding
- **Module 14:** Services & Dependency Injection (DI)
- **Module 15:** Basic Routing
- **Module 16:** Introduction to Forms
- **Module 17:** Intro to Angular Material

### **Phase 5: Experimental Signal Forms (⚠️ WARNING: Subject to Change)**

**CRITICAL NOTE FOR THIS PHASE:** Signal Forms are currently an [**EXPERIMENTAL** feature](/reference/releases#experimental). The API may change significantly in future Angular releases. Please proceed with the understanding that this section demonstrates a cutting-edge feature.

- **Module 18**: **Introduction to Signal Forms**
- **Module 19**: **Submitting & Resetting**
- **Module 20**: **Validation in Signal Forms**
- **Module 21**: **Field State & Error Messages**

---

## **A Note on AI & Feedback**

This tutor is powered by a Large Language Model (LLM). While we've worked hard to make it an expert, AIs can make mistakes. If you encounter an explanation or code example that seems incorrect, please let us know. You can correct the tutor, and it will use your feedback to adjust its response.

For any technical bugs or feature requests, please [submit an issue](https://github.com/angular/angular-cli/issues).
