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
    let bookingData = null;

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
        if (state > 0)
            showNotification('Hint', 'Workflow already started.', true);

        bookingData = null;
        let isCached = false;
        let currentLecture = JSON.parse(storageManager.getItem(true, 'currentLecture'));
        if (currentLecture != null)
            isCached = isDateInLecture(currentLecture);

        if (!isCached) {
            let user = JSON.parse(storageManager.getItem(true, 'userData'));
            await database.getCurrentLectureKeyByStudyGroup(user.Studiengruppe, function (data) {
                if (data == null)
                    showNotification('Error', 'No data fonund.', true);

                bookingData = data;
                console.log(bookingData);
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
            if (bookingData == null)
                showNotification('Error', 'No booking data found', true);

            let excusedFlag = '0';
            let remark = 'Test';
            let timestamp = getTimestamp();
            let roomDesc = '203';
            try {
                await database.bookLectureHistoryPersonEntry(bookingData.appointment, database.getCurrentUserID(), '0', remark, timestamp);
                state++;
                await database.bookHistoryEntry(database.getCurrentUserID(), bookingData.lecture, bookingData.appointment, roomDesc, remark, excusedFlag, timestamp);
            } catch (e) {
                showNotification('Error', e.message, true);
            }

            state++;
            this.stopWorkflow();
        }
    }

    timeManager.stopWorkflow = function () {
        state = 0;
        bookingData = null;
        console.log('Workflow stopped...');
    }

    timeManager.getBookingData = function () {
        return bookingData;
    }

    return timeManager;
})();