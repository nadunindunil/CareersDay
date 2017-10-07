﻿angular.module("careersDayApp").factory("studentService", function () {

    var factory = {
        studentsLoaded: false,
        students: []
    };

    factory.loadStudents = function (callback) {
        var clientContext = SP.ClientContext.get_current();
        var studentList = clientContext.get_web().get_lists().getByTitle("StudentList");
        var camlQuery = new SP.CamlQuery();
        var collListItem = studentList.getItems(camlQuery);

        clientContext.load(collListItem);
        clientContext.executeQueryAsync(function () {
            var listItemEnumerator = collListItem.getEnumerator();

            var students = [];
            while (listItemEnumerator.moveNext()) {
                var student = listItemEnumerator.get_current();
                //console.log(student.get_fieldValues());
                students.push({
                    email: student.get_item('Title'),
                    name: student.get_item('Name1')
                });
            }

            callback(students);
        }, onError);
    }

    factory.uploadStudents = function (students, callback) {
        var clientContext = SP.ClientContext.get_current();
        var studentList = clientContext.get_web().get_lists().getByTitle("StudentList");
        var camlQuery = new SP.CamlQuery();
        var collListItem = studentList.getItems(camlQuery);

        clientContext.load(collListItem);
        clientContext.executeQueryAsync(function () {
            console.log("Deleting existing students");
            var listItemEnumerator = collListItem.getEnumerator();

            var tmpArray = [];
            while (listItemEnumerator.moveNext()) {
                tmpArray.push(listItemEnumerator.get_current());
            }

            for (var i in tmpArray) {
                tmpArray[i].deleteObject();
            }

            // Now execute the delete operation and perform the add operation
            clientContext.executeQueryAsync(function () {
                console.log("Adding new students");
                // Add every element in the $scope.studentArray
                for (var i in students) {
                    var itemCreationInfo = new SP.ListItemCreationInformation();
                    var newItem = studentList.addItem(itemCreationInfo);
                    newItem.set_item("Title", students[i].email);
                    newItem.set_item("Name1", students[i].name);
                    newItem.update();
                }

                clientContext.executeQueryAsync(function () {
                    console.log("New students added successfully");
                    callback();
                }, onError);

            }, onError);
        });
    }

    factory.loadStudents(function (students) {
        console.log(students);
        factory.students = students;
        factory.studentsLoaded = true;
    });

    function onError(err) {
        console.log(err);
        alert("An error has occured while getting data from the server. This may be due to bad internet connection or server overload. Please perform the task again.");
    }

    return factory;
});