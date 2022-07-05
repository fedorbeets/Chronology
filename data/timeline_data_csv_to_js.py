    # Convert google doc spreadsheet format for timelinejs to json file
# useful if you want to experiment using google doc but eventually
# host everything yourself privately.

# Example: go to google docs spreadsheet and do File -> Download As -> CSV (Comma Separated Values)
# save as timeline.csv, run this, you get a timeline.json out
#
# Or look at your google doc ID long string like for example 1xTn9OSdmnxbBtQcKxZYV-xXkKoOpPSu6AUT0LXXszHo
# wget -qO timeline.csv 'https://docs.google.com/spreadsheets/d/1xTn9OSdmnxbBtQcKxZYV-xXkKoOpPSu6AUT0LXXszHo/pub?output=csv'

import csv
import json

csvfile = open('timeline_data.csv', newline='', encoding='utf8')
outfile = open('timeline_data.js', 'w', newline='')
reader = csv.DictReader(csvfile)

data = {}
events = []
#eras = []
data['events'] = events
#data['eras'] = eras

MONTHS = 12  # amount of max months in a year
DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]


# def check_event(event):
#     assert int(event['start_date']['year'])  # check every event has start year
#     if int(event['start_date']['year']) > 6000:
#         print("Warning: An event has year > 6000" + event['end_date']['year'])
#     if int(event['start_date']['year']) < -6000:
#         print("Warning: An event has year < -6000" + event['end_date']['year'])
#     # unlike spec says, headline IS required, else JSON cannot load
#     assert 'text' in event, "Event has no headline: " + event['start_date']['year']
#     assert 'headline' in event['text'], "Event has no headline" + event['start_date']['year']
#     if 'month' in event['start_date']:
#         check_month(int(event['start_date']['month']))
#     if 'day' in event['start_date']:
#         assert 'month' in event['start_date'], "event with start_day but no start_month"
#         check_day(int(event['start_date']['month']), int(event['start_date']['day']))
#     if 'end_date' in event:
#         if int(event['end_date']['year']) > 6000:
#             print("Warning: An event has year > 6000" + event['end_date']['year'])
#         if int(event['end_date']['year']) < -6000:
#             print("Warning: An event has year < -6000: " + event['end_date']['year'])
#         if 'month' in event['end_date']:
#             check_month(int(event['end_date']['month']))
#         if 'day' in event['end_date']:
#             assert 'month' in event['end_date'], "event with end_day but no end_month"
#             check_day(int(event['end_date']['month']), int(event['end_date']['day']))


def check_month(month):
    assert month < 13, "event with month > 12: " + str(month)
    assert month > 0, "event with month < 1: " + str(month)


def check_day(month, day):
    assert day > 0
    assert day <= DAYS[month-1], "event with day not in month: " + str(month) + " " + str(day)


# Didn't support 'End Time': '', 'Time': ''
keymap = {'Media': 'mediaUrl', 'Media Caption': 'mediaCaption', 'Media Thumbnail': 'mediaThumbnail',
          'Month': 'start_date_month', 'Day': 'start_date_day', 'Year': 'start_date_year',
          'End Month': 'end_date_month', 'End Day': 'end_date_day', 'End Year': 'end_date_year',
          'Headline': 'text_headline', 'Text': 'text_text',
          'Group': 'group', 'Display Date': 'display_date', 'Period': 'period'}

monthmap = {'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june':6, 'july': 7, 'august': 8,
            'september': 9, 'october': 10, 'november': 11, 'december': 12}

outfile.write("let timelineData = [\n")


def escape(param):
    string = json.dumps(param)
    string = string.replace("'", "\\'")
    # print(string)
    return string


for row in reader:
    outfile.write("{\n")
    event = {}
    for a in keymap:
        # print("Newline? \n")
        if row[a]:
            if keymap[a] == 'start_date_month' or keymap[a] == 'end_date_month':
                if row[a] in monthmap:
                    outfile.write(keymap[a] + " : \"" + escape(monthmap[row[a]]) + "\" ,\n")
            else:
                outfile.write(keymap[a] + " : " + escape(row[a]) + " ,\n")
            if '|' in keymap[a]:
                #
                (x, y)= keymap[a].split("|")
                if not x in event: event[x] = {}
                event[x][y] = row[a]
            else:
                event[keymap[a]] = row[a]

    outfile.write("},\n")
# print(events)
outfile.write("];")

#json.dump(events, outfile, sort_keys=True, indent=4)

