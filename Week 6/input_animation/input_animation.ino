#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET     4 // Reset pin # (or -1 if sharing Arduino reset pin)
// Instantiate SSD1306 driver display object
Adafruit_SSD1306 _display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Change by this many frames per loop
const int FRAME_STEP = 3;

// Input pin for button
const int BUTTON_INPUT_PIN = 8;

// Max y-value that box can be drawn
const int MAX_Y = 56;

// Min y-value that box can be drawn
const int MIN_Y = 35;

// Flag for tracking when animation is done
bool done = true;

// Flag to check if box is still rising
bool rising = true;

// Current altitude of our box starts at MAX_Y
int altitude = MAX_Y;

void setup(){
  Serial.begin(9600);

  pinMode(BUTTON_INPUT_PIN, INPUT_PULLUP);
  
  // Initialize the display. If it fails, print failure to Serial
  // and enter an infinite loop
  if (!_display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) { // Address 0x3D for 128x64
    Serial.println(F("SSD1306 allocation failed"));
    for (;;); // Don't proceed, loop forever
  }
}

void loop(){
  // Read button state
  int buttonState = digitalRead(BUTTON_INPUT_PIN);

  // If button is pressed, initiate animation
  if (!buttonState) {
    done = false;
    rising = true;
  }
  
  // Animation is still in progress
  if (!done) {
    if (altitude > MIN_Y && rising) {
      altitude -= FRAME_STEP;
    } else {
      rising = false;
      altitude += FRAME_STEP;
      if (altitude == MAX_Y) {
        done = true;
      }
    }
    
  }
  
  // Clear the display
  _display.clearDisplay();

  // Put in drawing routines
  // In this case, draw a circle at x,y location of 50,20 with a radius of 10
  _display.fillRect(20, altitude, 8, 8, SSD1306_WHITE);

  // Render graphics buffer to screen
  _display.display();
}
