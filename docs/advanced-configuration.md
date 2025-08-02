# Advanced Configuration Guides

This guide delves into the more advanced customization options available in the Aspire-Competitor application. Once you've mastered the basics, use these guides to fine-tune the platform's appearance and behavior to your exact specifications.

## Table of Contents

- [Color System Guide](#color-system-guide)
- [Visual Effects Catalog](#visual-effects-catalog)
- [Seasonal Theming Setup](#seasonal-theming-setup)
- [Business Terminology Customization](#business-terminology-customization)
- [Fallback System Documentation](#fallback-system-documentation)

---

## Color System Guide

The application uses a five-color system to provide a flexible and consistent brand experience. Understanding how these colors work together is key to creating a professional look.

- **`VITE_PRIMARY_COLOR`**: The most prominent color. Used for primary buttons, links, headers, and major UI elements. This should be your main brand color.
- **`VITE_SECONDARY_COLOR`**: A complementary color used for secondary buttons, borders, and less prominent UI elements. It should contrast well with the primary color.
- **`VITE_ACCENT_COLOR`**: A "highlight" color used to draw attention to specific elements, such as active form fields, special notifications, or progress bars.
- **`VITE_SUCCESS_COLOR`**: The color used exclusively for success states, such as confirming that a message has been sent. This is often a shade of green.
- **`VITE_ERROR_COLOR`**: (Not yet implemented, but planned) The color used for error messages and failed states. Typically a shade of red.

**Best Practices**:
- Use a color palette generator (like Coolors or Adobe Color) to create a harmonious color scheme.
- Ensure your primary and secondary colors have sufficient contrast for readability.
- Use the accent color sparingly to maximize its impact.

---

## Visual Effects Catalog

This catalog lists all the available visual effects you can use to customize the user experience.

### Header Icons (`VITE_HEADER_ICON`)
Icons are sourced from the [Lucide React](https://lucide.dev/icons/) library. You can use the name of any icon from their collection.

**Popular Choices**:
- **Landscaping**: `TreePine`, `Sprout`, `Flower`
- **HVAC**: `Wrench`, `Fan`, `Thermometer`
- **Tech/Corporate**: `Briefcase`, `Zap`, `Network`
- **Construction**: `Hammer`, `Construction`, `HardHat`

### Send Button Effects (`VITE_SEND_EFFECT`)
This effect plays when a user sends a message.

- `leaf_flutter`: A cascade of leaves. (Good for landscaping)
- `spark_burst`: A burst of sparks. (Good for tech/industrial)
- `gear_spin`: A spinning gear animation. (Good for HVAC/mechanical)
- `water_ripple`: A gentle water ripple. (Good for plumbing/serene brands)
- `none`: No effect.

### Loading Animations (`VITE_LOADING_ANIMATION`)
This animation is shown on the initial loading screen.

- `growth`: An animation of a plant growing. (Good for landscaping)
- `building`: An animation of a structure being built. (Good for construction)
- `gears`: An animation of interlocking gears. (Good for HVAC/mechanical)
- `dots`: A simple, elegant dot-based loading animation. (Good for tech/default)
- `default`: A standard spinner animation.

### Background Patterns (`VITE_BACKGROUND_PATTERN`)
A subtle texture applied to the application background.

- `subtle_organic`: A gentle, nature-inspired texture.
- `technical_grid`: A clean, grid-based pattern.
- `blueprint`: A pattern that resembles architectural blueprints.
- `none`: A solid, clean background.

---

## Seasonal Theming Setup

Seasonal theming allows the application to adapt its colors and messaging based on the time of year and the user's location.

- **Enable/Disable**: `VITE_USE_SEASONAL_THEMES="true"`
- **Region**: `VITE_REGION` (e.g., `northeast`, `southwest`)
- **Climate Zone**: `VITE_CLIMATE_ZONE` (e.g., `7a`, `9b`)

**How It Works**:
1.  The application uses the `VITE_REGION` and `VITE_CLIMATE_ZONE` to determine the current season (e.g., "early spring" in the southeast vs. "late winter" in the northeast).
2.  Based on the season, it can subtly adjust the color palette. For example, a landscaping theme might become more vibrant in the spring and take on warmer tones in the autumn.
3.  The AI assistant can also use this information to provide more relevant messaging (e.g., "It's the perfect time to plant tulips in your region," or "Is your furnace ready for the winter ahead?").

---

## Business Terminology Customization

Tailoring the language of the application is crucial for aligning with your brand's voice.

- **`VITE_PROJECT_LANGUAGE`**: What do you call a unit of work? A "project," a "job," an "engagement," a "case"?
- **`VITE_ESTIMATE_LANGUAGE`**: What do you call your price quote? An "estimate," a "quote," an "investment proposal," a "service agreement"?
- **`VITE_PRIMARY_SERVICES`**: A comma-separated list of your core offerings. This helps the AI understand what you do and frame its responses accordingly.
- **`VITE_PLACEHOLDER_EXAMPLES`**: The placeholder text in the message input field. This is a great opportunity to guide your users. Instead of a generic "Type a message...", try something like, "Tell us about your project..." or "e.g., 'I need a new AC unit for my 2,000 sq ft home.'"

---

## Fallback System Documentation

The application is designed to be resilient. If you don't set a specific environment variable, it will fall back to a sensible default. This ensures that the application always looks professional, even with minimal configuration.

**How It Works**:
1.  **Variable Check**: The application first checks if a specific environment variable is set (e.g., `VITE_PRIMARY_COLOR`).
2.  **Industry Template Fallback**: If the variable is not set, it checks if an industry template is active (`VITE_INDUSTRY_TYPE`). If so, it uses the default value for that template (e.g., the default green for the landscaping template).
3.  **Global Default Fallback**: If no industry template is active, it falls back to the global default "TradeSphere" theme (e.g., the default blue color).

This layered fallback system (`Your Setting` > `Industry Default` > `Global Default`) ensures that you can customize as much or as little as you want without breaking the user experience. For a complete list of variables, refer to the [Environment Variable Reference Guide](./environment-variables.md).
