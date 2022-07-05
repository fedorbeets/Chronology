// Event listeners to be added
window.addEventListener('resize', function () {
    timelineDragger.updateBounds();
});

// Arbitrarily chosen acceptable background colours for markers
const acceptableBackgroundColours = ['antiquewhite', 'aquamarine', 'burlywood', 'cadetblue', 'coral', 'cornflowerblue', 'cyan', 'darksalmon',
    'darkseagreen', 'gold', 'lightpink', 'khaki', 'lightsalmon', 'lightcyan', 'lightgreen', 'lightblue', 'lightyellow', 'yellowgreen']

let modelToView = function(){
    let template = document.getElementById('timeline-template').innerHTML,
        articleOutput = document.getElementById('article-output'),
        articleOuter = document.createElement('div');


    // Rotate through every available colour in acceptable background colours
    let periodColourCounter = 0;
    modelEvents.forEach(function(event, index, array){

        const tickAppropriate = document.getElementById(event.start_date.year);

        const connectTickBox = document.createElement('connectTickBox');
        connectTickBox.classList.add('timeline-marker-line');
        connectTickBox.id = event.title + " marker-line";
        tickAppropriate.appendChild(connectTickBox);
        // Offset tickbox to show months/days
        connectTickBox.yearoffset = event.start_date.partOfYear();
        connectTickBox.style.left = `calc(var(--tick-width)* ${connectTickBox.yearoffset})`;

        // populate list of years
        const markerTextContainer = document.createElement('markerTextContainer');
        markerTextContainer.classList.add('timeline-markerTextContainer');
        markerTextContainer.id = event.title;
        connectTickBox.appendChild(markerTextContainer);

        const markerText = document.createElement('marker-text');
        markerText.classList.add('marker-text');
        markerTextContainer.appendChild(markerText);
        markerText.innerHTML = event.title;


        const markerLines = document.createElement('markerLines');
        connectTickBox.appendChild(markerLines);
        // If it has an ending
        if (event.end_date.year != null) {
            let yearDifference = event.start_date.differenceTwoDates(event.end_date);
            markerLines.classList.add('timeline-marker-line-both');
            // The 2px offset the edges, so that the borders are not on the inside of the marker but actually touching the edges
            markerLines.style.width = `calc(${yearDifference} * var(--tick-width) + 1px)`;
            markerTextContainer.style.width = `calc(${yearDifference} * var(--tick-width))`;
            // markerTextContainer.style.minWidth = `calc(${yearDifference} * var(--tick-width))`;



        } else {
            markerLines.classList.add('timeline-marker-line-left');
            markerTextContainer.classList.add('timeline-markerTextContainerNonPeriod');

        }

        if (event instanceof Period){
            let collapsableIcon = document.createElement('callapsableIcon');
            collapsableIcon.classList.add('time-period');
            markerTextContainer.insertBefore(collapsableIcon, markerText);
            markerTextContainer.classList.add('time-period-container');
            markerTextContainer.addEventListener('dblclick', function(e){
                let target = e.target;
                if (target && target.nodeName === 'MARKERTEXTCONTAINER') {
                    target = target.lastChild;
                    // target = target.parentElement.parentElement;
                }
                if (target.nodeName === 'CALLAPSABLEICON'){
                    target = target.parentElement.lastChild;
                }

                // target should be Marker-Text
                // Works because innerHTML is set as event.title, same as the key in periods
                expandPeriod(periods.get(target.innerHTML));
            });

            if(markerTextContainer.style.backgroundColor === '' && markerTextContainer.style.backgroundImage === ''){
                markerTextContainer.style.backgroundColor = acceptableBackgroundColours[periodColourCounter % acceptableBackgroundColours.length];
                periodColourCounter += 1;
            }
        }


        // populate articles
        const articleEl = document.createElement('article');


        articleEl.innerHTML = template;
        articleEl.id = 'article-' + markerTextContainer.id;

        // Faster than the more dynamic query lookup
        const articleContent = articleEl.children[0].children[1];
        const articleHeading = articleContent.children[0];
        const articleText = articleContent.children[1];


        articleHeading.innerHTML += event.title;
        let datestring = event.start_date + "";

        if (event.end_date.year != null) {
            datestring += " till " + event.end_date;
        }
        let description = "<b>" + datestring + "</b>";
        if (event.description != null) {
             description += " <br>" + event.description;
        }
        articleText.innerHTML = description;

        articleOuter.classList.add('article--outer');
        articleOuter.id = 'article--outer';
        articleOuter.appendChild(articleEl);


        // Ugly click on last element
        // if (index === array.length - 1) {
        //     setTimeout(function () {
        //         markerText.click();
        //         // tickAppropriate.firstElementChild.click();
        //     }, 0);
        // }


    });
    articleOutput.appendChild(articleOuter);
};

