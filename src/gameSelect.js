const API_URL = 'https://minechessbackend-hrbxbze7gbfdhxay.northeurope-01.azurewebsites.net/games/'
const USERS_API_URL = 'https://minechessbackend-hrbxbze7gbfdhxay.northeurope-01.azurewebsites.net/users/'
//const API_URL = 'http://localhost:3000/games/'
//const USERS_API_URL = 'http://localhost:3000/users/'
//
const selectCont = document.querySelector("#gameSelect")
const newGame = document.querySelector("#newGame")
const userDropdown = document.querySelector("#userDropdown")
const jwt = localStorage.getItem('jwt')

if (!localStorage.getItem('jwt')) {
    window.location.href = 'index.html';
  }

async function fetchGames(){
    try {
        const response = await fetch(`${API_URL}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            }
        })

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const games = await response.json();
        console.log('Games for user:', games);
        return games

    } catch (error) {
        console.error('Error fetching games:', error);
    }
}

async function fetchUsers() {
    try {
        const response = await fetch(`${USERS_API_URL}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            }
        });

        if (!response.ok) {
            throw new Error('Error fetching users');
        }

        const users = await response.json();
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

document.querySelector('#delBtn').addEventListener('click', async () => {
    const username = sessionStorage.getItem('username');

    // Show a confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to delete this user?');

    if (!isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`${USERS_API_URL}/${username}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            }
        });

        if (!response.ok) {
            throw new Error('End all games before deleting user');
        }

        console.log('User deleted successfully.');
        window.location.href = 'index.html';

    } catch (error) {
        console.log('Error deleting User:', error);
        document.querySelector("#error-msg").innerText = error
    }
});

document.querySelector('#logOut').addEventListener('click', () => {
    localStorage.removeItem('jwt')
    sessionStorage.removeItem('username')
    window.location.href = 'index.html'
})

// Display the list of users in the dropdown
async function displayUsersInDropdown() {
    const users = await fetchUsers();
    if (users && users.length > 0) {
        userDropdown.style.display = 'block'; // Show the dropdown
        userDropdown.innerHTML = '<option value="">Select an opponent</option>'; // Default option
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            userDropdown.appendChild(option);
        });

        // Add event listener to the dropdown to handle game creation
        userDropdown.addEventListener('change', async function() {
            const selectedUserId = userDropdown.value;
            if (selectedUserId) {
                await createNewGame(selectedUserId);
            }
        });
    }
}

function decodeJWT(token) { //CO-pilot generated
    // Split the JWT into its parts
    const base64Url = token.split('.')[1]; // Extract the payload (second part of JWT)
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Fix URL-safe characters
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload); // Parse and return payload as an object
}

async function createNewGame(opponentId) {
    try {        
        if (!jwt) {
            throw new Error('User not authenticated');
        }

        const decodedToken = decodeJWT(jwt); // Decode the JWT to get user info
        const player1Id = decodedToken.sub;  

        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                player1Id: player1Id,  // Use the userId extracted from the JWT
                player2Id: opponentId,
                moves: '' // New game starts with no moves
            })
        });

        if (!response.ok) {
            throw new Error('Error creating new game');
        }

        const game = await response.json();
        console.log('Game created:', game);
        sessionStorage.setItem('moves', '')
        sessionStorage.setItem('gameId', game.game.id)
        window.location.href = 'chess.html'; // Redirect to the chess game page
    } catch (error) {
        console.error('Error creating game:', error);
    }
}

newGame.addEventListener('click', () => {
    displayUsersInDropdown(); // Display the dropdown
});

async function deleteGame(gameId) {
    try {
        const response = await fetch(`${API_URL}/${gameId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            }
        });

        if (!response.ok) {
            throw new Error('Error deleting game');
        }

        // Optionally, handle the response if needed
        console.log('Game deleted successfully.');

    } catch (error) {
        console.log('Error deleting game:', error);
    }
}

async function displayGames() { //GPT genererat hälften
    try {
        const games = await fetchGames(); // Await the promise returned by fetchGames
        
        if (games) {
            games.games.forEach(game => {
                // Handle each game; for example, logging or displaying
                console.log(`Game ID: ${game.id}, Moves: ${game.moves}`)
                
                // Create a new div for each game and append to a container
                const gameDiv = document.createElement('div')
                gameDiv.setAttribute('data-game-id', game.id)
                gameDiv.setAttribute('data-game-moves', game.moves)
                gameDiv.textContent = `Game ID: ${game.id}`
                gameDiv.style.margin = '5px'

                // Makes div clickable
                gameDiv.style.cursor = 'pointer';
                gameDiv.addEventListener('click', () => {
                    // Save the game ID in session storage
                    sessionStorage.setItem('gameId', game.id)
                    sessionStorage.setItem('moves', game.moves)

                    // Redirect to chess.html
                    window.location.href = 'chess.html'
                });

                // Create a delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'End';
                deleteButton.style.marginLeft = '10px';
                
                // Add event listener to delete the gameDiv
                deleteButton.addEventListener('click', async (event) => {
                    event.stopPropagation(); 
                    await deleteGame(game.id)
                    gameDiv.remove(); 
                });

                 // Append the delete button to the game div
                 gameDiv.appendChild(deleteButton);

                // Append the div to the container
                selectCont.appendChild(gameDiv) // Assuming selectCont is your container element
            });
        }
    } catch (error) {
        console.error('Error displaying games:', error)
    }
}

displayGames();