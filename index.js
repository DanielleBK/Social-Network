var database = firebase.database();

$(document).ready(function() {
    $(".sign-up-button").click(signUpClick);
    $(".sign-in-button").click(signInClick);
});

function signUpClick(event) {
    event.preventDefault();
    var email = $(".sign-up-email").val();
    var password = $(".sign-up-password").val();
    var name = $(".sign-up-name").val();
    var age = $(".sign-up-age").val();
    createUser(email, password, name, age);
}

function createUser(email, password, name, age) {
    console.log(email, password, name, age);

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(response) {
            var userId = response.user.uid;
            database.ref("users/" + userId).set({
                Name: name,
                Idade: age
            });
            database.ref("friend/" + userId).push({
                friend: 0
          });
            redirectToTasks(userId);
        })
        .catch(function(error) {
            handleError(error);
        });
}

function signInClick(event) {
    event.preventDefault();
    var email = $(".sign-in-email").val();
    var password = $(".sign-in-password").val();
    signInUser(email, password);
}

function signInUser(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(response) {
            var userId = response.user.uid;
          redirectToTasks(userId);
         
      })
      
        .catch(function(error) {
            handleError(error)
        });
}

function handleError(error) {
    var errorMessage = error.message;
    alert(errorMessage);
}

function redirectToTasks(userId) {
    window.location = "tasks.html?id=" + userId;
}