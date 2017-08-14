var timeManager = (function () {
    let timeManager = {};

    let state = 0;

    function isDateInLecture(checkDate) {
        let now = Date().now;
        let date = Date(checkDate);
        return date <= now;
    };

    timeManager.startWorkflow = async function () {
        if (state > 0)
            throw Error('Workflow already started.');
        // check, whether localStorage for lesson is stored
        // if not, load data through database object
        let currentLecture = storageManager.getItem(true, 'currentLecture');
        if (currentLecture === null) {
            let user = JSON.parse(storageManager.getItem(true, 'userData'));
            database.getCurrentLectureKeyByStudyGroup(user.Studiengruppe, function (data) {
                console.log(data);
            });
        } else {
            // if (isDateInLecture(current))
        }
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
        timeManager.state = 0;
        console.log('Workflow stopped...');
    }

    return timeManager;
})();