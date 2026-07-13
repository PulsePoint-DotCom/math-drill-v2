# Math Drill — PWA Spec

## Concept & Vision

A daily math trainer that sends push notifications with arithmetic problems. You solve them in the app before the 5-minute timer runs out. Keeps your mental math sharp with streak tracking and accuracy stats. Designed to feel snappy and game-like on mobile — not a homework assignment.

**Personality:** Clean, minimal, slightly playful. Feels like a well-designed game UI, not a textbook.

## Points & Rewards System

### Earning Points
- **Correct answer:** Earn points based on difficulty + streak multiplier
  - Single-digit: `10 × streakMultiplier` points
  - Double-digit: `20 × streakMultiplier` points
  - Multi-step: `40 × streakMultiplier` points
- **Streak multiplier:** `1 + (currentStreak × 0.1)`, capped at 3x
- **Fast bonus:** Answer in <10s earns extra `10 × difficultyLevel` points

### Losing Points
- **Wrong answer:** Lose `20 × difficultyLevel` points (bigger penalty than gain)
- **Time's up:** Treated as wrong, same point penalty
- **Floor:** Points cannot go below 0

### Point Display
- Points shown in header area on home tab
- Points earned/lost shown in result screen with animation

## Mascot System

### Overview
Mascots are companions that help you during math drills. Each mascot has a unique ability. You buy them with points and can upgrade them to make them stronger.

### Mascot List

| Mascot | Emoji | Cost | Ability | Upgrade Cost | Description |
|--------|-------|------|---------|--------------|-------------|
| Wizard Wizz | 🧙‍♂️ | 100 | +10% points on correct | 150 per level | Ancient math wizard. +10% points per level. |
| Owl | 🦉 | 250 | Shows hint (last digit) on 20% chance | 300 per level | Wise owl. Hint chance +20% per level. |
| Robot | 🤖 | 500 | 50% chance to re-check your answer | 500 per level | Double-checks answers. Re-check chance +25% per level. |
| Dragon | 🐉 | 1000 | +1 free wrong answer per day | 1000 per level | Legendary dragon. Free wrong per day +1 per level. |
| Phoenix | 🔥 | 2500 | Revives streak if you get 3 correct in a row | 2000 per level | Mythical phoenix. Streak revive bonus +1 per level. |

### Mascot Levels
- Level 1 (default): Base ability
- Level 2: 2x upgrade cost, 2x ability strength
- Level 3 (MAX): 3x upgrade cost, 3x ability strength
- Each mascot can be upgraded twice (max level 3)

### Mascot Slots
- You can own up to 5 mascots at once
- Active mascot appears on problem screen
- Only one mascot can be "on-field" at a time

### Mascot States
- **Locked:** Not owned yet
- **Owned (idle):** Owned but not equipped
- **Equipped:** Active on the field during problems
- **MAX level:** Fully upgraded, badge shows ⭐⭐⭐

## Layout & Structure

**Single-page app with 4 tabs (bottom nav):**

1. **Home** — Current problem (if active) or next notification preview + mascot display
2. **Mascots** — Mascot shop + owned mascots management
3. **Stats** — Streak, accuracy ratio, history, mascot collection
4. **Settings** — Difficulty slider, equation toggles, notification schedule

**Bottom tab bar** (mobile-first):
- Home | Mascots | Stats | Settings
- Active tab: accent color + label visible
- Inactive: muted color

## Features & Interactions

### Notification Scheduling
- **Frequency:** Slider from 1–10 notifications/day
- **Window:** Start time picker + end time picker (e.g., 9am–9pm)
- Notifications fire randomly within the window, spread evenly
- Local notifications via Service Worker

### Problem Generation
- **Single digits:** Both operands 1–9
- **Double digits:** Both operands 10–99
- **Multi-step:** Two operations, e.g., `7 + 3 × 4` or `15 - 6 + 9`

Equation types (toggle each):
- Addition (+)
- Subtraction (−)
- Multiplication (×)
- Division (÷) — division only gives whole numbers (no remainders)

### Answering
- Large number input field
- Submit button (or keyboard "done")
- 5-minute countdown timer starts when notification is tapped
- Timer visible on home screen
- Can answer early without waiting for notification

### Results
- ✅ Correct: green flash, streak increments, show "Nice!" + points earned
- ❌ Wrong: red flash, correct answer shown, streak resets + points lost
- ⏱️ Time's up: treated as wrong, correct answer shown
- Points change shown with +/- animation

### Mascot Shop
- Grid of all mascots (owned or not)
- Locked mascots show cost + ability description
- Owned mascots show level stars + upgrade button
- Equip button to set active mascot
- Buy button (grayed out if not enough points)

### Stats Page
- **Current streak:** consecutive correct answers
- **Best streak:** all-time high
- **Accuracy:** X correct / Y total = Z%
- **Recent history:** last 10 problems with pass/fail
- **Mascots owned:** count + collection preview

### Settings Page
- Difficulty slider: Single → Double → Multi-step
- Toggle switches for each operation (+ − × ÷)
- Notification frequency slider (1–10)
- Start time picker
- End time picker
- Test notification button

## Component Inventory

### Home Screen
- **No active problem:** Shows next scheduled notification time + "Solve Now" button for practice + current points + equipped mascot
- **Active problem:** Shows equation, timer, input field, submit button + mascot + mascot ability indicator
- **Result:** Shows outcome, points earned/lost, correct answer (if wrong), "Next Problem" button

### Timer
- Circular progress indicator
- MM:SS in center
- Turns red under 1 minute

### Answer Input
- Large numeric keyboard input
- Auto-focus on problem load
- Submit on "Enter" or tap button

### Points Display
- Large point counter in header
- Animated +/- on result screen
- Color: gold/yellow for points

### Mascot Display (Home)
- Small mascot icon + name on problem screen
- Bubble showing ability effect during problem
- Hint text appears if owl ability triggers

### Mascot Shop Card
- Large emoji mascot
- Name and level stars
- Ability description
- Cost or upgrade cost
- Buy/Upgrade/Equip button
- Owned state badge

### Stats Cards
- Rounded cards with icon + number + label
- Streak: flame icon 🔥
- Accuracy: target icon 🎯
- Total solved: counter icon

### Difficulty Slider
- Range input: 1 (Single) → 2 (Double) → 3 (Multi-step)
- Visual labels at each stop

### Toggle Switches
- iOS-style toggles for operation types

### Time Pickers
- Native `<input type="time">` styled to match

## Technical Approach

**Stack:** Vanilla HTML/CSS/JS + Service Worker

**Storage:** `localStorage` for all data
- `settings` — difficulty, operations, frequency, time window
- `stats` — streak, bestStreak, totalCorrect, totalWrong, history[]
- `points` — currentPoints, lifetimePoints
- `mascots` — ownedMascots[], equippedMascot, mascotLevels{}

**Notifications:** Service Worker + `Notification` API
- Request permission on first load
- Store notification schedule in localStorage
- Use `setTimeout` for in-app scheduling (browser limitations)

**PWA Requirements:**
- `manifest.json` with icons, theme color, display: standalone
- `sw.js` service worker for offline + notification handling
- Apple touch icon meta tags

## Data Schema

```js
settings = {
  difficulty: 1,        // 1=single, 2=double, 3=multi-step
  operations: {
    add: true,
    sub: true,
    mul: true,
    div: true
  },
  notificationsPerDay: 5,
  windowStart: "09:00",
  windowEnd: "21:00"
}

stats = {
  currentStreak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalWrong: 0,
  history: [          // last 10
    { problem: "7×8", answer: 56, correct: true, time: timestamp },
    ...
  ],
  lastNotificationTime: timestamp
}

pointsData = {
  currentPoints: 0,
  lifetimePoints: 0
}

mascotsData = {
  owned: [],           // array of mascot ids: ['wizard', 'owl', ...]
  equipped: null,     // mascot id or null
  levels: {           // mascot id -> level 1-3
    wizard: 1,
    owl: 2,
    ...
  },
  freeWrongUsedToday: false,
  freeWrongResetDate: null
}
```