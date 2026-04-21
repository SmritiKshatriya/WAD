let editIndex = -1; // track editing user

document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let user = { name, email, password };

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // 🔹 Check if editing or new entry
    if (editIndex === -1) {
        users.push(user); // add new
    } else {
        users[editIndex] = user; // update existing
        editIndex = -1;
    }

    localStorage.setItem("users", JSON.stringify(users));

    // AJAX POST
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://jsonplaceholder.typicode.com/posts", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 201) {
            alert("Saved Successfully!");
            displayUsers();
        }
    };

    xhr.send(JSON.stringify(user));

    document.getElementById("registerForm").reset();
});


// 🔹 Display Function
function displayUsers() {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let table = document.getElementById("userTable");

    table.innerHTML = "";

    users.forEach((user, index) => {
        let row = `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editUser(${index})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${index})">Delete</button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
}


// 🔹 Delete Function
function deleteUser(index) {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (confirm("Are you sure you want to delete this user?")) {
        users.splice(index, 1);
        localStorage.setItem("users", JSON.stringify(users));
        displayUsers();
    }
}


// 🔹 Edit Function (NO DELETE NOW)
function editUser(index) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users[index];

    document.getElementById("name").value = user.name;
    document.getElementById("email").value = user.email;
    document.getElementById("password").value = user.password;

    editIndex = index; // 🔥 store index
}


// Load on page start
window.onload = displayUsers;