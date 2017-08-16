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

    function isDateInLecture(lectureDate) {
        let now = new Date(Date.now());
        return lectureDate.from <= now && lectureDate.end >= now;
    };

    timeManager.startWorkflow = async function () {
        if (state > 0) {
            let message = 'Workflow already started.';
            myApp.addNotification({
                "title": 'Hint',
                "message": message
            });
            throw Error(message);
        }
        
        let currentLecture = JSON.parse(storageManager.getItem(true, 'currentLecture'));
        if (currentLecture === null) {
            let user = JSON.parse(storageManager.getItem(true, 'userData'));
            database.getCurrentLectureKeyByStudyGroup(user.Studiengruppe, function (data) {
                if (data == null) {
                    let message = 'No data found';
                    myApp.addNotification({
                        "title": 'Error',
                        "message": message
                    });
                    throw new Error(message);
                }
                storageManager.setItem(true, 'currentLecture', data);
            });
        }

        if (isDateInLecture(currentLecture)) {
            myApp.addNotification({
                "title": 'error',
                "message": 'Already signed in to lecture'
            });
            throw Error("Already signed in to lecture:" + "\n" + JSON.stringify(currentLecture));
        }
    }
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