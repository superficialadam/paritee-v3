# Prompts

## anim js

I have added anime.js in index.html. Please use it to create some simple animations in main.js to make sure it works properly.
Maker the hero text bounce and the section headings fade in when they come into view.
Read up on the documention i animjs-documentation.md

## setup

Ok, now make a timeline animation on the hero text sliding slowly in and going from heavy blurred to sharp over 5 seconds.
I want the other sections to be hidden first to prevent scrolling. After the heroanimation is done, make them visible so I can scroll

## circle setup

I want you to add 5 circles (svg) with heavy blur spread across the background with different radius and transparency.
Make the colors around these colors 0E2683, 3B167A.

## Heading animation

Lets focus on the heading, scroll transition now.
I want the text to be left justified.
I want it to slide much slower from right to left and from the opposite side of the screen.
I want you to make three copies of the text that are in cyan, purple and green and have them start a little ofsetted from each other with an "add" overlay mode to create a prism effect
I want them to start fully transparent and end fully opaque.
when they have settled in to the left I want you to quickly fade up a dark grey text on top.

## circles step 2

Now I want to have section by sectino control over the svg circles. I want each section to have its own setting for how the circles should be placed, scaled and colored and transparnt.
So the scroll should transiiton between these position. Im tlking after the hero animation now. PLease make slightly varied parametrs for all sections under hero and interpolate through them with scroll.
