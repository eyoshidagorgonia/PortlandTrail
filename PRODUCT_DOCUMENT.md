# The Portland Trail: Product Requirements Document (PRD)

**Version:** 1.1
**Status:** In Progress
**Author:** Sr. Product Manager

---

## 1. Vision Statement

"The Portland Trail" is a narrative-driven, single-player RPG that satirizes modern hipster culture through a dark, ironic, and artistically rich gameplay experience, leveraging generative AI to create a unique and endlessly replayable journey of curated suffering.

## 2. Target Audience

-   **Primary:** Millennials (ages 28-40) with an appreciation for indie games, dark humor, and self-aware satire. They are likely familiar with classic RPGs (like Diablo II) and have a cultural awareness of hipster tropes.
-   **Secondary:** Gen Z players (ages 18-27) who enjoy story-rich indie games, unique art styles, and games with strong atmospheric and narrative components.

## 3. Product Goals & Strategy

-   **Goal:** Deliver a highly engaging and memorable narrative RPG that stands out through its unique theme, art style, and deep integration of generative AI.
-   **Strategy:** Focus on the replayability created by AI-driven scenarios and loot. Our core monetization strategy is based on the initial purchase price, so a strong single-player experience that generates positive word-of-mouth is critical for success.
-   **Core Pillars:**
    1.  **Deeply Ironic & Humorous Narrative:** The writing and scenarios are the heart of the game.
    2.  **Compelling Atmosphere:** A unique "Studio Ghibli meets Diablo II" art style supported by moody, generative visuals.
    3.  **Endless Replayability:** AI-generated content ensures no two journeys are exactly the same.
    4.  **Engaging Core Loop:** Simple to learn but with surprising depth through stat and loot management.

## 4. Feature Specifications

### 4.1. Character Creation & Identity

-   **FRD-001: AI Name Generation:** The game will suggest a thematically appropriate, quirky, gender-neutral name for the player. The player must have the option to accept the suggestion or manually enter their own.
-   **FRD-002: Profession Selection:** The player will select a starting profession from a predefined list of ironic hipster jobs. This choice serves as an initial flavor input for AI generation.
-   **FRD-003: AI Avatar Generation:** Based on the player's name and job, the system will generate a unique, painterly character portrait. This portrait will persist throughout the game as the player's primary visual identity.

### 4.2. Core Gameplay Loop

-   **FRD-010: Turn-Based Progression:** The game progresses in discrete turns. Each turn consists of a scenario, a player choice, an outcome, and an optional player action.
-   **FRD-011: AI Scenario Generation:** At the start of a turn, the AI Game Master generates a new situation, including an atmospheric scenario description and a specific challenge.
-   **FRD-012: Dynamic Player Choices:** The player is presented with six distinct choices to resolve the scenario. Each choice will have short button text and a more descriptive tooltip.
-   **FRD-013: Consequence & Outcome System:** Player choices will have immediate and clear consequences on their stats, progress, and resources. These outcomes will be displayed to the player before the next turn begins.
-   **FRD-014: Player Actions:** After a scenario is resolved, the player can perform one of four predefined actions (Forage, Tune-up Bike, Go Thrifting, Street Perform) to manage their resources. Performing an action consumes a turn and triggers the next scenario.

### 4.3. Stats & Resource Management

-   **FRD-020: Vitals System:** The player must manage three core vitals:
    -   **Health:** Represents physical well-being. Reaching 0 results in a game over.
    -   **Vibes:** A mana-like resource for mental and creative energy.
    -   **Stamina:** Represents the durability of the player's fixed-gear bike. Reaching 0 results in a game over.
-   **FRD-021: Social Stats System:** The player will manage three social stats that influence choices and outcomes: **Style, Irony, and Authenticity.**
-   **FRD-022: Currency & Consumables:** **Coffee Beans** will serve as the primary currency for actions and purchases.

### 4.4. Loot & Equipment System

-   **FRD-030: AI-Generated Loot Drops:** Based on player choices, the system may generate caches of loot items.
-   **FRD-031: Equipment Slots:** The player can equip one item in each of the five designated slots: **Headwear, Outerwear, Accessory, Footwear, and Eyewear.**
-   **FRD-032: Gear Quality Tiers:** Items will be procedurally generated with one of several quality tiers (e.g., Thrifted, Artisanal, One-of-One), indicated by color and flavor text.
-   **FRD-033: Stat Modifiers:** Every piece of equipment will have procedurally generated modifiers that grant positive or negative changes to player stats, enabling unique character builds. Equipping/unequipping items will instantly recalculate the player's effective stats.

### 4.5. Progress & UI/UX

-   **FRD-040: Visual Trail Map:** A map will visually represent the player's progress from San Francisco to Portland, highlighting key waypoints.
-   **FRD-041: Travel Diary:** A chronological log will record all scenarios, choices, and outcomes, allowing players to review their story.
-   **FRD-042: Badges of Dishonor:** The system will award achievement-style badges for specific choices. "Uber" badges will have unique visual effects and AI-generated icons.

### 4.6. Onboarding & First-Time User Experience (FTUE)

-   **FRD-050: Initial Game State**: The game must start the player with a pre-set, non-randomized initial state (`INITIAL_PLAYER_STATE`). This ensures a consistent starting point for all players to learn the core mechanics without being immediately subject to difficult, random scenarios.
-   **FRD-051: Introduction to Core Loop**: The user interface must provide contextual guidance for new players. Tooltips should be prominently used on the main action buttons and choice buttons during the first few turns to explain their function and encourage exploration of the UI.
-   **FRD-052: In-Game Help System**: A dedicated "How to Play" or "Help" page must be accessible from the main game screen at all times. This page will contain a comprehensive explanation of all gameplay systems, including stats, resources, actions, and the overall goal of the game, so players can reference it whenever they are unsure how a mechanic works.

## 5. Future Considerations (Out of Scope for v1.0)

-   Social sharing features for key moments (e.g., earning a badge, finding unique loot).
-   Leaderboards for stats like "Peak Irony" or "Fastest Completion".
-   Additional starting locations and professions.
-   A crafting system ("Upcycling") to combine old gear into new items.
