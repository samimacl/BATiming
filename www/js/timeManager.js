/* ----------------------------------------------------------------------------- 
 *
 *   timeManager.js - Funktionen die zeitliche Erfassung.
 *
 *   (c) 2017 WS14-II - Tobias Groß, Sascha Knöchel, Andreas Garben, Atiq Butt
 *
 *  ------------------------------------------------------------------------- */

var timeManager = (function () {
    let timeManager = {};

    timeManager.state = 0;

    function isDateInLecture(appointment) {
        let now = new Date(Date.now());
        let nowTime = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
        return appointment.end >= nowTime && appointment.begin <= nowTime;
    };

    function getTimestamp() {
        let now = new Date(Date.now());
        let timestamp = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + 'T' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
        return timestamp;
    };

    timeManager.startWorkflow = async function () {
        console.log('Init state: ' + this.state);
        if (this.state > 0)
            showNotification('Hint', 'Workflow already started.', true);

        let currentLecture = storageManager.getItem(true, 'currentAppointmentByStudyGroup');
        if (currentLecture != null && JSON.parse(currentLecture)[0] != null) {
            this.state++;
            console.log('State is: ' + this.state);
        } else {
            showNotification('Error', 'No current lecture!', true);
        }
    }

    timeManager.bookTimeEntry = async function (pluginResult) {
        console.log('State bookTimeEntry: ' + this.state);
        if (this.state = 1) {
            console.log("Begin saving time entry");
            let excusedFlag = '0';
            let remark = '';
            let timestamp = getTimestamp();
            let roomDesc = '202';
            try {
                let user = JSON.parse(storageManager.getItem(true, 'userData'));
                let currentLecture = JSON.parse(storageManager.getItem(true, 'currentAppointmentByStudyGroup'))[0];
                let isApproved = false;
                let personID = 'Person_' + database.getCurrentUserID();
                
                await database.lectureIsReleased(currentLecture.appointment, async (data) => {
                    isApproved = data != null ? data : false;

                    //Student
                    if (user.Rolle == "0" && isApproved) {
                        showNotification('Hint', 'Vorlesung bereits begonnen, bei Verwaltung melden.', false);
                        remark = 'Unentschuldigte Verspätung!';
                    }
                    
                    if (user.Rolle == "1" && !isApproved)
                        await database.releaseLectureHistoryEntry(currentLecture.appointment, personID, timestamp);
                });

                await database.personHistoryEntryExists(currentLecture.appointment, personID, async(data) => {
                    let result = data != null ? data : false;
                    if (result != null && !result) {
                        await database.bookLectureHistoryPersonEntry(currentLecture.appointment, personID, '0', remark, timestamp);
                        this.state++;
                        await database.bookHistoryEntry(personID, currentLecture.lecture, currentLecture.appointment, roomDesc, remark, excusedFlag, timestamp);
                        this.state++;
                    } else {
                        showNotification('Hint', 'Anwesenheit bereits gebucht.', false);
                    }
                });
            } catch (e) {
                showNotification('Error', e.message, true);
            }

            console.log('State end of booking: ' + this.state);
            this.stopWorkflow();
        }
    }

    timeManager.stopWorkflow = function () {
        this.state = 0;
        myApp.hidePreloader();
        console.log('Workflow stopped...');
    }

    return timeManager;
})();