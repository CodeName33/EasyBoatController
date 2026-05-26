var sidebar = document.getElementById("sidebar");

function initSideBar() {
    
	
}

/**
 * 
 * @param {string} key 
 * @param {boolean} isCritical 
 */
function reportCritical(key, isCritical) {
    var field = document.getElementById("status_" + key);
    if (field != null) {
        switchClass(field, "success", !isCritical);
        switchClass(field, "error", isCritical);
    }
}

/**
 * 
 * @param {string} key 
 * @param {string} text 
 * @param {string | number} statusText 
 * @param {boolean | undefined} isCritical 
 */
function reportStatus(key, text, statusText, isCritical = undefined) {
    var field = document.getElementById("status_" + key);
    if (field == null) {
        var status = document.getElementById("status");
        if (status != null) {
            var property = createElement("div", { parent: status, class: "property" });
            createElement("div", { parent: property, class: "label", text: text });
            field = createElement("div", { parent: property, class: "value", text: statusText, id: "status_" + key });
            if (isCritical != undefined) {
                switchClass(field, "success", !isCritical);
                switchClass(field, "error", isCritical);
            }
        }
    } else {
        field.innerText = `${statusText}`;
        if (isCritical != undefined) {
            switchClass(field, "success", !isCritical);
            switchClass(field, "error", isCritical);
        }
    }

    field = document.getElementById("bc_" + key);
    if (field != null) {
        field.innerText = `${statusText}`;
    }
}

/**
 * 
 * @param {string} text 
 * @param {string} url 
 */
function addSidebarDownloadLink(text, url) {
    createElement("a", { parent: sidebar, text: text, download: 1, href: url, class: "button" });
}


/**
 * 
 * @param {string} text 
 * @param {function} action 
 * @returns 
 */
function addSidebarButton(text, action) {
    return createElement("div", { parent: sidebar, text: text, onclick: action, class: "button" });
}


initSideBar();