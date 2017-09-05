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
        swipePanel: 'left',
        precompileTemplates: true,
        template7Pages: true,
    });

    // Add view
    var mainView = myApp.addView('.view-main', {
        // Because we want to use dynamic navbar, material design doesn't support it.
        dynamicNavbar: true,
    });

    // Handle Cordova Device Ready Event
    $$(document).on('deviceready', function () {
        console.log("Device is ready!");
        beacon.initialize();

        /* cordova.plugins.backgroundMode.enable();
         if (batiming.isAndroid)
             cordova.plugins.backgroundMode.overrideBackButton(); */
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
                        beacon.stopScanForBeacon(beacon.beaconRegion);
                        timeManager.stopWorkflow();
                        myApp.hidePreloader();
                        //showNotification('Timeout', 'A timeout occured while scanning for iBeacon', true);
                    }
                }, 10000))
                .catch(function (e) {
                    console.log(e)
                    timeManager.stopWorkflow();
                });
        } finally {
            //beacon.stopScanForBeacon(beacon.beaconRegion);
        }
    });

    myApp.onPageInit('settings', function (page) {
        // Get Studiengruppen
        JSON.parse(storageManager.getItem(true, 'studyGroupMap')).forEach(function (element) {
            myApp.smartSelectAddOption('.smart-select select', '<option value = "' + element.key + '">' + element.value + '</option>');
        }, this);
        var formData = JSON.parse(storageManager.getItem(true, 'userData'));
        formData.email = database.getUsersMailaddress();
        myApp.formFromData('#my-form', formData);
    });

    myApp.onPageInit('attendance', function (page) {
        batiming.getTemplateDataAttendance();

        $$('.pull-to-refresh-content').on('refresh', function () {
            batiming.getTemplateDataAttendance();
        });
    });

    myApp.onPageInit('index', function (page) {
        $$('.pull-to-refresh-content').on('refresh', function () {
            batiming.getTemplateData();
        });
        batiming.getTemplateData();
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
            console.log("Settings --> Keine Änderungen");
        }
    });

    batiming.initMaps = function () {
        database.getStudyGroups(function (data) {
            storageManager.changeItem(true, 'studyGroupMap', data)
        });
        database.getLectureTitles(function (data) {
            storageManager.changeItem(true, 'lectureMap', data);
        });
        database.getPersonNames(function (data) {
            storageManager.changeItem(true, 'personMap', data);
        });
    }

    function findAndRemove(array, property, value) {
        array.forEach(function (result, index) {
            if (result[property] === value) {
                //Remove from array
                array.splice(index, 1);
            }
        });
    }

    function searchElementInStorageManager(key, itemName) {
        if (storageManager.getItem(true, itemName) != null) {
            var searchedElement = JSON.parse(storageManager.getItem(true, itemName)).find(function (item) {
                return item.key == key;
            });
            return searchedElement;
        }
        return null;
    };

    function mapGetString(id, mapName) {
        if (id != null) {
            var result = searchElementInStorageManager(id, mapName)
            if (result != null)
                return result.value;
            return null;
        }
        return null;
    }

    function sortByKey(data) {
        var keys = [];
        var result = [];

        data.forEach(function (element) {
            keys.push(element.appointment);
        });
        keys.sort();
        for (var i = 0; i < keys.length; i++) {
            result.push(data.find(function (item) { return item.appointment == keys[i] }));
        }
        return result.reverse();
    }

    function prepareTemplateData(rolle, inputData) {
        var result = [];
        if (inputData != null) {
            result = inputData;
            if (rolle == 0) {
                if (inputData instanceof Array) {
                    result = result.filter(function (n) {
                        return n !== null;
                    });
                    result.forEach(function (element) {
                        if (element.begin != null && element.end != null)
                            element.timeString = element.begin.substring(0, 5) + "-" + element.end.substring(0, 5);

                        if (element.lecture != null) {
                            element.lectureString = mapGetString(element.lecture, "lectureMap");
                            element.dozentenString = mapGetString(searchElementInStorageManager(element.lecture, "lectureMap").dozentID, "personMap");
                        }
                        if (element.date != null) {
                            var d = new Date(element.date)
                            element.dateString = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
                        }
                    }, this);
                }
                // else {
                //     if (result.begin != null && result.end != null)
                //         result.timeString = result.begin.substring(0, 5) + "-" + result.end.substring(0, 5);

                //     if (result.lecture != null) {
                //         result.lectureString = mapGetString(result.lecture, "lectureMap");
                //         result.dozentenString = mapGetString(searchElementInStorageManager(result.lecture, "lectureMap").dozentID, "personMap");
                //     }
                //     if (element.date != null) {
                //         var d = new Date(element.date)
                //         element.dateString = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
                //     }
                // }
            } else {
                if (inputData instanceof Array) {
                    result = result.filter(function (n) {
                        return n !== null;
                    });
                    result.forEach(function (element) {
                        if (element.Kommt != null)
                            element.timeString = element.Kommt.substring(element.Kommt.length - 8, element.Kommt.length);
                        if (element.Person_ID != null) {
                            element.personString = mapGetString(element.Person_ID, "personMap");
                        }
                        if (element.Entschuldigt != null) {
                            if (element.Entschuldigt == 1) {
                                element.entschuldigtString = element.Bemerkung
                            }
                        }

                    }, this);
                }
            }
            return result;
        }
        return result;
    }

    batiming.getTemplateData = function () {
        // Aktueller Termin
        if (JSON.parse(storageManager.getItem(true, 'userData')).Rolle == 0) {
            // Aktuelle Vorlesung
            database.getCurrentAppointmentByStudyGroup(JSON.parse(storageManager.getItem(true, 'userData')).Studiengruppe, function (data1) {
                // Zukünftige Vorlesungen
                database.getAppointmentList(5, JSON.parse(storageManager.getItem(true, 'userData')).Studiengruppe, function (data2) {
                    // Letzte Einträge
                    database.getAppointmentList(-3, JSON.parse(storageManager.getItem(true, 'userData')).Studiengruppe, function (data3) {

                        if (data1 != null && data2 != null) {
                            if (data1[0] != undefined) {
                                findAndRemove(data2, "appointment", data1[0].appointment)
                                var searchedElement = data2.find(function (item) {
                                    return item.date == data1[0].date;
                                });
                                if (searchedElement != null) {
                                    data3.unshift(searchedElement);
                                    data3 = sortByKey(data3);
                                    if (data3.length == 4)
                                        delete data3[(data3.length - 1)]
                                    findAndRemove(data2, "date", data1[0].date)
                                }
                            }
                        }

                        storageManager.changeItem(true, 'currentAppointmentByStudyGroup', data1);

                        var results1 = prepareTemplateData(0, data1);
                        var results2 = prepareTemplateData(0, data2);
                        var results3 = prepareTemplateData(0, data3);

                        // CurrentLecture
                        myApp.template7Data.student = results1;
                        myApp.template7Data.student.studentNextEntry = results2;
                        myApp.template7Data.student.studentLastEntry = results3;
                        $$('.page[data-page="index"] .page-content .myPageContent').html(Template7.templates.studentenTemplate(results1));
                    });
                });
            });
        } else {
            // Vorlesung Akttuell
            database.getCurrentAppointmentByStudyGroup(JSON.parse(storageManager.getItem(true, 'userData')).Studiengruppe, function (data1) {
                // Anwesende Studenten
                storageManager.changeItem(true, 'currentAppointmentByStudyGroup', data1);
                if (data1[0] != undefined) {
                    database.getLectureAttendanceListByAppointmentKey(data1[0].appointment, function (data2) {
                        var results1 = prepareTemplateData(0, data1);
                        var results2 = prepareTemplateData(1, data2);

                        // myPageContentDozent
                        myApp.template7Data.dozent = results1;
                        myApp.template7Data.dozent.students = results2;
                        $$('.page[data-page="index"] .page-content .myPageContent').html(Template7.templates.dozentenTemplate(results1));
                    });
                }

            });
        }
        myApp.pullToRefreshDone();
    }

    batiming.getTemplateDataAttendance = function () {
        database.getLectureAttendanceListByPersonKey("Person_" + database.getCurrentUserID(), function (data) {
            if (data != null) {
                var result = data;

                result = result.filter(function (n) {
                    return n !== null;
                });
                result.forEach(function (element) {
                    if (element.Vorlesung_ID != null) {
                        element.lectureString = mapGetString(element.Vorlesung_ID, "lectureMap");
                        element.dozentenString = mapGetString(searchElementInStorageManager(element.Vorlesung_ID, "lectureMap").dozentID, "personMap");
                    }
                    if (element.Entschuldigt != null) {
                        if (element.Entschuldigt == 1) {
                            element.entschuldigtString = element.Bemerkung
                        }
                    }
                    if (element.Kommt != null) {
                        var dateString, timeString, parts, d = null;

                        parts = element.Kommt.split('T');
                        dateString = parts[0];
                        timeString = parts[1];

                        if (timeString != null){
                            if (timeString.length != 8) {
                                parts = timeString.split(':');
                                if (parts[1].length == 1) {
                                    parts[1] = "0" + parts[1]
                                }
                                if (parts[2].length == 1) {
                                    parts[2] = "0" + parts[2]
                                }
                                if (parts[3].length == 1) {
                                    parts[3] = "0" + parts[3]
                                }
                                timeString = parts[0] + ":" + parts[1] + ":" + parts[2]
                            }
                        }
                        element.timeString = timeString;

                        if (dateString != null) {
                            if (dateString.length == 10) {
                                d = new Date(element.Kommt)
                            } else {
                                parts = dateString.split('-');
                                if (parts[1].length == 1) {
                                    parts[1] = "0" + parts[1]
                                }
                                if (parts[2].length == 1) {
                                    parts[2] = "0" + parts[2]
                                }
                                dateString = parts[0] + "-" + parts[1] + "-" + parts[2] + "T" + element.timeString
                                d = new Date(dateString)
                            }
                        }
                        element.dateString = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
                    }
                });

                myApp.template7Data.attendance = result;
                $$('.page[data-page="attendance"] .page-content .list-block').html(Template7.templates.attendanceTemplate(result));
            }
        });
        myApp.pullToRefreshDone();
    }

    $$('.panel-close').on('click', function (e) {
        myApp.closePanel();
    });

    $$('.pull-to-refresh-content').on('refresh', function () {
        batiming.getTemplateData();
    });

    return batiming;
}());