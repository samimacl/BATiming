/* ----------------------------------------------------------------------- 
 *
 *   database.js - Funktionen für den Zugriff auf die Firebase-Datenbank.
 *
 *   (c) 2017 WS14-II - Tobias Groß, Sascha Knöchel, Andreas Garben, Atiq Butt
 *
 *  ----------------------------------------------------------------------- */

var Database = (function () {
    let database = {};

    let fbInstance = firebase; //Setter/Getter ??
    let userObject = {
        fbUserMail: null,
        fdUserPassword: null,
        dbUrl
    };

    function setUserAuth(userMail, userPassword) {
        fbUserMail = userMail;
        fbUserPassword = userPassword;
        fbInstance.auth().signInWithEmailAndPassword(userMail, userPassword);
    }

    database.createFirebaseObject = function (configParams, userMail, userPassword) {
        fbInstance = firebase;
        fbInstance.initializeApp(configParams);
        setUserAuth(userMail, userPassword);
    }

    database.getFirebaseObject = function () {
        return fbInstance;
    }

    database.setFirebaseObject = function (object) {
        fbInstance = object;
        //fbInstance.initializeApp({databaseUrl : dbUrl}); Muss im Login passieren
    }

    database.setDatabaseUrl = function (url) {
        dbUrl = url;
    }

    //Returns String
    database.getCurrentUserID = function () {
        return fbInstance.auth().currentUser.uid;
    }

    //Returns JSON-Object
    database.getCurrentPersonData = function (callbackFunction) {
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
    database.getPersonByID = function (userID, callbackFunction) {
        //Check if logged in
        if (firebase.auth().currentUser) {
            if (!userID) {
                var ref = fbInstance.database().ref("Personen/Person_" + userID);
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

    //Returns void
    database.createPerson = function (userID, name, vorname, studiengruppe, personalID, rolle) {
        //Check if logged in
        if (firebase.auth().currentUser) {
            var ref = fbInstance.database().ref("Personen/Person_" + userID);
            var newRef = ref.push();
            newRef.set({
                "Name": name,
                "Vorname": vorname,
                "Studiengruppe": studiengruppe,
                "PersonalID": personalID,
                "Rolle": rolle //0 = Student, 1 = Dozent
            });
        } else {
            //Login + Callback wenn eingeloggt, dann nochmaliger Funktionsaufruf
        }
    }

    //Returns void
    database.updatePerson = function (userID, name, vorname, studiengruppe, personalID) {
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
    database.getCurrentLectureKeyByStudyGroup = function (studyGroup, callbackFunction) {
        //Check if logged in
        if (firebase.auth().currentUser) {
            if (!studyGroup) {
                var date = Date();
                var dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                var timeString = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                var ref = fbInstance.database().ref("StudyGroupCalendar/" + dateString + "/" + studyGroup);
                ref.orderByKey().endAt(timeString).once("value").then(function (snap) {
                    // callbackFunction(snap.val());
                    snap.forEach(function (childNode) {
                        childNode.forEach(function (childChildNode) {
                            var terminJSON = childChildNode.val();
                            if (!terminJSON) {
                                if (!terminJSON.Ende >= timeString) {
                                    callbackFunction(terminJSON.Vorlesung_ID);
                                }
                            }
                        });
                    });
                });
            } else {
                callbackFunction(null);
            }
        } else {
            //Login + Callback wenn eingeloggt, dann nochmaliger Funktionsaufruf
        }
    }

    //Returns String-Array
    database.getLectureKeysByStudyGroups = function (studyGroup, callbackFunction) {
        //Check if logged in
        if (firebase.auth().currentUser) {
            if (!studyGroup) {
                var ref = fbInstance.database().ref("StudyGroups/" + studyGroup + "/Lectures");
                ref.once("value").then(function (snap) {
                    var lectureKeys = [];
                    snap.forEach(function (childNode) {
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
    database.getLectureByKey = function (lectureKey, callbackFunction) {
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

    database.bookTimeEntry = function (terminID, excusedFlag, remark) {
        return null;
    }

    database.bookHistoryEntry = function (lectureDesc, terminID, roomDesc, bookingTime, remark) {
        return null;
    }

    return database;

})();