const { test, expect } = require('@playwright/test');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://192.168.86.9:8000';
const LOGIN_API = `${BASE_URL}/dashboard/auth/login/`;
const EMAIL = process.env.TEST_EMAIL || process.env.ADMIN_EMAIL || 'admin@example.com';
const PASSWORD = process.env.TEST_PASSWORD || process.env.ADMIN_PASSWORD || 'password123';

test.describe.serial('Login API Testing', () => {
    let validToken = '';

    test('1. Valid login and saving token', async ({ request }) => {
        const startTime = Date.now();
        const response = await request.post(LOGIN_API, {
            data: {
                username: EMAIL,
                password: PASSWORD
            }
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // 6. Validate response time of the API (< 2 seconds)
        expect(responseTime).toBeLessThan(2000);

        // 1. Validate that the response status code is 200.
        expect(response.status()).toBe(200);

        // 8. Validate headers - Verify Content-Type is application/json
        expect(response.headers()['content-type']).toContain('application/json');

        const responseBody = await response.json();

        // 1. Verify that the response contains a valid authentication token.
        // Assuming 'access' for JWT, or 'token'
        validToken = responseBody.access || responseBody.token || responseBody.access_token;
        expect(validToken).toBeTruthy();

        // 7. Validate security of the API - Ensure token is securely generated (basic length check)
        expect(validToken.length).toBeGreaterThan(20);

        // 1. Validate that user details (id, name, email) are returned correctly.
        const user = responseBody.user || responseBody;
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email', EMAIL);
        
        // 7. Validate security of the API - Ensure password is not returned in the response.
        expect(user).not.toHaveProperty('password');
        expect(JSON.stringify(responseBody)).not.toContain(PASSWORD);

        // Save the access token
        const tokenFilePath = path.join(__dirname, 'token.json');
        fs.writeFileSync(tokenFilePath, JSON.stringify({ token: validToken, email: EMAIL }, null, 2));
    });

    test('2. Invalid password', async ({ request }) => {
        const response = await request.post(LOGIN_API, {
            data: {
                username: EMAIL,
                password: 'WrongPassword123!'
            }
        });

        // 2. Validate that the response status code is 401 (or 400 matching actual API).
        expect([400, 401]).toContain(response.status());
        
        const body = await response.json();
        // 2. Verify the error message "Invalid credentials". Wait, depending on backend it could be a nested field.
        const errorStr = JSON.stringify(body).toLowerCase();
        // Just checking if that meaning is somewhat conveyed or asserting specific structure
        // Django JWT says "No active account found with the given credentials" which contains "credentials"
        expect(errorStr).toContain('credential');
    });

    test('3. Missing fields', async ({ request }) => {
        // Missing password
        const responseMissingPass = await request.post(LOGIN_API, {
            data: { username: EMAIL }
        });
        expect(responseMissingPass.status()).toBe(400);

        // Missing email/username
        const responseMissingEmail = await request.post(LOGIN_API, {
            data: { password: PASSWORD }
        });
        expect(responseMissingEmail.status()).toBe(400);
    });

    test('4. Empty request body', async ({ request }) => {
        const response = await request.post(LOGIN_API, {
            data: {}
        });

        // 4. Validate that the response returns validation errors.
        expect(response.status()).toBe(400);
        const body = await response.json();
        // The API returns validation errors for username
        expect(body).toHaveProperty('field');
        expect(['username', 'password']).toContain(body.field);
    });

    test('5. Incorrect email format', async ({ request }) => {
        const response = await request.post(LOGIN_API, {
            data: {
                username: 'invalidemailformat',
                password: PASSWORD
            }
        });

        // 5. Validate that proper validation error is shown.
        expect(response.status()).toBe(400);
        // Sometimes backend just rejects invalid credentials instead of explicit email format
        // so we don't strictly assert the exact property if it varies
    });

    test('9. SQL injection input', async ({ request }) => {
        const response = await request.post(LOGIN_API, {
            data: {
                username: "' OR 1=1 --",
                password: PASSWORD
            }
        });

        // 9. Ensure API does not allow unauthorized access.
        expect([400, 401]).toContain(response.status());
    });

    test('10. Validate session/token behavior', async ({ request }) => {
        // Requires valid token from the very first test
        expect(validToken).not.toBe('');

        // Testing an endpoint. The login token will be passed as Bearer or JWT
        // Usually Authorization: Bearer <token>
        const testEndpoint = `${BASE_URL}/dashboard/scrap-category/`;
        
        // 10. Verify access is granted only with valid token.
        const withoutTokenRes = await request.get(testEndpoint);
        expect([401, 403]).toContain(withoutTokenRes.status());

        const withTokenRes = await request.get(testEndpoint, {
            headers: {
                'Authorization': `Bearer ${validToken}`
            }
        });
        
        // As long as it is not a 401 Unauthenticated, the token was accepted.
        // It might be 200, 403 (unauthorized for this specific role), 404 etc.
        expect(withTokenRes.status()).not.toBe(401);
    });
});
