let PROD_URL
const API_URL = PROD_URL || 'http://localhost:3000/users/login/'

async function logIn(user, pass) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: user, password: pass })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.msg || 'Login failed')
        }

        const responseData = await response.json()
        localStorage.setItem('jwt', responseData.jwt)
        console.log(responseData) //DEV
        return responseData.jwt

    } catch (error) {
        console.log('Error:', error.message)
        const errorMsg = document.getElementById('error-msg')
        errorMsg.innerHTML = error.message
        return false
    }
}

document.getElementById('login-btn').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value.trim()
    const passInput = document.getElementById('pass-input').value.trim()
    const errorMsg = document.getElementById('error-msg')

    if (!userInput || !passInput) {
        errorMsg.innerHTML = 'Please fill in all fields'
        return
    }

    const jwtToken = await logIn(userInput, passInput)
    if (jwtToken) {
        errorMsg.innerHTML = 'User logged in successfully'
        setTimeout(() => {
            window.location.href = `chess.html?token=${jwtToken}`
        }, 2000)
    }
})