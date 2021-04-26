#include "src/PushButton/PushButton.h"

// Frequencies (in Hz) of our piano keys
// From: https://en.wikipedia.org/wiki/Piano_key_frequencies
// Looks like there are also constants built into the tone library
// https://github.com/bhagman/Tone#musical-notes
#define KEY_C 262  // 261.6256 Hz (middle C)
#define KEY_D 294  // 293.6648 Hz
#define KEY_E 330  // 329.6276 Hz
#define KEY_F 350  // 349.2282 Hz
#define KEY_G 392  // 391.9954 Hz
#define KEY_A 440  // 440.0000 Hz
#define KEY_B 494  // 493.8833 Hz
#define KEY_HI_C 524 // 523.2511 Hz

// I lay out my buttons like piano keys. So, lower frequencies on left
// and increasingly higher frequencies to the right
// Change this depending on how you've laid out your keys
const int INPUT_BUTTON_C_PIN = 1;
const int INPUT_BUTTON_D_PIN = 2;
const int INPUT_BUTTON_E_PIN = 3;
const int INPUT_BUTTON_F_PIN = 4;
const int INPUT_BUTTON_G_PIN = 5;
const int INPUT_BUTTON_A_PIN = 6;
const int INPUT_BUTTON_B_PIN = 7;
const int INPUT_BUTTON_HI_C_PIN = 8;

const int OUTPUT_PIEZO_PIN = 9;
const int OUTPUT_LED_PIN = LED_BUILTIN; // visual feedback on button press

const int DEBOUNCE_TIME = 40;

// By default, we assume buttons are in pull-up configurations
// Switch the following to false and change INPUT_PULLUP belows
// to INPUT
const boolean _buttonsAreActiveLow = true; 

int active = 0;

// Used for debouncing
PushButton buttonC(INPUT_BUTTON_C_PIN);
PushButton buttonD(INPUT_BUTTON_D_PIN);
PushButton buttonE(INPUT_BUTTON_E_PIN);
PushButton buttonF(INPUT_BUTTON_F_PIN);
PushButton buttonG(INPUT_BUTTON_G_PIN);
PushButton buttonA(INPUT_BUTTON_A_PIN);
PushButton buttonB(INPUT_BUTTON_B_PIN);
PushButton buttonHiC(INPUT_BUTTON_HI_C_PIN);

void setup() {
  pinMode(INPUT_BUTTON_C_PIN, INPUT_PULLUP);
  pinMode(INPUT_BUTTON_D_PIN, INPUT_PULLUP);
  pinMode(INPUT_BUTTON_E_PIN, INPUT_PULLUP);
  pinMode(INPUT_BUTTON_F_PIN, INPUT_PULLUP);
  pinMode(INPUT_BUTTON_G_PIN, INPUT_PULLUP);
  pinMode(INPUT_BUTTON_A_PIN, INPUT_PULLUP);
  pinMode(INPUT_BUTTON_B_PIN, INPUT_PULLUP);
  pinMode(INPUT_BUTTON_HI_C_PIN, INPUT_PULLUP);
  pinMode(OUTPUT_PIEZO_PIN, OUTPUT);
  pinMode(OUTPUT_LED_PIN, OUTPUT);

  // Initialize button settings
  buttonC.setActiveLogic(LOW);
  buttonC.setDebounceTime(DEBOUNCE_TIME);
  buttonD.setActiveLogic(LOW);
  buttonD.setDebounceTime(DEBOUNCE_TIME);
  buttonE.setActiveLogic(LOW);
  buttonE.setDebounceTime(DEBOUNCE_TIME);
  buttonF.setActiveLogic(LOW);
  buttonF.setDebounceTime(DEBOUNCE_TIME);
  buttonG.setActiveLogic(LOW);
  buttonG.setDebounceTime(DEBOUNCE_TIME);
  buttonA.setActiveLogic(LOW);
  buttonA.setDebounceTime(DEBOUNCE_TIME);
  buttonB.setActiveLogic(LOW);
  buttonB.setDebounceTime(DEBOUNCE_TIME);
  buttonHiC.setActiveLogic(LOW);
  buttonHiC.setDebounceTime(DEBOUNCE_TIME);
}

void loop() {
  // Update buttons
  buttonC.update();
  buttonD.update();
  buttonE.update();
  buttonF.update();
  buttonG.update();
  buttonA.update();
  buttonB.update();
  buttonHiC.update();

  // tone() generates a square wave of the specified frequency (and 50% duty cycle) on a pin. 
  // A duration can be specified, otherwise the wave continues until a call to noTone().
  // See: https://www.arduino.cc/reference/en/language/functions/advanced-io/tone/
  // 
  // Check each button to see if they're pressed. If so, play the corresponding note
  // We can only play one tone at a time, hence the massive if/else block
  if(buttonC.isClicked()){
    tone(OUTPUT_PIEZO_PIN, KEY_C);
  }else if(buttonD.isClicked()){
    tone(OUTPUT_PIEZO_PIN, KEY_D);
  }else if(buttonE.isClicked()){
    tone(OUTPUT_PIEZO_PIN, KEY_E);
  }else if(buttonF.isClicked()){
    tone(OUTPUT_PIEZO_PIN, KEY_F);
  }else if(buttonG.isClicked()){
    tone(OUTPUT_PIEZO_PIN, KEY_G);
  }else if(buttonA.isClicked()){
    tone(OUTPUT_PIEZO_PIN, KEY_A);
  }else if(buttonB.isClicked()){
    tone(OUTPUT_PIEZO_PIN, KEY_B);
  }else if(buttonHiC.isClicked()){
    tone(OUTPUT_PIEZO_PIN, KEY_HI_C);
  }else if(buttonC.isReleased()){
    noTone(OUTPUT_PIEZO_PIN);
    digitalWrite(OUTPUT_LED_PIN, LOW);
  }else if(buttonD.isReleased()){
    noTone(OUTPUT_PIEZO_PIN);
    digitalWrite(OUTPUT_LED_PIN, LOW);
  }else if(buttonE.isReleased()){
    noTone(OUTPUT_PIEZO_PIN);
    digitalWrite(OUTPUT_LED_PIN, LOW);
  }else if(buttonF.isReleased()){
    noTone(OUTPUT_PIEZO_PIN);
    digitalWrite(OUTPUT_LED_PIN, LOW);
  }else if(buttonG.isReleased()){
    noTone(OUTPUT_PIEZO_PIN);
    digitalWrite(OUTPUT_LED_PIN, LOW);
  }else if(buttonA.isReleased()){
    noTone(OUTPUT_PIEZO_PIN);
    digitalWrite(OUTPUT_LED_PIN, LOW);
  }else if(buttonB.isReleased()){
    noTone(OUTPUT_PIEZO_PIN);
    digitalWrite(OUTPUT_LED_PIN, LOW);
  }else if(buttonHiC.isReleased()){
    noTone(OUTPUT_PIEZO_PIN);
    digitalWrite(OUTPUT_LED_PIN, LOW);
  }
  delay(50);
}
