# Rendering strategies in Angular

This guide helps you choose the right rendering strategy for different parts of your Angular application.

## What are rendering strategies?

Rendering strategies determine when and where your Angular application's HTML content is generated. Each strategy offers different trade-offs between initial page load performance, interactivity, SEO capabilities, and server resource usage.

Angular supports three primary rendering strategies:

- **Client-Side Rendering (CSR)** - Content is rendered entirely in the browser
- **Static Site Generation (SSG/Prerendering)** - Content is pre-rendered at build time
- **Server-Side Rendering (SSR)** - Content is rendered on the server for the initial request for a route

## Client-Side Rendering (CSR)

**CSR is Angular's default.** Content renders entirely in the browser after JavaScript loads.

### When to use CSR

✅ It can be a good fit for:

- Interactive applications (dashboards, admin panels)
- Real-time applications
- Internal tools where SEO doesn't matter
- Single-page applications with complex client-side state

❌ When possible, consider avoiding it for:

- Public-facing content that needs SEO
- Pages where initial load performance is critical

### CSR trade-offs

| Aspect            | Impact                                                   |
| :---------------- | :------------------------------------------------------- |
| **SEO**           | Poor - content not visible to crawlers until JS executes |
| **Initial load**  | Slower - must download and execute JavaScript first      |
| **Interactivity** | Immediate once loaded                                    |
| **Server needs**  | Minimal outside of some configuration                    |
| **Complexity**    | Simplest because it works with minimum configuration     |

## Static Site Generation (SSG/Prerendering)

**SSG pre-renders pages at build time** into static HTML files. The server sends pre-built HTML for the initial page load. After hydration, your app runs entirely in the browser like a traditional SPA - subsequent navigation, route changes, and API calls all happen client-side without server rendering.

### When to use SSG

✅ It can be a good fit for:

- Marketing pages and landing pages
- Blog posts and documentation
- Product catalogs with stable content
- Content that doesn't change per-user

❌ When possible, consider avoiding it for:

- User-specific content
- Frequently changing data
- Real-time information

### SSG trade-offs

| Aspect              | Impact                                      |
| :------------------ | :------------------------------------------ |
| **SEO**             | Excellent - full HTML available immediately |
| **Initial load**    | Fastest - pre-generated HTML                |
| **Interactivity**   | After hydration completes                   |
| **Server needs**    | None for serving (CDN-friendly)             |
| **Build time**      | Longer - generates all pages upfront        |
| **Content updates** | Requires rebuild and redeploy               |

📖 **Implementation:** See [Customizing build-time prerendering](guide/ssr#customizing-build-time-prerendering-ssg) in the SSR guide.

## Server-Side Rendering (SSR)

**SSR generates HTML on the server for the initial request for a route**, providing dynamic content with good SEO. The server renders HTML and sends it to the client.

Once the client renders the page, Angular [hydrates](/guide/hydration#what-is-hydration) the app and it then runs entirely in the browser like a traditional SPA - subsequent navigation, route changes, and API calls all happen client-side without additional server rendering.

### When to use SSR

✅ It can be a good fit for:

- E-commerce product pages (dynamic pricing/inventory)
- News sites and social media feeds
- Personalized content that changes frequently

❌ When possible, consider avoiding it for:

- Static content (use SSG instead)
- When server costs are a concern

### SSR trade-offs

| Aspect              | Impact                                              |
| :------------------ | :-------------------------------------------------- |
| **SEO**             | Excellent - full HTML for crawlers                  |
| **Initial load**    | Fast - immediate content visibility                 |
| **Interactivity**   | Delayed until hydration                             |
| **Server needs**    | Requires server                                     |
| **Personalization** | Full access to user context                         |
| **Server costs**    | Higher - renders on the initial request for a route |

📖 **Implementation:** See [Server routing](guide/ssr#server-routing) and [Authoring server-compatible components](guide/ssr#authoring-server-compatible-components) in the SSR guide.

## Choosing the Right Strategy

### Decision matrix

| If you need...             | Use this strategy | Why                                              |
| :------------------------- | :---------------- | :----------------------------------------------- |
| **SEO + Static content**   | SSG               | Pre-rendered HTML, fastest load                  |
| **SEO + Dynamic content**  | SSR               | Fresh content on the initial request for a route |
| **No SEO + Interactivity** | CSR               | Simplest, no server needed                       |
| **Mixed requirements**     | Hybrid            | Different strategies per route                   |

## Making SSR/SSG Interactive with Hydration

When using SSR or SSG, Angular "hydrates" the server-rendered HTML to make it interactive.

**Available strategies:**

- **Full hydration** - Entire app becomes interactive at once (default)
- **Incremental hydration** - Parts become interactive as needed (better performance)
- **Event replay** - Captures clicks before hydration completes

📖 **Learn more:**

- [Hydration guide](guide/hydration) - Complete hydration setup
- [Incremental hydration](guide/incremental-hydration) - Advanced hydration with `@defer` blocks

## Next steps

<docs-pill-row>
  <docs-pill href="/guide/ssr" title="Server-Side Rendering"/>
  <docs-pill href="/guide/hydration" title="Hydration"/>
  <docs-pill href="/guide/incremental-hydration" title="Incremental Hydration"/>
</docs-pill-row>
