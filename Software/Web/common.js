/**
 * 
 * @param {string} tag 
 * @param {*} props 
 * @returns {HTMLElement}
 */
function createElement(tag, props) {
    /** @type {HTMLElement} */
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
            //@ts-ignore
            e.onpropertychange = props[key];
        } else if (key == "onkeyenter") {
            //@ts-ignore
            e.onkeyenter = props[key];
            /**
             * 
             * @param {KeyboardEvent} e 
             */
            e.onkeydown = function(e) { if (e.key == "Enter") { 
                //@ts-ignore
                e.currentTarget?.onkeyenter(e); 
            } } ;
        } else if (key == "onkeydown") {
            e.onkeydown = props[key];
        } else if (key == "text") {
            e.innerText = props[key];
        } else if (key == "html") {
            e.innerHTML = props[key];
        } else if (typeof props[key] === 'function') {
            //@ts-ignore
            e[key] = props[key];
        } else if (typeof props[key] === 'object' && props[key] !== null) {
            //@ts-ignore
            e[key] = props[key];
        } else {
            e.setAttribute(key, props[key]);
        }
    }
    return e;
}

/**
 * 
 * @param {string} title 
 * @param {string} text 
 */
function showFatalError(title, text) {
	var area = createModalWindow(title, closeModalWindow, undefined, closeModalWindow);
	area.innerText = text;
}

/**
 * 
 * @param {string} title 
 * @param {string} text 
 * @param {function} onOk 
 */
function askQuestion(title, text, onOk) {
	var area = createModalWindow(title, onOk, closeModalWindow, closeModalWindow);
	area.innerText = text;
}

var modalZ = 100;
function closeModalWindow() {
    var area = document.getElementById("modal_" + modalZ);
    if (area != null) {
        area.parentElement?.removeChild(area);
        //@ts-ignore
        area.windowClosed = true;
		modalZ--;
    }
}

/**
 * 
 * @param {string} text 
 * @param {function} action 
 */
function addModalButton(text, action) {
	var buttons = document.getElementById("modal-buttons");
	if (buttons != null) {
		createElement("div", { "parent": buttons, class: "button", text: text, onclick: action } );
	}
}

/**
 * 
 * @param {string} title 
 * @param {function | undefined} onOk 
 * @param {function | undefined} onCancel 
 * @param {function | undefined} onScreen 
 * @returns {HTMLElement}
 */
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
        /**
         * 
         * @param {PointerEvent} e 
         */
		area.onclick = function(e) {
			if (e.target == e.currentTarget) {
				onScreen(e);
			}
		}
	}
    //@ts-ignore
    windowArea.windowClosed = false;
    return windowArea;
}

/**
 * 
 * @param {string} url 
 * @param {function} onSuccess 
 * @param {function | undefined} onError 
 */
function receiveRemoteFile(url, onSuccess, onError = undefined) {
    //console.log("Request: " + url);
    var http = new XMLHttpRequest();
    //@ts-ignore
    http.onSuccess = onSuccess;
    //@ts-ignore
    http.onError = onError;
    http.onreadystatechange = function(e) {
        //console.log("onreadystatechange: " + prop_dump(e));
        //@ts-ignore
        if (e.currentTarget.readyState == 4) {
            //console.log("Result: " + e.currentTarget.status);
            //@ts-ignore
            if (e.currentTarget.status == 200) {
                //@ts-ignore
                if (e.currentTarget.onSuccess != undefined) {
                    //@ts-ignore
                    e.currentTarget.onSuccess(e.currentTarget.response);
                }
            } else {
                //@ts-ignore
                if (e.currentTarget.onError != undefined) {
                    //@ts-ignore
                    e.currentTarget.onError(e.currentTarget.status);
                }
            }
        }
    };
    http.open("GET", url, true);
    http.send();
}

//@ts-ignore
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

/**
 * 
 * @param {string} fileName 
 * @param {*} fileData 
 * @param {string} contentType 
 */
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

/**
 * 
 * @param {string} fileName 
 * @param {string} fileDatab64 
 * @param {string} contentType 
 */
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

/**
 * 
 * @param {*} e 
 */
function clearElement(e) {
    while (e.firstChild != null) {
        e.removeChild(e.firstChild);
    }
}

/**
 * 
 * @param {*} e 
 * @returns 
 */
function prop_dump(e) {
    var s = "";
    for (var key in e) {
        s += key + " = " + e[key] + "\n";
    }
    return s;
}

function downloadSelf() {
    receiveRemoteFile(window.location.href, 
        /**
         * 
         * @param {*} html 
         */
        function(html) {
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

/**
 * 
 * @param {string} id 
 * @param {string} innerText 
 */
function setInnerText(id, innerText) {
	var e = document.getElementById(id);
	if (e != null) {
		e.innerText = innerText;
	}
}

/**
 * 
 * @param {*} e 
 * @param {string} className 
 * @returns 
 */
function hasClass(e, className)
{
    return (((" " + e.getAttribute("class").trim() + " ").indexOf(" " + className + " ")) >= 0);
}

/**
 * 
 * @param {*} e 
 * @param {string} className 
 * @param {boolean} v 
 */
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

/**
 * 
 * @param {string} name 
 * @returns 
 */
function storageGet(name) {
	var str = localStorage.getItem(name);
	if (str != undefined && str != null && str.length > 0) {
		try {
			return JSON.parse(str);
		} catch {}
	}
	return null;
}

/**
 * 
 * @param {string} name 
 * @returns 
 */
function storageGetObject(name) {
	var str = localStorage.getItem(name);
	if (str != undefined && str != null && str.length > 0) {
		try {
			return JSON.parse(str);
		} catch {}
	}
	return {};
}