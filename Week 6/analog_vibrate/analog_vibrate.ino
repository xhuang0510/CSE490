const int INPUT_FSR_PIN = A0;
const int OUTPUT_PIN = 3;

void setup() {
  // put your setup code here, to run once:
  pinMode(OUTPUT_PIN, OUTPUT);
  pinMode(INPUT_FSR_PIN, INPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  // Read the force-sensitive resistor value
  int fsrVal = analogRead(INPUT_FSR_PIN);

  // Remap the value for output. 
  int vibVal = map(fsrVal, 0, 1023, 0, 255);
  
  analogWrite(OUTPUT_PIN, vibVal);
}
