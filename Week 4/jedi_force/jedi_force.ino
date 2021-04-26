#define KEY_C 262  // 261.6256 Hz (middle C)
#define KEY_D 294  // 293.6648 Hz
#define KEY_E 330  // 329.6276 Hz
#define KEY_F 350  // 349.2282 Hz
#define KEY_G 392  // 391.9954 Hz
#define KEY_A 440  // 440.0000 Hz
#define KEY_B 494  // 493.8833 Hz
#define KEY_HI_C 524 // 523.2511 Hz

const int OUTPUT_LED_PIN = LED_BUILTIN;
const int OUTPUT_PIEZO_PIN = 2;
const int INPUT_FSR_PIN = A0;
const int DELAY_MS = 20; // how often to read from the sensor input

void setup() {
  pinMode(OUTPUT_LED_PIN, OUTPUT);
  pinMode(OUTPUT_PIEZO_PIN, OUTPUT);
  pinMode(INPUT_FSR_PIN, INPUT);
  Serial.begin(9600);
}

void loop() {

  // Read the force-sensitive resistor value
  int fsrVal = analogRead(INPUT_FSR_PIN);

  // Remap the value for output. 
  int ledVal = map(fsrVal, 0, 1023, 0, 255);
  int freq = map(fsrVal, 0, 1023, 1, 9); // change min/max freq here

  // only play sound if the user is pressing on the FSR
  if(fsrVal > 0){
    if(freq == 1){
      tone(OUTPUT_PIEZO_PIN, KEY_C);
    }else if(freq == 2){
      tone(OUTPUT_PIEZO_PIN, KEY_D);
    }else if(freq == 3){
      tone(OUTPUT_PIEZO_PIN, KEY_E);
    }else if(freq == 4){
      tone(OUTPUT_PIEZO_PIN, KEY_F);
    }else if(freq == 5){
      tone(OUTPUT_PIEZO_PIN, KEY_G);
    }else if(freq == 6){
      tone(OUTPUT_PIEZO_PIN, KEY_A);
    }else if(freq == 7){
      tone(OUTPUT_PIEZO_PIN, KEY_B);
    }else{
      tone(OUTPUT_PIEZO_PIN, KEY_HI_C);
    }
  }else{
    noTone(OUTPUT_PIEZO_PIN);
  }

  // Print the raw sensor value and the converted led value (e,g., for Serial Plotter)
  Serial.print(fsrVal);
  Serial.print(",");
  Serial.println(ledVal);
  Serial.print(",");
  Serial.println(freq);

  // Write out the LED value. 
  analogWrite(OUTPUT_LED_PIN, ledVal);

  delay(DELAY_MS);
}
