var $$ = Dom7;
var myApp;

var batiming = (function () {
    let batiming = {};

    //var isAndroid = Framework7.prototype.device.android === true;
    //var isIos = Framework7.prototype.device.isIos === true;
    let isAndroid = false;
    let isIos = true;

    let devMode = false;

    Template7.global = {
        android: isAndroid,
        ios: isIos
    }

    //add css styles
    if (isAndroid) {
        $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
        // Insert content/elements, to the beginning of element specified in parameter
        $$('.view .navbar').prependTo('.view .page');
    }

    // Initialize app
    myApp = new Framework7({
        material: isAndroid === true ? true : false,
        template7Pages: true,
        swipePanel: 'left',
    });

    // Add view
    var mainView = myApp.addView('.view-main', {
        // Because we want to use dynamic navbar, material design doesn't support it.
        dynamicNavbar: true
    });

    var dozentView = myApp.addView('.view-dozent', {
        dynamicNavbar: true
    });

    $$('.login-screen .register-login-screen').on('click', function () {
        firebase.auth().createUserWithEmailAndPassword($$('.login-screen input[name = "username"]').val(), $$('.login-screen input[name = "password"]').val()).catch(function (error) {
            myApp.alert(error.message);
        });
        myApp.closeModal('.login-screen');
    });

    // Handle Cordova Device Ready Event
    $$(document).on('deviceready', function () {
        console.log("Device is ready!");
        beacon.initialize();

        cordova.plugins.backgroundMode.enable();
        if (isAndroid)
            cordova.plugins.backgroundMode.overrideBackButton();
    });

    $$('#b_beacon').on('click', function () {
        timeManager.startWorkflow()
            .then(function () {
                console.log("Workflow started" + "\n");
            })
            .then(function () {
                console.log('start Monitoring');
                // beacon.startMonitoringForRegion(beacon.beaconRegion);
            })
            .catch(function (e) {
                console.log(e)
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

    $$('.login-screen .list-button').on('click', function () {
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

    // https://framework7.io/docs/form-storage.html
    // https://framework7.io/docs/form-data.html
    myApp.onPageInit('settings', function (page) {
        // Daten befüllen Example
        var formData = {
            'vorname': 'Andreas',
            'nachname': 'Garben',
            'email': 'john@doe.com',
            'matrikelnummer': '12345',
            'fachbereich': '2'
        }
        myApp.formFromData('#my-form', formData);
    });

    myApp.onPageBack('settings', function (page) {
        // Daten Speichern beim Seite verlassen Example
        var storedData = myApp.formGetData('my-form');
        if (storedData) {
            // Speeichern
            myApp.alert(JSON.stringify(storedData));
        } else {
            // keine Änderungen
            alert('Yet there is no stored data for this form. Please try to change any field')
        }
    });

    $$('.panel-close').on('click', function (e) {
        myApp.closePanel();
    });

    return batiming;
})();
