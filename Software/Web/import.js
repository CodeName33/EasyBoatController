var areaImport = null;
var importType = "";

function importRouteDialog() {
    //areaImport = createModalWindow("Import Route", closeModalWindow, undefined, closeModalWindow);
	var input = document.getElementById("import_route");
	if (input == null) {
    	input = createElement("input", { parent: document.body, id: "import_route", style: "display:none", type: "file", onchange: onImportSelected });
	}
    input.click();
    
}

function onImportSelected(e) {
    var input = e.currentTarget;
    //document.getElementById("debug").innerText = prop_dump(input.files);
    if (input.files) {
        for (let file of input.files) {
            var parts = file.name.split(".");
            var ext = parts[parts.length - 1].toLowerCase();
            importType = ext;
            var reader = new FileReader();
            reader.onload = onImportReaded;
            reader.onerror = function() {
                showFatalError("Can't read file");
            };
            reader.readAsArrayBuffer(file);
            //document.getElementById("debug").innerText = prop_dump(file);
        }
    }
}

function newRoute() {
	route = {
		name: "New Route",
		points: [],
	};
}

function importGPX(fileData) {
	const parser = new DOMParser();
	var doc = parser.parseFromString(fileData, "application/xml");
	newRoute();
	var name = doc.querySelector("name");
	if (name != null) {
		if (name.textContent.trim().length > 0) {
			route.name = name.textContent;
		}
	}
	var rtepts = doc.querySelectorAll("rtept");
	for (let rtept of rtepts) {
		var point = { x: parseFloat(rtept.getAttribute("lon")), y: parseFloat(rtept.getAttribute("lat")) };
		if (route.points.length == 0 || route.points[route.points.length - 1].x != point.x || route.points[route.points.length - 1].y != point.y)
		{
			route.points.push(point);
		}
	}

	trkpts = doc.querySelectorAll("trkpt");
	for (let rtept of trkpts) {
		var point = { x: parseFloat(rtept.getAttribute("lon")), y: parseFloat(rtept.getAttribute("lat")) };
		if (route.points.length == 0 || route.points[route.points.length - 1].x != point.x || route.points[route.points.length - 1].y != point.y)
		{
			route.points.push(point);
		}
	}
	
	finishImport();
}

function importGPXDebug(fileData) {
	const parser = new DOMParser();
	var doc = parser.parseFromString(fileData, "application/xml");
	newRoute();
	var name = doc.querySelector("name");
	if (name != null) {
		if (name.textContent.trim().length > 0) {
			route.name = name.textContent;
		}
	}
	var rtepts = doc.querySelectorAll("rtept");
	for (let rtept of rtepts) {
		var point = { x: parseFloat(rtept.getAttribute("lon")), y: parseFloat(rtept.getAttribute("lat")) };
		if (route.points.length == 0 || route.points[route.points.length - 1].x != point.x || route.points[route.points.length - 1].y != point.y)
		{
			route.points.push(point);
		}
	}

	var points = [];
	debugCollectedRoute = [];
	trkpt = doc.querySelectorAll("trkpt");
	for (let rtept of trkpt) {
		var point = { x: parseFloat(rtept.getAttribute("lon")), y: parseFloat(rtept.getAttribute("lat")) };
		debugCollectedRoute.push({
			latitude: parseFloat(rtept.getAttribute("lat")),
			longitude: parseFloat(rtept.getAttribute("lon")),
			compass: parseFloat(rtept.getAttribute("cmp")),
			time: parseInt(rtept.getAttribute("tm")),
		});
		if (points.length == 0 || points[points.length - 1].x != point.x || points[points.length - 1].y != point.y)
		{
			points.push(point);
			route.points.push(point);
			
			if (points.length > settings.gps.pointsToGroup) {

				var crdAvg = {
					x: 0,
					y: 0,
				};
				for (let c of points) {
					crdAvg.x += c.x;
					crdAvg.y += c.y;
				}
				crdAvg.x /= points.length;
				crdAvg.y /= points.length;
				points.shift();

				//route.points.push(crdAvg);
			}
		}
	}
	
	finishImport();
}

function importKML(fileData) {
	const parser = new DOMParser();
	var doc = parser.parseFromString(fileData, "application/xml");
	var lineStrings = doc.querySelectorAll("LineString");
	newRoute();
	for (let lineString of lineStrings) {
		var coordinates = lineString.querySelectorAll("coordinates");
		for (let coordinate of coordinates) {
			var crds = coordinate.textContent;
			for (let coord of crds.split('\n')) {
				var parts = coord.trim().split(',');
				var s = 0;
				if (parts.length > 2) {
					route.points.push({ x: parseFloat(parts[0]), y: parseFloat(parts[1]) });
				}
			}
		}
	}

	finishImport();
}

function finishImport() {
	if (route.points.length > 0) {
		scrollToRoute();
		updateImportInfo();
	} else {
		showFatalError("No route points found");
	}
}

function onImportReaded(e) {
	/*
    if (importType == "kmz") {
        var zip = new JSZip();
        zip.loadAsync(e.target.result).then(
            function(z) {
                if ("doc.kml" in z.files) {
                    z.files["doc.kml"].async('string').then(function (fileData) {
                        importKML(fileData);
                      });
                }
            }
        );
    } else*/
	  if (importType == "kml") {
		var dec = new TextDecoder("utf-8");
		importKML(dec.decode(e.target.result));
	} else if (importType == "gpx") {
		var dec = new TextDecoder("utf-8");
		importGPX(dec.decode(e.target.result));
	} else if (importType == "xml") {
		var dec = new TextDecoder("utf-8");
		importGPXDebug(dec.decode(e.target.result));
	}else {
		showFatalError("Format '" + importType + "' not supported. Use KML or GPX files");
	}
}

function updateImportInfo() {
	if (route.points.length > 0) {
		document.getElementById("route_name").innerText = route.name;
		document.getElementById("route_points").innerText = route.points.length;
		document.getElementById("route_length").innerText = Math.floor(getRouteDistance(route)) + "m";
	} else {
		document.getElementById("route_name").innerText = route.name;
		document.getElementById("route_points").innerText = "N/A";
		document.getElementById("route_length").innerText = "N/A";
	}
}

function saveRoute() {
	route.name = document.getElementById("save_route_name").value;
	var routes = storageGetObject("routes");
	if (route.name in routes) {
		askQuestion("Overwriting", "Route with name '" + route.name + "' already exists. Overwrite?", () => {
			routes[route.name] = route;
			localStorage.setItem("routes", JSON.stringify(routes));
			updateImportInfo();
			closeModalWindow();
			closeModalWindow();
		});
	} else {
		routes[route.name] = route;
		localStorage.setItem("routes", JSON.stringify(routes));
		updateImportInfo();
		closeModalWindow();
	}
}

function saveRouteDialog() {
	if (route.points.length > 0) {
		var window = createModalWindow("Save Route", saveRoute, undefined, closeModalWindow);
		{
			var area = createElement("div", { parent: window, class: "settings-prop-area"});
			createElement("div", { parent: area, text: "Route Name", class: "settings-label" });
			createElement("input", { parent: area, id: "save_route_name", value: route.name, class: "settings-edit" });
		}
	} else {
		showFatalError("Error", "No points in current route");
	}
}

function deleteRoute(e) {
	route = e.currentTarget.object;

	askQuestion("Delete", "Delete route with name '" + route.name + "'?",  () => {
		var routes = storageGetObject("routes");
		if (route.name in routes) {
			delete routes[route.name];
			localStorage.setItem("routes", JSON.stringify(routes));
		}
		closeModalWindow();
		closeModalWindow();
		loadRouteDialog();
	});
	
}

function removeFirstPoint() {
	if (route.points.length > 1) {
		route.points.shift();
		updateImportInfo();
	}
}

function loadRoute(e) {
	route = e.currentTarget.object;
	scrollToRoute();
	updateImportInfo();
	closeModalWindow();
}

function loadRouteDialog() {
	var window = createModalWindow("Load Route", undefined, undefined, closeModalWindow);

	var table = createElement("table", { parent: window, class: "settings-table"});
	var tr = createElement("tr", { parent: table, class: ""});
	createElement("th", { parent: tr, text: "Name", class: ""});
	createElement("th", { parent: tr, text: "Points", class: ""});
	createElement("th", { parent: tr, text: "Distance", class: ""});
	createElement("th", { parent: tr, text: "Load", class: ""});
	createElement("th", { parent: tr, text: "Delete", class: ""});

	var routes = storageGetObject("routes");
	for (var key in routes) {
		var r = routes[key];
		tr = createElement("tr", { parent: table, class: "", object: routes[key] });
		createElement("td", { parent: tr, text: r.name, class: ""});
		createElement("td", { parent: tr, text: r.points.length, class: ""});
		createElement("td", { parent: tr, text: Math.floor(getRouteDistance(r)) + "m", class: ""});
		var load = createElement("td", { parent: tr, class: ""});
		createElement("div", { parent: load, text: "Load", class: "settings-button button", object: routes[key], onclick: loadRoute });
		var delet = createElement("td", { parent: tr, class: ""});
		createElement("div", { parent: delet, text: "Delete", class: "settings-button button", object: routes[key], onclick: deleteRoute });
	}
}

function routeManagerDialog() {
	areaImport = createModalWindow("Route manager", undefined, undefined, closeModalWindow);
	createElement("div", { parent: areaImport, text: "Route Info", class: "settings-group" });
	{
		var area = createElement("div", { parent: areaImport, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Route Name", class: "settings-label" });
		createElement("div", { parent: area, id: "route_name", class: "settings-view" });
	}
	{
		var area = createElement("div", { parent: areaImport, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Route Points", class: "settings-label" });
		createElement("div", { parent: area, id: "route_points", class: "settings-view" });
	}
	{
		var area = createElement("div", { parent: areaImport, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Route Distance", class: "settings-label" });
		createElement("div", { parent: area, id: "route_length", class: "settings-view" });
	}
	{
		var area = createElement("div", { parent: areaImport, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Remove first poin", class: "settings-label" });
		createElement("div", { parent: area, text: "Remove", class: "settings-button button", onclick: removeFirstPoint });
	}
	createElement("div", { parent: areaImport, text: "Save/Load", class: "settings-group" });
	{
		var area = createElement("div", { parent: areaImport, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Load saved route", class: "settings-label" });
		createElement("div", { parent: area, text: "Load...", class: "settings-button button", onclick: loadRouteDialog });
	}
	{
		var area = createElement("div", { parent: areaImport, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Save current route", class: "settings-label" });
		createElement("div", { parent: area, text: "Save...", class: "settings-button button", onclick: saveRouteDialog });
	}
	createElement("div", { parent: areaImport, text: "Import", class: "settings-group" });
	{
		var area = createElement("div", { parent: areaImport, class: "settings-prop-area"});
		createElement("div", { parent: area, text: "Import from GPX or Navionics KML", class: "settings-label" });
		createElement("div", { parent: area, text: "Import...", class: "settings-button button", onclick: importRouteDialog });
	}

	if (settings.emulation.enabled) {
		createElement("div", { parent: areaImport, text: "Emulation", class: "settings-group" });
		{
			var area = createElement("div", { parent: areaImport, class: "settings-prop-area"});
			createElement("div", { parent: area, text: "Create sample route for emulation", class: "settings-label" });
			createElement("div", { parent: area, text: "Create", class: "settings-button button", onclick: emulatePoints });
		}
	}
	updateImportInfo();
}


addSidebarButton("Route management...", routeManagerDialog);
//addSidebarButton("Import Route...", importRouteDialog);