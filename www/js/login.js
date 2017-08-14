$$('.login-screen .login-login-screen').on('click', function () {
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

$$('.sign-out').on('click', function () {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
        myApp.loginScreen();
    }).catch(function (error) {
        // An error happened.
        myApp.alert(error.message);
    });
});

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        database.getCurrentPerson(function (data) {
            console.log(data);
            if (data.Rolle != null && data.Rolle == '1') {
                $$('.view-main').hide();
                $$('.view-dozent').show();
            } else {
                $$('.view-main').show();
                $$('.view-dozent').hide();
            }
        });
        myApp.closeModal('.login-screen');
        console.log(user);
    } else {
        if (devMode) {
            myApp.closeModal('.login-screen');
        }
        // No user is signed in.
    }
});