const int VIBRATE_OUTPUT_PIN = 3;

// How much change in vibration per loop
const int STEP = 5;

// Minimum vibVal
const int MIN_VAL = 20;

// Maximum vibVal
const int MAX_VAL = 60;

// Used to store current vibrator value
int vibVal = MIN_VAL;

// Flag to track if we are increasing vibVal or not
bool increasing = true;

void setup() {
  // put your setup code here, to run once:
  pinMode(VIBRATE_OUTPUT_PIN, OUTPUT);
}

// Inspired by the Apple Watch "breathing" haptic feedback
void loop() {
  // put your main code here, to run repeatedly:

  // Check if we are increasing or decreasing vibVal
  if (vibVal <= MIN_VAL) {
    increasing = true;
  } else if (vibVal >= MAX_VAL) {
    increasing = false;
  }

  if (increasing) {
    vibVal += STEP;
  } else {
    vibVal -= STEP;
  }
  analogWrite(VIBRATE_OUTPUT_PIN, vibVal);
  delay(500);
}
