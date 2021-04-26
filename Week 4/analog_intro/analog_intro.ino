const int ANALOG_PIN = 0;
const int LED_PIN = 9;

void setup()
{
  pinMode(LED_PIN, OUTPUT);
}

void loop()
{
  int potVal = analogRead(ANALOG_PIN); // returns 0 - 1023 (due to 10 bit ADC)
  analogWrite(LED_PIN, potVal / 4);
}
