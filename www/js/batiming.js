/* ----------------------------------------------------------------------------- 
 *
 *   batiming.js - Core-Klasse, initializiert App.
 *
 *   (c) 2017 WS14-II - Tobias Groß, Sascha Knöchel, Andreas Garben, Atiq Butt
 *
 *  ------------------------------------------------------------------------- */

var $$ = Dom7;
var myApp;

var batiming = (function () {
    let batiming = {};

    //let batiming.isAndroid = Framework7.prototype.device.android === true;
    //let batiming.isIos = Framework7.prototype.device.batiming.isIos === true;
    batiming.isAndroid = false;
    batiming.isIos = true;
    batiming.devMode = false;

    Template7.global = {
        android: batiming.isAndroid,
        ios: batiming.isIos
    }

    //add css styles
    if (batiming.isAndroid) {
        $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
        // Insert content/elements, to the beginning of element specified in parameter
        $$('.view .navbar').prependTo('.view .page');
    }

    // Initialize app
    myApp = new Framework7({
        material: batiming.isAndroid === true ? true : false,
        template7Pages: true,
        swipePanel: 'left',
        precompileTemplates: true,

        template7Data: {
            'page:attendance': {
                Dozent: '(999)-111-22-33',
                Zeit: 'contact@john.doe',
                Vorlesung: 'hallo'
            }
        }
    });

    // Add view
    var mainView = myApp.addView('.view-main', {
        // Because we want to use dynamic navbar, material design doesn't support it.
        dynamicNavbar: true
    });

    var dozentView = myApp.addView('.view-dozent', {
        dynamicNavbar: true
    });

    // Handle Cordova Device Ready Event
    $$(document).on('deviceready', function () {
        console.log("Device is ready!");
        beacon.initialize();

        cordova.plugins.backgroundMode.enable();
        if (batiming.isAndroid)
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

    myApp.onPageInit('attendance', function (page) {
        // Daten befüllen Example
        batiming.getTemplateDataAttendance();
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

    batiming.getTemplateDataAttendance = function () {
        database.getCurrentLectureKeyByStudyGroup(storageManager.getItem(true, 'userData').Studiengruppe_ID, function (data) {
            var results1 = [];

            for (var i = 0; i <= data.length; i++) {
                results1[i] = JSON.Parse(data[i]);
            };

            // Clear Empty Object in list
            results1 = results1.filter(function (n) {
                return n !== null;
            });

            // CurrentLecture
            myApp.template7Data.attendance = results1;
            $$('.page[data-page="attendance"] .page-content .myPageContentStudentenAttendance').html(Template7.templates.attendanceTemplate(results1));
        });
	}

    $$('.panel-close').on('click', function (e) {
        myApp.closePanel();
    });

    return batiming;
})();




