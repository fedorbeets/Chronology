Chronology
============

## Overview
This project displays events on a timeline. The purpose is to more easily visualise when events happen, how much time falls between different events and which events happen concurrently.

It was inspired by projects such as NUKnightLab's TimelineJS3, though this project is intended to visualise a larger amount of events, such as over a 1000 events, occuring on timescales of thousands of years. 

A second main feature of this project is allow 'unfoldable' periods, which can be expanded to show all their underlying events. Thus easily dealing with small periods that have a large number of events. Some periods of history may be worked out in much more detail than others, and a large number of visible markers would cause visual overcrowding.
For example this could involve a very detailed overview of the French revolution, which takes up a small period of years, but has much more detail than some other centuries, and when fully expanded would clog the view of the entire period. Folding all events under a 'french revolution' period means this section can be viewed on a larger overview without the chaos of a hundred small events.

Chronlogy is written in plain javascript (ES6), with no libraries.


## How to use

The project can be cloned, then the main Chronology.js file can be used to visualise your timeline data.

To display your own data, it must be inserted under data/timeline_data.js  .


## Update data

Run /data/$./docsToJS.sh
This will copy over the data from the google doc to the javascript array format.


## Data format
The timeline_data.js file consists of one large javascript array called timelineData containing all events to be displayed.

Every event is an object that must have atleast two properties, start_date_year and text_headline, all other values are optional.

The supported values are:
start_date_year: a string containing the year, negative for bc.
start_date_month: a month, as a string with a number.
start_date_day: The day the event starts, as a string containing a number.

These have mirrors in end_date_year, end_date_month, end_date_day. Which again, are optional.

text_headline: A string that gives the name of the event, which will be displayed on the timeline.
text_text: A string with a longer piece of text that describes the event that will be displayed once the event is highlighted.

period: A string containing a text_headline of a different event, or the name of the period. All events with the same period will be grouped together into a single event that can be expanded. If there is an event whose text_headline matches the period, then it's text_text will be displayed upon highlighting.
