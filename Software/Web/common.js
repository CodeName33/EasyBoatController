function createElement(tag, props) {
    var e = document.createElement(tag);
    for (var key in props) {
        if (key == "parent") {
            if (props[key] != null) {
                props[key].appendChild(e);
            }
        } else if (key == "insert") {
            if (props[key] != null) {
                if (props[key].firstElementChild != null) {
                    props[key].insertBefore(e, props[key].firstElementChild);
                } else {
                    props[key].appendChild(e);
                }
            }
        } else if (key == "onclick") {
            e.onclick = props[key];
        } else if (key == "onblur") {
            e.onblur = props[key];
        } else if (key == "oninput") {
            e.oninput = props[key];
            e.onpropertychange = props[key];
        } else if (key == "onkeyenter") {
            e.onkeyenter = props[key];
            e.onkeydown = function(e) { if (e.key == "Enter") { e.currentTarget.onkeyenter(e); } } ;
        } else if (key == "onkeydown") {
            e.onkeydown = props[key];
        } else if (key == "text") {
            e.innerText = props[key];
        } else if (key == "html") {
            e.innerHTML = props[key];
        } else if (typeof props[key] === 'function') {
            e[key] = props[key];
        } else if (typeof props[key] === 'object' && props[key] !== null) {
            e[key] = props[key];
        } else {
            e.setAttribute(key, props[key]);
        }
    }
    return e;
}

function showFatalError(title, text) {
	var area = createModalWindow(title, closeModalWindow, undefined, closeModalWindow);
	area.innerText = text;
}

function askQuestion(title, text, onOk) {
	var area = createModalWindow(title, onOk, closeModalWindow, closeModalWindow);
	area.innerText = text;
}

var modalZ = 100;
function closeModalWindow() {
    var area = document.getElementById("modal_" + modalZ);
    if (area != null) {
        area.parentElement.removeChild(area);
        area.windowClosed = true;
		modalZ--;
    }
}

function addModalButton(text, action) {
	var buttons = document.getElementById("modal-buttons");
	if (buttons != null) {
		createElement("div", { "parent": buttons, class: "button", text: text, onclick: action } );
	}
}

function createModalWindow(title, onOk, onCancel, onScreen) {
	modalZ++;
    //closeModalWindow();
    var area = createElement("div", { id: "modal_" + modalZ, "parent": document.body, class: "modal-area", style: "z-index: " + modalZ + ";" } );
    var window = createElement("div", { "parent": area, class: "modal-window" } );
    createElement("div", { "parent": window, class: "title", text: title } );
    var windowArea = createElement("div", { "parent": window, class: "area" } );
    var buttons = createElement("div", { id: "modal-buttons", "parent": window, class: "buttons" } );
    if (onOk != undefined) {
        createElement("div", { "parent": buttons, class: "button", text: "OK", onclick: onOk } );
    }
    if (onCancel != undefined) {
        createElement("div", { "parent": buttons, class: "button", text: "Cancel", onclick: onCancel } );
    }
	if (onScreen != undefined) {
		area.onclick = function(e) {
			if (e.target == e.currentTarget) {
				onScreen(e);
			}
		}
	}
    windowArea.windowClosed = false;
    return windowArea;
}


function receiveRemoteFile(url, onSuccess, onError = undefined) {
    //console.log("Request: " + url);
    var http = new XMLHttpRequest();
    http.onSuccess = onSuccess;
    http.onError = onError;
    http.onreadystatechange = function(e) {
        //console.log("onreadystatechange: " + prop_dump(e));
        if (e.currentTarget.readyState == 4) {
            //console.log("Result: " + e.currentTarget.status);
            if (e.currentTarget.status == 200) {
                if (e.currentTarget.onSuccess != undefined) {
                    e.currentTarget.onSuccess(e.currentTarget.response);
                }
            } else {
                if (e.currentTarget.onError != undefined) {
                    e.currentTarget.onError(e.currentTarget.status);
                }
            }
        }
    };
    http.open("GET", url, true);
    http.send();
}

var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};
function downloadFileData(fileName, fileData, contentType)
{
    var a = document.createElement("a");
    a.setAttribute("href", "data:" + contentType + ";base64," + Base64.encode(fileData));
    a.setAttribute("download", fileName);
    a.style.position = 'absolute';
    a.style.left = '-9999px';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function downloadFileDatab64(fileName, fileDatab64, contentType)
{
    var a = document.createElement("a");
    a.setAttribute("href", "data:" + contentType + ";base64," + fileDatab64);
    a.setAttribute("download", fileName);
    a.style.position = 'absolute';
    a.style.left = '-9999px';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function clearElement(e) {
    while (e.firstChild != null) {
        e.removeChild(e.firstChild);
    }
}

function prop_dump(e) {
    var s = "";
    for (key in e) {
        s += key + " = " + e[key] + "\n";
    }
    return s;
}

function downloadSelf() {
    receiveRemoteFile(window.location.href, function(html) {
        //console.log(html);
        downloadFileData("EasyBoatController.htm", html, "application/octet-stream");
    });
}

function checkLocal() {
    /*
	if (!window.location.href.startsWith("file://")) {
		addSidebarButton("Download Local!", downloadSelf);
	}
        */
}

function setInnerText(id, innerText) {
	var e = document.getElementById(id);
	if (e != null) {
		e.innerText = innerText;
	}
}

function hasClass(e, className)
{
    return (((" " + e.getAttribute("class").trim() + " ").indexOf(" " + className + " ")) >= 0);
}

function switchClass(e, className, v)
{
    var attr = e.getAttribute("class");
    if (attr == null) {
        attr = "";
    }

    if (v)
    {
        e.setAttribute("class", (" " + attr.trim() + " ").split(" " + className + " ").join("") + " " + className + " ");
    }
    else
    {
        e.setAttribute("class", (" " + attr.trim() + " ").split(" " + className + " ").join(""));
    }
}

function storageGet(name) {
	var str = localStorage.getItem(name);
	if (str != undefined && str != null && str.length > 0) {
		try {
			return JSON.parse(str);
		} catch {}
	}
	return null;
}

function storageGetObject(name) {
	var str = localStorage.getItem(name);
	if (str != undefined && str != null && str.length > 0) {
		try {
			return JSON.parse(str);
		} catch {}
	}
	return {};
}