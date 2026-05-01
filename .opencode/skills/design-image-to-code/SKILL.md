# Skill: Design Image to Frontend Code

Use this skill whenever the user provides a UI screenshot, generated design image, Figma export, app screen mockup, or design reference and asks to implement it in frontend code.

## Purpose

Translate a visual design into real frontend code while matching the original design as closely as possible.

## Workflow

### Step 1: Understand the Reference

Analyze the image carefully:

- Screen type
- Device size
- Layout grid
- Main sections
- Card hierarchy
- Text hierarchy
- Colors
- Gradients
- Shadows
- Border radius
- Icons
- Illustrations
- Buttons
- Inputs
- Navigation
- Empty states
- Spacing rhythm

### Step 2: Inspect Existing Code

Before editing:

- Find the related screen/component.
- Check existing design tokens.
- Check theme colors.
- Check shared components.
- Check icon library.
- Check navigation/header structure.
- Check current styling method.

Use existing patterns first.

### Step 3: Create a Design Mapping

Map the image into code:

```txt
Image Section → Component
Header → ScreenHeader
Hero Card → HeroProgressCard
Stats Row → StatItem
Task List → TaskCard
Bottom Navigation → AppTabBar
```
