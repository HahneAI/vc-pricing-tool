# Client Demo Setup Guide

This guide provides step-by-step instructions for setting up and deploying your own customized AI-powered pricing tool. Whether you need a quick demo or a fully configured industry-specific portal, these instructions will help you get started.

## Table of Contents

- [Quick Demo Setup (5 Minutes)](#quick-demo-setup-5-minutes)
- [Complete Landscaping Demo ("Quiet Village" Example)](#complete-landscaping-demo-quiet-village-example)
- [Complete HVAC Company Demo](#complete-hvac-company-demo)
- [Custom Industry Setup](#custom-industry-setup)
- [Netlify/Vercel Deployment](#netlifyvercel-deployment)

---

## Quick Demo Setup (5 Minutes)

This setup uses the five most essential environment variables to get a branded demo running in minutes. This is perfect for a quick proof-of-concept.

1.  **Fork/Clone the Repository**: Start by getting a copy of the project code.
2.  **Deploy to Netlify or Vercel**: Use the one-click deploy buttons in the main [README.md](../README.md) or follow the [deployment guide](#netlifyvercel-deployment) below.
3.  **Set the Following Environment Variables** in your Netlify/Vercel project settings:

    | Variable Name            | Example Value                                  | Purpose                               |
    | ------------------------ | ---------------------------------------------- | ------------------------------------- |
    | `VITE_COMPANY_NAME`      | `"My Awesome Company"`                           | Sets your company name.               |
    | `VITE_PRIMARY_COLOR`     | `"#3b82f6"`                                     | Sets your primary brand color.        |
    | `VITE_LOGO_URL`          | `"/assets/branding/default-logo.svg"`            | Use the default logo to start.        |
    | `VITE_SUPABASE_URL`      | `Your Supabase Project URL`                      | Connects to your Supabase backend.    |
    | `VITE_SUPABASE_ANON_KEY` | `Your Supabase Anonymous Key`                    | Authenticates with your Supabase backend. |

4.  **Done!** Your branded demo is now live.

---

## Complete Landscaping Demo ("Quiet Village" Example)

This configuration creates a complete demo for a fictional landscaping company, "Quiet Village Landscaping," showcasing a wide range of customization features.

1.  **Deploy the Application**: Follow the [deployment guide](#netlifyvercel-deployment) below.
2.  **Set the Following Environment Variables**:

    ```env
    # --- Core Branding ---
    VITE_COMPANY_NAME="Quiet Village Landscaping"
    VITE_LOGO_URL="/assets/branding/quiet-village-logo.svg" # Replace with your logo
    VITE_PRIMARY_COLOR="#4a7c59"
    VITE_SECONDARY_COLOR="#d4e09b"
    VITE_ACCENT_COLOR="#f6f7eb"
    VITE_SUCCESS_COLOR="#73a942"
    VITE_WELCOME_MESSAGE="Welcome to Quiet Village Landscaping. How can we create your perfect outdoor space?"

    # --- Industry & Theming ---
    VITE_INDUSTRY_TYPE="landscaping"
    VITE_USE_SEASONAL_THEMES="true"
    VITE_REGION="northeast"
    VITE_CLIMATE_ZONE="6b"

    # --- Visuals ---
    VITE_HEADER_ICON="TreePine"
    VITE_SEND_EFFECT="leaf_flutter"
    VITE_LOADING_ANIMATION="growth"
    VITE_MESSAGE_STYLE="organic"
    VITE_BACKGROUND_PATTERN="subtle_organic"

    # --- Terminology ---
    VITE_BUSINESS_TYPE="boutique_landscaping_firm"
    VITE_PROJECT_LANGUAGE="garden_oasis"
    VITE_ESTIMATE_LANGUAGE="design_investment"
    VITE_PRIMARY_SERVICES="garden design,hardscaping,water features,maintenance"
    VITE_PLACEHOLDER_EXAMPLES="e.g., 'I'd like to add a stone pathway to my garden.'"
    VITE_SPECIALIZATION="full_service"
    VITE_URGENCY_LEVEL="seasonal"

    # --- Technical ---
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    VITE_MAKE_WEBHOOK_URL="YOUR_MAKE_WEBHOOK_URL"
    ```

---

## Complete HVAC Company Demo

This configuration creates a complete demo for an HVAC company, showcasing a more technical and professional theme.

1.  **Deploy the Application**: Follow the [deployment guide](#netlifyvercel-deployment) below.
2.  **Set the Following Environment Variables**:

    ```env
    # --- Core Branding ---
    VITE_COMPANY_NAME="Climate Control Experts"
    VITE_LOGO_URL="/assets/branding/hvac-logo.svg" # Replace with your logo
    VITE_PRIMARY_COLOR="#007bff"
    VITE_SECONDARY_COLOR="#f8f9fa"
    VITE_ACCENT_COLOR="#ffc107"
    VITE_SUCCESS_COLOR="#28a745"
    VITE_WELCOME_MESSAGE="Welcome to Climate Control Experts. How can we help you with your heating and cooling needs?"

    # --- Industry & Theming ---
    VITE_INDUSTRY_TYPE="hvac"
    VITE_USE_SEASONAL_THEMES="true"
    VITE_REGION="midwest"
    VITE_CLIMATE_ZONE="5a"

    # --- Visuals ---
    VITE_HEADER_ICON="Wrench"
    VITE_SEND_EFFECT="gear_spin"
    VITE_LOADING_ANIMATION="gears"
    VITE_MESSAGE_STYLE="geometric"
    VITE_BACKGROUND_PATTERN="technical_grid"

    # --- Terminology ---
    VITE_BUSINESS_TYPE="hvac_contractor"
    VITE_PROJECT_LANGUAGE="HVAC_system"
    VITE_ESTIMATE_LANGUAGE="service_quote"
    VITE_PRIMARY_SERVICES="AC repair,furnace installation,maintenance plans"
    VITE_PLACEHOLDER_EXAMPLES="e.g., 'My AC unit is making a strange noise.'"
    VITE_SPECIALIZATION="specialist"
    VITE_URGENCY_LEVEL="emergency"

    # --- Technical ---
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    VITE_MAKE_WEBHOOK_URL="YOUR_MAKE_WEBHOOK_URL"
    ```

---

## Custom Industry Setup

If your business doesn't fit the Landscaping or HVAC templates, you can create your own custom configuration.

1.  **Deploy the Application**: Follow the [deployment guide](#netlifyvercel-deployment) below.
2.  **Set Core Variables**: Start by setting the [Core Configuration Variables](../docs/environment-variables.md#core-configuration-variables).
3.  **Leave `VITE_INDUSTRY_TYPE` Empty**: This will activate the default "TradeSphere" tech theme, which is a great starting point.
    - `VITE_INDUSTRY_TYPE=""`
4.  **Customize Visuals and Terminology**: Go through the [Environment Variable Reference Guide](../docs/environment-variables.md) and set the variables that best match your brand and industry. Pay close attention to:
    - [Visual Customization Variables](../docs/environment-variables.md#visual-customization-variables)
    - [Business Terminology Variables](../docs/environment-variables.md#business-terminology-variables)
5.  **Connect Your Backend**: Don't forget to set up your Supabase and Make.com integration variables.

---

## Netlify/Vercel Deployment

Deploying your application is straightforward.

1.  **Fork the Repository**: Create your own copy of the project on GitHub.
2.  **Choose a Hosting Provider**:
    - **For Netlify**: Click the "Deploy to Netlify" button in the [README.md](../README.md) or go to `app.netlify.com/start`.
    - **For Vercel**: Click the "Deploy with Vercel" button in the [README.md](../README.md) or go to `vercel.com/new`.
3.  **Connect Your GitHub Repository**: Authorize your hosting provider to access your forked repository.
4.  **Configure Project Settings**:
    - **Build Command**: `npm run build` (or `vite build`)
    - **Output Directory**: `dist`
    - **Install Command**: `npm install`
5.  **Add Environment Variables**:
    - In your Netlify or Vercel project dashboard, go to **Settings > Environment Variables**.
    - Add the variables for the demo configuration you chose above.
    - **Important**: Ensure that you replace placeholder values (like `YOUR_SUPABASE_URL`) with your actual keys and URLs.
6.  **Deploy**: Trigger a new deployment. Your custom pricing tool is now live!
