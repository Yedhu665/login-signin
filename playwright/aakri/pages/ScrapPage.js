const { expect } = require('@playwright/test');

class ScrapPage {
    constructor(page) {
        this.page = page;

        // Main Form — using stable ID-based locators
        this.phoneInput          = page.locator('#cust_phone_no');
        this.customerNameInput   = page.locator('#cust_name');
        this.addressDropdown     = page.locator('#cust_address');
        this.newAddressButton    = page.locator('button.btn-primary.float-end.mt-3');
        this.scheduleDateInput   = page.locator('#order_date');

        // New Address inline section
        this.districtDropdown    = page.locator('#district');
        this.regionDropdown      = page.locator('#scrap_region');
        this.addressTextarea     = page.locator('#full_address');
        this.landmarkInput       = page.locator('#landmark');
        this.addressTypeHome     = page.locator('input[name="address_type"][value="Home"]');

        // Scrap Type (Select2 multi-select)
        this.scrapTypeContainer  = page.locator('.select2-container').first();
        this.scrapTypeSearch     = page.locator('.select2-search__field[placeholder="Select Pickup Type"]');

        // Form actions
        this.submitButton        = page.locator('button#submit-btn, button[type="submit"]').first();
    }

    /**
     * Navigate directly to the Add Scrap Order page.
     * Avoids sidebar click issues (submenus hidden via display:none).
     */
    async navigate() {
        await this.page.goto('https://aakri.in/scrap-order/');
        // Click "Add Order" button (dt-button)
        await this.page.locator('button.dt-button.btn-primary').click();
        await this.page.waitForURL('**/add-scrap-order/**');
    }

    /**
     * Enter phone number and press Tab to trigger auto-population.
     */
    async enterPhoneNumber(phone) {
        await this.phoneInput.fill(phone);
        await this.page.keyboard.press('Tab');
        // Brief wait for AJAX auto-fill to complete
        await this.page.waitForTimeout(1500);
    }

    /**
     * Verify the customer name field has been auto-populated.
     */
    async verifyCustomerName(expectedName) {
        await expect(this.customerNameInput).toHaveValue(expectedName, { timeout: 10000 });
    }

    /**
     * Manually type the customer name.
     */
    async enterCustomerName(name) {
        await this.customerNameInput.fill(name);
    }

    /**
     * Select today's date using the flatpickr calendar.
     */
    async selectToday() {
        await this.scheduleDateInput.click();
        await this.page.locator('.flatpickr-calendar.open .flatpickr-day.today').click();
        // Close the calendar
        await this.page.keyboard.press('Escape');
    }

    /**
     * Click "New Address" to reveal the inline address form.
     */
    async openNewAddressModal() {
        await this.newAddressButton.click();
        // Wait for the address row to become visible
        await expect(this.districtDropdown).toBeVisible({ timeout: 5000 });
    }

    /**
     * Fill in address details in the inline form.
     */
    async fillAddressDetails(details) {
        if (details.district) {
            await this.districtDropdown.selectOption({ label: details.district });
            // Wait for region/scrap_region to load
            await this.page.waitForResponse(
                resp => resp.url().includes('region') || resp.url().includes('scrap_region'),
                { timeout: 5000 }
            ).catch(() => this.page.waitForTimeout(1500));
        }
        if (details.region) {
            await this.regionDropdown.selectOption({ label: details.region });
        }
        if (details.address) {
            await this.addressTextarea.fill(details.address);
        }
        if (details.landmark) {
            await this.landmarkInput.fill(details.landmark);
        }
        if (details.type === 'Home') {
            await this.addressTypeHome.check();
        }
    }

    /**
     * Select an existing address from the dropdown.
     */
    async selectExistingAddress(partialText) {
        const options = await this.addressDropdown.locator('option').allTextContents();
        const match = options.find(o => o.includes(partialText));
        if (match) {
            await this.addressDropdown.selectOption({ label: match });
        } else {
            // Fall back to first non-placeholder option
            await this.addressDropdown.selectOption({ index: 1 });
        }
    }

    /**
     * Select a pickup/scrap type via Select2 search.
     */
    async selectPickupItem(item) {
        // Open the Select2 dropdown
        await this.scrapTypeContainer.click();
        await this.page.waitForSelector('.select2-results__option', { timeout: 5000 }).catch(() => {});
        // Type to search
        await this.scrapTypeSearch.fill(item);
        await this.page.waitForTimeout(800);
        // Click the first matching result
        const result = this.page.locator('.select2-results__option', { hasText: item }).first();
        await result.click({ timeout: 5000 });
    }

    /**
     * Submit the form.
     */
    async submit() {
        // The submit button text is "Submit"
        await this.page.locator('button.btn-success', { hasText: 'Submit' }).click();
    }
}

module.exports = { ScrapPage };
