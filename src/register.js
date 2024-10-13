let PROD_URL
const API_URL = 'https://minechessbackend-hrbxbze7gbfdhxay.northeurope-01.azurewebsites.net/users/'
//const API_URL = 'http://localhost:5000/users/'

async function registerUser(user, pass) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: user, password: pass })
        })

        const responseData = await response.json()

        if (!response.ok) {
            throw new Error(responseData.msg || 'Registration failed')
        }

        console.log(responseData) //Dev
        return true

    } catch (error) {
        console.log('Error:', error.message)
        const errorMsg = document.getElementById('error-msg')
        errorMsg.innerHTML = error.message
        return false
    }
}

document.getElementById('register-btn').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value.trim()
    const passInput = document.getElementById('pass-input').value.trim()
    const errorMsg = document.getElementById('error-msg')

    if (!userInput || !passInput) {
        errorMsg.innerHTML = 'Please fill in all fields'
        return
    }

    if (await registerUser(userInput, passInput)) {
        errorMsg.innerHTML = 'User registered successfully'
        setTimeout(() => {
            window.location.href = `index.html`
        }, 2000)
    }
})