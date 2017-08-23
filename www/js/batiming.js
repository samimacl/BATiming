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

    //Maps
    batiming.Map = null;

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
        swipePanel: 'left',
        precompileTemplates: true,
        template7Pages: true,

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
        try {
            myApp.showPreloader('Custom Title');
            timeManager.startWorkflow()
                .then(() => console.log("Workflow started" + "\n"))
                .then(() => console.log('start Monitoring'))
                .then(() => beacon.startMonitoringForRegion(beacon.beaconRegion))
                .then(() => setTimeout(function () {
                    if (timeManager.state > 0) {
                        timeManager.stopWorkflow();
                        showNotification('Timeout', 'A timeout occured while scanning for iBeacon', true);
                    }
                }, 5000))
                .catch(function (e) {
                    console.log(e)
                });
        } finally {
            beacon.stopScanForBeacon(beacon.beaconRegion);
            timeManager.stopWorkflow();
            myApp.hidePreloader();
        }
    });

    // https://framework7.io/docs/form-storage.html
    // https://framework7.io/docs/form-data.html
    myApp.onPageInit('settings', function (page) {
        // Get Studiengruppen
        for (var item in batiming.Map) {
            myApp.smartSelectAddOption('.smart-select select', '<option value = "' + batiming.Map[item].key + '">' + batiming.Map[item].value + '</option>');
        }
        myApp.formFromData('#my-form', JSON.parse(storageManager.getItem(true, 'userData')));
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
            database.updatePerson(database.getCurrentUserID(), storedData.Name, storedData.Vorname, storedData.Studiengruppe, storedData.PersonalID);
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

    batiming.initMaps = function () {
        if (batiming.Map === null) {
            database.getStudyGroups(function (data) {
                batiming.Map = data;
            })
        }
    }

    batiming.getTemplateData = function () {
        // Aktueller Termin
        if (storageManager.getItem(true, 'userData').Rolle = 0) {
            // Aktuelle Vorlesung
            database.getCurrentLectureKeyByStudyGroup(storageManager.getItem(true, 'userData').Studiengruppe_ID, function (data1) {
                // Zukünftige Vorlesungen
                database.getCurrentLectureKeyByStudyGroup(storageManager.getItem(true, 'userData').Studiengruppe_ID, function (data2) {
                    // Letzte Einträge
                    database.getCurrentLectureKeyByStudyGroup(storageManager.getItem(true, 'userData').Studiengruppe_ID, function (data3) {
                        var results1 = [];
                        var results2 = [];
                        var results3 = [];

                        for (var i = 0; i <= data1.length; i++) {
                            results1[i] = JSON.Parse(data1[i]);
                        }
                        for (var i = 0; i <= data2.length; i++) {
                            results2[i] = JSON.Parse(data2[i]);
                        }
                        for (var i = 0; i <= data3.length; i++) {
                            results3[i] = JSON.Parse(data3[i]);
                        }
                        // Clear Empty Object in list
                        results1 = results1.filter(function (n) {
                            return n !== null;
                        });
                        results2 = results2.filter(function (n) {
                            return n !== null;
                        });

                        results3 = results3.filter(function (n) {
                            return n !== null;
                        });

                        // CurrentLecture
                        myApp.template7Data.student = results1;
                        myApp.template7Data.student.studentNextEntry = results2;
                        myApp.template7Data.student.studentLastEntry = results3;
                        $$('.page[data-page="index"] .page-content .myPageContentStudenten').html(Template7.templates.studentenTemplate(results1));
                    });
                });
            });
        } else {
            // Vorlesung Akttuell
            database.getCurrentLectureKeyByStudyGroup(storageManager.getItem(true, 'userData').Studiengruppe_ID, function (data1) {
                // Anwesende Studenten
                database.getCurrentLectureKeyByStudyGroup(storageManager.getItem(true, 'userData').Studiengruppe_ID, function (data2) {
                    var results1 = [];
                    var results2 = [];

                    for (var i = 0; i <= data1.length; i++) {
                        results1[i] = JSON.Parse(data1[i]);
                    }
                    for (var i = 0; i <= data2.length; i++) {
                        results2[i] = JSON.Parse(data2[i]);
                    }

                    // Clear Empty Object in list
                    results1 = results1.filter(function (n) {
                        return n !== null;
                    });
                    results2 = results2.filter(function (n) {
                        return n !== null;
                    });

                    // myPageContentDozent
                    myApp.template7Data.dozent = results1;
                    myApp.template7Data.dozent.students = results2;
                    $$('.page[data-page="index"] .page-content .myPageContentDozent').html(Template7.templates.dozentenTemplate(results1));
                });
            });
        }
        myApp.pullToRefreshDone();
    }

    $$('.pull-to-refresh-content').on('refresh', function () {
        batiming.getTemplateData();
    });

    return batiming;
}());
