var database = firebase.database();
var userID = window.location.search.match(/\?id=(.*)/)[1];

$(document).ready(function() {
  getTasksFromDB();
  $(".add-tasks").click(addTasksClick);
});

function addTasksClick(event) {
  event.preventDefault();
  var newTask = $(".tasks-input").val();
  var timeTask = new Date().getHours() + ':' + new Date().getMinutes(); 
  var taskFromDB = addTaskToDB(newTask, timeTask);
  crudListItem(newTask, timeTask, taskFromDB.key)
}

function addTaskToDB(text, time) {
  return database.ref("tasks/" + userID).push({
    text: text,
    time : time 
  });
}

function getTasksFromDB() {

  database.ref("users/" + userID).once('value')
    .then(function (snapshot) {
      $(".user-name").append(`${snapshot.val().Name}`);
    });

  database.ref("users/").once('value')
    .then(function (snapshot) {
      var userName = $(".user-name");
      snapshot.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        if (childData.Name !== userName.text()) {
          $(".users-list").append(`<li>${childData.Name}</li>`);
        }
      });
    });

  database.ref("tasks/" + userID).once('value')
  .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      crudListItem(childData.text, childData.time, childKey)
    });
  });
}

function crudListItem(text, time, key) {
  $(".tasks-list").append(`
  <li>
     <p>${$(".user-name").text()}<span>${time}</span></p>
     <p>${text}</p>
     <button class="delete" data-task-id=${key}>Deletar</button>
     <button class="edit" data-task-id=${key}>Editar</button>
  </li>`);

    $(`button.delete[data-task-id="${key}"]`).click(function() {
        database.ref("tasks/" + userID + "/" + key).remove();
        $(this).parent().remove();
    });

    $(`button.edit[data-task-id="${key}"]`).click(function() {
        database.ref("tasks/" + userID + "/" + key).remove();
        $(this).parent().remove();
        $(".tasks-list").append(`<li>
        <textarea class="tasks-update">${text}</textarea>
        <button class="update-tasks">Update</button>
        </li>`);
        $(".update-tasks").click(updateTasksClick);
    });
}

function updateTasksClick(event) {
    event.preventDefault();
    var newTask = $(".tasks-update").val();
    var timeTask = new Date().getHours() + ':' + new Date().getMinutes();
    var taskFromDB = addTaskToDB(newTask, timeTask);
    crudListItem(newTask, timeTask, taskFromDB.key);
    $(".tasks-update").parent().remove();
    $(".update-tasks").parent().remove();

}