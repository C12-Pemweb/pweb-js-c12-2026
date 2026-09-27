const form= document.getElementById("login-form");
const loginButton=document.getElementById("login-button");
const usernameInput=document.getElementById("username");
const passwordInput=document.getElementById("password");

form.addEventListener("submit", function(x){
    x.preventDefault();
    loginButton.textContent="Loading...";
    loginButton.disabled=true;
    const username=usernameInput.value;
    const password=passwordInput.value;
    fetch("https://dummyjson.com/users")
        .then(function(y) {
            return y.json();
        })
        .then(function(z){
            const user = z.users.find(function(user){
                return user.username === username && user.password === password;
            });

            console.log(user);

            if(user){
                localStorage.setItem("firstName", user.firstName);
                window.location.href="index.html";
            } else{
                alert("Username atau password salah!");
            }
        })

        .catch(function(e) {
            console.log(e);
            alert("Terjadi kesalahan...");
        });

    });
    // x->event, y->response, z->data, e->error