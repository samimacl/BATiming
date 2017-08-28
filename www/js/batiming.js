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
            myApp.showPreloader('Eintragung läuft ....');
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
        for (var item in JSON.parse(storageManager.getItem(true, 'studyGroupsData'))) {
            myApp.smartSelectAddOption('.smart-select select', '<option value = "' + batiming.Map[item].key + '">' + batiming.Map[item].value + '</option>');
        }
        myApp.formFromData('#my-form', JSON.parse(storageManager.getItem(true, 'userData')));
    });

    myApp.onPageBack('settings', function (page) {
        // Daten Speichern beim Seite verlassen Example
        var storedData = myApp.formGetData('my-form');
        if (storedData) {
            // Speeichern
            database.updatePerson(database.getCurrentUserID(), storedData.Name, storedData.Vorname, storedData.Studiengruppe, storedData.PersonalID);
            database.getCurrentPerson(function (data) {
                storageManager.changeItem(true, 'userData', data);
            });
        } else {
            // keine Änderungen
            alert('Yet there is no stored data for this form. Please try to change any field')
        }
    });

    myApp.onPageInit('attendance', function (page) {
        // Daten befüllen Example
        batiming.getTemplateDataAttendance();
    });

    batiming.initMaps = function () {
        if (batiming.Map === null) {
            database.getStudyGroups(function (data) {
                // batiming.Map = data;
                storageManager.changeItem(true, 'studyGroupsData', data)
            })
        }
        database.getStudyGroups(function (data) {
            storageManager.changeItem(true, 'appointmentData', data)
        })
    }

    function mapGetLectureString(id) {
        if (id != null) {
            JSON.parse(storageManager.getItem(true, 'appointmentData')).forEach(function (element) {
                if (element.id = id) {
                    return element.value;
                }
            }, this);
        }
        return null;
    }

    batiming.getTemplateData = function () {
        // Aktueller Termin
        if (JSON.parse(storageManager.getItem(true, 'userData')).Rolle == 0) {
            // Aktuelle Vorlesung
            database.getCurrentAppointmentByStudyGroup(JSON.parse(storageManager.getItem(true, 'userData')).Studiengruppe, function (data1) {
                // Zukünftige Vorlesungen
                database.getAppointmentList(3, JSON.parse(storageManager.getItem(true, 'userData')).Studiengruppe, function (data2) {
                    // Letzte Einträge
                    database.getAppointmentList(-3, JSON.parse(storageManager.getItem(true, 'userData')).Studiengruppe, function (data3) {
                        var results1 = data1;
                        var results2 = data2;
                        var results3 = data3;

                        if (results1 != null) {
                            results1 = results1.filter(function (n) {
                                return n !== null;
                            });
                            results1.forEach(function (element) {
                                if (element.begin != null)
                                    element.begin = element.begin.substring(0, 5);
                                if (element.end != null)
                                    element.end = element.end.substring(0, 5);
                                if (element.lecture != null)
                                    element.lectureString = mapGetLectureString(element.lecture);
                            }, this);
                        } else
                            results1 = [];

                        if (results2 != null) {
                            results2 = results2.filter(function (n) {
                                return n !== null;
                            });
                            results2.forEach(function (element) {
                                if (element.begin != null)
                                    element.begin = element.begin.substring(0, 5);
                                if (element.end != null)
                                    element.end = element.end.substring(0, 5);
                                if (element.lecture != null)
                                    element.lectureString = mapGetLectureString(element.lecture);
                            }, this);
                        } else
                            results2 = [];

                        if (results3 != null) {
                            results3 = results3.filter(function (n) {
                                return n !== null;
                            });
                            results3.forEach(function (element) {
                                if (element.begin != null)
                                    element.begin = element.begin.substring(0, 5);
                                if (element.end != null)
                                    element.end = element.end.substring(0, 5);
                                if (element.lecture != null)
                                    element.lectureString = mapGetLectureString(element.lecture);
                            }, this);
                        } else
                            results3 = [];

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
            database.getCurrentAppointmentByStudyGroup(JSON.parse(storageManager.getItem(true, 'userData')).Studiengruppe, function (data1) {
                // Anwesende Studenten
                database.getCurrentAppointmentByStudyGroup(JSON.parse(storageManager.getItem(true, 'userData')).Studiengruppe, function (data2) {
                    var results1 = [];
                    var results2 = [];

                    if (results1 != null) {
                        results1 = results1.filter(function (n) {
                            return n !== null;
                        });
                        results1.forEach(function (element) {
                            if (element.begin != null)
                                element.begin = element.begin.substring(0, 5);
                            if (element.end != null)
                                element.end = element.end.substring(0, 5);
                            if (element.lecture != null)
                                element.lectureString = mapGetLectureString(element.lecture);
                        }, this);
                    } else
                        results1 = [];

                    if (results2 != null) {
                        results2 = results2.filter(function (n) {
                            return n !== null;
                        });
                        results2.forEach(function (element) {
                            if (element.begin != null)
                                element.begin = element.begin.substring(0, 5);
                            if (element.end != null)
                                element.end = element.end.substring(0, 5);
                            if (element.lecture != null)
                                element.lectureString = mapGetLectureString(element.lecture);
                        }, this);
                    } else
                        results2 = [];

                    // myPageContentDozent
                    myApp.template7Data.dozent = results1;
                    myApp.template7Data.dozent.students = results2;
                    $$('.page[data-page="index"] .page-content .myPageContentDozent').html(Template7.templates.dozentenTemplate(results1));
                });
            });
        }
        myApp.pullToRefreshDone();
    }

    batiming.getTemplateDataAttendance = function () {
        database.getAppointmentList(-3, JSON.parse(storageManager.getItem(true, 'userData')).Studiengruppe, function (data3) {
            var results1 = data1;

            if (results1 != null) {
                results1 = results1.filter(function (n) {
                    return n !== null;
                });
                results1.forEach(function (element) {
                    if (element.begin != null)
                        element.begin = element.begin.substring(0, 5);
                    if (element.end != null)
                        element.end = element.end.substring(0, 5);
                    if (element.lecture != null)
                        element.lectureString = mapGetLectureString(element.lecture);
                }, this);
            } else
                results1 = [];

            myApp.template7Data.attendance = results1;
            $$('.page[data-page="attendance"] .page-content .list-block').html(Template7.templates.attendanceTemplate(results1));
        });
    }



    $$('.panel-close').on('click', function (e) {
        myApp.closePanel();
    });

    $$('.pull-to-refresh-content').on('refresh', function () {
        batiming.getTemplateData();
    });

    return batiming;
}());