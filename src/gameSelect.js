//const API_URL = 'https://minechessbackend-hrbxbze7gbfdhxay.northeurope-01.azurewebsites.net/games/'
const API_URL = 'http://localhost:3000/games/'

const selectCont = document.querySelector("#gameSelect")
const newGame = document.querySelector("#newGame")
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
                gameDiv.textContent = `Game ID: ${game.id} - Moves: ${game.moves} moves`

                // Makes div clickable
                gameDiv.style.cursor = 'pointer';
                gameDiv.addEventListener('click', () => {
                    // Save the game ID in session storage
                    sessionStorage.setItem('gameId', game.id)
                    sessionStorage.setItem('moves', game.moves)

                    // Redirect to chess.html
                    window.location.href = 'chess.html'
                });

                // Append the div to the container
                selectCont.appendChild(gameDiv) // Assuming selectCont is your container element
            });
        }
    } catch (error) {
        console.error('Error displaying games:', error)
    }
}

displayGames();