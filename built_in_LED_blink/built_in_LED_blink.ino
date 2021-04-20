#define LED 13
void setup() {
  Serial.begin(9600); // opens serial port, sets data rate to 9600 bps
  // initialize digital pin LED as an output.
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);   // turn the LED on (HIGH is the voltage level)
  Serial.println("Pin 3 is now HIGH (5V)");
  delay(1000);                       // wait for a second
  digitalWrite(LED, LOW);    // turn the LED off by making the voltage LOW
  Serial.println("Pin 3 is now LOW (0V)");
  delay(1000);                       // wait for a second
}
