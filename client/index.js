const card = post => {
    return `
                <div class="card z-depth-4">
                    <div class="card-content" style="position: relative;">
                        <span class="card-title">${post.title}</span>
                        <p style="white-space: pre-line ">${post.text}</p><br>
                        <p style="white-space: pre-line">Author: ${post.author}</p><br>
                            <small class="right">${new Date(post.date).getHours()}:${new Date(post.date).getMinutes()}:${new Date(post.date).getSeconds()}</small> <br>
                            <small class="right">${new Date(post.date).toLocaleDateString()}</small> 
                    </div>
                    <div class="card-action">
                        <button class="btn btn-small red js-remove" data-id="${post._id}", data-author ="${post.author}" >
                            <i class="material-icons">delete</i>
                        </button>
                    </div>
                </div>`
}


let posts = []
let users = []

let User

let modal
let modalAuth
let authToken = ''
const USERS_URL = '/api/auth/users'
const BASE_URL = '/api/post'
const REG_URL = '/api/auth/registration'
const AUTH_URL = '/api/auth/login'
const openPopUpLogIn = document.getElementById('login');
const closePopUpLogIn = document.getElementById('pop_up_LogIn_close');
const popUpLogIn = document.getElementById('pop_up_LogIn');
const openPopUpRegister = document.getElementById('register');
const closePopUpRegister = document.getElementById('pop_up_Register_close');
const popUpRegister = document.getElementById('pop_up_Register');
const openPopUpForm = document.getElementById('btn_add_post');
const closePopUpForm2 = document.getElementById('pop_up_Form_close');
const popUpForm = document.getElementById('postForm');

class PostApi {
    static fetch() {
        return fetch(BASE_URL, {method: 'get'}).then(res => res.json())
    }

    static create(post) {
        return fetch(BASE_URL, {
            method: 'post',
            body: JSON.stringify(post),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
    }
    static remove(id) {
        return fetch(`${BASE_URL}/${id}`, {
            method: 'delete'
        }).then(res => res.json())
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const storedToken = sessionStorage.getItem('authToken');

    if (storedToken) {
        // Use the stored token for authentication
        authToken = storedToken;

        // Fetch user data using the stored token
        const userResponse = await UsersApi.fetch(authToken);
        const userJson = await userResponse.json();

        // Check if user data is retrieved successfully
        if (userResponse.status === 200) {
            User = {
                username: userJson.username,
                // Add other user properties if needed
            };

            // Show welcome message and update UI as needed
            showWelcomeMessage(User.username);
        } else {
            // Clear the stored token if user data retrieval fails
            sessionStorage.removeItem('authToken');
            console.error('Error retrieving user data:', userJson.message);
        }
    }
    PostApi.fetch().then(backendPosts => {
        posts = backendPosts.concat()
        setTimeout(() => {
            renderPosts(posts);
        }, 1000)
    })
    modal = M.Modal.init(document.querySelector('#postForm'))
    modalAuth = M.Modal.init(document.querySelector('.modalAuth'))
    document.querySelector('#createPost').addEventListener('click', onCreatePost)
    document.querySelector('#posts').addEventListener('click', onDeletePost)
    document.querySelector('#btn_submit_reg').addEventListener('click', registration)
    document.querySelector('#btn_submit_log').addEventListener('click', auth)
})

openPopUpLogIn.addEventListener('click', () => {
    popUpLogIn.classList.add('active');
})

closePopUpLogIn.addEventListener('click', () => {
    popUpLogIn.classList.remove('active');
})

openPopUpRegister.addEventListener('click', () => {
    popUpRegister.classList.add('active');
})
closePopUpRegister.addEventListener('click', () => {
    popUpRegister.classList.remove('active');
})
document.querySelector('#btn_submit_log').addEventListener('click', () => {
    popUpLogIn.classList.remove('active');
})
document.querySelector('#btn_submit_reg').addEventListener('click', () => {
    popUpRegister.classList.remove('active');
})

// Добавьте слушатель для кнопки "Роли"
const rolesButton = document.getElementById('roles');
console.log(rolesButton)
rolesButton.addEventListener('click', () => {
    let role;
    fetch('/users')
        .then(userListResponse => userListResponse.json()) // Обработка Promise и парсинг JSON
        .then(userList => {
            // user list доступен здесь
            // userList.find((user) => {user.username === User.username})
            for (const user of userList) {
                if (user.username === User.username) {
                    role = user.roles[0];
                }
            }
            try {
                if (User && role === 'ADMIN') {
                    window.location.href = '/roles.html';
                } else {
                    alert("Вы должны быть админом!");
                }
            } catch (error) {
                console.error('Произошла ошибка:', error);
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при загрузке пользовательского списка:', error);
        });
});

// Додаємо обробник на кнопку пошуку
const searchButton = document.querySelector('.search_btn');
searchButton.addEventListener('click', () => {
    const searchText = document.querySelector('.search-txt').value; // Отримуємо текст з поля пошуку

    PostApi.fetch().then(backendPosts => {
        posts = backendPosts.concat()
    })

    // Фільтруємо пости, що містять введений текст у назві або описі
    const filteredPosts = posts.filter(post => {
        return post.title.includes(searchText) || post.text.includes(searchText);
    });

    // Перерендерюємо пости, використовуючи фільтрований масив
    renderPosts(filteredPosts);
});

const logoutButton = document.getElementById('logout')
logoutButton.style.display = 'none';

document.querySelector('#logout').addEventListener('click', () => {
    hideWelcomeMessage();

    // Приховуємо кнопки "Log Out" і "WelcomeMessage"
    const logoutButton = document.getElementById('logout');
    const welcomeMessageDiv = document.getElementById('welcomeMessage');
    logoutButton.style.display = 'none';
    welcomeMessageDiv.style.display = 'none';

    // Показуємо кнопки "Log In" і "Register"
    const loginButton = document.getElementById('login');
    const registerButton = document.getElementById('register');
    loginButton.style.display = 'inline-block';
    registerButton.style.display = 'inline-block';
});

openPopUpForm.addEventListener('click', () => {
    popUpForm.classList.add('active');
})
closePopUpForm2.addEventListener('click', () => {
    popUpForm.classList.remove('active');
})

function renderPosts(_posts = []) {
    const $posts = document.querySelector('#posts')

    if (_posts.length > 0) {
        $posts.innerHTML = _posts.map(post => card(post)).join(' ')
    } else {
        $posts.innerHTML = `<div class = "center">0 posts on page.</div>`
    }
}

class RegApi {
    static fetch() {
        return fetch(REG_URL, {method: 'get'}).then(res => res.json())
    }

    static create(USER) {
        return fetch(REG_URL, {
            method: 'post',
            body: JSON.stringify(USER),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
    }
}

class UsersApi {
    static fetch(token) {
        return fetch(USERS_URL, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json())
    }
}

class AuthApi {
    static fetch() {
        return fetch(AUTH_URL, {method: 'post'}).then(res => res.json())
    }

    static login(USER) {
        return fetch(AUTH_URL, {
            method: 'post',
            body: JSON.stringify(USER),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
    }
}

function onCreatePost() {
    const $title = document.querySelector('#title');
    const $text = document.querySelector('#text');

    // Check if the user is authenticated
    if (!User || !User.username) {
        // User is not authenticated, show alert
        alert('Вы не вошли в аккаун: войдите в него или зарегистрируйтесь!');
        return;
    }

    // User is authenticated, proceed with creating the post
    if ($title.value && $text.value && User.username) {
        const newPost = {
            title: $title.value,
            text: $text.value,
            author: User.username,
        };

        modal.close();
        PostApi.create(newPost)
            .then(post => {
                // На эту строку
                posts.unshift(post);
                renderPosts(posts);
            })
            .catch(error => {
                console.error('Error creating post:', error);
                alert('Error creating post. Please try again.');
            });
        $title.value = '';
        $text.value = '';
        M.updateTextFields();
    }
}

function showWelcomeMessage(username) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.textContent = `Welcome, ${username}`;
}

function hideWelcomeMessage() {
    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.textContent = '';
}

async function auth() {
    const $username = document.querySelector('#username1');
    const $password = document.querySelector('#password1');

    if ($username.value && $password.value) {
        User = {
            username: $username.value,
            password: $password.value,
        };

        const response = await AuthApi.login(User);
        const json = await response.json();
        if (response.status === 400) {
            // User not found, show alert
            alert('Такого пользователя не существует, зарегистрируйтесь!');
        }
        else if(response.status === 200) {
            authToken = json.token;
            const result = await UsersApi.fetch(authToken);
            showWelcomeMessage(User.username);
            // Приховуємо кнопки "Log In" і "Register"
            const loginButton = document.getElementById('login');
            const registerButton = document.getElementById('register');
            loginButton.style.display = 'none';
            registerButton.style.display = 'none';

            // Показуємо кнопки "Log Out" і "WelcomeMessage"
            const logoutButton = document.getElementById('logout');
            const welcomeMessageDiv = document.getElementById('welcomeMessage');
            logoutButton.style.display = 'inline-block';
            welcomeMessageDiv.style.display = 'inline-block';
            alert("Добро пожаловать в приложение!")
        }
        else {
            alert('Error during authentication. Please try again.');
        }
    }
}

function registration() {
    const $login = document.querySelector('#username2');
    const $password = document.querySelector('#password2');

    if ($login.value && $password.value) {
        const newUser = {
            username: $login.value,
            password: $password.value,
        };

        RegApi.create(newUser)
            .then(response => {
                if (response.message === "Пользователь успешно зарегистрирован") {
                    // Успешная регистрация
                    alert(response.message);
                    users.push(newUser);
                } else {
                    // Ошибка регистрации
                    alert("Ошибка при регистрации: " + response.message);
                }
            })
            .catch(error => {
                // Обработка других ошибок (например, проблемы с сетью)
                console.error('Ошибка при отправке запроса:', error);
            });
    } else {
        // Поля не заполнены
        alert("Имя пользователя и пароль должны быть заполнены.");
    }
}

function onDeletePost(event) {
    if (event.target.classList.contains('js-remove') || event.target.parentNode.classList.contains('js-remove')) {
        if (User) {
            const author = event.target.getAttribute('data-author') || event.target.parentNode.getAttribute('data-author');
            let role;
            fetch('/users')
                .then(userListResponse => userListResponse.json())
                .then(userList => {
                    for (const user of userList) {
                        if (user.username === User.username) {
                            role = user.roles[0];
                        }
                    }
                    if ((User.username === author || role === 'ADMIN')) {
                        const decision = confirm('Вы уверены что хотите удалить пост?')
                        if (decision) {
                            const id = event.target.getAttribute('data-id') || event.target.parentNode.getAttribute('data-id')
                            PostApi.remove(id).then(() => {
                                const postIndex = posts.findIndex(post => post._id === id)
                                posts.splice(postIndex, 1)
                                renderPosts(posts)
                            })
                        }
                    } else {
                        alert("Вы не автор и не админ, вы не можете удалить этот пост!")
                    }

                })
        }
        else {
            alert("Войди в аккаунт или зарегистрируйся!")
        }
    }
}
