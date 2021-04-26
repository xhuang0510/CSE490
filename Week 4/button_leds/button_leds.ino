const int RED_INPUT_BUTTON_PIN = 2;
const int RED_OUTPUT_LED_PIN = 3;
const int GREEN_INPUT_BUTTON_PIN = 4;
const int GREEN_OUTPUT_LED_PIN = 5;
const int BLUE_INPUT_BUTTON_PIN = 8;
const int BLUE_OUTPUT_LED_PIN = 9;

void setup()
{
  pinMode(RED_INPUT_BUTTON_PIN, INPUT);
  pinMode(RED_OUTPUT_LED_PIN, OUTPUT);
  pinMode(GREEN_INPUT_BUTTON_PIN, INPUT);
  pinMode(GREEN_OUTPUT_LED_PIN, OUTPUT);
  pinMode(BLUE_INPUT_BUTTON_PIN, INPUT_PULLUP);
  pinMode(BLUE_OUTPUT_LED_PIN, OUTPUT);
}

void loop()
{
  // read the state of the pushbutton value
  int redButtonState = digitalRead(RED_INPUT_BUTTON_PIN);
  digitalWrite(RED_OUTPUT_LED_PIN, redButtonState);

  int greenButtonState = digitalRead(GREEN_INPUT_BUTTON_PIN);
  digitalWrite(GREEN_OUTPUT_LED_PIN, !greenButtonState);

  int blueButtonState = digitalRead(BLUE_INPUT_BUTTON_PIN);
  digitalWrite(BLUE_OUTPUT_LED_PIN, !blueButtonState);
}
