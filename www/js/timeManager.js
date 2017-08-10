var timeManager = (function () {
    let timeManager = {};

    timeManager.state = 0;

    timeManager.startWorkflow = async function () {
        if (timeManager.state > 0)
            throw Error('Workflow already started.');
        // check, whether localStorage for lesson is stored
        // if not, load data through database object
        let id = 'BATimingTest';
        let data = await storageManager.getItem(id);

        /* 
        if (data == null)
            Database.load...
        */
        timeManager.state++;
        return data;
    }

    return timeManager;
})();