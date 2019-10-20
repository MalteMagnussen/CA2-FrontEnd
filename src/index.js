import 'bootstrap/dist/css/bootstrap.css'
import { isNullOrUndefined } from 'util';
import { type } from 'os';

/* The JavaScript Code for Navigation Dynamic Behavior */
// Our Cache - Stores the partial .HTML pages.
var partialsCache = {} // Apparently important that this is at the top, or it won't work. 
/* If no Fragment Identifier is provided then we default to home */
if (!location.hash) { // Uses the falsy concept
    location.hash = "#home";
}
/* Navigate once to the initial hash value */
navigate();
/* Listen for fragment identifier value changes (The # at the end of the URL is the fragment) */
/* Navigate whenever the fragment identifier value changes */
window.addEventListener("hashchange", navigate);
/* Encapsulates an HTTP GET request using XMLHttpRequest
Fetches the file at the given path, then calls the 
callback with the content of the file. */
// TODO - Should maybe be replaced with the fetch stuff teachers wants us to use? 
function fetchFile(path, callback) {
    // Create a new AJAX request for fetching the partial HTML file.
    var request = new XMLHttpRequest();
    // Call the callback with the content loaded from the file. 
    request.onload = function () { // This is the function that gets invoked once the file is loaded.
        callback(request.responseText); // We get the content here. 
    };
    // Fetch the partial HTML File given the fragment.
    request.open("GET", path); // Initialize the request. HTTP GET request + PATH
    request.send(null); // Finalize the request.
}

/* Gets the appropriate content for the given fragment identifier */
// Implements a cache.
function getContent(fragment, callback) {
    // If the page has been fetched before:
    if (partialsCache[fragment]) {
        // Just use the cached version:
        callback(partialsCache[fragment]);
    } else {
        fetchFile(fragment + ".html", function (content) {
            // Store the fetched content in the cache
            partialsCache[fragment] = content;
            // Pass the content to the callback
            callback(content);
        });
    }
}
/* Updates Dynamic content based on the fragment identifier */
// Is hoisted.
function navigate() {
    // Get a reference to the content Div
    var contentDiv = document.getElementById("content");
    // Get a reference to the fragment. We use substr(1) to remove the '#' hash from the start of the string. 
    var fragment = location.hash.substr(1);
    // Set the content div innerHTML based on the fragment identifier.
    getContent(fragment, function (content) {
        contentDiv.innerHTML = content;
        switch (fragment) {
            case "get": endpoints(); break;
        }
    });
    changeActiveNavbarElement();
}
function changeActiveNavbarElement() {
    var btnContainer = document.getElementById("navbarNav");
    // Get all items with class="nav-item" inside the container
    var btns = btnContainer.getElementsByClassName("nav-item");
    // Loop through the items and add the active class to the current/clicked nav
    for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function () {
            var current = document.getElementsByClassName("active");
            // If there's no active class
            if (current.length > 0) {
                current[0].className = current[0].className.replace(" active", "");
            }
            // Add the active class to the current/clicked nav
            this.className += " active";
        });
    }
}
/* End of JavaScript code for dynamic navigation behavior */

const url = 'https://maltemagnussen.com/CA2/api/search/';
const testurl = 'http://localhost:8080/CA2/api/search/';

function handleHttpErrors(res) {
    if (!res.ok) {
        return Promise.reject({ status: res.status, fullError: res.json() })
    }
    return res.json();
}

/*---------------------------------------------*/
/*----------------- Begin CSS -----------------*/
/*---------------------------------------------*/


function addCssToElementChildren(elementIdParent, element, cssClassArray) {
    let htmlElementList = document.getElementById(elementIdParent).querySelectorAll(element);
    Array.from(htmlElementList).forEach(element => {
        cssClassArray.forEach(cssClass => {
            element.classList.add(cssClass);
        })
    });
}

function addCssToElementChildrenFromClass(elementClassParent, element, cssClassArray) {
    let htmlParents = document.getElementsByClassName(elementClassParent)
    Array.from(htmlParents).forEach(htmlParent => {
        let htmlChild = htmlParent.querySelectorAll(element);
        Array.from(htmlChild).forEach(element => {
            cssClassArray.forEach(cssClass => {
                element.classList.add(cssClass);
            })
        });
    });
}

function addCssToElement(element, cssClassArray) {
    let htmlElement = document.querySelector(element);
    cssClassArray.forEach(cssClass => {
        htmlElement.classList.add(cssClass);
    });

}

/*---------------------------------------------*/
/*------------------ End CSS ------------------*/
/*---------------------------------------------*/

/*---------------------------------------------*/
/*------------ Begin All GET Calls ------------*/
/*---------------------------------------------*/

function endpoints() {
    fillViewPersonWithDataDiv();
    fillViewAllPersonsWithDataDiv();
    fillViewAllPersonsWithHobbyDiv();
    fillViewAllPersonsWithZipDiv();
    allHobbies();
    allZipcodes();

    document.getElementById("buttonCreateAll").addEventListener("click", createAll);

    document.getElementById("inputCityZipCreateAll").addEventListener("input", actZipCode);

    document.getElementById("inputHobbyNameCreateAll").addEventListener("input", actHobbyName);

    document.getElementById("confirmEditHobby").addEventListener("click", confirmEditHobby);

    document.getElementById("viewPersonWithDataButtonTAG").addEventListener('click', function (event) {
        event.preventDefault();
        singleuser();
    });
    document.getElementById("viewAllPersonsWithDataButtonTAG").addEventListener('click', function (event) {
        event.preventDefault();
        //allUsersToPtag();
        allUsersToTableTag();
    });
    document.getElementById("viewAllPersonsWithHobbyButtonTAG").addEventListener('click', function (event) {
        event.preventDefault();
        getAllPersonsWithHobbyByName();
    });
    document.getElementById("viewAllPersonsWithZipButtonTAG").addEventListener('click', function (event) {
        event.preventDefault();
        allPersonsInCity();
    });
    addCssToElementChildrenFromClass("toStyle", "button", ["btn", "btn-outline-dark"]);
    addCssToElementChildren("content", "input", ["form-control"]);
    
    document.getElementById("createSimplePerson").addEventListener("click", function () {
        addPersonSimple();
    })
    addCssToElementChildren("content", "button", ["btn", "btn-outline-dark"]);
    addCssToElementChildren("content", "input", ["form-control"]);
}

/*---------------------------------------------*/
/*------------- End All GET Calls -------------*/
/*---------------------------------------------*/

/*---------------------------------------------*/
/*---------- Begin Get Person By Name ---------*/
/*---------------------------------------------*/

function fillViewPersonWithDataDiv() {
    emptyTag('viewPersonWithData');
    let ptag = document.createElement('p');
    ptag.setAttribute('id', 'viewPersonWithDataPTAG');

    let inputtag = document.createElement('input');
    inputtag.setAttribute('id', 'viewPersonWithDataInputTAG');
    inputtag.setAttribute('type', 'text');
    inputtag.setAttribute('placeholder', 'Name');

    let buttontag = document.createElement('button');
    buttontag.innerHTML = 'Get User';
    buttontag.setAttribute('id', 'viewPersonWithDataButtonTAG');

    let div = document.getElementById('viewPersonWithData');
    div.appendChild(inputtag);
    div.appendChild(buttontag);
    div.appendChild(ptag);
}

function singleuser() {
    let username = document.getElementById('viewPersonWithDataInputTAG').value;
    if (!username) {
        document.getElementById('viewPersonWithDataPTAG').innerHTML = 'Type in a name'
    }
    else {
        let urlName = url + 'person/' + username;
        fetch(urlName)
            .then(handleHttpErrors)
            .then(fetchedData => {
                document.getElementById('viewPersonWithDataPTAG').innerHTML = writeToPTagPrPerson(fetchedData[0]);
            })
            .catch(err => {
                if (err.status) {
                    err.fullError.then(e => document.getElementById('viewPersonWithDataPTAG').innerHTML = "Error: " + e.detail)
                }
                else { console.log("Network error"); }
            });
    }
}

function writeToPTagPrPerson(jsondata) {
    let hobbies = '';
    jsondata['hobbies'].forEach(element => {
        hobbies = hobbies + '<br>' + element.name + ' - ' + element.description;
    });
    let phones = '';
    jsondata['phones'].forEach(element => {
        phones = phones + '<br>' + element.description + ': ' + element.number;
    });

    let stringToWrite =
        "<br>Firstname: " + jsondata['firstName'] + ' ' + jsondata['lastName']
        + "<br>e-mail: " + jsondata['email'];
    if (!isNullOrUndefined(jsondata['address'])) {
        stringToWrite = stringToWrite + "<br>Address: " + jsondata['address']['street'] + ', '
            + jsondata['address']['additionalInfo'] + ', ' + jsondata['address']['cityInfo']['zipCode']
            + ' ' + jsondata['address']['cityInfo']['city'];
    }
    stringToWrite = stringToWrite
        + "<br>Hobbies: " + hobbies
        + "<br>Phones: " + phones;
    return stringToWrite;
}

/*---------------------------------------------*/
/*----------- End Get Person By Name ----------*/
/*---------------------------------------------*/

/*---- To clear the div of data ---*/
function emptyTag(divID) {
    let div = document.getElementById(divID);
    div.innerHTML = "";
}

/*---------------------------------------------*/
/*---------- Begin Add Person Simple ----------*/
/*---------------------------------------------*/
function addPersonSimple() {
    var output = document.getElementById("outputPersonSimple");
    fetch(url + "create/person", createPersonOptions())
        .then(res => handleHttpErrors(res))
        .then(function (data) {
            console.log(data);
            output.innerHTML = "<p>Person created:</p><br>"
                + "<p>ID: " + data.id + "<br>"
                + "<p>First name: " + data.firstName + "<br>"
                + "<p>Last name: " + data.lastName + "<br>"
                + "<p>email: " + data.email + "<br>";
        })
        .catch(err => {
            if (err.status) {
                err.fullError.then(e => output.innerHTML = "Error:<br><br>Status: "
                + e.code + "<br>" + e.message)
            }
            else {
                console.log("Network error");
            }
        });
}

function createPersonOptions() {
    var FirstName = document.getElementById("inputFirstNamePersonSimple").value;
    var LastName = document.getElementById("inputLastNamePersonSimple").value;
    var Email = document.getElementById("inputEmailPersonSimple").value;
    var Method = "POST";
    var data = {
        firstName: FirstName,
        lastName: LastName,
        email: Email
    }

    let options = {
        method: Method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    console.log(options);
    return options;
}

/*---------------------------------------------*/
/*----------- End Add Person Simple -----------*/
/*---------------------------------------------*/

/*---------------------------------------------*/
/*------------- Begin  Create All -------------*/
/*---------------------------------------------*/

var controller = new AbortController();
var signal = controller.signal;

function actHobbyName() {
    controller.abort();
    controller = new AbortController();
    signal = controller.signal;
    checkIfInputExists(false);
}

function actZipCode() {
    controller.abort();
    controller = new AbortController();
    signal = controller.signal;
    checkIfInputExists(true);
}

var lastExisted = false;
function checkIfInputExists(isCity) {
    //Data from DOM
    var inputHobbyName = document.getElementById("inputHobbyNameCreateAll");
    var inputHobbyDescription = document.getElementById("inputHobbyDescriptionCreateAll");
    var hobbyStatus = document.getElementById("hobbyStatus");

    var inputZipCode = document.getElementById("inputCityZipCreateAll");
    var inputCityName = document.getElementById("inputCityNameCreateAll");
    var cityStatus = document.getElementById("cityStatus");

    //Variables based on boolean isCity
    //If isCity then the function is being used to check if a city exists
    //If not then the function is being used to check if a hobby exists
    var checkValue;
    var target;
    var status;
    var uriPart;
    if (isCity) {
        checkValue = inputZipCode;
        target = inputCityName;
        status = cityStatus;
        uriPart = "city/zip/";
    } else {
        checkValue = inputHobbyName;
        target = inputHobbyDescription;
        status = hobbyStatus;
        uriPart = "hobby/";
    }

    //End of variables

    if (checkValue.value == null || checkValue.value === "") {
        target.innerText = "";
        target.value = "";
        if (!target.hasAttribute("disabled")) {
            target.setAttribute("disabled", "true");
        }
        return;
    }
    fetchCheckData(isCity, target, status, uriPart, checkValue);
}

function fetchCheckData(isCity, target, status, uriPart, checkValue) {
    fetch(url + uriPart + checkValue.value, { signal })
    .then(res => { return res.json(); })
    .then(function (data) {
        console.log(data);
        if (data.city || data.description) {
            let output;
            if (isCity) {
                output = data.city;
            } else {
                output = data.description;
            }
            if (data.name != null || data.city) {
                target.innerText = "";
                target.value = "";
                status.innerHTML = "-- Existing ✓ --";
                target.innerText = output;
                target.value = output;
                lastExisted = true;
                if (!target.hasAttribute("disabled")) {
                    target.setAttribute("disabled", "true");
                }
            }
        } else {
            //If we end up here it means that no hobby/city with the given name/zipcode was found
            if (target.hasAttribute("disabled")) {
                target.removeAttribute("disabled");
            }
            if (lastExisted) {
                target.innerText = "";
                target.value = "";
                status.innerHTML = "-- New --";
                lastExisted = false;
            }
        }
    })
    .catch(err => {
        console.log("Request was canceled");
    });
}

function createAll() {
    //Output div
    var outputCreateAll = document.getElementById("outputCreateAll");

    fetch(url + "create-all", createAllOptions("POST"))
    .then(res => handleHttpErrors(res))
    .then(function (data) {
        console.log(data);
        outputCreateAll.innerHTML =
            "ID: " + data.id + "<br>" +
            "First name: " + data.firstName + "<br>" + "Last name: " + data.lastName + "<br>" +
            "Email: " + data.email + "<br>" + "Address<br>Street: " + data.address.street + "<br>" +
            "Additional inforamtion: " + data.address.additionalInfo + "<br>" + "City" + "<br>" +
            "Name: " + data.address.cityInfo.city + "<br>" + "Zipcode: " + data.address.cityInfo.zipCode +
            "<br>" + "Hobby" + "<br>" + "Name: " + data.hobbies[0].name + "<br>" + "Description: " +
            data.hobbies[0].description;
    })
    .catch(err => {
        if (err.status) {
            err.fullError.then(e => outputCreateAll.innerHTML = "Error:<br><br>Status: "
            + e.code + "<br>" + e.message)
        }
        else {
            console.log("Network error");
        }
    });
}

//This function could be converted to a UTIL function and moved to the UTIL category 
function createAllOptions(METHOD) {
    //Data from DOM
    
    var inputFirstName = document.getElementById("inputFirstNameCreateAll");
    var inputLastName = document.getElementById("inputLastNameCreateAll");
    var inputEmail = document.getElementById("inputEmailCreateAll");
    var inputPhone = document.getElementById("inputPhoneCreateAll");
    var inputPhoneDescription = document.getElementById("inputPhoneDescriptionCreateAll");
    var inputAddressStreet = document.getElementById("inputAddressStreetCreateAll");
    var inputAddressInfo = document.getElementById("inputAddressInfoCreateAll");

    var inputHobbyName = document.getElementById("inputHobbyNameCreateAll");
    var inputHobbyDescription = document.getElementById("inputHobbyDescriptionCreateAll");

    var inputZipCode = document.getElementById("inputCityZipCreateAll");
    var inputCityName = document.getElementById("inputCityNameCreateAll");

    var hobby = {
        name: inputHobbyName.value,
        description: inputHobbyDescription.value
    }

    var hobbies = []
    hobbies[0] = hobby;

    var phone = {
        number: inputPhone.value,
        description: inputPhoneDescription.value
    }
    if (!phone.number)
    {
        phone.number = -1;
    }

    var phones = []
    phones[0] = phone;

    var cityInfo = {
        zipCode: inputZipCode.value,
        city: inputCityName.value
    }

    var address = {
        street: inputAddressStreet.value,
        additionalInfo: inputAddressInfo.value,
        cityInfo
    }

    var data = {
        firstName: inputFirstName.value,
        lastName: inputLastName.value,
        email: inputEmail.value,
        hobbies,
        phones,
        address
    }

    let options = {
        method: METHOD,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    console.log(options);
    return options;
}

/*---------------------------------------------*/
/*-------------- End  Create All --------------*/
/*---------------------------------------------*/

/*---------------------------------------------*/
/*----------- Begin Get All Persons -----------*/
/*---------------------------------------------*/

function fillViewAllPersonsWithDataDiv() {
    emptyTag('viewAllPersonsWithData');
    let divtag = document.createElement('div');
    divtag.classList.add('tableDiv');

    let ptag = document.createElement('p');
    ptag.setAttribute('id', 'viewAllPersonsWithDataPTAG');

    let buttontag = document.createElement('button');
    buttontag.innerHTML = 'Get All Users';
    buttontag.setAttribute('id', 'viewAllPersonsWithDataButtonTAG');

    let tabletag = document.createElement('table');
    tabletag.setAttribute('id', 'viewAllPersonsWithDataTableTAG');

    let div = document.getElementById('viewAllPersonsWithData');
    div.appendChild(divtag);
    div.appendChild(buttontag);
    div.appendChild(ptag);
    div.appendChild(tabletag);
}

function allUsersToPtag() {
    let urlAll = url + 'allpersons';
    fetch(urlAll)
        .then(handleHttpErrors)
        .then(jsondata => {

            let allPersonsToWrite = '';

            jsondata.forEach(element => {
                allPersonsToWrite = allPersonsToWrite + writeToPTagPrPerson(element);
            });
            document.getElementById('viewAllPersonsWithDataPTAG').innerHTML = allPersonsToWrite;
        })
        .catch(err => {
            if (err.status) {
                err.fullError.then(e => console.log(e.detail))
            }
            else { console.log("Network error: " + err); }
        });
}

function allUsersToTableTag() {
    emptyTag('viewAllPersonsWithDataTableTAG');
    let urlAll = url + 'allpersons';
    fetch(urlAll)
        .then(handleHttpErrors)
        .then(jsondata => {
            let sortedData = sortPersonJSON(jsondata);
            let table = document.getElementById('viewAllPersonsWithDataTableTAG');
            let headdata = Object.keys(sortedData[0]);
            tableHead(table, headdata);
            tableData(table, sortedData);
            fixTableHeaders();
        })
        .catch(err => {
            if (err.status) {
                err.fullError.then(e => console.log(e.detail))
            }
            else { console.log("Network error: " + err); }
        });
}

function tableHead(table, headData) {
    let head = table.createTHead();
    let row = head.insertRow();
    for (let key of headData) {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.classList.add(key);
        th.appendChild(text);
        row.appendChild(th);
        table.classList.add("table");
        table.classList.add("table-hover");
        head.classList.add("thead-dark");
    }
}

function tableData(table, bodyData) {
    let tbody = document.createElement('tbody');
    table.appendChild(tbody);
    for (let element of bodyData) {
        let row = table.insertRow();
        tbody.appendChild(row);
        for (let key in element) {
            let cell = row.insertCell();
            let obj = JSON.parse(JSON.stringify(element));
            let cellValue = '';
            if (typeof element[key] === 'object') {
                if (key === 'address') {
                    cellValue = obj.address.street + ', ' + obj.address.cityInfo.zipCode + ' ' + obj.address.cityInfo.city;
                }
                else if (key === 'hobbies') {
                    obj.hobbies.forEach(hobby => {
                        cellValue = cellValue + hobby.name + ', ';
                    });
                    cellValue = cellValue.slice(0, -2);
                }
                else if (key === 'phones') {
                    obj.phones.forEach(phone => {
                        cellValue = cellValue + phone.description + ': ' + phone.number + ', ';
                    });
                    cellValue = cellValue.slice(0, -2);
                }
            }
            else if (element[key]) {
                cellValue = element[key];
            }
            else {
                cellValue = cellValue;
            }
            let text = document.createTextNode(cellValue);
            cell.appendChild(text);
        }
    }
}

function fixTableHeaders() {
    Array.from(document.getElementsByClassName("address")).forEach(element => {
        element.innerText = "Address";
    });
    Array.from(document.getElementsByClassName("email")).forEach(element => {
        element.innerText = "E-mail";
    });
    Array.from(document.getElementsByClassName("firstName")).forEach(element => {
        element.innerText = "Firstname";
    });
    Array.from(document.getElementsByClassName("id")).forEach(element => {
        element.innerText = "ID";
    });
    Array.from(document.getElementsByClassName("lastName")).forEach(element => {
        element.innerText = "Lastname";
    });
    Array.from(document.getElementsByClassName("phones")).forEach(element => {
        element.innerText = "Phone numbers";
    });
    Array.from(document.getElementsByClassName("hobbies")).forEach(element => {
        element.innerText = "Hobbies";
    });
}

/*---------------------------------------------*/
/*------------ End Get All Persons ------------*/
/*---------------------------------------------*/

/*---------------------------------------------*/
/*----------- Begin Util Functions ------------*/
/*---------------------------------------------*/

/**
 * Sorts a complete JSON person Object in this Order:
 - id
 - firstName
 - lastName
 - email
 - hobbies
 - phones
 - address
 * @param {Person} persons 
 */
function sortPersonJSON(persons) {
    // Array we return at the end. 
    var returnPersons = [];

    persons.forEach(person => {
        // New Person:
        var returnPerson = {
            id: person.id,
            firstName: person.firstName,
            lastName: person.lastName,
            email: person.email,
            address: person.address,
            hobbies: person.hobbies,
            phones: person.phones,
        };
        // Add sorted person to return array
        returnPersons.push(returnPerson);
    });
    return returnPersons;
}

/*---------------------------------------------*/
/*------------ End Util Functions -------------*/
/*---------------------------------------------*/


/*---------------------------------------------*/
/*-------- Begin Get Hobby/AllHobbies ---------*/
/*---------------------------------------------*/

function allHobbies() {
    let urlAll = url + 'allpersons';
    fetch(urlAll)
        .then(handleHttpErrors)
        .then(jsondata => {
            let hobbiesArray = [];
            jsondata.forEach(element => {
                let obj = JSON.parse(JSON.stringify(element));
                hobbiesArray.push(obj.hobbies);
            });
            fillHobbiesDropDownDiv(hobbiesArray);
            addCssToElementChildrenFromClass("toStyle", "button", ["btn", "btn-outline-dark"]);
            addCssToElementChildren("content", "select", ["form-control"]);
        })
        .catch(err => {
            if (err.status) {
                err.fullError.then(e => console.log(e.detail))
            }
            else { console.log("Network error: " + err); }
        });
}


function fillHobbiesDropDownDiv(allhobbies) {
    emptyTag('allHobbies');
    let ptag = document.createElement('p');
    ptag.setAttribute('id', 'allHobbiesPTAG');

    let selecttag = document.createElement('select');
    selecttag.setAttribute('id', 'allHobbiesDropDownSelectTAG');
    let optionstagDefault = document.createElement('option');
    optionstagDefault.setAttribute('id', 'default');
    optionstagDefault.setAttribute('selected', '');
    optionstagDefault.setAttribute('hidden', '');
    optionstagDefault.innerHTML = 'Select Hobby';
    selecttag.appendChild(optionstagDefault);

    dropDownData(allhobbies).forEach(hobby => {
        let optionstag = document.createElement('option');
        optionstag.setAttribute('id', hobby.replace(/ /g, ''));
        optionstag.setAttribute('value', hobby);
        optionstag.innerHTML = hobby;
        selecttag.appendChild(optionstag);
    })

    let buttontag = document.createElement('button');
    buttontag.innerHTML = 'Get Hobby';
    buttontag.setAttribute('id', 'hobbiesDropDownButtonTAG');

    let buttontagedit = document.createElement('button');
    buttontagedit.innerHTML = 'Edit Hobby';
    buttontagedit.setAttribute('id', 'editHobbyButton');
    buttontagedit.setAttribute('hidden', 'hidden');

    let div = document.getElementById('allHobbies');
    div.appendChild(selecttag);
    div.appendChild(buttontag);
    div.appendChild(buttontagedit);
    div.appendChild(ptag);

    document.getElementById("hobbiesDropDownButtonTAG").addEventListener('click', function (event) {
        event.preventDefault();
        getHobbyByName();
        var outputMessageDiv = document.getElementById("editHobbyMessage");
        outputMessageDiv.innerHTML = "";
        var output = document.getElementById("editHobby");
        output.setAttribute("hidden", "hidden");
    });

    document.getElementById("editHobbyButton").addEventListener("click", spawnAndUpdateEditHobbyMenu);
}

function dropDownData(allhobbies) {
    let hobbyNames = [];
    allhobbies.forEach(element => {
        element.forEach(hobby => {
            hobbyNames.push(hobby.name);
        })
    })
    let uniqueHobbyNames = Array.from(new Set(hobbyNames));
    return uniqueHobbyNames;
}

function spawnAndUpdateEditHobbyMenu() {
    var output = document.getElementById("editHobby");
    var outputInner = document.getElementById("editHobbyInnerDiv");
    if (output.getAttribute("hidden"))
    {
        output.removeAttribute("hidden");
    }
    if (outputInner.getAttribute("hidden"))
    {
        outputInner.removeAttribute("hidden");
    }
    var name = document.getElementById("hobbyTitleEditMenu");
    name.innerHTML = latestHobbyName;

    var outputMessageDiv = document.getElementById("editHobbyMessage");
    outputMessageDiv.innerHTML = "";

    var description = document.getElementById("hobbyDescriptionEditMenu");
    description.value = latestHobbyDescription;
    description.innerText = latestHobbyDescription;
}

var latestHobbyID = 0;
var latestHobbyName = "";
var latestHobbyDescription = "";

function confirmEditHobby() {
    var outputMessageDiv = document.getElementById("editHobbyMessage");
    var innerEditMenu = document.getElementById("editHobbyInnerDiv");
    fetch(url + "hobby", createHobbyOptions())
        .then(res => handleHttpErrors(res))
        .then(function (data) {
            console.log(data);
            innerEditMenu.setAttribute("hidden", "hidden");
            outputMessageDiv.innerHTML = "Hobby successfully edited";
        })
        .catch(err => {
            if (err.status) {
                innerEditMenu.setAttribute("hidden", "hidden");
                err.fullError.then(e => outputMessageDiv.innerHTML = "Error:<br><br>Status: "
                + e.code + "<br>" + e.message);
            }
            else {
                console.log("Network error");
            }
        });
}

function createHobbyOptions() {
    var newDescription = document.getElementById("hobbyDescriptionEditMenu");
    var Method = "PUT";
    var data = {
        name: latestHobbyName,
        description: newDescription.value,
        id: latestHobbyID
    }

    if (data.description == "")
    {
        data.description = "No description";
    }

    let options = {
        method: Method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    console.log(options);
    return options;
}

function getHobbyByName() {
    let selected = document.getElementById('allHobbiesDropDownSelectTAG');

    let hobbyname = selected.options[selected.selectedIndex].value;
    if (selected.options[selected.selectedIndex].id === 'default') {
        document.getElementById('allHobbiesPTAG').innerHTML = 'Select a hobby name'
    }
    else {
        let urlHobby = url + 'hobby/' + hobbyname;
        fetch(urlHobby)
            .then(handleHttpErrors)
            .then(fetchedData => {
                document.getElementById('allHobbiesPTAG').innerHTML = writeToPTagPrHobby(fetchedData);
                if (document.getElementById('editHobbyButton').getAttribute("hidden")) {
                    document.getElementById('editHobbyButton').removeAttribute("hidden");
                }
                latestHobbyName = fetchedData.name;
                latestHobbyDescription = fetchedData.description;
                latestHobbyID = fetchedData.id;
            })
            .catch(err => {
                if (err.status) {
                    err.fullError.then(e => console.log(e.detail))
                }
                else { console.log("Network error"); }
            });
    }
}

function writeToPTagPrHobby(jsondata) {
    let stringToWrite =
        "<br>Hobby: " + jsondata['name']
        + "<br>Description: " + jsondata['description'];
    return stringToWrite;
}

function getAllPersonsWithHobbyByName() {
    emptyTag('viewAllPersonsWithHobbyTableTAG');
    let selected = document.getElementById('allHobbiesDropDownSelectTAG');

    let hobbyname = selected.options[selected.selectedIndex].value;
    if (selected.options[selected.selectedIndex].id === 'default') {
        document.getElementById('allHobbiesPTAG').innerHTML = 'Select a hobby name'
    }
    else {
        let urlHobby = url + '/hobby?hobby=' + hobbyname;
        fetch(urlHobby)
            .then(handleHttpErrors)
            .then(jsondata => {
                let sortedData = sortPersonJSON(jsondata);
                let table = document.getElementById('viewAllPersonsWithHobbyTableTAG');
                let headdata = Object.keys(sortedData[0]);
                tableHead(table, headdata);
                tableData(table, sortedData);
                fixTableHeaders();
            })
            .catch(err => {
                if (err.status) {
                    err.fullError.then(e => console.log(e.detail))
                }
                else { console.log("Network error"); }
            });
    }
}

function fillViewAllPersonsWithHobbyDiv() {
    emptyTag('viewAllPersonsWithHobby');
    let ptag = document.createElement('p');
    ptag.setAttribute('id', 'allPersonsWithHobbyPTAG');

    let buttontag = document.createElement('button');
    buttontag.innerHTML = 'Get All Users With Hobby';
    buttontag.setAttribute('id', 'viewAllPersonsWithHobbyButtonTAG');

    let tabletag = document.createElement('table');
    tabletag.setAttribute('id', 'viewAllPersonsWithHobbyTableTAG');

    let div = document.getElementById('viewAllPersonsWithHobby');
    div.appendChild(buttontag);
    div.appendChild(ptag);
    div.appendChild(tabletag);
}

/*---------------------------------------------*/
/*--------- End Get Hobby/AllHobbies ----------*/
/*---------------------------------------------*/

/*---------------------------------------------*/
/*----------- Begin Zipcode Section -----------*/
/*---------------------------------------------*/

function allZipcodes() {
    let urlAll = url + 'zip';
    fetch(urlAll)
        .then(handleHttpErrors)
        .then(jsondata => {
            fillZipCodeDiv(jsondata);
            addCssToElementChildrenFromClass("toStyle", "button", ["btn", "btn-outline-dark"]);
            addCssToElementChildren("content", "select", ["form-control"]);
        })
        .catch(err => {
            if (err.status) {
                err.fullError.then(e => console.log(e.detail))
            }
            else { console.log("Network error: " + err); }
        });
}

function fillZipCodeDiv(allzips) {
    emptyTag('viewZipCodeData');
    let ptag = document.createElement('p');
    ptag.setAttribute('id', 'viewZipCodeDataPTAG');

    let selecttag = document.createElement('select');
    selecttag.setAttribute('id', 'viewZipCodeDataDropDownSelectTAG');
    let optionstagDefault = document.createElement('option');
    optionstagDefault.setAttribute('id', 'default');
    optionstagDefault.setAttribute('selected', '');
    optionstagDefault.setAttribute('hidden', '');
    optionstagDefault.innerHTML = 'Select Zip';
    selecttag.appendChild(optionstagDefault);

    allzips.forEach(zip => {
        let optionstag = document.createElement('option');
        optionstag.setAttribute('id', zip.replace(/ /g, '') + 'zip');
        optionstag.setAttribute('value', zip);
        optionstag.innerHTML = zip;
        selecttag.appendChild(optionstag);
    })

    let buttontag = document.createElement('button');
    buttontag.innerHTML = 'Get City';
    buttontag.setAttribute('id', 'viewZipCodeDataDropDownButtonTAG');

    let div = document.getElementById('viewZipCodeData');
    div.appendChild(selecttag);
    div.appendChild(buttontag);
    div.appendChild(ptag);

    document.getElementById("viewZipCodeDataDropDownButtonTAG").addEventListener('click', function (event) {
        event.preventDefault();
        getCityByZipcode();
    });
}

function getCityByZipcode() {
    let selected = document.getElementById('viewZipCodeDataDropDownSelectTAG');
    let zipcode = selected.options[selected.selectedIndex].value;
    if (selected.options[selected.selectedIndex].id === 'default') {
        document.getElementById('viewZipCodeDataPTAG').innerHTML = 'Select a zipcode'
    }
    else {
        let urlZip = url + 'city/zip/' + zipcode;
        fetch(urlZip)
            .then(handleHttpErrors)
            .then(fetchedData => {
                document.getElementById('viewZipCodeDataPTAG').innerHTML = writeToPTagZip(fetchedData);
            })
            .catch(err => {
                if (err.status) {
                    err.fullError.then(e => console.log(e.detail))
                }
                else { console.log("Network error"); }
            });
    }
}

function writeToPTagZip(jsondata) {
    let stringToWrite =
        "<br>Zip Code: " + jsondata['zipCode']
        + "<br>City: " + jsondata['city'];
    return stringToWrite;
}


function allPersonsInCity() {
    emptyTag('viewAllPersonsWithZipTableTAG');
    let selected = document.getElementById('viewZipCodeDataDropDownSelectTAG');
    let zipcode = selected.options[selected.selectedIndex].value;
    if (selected.options[selected.selectedIndex].id === 'default') {
        document.getElementById('viewZipCodeDataPTAG').innerHTML = 'Select a zipcode'
    }
    else {
        let urlZip = url + 'city/zip/' + zipcode;
        fetch(urlZip)
            .then(handleHttpErrors)
            .then(fetchedData => {
                allPersonsInCityInner(fetchedData);
            })
            .catch(err => {
                if (err.status) {
                    err.fullError.then(e => console.log(e.detail))
                }
                else { console.log("Network error"); }
            });
    }
}

function allPersonsInCityInner(fetchedData) {
    let city = fetchedData['city'];
    let zip = fetchedData['zipCode'];

    let urlPersonsCity = url + 'city?zip=' + zip + '&city=' + city;
    fetch(urlPersonsCity)
        .then(handleHttpErrors)
        .then(jsondata => {
            let sortedData = sortPersonJSON(jsondata);
            let table = document.getElementById('viewAllPersonsWithZipTableTAG');
            let headdata = Object.keys(sortedData[0]);
            tableHead(table, headdata);
            tableData(table, sortedData);
            fixTableHeaders();
        })
        .catch(err => {
            if (err.status) {
                err.fullError.then(e => console.log(e.detail))
            }
            else { console.log("Network error"); }
        });
}

function fillViewAllPersonsWithZipDiv() {
    emptyTag('viewAllPersonsWithZip');
    let ptag = document.createElement('p');
    ptag.setAttribute('id', 'allPersonsWithZipPTAG');

    let buttontag = document.createElement('button');
    buttontag.innerHTML = 'Get All Users With Zip';
    buttontag.setAttribute('id', 'viewAllPersonsWithZipButtonTAG');

    let tabletag = document.createElement('table');
    tabletag.setAttribute('id', 'viewAllPersonsWithZipTableTAG');

    let div = document.getElementById('viewAllPersonsWithZip');
    div.appendChild(buttontag);
    div.appendChild(ptag);
    div.appendChild(tabletag);
}


/*---------------------------------------------*/
/*------------ End Zipcode Section ------------*/
/*---------------------------------------------*/
