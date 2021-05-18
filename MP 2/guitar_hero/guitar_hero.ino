#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ESP32Servo.h> 
#include "src/Note/Note.h"

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET     4 // Reset pin # (or -1 if sharing Arduino reset pin)
// Instantiate SSD1306 driver display object
Adafruit_SSD1306 _display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);


const int PWM_CHANNEL_RED = 2; // ESP32 has 16 channels which can generate 16 independent waveforms
const int PWM_CHANNEL_GREEN = 1;
const int PWM_FREQ = 500;  // Recall that Arduino Uno is ~490 Hz. Official ESP32 example uses 5,000Hz

// We'll use same resolution as Uno (8 bits, 0-255) but ESP32 can go up to 16 bits 
// Espressif docs seem to suggest that 10-15 bits is most common
// See: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/ledc.html#ledc-api-supported-range-frequency-duty-resolution
// Determined 1-16 bits for resolution here: 
// https://github.com/espressif/arduino-esp32/blob/a4305284d085caeddd1190d141710fb6f1c6cbe1/cores/esp32/esp32-hal-ledc.h
const int PWM_RESOLUTION = 8; 

// The max duty cycle value based on PWM resolution (will be 255 if resolution is 8 bits)
const int MAX_DUTY_CYCLE = (int)(pow(2, PWM_RESOLUTION) - 1);

const short DELAY_LOOP_MS = 10; // change to slow down how often to read and graph value

// RGB LED pins
const short RGB_RED_PIN = 33;
const short RGB_GREEN_PIN  = 27;

// Vibromotor pin
const short VIBRATE_OUTPUT_PIN = 15;

// Buzzer pin
const short BUZZER_PIN = 26; 

// Game button pins
const short BUTTON1_PIN = 14;
const short BUTTON2_PIN = 32;
const short BUTTON3_PIN = 12;
const short BUTTON4_PIN = 13;

// Use these on menu
const char title[] = "RHYTHM";
const char select[] = "Select Level";
const char level_1_txt[] = "LEVEL 1";
const char level_2_txt[] = "LEVEL 2";
const char level_3_txt[] = "LEVEL 3";

// Use these in game
const char great[] = "GREAT";
const char good[] = "GOOD";
const char bad[] = "BAD";
const char miss[] = "MISS";

const char score[] = "Score";
const char combo[] = "Combo";

const char finish[] = "Finish!";

const char results[] = "Results";
const char scoreResults[] = "Score:";
const char maxCombo[] = "Max Combo:";
const char retry[] = "RETRY";
const char menu[] = "MENU";

const short RADIUS = 4;

const short DEBOUNCE_TIME = 50;

int16_t x, y;
uint16_t textWidth, textHeight;

// Game state tracker
short gameState = 1;

// Track the level state
short levelState = 1;

// Track the RGB value
short RGBVal = 0;

// Track how long vibrator has been vibrating
short vibTimer = 0;

// Track how long buzzer has been sounding
short toneTimer = 0;

// Store the current score and combo
int scoreNum = 0;
short comboNum = 0;

// Store the max combo
short maxComboNum = 0;

// Used to draw notes on screen at correct time
int timer = 0;

// How good the timing of the note was
short noteStatus = 0;

// Track how many notes have passed
short passedNotes = 0;

// Number of notes for the current level
short numNotes = 0;

// Track if the game has ended
bool endGame = false;

// Track end game button state
short endState = 1;

// Number of notes in each song
const int NOTES_1 = 10;
const int NOTES_2 = 70;
const int NOTES_3 = 146;

// Define note frequencies
const double Ab_3 = 207.65;
const double F_3 = 174.61;
const double C_4 = 261.63;
const double D_4 = 293.66;
const double E_4 = 329.63;
const double F_4 = 349.23;
const double G_4 = 392.00;
const double Ab_4 = 415.30;
const double A_4 = 440.00;
const double Bb_4 = 466.16;
const double B_4 = 493.88;
const double C_5 = 523.25;
const double Cs_5 = 554.37;
const double D_5 = 587.33;
const double Eb_5 = 622.25;
const double E_5 = 659.25;
const double F_5 = 698.46;
const double Fs_5 = 739.99;
const double G_5 = 783.99;
const double Ab_5 = 830.61;
const double A_5 = 880.00;
const double Bb_5 = 932.33;
const double B_5 = 987.77;
const double C_6 = 1046.50;
const double Cs_6 = 1108.73;
const double D_6 = 1174.66;
const double Eb_6 = 1244.51;

// The easy song
Note level_1[] = { Note(1, 100, C_4), Note(4, 100, C_4), Note(2, 200, D_4), Note(3, 300, E_4), Note(4, 400, F_4),
                   Note(4, 500, G_4), Note(3, 600, A_4), Note(2, 700, B_4), Note(1, 800, C_5),
                   Note(4, 800, C_5) };
                   
// The medium song
Note level_2[] = { Note(1, 100, C_5), Note(2, 100, C_5), Note(3, 100, C_5), Note(4, 100, C_5),
                   Note(1, 200, C_5), 
                   Note(3, 300, G_5), Note(4, 300, G_5), 
                   Note(3, 400, G_5),
                   Note(4, 500, A_5), Note(1, 500, A_5), 
                   Note(4, 600, A_5), 
                   Note(2, 700, G_5), Note(3, 700, G_5), 
                   Note(4, 900, F_5), Note(1, 900, F_5), 
                   Note(4, 1000, F_5), 
                   Note(3, 1100, E_5), Note(4, 1100, E_5), 
                   Note(3, 1200, E_5), 
                   Note(2, 1300, D_5), Note(1, 1300, D_5),
                   Note(2, 1400, D_5), 
                   Note(1, 1500, C_5), Note(4, 1500, C_5), 
                   Note(3, 1700, G_5), Note(1, 1700, G_5), 
                   Note(3, 1800, G_5), 
                   Note(2, 1900, F_5), Note(3, 1900, F_5), 
                   Note(2, 2000, F_5), 
                   Note(4, 2100, E_5), Note(1, 2100, E_5), 
                   Note(4, 2200, E_5),
                   Note(1, 2300, D_5), Note(2, 2300, D_5),
                   Note(1, 2500, G_5), Note(4, 2500, G_5),
                   Note(1, 2600, G_5), 
                   Note(3, 2700, F_5), Note(2, 2700, F_5), 
                   Note(3, 2800, F_5), 
                   Note(2, 2900, E_5), Note(3, 2900, E_5),
                   Note(2, 3000, E_5), 
                   Note(4, 3100, D_5), Note(1, 3100, D_5),
                   Note(2, 3300, C_5), Note(4, 3300, C_5), 
                   Note(2, 3400, C_5), 
                   Note(3, 3500, G_5), Note(1, 3500, G_5), 
                   Note(3, 3600, G_5),
                   Note(4, 3700, A_5), Note(1, 3700, A_5), 
                   Note(4, 3800, A_5), 
                   Note(3, 3900, G_5), Note(2, 3900, G_5), 
                   Note(2, 4100, F_5), Note(4, 4100, F_5), 
                   Note(2, 4200, F_5), 
                   Note(4, 4300, E_5), Note(1, 4300, E_5), 
                   Note(4, 4400, E_5), 
                   Note(3, 4500, D_5), Note(2, 4500, D_5),
                   Note(3, 4600, D_5), 
                   Note(1, 4700, C_5), Note(2, 4700, C_5), Note(3, 4700, C_5), Note(4, 4700, C_5) };

// The hard song
Note level_3[] = { Note(1, 100, Ab_4), Note(1, 240, Ab_4), Note(3, 280, C_5), Note(4, 320, C_5), // Intro
                   Note(1, 440, C_5), Note(4, 480, F_4), Note(2, 530, F_4), Note(3, 620, F_4), 
                   Note(1, 860, Ab_4), Note(1, 1000, Ab_4), Note(3, 1040, C_5), Note(2, 1080, C_5), 
                   Note(2, 1200, C_5), Note(3, 1240, F_4), Note(1, 1290, F_4), Note(4, 1380, F_4), 
                   Note(2, 1420, Eb_6), Note(3, 1480, C_6), Note(1, 1520, Eb_6), Note(4, 1560, C_6), // Intro extra + end intro
                   Note(2, 1600, C_5), Note(3, 1640, C_5), Note(1, 1920, C_5), Note(3, 1960, C_5), // Verse
                   Note(1, 2000, C_5), Note(4, 2100, C_5), Note(2, 2140, C_5), Note(3, 2180, Eb_5), 
                   Note(1, 2280, Eb_5), Note(4, 2320, F_5), 
                   Note(2, 2360, C_5), Note(1, 2400, C_5), Note(3, 2680, C_5), Note(4, 2720, C_5), // LINE 1 REPEAT
                   Note(1, 2760, C_5), Note(3, 2860, C_5), Note(2, 2900, C_5), Note(4, 2940, Eb_5), 
                   Note(3, 3040, Eb_5), Note(1, 3080, F_5), 
                   Note(4, 3120, Cs_5), Note(1, 3160, Cs_5), Note(2, 3420, C_5), Note(3, 3520, Cs_5), // different line
                   Note(4, 3560, C_5), Note(3, 3600, Bb_4), Note(2, 3640, Ab_4), Note(1, 3680, C_5),
                   Note(2, 3780, Ab_4), Note(4, 3880, Bb_4), 
                   Note(3, 4160, C_5), Note(1, 4210, Bb_4), Note(2, 4260, C_5), Note(3, 4310, Eb_5), // extra line
                   Note(4, 4360, C_5), Note(3, 4410, Bb_4), Note(2, 4460, Bb_5), Note(1, 4560, C_6), 
                   Note(3, 4660, Cs_6), Note(1, 4710, C_6), Note(2, 4760, Cs_6), Note(4, 4810, C_6), //chorus
                   Note(2, 4860, Cs_6), Note(1, 4910, C_6), Note(4, 4960, Bb_5), Note(2, 5060, G_5), 
                   Note(3, 5260, Ab_5), Note(2, 5360, Bb_5), 
                   Note(1, 5460, C_6), Note(2, 5510, Bb_5), Note(3, 5560, C_6), Note(4, 5610, Bb_5), // second line of chorus
                   Note(3, 5660, C_6), Note(1, 5710, Bb_5), Note(4, 5760, Ab_5), Note(2, 5860, F_5), 
                   Note(2, 6060, Bb_5), Note(4, 6160, C_6),
                   Note(1, 6260, Cs_6), Note(3, 6310, C_6), Note(2, 6360, Cs_6), Note(4, 6410, C_6), // third line of chorus
                   Note(2, 6460, Cs_6), Note(4, 6510, C_6), Note(1, 6560, C_6), Note(3, 6660, Bb_5), 
                   Note(1, 6860, Eb_6), Note(4, 6910, Eb_6), Note(2, 6960, C_6), Note(3, 7010, Cs_6), // 4th line of chorus repeat
                   Note(2, 7060, Eb_6), Note(1, 7160, C_6), 
                   Note(4, 7260, Eb_6), Note(3, 7310, Eb_6), Note(2, 7360, C_6), Note(1, 7410, Cs_6), // 4th line of chorus repeat 2nd time
                   Note(3, 7460, Eb_6), Note(1, 7560, C_6), 
                   Note(2, 7660, Eb_6), Note(1, 7710, C_6), Note(4, 7760, Bb_5), Note(1, 7810, Ab_5), // 4th line extra
                   Note(2, 7860, Eb_5), Note(3, 7910, F_5), Note(1, 7960, Eb_5), Note(4, 8010, F_5), // 5th line
                   Note(3, 8160, Ab_5), Note(1, 8260, Fs_5), Note(2, 8310, G_5), Note(4, 8360, Fs_5), 
                   Note(2, 8410, G_5), Note(1, 8560, Bb_5), Note(4, 8660, Ab_5), 
                   Note(3, 8760, Bb_5), Note(1, 8810, C_6), Note(3, 8860, C_6), Note(1, 8910, Cs_6), // extra 1
                   Note(2, 8960, C_6),
                   Note(4, 9110, Ab_5), Note(1, 9160, Ab_5), Note(2, 9210, Ab_5), Note(1, 9260, C_6), // extra 2
                   Note(3, 9360, Ab_5),
                   Note(1, 9510, Cs_6), Note(2, 9560, Cs_6), Note(1, 9610, Cs_6), Note(3, 9660, Cs_6), // line 6 block 1
                   Note(4, 9710, C_6), Note(2, 9760, C_6), 
                   Note(3, 9910, Bb_5), Note(1, 9960, Bb_5), Note(4, 10010, Bb_5), Note(1, 10060, Bb_5), // block 2
                   Note(2, 10110, Ab_5), Note(3, 10160, Ab_5), 
                   Note(4, 10260, Cs_6), Note(3, 10360, C_6), Note(2, 10460, Bb_5), Note(1, 10560, Ab_5), // extra
                   Note(2, 10660, Ab_5), Note(3, 10710, Ab_5), Note(4, 10760, Ab_5), Note(2, 10860, Ab_5), // final line
                   Note(3, 10910, Ab_5), Note(4, 10960, C_6), Note(1, 11060, Ab_5) };
                   
void setup(){
  Serial.begin(9600);
  
  // Initialize the display. If it fails, print failure to Serial
  // and enter an infinite loop
  if (!_display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) { // Address 0x3D for 128x64
    Serial.println(F("SSD1306 allocation failed"));
    for (;;); // Don't proceed, loop forever
  }

  // Set up PWM
  ledcSetup(PWM_CHANNEL_RED, PWM_FREQ, PWM_RESOLUTION);
  ledcSetup(PWM_CHANNEL_GREEN, PWM_FREQ, PWM_RESOLUTION);

  // Set the RGB pins to output
  ledcAttachPin(RGB_RED_PIN, PWM_CHANNEL_RED);
  ledcAttachPin(RGB_GREEN_PIN, PWM_CHANNEL_GREEN);

  // Set the vibromotor pin to output
  pinMode(VIBRATE_OUTPUT_PIN, OUTPUT);

  // Take buttons as input
  pinMode(BUTTON1_PIN, INPUT_PULLUP);
  pinMode(BUTTON2_PIN, INPUT_PULLUP);
  pinMode(BUTTON3_PIN, INPUT_PULLUP);
  pinMode(BUTTON4_PIN, INPUT_PULLUP);
}

void loop(){
  // Track button press states
  short button1State = digitalRead(BUTTON1_PIN);
  short button2State = digitalRead(BUTTON2_PIN);
  short button3State = digitalRead(BUTTON3_PIN);
  short button4State = digitalRead(BUTTON4_PIN);

  // Clear the display
  _display.clearDisplay();

  // Setup text rendering parameters
  _display.setTextSize(1);
  _display.setTextColor(WHITE, BLACK);
  
  // Measure the text with those parameters. Pass x, y, textWidth, and textHeight
  // by reference so that they are set within the function itself.
  _display.getTextBounds(score, 0, 0, &x, &y, &textWidth, &textHeight);

  // On level select screen
  if (gameState == 1) {
    if (!button1State && levelState > 1) {
      levelState--;
    } else if (!button2State && levelState < 3) {
      levelState++;
    }

    // Turn on only green LED on menu screen
    ledcWrite(PWM_CHANNEL_RED, 0);
    ledcWrite(PWM_CHANNEL_GREEN, 14);

    // Setup text rendering parameters
    _display.setTextSize(2);
    // Print title
    _display.setCursor(30, 0);
    _display.print(title);

    // Setup text rendering parameters
    _display.setTextSize(1);
    // Print select level
    _display.setCursor(30, 25);
    _display.print(select);
    
    // Print select level
    _display.setCursor(20, 48);
    _display.print(1);
    _display.setCursor(62, 48);
    _display.print(2);
    _display.setCursor(104, 48);
    _display.print(3);

    _display.drawLine(19 + 42 * (levelState - 1), 57, 25 + 42 * (levelState - 1), 57, SSD1306_WHITE);

    // Enter game
    if (!button3State || !button4State) {
      gameState = 2;
    }

    // Used to debounce menu buttons
    delay(DEBOUNCE_TIME);
    
  } else if (gameState == 2) { // In game
    Note* level;
    if (levelState == 1) {
      level = level_1;
      numNotes = NOTES_1;
    } else if (levelState == 2) {
      level = level_2;
      numNotes = NOTES_2;
    } else {
      level = level_3;
      numNotes = NOTES_3;
    }

    // Turn off vibromotor after 20 ticks
    if (timer > vibTimer + 20) {
      digitalWrite(VIBRATE_OUTPUT_PIN, LOW);
      vibTimer = 0;
    }

    // Turn off tone after 30 ticks
    if (timer > toneTimer + 30) {
      noTone(BUZZER_PIN);
    }

    // Set score indicator LED
    RGBVal = map(scoreNum, 0, numNotes * 250, 0, 14);
    ledcWrite(PWM_CHANNEL_RED, 14 - RGBVal);
    ledcWrite(PWM_CHANNEL_GREEN, RGBVal);
    
    // Raise circle indicator when active
    short circleRise1 = 0;
    short circleRise2 = 0;
    short circleRise3 = 0;
    short circleRise4 = 0;
  
    if (!button1State){
      circleRise1 = 1;
    }
    if (!button2State){
      circleRise2 = 1;
    }
    if (!button3State){
      circleRise3 = 1;
    }
    if (!button4State){
      circleRise4 = 1;
    }
  
    // Drawing note lanes
    _display.drawLine(20, 0, 10, 64, SSD1306_WHITE);
    _display.drawLine(30, 0, 25, 64, SSD1306_WHITE);
    _display.drawLine(40, 0, 40, 64, SSD1306_WHITE);
    _display.drawLine(50, 0, 55, 64, SSD1306_WHITE);
    _display.drawLine(60, 0, 70, 64, SSD1306_WHITE);
  
    // Drawing note hit boundaries
    _display.drawRoundRect(12, 54 - circleRise1, 13, 8, 4, SSD1306_WHITE);
    _display.drawRoundRect(27, 54 - circleRise2, 13, 8, 4, SSD1306_WHITE);
    _display.drawRoundRect(41, 54 - circleRise3, 13, 8, 4, SSD1306_WHITE);
    _display.drawRoundRect(56, 54 - circleRise4, 13, 8, 4, SSD1306_WHITE);
  
    // Place text here
    _display.setCursor(90, 0); 
    // Print out the string
    _display.print(score);
  
    // Print out numerical score
    _display.setCursor(90, 10);
    _display.print(scoreNum);
  
    // Print combo
    _display.setCursor(90, 45); 
    _display.print(combo);
    _display.setCursor(90, 55); 
    _display.print(comboNum);
  
    // Print note status
    _display.setCursor(90, 27);
    if (noteStatus == 1) {
      _display.print(great);
    } else if (noteStatus == 2) {
      _display.print(good);
    } else if (noteStatus == 3) {
      _display.print(bad);
    } else if (noteStatus == 4) {
      _display.print(miss);
    }

    // Update in-game timer
    timer += 10;
    // Still in game
    if (passedNotes != numNotes) {
      displayNotes(level, button1State, button2State, button3State, button4State);
    } else if (!endGame) { // End of song, exit to game over screen
      endGame = true;
      timer = 0;
    }

    // Display end game screen for 3 seconds
    if (endGame && timer < 500) { 
      _display.setCursor(21, _display.height() / 2 - textHeight / 2);
      _display.print(finish);
      // Turn off vibration
      if (timer > 20) {
        digitalWrite(VIBRATE_OUTPUT_PIN, LOW);
      }
      // Turn off buzzer
      if (timer > 30) {
        noTone(BUZZER_PIN);
      }
    } else if (endGame && timer >= 500) { // Go to end game screen
      // Reset all note positions
      for (short i = 0; i < numNotes; i++) {
        level[i].reset();
      }
      gameState = 3;
    }
  } else { // Game over screen
    // Track which option the user is hovering
    if (!button1State && endState > 1) {
      endState--;
    } else if (!button2State && endState < 2) {
      endState++;
    }

    // Draw stats
    _display.setCursor(42, 0);
    _display.print(results);

    _display.setCursor(5, 15);
    _display.print(scoreResults);
    _display.print(scoreNum);
    _display.print("/");
    _display.print(numNotes * 250);
    _display.setCursor(5, 25);
    _display.print(maxCombo);
    _display.print(maxComboNum);
    _display.print("/");
    _display.print(numNotes);

    _display.setCursor(30, 45);
    _display.print(retry);
    _display.setCursor(70, 45);
    _display.print(menu);

    if (endState == 1) {
      _display.drawLine(28, 55, 60, 55, SSD1306_WHITE);
    } else {
      _display.drawLine(68, 55, 94, 55, SSD1306_WHITE);
    }

    if (!button3State || !button4State) {
      if (endState == 1) {
        gameState = 2;
      } else {
        gameState = 1;
        levelState = 1;
      }
      reset();
      delay(150);
    }
  }
  
  // Render graphics buffer to screen
  _display.display();

  if(DELAY_LOOP_MS > 0){
    delay(DELAY_LOOP_MS);
  }
}

// Controls the gameplay
void displayNotes(Note* level, int button1State, int button2State, int button3State, int button4State) {
  // Print all notes in level array
  for (short i = 0; i < numNotes; i++) {
    // Check for button clicks
    if (level[i].valid()) {
      if ( (!button1State && level[i].lane_ == 1) ||
           (!button2State && level[i].lane_ == 2) || 
           (!button3State && level[i].lane_ == 3) ||
           (!button4State && level[i].lane_ == 4) ) {
        if (level[i].currY_ > 51 && level[i].currY_ < 60) { // GREAT
          level[i].click();
          noteStatus = 1;
          comboNum++;
          scoreNum += 250;
          passedNotes++;
          tone(BUZZER_PIN, level[i].pitch_);

          toneTimer = timer;
        } else if (level[i].currY_ > 48 && level[i].currY_ < 63) { // GOOD
          level[i].click();
          noteStatus = 2;
          comboNum++;
          scoreNum += 200;
          passedNotes++;
          tone(BUZZER_PIN, level[i].pitch_);
          toneTimer = timer;
        } else if (level[i].currY_ > 45 && level[i].currY_ < 66) { // BAD
          level[i].click();
          noteStatus = 3;
          comboNum = 0;
          scoreNum += 50;
          passedNotes++;
          tone(BUZZER_PIN, level[i].pitch_);
          digitalWrite(VIBRATE_OUTPUT_PIN, HIGH);
          vibTimer = timer;
          toneTimer = timer;
        } else if (level[i].currY_ > 42) { // MISS
          level[i].click();
          noteStatus = 4;
          comboNum = 0;
          passedNotes++;
          digitalWrite(VIBRATE_OUTPUT_PIN, HIGH);
          vibTimer = timer;
        }
      } else if (level[i].currY_ >= 66) { // Player did not click
        noteStatus = 4;
        comboNum = 0;
        passedNotes++;
        digitalWrite(VIBRATE_OUTPUT_PIN, HIGH);
        vibTimer = timer;
      }
    }
    
    // Start displaying notes
    if (level[i].startTime_ <= timer && level[i].valid()) {
      _display.fillRoundRect(level[i].currX_, level[i].currY_, level[i].currW_, level[i].currH_, RADIUS, SSD1306_WHITE);
      level[i].update();
    }

    // Update max combo
    if (comboNum > maxComboNum) {
      maxComboNum = comboNum;
    }
  }
}

// Reset game counters
void reset() {
  scoreNum = 0;
  comboNum = 0;
  maxComboNum = 0;
  timer = 0;
  noteStatus = 0;
  passedNotes = 0;
  numNotes = 0;
  endGame = false;
  endState = 1;
  RGBVal = 0;
  vibTimer = 0;
  toneTimer = 0;
}
