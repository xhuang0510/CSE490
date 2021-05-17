#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "src/Note/Note.h"

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET     4 // Reset pin # (or -1 if sharing Arduino reset pin)
// Instantiate SSD1306 driver display object
Adafruit_SSD1306 _display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

const short DELAY_LOOP_MS = 10; // change to slow down how often to read and graph value

// RGB LED pins
const short RGB_RED_PIN = 9;
const short RGB_GREEN_PIN  = 10;

// Vibromotor pin
const short VIBRATE_OUTPUT_PIN = 11;

// Buzzer pin
const short BUZZER_PIN = 5; 

// Game button pins
const short BUTTON1_PIN = 4;
const short BUTTON2_PIN = 7;
const short BUTTON3_PIN = 8;
const short BUTTON4_PIN = 12;

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

// The easy song
Note level_1[] = { Note(2, 150, 262), Note(4, 250, 330), Note(2, 300, 392), Note(1, 400, 524) };
// The medium song
Note level_2[] = { Note(1, 100, 524), Note(4, 200, 494), Note(3, 300, 440), Note(4, 300, 392) };
// The hard song
Note level_3[] = { Note(4, 100, 392), Note(3, 200, 330), Note(2, 300, 294), Note(1, 360, 262), 
                   Note(2, 400, 294), Note(1, 460, 262), Note(2, 500, 294), Note(1, 560, 262),
                   Note(3, 600, 330), Note(2, 660, 294), Note(1, 690, 262), Note(1, 690, 262),
                   Note(4, 100, 392), Note(3, 200, 330), Note(2, 300, 294), Note(1, 360, 262), 
                   Note(2, 400, 294), Note(1, 460, 262), Note(2, 500, 294), Note(1, 560, 262),
                   Note(3, 600, 330), Note(2, 660, 294), Note(1, 690, 262), Note(1, 690, 262),
                   Note(4, 100, 392), Note(3, 200, 330), Note(2, 300, 294), Note(1, 360, 262), 
                   Note(2, 400, 294), Note(1, 460, 262), Note(2, 500, 294), Note(1, 560, 262),
                   Note(3, 600, 330), Note(2, 660, 294), Note(1, 690, 262), Note(1, 690, 262),
                   Note(4, 100, 392), Note(3, 200, 330), Note(2, 300, 294), Note(1, 360, 262), 
                   Note(2, 400, 294), Note(1, 460, 262), Note(2, 500, 294), Note(1, 560, 262),
                   Note(3, 600, 330), Note(2, 660, 294), Note(1, 690, 262), Note(1, 690, 262),
                   Note(4, 100, 392), Note(3, 200, 330), Note(2, 300, 294), Note(1, 360, 262), 
                   Note(2, 400, 294), Note(1, 460, 262), Note(2, 500, 294), Note(1, 560, 262),
                   Note(3, 600, 330), Note(2, 660, 294), Note(1, 690, 262), Note(1, 690, 262),
                   Note(4, 100, 392), Note(3, 200, 330), Note(2, 300, 294), Note(1, 360, 262), 
                   Note(2, 400, 294), Note(1, 460, 262), Note(2, 500, 294), Note(1, 560, 262) };


void setup(){
  Serial.begin(9600);
  
  // Initialize the display. If it fails, print failure to Serial
  // and enter an infinite loop
  if (!_display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) { // Address 0x3D for 128x64
    Serial.println(F("SSD1306 allocation failed"));
    for (;;); // Don't proceed, loop forever
  }

  // Set the RGB pins to output
  pinMode(RGB_RED_PIN, OUTPUT);
  pinMode(RGB_GREEN_PIN, OUTPUT);

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

    // Turn off RGB LED
    analogWrite(RGB_RED_PIN, 0);
    analogWrite(RGB_GREEN_PIN, 14);

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
      numNotes = 4;
    } else if (levelState == 2) {
      level = level_2;
      numNotes = 4;
    } else {
      level = level_3;
      numNotes = 11;
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
    analogWrite(RGB_RED_PIN, 14 - RGBVal);
    analogWrite(RGB_GREEN_PIN, RGBVal);
    
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
        if (level[i].currY_ > 51 && level[i].currY_ < 57) { // GREAT
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
