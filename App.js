const API_URL = 'https://jsonplaceholder.typicode.com/users';

const userList = document.getElementById('userList');
const userDetails = document.getElementById('userDetails');
const searchInput = document.getElementById('search');

let allUsers = [];
let selectedId = null;

// Escape text before putting it into innerHTML
function esc(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}

function initials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function showLoading() {
    userList.innerHTML = '<div class="state"><div class="spinner"></div>Loading users…</div>';
}

function showError(message) {
    userList.innerHTML = `
        <div class="error" role="alert">
            <strong>Could not load users.</strong><br>${esc(message)}
            <br><button type="button" id="retry">Try again</button>
        </div>`;
    document.getElementById('retry').addEventListener('click', fetchUsers);
}

async function fetchUsers() {
    showLoading();
    searchInput.disabled = true;
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allUsers = await response.json();
        searchInput.disabled = false;
        displayUserList(allUsers);
    } catch (error) {
        console.error('Fetch Error: ', error);
        const offline = !navigator.onLine || error instanceof TypeError;
        showError(offline
            ? 'Check your internet connection and try again.'
            : error.message);
    }
}

function displayUserList(users) {
    userList.innerHTML = '';

    if (users.length === 0) {
        userList.innerHTML = '<div class="state">No users match your search.</div>';
        return;
    }

    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item' + (user.id === selectedId ? ' active' : '');
        userElement.setAttribute('role', 'listitem');
        userElement.tabIndex = 0;
        userElement.dataset.id = user.id;
        userElement.innerHTML = `
            <div class="avatar">${esc(initials(user.name))}</div>
            <div>
                <div class="name">${esc(user.name)}</div>
                <div class="sub">${esc(user.email)}</div>
            </div>`;

        const select = () => displayUserDetails(user);
        userElement.addEventListener('click', select);
        userElement.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                select();
            }
        });
        userList.appendChild(userElement);
    });
}

function displayUserDetails(user) {
    selectedId = user.id;

    // Highlight only the selected item
    document.querySelectorAll('.user-item').forEach(el => {
        el.classList.toggle('active', Number(el.dataset.id) === user.id);
    });

    const a = user.address;
    // Replacing innerHTML guarantees only one profile is visible at a time
    userDetails.innerHTML = `
        <div class="profile">
            <div class="profile-head">
                <div class="avatar">${esc(initials(user.name))}</div>
                <div>
                    <h2>${esc(user.name)}</h2>
                    <p>@${esc(user.username)}</p>
                </div>
            </div>
            <dl class="fields">
                <dt>Name</dt><dd>${esc(user.name)}</dd>
                <dt>Email</dt><dd><a href="mailto:${esc(user.email)}">${esc(user.email)}</a></dd>
                <dt>Address</dt>
                <dd>${esc(a.suite)} ${esc(a.street)}, ${esc(a.city)} ${esc(a.zipcode)}</dd>
                <dt>Phone</dt><dd>${esc(user.phone)}</dd>
                <dt>Company</dt><dd>${esc(user.company.name)}</dd>
                
            </dl>
        </div>`;
}

// Live search filter
searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    displayUserList(allUsers.filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
});

// Initial fetch of users
fetchUsers();