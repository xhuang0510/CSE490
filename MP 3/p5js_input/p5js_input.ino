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

const int DELAY_MS = 10;

const int ANALOG_INPUT_PIN = A0;
const int MAX_ANALOG_INPUT = 1023;

// Button pins
const int BUTTON_1_PIN = 13;
const int BUTTON_2_PIN = 12;
const int BUTTON_3_PIN = 4;

// Text params
int16_t x, y;
uint16_t textWidth, textHeight;

// Track which inventory item is currently selected
int inventoryIndex = 0;
int selectedIndex = 0;

// Track what area of map player is
int mapIndex = 4;

// Current health
int health = 8;

int _lastAnalogVal = -1;

// Debouncing purposes
bool upIsPressed = false;
bool downIsPressed = false;

void setup() {
  Serial.begin(115200); // set baud rate to 115200

  if (!_display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) { // Address 0x3D for 128x64
    Serial.println(F("SSD1306 allocation failed"));
    for (;;); // Don't proceed, loop forever
  }

  pinMode(BUTTON_1_PIN, INPUT_PULLUP);
  pinMode(BUTTON_2_PIN, INPUT_PULLUP);
  pinMode(BUTTON_3_PIN, INPUT_PULLUP);
}

void loop() {
  // Receive serial readings
  if (Serial.available() > 0){
    // If we're here, then serial data has been received
    // Read data off the serial port until we get to the endline delimeter ('\n')
    // Store all of this data into a string
    String rcvdSerialData = Serial.readStringUntil('\n'); 

    // Convert string data into an integer
    mapIndex = rcvdSerialData.toInt() % 10;
    health = rcvdSerialData.toInt() / 10;
  }

  // Receive button inputs
  int button1State = digitalRead(BUTTON_1_PIN);
  int button2State = digitalRead(BUTTON_2_PIN);
  int button3State = digitalRead(BUTTON_3_PIN);

  // Button debounce
  if (button1State) {
    upIsPressed = true;
  }
  if (button2State) {
    downIsPressed = true;
  }

  // Track button states when switching inventory
  if (!button1State && inventoryIndex > 0 && upIsPressed) {
    inventoryIndex--;
    upIsPressed = false;
  }
  if (!button2State && inventoryIndex < 4 && downIsPressed) {
    inventoryIndex++;
    downIsPressed = false;
  }
  if (!button3State) {
    // If the analog value has changed, send a new one over serial
    if (inventoryIndex != selectedIndex){
        Serial.println(inventoryIndex);
    }
    selectedIndex = inventoryIndex;
  }
  
  // Clear the display
  _display.clearDisplay();

  // Set text params
  // Setup text rendering parameters
  _display.setTextSize(1);
  _display.setTextColor(WHITE, BLACK);
  
  // Measure the text with those parameters. Pass x, y, textWidth, and textHeight
  // by reference so that they are set within the function itself.
  _display.getTextBounds("", 0, 0, &x, &y, &textWidth, &textHeight);

  // Draw inventory divider
  _display.drawLine(55, 0, 55, 63, SSD1306_WHITE);

  // Draw current health
  if (health == 8) {
    _display.fillCircle(4, 5, 4, SSD1306_WHITE);
    _display.fillCircle(16, 5, 4, SSD1306_WHITE);
    _display.fillCircle(28, 5, 4, SSD1306_WHITE);
    _display.fillCircle(40, 5, 4, SSD1306_WHITE);
  } else if (health == 7) {
    _display.fillCircle(4, 5, 4, SSD1306_WHITE);
    _display.fillCircle(16, 5, 4, SSD1306_WHITE);
    _display.fillCircle(28, 5, 4, SSD1306_WHITE);
    _display.drawCircle(40, 5, 4, SSD1306_WHITE);
  } else if (health == 6) {
    _display.fillCircle(4, 5, 4, SSD1306_WHITE);
    _display.fillCircle(16, 5, 4, SSD1306_WHITE);
    _display.fillCircle(28, 5, 4, SSD1306_WHITE);
  } else if (health == 5) {
    _display.fillCircle(4, 5, 4, SSD1306_WHITE);
    _display.fillCircle(16, 5, 4, SSD1306_WHITE);
    _display.drawCircle(28, 5, 4, SSD1306_WHITE);
  } else if (health == 4) {
    _display.fillCircle(4, 5, 4, SSD1306_WHITE);
    _display.fillCircle(16, 5, 4, SSD1306_WHITE);
  } else if (health == 3) {
    _display.fillCircle(4, 5, 4, SSD1306_WHITE);
    _display.drawCircle(16, 5, 4, SSD1306_WHITE);
  } else if (health == 2) {
    _display.fillCircle(4, 5, 4, SSD1306_WHITE);
  } else if (health == 1) {
    _display.drawCircle(4, 5, 4, SSD1306_WHITE);
  } 

  // Draw inventory
  _display.setCursor(0, 15);
  _display.print("SWORD");
  _display.setCursor(0, 25);
  _display.print("BOW");
  _display.setCursor(0, 35);
  _display.print("MAGIC");
  _display.setCursor(0, 45);
  _display.print("POTION");
  _display.setCursor(0, 55);
  _display.print("RANG");
  
  // Draw selector
  _display.drawTriangle(45, 18 + 10 * inventoryIndex, 50, 15 + 10 * inventoryIndex, 50, 21 + 10 * inventoryIndex, SSD1306_WHITE);

  // Draw selected line
  _display.fillTriangle(45, 18 + 10 * selectedIndex, 50, 15 + 10 * selectedIndex, 50, 21 + 10 * selectedIndex, SSD1306_WHITE);

  // Draw map
  // 1st row
  _display.drawRect(68, 5, 18, 18, SSD1306_WHITE);
  _display.drawRect(86, 5, 18, 18, SSD1306_WHITE);
  _display.drawRect(104, 5, 18, 18, SSD1306_WHITE);
  // 2nd row
  _display.drawRect(68, 23, 18, 18, SSD1306_WHITE);
  _display.drawRect(86, 23, 18, 18, SSD1306_WHITE);
  _display.drawRect(104, 23, 18, 18, SSD1306_WHITE);
  // 3rd row
  _display.drawRect(68, 41, 18, 18, SSD1306_WHITE);
  _display.drawRect(86, 41, 18, 18, SSD1306_WHITE);
  _display.drawRect(104, 41, 18, 18, SSD1306_WHITE);

  // Draw player current location
  if (mapIndex == 0) {
    _display.fillCircle(77, 14, 4, SSD1306_WHITE);
  } else if (mapIndex == 1) {
     _display.fillCircle(95, 14, 4, SSD1306_WHITE);
  } else if (mapIndex == 2) {
     _display.fillCircle(113, 14, 4, SSD1306_WHITE);
  } else if (mapIndex == 3) {
     _display.fillCircle(77, 32, 4, SSD1306_WHITE);
  } else if (mapIndex == 4) {
     _display.fillCircle(95, 32, 4, SSD1306_WHITE);
  } else if (mapIndex == 5) {
     _display.fillCircle(113, 32, 4, SSD1306_WHITE);
  } else if (mapIndex == 6) {
     _display.fillCircle(77, 50, 4, SSD1306_WHITE);
  } else if (mapIndex == 7) {
     _display.fillCircle(95, 50, 4, SSD1306_WHITE);
  } else if (mapIndex == 8) {
     _display.fillCircle(113, 50, 4, SSD1306_WHITE);
  }
  
  // Render graphics buffer to screen
  _display.display();

  delay(DELAY_MS);
}
