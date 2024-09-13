/* DT207G - Backend-baserad webbutveckling
 * Projekt
 * Linn Eriksson, VT24
 */

"use strict";

//Variables
const foodUrl = "http://127.0.0.1:4000/api/food";
const catUrl = "http://127.0.0.1:4000/api/category";
let globalMonday = new Date();
let lunchfail = false;
let catfail = false;

//On load run init.
window.onload = init();

//Init-function
function init() {
    getMenu();
}

function getMenu() {
    //Calculate weekID and fetch weekly menu.
    const weekID = calculateWeekID();
    getWeeklyMenu(weekID);

    //Fetch all categories.
    getCategories();
}

//Get the menu for the week.
function getWeeklyMenu(weekID) {
    fetch(foodUrl + "/week/" + weekID)
    .then(response => {
        if(response.status != 200) {
            lunchfail = true;
            return
        }
        return response.json()
        .then(data => printWeeklyMenu(data))
        .catch(err => console.log(err))
    })
}

//Get categories from API.
function getCategories() {
    fetch(catUrl + "/all")
    .then(response => {
        if (response.status != 200) {
            catfail = true;
            return
        }
        return response.json()
        .then(data => printCategories(data))
        .catch(err => console.log(err))
    })
}

//Get all items from category-id.
function getCategoryItems(category_id) {
    fetch(foodUrl + "/cat/" + category_id)
    .then(response => {
        if(response.status != 200) {
            catfail = true;
            return
        }
        return response.json()
        .then(data => printCategoryItems(data))
        .catch(err => console.log(err))
    })
}

//Print the weekly menu.
function printWeeklyMenu(menu_list) {
    //Variables
    const divElement = document.getElementById("weeklyMenu");
    let weekdayCounter = 0;
    let menuCounter = 0;
    const weekdays = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
    let weekdates = [];
    let date = new Date();

    //As menu_list is an object we need to fetch the value of the first key and then parse that as JSON to turn it into an array.
    let listObject = Object.values(menu_list[0]);
    let weeklyMenu = JSON.parse(listObject);

    //Create array of the dates for the current week in format YYYY-MM-DD for Sweden.
    for (let i = 0; i < 7; i++) {
        //For each date we set newDate to globalMonday+i, this will mean it's + o on Monday, +1 on Tuesday and so on.
        //JS stores dates as milliseconds since 1 January 1970, therefor newDate turns into an int and stringDate is used as a middle layer.
        let newDate = date.setDate(globalMonday.getDate() + i );
        let stringDate = new Date(newDate).toLocaleDateString();
        
        //Push the date to the array.
        weekdates.push(stringDate);
    }

    //Make sure element is cleared if function is called again.
    divElement.innerHTML = "";

    //Add header and general info.
    divElement.innerHTML += `<h3 id="lunch">Veckans lunch</h3><p>Dagens lunch inkluderar lättare salladsbuffe, måltidsdryck samt kaffe på maten. Dagens lunch kostar 99kr.</p>`;

    //Print the lunches
    weeklyMenu.forEach(lunch => {
        //Check if menuCounter is even or odd to see if header with weekday name and date should be added or not.
        let test = menuCounter % 2;
        if(test == 0) {
            divElement.innerHTML += `<h4>${weekdays[weekdayCounter]} - ${weekdates[weekdayCounter]}</h4>`;
            divElement.innerHTML += `<h5>${lunch.name}</h5><p>${lunch.description}</p>`;

            //Increase weekdaycounter.
            weekdayCounter++;
        } else {
            //If it's odd just print the lunch-item.
            divElement.innerHTML += `<h5>${lunch.name}</h5><p>${lunch.description}</p>`;
        }
        
        //Either way increase the menuCounter.
        menuCounter++;
    });
}

function printCategories(categoriesArray) {
    //Add some category-buttons for increase accessability.
    getButtons();

    //Get div-element.
    let divElement = document.getElementById("menuItems");
    
    //Make sure div is cleared so a new call to function clears list.
    divElement.innerHTML = "";
    
    //Add header and general info.
    divElement.innerHTML += `<h3 id="other">Övrig meny</h3><p>Utöver dagens lunch finns en meny med övriga rätter som alltid är tillgänglig.</p>`;


    //Foreach loop to print all categories.
    categoriesArray.forEach(category => {
        //Create header and info.
        let header = document.createElement("h4");
        let headerText = document.createTextNode(category.name)
        header.appendChild(headerText);
        header.setAttribute("id", `hcat${category.category_id}`);

        //Create the div where the info should be.
        let div = document.createElement("div");
        div.setAttribute("id", `cat${category.category_id}`);

        getCategoryItems(category.category_id);

        //Append div and header to menuItems-div.
        divElement.appendChild(header);
        divElement.appendChild(div);
    });
}

//Print category items.
function printCategoryItems(items) {
    let div = document.getElementById(`cat${items[0].category_id}`)
    
    items.forEach(item => {
        //Create header and info.
        let header = document.createElement("h5");
        let headerText = document.createTextNode(item.name);
        let span = document.createElement("span");
        let spanText = document.createTextNode(item.price);
        header.appendChild(headerText);
        span.appendChild(spanText);
        span.setAttribute("class", "price");

        //Create description.
        let para = document.createElement("p");
        let description = document.createTextNode(item.description);
        let br = document.createElement("br");
        let allergensHeader = document.createTextNode("Allergener: ");
        let em = document.createElement("em");
        let allergens = document.createTextNode(item.allergens);
        em.appendChild(allergens);
        para.appendChild(description);
        para.appendChild(br);
        para.appendChild(allergensHeader);
        para.appendChild(em);
        
        //Append it all to the div.
        div.appendChild(header);
        div.appendChild(para);
    });
}

//Get categories for buttons.
function getButtons() {
    fetch(catUrl + "/all")
    .then(response => {
        if (response.status != 200) {
            return
        }
        return response.json()
        .then(data => printButtons(data))
        .catch(err => console.log(err))
    })
}

//Print buttons for easier access to different parts of menu.
function printButtons(categoryArray) {
    const divElement = document.getElementById("menuButtons");

    //Make sure div is empty so a new call drops everything and starts from skratch.
    divElement.innerHTML = "";

    if(lunchfail) {
        divElement.innerHTML += "<p>Något gick fel när lunchmenyn hämtades.</p>";
    } else {
        //Add lunch-button
        divElement.innerHTML += `<a href="#lunch" class="button">Veckans lunch</a>`;
    }
    
    if(catfail) {
        divElement.innerHTML += "<p>Något gick fel när menykategorierna hämtades.</p>";
    } else {
        //Add other category-buttons.
        categoryArray.forEach(category => {
            divElement.innerHTML += `<a href="#hcat${category.category_id}" class="button">${category.name}</a>`;
        });
    }

    if(catfail || lunchfail) {
        //Nothing happens here.
    } else {
        divElement.innerHTML += `<a href="#maincontent" class="button" id="topbutton">Tillbaka till toppen</a>`
    }
}

//Calculate ID for weekly menu this is copypaste from the function in the API.
function calculateWeekID() {
    //Calculate week_id (in format: YearMonthDay of Monday of the week)
    const today = new Date();
    const weekday = today.getDay();
    let monday = new Date();

    //If-else, create new date for monday if it isn't monday.
    if (weekday != 1) {

        if (weekday === 0) {
            //If it's sunday we need to do -6
            monday.setDate(today.getDate() - 6);
        } else {
            //For all other days take "weekday - 1" as that's how many days we need to go back.
            let calMonday = weekday - 1;

            //Set date of monday as today - number of steps back with weekday
            monday.setDate(today.getDate() - calMonday);
        }
    } else {
        monday = today;
    }

    //Get year, month and date from last monday.
    let year = monday.getFullYear();
    let month = monday.getMonth() + 1; //getMonth() returns 0-11.
    let date = monday.getDate();
    let monthString = "00";
    let dateString = "00";

    //Set globalMonday to monday to use in printing.
    globalMonday = monday;

    //Turn month into a string, and if it's 1-9 add a zero before it.
    if (month < 10) {
        monthString = "0" + month.toString();
    } else {
        monthString = month.toString();
    }

    //Turn date into a string, and if it's 1-9 add a zero before it.
    if (date < 10) {
        dateString = "0" + date.toString();
    } else {
        dateString = date.toString();
    }

    //Create weekId in form of a string that looks like "20240902" and return it.
    let weekId = year.toString() + monthString + dateString;
    return weekId;
}