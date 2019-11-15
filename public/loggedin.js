var firebaseConfig = {
        apiKey: "AIzaSyAkH4v_7B-Tm6XKjm60xI26oTEYkrjOnz4",
        authDomain: "drugamatchingweb.firebaseapp.com",
        databaseURL: "https://drugamatchingweb.firebaseio.com",
        projectId: "drugamatchingweb",
        storageBucket: "drugamatchingweb.appspot.com",
        messagingSenderId: "1019970943209",
        appId: "1:1019970943209:web:295d8cacdf789b77671878",
        measurementId: "G-MC378R6FV2"
};

firebase.initializeApp(firebaseConfig);
var firestore = firebase.firestore();

function logout() {
        firebase.auth().signOut();
        location.replace("index.html");
}

crushes = [];

firebase.auth().onAuthStateChanged(function (user) {
        console.log("Hello")
        if (user) {
                var user = firebase.auth().currentUser;
                if (user != null) {
                        var email_id = user.email;
                        document.getElementById("ConfiremedEmail").style.display = "block";
                        if (!email_id.includes('@druga.si')) {
                                setTimeout(logout(), 5000);
                        }
                        document.getElementById("Welcome-user").innerHTML = "Serbus, " + get_name_from_email(email_id);
                        get_name_from_email(email_id);
                        loadCrushes(email_id);
                } else {
                        logout();
                }
        } else {
                alocation.replace("index.html");
        }
});

function loadCrushes1() {
        document.getElementById("listOfCrushes").innerHTML = "";
        loadCrushes(firebase.auth().currentUser.email);
}

function loadCrushes(userEmail) {
        const docRef = firestore.collection("Users").doc(userEmail);
        docRef.get().then(function (doc) {
                if (doc && doc.exists) {
                        const myData = doc.data();
                        crushes = myData.crushes;
                        for (let i = 0; i < crushes.length; i++) {
                                const crushmail = crushes[i];
                                addCrush(i, crushmail);

                        }
                        var ls = document.createElement('li');
                        var element = document.createElement('div');
                        element.classList.add('element');
                        element.classList.add('WHITE');
                        ls.appendChild(element);
                        document.getElementById("listOfCrushes").appendChild(ls);
                }
        }).catch(function (err) {
                console.log(err);
        })
}

function addCrush(number, name) {
        var crushmail = name;
        var ls = document.createElement('li');
        var element = document.createElement('div');
        element.classList.add('element');
        switch (number % 3) {
                case 0:
                        element.classList.add('BLUE');
                        break;
                case 1:
                        element.classList.add('YELLOW');
                        break;
                case 2:
                        element.classList.add('ORANGE');
                        break;

        }

        var middle = document.createElement('div');
        middle.classList.add('mdle');
        var vm = document.createElement('button');
        vm.classList.add('vm');
        var deletebutton = document.createElement('button');
        deletebutton.classList.add('deletebutton');
        var text = document.createTextNode(crushmail);
        vm.appendChild(text);
        text = document.createTextNode('Delete');
        deletebutton.appendChild(text);
        deletebutton.addEventListener("click", function () {
                removeMail(vm.innerHTML);
        });
        vm.addEventListener("click", function () {
                this.classList.toggle("active");
                var bt = vm.nextElementSibling;
                if (bt.style.display === "block") bt.style.display = "none";
                else bt.style.display = "block";
        });
        vm.style.display = "block";
        middle.style.display = "block";
        middle.appendChild(vm);
        middle.appendChild(deletebutton);
        element.appendChild(middle);
        ls.appendChild(element);
        document.getElementById("listOfCrushes").appendChild(ls);
}

function get_name_from_email(email) {
        var myR = /^[A-Za-z].*?\./;
        var name = myR.exec(email)[0];
        return (name[0].toUpperCase() + name.substring(1, name.length - 1).toLowerCase());
}

function update() {
        const docRef = firestore.collection("Users").doc(firebase.auth().currentUser.email);
        docRef.set({
                crushes: crushes
        }).then(function () {
                location.replace("loggedin.html");
        })
}

function removeMail(mail) {
        crushes = crushes.filter(function (value) { return value != mail });
        document.getElementById("listOfCrushes").innerHTML = "";
        for (let i = 0; i < crushes.length; i++) {
                const crushmail = crushes[i];
                addCrush(i, crushmail);
        }
        update();
}

function dodajmail() {
        var crushEmail = document.getElementById("email_field").value;
        var myR = /@druga\.si$/;
        var domaine = myR.exec(crushEmail)
        if (firebase.auth().currentUser.email == crushEmail) {
                window.alert("Saj vem, da se imaš rad samo ne");
        } else if (crushes.includes(crushEmail)) {
                location.replace("loggedin.html");
        } else if (domaine == null) {
                window.alert("Plz naj je v obliki ime.priimek@druga.si");
        } else {
                console.log(domaine);
                crushes.push(crushEmail);
                update()
        }
}