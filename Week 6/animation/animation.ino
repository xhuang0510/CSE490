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

const int DELAY_LOOP_MS = 5; // change to slow down how often to read and graph value

// Ball variables
const int _boxDimens = 10;
int _xBox = 0;
int _yBox = 0;
int _xSpeed = 0;
int _ySpeed = 0;


void setup(){
  Serial.begin(9600);

  // Initialize ball to center of screen
  _xBox = _display.width() / 2;
  _yBox = _display.height() / 2;

  // Gets a random long between min and max - 1
  // https://www.arduino.cc/reference/en/language/functions/random-numbers/random/
  _xSpeed = random(1, 4);
  _ySpeed = random(1, 4);
  
  // Initialize the display. If it fails, print failure to Serial
  // and enter an infinite loop
  if (!_display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) { // Address 0x3D for 128x64
    Serial.println(F("SSD1306 allocation failed"));
    for (;;); // Don't proceed, loop forever
  }
}

void loop(){
  // Clear the display
  _display.clearDisplay();

  // Update ball based on speed location
  _xBox += _xSpeed;
  _yBox += _ySpeed;

  // Check for ball bounce
  if(_xBox == 0 || _xBox + _boxDimens >= _display.width()){
    _xSpeed = _xSpeed * -1; // reverse x direction
  }
  
  if(_yBox == 0 || _yBox + _boxDimens >= _display.height()){
    _ySpeed = _ySpeed * -1; // reverse y direction
  }

  // Put in drawing routines
  _display.fillRect(_xBox, _yBox, _boxDimens, _boxDimens, SSD1306_WHITE);

  // Render graphics buffer to screen
  _display.display();

  if(DELAY_LOOP_MS > 0){
    delay(DELAY_LOOP_MS);
  }
}
