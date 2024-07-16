var bluetooth = {
    active: false,
    send: {
        pos: 0,
		busy: false,
		data: null,
    },
    received: {
        pos: 0,
		time: new Date(),
    },
	info: {
		deviceName: "EasyBoatController",
		bleService: "82c2e3b5-6b5f-4437-8941-bade7c66cbf6",
		controlCharacteristic: "47431b0f-1164-4027-8efa-38c44b51de88",
		statusCharacteristic: "91a184db-3822-4136-aeac-305727992cfe",
		timeoutSeconds: 5,
	},
};

var bleDevice = null;
var bleServer = null;
var bleServiceFound = null;
var statusCharacteristicFound = null;

function initBluetooth() {
	if (!navigator.bluetooth) {
		showFatalError("Bluetooth error", "Web Bluetooth API is not available in this browser");
		return;
	}
}

function connectToBluetoothDevice(){
	navigator.bluetooth.requestDevice({
		filters: [{name: bluetooth.info.deviceName}],
		optionalServices: [bluetooth.info.bleService]
	})
	.then(device => {
		bleDevice = device;
		device.addEventListener('ebcservicedisconnected', onBluetoothDisconnected);
		bluetooth.received.time = new Date();
		//document.getElementById("debug").innerText = "bt01";
		return device.gatt.connect();
	})
	.then(gattServer =>{
		bleServer = gattServer;
		console.log("Connected to EBC device");
		bluetooth.received.time = new Date();
		//document.getElementById("debug").innerText = "bt02";
		return bleServer.getPrimaryService(bluetooth.info.bleService);
	})
	.then(service => {
		bleServiceFound = service;
		console.log("Service discovered:", service.uuid);
		bluetooth.received.time = new Date();
		//document.getElementById("debug").innerText = "bt03";
		return service.getCharacteristic(bluetooth.info.statusCharacteristic);
	})
	.then(characteristic => {
		//document.getElementById("debug").innerText = "bt04";
		onBluetoothState(true);
		//document.getElementById("debug").innerText = "bt05";
		console.log("Characteristic discovered:", characteristic.uuid);
		statusCharacteristicFound = characteristic;
		//document.getElementById("debug").innerText = "bt06";
		characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicChange);
		//document.getElementById("debug").innerText = "bt07";
		characteristic.startNotifications();
		//document.getElementById("debug").innerText = "bt08";
		console.log("Notifications Started.");
		//document.getElementById("debug").innerText = "bt09";
		bluetooth.received.time = new Date();
		//document.getElementById("debug").innerText = "bt10";
		var v = characteristic.readValue();
		//document.getElementById("debug").innerText = "bt10_1" + v;
		return v;
	})
	.then(value => {
		//document.getElementById("debug").innerText = "bt11";
		console.log("Read value: ", value);
		//document.getElementById("debug").innerText = "bt12";
		const decodedValue = new TextDecoder().decode(value);
		//document.getElementById("debug").innerText = "bt13";
		console.log("Decoded value: ", decodedValue);
		//document.getElementById("debug").innerText = "bt14";
		bluetooth.received.time = new Date();
		//retrievedValue.innerHTML = decodedValue;
	})
	.catch(error => {
		if (("" + error).indexOf("GATT operation failed for unknown reason") < 0) {
			showFatalError('Error', error);
		}
	})
}

function onBluetoothDisconnected(event){
	console.log('Device Disconnected:', event.target.device.name);
	onBluetoothState(false);
	connectToBluetoothDevice();
}

function handleCharacteristicChange(event){
	const newValueReceived = new TextDecoder().decode(event.target.value);
	console.log("status: ", newValueReceived);
	bluetooth.received.time = new Date();
	//document.getElementById("debug").innerText = "bt: " + newValueReceived;
	var params = newValueReceived.split(",");
	for (let param of params) {
		var keyVal = param.split(":");
		if (keyVal.length == 2) {
			if (keyVal[0] == "C") {
				bluetooth.received.pos = parseInt(keyVal[1]);
			}
		}
	}
	//retrievedValue.innerHTML = newValueReceived;
	//timestampContainer.innerHTML = getDateTime();
}

function onBluetoothTime() {
	if (bluetooth.active) {
		if (!bluetooth.send.busy && bluetooth.send.data != null) {
			var data = bluetooth.send.data;
			bluetooth.send.data = null;
			sendBluetoothData(data);
		}
		var secondsInactive = (new Date() - bluetooth.received.time) / 1000;
		if (secondsInactive > bluetooth.info.timeoutSeconds) {
			console.log("Bluetooth timeout" + secondsInactive);
			try {
				bleDevice.gatt.disconnect();
			} catch {};
			onBluetoothState(false);
		}
	}
}

function switchBluetoothConnect() {
	if (bluetooth.active) {
		try {
			bleDevice.gatt.disconnect();
		} catch {};
		onBluetoothState(false);
	} else {
		sidebarBluetooth.innerText = "Connecting...";
		connectToBluetoothDevice();
	}
}

function sendBluetoothData(values){
	if (bluetooth.send.busy) {
		bluetooth.send.data = values;
		return;
	}

	if (bleServer && bleServer.connected) {
		bluetooth.send.busy = true;
		bleServiceFound.getCharacteristic(bluetooth.info.controlCharacteristic)
		.then(characteristic => {
			//console.log("Found the LED characteristic: ", characteristic.uuid);
			var enc = new TextEncoder();

			var value = "";
			for (var key in values) {
				value += (value.length > 0 ? "," : "") + key + ":" + values[key];
			}

			const data = enc.encode(value); //new Uint8Array([value]);
			return characteristic.writeValue(data);
		})
		.then(() => {
			bluetooth.send.busy = false;
			if ("T" in values) {
				bluetooth.send.pos = values.T;
			}
			//console.log("Value written to control:", values);
		})
		.catch(error => {
			bluetooth.send.busy = false;
			bluetooth.send.data = values;
			console.error("Error writing to the control: ", error);
		});
	} else {
		//console.error ("Bluetooth is not connected. Cannot write to characteristic.");
		if (bluetooth.active) {
			try {
				bleDevice.gatt.disconnect();
			} catch {};
			onBluetoothState(false);
		}
	}
}

function onBluetoothState(state) {
	if (bluetooth.active != state) {
		if (state) {
			sendBluetoothData({ C: boat.rudder.pos, T: boat.rudder.target });
		}
		bluetooth.send.busy = false;
		bluetooth.active = state;
		switchClass(sidebarBluetooth, "green", !state);
		switchClass(sidebarBluetooth, "red", state);
		sidebarBluetooth.innerText = (state ? "Disconnect Bluetooth" : "Connect Bluetooth");

		if (!state) {
			if (engineStarted) {
				switchMove();
			}
			if (accelDriveStarted) {
				switchMotionDrive();
			}
		}
		switchClass(buttonStartStop, "disabled", !state);
		switchClass(accelDriveSidebar, "disabled", !state);
	}
}

var sidebarBluetooth = addSidebarButton("Connect Bluetooth", switchBluetoothConnect);
switchClass(sidebarBluetooth, "green", true);