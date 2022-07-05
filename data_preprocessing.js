// import event from 'event';
// Assume data is in timelineData
// This class takes the javascript array data and turns it into a sorted

let modelEvents = [];

// Faster lookup to see if period already exists
let periods = new Map();

// Place events in a period
// Converts raw data from javascript array into event objects and creates periods.
timelineData.forEach(function (eventData) {
    if (eventData.start_date_year == null || eventData.text_headline == null) {
        return;
    }
    // Only load subset for testing
    // if (eventData.start_date_year >= 2000 || eventData.start_date_year <= 1000) {
    //     return;
    // }

    let start_date = new oldDate(eventData.start_date_year, eventData.start_date_month, eventData.start_date_day);
    let end_date = new oldDate(eventData.end_date_year, eventData.end_date_month, eventData.end_date_day);

    eventData.text_headline = eventData.text_headline.replace(/(\r\n|\n|\r)/gm, "");
    let event = new Event(start_date, eventData.text_headline, end_date, eventData.text_text);


    // We already made a period for this event.
    if(periods.has(eventData.text_headline)){

        let indexFound = modelEvents.findIndex(function(oldEvent){
            return oldEvent.title === eventData.text_headline;
        });
        // Periods have no field that always distingueshes them from normal events
        // Take the event we have, and wrap it in a period, as apparently it's a period
        event = new Period(start_date, eventData.text_headline, end_date, eventData.text_text, modelEvents[indexFound].subEvents);

        console.assert(indexFound !== -1, "period has event, but could not find it in modelEvents");

        // Replace
        modelEvents[indexFound] = event;
        periods.set(eventData.text_headline, event);
    } else{
        modelEvents.push(event);
    }


    if (eventData.period != null){
        // This only checks if period hasn't been previously made, does not check if it will be made by following arrays
        if(!periods.has(eventData.period)){
            let indexFound = modelEvents.findIndex(function(oldEvent){
                return oldEvent.title === eventData.period;
            });

            if(indexFound === -1){

                let newPeriod = new DefaultPeriod(event, eventData.period);
                periods.set(eventData.period, newPeriod);
                modelEvents.push(newPeriod);
                periods.get(eventData.period)
            } else {
                // We already have an event that is named for this period
                // But it is not yet a Period, just created as event
                // Convert it into a period so that it can have subevents
                let primaryEvent = modelEvents[indexFound];
                let period = new Period(primaryEvent.start_date, primaryEvent.title, primaryEvent.end_date, primaryEvent.description);
                modelEvents[indexFound] = period;
                periods.set(primaryEvent.title, period);
            }

        } else {
            // periods.get(eventData.period).addEvent(event);
        }
        periods.get(eventData.period).addEvent(event);
    }
});

// Ensure events are sorted
modelEvents.sort(Event.comparefunction);