/* ----------------------------------------------------------------------- 
*
*   database.js - Funktionen für den Zugriff auf die Firebase-Datenbank.
*
*   (c) 2017 WS14-II - Tobias Groß, Sascha Knöchel, Andreas Garben, Atiq Butt
*
*  ----------------------------------------------------------------------- */

var Database = (function () {
    staticObject = null;
    this.fbInstance = null;
    this.dbUrl = null;

    //Singleton-Pattern
    return {
        getInstance = function () {
            if (staticObject == null) {
                staticObject = new Database();
            }
            return staticObject;
        }
    }

    function getFirebaseObject() {
        if (fbInstance == null) {
            fbInstance = new Firebase(dbUrl);
        }
    }

    function setFirebaseObject(object) {
        fbInstance = object;
        //fbInstance.initializeApp({databaseUrl : dbUrl}); Muss im Login passieren
    }

    function setDatabaseUrl(url) {
        dbUrl = url;
    }

    function setUserAuth(userMail, userPassword) {
        fbInstance.auth().signInWithEmailAndPassword(userMail, userPassword)
    }

    function getSnapshotByPath(refPath) {
        var ref = fbInstance.database().ref(refPath);
        var result;
        ref.once("value").then(function(snapshot) {
            result = snapshot;
        });
        return result;
    }

    function getCurrentUserID() {
        return fbInstance.User.uid;
    }

    function getCurrentUserData() {
        return getSnapshotByPath("personen/person_" + getCurrentUserID());
    }

    function createPerson(userID, name, vorname, studiengruppe, personalID, rolle) {
        var ref = fbInstance.database().ref("personen/person_" + userID);
        var newRef = ref.push();
        newRef.set({
            "Name" : name,
            "Vorname" : vorname,
            "Studiengruppe" : studiengruppe,
            "PersonalID" : personalID,
            "Rolle" : rolle //0 = Student, 1 = Dozent
        })
    }

    function updatePerson(userID, name, vorname, studiengruppe, personalID) {
        var ref = fbInstance.database().ref("personen/person_" + userID);
        var newRef = ref.push();
        newRef.set({
            "Name" : name,
            "Vorname" : vorname,
            "Studiengruppe" : studiengruppe,
            "PersonalID" : personalID,
        })
    }


})();