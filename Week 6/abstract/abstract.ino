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

void setup(){
  Serial.begin(9600);
  
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

  // Put in drawing routines
  // In this case, draw a circle at x,y location of 50,20 with a radius of 10
  _display.fillCircle(50, 20, 10, SSD1306_WHITE);
  _display.drawCircle(20, 40, 20, SSD1306_WHITE);
  _display.drawLine(0, 0, 127, 63, SSD1306_WHITE);
  _display.drawRect(30, 40, 10, 20, SSD1306_WHITE);
  _display.fillRect(15, 50, 5, 5, SSD1306_WHITE);
  _display.drawRoundRect(25, 35, 15, 10, 30, SSD1306_WHITE);
  _display.fillRoundRect(1, 5, 20, 5, 15, SSD1306_WHITE);
  _display.drawTriangle(5, 5, 25, 45, 127, 63, SSD1306_WHITE);
  _display.drawTriangle(100, 45, 115, 63, 120, 25, SSD1306_WHITE);
  _display.drawCircle(85, 35, 25, SSD1306_WHITE);
  _display.fillCircle(115, 25, 15, SSD1306_WHITE);

  // Render graphics buffer to screen
  _display.display();
}
