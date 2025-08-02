# Industry Template Documentation

This guide provides a detailed look at the pre-configured industry templates available in the Aspire-Competitor application. These templates provide a starting point for customizing the tool to match your specific business needs.

## Table of Contents

- [Overview of Industry Templates](#overview-of-industry-templates)
- [Landscaping Template](#landscaping-template)
- [HVAC Template](#hvac-template)
- [Tech/Default ("TradeSphere") Template](#techdefault-tradesphere-template)
- [Creating a Custom Template](#creating-a-custom-template)

---

## Overview of Industry Templates

Industry templates are pre-defined sets of configurations that tailor the application's appearance, behavior, and terminology to a specific industry. They are activated by the `VITE_INDUSTRY_TYPE` environment variable.

Each template is a combination of specific settings for:
- **Color Schemes**: Primary, secondary, and accent colors.
- **Visual Effects**: Icons, animations, and background patterns.
- **Business Terminology**: The language used for projects, estimates, and services.

While these templates provide a solid foundation, every variable can be individually overridden to create a fully custom experience.

---

## Landscaping Template

This template is designed for landscaping, gardening, and outdoor design businesses. It evokes a natural, organic, and professional feel.

- **Activation**: `VITE_INDUSTRY_TYPE="landscaping"`
- **Theme Focus**: Nature, growth, and organic design.
- **Example Configuration**: See the ["Quiet Village" Landscaping Demo](../docs/client-demo-setup.md#complete-landscaping-demo-quiet-village-example) for a complete example.

### Default Settings

| Feature                 | Default Setting                                      | Description                                                 |
| ----------------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| **Colors**              | Green and brown color palette                        | Evokes a natural, earthy feel.                              |
| **Header Icon**         | `TreePine`                                           | A clear visual cue for the landscaping industry.            |
| **Send Effect**         | `leaf_flutter`                                       | A subtle animation of leaves fluttering when sending a message. |
| **Loading Animation**   | `growth`                                             | An animation that suggests plants growing.                  |
| **Message Style**       | `organic`                                            | Soft, rounded message bubbles.                              |
| **Background Pattern**  | `subtle_organic`                                     | A gentle, nature-inspired background texture.               |
| **Business Terminology**| "Outdoor living spaces," "landscape investment"      | Language tailored to high-end landscaping clients.          |

---

## HVAC Template

This template is designed for HVAC (Heating, Ventilation, and Air Conditioning) contractors and technicians. It projects a professional, technical, and reliable image.

- **Activation**: `VITE_INDUSTRY_TYPE="hvac"`
- **Theme Focus**: Technology, precision, and climate control.
- **Example Configuration**: See the [Complete HVAC Company Demo](../docs/client-demo-setup.md#complete-hvac-company-demo) for a full example.

### Default Settings

| Feature                 | Default Setting                                | Description                                                 |
| ----------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| **Colors**              | Blue and orange/yellow color palette           | Represents cooling and heating.                             |
| **Header Icon**         | `Wrench` or `Fan`                                | A clear visual cue for the HVAC industry.                   |
| **Send Effect**         | `gear_spin`                                    | An animation of gears turning when sending a message.       |
| **Loading Animation**   | `gears`                                        | An animation that suggests mechanical parts working.        |
| **Message Style**       | `geometric`                                    | Sharp, angular message bubbles for a technical look.        |
| **Background Pattern**  | `technical_grid` or `blueprint`                | A background that evokes technical drawings or schematics.  |
| **Business Terminology**| "HVAC system," "service quote"                 | Direct and professional language for technical services.    |

---

## Tech/Default ("TradeSphere") Template

This is the default template used when the `VITE_INDUSTRY_TYPE` variable is left empty. It's designed to be a clean, modern, and professional starting point for any business, particularly those in the tech or consulting sectors.

- **Activation**: `VITE_INDUSTRY_TYPE=""`
- **Theme Focus**: Modern, clean, and professional.

### Default Settings

| Feature                 | Default Setting                            | Description                                                 |
| ----------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| **Colors**              | A neutral blue and gray color palette      | A safe and professional choice for any business.            |
| **Header Icon**         | `Briefcase`                                | A generic but professional icon.                            |
| **Send Effect**         | `none`                                     | No special effect for a clean, minimalist feel.             |
| **Loading Animation**   | `dots`                                     | A standard, non-distracting loading animation.              |
| **Message Style**       | `geometric`                                | Modern, angular message bubbles.                            |
| **Background Pattern**  | `none`                                     | A clean, solid background.                                  |
| **Business Terminology**| "Project," "estimate"                      | Standard, widely understood business terms.                 |

---

## Creating a Custom Template

You are not limited to the pre-built templates. You can create a unique configuration for any industry by setting the environment variables individually.

**Example: A Custom Template for a Modern Architecture Firm**

1.  **Start with the Default Theme**: Leave `VITE_INDUSTRY_TYPE` empty to use the "TradeSphere" template as a base.
    - `VITE_INDUSTRY_TYPE=""`

2.  **Set a Monochromatic Color Scheme**:
    - `VITE_PRIMARY_COLOR="#333333"`
    - `VITE_SECONDARY_COLOR="#e0e0e0"`
    - `VITE_ACCENT_COLOR="#cccccc"`

3.  **Choose a Minimalist and Professional Icon and Visuals**:
    - `VITE_HEADER_ICON="Building"`
    - `VITE_SEND_EFFECT="none"`
    - `VITE_LOADING_ANIMATION="dots"`
    - `VITE_MESSAGE_STYLE="geometric"`
    - `VITE_BACKGROUND_PATTERN="blueprint"`

4.  **Customize the Terminology**:
    - `VITE_BUSINESS_TYPE="architectural_design_firm"`
    - `VITE_PROJECT_LANGUAGE="building_design"`
    - `VITE_ESTIMATE_LANGUAGE="design_proposal"`
    - `VITE_PRIMARY_SERVICES="residential design,commercial design,3D modeling"`

By combining these variables, you can create a unique and highly-branded experience for any type of business. Refer to the [Environment Variable Reference Guide](../docs/environment-variables.md) for a full list of available options.
