/* ----------------------------------------------------------------------- 
*
*   database.js - Funktionen für den Zugriff auf die Firebase-Datenbank.
*
*   (c) 2017 WS14-II - Tobias Groß, Sascha Knöchel, Andreas Garben, Atiq Butt
*
*  ----------------------------------------------------------------------- */

var Database = function () {
    var _singleton = null;
    var fbInstance = firebase; //Setter/Getter ??
    var fbUserMail = null;
    var fbUserPassword = null;
    var dbUrl = null;

    //Singleton-Pattern
    return this.getInstance();
};

Database.getInstance = function () {
    if (_singleton == null) {
        _singleton = new Database();
    }
    return _singleton;
}

Database.createFirebaseObject = function(configParams, userMail, userPassword) {
    fbInstance = firebase;
    fbInstance.initializeApp(configParams);
    this.setUserAuth(userMail, userPassword);
}

Database.getFirebaseObject = function () {
    return fbInstance;
}

Database.setFirebaseObject = function (object) {
    fbInstance = object;
    //fbInstance.initializeApp({databaseUrl : dbUrl}); Muss im Login passieren
}

Database.setDatabaseUrl = function (url) {
    dbUrl = url;
}

Database.setUserAuth = function (userMail, userPassword) {
    fbUserMail = userMail;
    fbUserPassword = userPassword;
    fbInstance.auth().signInWithEmailAndPassword(userMail, userPassword);
}

//Returns String
Database.getCurrentUserID = function () {
    return fbInstance.auth().currentUser.uid;
}

//Returns JSON-Object
Database.getCurrentPerson = function (callbackFunction) {
    //Check if logged in
    if (firebase.auth().currentUser) {
        var ref = fbInstance.database().ref("Personen/Person_" + this.getCurrentUserID());
        ref.once("value").then(function (snap) {
            console.log("OnValue --> " + snap.val());
            callbackFunction(snap.val());
        });
    } else {
        //Login + Callback wenn eingeloggt, dann nochmaliger Funktionsaufruf
    }
}

//Returns JSON-Object
Database.getPersonByID = function(userID, callbackFunction) {
    //Check if logged in
    if (firebase.auth().currentUser) {
        if (!userID) {
            var ref = fbInstance.database().ref("Personen/Person_" + userID);
            ref.once("value").then(function (snap) {
                callbackFunction(snap.val());
            });
        }
        else {
            callbackFunction(null);
        }
    } else {
        //Login + Callback wenn eingeloggt, dann nochmaliger Funktionsaufruf
    }
}

//Returns void
Database.createPerson = function (userID, name, vorname, studiengruppe, personalID, rolle) {
     //Check if logged in
    if (firebase.auth().currentUser) {
        var ref = fbInstance.database().ref("Personen/Person_" + userID);
        var newRef = ref.push();
        newRef.set({
            "Name" : name,
            "Vorname" : vorname,
            "Studiengruppe" : studiengruppe,
            "PersonalID" : personalID,
            "Rolle" : rolle //0 = Student, 1 = Dozent
        });
    } else {
        //Login + Callback wenn eingeloggt, dann nochmaliger Funktionsaufruf
    }
}

//Returns void
Database.updatePerson = function (userID, name, vorname, studiengruppe, personalID) {
    var ref = fbInstance.database().ref("Personen/Person_" + userID);
    // var newRef = ref.push();
    // newRef.set({
    //     "Name" : name,
    //     "Vorname" : vorname,
    //     "Studiengruppe" : studiengruppe,
    //     "PersonalID" : personalID,
    // })
};

//Returns String
Database.getCurrentLectureKeyByStudyGroup = function(studyGroup, callbackFunction) {
     //Check if logged in
    if (firebase.auth().currentUser) {
        if (!studyGroup) {
            var date = Date();
            var dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
            var timeString = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            var ref = fbInstance.database().ref("StudyGroupCalendar/" + dateString + "/" + studyGroup);
            ref.orderByKey().endAt(timeString).once("value").then(function (snap) {
                // callbackFunction(snap.val());
                snap.forEach(function(childNode){
                    childNode.forEach(function(childChildNode) {
                        var terminJSON = childChildNode.val();
                        if (!terminJSON) {
                            if (!terminJSON.Ende >= timeString) {
                                callbackFunction(terminJSON.Vorlesung_ID);
                            }
                        }
                    });
                });
            });
        }
        else
        {
            callbackFunction(null);
        }
    } else {
        //Login + Callback wenn eingeloggt, dann nochmaliger Funktionsaufruf
    }
}

//Returns String-Array
Database.getLectureKeysByStudyGroups = function(studyGroup, callbackFunction) {
     //Check if logged in
    if (firebase.auth().currentUser) {
        if (!studyGroup) {
            var ref = fbInstance.database().ref("StudyGroups/" + studyGroup + "/Lectures");
            ref.once("value").then(function (snap) {
                var lectureKeys = [];
                snap.forEach(function(childNode) {
                    lectureKeys.push(childNode.key);
                });
                callbackFunction(lectureKeys);
            });
        } else {
            callbackFunction(null);
        }
    } else {
        //Login + Callback wenn eingeloggt, dann nochmaliger Funktionsaufruf
    }
}

//Returns JSON-Object
Database.getLectureByKey = function (lectureKey, callbackFunction) {
     //Check if logged in
    if (firebase.auth().currentUser) {
        if (!studyGroup) {
            var ref = fbInstance.database().ref("Lectures/" + lectureID);
            ref.once("value").then(function (snap) {
                callbackFunction(snap.val());
            });
        } else {
            callbackFunction(null);
        }
    } else {
        //Login + Callback wenn eingeloggt, dann nochmaliger Funktionsaufruf
    }
}

Database.bookTimeEntry = function(terminID, excusedFlag, remark) {
    return null;
}

Database.bookHistoryEntry = function(lectureDesc, terminID, roomDesc, bookingTime, remark) {
    return null;
}