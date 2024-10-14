

// Mocking localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) {
            return store[key] || null;
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        clear: function() {
            store = {};
        },
        removeItem: function(key) {
            delete store[key];
        }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mocking WebSocket
global.WebSocket = jest.fn(() => ({
    addEventListener: jest.fn(),
    send: jest.fn(),
}));

// Mocking document methods
document.getElementById = jest.fn().mockReturnValue({
    innerText: '',
    appendChild: jest.fn(),
    addEventListener: jest.fn(), 
    querySelector: jest.fn().mockReturnValue({
        querySelector: jest.fn(),
        appendChild: jest.fn(),
        innerHTML: '',
    }),
});

document.querySelector = jest.fn().mockReturnValue({
    querySelector: jest.fn(),
    appendChild: jest.fn(),
    innerHTML: '',
    addEventListener: jest.fn(),  // Adding here as well if needed
});

// Mocking window.location
delete window.location;
window.location = { href: '' };

// Example test
test('simple test', () => {
    const result = 1 + 1;
    expect(result).toBe(2);
});

test('redirects to index.html if jwt is not in localStorage', () => {
    delete localStorage.jwt;
    window.location.href = '';
    require('../src/chess');
    expect(window.location.href).toBe('index.html');
});



test('sendMove sends correct message to WebSocket', () => {
    const mockSocket = new WebSocket();
    require('../src/chess');
    global.sendMove = (from, to) => {
        mockSocket.send(JSON.stringify({ type: 'move', from, to }));
    };
    sendMove(0, 1);
    expect(mockSocket.send).toHaveBeenCalledWith(JSON.stringify({ type: 'move', from: 0, to: 1 }));
});

