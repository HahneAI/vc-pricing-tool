# Environment Variable Reference Guide

This guide provides a comprehensive reference for all the environment variables used to configure the Aspire-Competitor application. These variables allow you to customize everything from brand identity and color schemes to industry-specific terminology and visual effects.

## Table of Contents

- [Core Configuration Variables](#core-configuration-variables)
- [Industry Control Variables](#industry-control-variables)
- [Visual Customization Variables](#visual-customization-variables)
- [Business Terminology Variables](#business-terminology-variables)
- [Technical Integration Variables](#technical-integration-variables)

---

## Core Configuration Variables

These are the essential variables for setting up your company's basic brand identity.

### `VITE_COMPANY_NAME`
- **Description**: Your company's name. This is used in the page title and the main header of the application.
- **Example**: `VITE_COMPANY_NAME="GreenThumb Pro Landscaping"`

### `VITE_PRIMARY_COLOR`
- **Description**: The primary color for your brand, used for buttons, links, and other key UI elements.
- **Format**: A valid CSS hex color code.
- **Example**: `VITE_PRIMARY_COLOR="#2e8b57"`

### `VITE_SECONDARY_COLOR`
- **Description**: The secondary color for your brand, used for accents and complementary UI elements.
- **Format**: A valid CSS hex color code.
- **Example**: `VITE_SECONDARY_COLOR="#8b4513"`

### `VITE_ACCENT_COLOR`
- **Description**: An accent color used for highlights, special notifications, and other standout elements.
- **Format**: A valid CSS hex color code.
- **Example**: `VITE_ACCENT_COLOR="#f4a460"`

### `VITE_SUCCESS_COLOR`
- **Description**: The color used to indicate a successful action or state (e.g., a "Message Sent" confirmation).
- **Format**: A valid CSS hex color code.
- **Example**: `VITE_SUCCESS_COLOR="#32cd32"`

### `VITE_WELCOME_MESSAGE`
- **Description**: The initial greeting message that the AI assistant displays to users when they first open the chat interface.
- **Example**: `VITE_WELCOME_MESSAGE="Welcome to GreenThumb Pro! How can we help you design your dream outdoor space today?"`

### `VITE_LOGO_URL`
- **Description**: The URL or path to your company's logo. This can be an absolute URL to an image hosted online, or a relative path to a file in the `public/` directory.
- **Example (URL)**: `VITE_LOGO_URL="https://your-cdn.com/logo.png"`
- **Example (Local Path)**: `VITE_LOGO_URL="/assets/branding/my-logo.svg"`

---

## Industry Control Variables

These variables control the industry-specific theming, seasonal adaptations, and regional settings.

### `VITE_INDUSTRY_TYPE`
- **Description**: Sets the overall theme and behavior of the application to match a specific industry.
- **Options**:
    - `landscaping`: Activates the landscaping theme (e.g., green color palette, nature-inspired visuals).
    - `hvac`: Activates the HVAC theme (e.g., blue/orange color palette, technical visuals).
    - `""` (empty): Uses the default "TradeSphere" tech theme.
- **Example**: `VITE_INDUSTRY_TYPE="landscaping"`

### `VITE_USE_SEASONAL_THEMES`
- **Description**: Enables or disables automatic seasonal adjustments to the color scheme and messaging.
- **Options**: `true`, `false`
- **Example**: `VITE_USE_SEASONAL_THEMES="true"`

### `VITE_REGION`
- **Description**: Sets the geographic region to tailor seasonal messaging and other regional content.
- **Options**: `northeast`, `southeast`, `midwest`, `southwest`, `west`, `pacific_northwest`
- **Example**: `VITE_REGION="southeast"`

### `VITE_CLIMATE_ZONE`
- **Description**: Sets the climate zone for more precise seasonal adjustments, particularly for landscaping and HVAC industries.
- **Format**: A valid USDA Plant Hardiness Zone (e.g., `7a`, `8b`).
- **Example**: `VITE_CLIMATE_ZONE="7a"`

---

## Visual Customization Variables

These variables allow you to fine-tune the visual appearance and user experience of the application.

### `VITE_HEADER_ICON`
- **Description**: The name of a [Lucide React](https://lucide.dev/icons/) icon to display in the header next to the company name.
- **Example**: `VITE_HEADER_ICON="TreePine"` (for landscaping), `VITE_HEADER_ICON="Wrench"` (for HVAC)

### `VITE_SEND_EFFECT`
- **Description**: The animation effect that plays when a user sends a message.
- **Options**: `leaf_flutter`, `spark_burst`, `gear_spin`, `water_ripple`, `none`
- **Example**: `VITE_SEND_EFFECT="leaf_flutter"`

### `VITE_LOADING_ANIMATION`
- **Description**: The type of animation displayed on the loading screen.
- **Options**: `growth`, `building`, `gears`, `dots`, `default`
- **Example**: `VITE_LOADING_ANIMATION="growth"`

### `VITE_MESSAGE_STYLE`
- **Description**: The visual style of the chat message bubbles.
- **Options**:
    - `organic`: Softer, more rounded message bubbles.
    - `geometric`: More angular, modern message bubbles.
- **Example**: `VITE_MESSAGE_STYLE="organic"`

### `VITE_BACKGROUND_PATTERN`
- **Description**: The subtle background texture pattern used throughout the application.
- **Options**: `subtle_organic`, `technical_grid`, `blueprint`, `none`
- **Example**: `VITE_BACKGROUND_PATTERN="subtle_organic"`

---

## Business Terminology Variables

These variables allow you to customize the language used within the application to match your business's preferred terminology.

### `VITE_BUSINESS_TYPE`
- **Description**: A short description of your business type, used by the AI to frame its responses.
- **Example**: `VITE_BUSINESS_TYPE="landscape_contractor"`, `VITE_BUSINESS_TYPE="hvac_specialist"`

### `VITE_PROJECT_LANGUAGE`
- **Description**: The term used to refer to the work being discussed (e.g., a "project," an "engagement," a "job").
- **Example**: `VITE_PROJECT_LANGUAGE="outdoor_living_spaces"`

### `VITE_ESTIMATE_LANGUAGE`
- **Description**: The term used for the pricing estimate.
- **Example**: `VITE_ESTIMATE_LANGUAGE="landscape_investment"`, `VITE_ESTIMATE_LANGUAGE="system_quote"`

### `VITE_PRIMARY_SERVICES`
- **Description**: A comma-separated list of your main services. This helps the AI understand the scope of your business.
- **Example**: `VITE_PRIMARY_SERVICES="hardscaping,softscaping,maintenance,design"`

### `VITE_PLACEHOLDER_EXAMPLES`
- **Description**: Custom placeholder text for the message input field, suggesting what users can ask.
- **Example**: `VITE_PLACEHOLDER_EXAMPLES="e.g., 'I want a new patio and a fire pit.'"`

### `VITE_SPECIALIZATION`
- **Description**: The level of specialization of your business.
- **Options**: `full_service`, `specialist`, `consultant`
- **Example**: `VITE_SPECIALIZATION="full_service"`

### `VITE_URGENCY_LEVEL`
- **Description**: The typical urgency of your services, which can influence AI responses.
- **Options**: `routine`, `seasonal`, `emergency`
- **Example**: `VITE_URGENCY_LEVEL="seasonal"`

---

## Technical Integration Variables

These variables are required to connect the application to backend services.

### `VITE_SUPABASE_URL`
- **Description**: The URL of your Supabase project.
- **Example**: `VITE_SUPABASE_URL="https://xyz.supabase.co"`

### `VITE_SUPABASE_ANON_KEY`
- **Description**: The anonymous (public) key for your Supabase project.
- **Example**: `VITE_SUPABASE_ANON_KEY="ey..."`

### `VITE_MAKE_WEBHOOK_URL`
- **Description**: The webhook URL for your Make.com scenario that powers the AI assistant.
- **Example**: `VITE_MAKE_WEBHOOK_URL="https://hook.us1.make.com/..."`
