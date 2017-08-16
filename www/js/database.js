/* ----------------------------------------------------------------------- 
 *
 *   database.js - Funktionen für den Zugriff auf die Firebase-Datenbank.
 *
 *   (c) 2017 WS14-II - Tobias Groß, Sascha Knöchel, Andreas Garben, Atiq Butt
 *
 *  ----------------------------------------------------------------------- */

var Database = (function () {
    let Database = {};

    let fbInstance = firebase; //Setter/Getter ??
    let fbUserMail = null;
    let fbUserPassword = null;
    let dbUrl = null;

    Database.initFirebase = function (configParams, userMail, userPassword) {
        fbInstance = firebase;
        fbInstance.initializeApp(configParams);
        this.setUserAuth(userMail, userPassword);
    }

    Database.getFirebaseObject = function () {
        return fbInstance;
    }

    //(obsolete) --> Firebase-Object wird intern gesetzt, lediglich initFirebase(..) muss aufgerufen werden.
    Database.setFirebaseObject = function (object, userMail, userPassword) {
        fbInstance = object;
        fbUserMail = userMail;
        fbUserPassword = userPassword;
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
        if (fbInstance.auth().currentUser) {
            var ref = fbInstance.database().ref("Personen/Person_" + this.getCurrentUserID());
            ref.once("value").then(function (snap) {
                console.log("OnValue --> " + snap.val());
                callbackFunction(snap.val());
            });
        } else {
            //Login + Callback wenn eingeloggt, dann nochmaliger Funktionsaufruf
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    var ref = fbInstance.database().ref("Personen/Person_" + this.getCurrentUserID());
                    ref.once("value").then(function (snap) {
                        callbackFunction(snap.val());
                        unsuscribeAuthEvent();
                    });
                }
            });
        }
    }

    //Returns JSON-Object
    Database.getPersonByID = function (userID, callbackFunction) {
        //Check if logged in
        if (fbInstance.auth().currentUser) {
            if (!userID) {
                var ref = fbInstance.database().ref("Personen/Person_" + userID);
                ref.once("value").then(function (snap) {
                    callbackFunction(snap.val());
                });
            } else {
                callbackFunction(null);
            }
        } else {
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    if (!userID) {
                        var ref = fbInstance.database().ref("Personen/Person_" + userID);
                        ref.once("value").then(function (snap) {
                            callbackFunction(snap.val());
                        });
                    } else {
                        callbackFunction(null);
                    }
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    }

    //Returns void
    Database.createPerson = function (userID, name, vorname, studiengruppe, personalID, rolle) {
        //Check if logged in
        if (fbInstance.auth().currentUser) {
            var ref = fbInstance.database().ref("Personen");
            var newRef = ref.child("Person_" + userID);
            newRef.set({
                "Name" : name,
                "Vorname" : vorname,
                "Studiengruppe" : studiengruppe,
                "PersonalID" : personalID,
                "Rolle" : rolle //0 = Student, 1 = Dozent
            });
        } else {
            //Login + Callback wenn eingeloggt, dann nochmaliger Funktionsaufruf
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    var ref = fbInstance.database().ref("Personen");
                    var newRef = ref.child("Person_" + userID);
                    newRef.set({
                        "Name" : name,
                        "Vorname" : vorname,
                        "Studiengruppe" : studiengruppe,
                        "PersonalID" : personalID,
                        "Rolle" : rolle //0 = Student, 1 = Dozent
                    });
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    };

    //Returns void
    Database.updatePerson = function (userID, secondName, firstName, studyGroup, personalID) {
        if (fbInstance.auth().currentUser) {
            var ref = fbInstance.database().ref("Personen/Person_" + userID);
            ref.set({
                "Name" : name,
                "Vorname" : vorname,
                "Studiengruppe" : studiengruppe,
                "PersonalID" : personalID,
            });
        } else {
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    var ref = fbInstance.database().ref("Personen/Person_" + userID);
                    ref.set({
                        "Name" : name,
                        "Vorname" : vorname,
                        "Studiengruppe" : studiengruppe,
                        "PersonalID" : personalID,
                    });
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    };

    //Returns String
    Database.getCurrentLectureKeyByStudyGroup = function (studyGroup, callbackFunction) {
        //Check if logged in
        if (fbInstance.auth().currentUser) {
            if (studyGroup != null) {
                var date = new Date();
                var dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                var timeString = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                var ref = fbInstance.database().ref("StudyGroupCalendar/" + dateString + "/" + studyGroup);
                ref.orderByKey().endAt(timeString).once("value").then(function (snap) {
                    // callbackFunction(snap.val());
                    snap.forEach(function (childNode) {
                        childNode.forEach(function (childChildNode) {
                            var terminJSON = childChildNode.val();
                            if (terminJSON != null) {
                                if (terminJSON.Ende >= timeString) {
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
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    if (studyGroup != null) {
                        var date = new Date();
                        var dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                        var timeString = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                        var ref = fbInstance.database().ref("StudyGroupCalendar/" + dateString + "/" + studyGroup);
                        ref.orderByKey().endAt(timeString).once("value").then(function (snap) {
                            // callbackFunction(snap.val());
                            snap.forEach(function (childNode) {
                                childNode.forEach(function (childChildNode) {
                                    var terminJSON = childChildNode.val();
                                    if (terminJSON != null) {
                                        if (terminJSON.Ende >= timeString) {
                                            callbackFunction(terminJSON.Vorlesung_ID);
                                        }
                                    }
                                });
                            });
                        });
                    } else {
                        callbackFunction(null);
                    }
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    }

    //Returns String-Array
    Database.getLectureKeysByStudyGroups = function (studyGroup, callbackFunction) {
        //Check if logged in
        if (fbInstance.auth().currentUser) {
            if (studyGroup != null) {
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
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    if (studyGroup != null) {
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
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    }

    //Returns JSON-Object
    Database.getLectureByKey = function (lectureKey, callbackFunction) {
        //Check if logged in
        if (fbInstance.auth().currentUser) {
            if (lectureKey != null) {
                var ref = fbInstance.database().ref("Lectures/" + lectureKey);
                ref.once("value").then(function (snap) {
                    callbackFunction(snap.val());
                });
            } else {
                callbackFunction(null);
            }
        } else {
            //Login + Callback wenn eingeloggt, dann nochmaliger Funktionsaufruf
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    if (lectureKey != null) {
                        var ref = fbInstance.database().ref("Lectures/" + lectureKey);
                        ref.once("value").then(function (snap) {
                            callbackFunction(snap.val());
                        });
                    } else {
                        callbackFunction(null);
                    }
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    }
    
    //Returns void --> Buchung Vorlesungshistorie "Anwesenheit"
    //timeStakpString-Format: YYYY-MM-DDTHH:mm:SS
    //timestampString = timestamp.getFullYear() + "-" + timestamp.getMonth() + "-" + timestamp.getDate() + "T" + timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
    Database.bookLectureHistoryPersonEntry = function (terminID, personID, excusedFlag, remark, timestampString) {
        if (fbInstance.auth().currentUser) {
            var ref = fbInstance.database().ref("LectureHistory/" + terminID + "/Teilnehmer").push();
            ref.set({
                "Bemerkung" : remark,
                "Entschuldigt" : excusedFlag,
                "Kommt" : timestampString,
                "Person" : personID
            });
        } else {
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    var ref = fbInstance.database().ref("LectureHistory/" + terminID + "/Teilnehmer").push();
                    ref.set({
                        "Bemerkung" : remark,
                        "Entschuldigt" : excusedFlag,
                        "Kommt" : timestampString,
                        "Person" : personID
                    });
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    }

    //Returns void --> Dozentenfreigabe eines Termins
    //timeStakpString-Format: YYYY-MM-DDTHH:mm:SS
    //timestampString = timestamp.getFullYear() + "-" + timestamp.getMonth() + "-" + timestamp.getDate() + "T" + timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
    Database.releaseLectureHistoryEntry = function (terminID, dozentID, timestampString) {
        if (fbInstance.auth().currentUser) {
            var ref = fbInstance.database().ref("LectureHistory/" + terminID);
            ref.update({
                "ReleaseTime" : timestampString,
                "ReleasePersonID" : dozentID
            });
        } else {
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    var ref = fbInstance.database().ref("LectureHistory/" + terminID);
                    ref.update({
                        "ReleaseTime" : timestampString,
                        "ReleasePersonID" : dozentID
                    });
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    }

    //timeStakpString-Format: YYYY-MM-DDTHH:mm:SS
    //timestampString = timestamp.getFullYear() + "-" + timestamp.getMonth() + "-" + timestamp.getDate() + "T" + timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
    Database.bookHistoryEntry = function (personID, lectureID, terminID, roomDesc, remark, excusedFlag, timestampString) {
        if (fbInstance.auth().currentUser) {
            var ref = fbInstance.database().ref("PersonHistory/" + personID + "/" + terminID);
            ref.set({
                "Bemerkung" : remark,
                "Entschuldigt" : excusedFlag,
                "Kommt" : timestampString,
                "Raum" : roomDesc,
                "VorlesungID" : lectureID
            });
        } else {
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    var ref = fbInstance.database().ref("PersonHistory/" + personID + "/" + terminID);
                    ref.set({
                        "Bemerkung" : remark,
                        "Entschuldigt" : excusedFlag,
                        "Kommt" : timestampString,
                        "Raum" : roomDesc,
                        "VorlesungID" : lectureID
                    });
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    }

    return Database;
})();