#include "Note.h"
#include <Arduino.h>

Note::Note(short lane, short startTime, double pitch)
{   
    clicked_ = false;
	lane_ = lane;
    startTime_ = startTime;
    pitch_ = pitch;
    currW_ = 10;
    currH_ = 6;
    currY_ = -12;
    // Testing moving note down lane 1
    if (lane_ == 1) {
        currX_ = 20;
    } else if (lane_ == 2) {
        currX_ = 30;
    } else if (lane_ == 3) {
        currX_ = 41;
    } else {
        currX_ = 51;
    }
}

// Update the note's position on OLED
void Note::update() {
    // If note has not been clicked
    if (valid()) {
        // Update these every time
        currY_ += 3;
        if (currY_ == 24 || currY_ == 48) {
                currH_ += 1;
        }
        if (currY_ == 18 || currY_ == 36 || currY_ == 54){
            currW_ += 1;
        }

        // Conditionally change x values depending on lane
        // Lane 3 has no x change
        if (lane_ == 1) {
            if (currY_ > 0 && (currY_ % 5 == 0 || currY_ % 4 == 0)) {
                currX_ -= 1;
            }
        } else if (lane_ == 2) {
            if (currY_ > 0 && currY_ % 5 == 0) {
                currX_ -= 1;
            }
        } else if (lane_ == 4) {
            if (currY_ > 0 && (currY_ % 5 == 0 || currY_ % 4 == 0) && currY_ % 24 != 0) {
                currX_ += 1;
            }
        } 
    }
}

// Called when note is within click zone
void Note::click() {
    clicked_ = true;
}

// If note is valid then display, do not display otherwise
bool Note::valid() {
    return currY_ < 68 && !clicked_;
}

// Reset the note positions to default
void Note::reset() {
    clicked_ = false;
    currW_ = 10;
    currH_ = 6;
    currY_ = -12;
    // Testing moving note down lane 1
    if (lane_ == 1) {
        currX_ = 20;
    } else if (lane_ == 2) {
        currX_ = 30;
    } else if (lane_ == 3) {
        currX_ = 41;
    } else {
        currX_ = 51;
    }
}