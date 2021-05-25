// Demonstrates basic web serial input with p5js. See:
// https://makeabilitylab.github.io/physcomp/communication/p5js-serial
// 
// By Jon E. Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//

let shapeFraction = 0; // tracks the new shape fraction off serial
let serial; // the Serial object
let serialOptions = { baudRate: 115200  };

function setup() {
  createCanvas(400, 400);
  background(0);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // Add in a lil <p> element to provide messages. This is optional
  pHtmlMsg = createP("Click anywhere on this page to open the serial connection dialog");
}

let xCenter = 200;
let yCenter = 200;
let increasing = true;
let diameter = 50;

function draw() {
  stroke(250);
  fill(0); 

  // Update x,y center of drawing Canvas
  if (increasing) {
    yCenter++;
  } else {
    yCenter--;
  }
  
  // Detect if circle is off screen
  if (yCenter > height - (diameter / 2) && increasing) {
    increasing = false;
  } else if (yCenter < diameter / 2 && !increasing) {
    increasing = true;
  }

  // Use serial input to determine xCircle
  let xCenter = (width * (shapeFraction * 1.7)) + (diameter / 2); 
  circle(xCenter, yCenter, diameter);
}

function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
}

function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
}

function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
}

function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);

  shapeFraction = parseFloat(newData);
}

function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}