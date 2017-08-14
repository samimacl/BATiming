$$('.login-screen .login-login-screen').on('click', function () {
    firebase.auth().signInWithEmailAndPassword($$('.login-screen input[name = "username"]').val(), $$('.login-screen input[name = "password"]').val()).catch(function (error) {
        myApp.alert(error.message);
    });
    myApp.closeModal('.login-screen');
});

$$('.login-screen .list-button').on('click', function () {
    firebase.auth().signInWithEmailAndPassword($$('.login-screen input[name = "username"]').val(), $$('.login-screen input[name = "password"]').val()).catch(function (error) {
        myApp.alert(error.message);
    });
});

$$('.login-screen .register-login-screen').on('click', function () {
    firebase.auth().createUserWithEmailAndPassword($$('.login-screen input[name = "username"]').val(), $$('.login-screen input[name = "password"]').val()).catch(function (error) {
        myApp.alert(error.message);
    });
    myApp.closeModal('.login-screen');
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
        if (devMode) {
            myApp.closeModal('.login-screen');
        }
    }
});