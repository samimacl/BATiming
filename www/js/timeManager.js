/* ----------------------------------------------------------------------------- 
 *
 *   timeManager.js - Funktionen die zeitliche Erfassung.
 *
 *   (c) 2017 WS14-II - Tobias Groß, Sascha Knöchel, Andreas Garben, Atiq Butt
 *
 *  ------------------------------------------------------------------------- */

var timeManager = (function () {
    let timeManager = {};

    let state = 0;

    function isDateInLecture(appointment) {
        let now = new Date(Date.now());
        return appointment.end <= now && appointment.end >= now;
    };

    timeManager.startWorkflow = async function () {
        if (state > 0)
            showNotification('Hint', 'Workflow already started.', true);

        let isCached = false;
        let currentLecture = JSON.parse(storageManager.getItem(true, 'currentLecture'));
        if (currentLecture != null)
            isCached = isDateInLecture(currentLecture);

        if (!isCached) {
            let user = JSON.parse(storageManager.getItem(true, 'userData'));
            database.getCurrentLectureKeyByStudyGroup(user.Studiengruppe, function (data) {
                if (data == null)
                    showNotification('Error', 'No data fonund.', true);

                let appointment = data;
                storageManager.changeItem(true, 'currentLecture', data);
            });
        }

        if (isCached)
            showNotification('Hint', 'Already signed in to lecture:' + '\n' + JSON.stringify(currentLecture), true);

        state++;
    }

    timeManager.bookTimeEntry = async function (pluginResult) {
        if (state = 1) {
            console.log("Begin saving time entry");
            //Database.Save....
            //make <p> visible with detail Information, button moves slower down with animation und got disabled
            // if succesfull:
            state++;
            let bookedData = [];
            timeManager.writeHistoryEntry(bookedData);
        }
    }

    timeManager.writeHistoryEntry = async function (bookedData) {
        if (state == 2) {
            //write history entry  
            state++;
            timeManager.stopWorkflow();
        }
    }

    timeManager.stopWorkflow = function () {
        state = 0;
        console.log('Workflow stopped...');
    }

    return timeManager;
})();