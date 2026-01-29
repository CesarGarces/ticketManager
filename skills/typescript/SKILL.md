---
name: typescript
description: >
  TypeScript best practices including const assertions, flat interfaces, and utility types.
  Trigger: When writing TypeScript types, interfaces, or generic functions.
license: Apache-2.0
metadata:
  author: prowler-cloud
  version: "1.0"
  scope: [root]
  auto_invoke: "Writing TypeScript types/interfaces"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Const Assertions (REQUIRED)

Use `as const` for immutable values and to narrow types to their literal values.

```typescript
// ✅ Narrowest possible type
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
} as const;

// type Routes = { readonly HOME: "/"; readonly LOGIN: "/login"; ... }

// ❌ Too loose
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
};

// type Routes = { HOME: string; LOGIN: string; }
```

## Flat Interfaces (REQUIRED)

Avoid deep nesting. Compose types from smaller, reusable parts.

```typescript
// ✅ Composable and flat
interface Address {
  street: string;
  city: string;
}

interface User {
  id: string;
  name: string;
  address: Address; // Reference, not inline
}

// ❌ Deep nesting hard to read/reuse
interface User {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  }
}
```

## Utility Types

Use standard utility types (`Pick`, `Omit`, `Partial`) instead of duplicating definitions.

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

// ✅ Derived type
type NewUser = Omit<User, "id">;
type UserProfile = Pick<User, "name" | "email">;

// ❌ Duplication
interface NewUser {
  name: string;
  email: string;
  role: "admin" | "user";
}
```

## Strict Boolean Checks

Avoid loose boolean checks for objects or numbers.

```typescript
// ✅ Explicit check
if (items.length > 0) { ... }
if (user !== null) { ... }

// ❌ Implicit falsy (can hide 0 or "")
if (items.length) { ... }
if (user) { ... }
```

## No `any` (REQUIRED)

Never use `any`. Use `unknown` if the type is truly not known yet, or usage of generics.

```typescript
// ✅ Type safe
function log(value: unknown) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  }
}

// ❌ Unsafe
function log(value: any) {
  console.log(value.toUpperCase()); // Might crash
}
```
