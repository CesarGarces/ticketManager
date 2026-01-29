---
name: tailwind-4
description: >
  Tailwind CSS v4 patterns including cn() utility usage and configuration via CSS.
  Trigger: When writing Tailwind classes or modifying global CSS.
license: Apache-2.0
metadata:
  author: prowler-cloud
  version: "1.0"
  scope: [root, ui]
  auto_invoke: "Working with Tailwind classes"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Class Merging (REQUIRED)

ALWAYS use the `cn()` utility (clsx + tailwind-merge) for conditional classes and merging props.

```typescript
import { cn } from "@/lib/utils";

// ✅ Correct
function Card({ className, ...props }) {
  return (
    <div 
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow", 
        className
      )} 
      {...props} 
    />
  );
}

// ❌ Incorrect (template literals can cause conflicts)
function Card({ className }) {
  return <div className={`rounded-xl border ${className}`} />;
}
```

## CSS Variables in ClassNames

Avoid raw `var()` usage in standard utilities. Use the theme or arbitrary values properly if needed, but prefer theme tokens.

```typescript
// ✅ Correct (using theme token / utility)
<div className="bg-primary text-primary-foreground" />

// ✅ Correct (arbitrary value with known variable if absolutely necessary, but prefer theme)
<div className="w-[var(--sidebar-width)]" />

// ❌ Incorrect (hiding intent, hard to read)
<div className={cn("bg-[var(--my-color)]")} /> 
// Better: Define --my-color as a utility in CSS @theme
```

## Dynamic Classes

Do not construct class names dynamically. Tailwind scanner cannot find them.

```typescript
// ✅ Correct (full class names)
const colorClasses = {
  red: "bg-red-500",
  blue: "bg-blue-500",
};
<div className={colorClasses[variant]} />

// ❌ Incorrect
<div className={`bg-${variant}-500`} />
```

## CSS Configuration (v4)

Tailwind v4 uses CSS first for configuration.

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.8 0.2 240);
  --font-display: "Satoshi", "sans-serif";
  
  --animate-fade-in: fade-in 0.5s ease-out;
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```
