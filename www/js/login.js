/* ----------------------------------------------------------------------------- 
 *
 *   login.js - Funktionen für die Anmeldung, Registrierung und 
 *   Passwort-Verwaltung durch Firebase
 *
 *   (c) 2017 WS14-II - Tobias Groß, Sascha Knöchel, Andreas Garben, Atiq Butt
 *
 *  ------------------------------------------------------------------------- */

var login = (function () {
    let login = {};

    $$('.login-screen .anmelden-login-screen').on('click', function () {
        firebase.auth().signInWithEmailAndPassword($$('.login-screen input[name = "username"]').val(), $$('.login-screen input[name = "password"]').val()).catch(function (error) {
            myApp.alert(error.message);
        });
    });

    $$('.login-screen .register-login-screen').on('click', function () {
        firebase.auth().createUserWithEmailAndPassword($$('.login-screen input[name = "username"]').val(), $$('.login-screen input[name = "password"]').val()).catch(function (error) {
            myApp.alert(error.message);
        });
    });

    $$('.login-screen .resetpw-login-screen').on('click', function () {
        firebase.auth().sendPasswordResetEmail($$('.login-screen input[name = "username"]').val()).then(function () {
            myApp.alert("E-Mail versandt!");
        }).catch(function (error) {
            myApp.alert(error.message);
        });
    });

    myApp.onPageInit('settings', function (page) {
        $$('.sign-out').on('click', function () {
            firebase.auth().signOut().then(function () {
                // Sign-out successful.
                myApp.loginScreen();
            }).catch(function (error) {
                // An error happened.
                myApp.alert(error.message);
            });
        });

        $$('.change-fbpassword').on('click', function () {
            myApp.modalPassword('Enter your new password', function (password) {
                var user = firebase.auth().currentUser;

                user.updatePassword(password).then(function () {
                    // Update successful.
                    myApp.alert('Update successful.');
                }).catch(function (error) {
                    // An error happened.
                    myApp.alert('An error happened.');
                });
            });
        });
    });


    firebase.auth().onAuthStateChanged(function (fbUser) {
        if (fbUser) {
            database.getCurrentPerson(function (data) {
                console.log(data);
                if (data == null) {
                    database.createPerson(firebase.auth().currentUser.uid, "", "", "", "", 0);
                    database.getCurrentPerson(function (data) {
                        $$('.view-main').show();
                        $$('.view-dozent').hide();
                        storageManager.addItem(true, 'userData', data);
                        batiming.initMaps();
                        myApp.closeModal('.login-screen');
                    });
                    myApp.mainView.router.loadPage('./views/settings.html');
                } else {
                    if (data.Rolle != null && data.Rolle == '1') {
                        $$('.view-main').hide();
                        $$('.view-dozent').show();
                    } else {
                        $$('.view-main').show();
                        $$('.view-dozent').hide();
                    };
                    storageManager.changeItem(true, 'userData', data)
                    batiming.initMaps();
                    batiming.getTemplateData();
                    myApp.closeModal('.login-screen');
                }
            });
            console.log(fbUser);
        } else {
            storageManager.removeItem(true, 'userData');
            storageManager.removeItem(true, 'studyGroupMap');
            storageManager.removeItem(true, 'lectureMap');
            storageManager.removeItem(true, 'dozentenMap');
            if (batiming.devMode) {
                myApp.closeModal('.login-screen');
            }
        }
    });

    return login;
})();