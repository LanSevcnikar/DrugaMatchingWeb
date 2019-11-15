var tried = false;
var provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({
        'login_hint': 'ime.priimek@druga.si'
});

function loginGoogle() {
        firebase.auth().signInWithPopup(provider).then(function (result) {
                var user = result.user
        }).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorMessage);
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
        });
}

firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
                location.replace("loggedin.html")
        } else {
                document.getElementById("login_div").style.display = "block";
        }
});

function login() {
        var userEmail = document.getElementById("email_field").value;
        var userPassword = document.getElementById("password_field").value;
        firebase.auth().signInWithEmailAndPassword(userEmail, userPassword).catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode === "auth/wrong-password") {
                        tried = true;
                }
                window.alert(errorMessage);
        });
}

function signup() {
        location.replace("signup.html");
}

