# Aakri Analytics Dashboard - Test Suite

## 📁 Project Structure

```
tests/
├── pages/                              # Page Object Models
│   ├── LoginPage.js                   # Login page interactions
│   └── DashboardPage.js               # Dashboard interactions
├── helpers/                            # Utility functions
│   └── auth.js                        # Authentication helper
├── fixtures/                           # Test data
│   └── testData.js                    # Test data for data-driven tests
├── 01-authentication.spec.js          # Login/logout tests
├── 02-dashboard-navigation.spec.js    # Navigation tests
├── 03-customer-orders-filters.spec.js # Filter functionality tests
├── 04-data-driven-tests.spec.js       # Multiple filter combinations
└── 05-end-to-end.spec.js              # Complete workflow tests
```

## 🚀 Running Tests

### Run all tests
```bash
npm test
```

### Run specific test suites
```bash
npm run test:auth      # Authentication tests only
npm run test:filters   # Filter tests only
npm run test:e2e       # End-to-end tests only
```

### Run with UI mode (recommended for debugging)
```bash
npm run test:ui
```

### Run in headed mode (see browser)
```bash
npm run test:headed
```

### Debug mode
```bash
npm run test:debug
```

### View test report
```bash
npm run report
```

## 📊 Test Coverage

### ✅ Authentication Tests (01-authentication.spec.js)
- Valid login
- Invalid credentials
- Empty field validation

### ✅ Navigation Tests (02-dashboard-navigation.spec.js)
- Customer Orders accessibility
- Scrap tab functionality
- Filter visibility

### ✅ Filter Tests (03-customer-orders-filters.spec.js)
- Order status dropdown
- District selection
- Scrap region selection
- Date type selection
- Date range picker
- Complete filter workflow

### ✅ Data-Driven Tests (04-data-driven-tests.spec.js)
- Multiple filter combinations
- Various date ranges
- Cross-combination testing

### ✅ End-to-End Tests (05-end-to-end.spec.js)
- Complete user workflow
- Multiple filter changes
- Full dashboard interaction

## 🔧 Configuration

- **baseURL**: https://aakri.in
- **Browser**: Chromium, Firefox, WebKit
- **Headless**: false (shows browser)
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On retry

## 📝 Notes

- Tests use Page Object Model (POM) pattern for maintainability
- Credentials are in helpers/auth.js (move to .env for production)
- All tests include proper assertions and waits
- Data-driven tests cover multiple scenarios automatically
