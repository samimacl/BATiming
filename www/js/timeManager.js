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
    timeManger.timeManager.bookingData = null;

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
        if (currentLecture != null && JSON.parse(currentLecture)[0] !== undefined) {
            timeManager.bookingData = JSON.parse(currentLecture)[0];
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
                let isApproved = false;
                await database.lectureIsReleased(timeManager.bookingData.appointment, function (data) {
                    isApproved = data != null ? data : false;
                });
                
                //Student
                if (user.Rolle == "0" && isApproved) {
                    showNotification('Hint', 'Vorlesung bereits begonnen, bei Verwaltung melden.', false);
                    remark = 'Unentschuldigte Verspätung!';
                }

                if (user.Rolle == "1" && !isApproved)
                    await database.releaseLectureHistoryEntry(timeManager.bookingData.appointment, database.getCurrentUserID(), timestamp);

                let personID = "Person_" + database.getCurrentUserID();
                await database.personHistoryEntryExists(timeManager.bookingData.appointment, personID, async function (data) {
                    let result = data != null ? data : false;
                    if (result != null && !result) {
                        await database.bookLectureHistoryPersonEntry(timeManager.bookingData.appointment, personID, '0', remark, timestamp);
                        this.state++;
                        await database.bookHistoryEntry(database.getCurrentUserID(), timeManager.bookingData.lecture, timeManager.bookingData.appointment, roomDesc, remark, excusedFlag, timestamp);
                        this.state++;
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
        timeManager.bookingData = null;
        console.log('Workflow stopped...');
    }

    timeManager.getBookingData = function () {
        return timeManager.bookingData;
    }

    return timeManager;
})();