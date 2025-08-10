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

-   **E-01: API Service Failures:** If a call to an AI service fails (e.g., network error, invalid response), the application must not crash. It should display a user-facing error toast with a descriptive message and allow the player to retry the last action where appropriate. The system should not proceed with a broken or incomplete state.
-   **E-02: Hardcoded Fallbacks:** For critical initial state generation like the player's name, a hardcoded list of fallback values must be used if the API call fails, as specified in `generate-hipster-name.ts`. This ensures the game can always start.

### 1.3. State Management
-   **S-01: Session Persistence:** The game state **is not** required to persist between browser sessions for v1.0. A refresh or closing the tab will restart the game. Future versions may consider `localStorage` for saving progress.

## 2. Detailed Gameplay Mechanics

### 2.1. Loot System
-   **M-01: Loot Drop Trigger:** Loot caches are not generated randomly. They will only be generated after a player makes a choice, triggered by the `getLootAction` function.
-   **M-02: Stat Calculation Order:** Player stats are calculated with a clear order of precedence: `Base Stats + Equipment Modifiers`. Stat changes from choice consequences are applied to this recalculated value.

### 2.2. Game Progression
-   **M-10: Location-Aware Scenarios:** The prompt sent to `generatePortlandScenario` **must** explicitly include the player's current `location`. The prompt will instruct the AI to tailor the scenario to that specific waypoint on the trail.
-   **M-11: Difficulty Scaling:** For v1.0, there will be no dynamic difficulty scaling. The challenge is emergent from the AI's generation and the player's resource management.

## 3. AI Generation Constraints

### 3.1. Content Safety & Moderation
-   **A-01: Safety Configuration:** All calls to external AI models should have safety settings configured at the source (e.g., on the model hosting service) to block harmful or inappropriate content.

### 3.2. AI Prompt Engineering
-   **A-10: Game Master Persona:** All prompts for the AI Game Master (scenarios, challenges) **must** include a preamble defining its persona: "You are the Game Master for 'The Portland Trail,' a quirky, dark, and ironic text-based RPG. Your tone is witty, slightly sarcastic, and evocative of a world-weary storyteller."
-   **A-11: JSON Output Enforcement:** All prompts that require a structured response **must** explicitly instruct the model to respond *only* with a valid, minified JSON object and nothing else. The prompt must include a schema or example of the expected format.
-   **A-12: Primary Text Model:** All text and JSON generation tasks are to be performed by the **`gemma3:12b`** model, accessed via the OpenAI-compatible chat completions endpoint specified in `nexix-api.ts`.
