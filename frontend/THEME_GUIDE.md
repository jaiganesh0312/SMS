# Academy Prestige Theme Guide

> A professional design system for the School Management System. Use this guide to maintain visual consistency across all components.

---

## Color Palette

### Primary Colors (Midnight Navy)
Authority, trust, and academic tradition.

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `primary-500` | `#1e3a5f` | `#3d6091` | Main buttons, headers, primary actions |
| `primary-600` | `#1a3254` | `#5c80ae` | Hover states |
| `primary-700` | `#162a48` | `#7ea0c7` | Active states |
| `primary-100` | `#c7d5e8` | `#11223c` | Light backgrounds, badges |

### Secondary Colors (Amber Gold)
Achievement, excellence, and prestige.

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `secondary-500` | `#d4a03a` | `#d4a03a` | Accent buttons, highlights, CTAs |
| `secondary-400` | `#f3c05e` | `#866430` | Hover states, badges |
| `secondary-100` | `#fcedcd` | `#3d2e18` | Light accent backgrounds |

### Semantic Colors

| Type | Light Default | Usage |
|------|---------------|-------|
| `success` | `#2e8b57` (Sea Green) | Positive actions, confirmations |
| `warning` | `#c86b3a` (Burnt Sienna) | Caution states, alerts |
| `danger` | `#b83a52` (Crimson Rose) | Errors, destructive actions |

### Neutral Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `background` | `#faf9f7` | `#0f0e0d` | Page backgrounds |
| `content1` | `#ffffff` | `#1a1814` | Cards, modals |
| `content2` | `#f5f3f0` | `#262320` | Secondary surfaces |
| `foreground` | `#1a1814` | `#f5f3f0` | Primary text |
| `default-500` | `#b5ada1` | `#5c554c` | Muted text, borders |
| `default-600` | `#948b7d` | `#7a7268` | Secondary text |

---

## Typography

Use semantic HeroUI text classes with theme-aware colors:

```jsx
// Headings
<h1 className="text-4xl font-bold text-foreground">Title</h1>

// Body text
<p className="text-default-600">Secondary text content</p>

// Accent text
<span className="text-primary-500">Primary accent</span>
<span className="text-secondary-500">Gold accent</span>
```

---

## Component Patterns

### Buttons

```jsx
// Primary action (navy gradient)
<Button className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg">
  Primary Action
</Button>

// Secondary/CTA action (amber gold)
<Button className="bg-secondary-500 text-primary-900 hover:bg-secondary-400 shadow-lg hover:shadow-secondary-500/30">
  Call to Action
</Button>

// Bordered/Ghost
<Button variant="bordered" className="border-2 border-white/40 hover:bg-white/10">
  Secondary
</Button>
```

### Cards

```jsx
<div className="p-8 rounded-2xl bg-content1 border border-default-200 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-2xl transition-all duration-300">
  {/* Card content */}
</div>
```

### Icon Containers

```jsx
// Primary themed
<div className="w-14 h-14 bg-primary-100 dark:bg-primary-500/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
  <Icon icon="mdi:school" className="text-3xl" />
</div>

// Secondary themed
<div className="w-14 h-14 bg-secondary-100 dark:bg-secondary-500/20 rounded-xl flex items-center justify-center text-secondary-600 dark:text-secondary-400">
  <Icon icon="mdi:star" className="text-3xl" />
</div>
```

### Badges/Pills

```jsx
<span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-sm font-semibold rounded-full">
  Badge Text
</span>
```

---

## Background Patterns

### Gradient Hero Sections

```jsx
<section className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 text-white">
  {/* Add grain texture */}
  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15"></div>
  {/* Content */}
</section>
```

### Geometric Hex Pattern

```jsx
<div className="absolute inset-0 opacity-10">
  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
        <polygon points="25,0 50,14.4 50,43.4 25,57.7 0,43.4 0,14.4" fill="none" stroke="currentColor" strokeWidth="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hexagons)" />
  </svg>
</div>
```

### Dot Pattern (Footer)

```jsx
<div className="absolute inset-0 opacity-5">
  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="dots" width="60" height="60" patternUnits="userSpaceOnUse">
        <circle cx="30" cy="30" r="2" fill="currentColor"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>
</div>
```

---

## Animation Guidelines

### Framer Motion Defaults

```jsx
// Fade in from bottom
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.6 }}

// Card hover lift
whileHover={{ y: -8, scale: 1.02 }}

// Floating animation
animate={{ y: [0, -10, 0] }}
transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}

// Background orbs
animate={{ y: [0, 40, 0], x: [0, 25, 0], scale: [1, 1.1, 1] }}
transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
```

---

## Dark Mode Considerations

All colors automatically adapt. Use these patterns:

```jsx
// Background with dark variant
className="bg-primary-100 dark:bg-primary-500/20"

// Text with dark variant
className="text-primary-600 dark:text-primary-400"

// Borders with dark variant
className="border-default-200 dark:border-default-100"
```

---

## Footer Styling

The footer uses an inverted color scheme:

```jsx
<footer className="bg-primary-800 dark:bg-primary-900 text-white">
  // Links
  className="text-primary-200 hover:text-secondary-400"
  
  // Section headers with gold accent
  <h4 className="font-bold text-white mb-6 flex items-center gap-2">
    <span className="w-8 h-0.5 bg-secondary-500 rounded-full"></span>
    Section Title
  </h4>
</footer>
```

---

## Navbar Styling

Use glassmorphism for a modern feel:

```jsx
<Navbar className="bg-content1/80 dark:bg-content1/90 backdrop-blur-xl border-b border-default-200 shadow-sm">
  // Logo container
  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl">
    <Icon icon="mdi:school" className="text-white" />
  </div>
</Navbar>
```

---

## Quick Reference: Color Class Mapping

| Old Generic Class | New Theme Class |
|-------------------|-----------------|
| `bg-blue-600` | `bg-primary-500` |
| `bg-purple-600` | Use `bg-primary-700` or `bg-secondary-500` |
| `text-blue-600` | `text-primary-500` |
| `bg-gray-100` | `bg-content2` or `bg-default-100` |
| `text-gray-600` | `text-default-600` |
| `text-gray-900` | `text-foreground` |
| `bg-white` | `bg-content1` or `bg-background` |
| `dark:bg-gray-900` | `dark:bg-content1` |

---

## Do's and Don'ts

### ✅ Do
- Use theme tokens (`primary-500`, `secondary-400`, etc.)
- Apply glassmorphism with `backdrop-blur-xl` on overlays
- Use warm parchment backgrounds (`bg-background`, `bg-content1`)
- Include subtle grain/geometric textures in hero sections
- Add hover state transitions (`transition-all duration-300`)

### ❌ Don't
- Use raw hex colors directly
- Use generic blue/purple gradients (`from-blue-600 to-purple-600`)
- Use cold gray scales (`gray-100`, `gray-900`)
- Use stark white (`#ffffff`) as page backgrounds in light mode
- Forget dark mode variants
