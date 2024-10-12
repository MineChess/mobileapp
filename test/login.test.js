const fetchMock = require('jest-fetch-mock');
const fs = require('fs');
const path = require('path');

fetchMock.enableMocks();

describe('login.js', () => {
    let logIn;

    beforeAll(() => {
        // Mock the global fetch function
        global.fetch = fetchMock;

        // Mock the DOM elements
        document.body.innerHTML = `
            <div id="login-form">
                <h2>Login to Chess Game</h2>
                <div id="cont">
                    <input id="user-input" type="text" placeholder="Enter username" required>
                    <input id="pass-input" type="password" placeholder="Enter password" required>
                </div>
                <button id="login-btn">Login</button>
                <p class="error" id="error-msg"></p>
                <a href="register.html">No account? Register here!</a>
            </div>
        `;

        // Load the script
        const scriptContent = fs.readFileSync(path.resolve(__dirname, '../src/login.js'), 'utf8');
        const scriptEl = document.createElement('script');
        scriptEl.textContent = scriptContent;
        document.body.appendChild(scriptEl);

        // Get the logIn function from the script
        logIn = window.logIn;
    });

    beforeEach(() => {
        fetch.resetMocks();
    });

    test('logIn should log in a user successfully', async () => {
        fetch.mockResponseOnce(JSON.stringify({ msg: 'User logged in successfully', jwt: 'test-jwt' }), { status: 200 });

        const result = await logIn('testuser', 'testpass');

        expect(result).toBe('test-jwt');
        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'testuser', password: 'testpass' })
        }));
    });

    test('logIn should handle login failure', async () => {
        fetch.mockResponseOnce(JSON.stringify({ msg: 'Login failed' }), { status: 400 });

        const result = await logIn('testuser', 'testpass');

        expect(result).toBe(false);
        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'testuser', password: 'testpass' })
        }));
    });

    test('login button click should call logIn and handle success', async () => {
        fetch.mockResponseOnce(JSON.stringify({ msg: 'User logged in successfully', jwt: 'test-jwt' }), { status: 200 });

        document.getElementById('user-input').value = 'testuser';
        document.getElementById('pass-input').value = 'testpass';
        const loginBtn = document.getElementById('login-btn');
        const errorMsg = document.getElementById('error-msg');

        loginBtn.click();

        await new Promise(resolve => setTimeout(resolve, 0)); // Wait for the event loop to process

        expect(errorMsg.innerHTML).toBe('User logged in successfully');
    });

    test('login button click should handle empty fields', async () => {
        document.getElementById('user-input').value = '';
        document.getElementById('pass-input').value = '';
        const loginBtn = document.getElementById('login-btn');
        const errorMsg = document.getElementById('error-msg');

        loginBtn.click();

        expect(errorMsg.innerHTML).toBe('Please fill in all fields');
    });
});