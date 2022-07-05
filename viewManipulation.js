// Namespace


let timelineDragger = function timelineDragger() {
    let velocityX = 0,
        // starting position,
        positionX = 0,
        friction = 0.92,
        isDragging = false,
        // we need to keep track of whether the timeline is sliding automatically, so we know not to interfere with it
        autoDragging = false,
        dragPositionX = positionX,
        rightBound = 0,
        //is immediate problem
        leftBound = 0,
        mousedownX = void 0,
        dragStartPositionX = void 0,
        zoomFactor = 1.2,
        longEventsInViewCache = new Map();

    function update() {
        // if (velocityX > 0.001){
        //
        // } else{
        // }
        velocityX *= friction;
        //applyLeftBoundForce();
        applyBoundForce();
        applyDragForce();
        positionX += velocityX;
        // if(0.00001 > velocityX ){
        //     velocityX = 0;
        // }
    }

    function applyForce(force) {
        velocityX += force;
    }

    function goToPositionRel(distance) {
        autoDragging = true;

        // Magic number for dragging to about middle of screen
        const forceCenter = 0.087;
        const force = distance * forceCenter;
        applyForce(force);
    }

    // Stops scrolling past edge.
    function applyBoundForce() {
        if (autoDragging || isDragging) {
            return;
        }
        // TODO; rework so magic number is unecessary. Say scroll to last child of navbar
        // Magic number for about right scrolling once clicked on
        const forceMultiplier = 0.01;

        if (positionX < rightBound) {
            const force = (rightBound - positionX) * forceMultiplier;
            applyForce(force)
        }

        if (positionX > leftBound) {
            const force = (leftBound - positionX) * forceMultiplier;
            applyForce(force);
        }
    }


    function applyDragForce() {
        if (!isDragging) {
            return;
        }

        // check if inertia has stopped
        if (Math.floor(Math.abs(velocityX)) === 0) {
            autoDragging = false;
        }

        const dragVelocity = dragPositionX - positionX,
            dragForce = dragVelocity - velocityX;

        applyForce(dragForce);
    }

    timelineDragger.moveToMarker = function(target){
        target = getMarkerTextContainer(target);
        selectMarker(target);
        timelineDragger.gotoObject(target);
    };

    function selectMarker(makerTextContainer){

        if (!!sliderContainer.querySelector('.active')) {
            // remove previously selected item, and add it to new one
            sliderContainer.querySelector('.active').classList.remove('active');
        }
        makerTextContainer.classList.add('active');
        showSelectedArticle(makerTextContainer.id);

    }


    timelineNav.addEventListener('click', function (e) {
        e.preventDefault();
        // Prevent a click event from firing on doubleclicks
        if(e.detail > 1) {
            return;
        }

        let target = getMarkerTextContainer(e.target);

        if (target && target.nodeName === 'MARKERTEXTCONTAINER') {
            selectMarker(target);
        }
    });

    document.addEventListener('keydown', function(e) {
        switch (e.key){
            case "ArrowLeft":
                previousMarker();
                break;
            case "ArrowRight":
                nextMarker();
                break;
            default: return;
        }
    });


    sliderOutput.addEventListener('mousedown', function (e) {
        isDragging = true;
        autoDragging = false;
        sliderOutput.classList.add('dragging');
        mousedownX = e.pageX;
        dragStartPositionX = positionX;
        setDragPosition(e);
        window.addEventListener('mousemove', setDragPosition);
        window.addEventListener('mouseup', onMouseup);
    });

    function getMarkerTextContainer(target){
        if (target && target.nodeName === 'MARKER-TEXT' || target.nodeName === "CALLAPSABLEICON") {
            target = target.parentElement;
        }
        return target;
    }


    function setDragPosition(e) {
        const moveX = e.pageX - mousedownX;
        dragPositionX = dragStartPositionX + moveX;
        e.preventDefault();
    }

    function onMouseup() {
        isDragging = false;
        sliderOutput.classList.remove('dragging');
        window.removeEventListener('mousemove', setDragPosition);
        window.removeEventListener('mouseup', onMouseup);
    }


    function animate() {
        update();


        // if (Math.floor(Math.abs(velocityX)) !== 0) {
            sliderContainer.style.transform = 'translateX(' + positionX + 'px)';
            // Uncomment to enable the text of long events sliding in view. Still slows down the entire window.
        //     slideLongEventText();
        // }
        requestAnimationFrame(animate);
    }


    // TODO BUG: messed up zooming, so that it now moves to a random spot on the timeline when zooming.
    // TODO; optimize somewhat by for example using caching so that fps gets better again
    function slideLongEventText(){
        let to_move = longEventsInView();

        for(let event of to_move){
            let text = event.parentNode.children[0].children[0];
            // console.log("Velocity: ", velocityX * -1);
            const start_year = event.parentNode.parentNode.id;
            let pixelsOfYear = tickToOffset(start_year);
            let toCurrent = (positionX * -1) - pixelsOfYear;

            const event_name = event.parentNode.innerText;
            let event_data = modelEvents.find(function(event
            ){
                return event.title === event_name;
            });
            let end_year = event_data.end_date.year;
            let pixelsToEndYear = (positionX) + tickToOffset(end_year);
            let previousMargin = text.style.marginLeft.slice(0,-2);
            // Prevent text disappearing to the right side. Keep slight margin where it stops.
            switch (true){
                case pixelsToEndYear  < (text.offsetWidth + window.innerWidth/30):
                    // Could also break out of function hear, but don't want multiple exits out.
                    toCurrent = previousMargin;
                    break;
                case toCurrent > -20:
                    toCurrent += window.innerWidth/50;
                    break;
                default:
                    // If tick is on screen, text should stick to it's left side.
                    toCurrent = 0;
            }


            // Add some space so label does not start immediately on left side of screen
            text.style.marginLeft = toCurrent + 'px';

        }
    }

    function nextMarker(){
        let activeMarker = sliderContainer.querySelector('.active');
        let newTarget = findAdjacentMarker(activeMarker, true);
        timelineDragger.moveToMarker(newTarget);
    }

    function previousMarker(){
        let activeMarker = sliderContainer.querySelector('.active');
        let newTarget = findAdjacentMarker(activeMarker, false);
        timelineDragger.moveToMarker(newTarget);
    }

    // Could cache for every possible start tick. Would need to update on zooms.
    function longEventsInView(){
        let current_tick = currentTick();
        let tick_size = findStyleSheet(':root').style.getPropertyValue("--tick-width").slice(0,-2);
        let longMarkersInView = [];

        if( longEventsInViewCache.has(current_tick) && longEventsInViewCache.get(current_tick)[0] === tick_size){
            longMarkersInView = longEventsInViewCache.get(current_tick)[1];
        } else{
            let EndingEvents = document.getElementsByClassName('timeline-marker-line-both');
            let EndEventsWithYear = [];
            // Since both event array and array of eventswithenddate are sorted by date, could do faster matching
            //  by matching all in a single run, and not starting anew every time one is found
            for(let event of EndingEvents){
                const event_name = event.parentNode.innerText;
                let event_data = modelEvents.find(function(event
                ){
                    return event.title === event_name;
                });
                EndEventsWithYear.push([event, event_data.end_date.year]);
            }
            // filter
            // TODO: seems to be shortenable by combining with that previous for loop
            for(let tuple of EndEventsWithYear){
                const start_year = tuple[0].parentNode.parentNode.id;
                const end_year = tuple[1];
                if( start_year <= current_tick && end_year >= current_tick){
                    longMarkersInView.push(tuple[0]);
                }
            }
            longEventsInViewCache.set(current_tick, [tick_size, longMarkersInView]);
        }

        return longMarkersInView;
    }


    let zoomInButton = document.getElementById("zoom-in-button");
    zoomInButton.addEventListener('click', function(){
        // Bigger steps because clicking twice is harder than scrolling up twice.
        zoom(Math.pow(zoomFactor,2))
    });

    let zoomOutButton = document.getElementById("zoom-out-button");
    zoomOutButton.addEventListener('click', function(){
        zoom(Math.pow(1/zoomFactor, 2));
    });

    document.getElementById("navigation-back-button").addEventListener('click', function(){
        previousMarker()
    });

    document.getElementById("navigation-forward-button").addEventListener('click', function(){
        nextMarker()
    });


    // TODO:  Function is only here because the useful functions are here
    let gotoSubmitButton = document.getElementById('goto-submit-button');
    gotoSubmitButton.addEventListener('click', function () {
        let yearField = document.getElementById('year-form-text');

        // Zoom to appropriate year
        let tick = document.getElementById(yearField.value);
        console.assert(tick !== null, "Error, year is not valid");
        timelineDragger.gotoObject(tick);
    });

    // Lets you enter submit the search field.
    let yearForm = document.getElementById("year-form");
    yearForm.addEventListener('submit', function (e) {
        e.preventDefault();
        gotoSubmitButton.click();
    });


    // Middle event is more interesting than middle year
    timelineDragger.focusMiddleEvent = function() {
        let middleEvent = modelEvents[Math.floor(modelEvents.length / 2)];
        let middleTick = document.getElementById(middleEvent.start_date.year);
        setTimeout(function () {
            timelineDragger.moveToMarker(middleTick.children[1].children[0]);
        }, 50);
    };


    // Target must be a document element
    // waitTime is time to delay in ms
    timelineDragger.gotoObject = function (target) {
        let offset = target.getBoundingClientRect().x - (window.innerWidth / 2);
        goToPositionRel(-offset);
    };

    timelineDragger.updateBounds = function () {
        let leftPadding = parseInt(window.getComputedStyle(timelineNav).paddingLeft, 10);
        let rightPadding = parseInt(window.getComputedStyle(timelineNav).paddingRight, 10);
        rightBound = -timelineNav.offsetWidth + window.innerWidth - rightPadding;
        leftBound = leftPadding;
    };

    // Goes to object immediately, without moving through intermediate space
    timelineDragger.ftlDrive = function(target) {
        target = getMarkerTextContainer(target);
        let offset = target.getBoundingClientRect().x - (window.innerWidth / 2);
        positionX = positionX - offset;
    };

    timelineDragger.getCurrentPosition = function (){
        return positionX;
    };

    timelineDragger.setCurrentPosition = function(newPosition){
        positionX = newPosition;
    };


    timelineDragger.updateBounds();
    animate();
};