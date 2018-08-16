var database = firebase.database();
var userID = window.location.search.match(/\?id=(.*)/)[1];

$(document).ready(function () {
  getUsersFromDB();
  getTasksFromDB();
  getTasksFromFriendsDB()
  $(".add-tasks").click(addTasksClick);
});

function addTasksClick(event) {
  event.preventDefault();
  var newTask = $(".tasks-input").val();
  var timeTask = '\t' + moment().format('LLLL');
  var taskFromDB = addTaskToDB(newTask, timeTask);
  crudListItem(newTask, timeTask, taskFromDB.key)
}

function getUsersFromDB() {
  database.ref("users/").once('value')
    .then(function (snapshot) {
      var userName = $(".user-name");
      snapshot.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        if (childData.Name !== userName.text()) {
          console.log(childKey)
          $(".users-list").prepend(`
            <li>
              <p>${childData.Name}</p>
              <button class="follow" data-user-id=${childKey}>Seguir</button>
              <button class="unfollow" data-user-id=${childKey}>Deixar de Seguir</button>
            </li>`);

          database.ref("friend/" + userID).once('value')
            .then(function (snapshot) {
              snapshot.forEach(function (childSnapshot) {
                var childFriendKey = childSnapshot.key;
                var childFriendData = childSnapshot.val();
                if (childFriendData.friend === childKey) {
                  $(`button.follow[data-user-id="${childKey}"]`).hide();
                  $(`button.unfollow[data-user-id="${childKey}"]`).show();
                  
                }
                else if (childFriendData.friend !== childKey && childFriendData.friend !== 0 ){
                  $(`button.unfollow[data-user-id="${childKey}"]`).hide();
                  console.log(childFriendData)
                  
                }

              });
            });
        }
            $(`button.follow[data-user-id="${childKey}"]`).click(function () {
              addUserFriendToDB(childKey);
              $(`button.follow[data-user-id="${childKey}"]`).hide();
              $(`button.unfollow[data-user-id="${childKey}"]`).show()
            });
            $(`button.unfollow[data-user-id="${childKey}"]`).click(function () {
              removeUserFriendToDB(childKey);
              $(`button.follow[data-user-id="${childKey}"]`).show();
              $(`button.unfollow[data-user-id="${childKey}"]`).hide()
            });

             
       
      });
    });
  }

function addUserFriendToDB(key) {
  return database.ref("friend/" + userID).push({
    friend: key
  })
}


function removeUserFriendToDB(key) {
  database.ref("friend/" + userID).once('value')
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childFriendKey = childSnapshot.key;
        var childFriendData = childSnapshot.val();
        if (childFriendData.friend === key) {
          database.ref("friend/" + userID + "/" + childFriendKey).remove();
        }
      });
    });
}

function addTaskToDB(text, time) {
  return database.ref("tasks/" + userID).push({
    text: text,
    time: time
  });
}

function getTasksFromDB() {
  database.ref("users/" + userID).once('value')
    .then(function (snapshot) {
      $(".user-name").prepend(`${snapshot.val().Name}`);
    });


  database.ref("tasks/" + userID).once('value')
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        crudListItem(childData.text, childData.time, childKey)
      });
    });
}

function getTasksFromFriendsDB() {
  database.ref("friend/" + userID).once('value')
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childFriendKey = childSnapshot.key;
        var childFriendData = childSnapshot.val();

        database.ref("users/" + childFriendData.friend).once('value')
          .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
              var childNameKey = childSnapshot.key;
              var childNameData = childSnapshot.val().Name;
              
            });
          });
         database.ref("tasks/" + childFriendData.friend).once('value')
           .then(function (snapshot) {
             snapshot.forEach(function (childSnapshot) {
               var childKey = childSnapshot.key;
               var childData = childSnapshot.val();
               addFriendListItem(childData.text, childData.time)
             });
          });
      });
    });
}

function addFriendListItem(text, time) {
  $(".tasks-list").append(`
  <li>
     <p>${name}<span>${time}</span></p>
     <p>${text}</p>
  </li>`);
}

function crudListItem(text, time, key) {
  $(".tasks-list").prepend(`
  <li>
     <p>${$(".user-name").text()}<span>${time}</span></p>
     <p>${text}</p>
     <button class="delete" data-task-id=${key}>Deletar</button>
     <button class="edit" data-task-id=${key}>Editar</button>
  </li>`);

  $(`button.delete[data-task-id="${key}"]`).click(function () {
    database.ref("tasks/" + userID + "/" + key).remove();
    $(this).parent().remove();
  });

  $(`button.edit[data-task-id="${key}"]`).click(function () {
    database.ref("tasks/" + userID + "/" + key).remove();
    $(this).parent().remove();
    $(".tasks-list").prepend(`<li>
        <textarea class="tasks-update">${text}</textarea>
        <button class="update-tasks">Update</button>
        </li>`);
    $(".update-tasks").click(updateTasksClick);
  });
}

function updateTasksClick(event) {
  event.preventDefault();
  var newTask = $(".tasks-update").val();
  var timeTask = '\t' + moment().format('LLLL');
  var taskFromDB = addTaskToDB(newTask, timeTask);
  crudListItem(newTask, timeTask, taskFromDB.key);
  $(".tasks-update").parent().remove();
  $(".update-tasks").parent().remove();
}