# Mathemat - Neuroadaptive Mathematik-Förderung

## Overview

Mathemat is a scientifically-backed, AI-powered mathematics learning platform designed to adapt automatically to each individual learner. It provides individualized support for addition and subtraction within the number range up to 1000, precisely tailored to the needs of each child. The platform addresses challenges such as persistent counting strategies, varying individual learning speeds, and issues of over- or under-challenge leading to frustration. By leveraging a neuroadaptive learning system, Mathemat aims to foster mathematical understanding, enable structured learning, and prepare students for advanced mathematical concepts. It offers a revolutionary approach to math education, providing personalized learning paths, adaptive difficulty, and comprehensive analytics for teachers, ultimately contributing to a significant market potential in educational technology.

## User Preferences

I want to be addressed directly and in a professional but approachable tone. When explaining concepts, please use clear, concise language, avoiding overly technical jargon where simpler terms suffice. I prefer iterative development, with regular updates on progress and opportunities for feedback. Before making any major architectural changes or implementing new features, please ask for my approval. I appreciate detailed explanations for complex decisions or significant code changes. Do not make changes to files within the `attached_assets/` directory.

## System Architecture

### UI/UX Decisions

The platform offers distinct interfaces for students (`student-workspace-progressive.tsx`) and teachers (`teacher-dashboard.tsx`), along with a `simulation-viewer.tsx`. The student interface prioritizes a clean, engaging design with gamification elements like stars, achievements, and progress bars to maintain motivation without distraction. The teacher dashboard focuses on clear data visualization, providing detailed overviews and individual student analytics. Adaptive representation changes based on the student's learning progress are a core UI/UX feature, dynamically adjusting the level of visual support.

### Technical Implementations

The core of Mathemat is the **Brain-Inspired Progression System 3.0 (BPS 3.0)**, a 44-neuron network that analyzes learning behavior across 24 input parameters (performance, strategy, metacognition, emotion, context). This network feeds into 12 hidden neurons for integration and pattern recognition, outputting adjustments across 8 dimensions (e.g., task difficulty, visual support, feedback depth). Learning mechanisms include Hebbian Learning, STDP, and Synaptic Consolidation.

The system employs an **Ensemble of 5 AI Predictor Models** (Bayesian, Neural Net, Symbolic Reasoner, Case-Based Reasoner, Hybrid) that use a voting system for weighted majority decisions on learning progressions. A **Genetic Task Generator** evolves optimal problems by selecting candidates based on fitness criteria (difficulty, ZPD fit, pattern quality) and applying crossover and mutation.

**Adaptive Representation System:** Utilizes 5 synchronized forms of representation (fingers, 20-field, number line, turning points, symbolic) that adapt automatically based on student performance.

**Error Analysis and Compensation:** A double compensation system rewards correct answers (+1 point) and penalizes incorrect ones (-2 points), requiring 3 points for mastery. It performs intelligent error diagnosis to identify systematic and strategic errors, providing targeted support.

**Platzhalter-Aufgaben (Algebraic Thinking):** Progressive complexity tasks (e.g., `5 + _ = 8`) are integrated to foster inverse thinking and prepare for algebraic concepts.

### Feature Specifications

**For Learners:**
- **Individualized Learning:** Personal learning paths based on 54 competency fields, adaptive difficulty, appropriate representations, and immediate feedback.
- **MatheZoo Gamification System:**
  - **Zoo Collection:** Collect 50+ virtual animals (6 continents, 6 animal groups) with continent and group filters
  - **Zoo Shop:** 6 categories (decoration, food, toys, habitats, experts, special houses) to purchase with earned coins
  - **Rescue Missions:** 15 missions (continent, group, and special categories) to save animals and earn rewards
  - **Partner Zoos:** Unlock 6 international zoo partnerships (San Diego, Singapore, Berlin, Chester, Taronga, Zürich) for daily bonuses
  - **Big Goals:** 6 legendary challenges (World Collector, Zoo Champion, Speed Calculator, Perfectionist, Animal Tycoon, Partner Network)
  - **Animal Experts:** Hire 6 specialists (Monkey Researcher Lisa, Bird Expert Max, etc.) for bonus rewards
  - **Special Houses:** Build 6 unique habitats (Monkey Island, Reptile House, Bird Paradise, etc.) for daily coin bonuses
- **Adaptive Darstellungen:** Automatic adjustment of visual support based on performance.

**For Teachers:**
- **Detailed Dashboard:** Overview of student performance, competency levels, time investment, and problem areas.
- **Individual Analyses:** Competency profiles (54 fields), error analysis, time behavior, and strategy usage per child.
- **Zoo Progress Tracking:** Monitor students' animal collections, mission completion, and shop purchases.
- **Exportable Reports:** PDF exports for parent discussions, graphical evaluations, scientifically founded diagnoses, and Förderempfehlungen (support recommendations).
- **Learning Path Simulation:** Unique feature to simulate learning trajectories, predict learning time, and visualize system behavior.
- **Problem Statistics:** System-wide analysis of difficult tasks, success rates per task type, and time requirements for different number ranges.

### System Design Choices

The platform is designed to maintain learners within their **Zone of Proximal Development (ZPD)** by analyzing success rates, speed, and error types, dynamically adjusting difficulty, and providing scaffolding. It is based on established scientific principles such as the Competency Stages Model (Fritz & Ricken), Operative Päckchen (Wittmann & Müller), and Representation-Based Learning (Bruner). The system's robustness is ensured by its ensemble AI model and genetic algorithm for task generation, promoting a highly personalized and effective learning experience.

## Recent Code Optimizations (November 2025)

### Completed Optimizations
1. ✅ **Security**: Removed all hardcoded passwords from `setupAccounts.ts` - now enforces environment variables (DEFAULT_STUDENT_PASSWORD, MELV_PASSWORD, CHER_PASSWORD) with no fallback values
2. ✅ **Performance**: Fixed N+1 query problem in `getStudentsByTeacherId` by replacing sequential loop with single `inArray()` database query
3. ✅ **Performance**: Parallelized database queries in critical teacher endpoints:
   - `/api/teacher/student-stats/:studentId` - 4 queries parallel after student verification
   - `/api/analytics/student/:studentId` - parallel queries after authentication
   - All endpoints use fail-fast pattern to prevent unnecessary database queries

### Deferred Improvements (for future sessions)
The following improvements have been identified but postponed for later implementation:
1. **Input Validation**: Implement comprehensive Zod schema validation for all API endpoints to ensure data integrity and security
2. **Code Organization**: Restructure server files into logical subdirectories (e.g., `engines/`, `generators/`, `validators/`, `routes/`) for better maintainability
3. **Error Handling**: Implement consistent error handling patterns across all endpoints with proper error types and user-friendly messages
4. **Code Deduplication**: Reduce code duplication between similar generators and engine components to improve maintainability

## External Dependencies

- **Frontend:** React, TypeScript
- **Backend:** Express.js, PostgreSQL
- **AI/ML Systems:** Custom-developed
- **Deployment:** Replit Cloud Deployment

### Key Features

**For Students:**
- **Adaptive Learning:** AI-driven task generation based on 54 competency fields, cognitive load balancing, and strategy detection via 44-neuron network.
- **Representation Switching:** Five representation levels (twenty-frame, number line, counters, symbolic, hundred-field) that adapt based on performance.
- **MatheZoo Gamification:** Collect 50 animals from 6 continents (Africa, Asia, Europe, North America, South America, Polar), build a zoo, complete missions, unlock partner zoos, and achieve big goals.
- **Zoo Economy:** Earn coins for solving tasks, spend them in the shop with 30+ items, and receive offline rewards based on zoo size and animal happiness. Animals can evolve from baby to adult.
- **9 Games in 3 Categories:**
  - 🔢 **Zahlen verstehen** (4 Spiele): Zahlenwaage, Zahlen-Treppe, Zahlen-Baumeister, Zoo-Nachbarn
  - ➕ **Clever rechnen** (3 Spiele): 10 gewinnt!, Zerlegungs-Safari, Verdoppel-Expedition
  - 🎯 **Rechenmeister** (2 Spiele): Zoo-Abenteuer, Zoo-Pfadfinder
- **Progressive Levels:** 100 levels spanning 15 competency stages plus 5 mastery stages, from counting strategies to full automation.