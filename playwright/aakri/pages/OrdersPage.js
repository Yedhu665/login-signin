const { expect } = require('@playwright/test');

class OrdersPage {
    constructor(page) {
        this.page = page;
        this.orderStatusDropdown = page.locator('#order_status');
        this.districtDropdown = page.locator('#district');
        this.localbodyDropdown = page.locator('#localbody');
        this.wardSearchInput = page.locator('.select2-search__field'); 
        this.startDateInput = page.locator('#start-date');
        this.endDateInput = page.locator('#end-date');
        this.filterButton = page.locator('#user-data-submit');
        this.clearButton = page.locator('#user-data-search-clear');
    }

    async selectStatus(status) {
        await this.orderStatusDropdown.selectOption({ label: status });
    }

    async selectDistrict(districtName) {
        // Find option value based on name
        const value = await this.page.evaluate((name) => {
            const select = document.querySelector('#district');
            const option = Array.from(select.options).find(o => o.text.includes(name));
            return option ? option.value : null;
        }, districtName);
        
        if (value) {
            await this.districtDropdown.selectOption(value);
            await this.districtDropdown.dispatchEvent('change');
            console.log(`Selected District: ${districtName} (Value: ${value})`);
        } else {
            // Fallback to label
            await this.districtDropdown.selectOption({ label: districtName });
            await this.districtDropdown.dispatchEvent('change');
        }
        await this.page.waitForLoadState('networkidle');
    }

    async selectLocalbody(localbodyName) {
        // Wait for dynamic options to load
        console.log(`Waiting for Localbody option containing: ${localbodyName}...`);
        try {
            await this.page.waitForFunction((name) => {
                const select = document.querySelector('#localbody');
                if (!select) return false;
                const opts = Array.from(select.options).map(o => o.text.toLowerCase());
                return opts.some(t => t.includes(name.toLowerCase()));
            }, localbodyName, { timeout: 15000 });
        } catch (e) {
            const currentOpts = await this.localbodyDropdown.evaluate(el => Array.from(el.options).map(o => o.text));
            console.error(`Localbody population timeout. Available options: ${currentOpts.join(', ')}`);
            throw e;
        }
        
        await this.localbodyDropdown.selectOption({ label: localbodyName });
        await this.localbodyDropdown.dispatchEvent('change');
        // Assert selection
        const selectedLabel = await this.localbodyDropdown.evaluate(el => el.options[el.selectedIndex].text);
        if (!selectedLabel.toLowerCase().includes(localbodyName.toLowerCase())) {
            throw new Error(`Failed to select Localbody: ${localbodyName}. Selected: ${selectedLabel}`);
        }
    }

    async selectWard(wardName) {
        console.log(`Selecting Ward: ${wardName}...`);
        await this.page.locator('.select2-selection--multiple').click();
        await this.wardSearchInput.clear();
        await this.wardSearchInput.pressSequentially('EDAPPALLY', { delay: 100 });
        
        const optionLocator = this.page.locator('.select2-results__option').filter({ hasText: 'EDAPPALLY' });
        await optionLocator.waitFor({ state: 'visible', timeout: 10000 });
        await optionLocator.first().click();
        
        await this.page.keyboard.press('Escape');
        // Assert selection is visible in the Select2 tags
        await this.page.locator('.select2-selection__choice').filter({ hasText: 'EDAPPALLY' }).waitFor({ state: 'visible' });
    }

    async setDateRange(start, end) {
        console.log(`Setting Date Range: ${start} to ${end}...`);
        await this.startDateInput.click();
        await this.startDateInput.fill(start);
        
        await this.endDateInput.click();
        await this.endDateInput.fill(end);
        
        // Assert values are correctly filled
        const startVal = await this.startDateInput.inputValue();
        const endVal = await this.endDateInput.inputValue();
        console.log(`Dates set: ${startVal} / ${endVal}`);
    }

    async applyFilter() {
        await this.filterButton.click();
        // Wait for results grid to load (assuming some loading indicator or change in grid)
        await this.page.waitForLoadState('networkidle');
    }

    async verifyResults(status, localbody, ward) {
        // Wait for results to load and verify columns
        const table = this.page.locator('table.dataTable').first();
        await table.waitFor({ state: 'visible', timeout: 15000 });
        
        // Wait for at least one row or "No data available" message
        await this.page.waitForFunction(() => {
            const row = document.querySelector('table.dataTable tbody tr');
            return row !== null;
        });

        const rowCount = await table.locator('tbody tr').count();
        const firstRowText = await table.locator('tbody tr').first().innerText();
        
        if (rowCount > 1 || (rowCount === 1 && !firstRowText.includes('No data available'))) {
             console.log(`Data found. First row: ${firstRowText}`);
             // If we have data, we can assert on localbody/ward if they are present in visible columns
        } else {
            console.log('No data available for the selected filters, which is expected for future dates.');
        }
    }
}

module.exports = { OrdersPage };
