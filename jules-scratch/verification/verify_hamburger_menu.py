import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.set_viewport_size({"width": 375, "height": 667})

        await page.goto("http://localhost:5173")

        # Click the hamburger menu button
        await page.get_by_label("Open menu").click()

        # Wait for the menu to be visible
        await expect(page.locator("nav")).to_be_visible()

        # Take a screenshot
        await page.screenshot(path="jules-scratch/verification/verification.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
