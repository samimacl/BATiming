var timeManager = (function () {
    let timeManager = {};

    let state = 0;

    function isDateInLecture(lectureDate) {
        let now = new Date(Date.now());
        return lectureDate.from <= now && lectureDate.end >= now;
    };

    timeManager.startWorkflow = async function () {
        if (state > 0)
            throw Error('Workflow already started.');
        let currentLecture = JSON.parse(storageManager.getItem(true, 'currentLecture'));
        if (currentLecture === null) {
            let user = JSON.parse(storageManager.getItem(true, 'userData'));
            database.getCurrentLectureKeyByStudyGroup(user.Studiengruppe, function (data) {
                console.log(data);
                //check if data is null --> error
                // storageManager.setItem(true, 'currentLecture', data); --> check data structure
            });
        } else {
            if (isDateInLecture(currentLecture)) {
                myApp.addNotification({
                    "title": 'error',
                    "message": 'Already signed in to lecture'
                });
                throw Error("Already signed in to lecture:" + "\n" + JSON.stringify(currentLecture));
            }
        }
        this.state++;
    }

    timeManager.bookTimeEntry = async function (pluginResult) {
        if (this.state = 1) {
            console.log("Begin saving time entry");
            //Database.Save....
            //make <p> visible with detail Information, button moves slower down with animation und got disabled
            // if succesfull:
            this.state++;
            let bookedData = [];
            timeManager.writeHistoryEntry(bookedData);
        }
    }

    timeManager.writeHistoryEntry = async function (bookedData) {
        if (this.state == 2) {
            //write history entry  
            this.state++;
            timeManager.stopWorkflow();
        }
    }

    timeManager.stopWorkflow = function () {
        this.state = 0;
        console.log('Workflow stopped...');
    }

    return timeManager;
})();