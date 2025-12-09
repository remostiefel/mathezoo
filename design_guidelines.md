# Mathemat Design Guidelines
## Adaptive Mathematics Learning Application

---

## Design Approach: Educational System Design

**Selected Framework:** Material Design for Education + Custom Mathematical UI Patterns
**Rationale:** This educational app requires clarity, structure, and purposeful interaction. Material Design provides accessible components and clear hierarchy, while custom mathematical visualizations ensure pedagogical effectiveness.

**Core Design Principles:**
- Cognitive clarity over visual decoration
- Purposeful color to support mathematical understanding
- Consistent spatial relationships across representation types
- Child-appropriate interaction patterns
- Professional teacher interface distinct from student experience

---

## Color Palette - Modern Vibrant Edition for Kids (Ages 10-12) 🎨

### Light Mode - Vibrant Engaging Learning Environment

**Primary Brand Colors:**
- Soft Lavender Primary: 270 50% 68% (primary actions, gentle focus)
- Pastel Background: 280 35% 98% (calming, non-distracting base)
- Warm Text: 260 25% 25% (readable, friendly)

**Mathematical Learning Colors:**
- Tens Zone (Soft Pink): 345 60% 78% (warm, approachable)
  - Foreground: 345 50% 25%
  - Border: 345 50% 70%
  
- Ones Zone (Sky Blue): 200 45% 75% (calm, clear)
  - Foreground: 200 50% 25%
  - Border: 200 40% 68%
  
- Discovery (Peach): 25 55% 75% (inviting, encouraging)
  - Foreground: 25 55% 25%
  - Border: 25 50% 68%
  
- Achievement (Sage Green): 145 40% 70% (positive, growth)
  - Foreground: 145 50% 20%
  - Border: 145 35% 62%
  
- Learning Teal (Mint): 175 45% 70% (fresh, focus)
  - Foreground: 175 50% 20%
  - Border: 175 40% 62%

**Supporting Colors:**
- Accent Rose: 320 35% 88% (highlights, special elements)
- Warning Butter: 40 70% 75% (gentle alerts)
- Secondary Lilac: 300 30% 88% (subtle variations)

### Dark Mode - Energetic Night Theme

**Primary Colors:**
- Soft Lavender Primary: 270 45% 60% (maintained pastel feel)
- Deep Lavender Background: 270 25% 15% (comfortable darkness)
- Bright Text: 270 20% 90% (excellent readability)

**Mathematical Learning Colors (Dark Adjusted):**
- Tens Zone: 345 50% 60% (dimmed pink)
- Ones Zone: 200 40% 60% (dimmed blue)
- Discovery: 25 50% 60% (dimmed peach)
- Achievement: 145 35% 55% (dimmed sage)
- Learning Teal: 175 40% 55% (dimmed mint)

---

## Typography

**Primary Font Family:** Inter (Google Fonts)
- Excellent readability for children
- Professional appearance for teacher dashboard
- Strong number rendering

**Type Scale:**
- Display (Lesson Titles): 2.5rem, 700 weight
- Heading 1 (Task Instructions): 1.75rem, 600 weight
- Heading 2 (Section Headers): 1.25rem, 600 weight
- Body (Student Interface): 1rem, 500 weight
- Caption (Mathematical Annotations): 0.875rem, 500 weight
- Number Display: 2rem, 700 weight (for math operations)

**Secondary Font:** JetBrains Mono (Google Fonts)
- Used exclusively for mathematical symbolic notation
- Clear distinction of numbers and operators
- Size: 1.5rem for operational displays

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Micro spacing (element padding): p-2, p-4
- Component spacing: gap-6, space-y-8
- Section spacing: py-12, py-16
- Major layout divisions: p-24

**Grid Structure:**
- Student workspace: 12-column grid
- Multi-representation hub: 2×2 grid (equal quadrants)
- Teacher dashboard: Flexible grid with data cards
- Task display: Centered with max-w-4xl

**Responsive Breakpoints:**
- Mobile: Single column, stacked representations
- Tablet (768px+): 2-column representation grid
- Desktop (1024px+): Full 2×2 synchronized hub

---

## Component Library

### Student Interface Components

**Mathematical Representations (Core Learning Components):**

1. **Twenty-Field (Zwanzigerfeld)**
   - 2×10 grid structure with 5+5 visual grouping
   - Filled circles: Mathematical Blue (220 70% 55%)
   - Empty circles: Structural Gray with 40% opacity
   - Hover states: Scale transform 1.05 for interactivity
   - Transition highlighting for place value crossing

2. **Number Line**
   - Horizontal line with tick marks at integers 0-20
   - Current position indicator: Large dot with glow effect
   - Jump arcs: Animated SVG paths showing calculation steps
   - Color coding: Tens (orange segment 10-20), Ones (blue segment 0-10)

3. **Interactive Counters (Plättchen)**
   - Draggable circular tokens
   - Active token: Mathematical Blue with shadow-lg
   - Placed token: Learning Teal
   - Drop zones: Dashed borders with bg-opacity-10
   - Haptic-style animation on successful placement

4. **Symbolic Notation**
   - JetBrains Mono font display
   - Interactive number inputs with focus ring
   - Operator symbols (+, −, =) in Discovery Orange
   - Real-time synchronization indicator (pulsing dot)

**Sentence Builder Module:**
- Modular building blocks with rounded corners (rounded-lg)
- Strategy verbs: Mathematical Blue background
- Number objects: Tens color or Ones color based on value
- Connectors: Neutral gray
- Drag-and-drop with visual feedback (opacity changes, borders)

**Task Display Card:**
- Clean white/dark card with shadow-md
- Task number badge in top-left
- Clear visual separation between instruction and workspace
- Progress indicator bar at bottom

### Navigation & Structure

**Student Navigation:**
- Bottom navigation bar (mobile-friendly)
- Icon-based with labels: Diagnose, Practice, Discover, Profile
- Active state: Thicker bottom border (border-b-4) in primary color
- Smooth page transitions

**Teacher Dashboard Navigation:**
- Left sidebar on desktop
- Collapsible sections: Students, Analytics, Resources
- Professional styling with subtle shadows

### Data Visualization (Teacher Dashboard)

**Error Heatmap:**
- Grid visualization of task types
- Color intensity: Light (few errors) → Dark (many errors)
- Interactive tooltips with error details
- Uses Discovery Orange gradient scale

**Strategy Development Timeline:**
- Horizontal timeline with milestone markers
- Line chart overlay showing strategy percentages
- Color-coded strategies: Counting (gray), Decomposition (blue), Automated (green)

**ZPD Profile Diagram:**
- Concentric circles: Comfort zone (inner), Challenge zone (middle), Frustration zone (outer)
- Plot current task difficulty levels as dots
- Visual sweet spot highlighting

### Gamification Elements (Simple)

**Researcher Mission Cards:**
- Illustrated card design with mission icon
- Progress circle indicator
- Completion badge overlay
- Colors: Mathematical Blue for active, Learning Teal for completed

**Achievement Badges:**
- SVG icon designs for strategy types
- "Decomposition Expert" (blue with splitting visual)
- "Pattern Detective" (teal with magnifying glass)
- "Strategy Switcher" (multi-color for flexibility)
- Display in student profile grid

---

## Interaction Patterns

**Synchronization Feedback:**
- When child interacts with one representation, others update with brief highlight animation (200ms pulse)
- Connection lines briefly appear showing relationship
- Subtle sound feedback (optional, teacher-controlled)

**Error Handling:**
- No harsh red colors
- Discovery Orange highlight with constructive prompt
- "Researcher Mode": "Let's investigate this together..."
- Undo button always visible (circular arrow icon)

**Loading States:**
- Mathematical-themed loading animations (counting dots, number sequences)
- Progress indicators during diagnostic analysis
- Skeleton screens for dashboard data loading

**Drag and Drop:**
- Clear drop zones with visual affordance
- Snap-to-grid for precision
- Animation on successful drop (scale bounce)
- Return animation on invalid drop

---

## Accessibility & Inclusive Design

**Visual Accessibility:**
- High contrast mode available (WCAG AAA compliance)
- Adjustable interface scale (100%, 125%, 150%)
- Color-blind friendly palettes (secondary indicators beyond color)

**Interaction Accessibility:**
- Keyboard navigation for all interactive elements
- Screen reader support with mathematical notation descriptions
- Touch targets minimum 44×44px
- Reduced motion option (disables all transitions)

**Language Support:**
- Text-to-speech for all task instructions
- Multi-language sentence builder templates
- Symbol-based alternatives for emerging readers

---

## Animation Guidelines - Pastel Edition

**Micro-interactions:**
- Duration: 150-250ms for state changes
- Easing: ease-in-out for natural feel
- Scale transforms: 1.0 → 1.05 for hover, 0.95 → 1.0 for press

**Synchronization Animations:**
- Sync Pulse: 600ms subtle ring animation with pastel primary glow
- Gentle Bounce: 800ms soft bounce for successful interactions
- Cross-fade between representation states (300ms)
- Highlight pulse when linked element changes (200ms)

**Pastel-Specific Animations:**
- Soft Glow: 2s infinite gentle glow for active elements
- Float: 3s infinite subtle floating for decorative elements
- Number decomposition: Splitting visual (800ms, step-by-step)
- Place value crossing: Bridge-building animation (1000ms)
- Strategy demonstration: Slow-motion replay (user-controlled speed)

**Visual Effects:**
- Pastel Gradient: Smooth 135° gradient using primary, teal, and achievement
- Glass Effect: Subtle backdrop blur (12px) with 80% opacity
- Math Focus: Soft lavender outline on focus (no harsh borders)

**Performance:**
- Use CSS transforms (translateX, scale) over position changes
- Debounce rapid interactions (max 60fps)
- Lazy load non-critical animations
- Hardware-accelerated transforms for smooth pastel effects

---

## Teacher Dashboard Specific Design

**Professional Aesthetic:**
- Cleaner, data-focused design
- Reduced playfulness, increased information density
- Card-based layout with clear metrics
- Export functionality with professional styling

**Data Tables:**
- Sortable columns with clear headers
- Row hover states for interactivity
- Inline actions (view details, generate report)
- Pagination for large student groups

**Alert System:**
- Non-intrusive notification badges
- Priority color coding (amber for attention needed)
- Actionable recommendations in expandable panels

---

## Images & Illustrations

**Student Interface:**
- Abstract mathematical illustrations (not cartoon characters)
- Geometric patterns representing mathematical concepts
- Celebratory graphics for achievements (confetti, badges)
- No large hero images (focus on functional workspace)

**Teacher Dashboard:**
- Data visualization graphics
- Infographic-style strategy explanations
- Screenshot examples of student work patterns
- Professional icons for navigation

**Illustration Style:**
- Flat design with subtle depth (shadow-sm)
- Consistent line weights
- Mathematical precision in geometric shapes
- Friendly but not childish