# Easy Setup and Deployment Guide

This guide provides a step-by-step process to deploy and customize your own instance of the AI Pricing Tool.

## 1. One-Click Deployment

You can deploy this application to Netlify or Vercel with a single click.

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-repo/your-repo)

_Note: You will need to replace `https://github.com/your-repo/your-repo` with the URL of your own repository after you have forked or cloned it._

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/your-repo)

_Note: You will need to replace `https://github.com/your-repo/your-repo` with the URL of your own repository after you have forked or cloned it._

## 2. Environment Variable Configuration

After deploying, you need to configure the environment variables in your Netlify or Vercel project settings.

Go to your project's **Settings > Environment Variables** and add the following variables:

| Variable Name             | Description                                                                 | Example Value                               |
| ------------------------- | --------------------------------------------------------------------------- | ------------------------------------------- |
| `VITE_SUPABASE_URL`       | Your Supabase project URL.                                                  | `https://xyz.supabase.co`                   |
| `VITE_SUPABASE_ANON_KEY`  | Your Supabase project's anonymous key.                                      | `ey...`                                     |
| `VITE_COMPANY_NAME`       | Your company's name. This appears in the app title and header.              | `My Awesome Company`                        |
| `VITE_PRIMARY_COLOR`      | The primary brand color for your application (in hex format).               | `#ff69b4`                                   |
| `VITE_LOGO_URL`           | A URL to your company's logo.                                               | `/assets/branding/my-logo.svg`              |
| `VITE_WELCOME_MESSAGE`    | The initial message the AI assistant shows to the user.                     | `Welcome! How can I help you today?`        |
| `VITE_INDUSTRY`           | The industry your business operates in. (Future use)                        | `construction`                              |
| `VITE_MAKE_WEBHOOK_URL`   | The webhook URL for the Make.com scenario that powers the AI assistant.     | `https://hook.us1.make.com/...`             |
| `VITE_NETLIFY_API_URL`    | (Optional) The URL to your Netlify functions if they are on a different domain. | `https://my-app.netlify.app/.netlify/functions` |

## 3. Custom Branding Setup

You can customize the look and feel of the application using environment variables.

### Changing the Company Name, Logo, and Welcome Message

Set the `VITE_COMPANY_NAME`, `VITE_LOGO_URL`, and `VITE_WELCOME_MESSAGE` environment variables as described above. For the logo, you can either use a URL to an existing image, or you can add your own logo file to the `public/assets/branding/` directory and set the `VITE_LOGO_URL` to point to it (e.g., `/assets/branding/my-logo.svg`).

### Changing the Primary Color

Set the `VITE_PRIMARY_COLOR` environment variable to your desired brand color in hex format (e.g., `#ff69b4`). This will change the color of buttons, links, and other brand elements.

## 4. Make.com Webhook Configuration

The AI assistant is powered by a Make.com scenario. You need to set up your own scenario and get a webhook URL.

1.  **Create a new scenario in Make.com.**
2.  **Add a "Custom webhook" trigger.**
3.  **Copy the webhook URL** provided by Make.com.
4.  **Paste this URL** into the `VITE_MAKE_WEBHOOK_URL` environment variable in your Netlify or Vercel project settings.
5.  **Design your scenario** to receive a `message` and `sessionId` and to send back a response. The application will poll for new messages from the Netlify function `chat-messages`. You will need to implement logic in your scenario to store the AI's response in a database (like Supabase) so that the polling function can retrieve it.

---

This guide should help you get your customized AI Pricing Tool up and running. If you have any questions, please refer to the project's `README.md` file.
