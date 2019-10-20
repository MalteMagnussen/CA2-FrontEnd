import 'bootstrap/dist/css/bootstrap.css'
import {
    isNullOrUndefined
} from 'util';
import {
    type
} from 'os';

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
            case "get":
                get();
                break;
            case "add":
                add();
                break;

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

const testurl = 'https://maltemagnussen.com/CA2/api/search/';
const url = 'http://localhost:8080/CA2/api/search/';

function handleHttpErrors(res) {
    if (!res.ok) {
        return Promise.reject({
            status: res.status,
            fullError: res.json()
        })
    }
    return res.json();
}

/*---------------------------------------------*/
/*------------ Begin All GET Calls ------------*/
/*---------------------------------------------*/

function get() {
    fillViewPersonWithDataDiv();
    fillViewAllPersonsWithDataDiv();
    fillViewAllPersonsWithHobbyDiv();
    fillViewAllPersonsWithZipDiv();
    allHobbies();
    allZipcodes()

    document.getElementById("viewPersonWithDataButtonTAG").addEventListener('click', function (event) {
        event.preventDefault();
        singleuser(); //also calls addUpdateButtons. Could have been done with callbacks, or promises here.
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
    inputtag.setAttribute('placeholder', 'UserName');

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
    if (!username || !(username.includes(' '))) {
        document.getElementById('viewPersonWithDataPTAG').innerHTML = 'Type in a name (firstname + lastname)'
    } else {
        let urlName = url + 'person/' + username;
        fetch(urlName)
            .then(handleHttpErrors)
            .then(fetchedData => {
                document.getElementById('viewPersonWithDataPTAG').innerHTML = writeToPTagPrPerson(fetchedData[0]);
                dataStore.setData(fetchedData[0]); //To be used for edit/delete
            }).then(addUpdateButtons)
            .catch(err => {
                if (err.status) {
                    err.fullError.then(e => console.log(e.detail))
                } else {
                    console.log(err);
                    console.log("Network error");
                }
            });
    }
    return true;
}

/**
 * Adds edit/delete buttons to div only when a user has been fetched
 */
function addUpdateButtons() {
    let output = document.getElementById('viewPersonWithDataPTAG');

    if (!output.innerHTML.includes('Type in a name (firstname + lastname')) {
        let div = document.getElementById('viewPersonWithDataPTAG');
        //Edit button
        let btnEdit = document.createElement("button");
        btnEdit.innerHTML = 'Edit User';
        btnEdit.setAttribute('id', 'btnEdit');
        //Delete button
        let btnDelete = document.createElement('button');
        btnDelete.innerHTML = 'Delete User';
        btnDelete.setAttribute('id', 'btnDelete');

        //Append to div-element
        div.innerHTML += '<br>';
        div.appendChild(btnEdit);
        div.appendChild(btnDelete);
        div.innerHTML += '<br><br>'; //spacing for next object

        //Add event handlers to buttons
        document.getElementById("btnEdit").addEventListener('click', function (event) {
            event.preventDefault();
            editPerson();
        });
        document.getElementById("btnDelete").addEventListener('click', function (event) {
            event.preventDefault();
            if (document.getElementById('updatePersonContainer') != null) {
                return;
            }
            generatePerson(dataStore.getData(), 'delete');
            //document.getElementById('updatePersonContainer').style.display = 'block';
            let updateDiv = document.getElementById('updatePersonContainer');

            //Confirm delete button
            let btnConfirmDelete = document.createElement('button');
            btnConfirmDelete.innerHTML = 'Confirm Delete'
            btnConfirmDelete.setAttribute('id', 'btnConfirmDelete');

            //Deny delete button
            let btnDenyDelete = document.createElement('button');
            btnDenyDelete.innerHTML = 'Do not Delete'
            btnDenyDelete.setAttribute('id', 'btnDenyDelete');

            //Append to div-element
            updateDiv.appendChild(btnConfirmDelete);
            updateDiv.appendChild(btnDenyDelete);
            updateDiv.innerHTML += '<br><br>'; //spacing for next object

            document.getElementById('btnConfirmDelete').addEventListener('click', function (event) {
                event.preventDefault();
                let id = dataStore.getData().id;
                if (id !== null || id !== undefined) {
                    deletePerson(id);
                } else {
                    console.log("Fetch didnt save data properly");
                }
            })

            document.getElementById('btnDenyDelete').addEventListener('click', function (event) {
                document.getElementById('viewPersonWithDataPTAG').innerHTML = ''; //reset
                document.getElementById('updatePersonContainer').outerHTML = '';
            })
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
        "<br>Firstname: " + jsondata['firstName'] + ' ' + jsondata['lastName'] +
        "<br>e-mail: " + jsondata['email'];
    if (!isNullOrUndefined(jsondata['address'])) {
        stringToWrite = stringToWrite + "<br>Address: " + jsondata['address']['street'] + ', ' +
            jsondata['address']['additionalInfo'] + ', ' + jsondata['address']['cityInfo']['zipCode'] +
            ' ' + jsondata['address']['cityInfo']['city'];
    }
    stringToWrite = stringToWrite +
        "<br>Hobbies: " + hobbies +
        "<br>Phones: " + phones;
    return stringToWrite;
}

/**
 * Store and retrieve fetchData
 */
var dataStore = (function () {
    var data; // Private Variable

    var pub = {}; // public object - returned at end of module

    pub.setData = function (newData) {
        data = newData;
    };

    pub.getData = function () {
        return data;
    }

    return pub; // expose externally
}()); //https://stackoverflow.com/a/10452789

function generatePerson(fetchData, type) {
    let div = document.getElementById('viewPersonWithData');
    let newDiv = document.createElement('div');
    //Create div to display Person in
    newDiv.setAttribute('id', 'updatePersonContainer');
    div.appendChild(newDiv);

    let outputField;
    if (type === 'delete')
    {
        outputField = 'p';
    }
    else if (type === 'edit')
    {
        outputField = 'input';
    }
    else{
        console.log("Incorrect type specified");
    }
    

    for (let key in fetchData) {
        if (key.includes('id')) return; //we do not allow users to see/edit IDs

        if (typeof fetchData[key] === 'object') { //If we have a nested object
            Object.keys(fetchData[key]).forEach(key2 => {
                if (key2.includes('id')) return; //we do not allow users to see/edit IDs

                if (typeof fetchData[key][key2] === 'object') { //If we have a nested, nested object
                    // console.log("NEST NEST");

                    Object.keys(fetchData[key][key2]).forEach(key3 => {
                        if (key3.includes('id')) return; //we do not allow users to see/edit IDs
                        // console.log(fetchData[key][key2]);
                        // console.log(fetchData[key][key2][key3]);
                        // console.log(key3);
                        //Create fields
                        let field = document.createElement('input');
                        field.setAttribute('id', `${key}` + `${key2}` + `${key3}` + 'Input')
                        field.setAttribute('value', fetchData[key][key2][key3]);
                        //Create labels for input fields
                        let label = document.createElement('label');
                        label.innerHTML = key + ' | ' + '<strong>' + key3 + ': </strong> ';
                        label.setAttribute('for', field.id);
                        //Add to DOM
                        newDiv.appendChild(document.createElement('br'));
                        newDiv.appendChild(label);
                        newDiv.appendChild(field);
                    })
                } else {
                    //Create fields
                    let field = document.createElement('input');
                    field.setAttribute('id', `${key}` + `${key2}` + 'Input')
                    field.setAttribute('value', fetchData[key][key2]);
                    //Create labels for input fields
                    let label = document.createElement('label');
                    label.innerHTML = key + ' | ' + '<strong>' + key2 + ': </strong> ';
                    label.setAttribute('for', field.id);
                    //Add to DOM
                    newDiv.appendChild(document.createElement('br'));
                    newDiv.appendChild(label);
                    newDiv.appendChild(field);
                    // console.log(key);
                    // console.log("KEY: " + key2); // logs the key
                    // console.log(fetchData[key][key2]);
                    // console.log("---");
                    // console.log(fetchData[key2]) // logs the key's value
                }
            })
        } else {
            //Create fields
            let field = document.createElement('input');
            field.setAttribute('id', `${key}` + 'Input')
            field.setAttribute('value', fetchData[key]);
            //Create labels for input fields
            let label = document.createElement('label');
            label.innerHTML = 'User | ' + '<strong>' + key + ': </strong>'; //hackish, but there is no key to grab onto
            label.setAttribute('for', field.id);
            //Add to DOM
            newDiv.appendChild(document.createElement('br'));
            newDiv.appendChild(label);
            newDiv.appendChild(field);
        }




        // console.log("KEY: "+ key + ' | VALUE: ');
        // console.log(fetchData[key]);
        // console.log(key[fetchData]);
        //Need "U SURE U WANT TO DELETE?" ONCLICK --> FETCH DELETE
    }

    //console.log(fetchData['email']);

    //let deleteOutput2 = document.createElement('p')
    // deleteOutput.setAttribute('id', "deleteOutput2");
    // deleteOutput.innerHTML = 'Deleted the following person succesfully! <br>' + writeToPTagPrPerson(fetchData);
    // div.appendChild(deleteOutput2);
}
/*----------------------------------------*/
/*----------- BEGIN DELETE PERSON --------*/
/*----------------------------------------*/
function deletePerson(id) {
    if (document.getElementById('deleteOutput')) document.getElementById('deleteOutput').outerHTML = ''; //reset
    if (document.getElementById('errorOutput')) document.getElementById('errorOutput').outerHTML = ''; //reset
    fetch(url + "person/delete/" + id, {
            method: 'DELETE'
        })
        .then(res => handleHttpErrors(res))
        .then(data => {
            let div = document.getElementById('viewPersonWithData');
            let deleteOutput = document.createElement('p')
            deleteOutput.setAttribute('id', "deleteOutput");
            deleteOutput.innerHTML = 'Deleted the following person succesfully! <br>' + writeToPTagPrPerson(data);
            div.appendChild(deleteOutput);
        })
        .catch(err => {
            if (err.status) {
                err.fullError.then(e => {
                    console.log(e);
                })
            } else {
                console.log(err);
            }
            let errorOutput = document.createElement('p');
            errorOutput.setAttribute('id', 'errorOutput');
            errorOutput.innerHTML = '<br>ERROR:<br>' + JSON.stringify(err);
            document.getElementById('staticPTag').insertAdjacentElement('afterend', errorOutput);
        });
};
/*----------------------------------------*/
/*----------- END DELETE PERSON ----------*/
/*----------------------------------------*/

/*----------------------------------------*/
/*----------- BEGIN EDIT PERSON --------*/
/*----------------------------------------*/
function editPerson() {

    alert("lets edit");
}
/*----------------------------------------*/
/*----------- END EDIT PERSON ----------*/
/*----------------------------------------*/

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
function add() {
    document.getElementById("createSimplePerson").addEventListener("click", function () {
        addPersonSimple();
    })
}

function addPersonSimple() {
    var output = document.getElementById("output");
    fetch(url + "create/person", createPersonOptions())
        .then(res => handleHttpErrors(res))
        .then(function (data) {
            console.log(data);
            output.innerHTML = "<p>Person created:</p><br>" +
                "<p>ID: " + data.id + "<br>" +
                "<p>First name: " + data.firstName + "<br>" +
                "<p>Last name: " + data.lastName + "<br>" +
                "<p>email: " + data.email + "<br>";
        })
        .catch(err => {
            if (err.status) {
                err.fullError.then(e => output.innerHTML = "Error:<br><br>")
            } else {
                console.log("Network error");
            }
        });
}

function createPersonOptions() {
    var FirstName = document.getElementById("inputFirstName").value;
    var LastName = document.getElementById("inputLastName").value;
    var Email = document.getElementById("inputEmail").value;
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
/*----------- Begin Get All Persons -----------*/
/*---------------------------------------------*/

function fillViewAllPersonsWithDataDiv() {
    emptyTag('viewAllPersonsWithData');
    let ptag = document.createElement('p');
    ptag.setAttribute('id', 'viewAllPersonsWithDataPTAG');

    let buttontag = document.createElement('button');
    buttontag.innerHTML = 'Get All Users';
    buttontag.setAttribute('id', 'viewAllPersonsWithDataButtonTAG');

    let tabletag = document.createElement('table');
    tabletag.setAttribute('id', 'viewAllPersonsWithDataTableTAG');

    let div = document.getElementById('viewAllPersonsWithData');
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
            } else {
                console.log("Network error: " + err);
            }
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
            } else {
                console.log("Network error: " + err);
            }
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
                } else if (key === 'hobbies') {
                    obj.hobbies.forEach(hobby => {
                        cellValue = cellValue + hobby.name + ', ';
                    });
                    cellValue = cellValue.slice(0, -2);
                } else if (key === 'phones') {
                    obj.phones.forEach(phone => {
                        cellValue = cellValue + phone.description + ': ' + phone.number + ', ';
                    });
                    cellValue = cellValue.slice(0, -2);
                }
            } else if (element[key]) {
                cellValue = element[key];
            } else {
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
            fillHobbiesDropDownDiv(hobbiesArray)
        })
        .catch(err => {
            if (err.status) {
                err.fullError.then(e => console.log(e))
            } else {
                console.log("Network error: " + err);
            }
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

    let div = document.getElementById('allHobbies');
    div.appendChild(selecttag);
    div.appendChild(buttontag);
    div.appendChild(ptag);

    document.getElementById("hobbiesDropDownButtonTAG").addEventListener('click', function (event) {
        event.preventDefault();
        getHobbyByName();
    });
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

function getHobbyByName() {
    let selected = document.getElementById('allHobbiesDropDownSelectTAG');

    let hobbyname = selected.options[selected.selectedIndex].value;
    if (selected.options[selected.selectedIndex].id === 'default') {
        document.getElementById('allHobbiesPTAG').innerHTML = 'Select a hobby name'
    } else {
        let urlHobby = url + 'hobby/' + hobbyname;
        fetch(urlHobby)
            .then(handleHttpErrors)
            .then(fetchedData => {
                document.getElementById('allHobbiesPTAG').innerHTML = writeToPTagPrHobby(fetchedData);
            })
            .catch(err => {
                if (err.status) {
                    err.fullError.then(e => console.log(e.detail))
                } else {
                    console.log("Network error");
                }
            });
    }
}

function writeToPTagPrHobby(jsondata) {
    let stringToWrite =
        "<br>Hobby: " + jsondata['name'] +
        "<br>Description: " + jsondata['description'];
    return stringToWrite;
}

function getAllPersonsWithHobbyByName() {
    emptyTag('viewAllPersonsWithHobbyTableTAG');
    let selected = document.getElementById('allHobbiesDropDownSelectTAG');

    let hobbyname = selected.options[selected.selectedIndex].value;
    if (selected.options[selected.selectedIndex].id === 'default') {
        document.getElementById('allHobbiesPTAG').innerHTML = 'Select a hobby name'
    } else {
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
                } else {
                    console.log("Network error");
                }
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
    div.appendChild(ptag);
    div.appendChild(buttontag);
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
            fillZipCodeDiv(jsondata)
        })
        .catch(err => {
            if (err.status) {
                err.fullError.then(e => console.log(e.detail))
            } else {
                console.log("Network error: " + err);
            }
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
    } else {
        let urlZip = url + 'city/zip/' + zipcode;
        fetch(urlZip)
            .then(handleHttpErrors)
            .then(fetchedData => {
                document.getElementById('viewZipCodeDataPTAG').innerHTML = writeToPTagZip(fetchedData);
            })
            .catch(err => {
                if (err.status) {
                    err.fullError.then(e => console.log(e.detail))
                } else {
                    console.log("Network error");
                }
            });
    }
}

function writeToPTagZip(jsondata) {
    let stringToWrite =
        "<br>Zip Code: " + jsondata['zipCode'] +
        "<br>City: " + jsondata['city'];
    return stringToWrite;
}


function allPersonsInCity() {
    emptyTag('viewAllPersonsWithZipTableTAG');
    let selected = document.getElementById('viewZipCodeDataDropDownSelectTAG');
    let zipcode = selected.options[selected.selectedIndex].value;
    if (selected.options[selected.selectedIndex].id === 'default') {
        document.getElementById('viewZipCodeDataPTAG').innerHTML = 'Select a zipcode'
    } else {
        let urlZip = url + 'city/zip/' + zipcode;
        fetch(urlZip)
            .then(handleHttpErrors)
            .then(fetchedData => {
                allPersonsInCityInner(fetchedData);
            })
            .catch(err => {
                if (err.status) {
                    err.fullError.then(e => console.log(e.detail))
                } else {
                    console.log("Network error");
                }
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
            } else {
                console.log("Network error");
            }
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
    div.appendChild(ptag);
    div.appendChild(buttontag);
    div.appendChild(tabletag);
}


/*---------------------------------------------*/
/*------------ End Zipcode Section ------------*/
/*---------------------------------------------*/