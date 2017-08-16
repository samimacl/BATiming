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

    $$('.login-screen .login-login-screen').on('click', function () {
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

    $$('.page .sign-out').on('click', function () {
        firebase.auth().signOut().then(function () {
            // Sign-out successful.
            myApp.loginScreen();
        }).catch(function (error) {
            // An error happened.
            myApp.alert(error.message);
        });
    });

    $$('.sign-out').on('click', function () {
        firebase.auth().signOut().then(function () {
            // Sign-out successful.
            myApp.loginScreen();
        }).catch(function (error) {
            // An error happened.
            myApp.alert(error.message);
        });
    });

    firebase.auth().onAuthStateChanged(function (fbUser) {
        if (fbUser) {
            database.getCurrentPerson(function (data) {
                console.log(data);
                if (data == null)
                    return;
                if (data.Rolle != null && data.Rolle == '1') {
                    $$('.view-main').hide();
                    $$('.view-dozent').show();
                } else {
                    $$('.view-main').show();
                    $$('.view-dozent').hide();
                }
                storageManager.addItem(true, 'userData', data);
                myApp.closeModal('.login-screen');
            });
            console.log(fbUser);
        } else {
            storageManager.removeItem(true, 'userData');
            if (batiming.devMode) {
                myApp.closeModal('.login-screen');
            }
        }
    });

    $$('.change-password').on('click', function () {
        myApp.modalPassword('Enter your new password', function (password) {
            var user = firebase.auth().currentUser;
            var credential;
            // Prompt the user to re-provide their sign-in credentials
            user.reauthenticateWithCredential(credential).then(function () {
                // User re-authenticated.
                myApp.alert('User re-authenticated.');
                user.updatePassword(password).then(function () {
                    // Update successful.
                    myApp.alert('Update successful.');
                }).catch(function (error) {
                    // An error happened.
                    myApp.alert('An error happened.');
                });
            }).catch(function (error) {
                // An error happened.
                myApp.alert('An error happened.');
            });
        });
    });

    return login;
})();