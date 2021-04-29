#include "src/PushButton/PushButton.h"

// Output pins for the RGB LEDs
const int RGB_RED_PIN = 11;
const int RGB_GREEN_PIN  = 10;
const int RGB_BLUE_PIN  = 9;
const int RGB_RED_2_PIN = 6;
const int RGB_GREEN_2_PIN = 5;
const int RGB_BLUE_2_PIN = 3;

// Pin for photoresistor input
const int PHOTORESISTOR_PIN = 0;

// Pin for slider input
const int SLIDER_PIN = 1;

// Pin for lo-fi input
const int LO_FI_PIN = 2;

// Pin for taking in mode-change inputs
const int STATE_BUTTON_PIN = 1;
PushButton stateButton(STATE_BUTTON_PIN);

const int DELAY_MS = 100; // delay in ms between changing colors
const int MAX_COLOR_VALUE = 255;

enum RGB{
  RED,
  GREEN,
  BLUE,
  NUM_COLORS
};

int _rgbLedValues[] = {255, 0, 0}; // Red, Green, Blue
enum RGB _curFadingUpColor = GREEN;
enum RGB _curFadingDownColor = RED;
const int FADE_STEP = 5;  

// Used to track the state that the night light is in
int buttonState = 1;

void mode_1();
void mode_2();
void mode_3();

void setup() {
  // Set the RGB pins to output
  pinMode(RGB_RED_PIN, OUTPUT);
  pinMode(RGB_GREEN_PIN, OUTPUT);
  pinMode(RGB_BLUE_PIN, OUTPUT);
  pinMode(RGB_RED_2_PIN, OUTPUT);
  pinMode(RGB_GREEN_2_PIN, OUTPUT);
  pinMode(RGB_BLUE_2_PIN, OUTPUT);

  // Photoresistor input pin
  pinMode(PHOTORESISTOR_PIN, INPUT);
  
  // Slider pin
  pinMode(SLIDER_PIN, INPUT);

  // Lo-fi pin
  pinMode(LO_FI_PIN, INPUT);

  // State change button pin
  pinMode(STATE_BUTTON_PIN, INPUT_PULLUP);

  // Set initial color
  setColor(_rgbLedValues[RED], _rgbLedValues[GREEN], _rgbLedValues[BLUE]);
  delay(DELAY_MS);

  stateButton.setActiveLogic(LOW);
  // Debounce the mode change button with 10ms debounce time
  stateButton.setDebounceTime(10);
}

void loop() {
  // Update button state
  stateButton.update();
  // If mode button is clicked, switch to next mode
  if(stateButton.isClicked()){
    buttonState++;
    if(buttonState > 3) {
      buttonState = 1;
    }
  }

  // Activate mode 1
  if(buttonState == 1) {
    mode_1();
  }else if(buttonState == 2) { // Activate mode 2
    mode_2();
  }else{ // Activate mode 3
    mode_3();
  }
}

/*
  When in mode 1, the night light will crossfade 2 RGB LEDs, getting dimmer when 
  in a brighter environment and brighter in a dark environment
*/
void mode_1() 
{
  // Increment and decrement the RGB LED values for the current
  // fade up color and the current fade down color
  _rgbLedValues[_curFadingUpColor] += FADE_STEP;
  _rgbLedValues[_curFadingDownColor] -= FADE_STEP;

  // Check to see if we've reached our maximum color value for fading up
  // If so, go to the next fade up color (we go from RED to GREEN to BLUE
  // as specified by the RGB enum)
  // This fade code partially based on: https://gist.github.com/jamesotron/766994
  if(_rgbLedValues[_curFadingUpColor] > MAX_COLOR_VALUE){
    _rgbLedValues[_curFadingUpColor] = MAX_COLOR_VALUE;
    _curFadingUpColor = (RGB)((int)_curFadingUpColor + 1);

    if(_curFadingUpColor > (int)BLUE){
      _curFadingUpColor = RED;
    }
  }

  // Check to see if the current LED we are fading down has gotten to zero
  // If so, select the next LED to start fading down (again, we go from RED to 
  // GREEN to BLUE as specified by the RGB enum)
  if(_rgbLedValues[_curFadingDownColor] < 0){
    _rgbLedValues[_curFadingDownColor] = 0;
    _curFadingDownColor = (RGB)((int)_curFadingDownColor + 1);

    if(_curFadingDownColor > (int)BLUE){
      _curFadingDownColor = RED;
    }
  }

  // Get photoresistor value
  int photoresistorVal = analogRead(PHOTORESISTOR_PIN);
  // We will make this the fraction of brightness we want
  int adjustVal = map(photoresistorVal, 0, 1023, 255, 1);
  
  // Set the color and then delay
  int redAdjust = (int)(_rgbLedValues[RED] * (1.0 / adjustVal));
  int greenAdjust = (int)(_rgbLedValues[GREEN] * (1.0 / adjustVal));
  int blueAdjust = (int)(_rgbLedValues[BLUE] * (1.0 / adjustVal));

  setColor(redAdjust, greenAdjust, blueAdjust);
  
  delay(DELAY_MS);
}

/*
  When in mode 2, twisting the dial at the middle will change the color
  of the night light. This change will remain static until the dial is
  turned again
*/
void mode_2()
{
  // Lo-fi
  int loFiVal = analogRead(LO_FI_PIN);
  Serial.println(loFiVal);
  // 900 = 1/3
  // 970 = half
  // 990 = 2/3
  int spectrum = 0;
  // Depending on where the dial is, change the color of the LEDs
  if(loFiVal < 900){
    spectrum =  map(loFiVal, 650, 900, 1, 51);
    setColor(255 - (FADE_STEP * spectrum), FADE_STEP * spectrum, 0);
  }else if(loFiVal < 990){
    spectrum =  map(loFiVal, 900, 990, 1, 51);
    setColor(0, 255 - (FADE_STEP * spectrum), FADE_STEP * spectrum);
  }else if(loFiVal < 1000){
    spectrum =  map(loFiVal, 990, 1000, 1, 51);
    setColor(FADE_STEP * spectrum, 0, 255 - (FADE_STEP * spectrum));
  }else{
    setColor(255, 0, 0);
  }
}

/*
  When in mode 3, adjusting the slider on the cat's ear will change the rate 
  at which the RGB LEDs crossfade
*/
void mode_3()
{
  // Custom
  int sliderVal = analogRead(SLIDER_PIN);
  int delayTime = 0;
  // Depending on slider value, change the delay time before next loop
  if(sliderVal < 450){
    delayTime = map(sliderVal, 0, 450, 5, 10);
  }else if(sliderVal < 750){
    delayTime = map(sliderVal, 450, 750, 10, 40);
  }else{
    delayTime = map(sliderVal, 750, 850, 40, 150);
  }

  // Increment and decrement the RGB LED values for the current
  // fade up color and the current fade down color
  _rgbLedValues[_curFadingUpColor] += FADE_STEP;
  _rgbLedValues[_curFadingDownColor] -= FADE_STEP;

  // Check to see if we've reached our maximum color value for fading up
  // If so, go to the next fade up color (we go from RED to GREEN to BLUE
  // as specified by the RGB enum)
  // This fade code partially based on: https://gist.github.com/jamesotron/766994
  if(_rgbLedValues[_curFadingUpColor] > MAX_COLOR_VALUE){
    _rgbLedValues[_curFadingUpColor] = MAX_COLOR_VALUE;
    _curFadingUpColor = (RGB)((int)_curFadingUpColor + 1);

    if(_curFadingUpColor > (int)BLUE){
      _curFadingUpColor = RED;
    }
  }

  // Check to see if the current LED we are fading down has gotten to zero
  // If so, select the next LED to start fading down (again, we go from RED to 
  // GREEN to BLUE as specified by the RGB enum)
  if(_rgbLedValues[_curFadingDownColor] < 0){
    _rgbLedValues[_curFadingDownColor] = 0;
    _curFadingDownColor = (RGB)((int)_curFadingDownColor + 1);

    if(_curFadingDownColor > (int)BLUE){
      _curFadingDownColor = RED;
    }
  }

  // Set the color and then delay
  setColor(_rgbLedValues[RED], _rgbLedValues[GREEN], _rgbLedValues[BLUE]);
  delay(delayTime);
}

/**
 * setColor takes in values between 0 - 255 for the amount of red, green, and blue, respectively
 * where 255 is the maximum amount of that color and 0 is none of that color. You can illuminate
 * all colors by intermixing different combinations of red, green, and blue
 * 
 * This function is based on https://gist.github.com/jamesotron/766994
 */
void setColor(int red, int green, int blue)
{
  // Write the RGB values
  analogWrite(RGB_RED_PIN, red);
  analogWrite(RGB_GREEN_PIN, green);
  analogWrite(RGB_BLUE_PIN, blue);  

  analogWrite(RGB_RED_2_PIN, red);
  analogWrite(RGB_GREEN_2_PIN, green);
  analogWrite(RGB_BLUE_2_PIN, blue); 
}
