var database = firebase.database();
var userID = window.location.search.match(/\?id=(.*)/)[1];


$(document).ready(function() {
    getTasksFromDB();
    $(".add-tasks").click(addTasksClick);

});

function addTasksClick(event) {
    event.preventDefault();
    var newTask = $(".tasks-input").val();
    var taskFromDB = addTaskToDB(newTask);
    crudListItem(newTask, taskFromDB.key)
}

function addTaskToDB(text) {
    return database.ref("tasks/" + userID).push({
        text: text
    });
}

function getTasksFromDB() {
    database.ref("tasks/" + userID).once('value')
        .then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                crudListItem(childData.text, childKey)
            });
        });
    database.ref("users/" + userID).once('value')
        .then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                $(".user-name").append(`${childData.Name}`);
            });
        });
}


function crudListItem(text, key) {
    $(".tasks-list").append(`
   <li>
     <span>${text}</span>
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
        $(".tasks-list").append(`
       <li>
       <textarea class="tasks-update">${text}</textarea>
         <button class="update-tasks">Update</button>
       </li>`);
        $(".update-tasks").click(updateTasksClick);
    });
}

function updateTasksClick(event) {
    event.preventDefault();
    var newTask = $(".tasks-update").val();
    var taskFromDB = addTaskToDB(newTask);
    crudListItem(newTask, taskFromDB.key);
    $(".tasks-update").parent().remove();
    $(".update-tasks").parent().remove();

}