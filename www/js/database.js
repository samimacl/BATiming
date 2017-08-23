/* ----------------------------------------------------------------------- 
 *
 *   database.js - Funktionen für den Zugriff auf die Firebase-Datenbank.
 *
 *   (c) 2017 WS14-II - Tobias Groß, Sascha Knöchel, Andreas Garben, Atiq Butt
 *
 *  ----------------------------------------------------------------------- */

var database = (function () {
    let database = {};

    let fbInstance = firebase; //Setter/Getter ??
    let fbUserMail = null;
    let fbUserPassword = null;
    let dbUrl = null;

    database.initFirebase = function (configParams, userMail, userPassword) {
        fbInstance = firebase;
        fbInstance.initializeApp(configParams);
        this.setUserAuth(userMail, userPassword);
    }

    database.getFirebaseObject = function () {
        return fbInstance;
    }

    //(obsolete) --> Firebase-Object wird intern gesetzt, lediglich initFirebase(..) muss aufgerufen werden.
    database.setFirebaseObject = function (object, userMail, userPassword) {
        fbInstance = object;
        fbUserMail = userMail;
        fbUserPassword = userPassword;
        //fbInstance.initializeApp({databaseUrl : dbUrl}); Muss im Login passieren
    }

    database.setDatabaseUrl = function (url) {
        dbUrl = url;
    }

    database.setUserAuth = function (userMail, userPassword) {
        fbUserMail = userMail;
        fbUserPassword = userPassword;
        fbInstance.auth().signInWithEmailAndPassword(userMail, userPassword);
    }

    //Returns String
    database.getCurrentUserID = function () {
        return fbInstance.auth().currentUser.uid;
    }

    //Returns JSON-Object
    database.getCurrentPerson = function (callbackFunction) {
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
    database.getPersonByID = function (userID, callbackFunction) {
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
    database.createPerson = function (userID, name, vorname, studiengruppe, personalID, rolle) {
        //Check if logged in
        if (fbInstance.auth().currentUser) {
            var ref = fbInstance.database().ref("Personen");
            var newRef = ref.child("Person_" + userID);
            newRef.set({
                "Name": name,
                "Vorname": vorname,
                "Studiengruppe": studiengruppe,
                "PersonalID": personalID,
                "Rolle": rolle //0 = Student, 1 = Dozent
            });
        } else {
            //Login + Callback wenn eingeloggt, dann nochmaliger Funktionsaufruf
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    var ref = fbInstance.database().ref("Personen");
                    var newRef = ref.child("Person_" + userID);
                    newRef.set({
                        "Name": name,
                        "Vorname": vorname,
                        "Studiengruppe": studiengruppe,
                        "PersonalID": personalID,
                        "Rolle": rolle //0 = Student, 1 = Dozent
                    });
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    };

    //Returns void
    database.updatePerson = function (userID, secondName, firstName, studyGroup, personalID) {
        if (fbInstance.auth().currentUser) {
            var ref = fbInstance.database().ref("Personen/Person_" + userID);
            ref.set({
                "Name": secondName,
                "Vorname": firstName,
                "Studiengruppe": studyGroup,
                "PersonalID": personalID,
            });
        } else {
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    var ref = fbInstance.database().ref("Personen/Person_" + userID);
                    ref.set({
                        "Name": secondName,
                        "Vorname": firstName,
                        "Studiengruppe": studyGroup,
                        "PersonalID": personalID,
                    });
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    };

    //Returns DataSnapshot
    database.getCurrentAppointmentByStudyGroup = function (studyGroup, callbackFunction) {
        //Check if logged in
        if (fbInstance.auth().currentUser) {
            if (studyGroup != null) {
                var date = new Date();
                var dateString = dateToFirebaseString(date);
                var timeString = timeToFirebaseString(date);
                var beginTime;
                var ref = fbInstance.database().ref("StudyGroupCalendar/" + studyGroup + "/" + dateString);
                ref.orderByKey().endAt(timeString).once("value").then(function (snap) {
                    console.log("OnValue --> " + snap.val());
                    // callbackFunction(snap.val());
                    snap.forEach(function (childNode) {
                        beginTime = childNode.key;
                        childNode.forEach(function (childChildNode) {
                            var terminJSON = childChildNode.val();
                            if (terminJSON != null) {
                                if (terminJSON.Ende >= timeString) {
                                    let result = {
                                        "appointment": childChildNode.key,
                                        "lecture": terminJSON.Vorlesung_ID,
                                        "begin": beginTime,
                                        "end": terminJSON.Ende
                                    };
                                    callbackFunction(result);
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
                        var dateString = dateToFirebaseString(date);
                        var timeString = timeToFirebaseString(date);
                        var beginTime;
                        var ref = fbInstance.database().ref("StudyGroupCalendar/" + studyGroup + "/" + dateString);
                        ref.orderByKey().endAt(timeString).once("value").then(function (snap) {
                            // callbackFunction(snap.val());
                            snap.forEach(function (childNode) {
                                beginTime = childNode.key;
                                childNode.forEach(function (childChildNode) {
                                    var terminJSON = childChildNode.val();
                                    if (terminJSON != null) {
                                        if (terminJSON.Ende >= timeString) {
                                            let result = {
                                                "appointment": childChildNode.key,
                                                "lecture": terminJSON.Vorlesung_ID,
                                                "begin": beginTime,
                                                "end": terminJSON.Ende
                                            };
                                            callbackFunction(result);
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
    database.getLectureKeysByStudyGroups = function (studyGroup, callbackFunction) {
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
    database.getLectureByKey = function (lectureKey, callbackFunction) {
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

    database.getAppointmentList = function(dayLimit, studyGroup, callbackFunction) {
        if (fbInstance.auth().currentUser) {
            if (dayLimit != null && studyGroup != null) {
                var dateString = dateToFirebaseString(new Date());
                var ref = fbInstance.database().ref("StudyGroupCalendar/" + studyGroup);
                if (dayLimit < 0) {
                    dayLimit = dayLimit * -1;
                    ref.orderByKey().endAt(dateString).limitToLast(dayLimit).once("value").then(function (snap) {
                        //callbackFunction(snap.val());
                        var counter = 0;
                        var jsonArray = [];
                        var jsonValue;
                        snap.forEach(function (childNode) {
                            childNode.forEach(function (childChildNode) {
                                childChildNode.forEach(function (childChildChildNode) {
                                    if (counter != dayLimit) {
                                        counter ++;
                                        jsonValue = childChildNode.val();
                                        jsonArray.push({
                                            "appointment": childChildChildNode.key,
                                            "lecture": jsonValue.Vorlesung_ID,
                                            "date": childNode.key,
                                            "begin": childChildNode.key,
                                            "end": jsonValue.Ende
                                        });
                                    } else {
                                        callbackFunction(jsonArray);
                                    }
                                });
                            });
                        });
                    });
                } else if (dayLimit > 0) {
                    ref.orderByKey().startAt(dateString).limitToFirst(dayLimit).once("value").then(function (snap) {
                        var counter = 0;
                        var jsonArray = [];
                        var jsonValue;
                        snap.forEach(function (childNode) {
                            childNode.forEach(function (childChildNode) {
                                childChildNode.forEach(function (childChildChildNode) {
                                    if (counter != dayLimit) {
                                        counter ++;
                                        jsonValue = childChildNode.val();
                                        jsonArray.push({
                                            "appointment": childChildChildNode.key,
                                            "lecture": jsonValue.Vorlesung_ID,
                                            "date": childNode.key,
                                            "begin": childChildNode.key,
                                            "end": jsonValue.Ende
                                        });
                                    } else {
                                        callbackFunction(jsonArray);
                                    }
                                });
                            });
                        });
                    });
                }
            }
        } else {
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    if (dayLimit != null && studyGroup != null) {
                        var dateString = dateToFirebaseString(new Date());
                        var ref = fbInstance.database().ref("StudyGroupCalendar/" + studyGroup);
                        if (dayLimit < 0) {
                            dayLimit = dayLimit * -1;
                            ref.orderByKey().endAt(dateString).limitToLast(dayLimit).once("value").then(function (snap) {
                                //callbackFunction(snap.val());
                                var counter = 0;
                                var jsonArray = [];
                                var jsonValue;
                                snap.forEach(function (childNode) {
                                    childNode.forEach(function (childChildNode) {
                                        childChildNode.forEach(function (childChildChildNode) {
                                            if (counter != dayLimit) {
                                                counter ++;
                                                jsonValue = childChildNode.val();
                                                jsonArray.push({
                                                    "appointment": childChildChildNode.key,
                                                    "lecture": jsonValue.Vorlesung_ID,
                                                    "date": childNode.key,
                                                    "begin": childChildNode.key,
                                                    "end": jsonValue.Ende
                                                });
                                            } else {
                                                callbackFunction(jsonArray);
                                            }
                                        });
                                    });
                                });
                            });
                        } else if (dayLimit > 0) {
                            ref.orderByKey().startAt(dateString).limitToFirst(dayLimit).once("value").then(function (snap) {
                                var counter = 0;
                                var jsonArray = [];
                                var jsonValue;
                                snap.forEach(function (childNode) {
                                    childNode.forEach(function (childChildNode) {
                                        childChildNode.forEach(function (childChildChildNode) {
                                            if (counter != dayLimit) {
                                                counter ++;
                                                jsonValue = childChildNode.val();
                                                jsonArray.push({
                                                    "appointment": childChildChildNode.key,
                                                    "lecture": jsonValue.Vorlesung_ID,
                                                    "date": childNode.key,
                                                    "begin": childChildNode.key,
                                                    "end": jsonValue.Ende
                                                });
                                            } else {
                                                callbackFunction(jsonArray);
                                            }
                                        });
                                    });
                                });
                            });
                        }
                    }
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    }

    //Returns void --> Buchung Vorlesungshistorie "Anwesenheit"
    //timeStampString-Format: YYYY-MM-DDTHH:mm:SS
    //timestampString = timestamp.getFullYear() + "-" + timestamp.getMonth() + "-" + timestamp.getDate() + "T" + timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
    database.bookLectureHistoryPersonEntry = function (terminID, personID, excusedFlag, remark, timestampString) {
        if (fbInstance.auth().currentUser) {
            var ref = fbInstance.database().ref("LectureHistory/" + terminID + "/Teilnehmer").push();
            ref.set({
                "Bemerkung": remark,
                "Entschuldigt": excusedFlag,
                "Kommt": timestampString,
                "Person": personID
            });
        } else {
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    var ref = fbInstance.database().ref("LectureHistory/" + terminID + "/Teilnehmer").push();
                    ref.set({
                        "Bemerkung": remark,
                        "Entschuldigt": excusedFlag,
                        "Kommt": timestampString,
                        "Person": personID
                    });
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    }

    //Returns void --> Dozentenfreigabe eines Termins
    //timeStampString-Format: YYYY-MM-DDTHH:mm:SS
    //timestampString = timestamp.getFullYear() + "-" + timestamp.getMonth() + "-" + timestamp.getDate() + "T" + timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
    database.releaseLectureHistoryEntry = function (terminID, dozentID, timestampString) {
        if (fbInstance.auth().currentUser) {
            var ref = fbInstance.database().ref("LectureHistory/" + terminID);
            ref.update({
                "ReleaseTime": timestampString,
                "ReleasePersonID": dozentID
            });
        } else {
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    var ref = fbInstance.database().ref("LectureHistory/" + terminID);
                    ref.update({
                        "ReleaseTime": timestampString,
                        "ReleasePersonID": dozentID
                    });
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    }

    //Returns void --> Buchung Personenhistorie "Anwensenheit"
    //timeStampString-Format: YYYY-MM-DDTHH:mm:SS
    //timestampString = timestamp.getFullYear() + "-" + timestamp.getMonth() + "-" + timestamp.getDate() + "T" + timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
    database.bookHistoryEntry = function (personID, lectureID, terminID, roomDesc, remark, excusedFlag, timestampString) {
        if (fbInstance.auth().currentUser) {
            var ref = fbInstance.database().ref("PersonHistory/" + 'Person_' + personID + "/" + terminID).push();
            ref.set({
                "Bemerkung": remark,
                "Entschuldigt": excusedFlag,
                "Kommt": timestampString,
                "Raum": roomDesc,
                "VorlesungID": lectureID
            });
        } else {
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    var ref = fbInstance.database().ref("PersonHistory/" + personID + "/" + terminID);
                    ref.set({
                        "Bemerkung": remark,
                        "Entschuldigt": excusedFlag,
                        "Kommt": timestampString,
                        "Raum": roomDesc,
                        "VorlesungID": lectureID
                    });
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    }

    database.getStudyGroups = function (callbackFunction) {
        //Check if logged in
        if (fbInstance.auth().currentUser) {
            var ref = fbInstance.database().ref("StudyGroups");
            ref.once("value").then(function (snap) {
                var mapList = [];
                snap.forEach(function (childNode) {
                    mapList.push({
                        key: childNode.key,
                        value: childNode.val().Bezeichnung
                    });
                });
                callbackFunction(mapList);
            });
        } else {
            //Login + Callback wenn eingeloggt, dann nochmaliger Funktionsaufruf
            var unsuscribeAuthEvent = fbInstance.auth().onAuthStateChanged(function (user) {
                if (!user) {
                    var ref = fbInstance.database().ref("StudyGroups");
                    ref.once("value").then(function (snap) {
                        var mapList = [];
                        snap.forEach(function (childNode) {
                            mapList.push({
                                key: childNode.key,
                                value: childNode.val().Bezeichnung
                            });
                        });
                        callbackFunction(mapList);
                    });
                    unsuscribeAuthEvent();
                }
            });
            this.setUserAuth(this.userMail, this.userPassword);
        }
    }

    //Returns string
    database.getUsersMailaddress = function () {
        if (!fbInstance.auth().currentUser) {
            return fbInstance.auth().currentUser.email;
        }
    }

    function dateToFirebaseString(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    }

    function timeToFirebaseString(date) {
        return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    }

    return database;
})();