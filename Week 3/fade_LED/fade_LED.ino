const int LED_OUTPUT_PIN = 3;
const int DELAY_MS = 5; // delay between each fade value
const int MAX_ANALOG_OUT = 255; // the max analog output on the Uno is 255

void setup() {
  // set the LED pin to an output
  pinMode(LED_OUTPUT_PIN, OUTPUT);
}

void loop(){
  // fade on
  for(int i = 0; i <= MAX_ANALOG_OUT; i += 1){
    analogWrite(LED_OUTPUT_PIN, i);
    delay(DELAY_MS);
  }

  //fade off
  for(int i = MAX_ANALOG_OUT; i >= 0; i -= 1){
    analogWrite(LED_OUTPUT_PIN, i);
    delay(DELAY_MS);
  }
}
