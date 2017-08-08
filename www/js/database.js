/* ----------------------------------------------------------------------- 
<<<<<<< HEAD
*   database.js - Funktionen für den Zugriff auf die Firebase-Datenbank.
=======
*   templateModule.js - Template für Modul
>>>>>>> 20a15bbf342ea9d97f4aef4db50af6c9ff982abb
*
*   (c) 2017 WS14-II - Tobias Groß, Sascha Knöchel, Andreas Garben, Atiq Butt
*
*  ----------------------------------------------------------------------- */

<<<<<<< HEAD
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
=======
var ba_main = (function () {
    "use strict";

    //Application object
    var ba_main = {};

    // ********************************************************************
    //Private variables & private methods

    var var1;

    function _myfunc(param) {
        // code here
    }

    // ********************************************************************
    //Member variables & member methods

    ba_main.attr1 = "";
    ba_main.attr2 = {};

    //init object
    ba_main.init = function () {
        //code here
    };

    return ba_main;
})();
>>>>>>> 20a15bbf342ea9d97f4aef4db50af6c9ff982abb
