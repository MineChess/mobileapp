const fetchMock = require('jest-fetch-mock');
const fs = require('fs');
const path = require('path');

fetchMock.enableMocks();

describe('register.js', () => {
    let registerUser;

    beforeAll(() => {
        // Mock the global fetch function
        global.fetch = fetchMock;

        // Mock the DOM elements
        document.body.innerHTML = `
            <input id="user-input" />
            <input id="pass-input" />
            <button id="register-btn"></button>
            <div id="error-msg"></div>
        `;

        // Load the script
        const scriptContent = fs.readFileSync(path.resolve(__dirname, '../src/register.js'), 'utf8');
        const scriptEl = document.createElement('script');
        scriptEl.textContent = scriptContent;
        document.body.appendChild(scriptEl);

        // Get the registerUser function from the script
        registerUser = window.registerUser;
    });

    beforeEach(() => {
        fetch.resetMocks();
    });

    test('registerUser should register a user successfully', async () => {
        fetch.mockResponseOnce(JSON.stringify({ msg: 'User registered successfully' }), { status: 200 });

        const result = await registerUser('testuser', 'testpass');

        expect(result).toBe(true);
        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'testuser', password: 'testpass' })
        }));
    });

    test('registerUser should handle registration failure', async () => {
        fetch.mockResponseOnce(JSON.stringify({ msg: 'Registration failed' }), { status: 400 });

        const result = await registerUser('testuser', 'testpass');

        expect(result).toBe(false);
        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'testuser', password: 'testpass' })
        }));
    });

    test('register button click should call registerUser and handle success', async () => {
        fetch.mockResponseOnce(JSON.stringify({ msg: 'User registered successfully' }), { status: 200 });

        document.getElementById('user-input').value = 'testuser';
        document.getElementById('pass-input').value = 'testpass';
        const registerBtn = document.getElementById('register-btn');
        const errorMsg = document.getElementById('error-msg');

        registerBtn.click();

        await new Promise(resolve => setTimeout(resolve, 0)); // Wait for the event loop to process

        expect(errorMsg.innerHTML).toBe('User registered successfully');
    });

    test('register button click should handle empty fields', async () => {
        document.getElementById('user-input').value = '';
        document.getElementById('pass-input').value = '';
        const registerBtn = document.getElementById('register-btn');
        const errorMsg = document.getElementById('error-msg');

        registerBtn.click();

        expect(errorMsg.innerHTML).toBe('Please fill in all fields');
    });
});