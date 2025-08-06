# System Requirements & Technical Specifications

This document serves as an engineering companion to the main Product Document. It outlines the non-functional requirements (NFRs), detailed system mechanics, and technical constraints necessary to build "The Portland Trail" effectively.

## 1. Non-Functional Requirements (NFRs)

### 1.1. Performance & Latency
To ensure an engaging player experience, AI-generated content must be delivered within acceptable timeframes.

-   **P-01: Text Generation Latency:** All text-based AI generations (name, mood, scenario, loot) must have a 95th percentile (P95) latency of **under 3 seconds**.
-   **P-02: Image Generation Latency:** AI image generation (avatar, scene, badges) is more intensive. The P95 latency should be **under 8 seconds**.
-   **P-03: Loading States:** The UI **must** display non-blocking loading indicators for all asynchronous AI operations to manage user perception of wait times. The game state should be locked to prevent further actions while a critical AI operation is in progress.

### 1.2. Error Handling & System Resilience
The game must be resilient to failures from external AI services.

-   **E-01: AI Service Fallbacks:** Every AI-driven feature must have a defined fallback mechanism.
    -   **Name/Transport Generation:** On failure, use a random selection from a predefined list of hardcoded values (e.g., `INITIAL_PLAYER_STATE.name`).
    -   **Scenario/Loot Generation:** On failure, display a user-facing error toast and give the player the option to retry the last action. Do not proceed with a broken state.
    -   **Image Generation:** On failure, the UI should display a placeholder image or simply omit the image. The game must continue without a generated image.
-   **E-02: System Status Tracking:** The application must track the status of its AI service dependencies and make this information available to the user in a non-intrusive way (e.g., an icon in the corner, detailed in a help/about page).

### 1.3. State Management
-   **S-01: Session Persistence:** The game state **is not** required to persist between browser sessions for v1.0. A refresh or closing the tab will restart the game. Future versions may consider `localStorage` for saving progress.

## 2. Detailed Gameplay Mechanics

### 2.1. Loot System
-   **M-01: Loot Drop Trigger:** Loot caches are not generated randomly. They will only be generated when a player `Choice` explicitly includes a `reward.loot` object in its consequences, as determined by the AI Game Master.
-   **M-02: Stat Calculation Order:** Player stats are calculated with a clear order of precedence: `Base Stats + Equipment Modifiers`. Stat changes from choice consequences are applied to this recalculated value.

### 2.2. Game Progression
-   **M-10: Location-Aware Scenarios:** The prompt sent to `generatePortlandScenario` **must** explicitly include the player's current `location`. The prompt will instruct the AI to tailor the scenario to that specific waypoint on the trail.
-   **M-11: Difficulty Scaling:** For v1.0, there will be no dynamic difficulty scaling. The challenge is emergent from the AI's generation and the player's resource management.

## 3. AI Generation Constraints

### 3.1. Content Safety & Moderation
-   **A-01: Safety Configuration:** All calls to external AI models must, where possible, configure safety settings to block harmful or inappropriate content (e.g., hate speech, sexually explicit content). The specific thresholds should be set to "BLOCK_MEDIUM_AND_ABOVE" or its equivalent.

### 3.2. AI Prompt Engineering
-   **A-10: Game Master Persona:** All prompts for the AI Game Master (scenarios, challenges) **must** include a preamble defining its persona: "You are the Game Master for 'The Portland Trail,' a quirky, dark, and ironic text-based RPG. Your tone is witty, slightly sarcastic, and evocative of a world-weary storyteller."
-   **A-11: JSON Output Enforcement:** All prompts that require a structured response **must** explicitly instruct the model to respond *only* with a valid, minified JSON object and nothing else. The prompt must include a schema or example of the expected format.
