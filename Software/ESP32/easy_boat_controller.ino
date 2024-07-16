#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>


BLEServer* pServer = NULL;
BLECharacteristic* pStatusCharacteristic = NULL;
BLECharacteristic* pControlCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
uint32_t value = 0;
long currentStep = 0;
long targetStep = 0;
long statusCurrentStep = currentStep;
long statusTargetStep = targetStep;
//FastAccelStepperEngine engine = FastAccelStepperEngine();
//FastAccelStepper *stepper = NULL;

namespace settings {
  const long statusDelay = 200;
  const long pingDelay = 1000;
  namespace pins {
    const int enable = 4;
    const int dir = 16;
    const int step = 17;
  }
}

namespace calibration {
  long minValue = 0;
  long maxValue = 0;
  long zeroValue = 0;
}

const int ledPin = 2; // Use the appropriate GPIO pin for your setup

#define SERVICE_UUID        "82c2e3b5-6b5f-4437-8941-bade7c66cbf6"
#define STATUS_CHARACTERISTIC_UUID "91a184db-3822-4136-aeac-305727992cfe"
#define CONTROL_CHARACTERISTIC_UUID "47431b0f-1164-4027-8efa-38c44b51de88"


class CMotorController
{
  private:
    int pinE;
    int pinD;
    int pinS;
    long pos = 0;
    long target = 0;
    long steps = 50;
    long csteps = 0;
    long workStep = 0;
    int operationStep = 0;
    unsigned long stepWait = 600;
    unsigned long releaseWait = 1200;
    unsigned long stepTimer = 0;
    bool enabled = false;
  public:
    CMotorController(int pinE_, int pinD_, int pinS_, int steps_ = 50) : pinE(pinE_), pinD(pinD_), pinS(pinS_), steps(steps_) {
      pinMode(pinE, OUTPUT);
      digitalWrite(pinE, HIGH); //OFF

      pinMode(pinD, OUTPUT);
      digitalWrite(pinD, LOW);

      pinMode(pinS, OUTPUT);
      digitalWrite(pinS, LOW);
    }

    void setEnabled(bool value) {
      if (!inProgress() || value) {
        digitalWrite(pinE, value ? LOW : HIGH);
        enabled = value;
      }
    }

    bool inProgress() {
      return (pos != target);
    }

    long getPos() {
      return pos;
    }

    long getTarget() {
      return target;
    }

    void setTarget(long value) {
      target = value;
    }

    void setZero() {
      pos = 0;
      target = 0;
      operationStep = 0;
      workStep = 0;

    }

    void onTime() {
      if (pos != target) {
        if (workStep == 0) {
          if (!enabled) {
            setEnabled(true);
          }
          Serial.print("enabled: ");
          Serial.println(enabled);
          workStep = (pos < target ? 1 : -1);
          
        }
      }

      if (workStep != 0) {
        if (operationStep == 0) {
          digitalWrite(pinD, workStep > 0 ? LOW : HIGH); //Direction
          digitalWrite(pinS, HIGH);
          stepTimer = micros();
          operationStep = 1;
        }

        if (operationStep == 1) {
          if (micros() - stepTimer > stepWait) {
            digitalWrite(pinS, LOW);
            stepTimer = micros();
            operationStep = 2;
          }
        }

        if (operationStep == 2) {
          if (micros() - stepTimer > releaseWait) {
            operationStep = 0;
            csteps++;
            if (csteps >= steps) {
              csteps = 0;
              pos = pos + workStep;
              workStep = 0;
            }
          }
        }
      }
    }
};
CMotorController motorController(settings::pins::enable, settings::pins::dir, settings::pins::step);

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
  };

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
  }
};

long parseLong(const char *value, long defaultValue = 0) {
  if (value == nullptr) {
    return defaultValue;
  }
  long multiplier = 1;
  if (*value == '-') {
    multiplier = -1;
    value++;
  }
  long v = 0;
  while (*value >= '0' && *value <= '9') {
    v = v * 10 + (*value - '0');
    value++;
  }
  return v * multiplier;
}

void readParams(const char *commandline) {
  while (*commandline != 0) {
    const char *command = commandline;
    while (*commandline != ':') {
      if (*commandline == 0) {
        return;
      }
      commandline++;
    }
    long commandLength = commandline - command;
    commandline++;
    const char *value = commandline;
    while (*commandline != ',' && *commandline != 0) {
      commandline++;
    }

    long valueLength = commandline - value;

    if (commandLength == 1) {
      if (*command == 'T') {
        targetStep = parseLong(value);
        motorController.setTarget(targetStep);
      } else if (*command == 'Z') {
        motorController.setZero();
      } else if (*command == 'E') {
        long evalue = parseLong(value);
        motorController.setEnabled(evalue != 0);
      } else if (*command == 'C') {
        long evalue = parseLong(value);
        currentStep = evalue;
      }
      
    }

    if (*commandline != ',') {
      *commandline++;
    }
  }
}

bool onWriteBusy = false;
unsigned long onWriteTimer = 0;
class MyCharacteristicCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pControlCharacteristic) {
    String value = pControlCharacteristic->getValue();
    if (value.length() > 0) {
      Serial.print("control: ");
      Serial.println(value); // Print the integer value
      readParams(value.c_str());

      onWriteBusy = true;
      onWriteTimer = millis();
      
      //delay(300);
      
    }
  }
};

bool bluetoothBusy = false;
unsigned int bluetoothTimer = 0;

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  

  /*
  digitalWrite(settings::pins::enable, LOW);


  for (int i = 0; i < 10000; i++) {
    digitalWrite(settings::pins::step, HIGH);
    delayMicroseconds(200);
    digitalWrite(settings::pins::step, LOW);
    delayMicroseconds(1000);
  }
  */

  //digitalWrite(settings::pins::enable, HIGH);

//settings::pins::enable, settings::pins::dir, settings::pins::step
/*
  engine.init();
  stepper = engine.stepperConnectToPin(settings::pins::step);
  if (stepper) {
    stepper->setDirectionPin(settings::pins::dir);
    stepper->setEnablePin(settings::pins::enable);
    stepper->setAutoEnable(true);

    stepper->setSpeedInHz(500);       // 500 steps/s
    stepper->setAcceleration(100);    // 100 steps/s²
    stepper->move(1000);
  }*/

  //motorController.setEnabled(true);

  BLEDevice::init("EasyBoatController");

  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);
  pStatusCharacteristic = pService->createCharacteristic(STATUS_CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_INDICATE);
  pControlCharacteristic = pService->createCharacteristic(CONTROL_CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_WRITE);
  pControlCharacteristic->setCallbacks(new MyCharacteristicCallbacks());

  pStatusCharacteristic->addDescriptor(new BLE2902());
  pControlCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);
  BLEDevice::startAdvertising();
  Serial.println("Waiting a client connection to notify...");
}

unsigned long emulationTimer = 0;
void emulation() {
  if (millis() - emulationTimer > 10) {
    if (currentStep != targetStep) {
      if (currentStep > targetStep) {
        currentStep--;
      } else if (currentStep < targetStep) {
        currentStep++;
      }
    }
    emulationTimer = millis();
  }
}

unsigned long statusDelayTimer = 0;
void loop() {
  if (onWriteBusy) {
    if (millis() - onWriteTimer > 300) {
      onWriteBusy = false;
    }
  }
  //curren tStep = 
  if (deviceConnected) {
    if (millis() - statusDelayTimer > settings::statusDelay) {
      if (motorController.getPos() != statusCurrentStep || motorController.getTarget() != statusTargetStep || millis() - statusDelayTimer > settings::pingDelay) {
        statusCurrentStep = motorController.getPos();
        statusTargetStep = motorController.getTarget();
        String status =  String("C:") + String(statusCurrentStep) + String(",T:") + String(statusTargetStep);
        pStatusCharacteristic->setValue(status.c_str());
        pStatusCharacteristic->notify();
        Serial.print("status: ");
        Serial.println(status);
        statusDelayTimer = millis();
      }
      //delay(300); // bluetooth stack will go into congestion, if too many packets are sent, in 6 hours test i was able to go as low as 3ms
    }
  }
  //emulation();
  // disconnecting
  if (!deviceConnected && oldDeviceConnected && !bluetoothBusy) {
    Serial.println("Device disconnected.");
    bluetoothBusy = true;
    bluetoothTimer = millis();
    //delay(500); // give the bluetooth stack the chance to get things ready
    
  }

  if (bluetoothBusy) {
    if (millis() - bluetoothTimer > 500) {
      pServer->startAdvertising(); // restart advertising
      Serial.println("Start advertising");
      oldDeviceConnected = deviceConnected;
      bluetoothBusy = false;
    }
  }
  // connecting
  if (deviceConnected && !oldDeviceConnected && !bluetoothBusy) {
    // do stuff here on connecting
    oldDeviceConnected = deviceConnected;
    Serial.println("Device Connected");
  }
  motorController.onTime();
}