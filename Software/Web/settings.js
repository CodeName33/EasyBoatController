var settings = {
    course: {
        maximumRudderPositionPercent: 50,
        keepBoatNearLines: true,
        takingPointsNotNecessary: true,
		keepBoatNearLineQ: 2.0,
        keepBoatNearLineMaxPercent: 100,
        points: {
			distanceToPointToBeDone: 10,
		},
        speedCompensationForSlowRudder: {
            enabled: true,
            compensateAfterSpeedKmh: 10,
            compensateMinQ: 0.3,
            angleToPointDontCompensateAfter: 80,
        }
    },
    gps: {
        useCompassBetweenGpsSteps: false,
        metersToMove: 3,
        pointsToGroup: 3,
        accuracy: 6,
    },
	calibrate: {
		maxSteps: 210,
		autoCalibrationCenter: 105,
		defaultSideMax: 90,
		invertedMove: false,
	},
    emulation: {
        enabled: true,
        wind: {
            angle: 0,
            force: 0,
        },
        offsets: {
            rudderRotate: 0,
        },
        boat: {
            speed: 0.00001,
			rudderSpeed: 2,
            delaySeconds: 0,
        },
    },
    accelDrive: {
        minAngleToMove: 3,
    },
};
var settingsToImport = {};

function loadSettings(settings, newSettings) {
	for (var key in newSettings) {
		if (typeof newSettings[key] === 'object') {
			if (!(key in settings)) {
				settings[key] = {};
			}
			loadSettings(settings[key], newSettings[key]);
		} else if (key in settings) {
			settings[key] = newSettings[key];
		}
	}
}

function exportSettings() {
    var exportData = {
        settings: {},
        routes: {},
    };

    if (document.getElementById("export_option_settings").checked) {
        exportData.settings = settings;
    }
    if (document.getElementById("export_option_routes").checked) {
        exportData.routes = storageGetObject("routes");
    }

    downloadFileData("EasyBoatController.settings.ebs", JSON.stringify(exportData), "application/octet-stream");
    closeModalWindow();
}

function importSettings() {
    var input = document.getElementById("import_settings");
	if (input == null) {
    	input = createElement("input", { parent: document.body, id: "import_settings", style: "display:none", type: "file", onchange: onImportSettingsSelected });
	}
    input.click();
}

function onImportSettingsSelected(e) {
    var input = e.currentTarget;
    if (input.files) {
        for (let file of input.files) {
            var parts = file.name.split(".");
            var ext = parts[parts.length - 1].toLowerCase();
            importType = ext;
            var reader = new FileReader();
            reader.onload = onImportSettingsReaded;
            reader.onerror = function() {
                showFatalError("Can't read file");
            };
            reader.readAsText(file)
            //reader.readAsArrayBuffer(file);
        }
    }
}

function importSettingsData() {
    var routes = storageGetObject("routes");
    if (document.getElementById("import_option_settings").checked) {
        loadSettings(settings, settingsToImport.settings);
        localStorage.setItem("settings", JSON.stringify(settings));
    }
    if (document.getElementById("import_option_routes").checked) {
        for (var key in settingsToImport.routes) {
            routes[key] = settingsToImport.routes[key];
        }
        localStorage.setItem("routes", JSON.stringify(routes));
    }
    closeModalWindow();
    closeModalWindow();
    editSettings();
}

function importSettingsDialog() {
    var window = createModalWindow("Import Options", importSettingsData, undefined, closeModalWindow);

    {
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Import settings", class: "settings-label" });
		createElement("input", { parent: area, type: "checkbox", class: "settings-edit", id: "import_option_settings", checked: true });
	}
    {
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Import (" + Object.keys(settingsToImport.routes).length + ") routes", class: "settings-label" });
		createElement("input", { parent: area, type: "checkbox", class: "settings-edit", id: "import_option_routes", checked: true });
	}
}

function onImportSettingsReaded(e) {
    try {
        var importData = JSON.parse(e.target.result);

        if (!("settings" in importData) || typeof importData.settings !== 'object') {
            importData.settings = {};
        }
        if (!("routes" in importData) || typeof importData.routes !== 'object') {
            importData.routes = {};
        }

        settingsToImport = importData;

        importSettingsDialog();
    } catch {}
}

function exportSettingsDialog() {
    var window = createModalWindow("Export Options", exportSettings, undefined, closeModalWindow);

    {
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Export all settings", class: "settings-label" });
		createElement("input", { parent: area, type: "checkbox", class: "settings-edit", id: "export_option_settings", checked: true });
	}
    {
		var area = createElement("div", { parent: window, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Export all (" + Object.keys(storageGetObject("routes")).length + ") routes", class: "settings-label" });
		createElement("input", { parent: area, type: "checkbox", class: "settings-edit", id: "export_option_routes", checked: true });
	}
}

function editSettings() {
    areaSetting = createModalWindow("Settings", closeModalWindow, undefined, closeModalWindow);
	addModalButton("Restore Deaults", restoreDefaultSettings);
    if (!window.location.href.startsWith("file://")) {
		addModalButton("Download App", downloadSelf);
	}
    editSettingsObject(settings, 0);

    createElement("div", { parent: areaSetting, text: "Import/Export", class: "settings-group" });
    {
		var area = createElement("div", { parent: areaSetting, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Import Settings", class: "settings-label" });
		createElement("div", { parent: area, text: "Import...", class: "settings-button button", onclick: importSettings });
	}
    {
		var area = createElement("div", { parent: areaSetting, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Export Settings", class: "settings-label" });
		createElement("div", { parent: area, text: "Export", class: "settings-button button", onclick: exportSettingsDialog });
	}
}

function restoreDefaultSettings() {
	var settingsString = localStorage.getItem("settings-default");
	if (settingsString != undefined && settingsString != null && settingsString.length > 0) {
		settings = JSON.parse(settingsString);
		localStorage.setItem("settings", JSON.stringify(settings));
	}
	closeModalWindow();
}

function getHumanizedName(name) {
    var word = "";
    var hname = "";

    for (var i = 0; i < name.length; i++) {
        var c = name[i];
        if (c != c.toLowerCase()) {
            if (word.length > 0) {
                hname += (hname.length > 0 ? " " : "") + word;
                word = "";
            }
            word += c;
        } else {
            word += (word.length > 0 ? c : c.toUpperCase());
        }
    }
    if (word.length > 0) {
        hname += (hname.length > 0 ? " " : "") + word;
        word = "";
    }
    return hname;
}

function editSettingsObject(obj, offset) {
    for (var key in obj) {
        var type = typeof obj[key];
        if (typeof obj[key] === 'object') {
            createElement("div", { parent: areaSetting, text: getHumanizedName(key), class: "settings-group", style: "margin-left: " + offset + "em;" });
            editSettingsObject(obj[key], offset + 1);
        } else if (typeof obj[key] === 'boolean') {
            var area =createElement("div", { parent: areaSetting, class: "settings-prop-area", style: "margin-left: " + offset + "em;" });
            createElement("div", { parent: area, text: getHumanizedName(key), class: "settings-label" });
            var el =createElement("input", { parent: area, type: "checkbox", class: "settings-edit", object: obj, objectkey: key, onblur: function(e) {
                e.currentTarget.object[e.currentTarget.getAttribute("objectkey")] = e.currentTarget.checked;
                localStorage.setItem("settings", JSON.stringify(settings));
            } });
            el.checked = obj[key];
        } else {
            var area =createElement("div", { parent: areaSetting, class: "settings-prop-area", style: "margin-left: " + offset + "em;" });
            createElement("div", { parent: area, text: getHumanizedName(key), class: "settings-label" });
            createElement("input", { parent: area, value: obj[key], class: "settings-edit", object: obj, objectkey: key, onblur: function(e) {
                e.currentTarget.object[e.currentTarget.getAttribute("objectkey")] = parseFloat(e.currentTarget.value);
                localStorage.setItem("settings", JSON.stringify(settings));
            } });
        }
    }
}

localStorage.setItem("settings-default", JSON.stringify(settings));
var areaSetting = null;
var settingsString = localStorage.getItem("settings");
if (settingsString != undefined && settingsString != null && settingsString.length > 0) {
    loadSettings(settings, JSON.parse(settingsString));
}

addSidebarButton("Settings...", editSettings);