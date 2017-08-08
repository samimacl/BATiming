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
        fbInstance.auth(); //Mail+Pwd
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


})();