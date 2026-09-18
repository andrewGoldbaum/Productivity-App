# Productivity-App
Creating an app to help me manage logistics. 

Can you make me an app that counts the number of days since I have done the following tasks?:

Fully getting ready
Haircuts
Food Shopping/Toiletry Shopping/Other Supplies
Acquiring Medication
House Cleaning
Laundry
Making sure I have fitting clothes
Checking email
Budgeting

And when I click that I’ve done a task, can you reset back to zero days to start the count over? That’s the basic functionality.

Advanced functionality:

Weighted prioritization - I want the app to signify to me which tasks are most urgent using a weighting system: days since the task was done multiplied by default urgency of the task on a zero to one scale divided by how many days can elapse between each time doing the task. I will supply those values:
Fully getting ready - 0.73 urgency, every day 
Haircuts - 0.35 urgency, every 28 days
Food shopping/Toiletry Shopping/Other Supplies - 0.63 urgency, every 5 days
Acquiring Medication - 0.9 urgency, every 20 days 
House cleaning - 0.45 urgency, every 7 days
Laundry - 0.63 urgency, every 7 days
Making sure I have fitting clothes - 0.25, every 28 days
Checking email - 0.8 urgency, every day (it’s supposed to be a routine, so if there’s a backlog make it urgent)
Budgeting - 0.5, every 14 days
Along with the weighted prioritization, I want the app to always separately show me the number of days elapsed, and if the number of days elapsed reached the number of days in the denominator. This way, if for example, it’s always discounting one of the lower-weighted ones in favor of something else, I can sometimes make a decision to override the priority weightings and do my own thing. 
Partial Completion - I want the app to have room for partially completing a task: doing some but not all of my laundry, doing some cleaning but not finishing it, doing some but not all of my morning routine, checking my emails but not responding to each thing within them, doing a partial food/toiletry/other-supply shopping, etc. In those cases, what I want you to do is double the denominator (how much time you can realistically let elapse) so that it counts more slowly in the weighting. The only exception I would say is acquiring medication, since that depends on whether the remaining medication is the consequential one (the one that’s actually close to running out). With specifically that one, still let me choose to double the denominator if I want, but confirm with me before I do so that the medication I just got was the important one and to not let me do so otherwise.
