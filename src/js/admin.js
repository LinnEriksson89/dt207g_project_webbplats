/* DT207G - Backend-baserad webbutveckling
 * Projekt
 * Linn Eriksson, VT24
 */

"use strict";

//Variables.
const url = "/admin";
let token = checkCookie("access_token");


//On load run init.
window.onload = init();


//Init-function.
function init() {
    getAllButtons();

    //Change the background to make it clear it's a different page.
    document.body.style.backgroundImage = "url('/images/adminbackground.jpg')";
}

//Get all buttons.
function getAllButtons() {
    //Variables
    const foodUpdateButtons = document.getElementsByClassName("food_update");
    const foodDeleteButtons = document.getElementsByClassName("food_delete");
    const lunchUpdateButtons = document.getElementsByClassName("lunch_update");
    const lunchDeleteButtons = document.getElementsByClassName("lunch_delete");
    const catUpdateButtons = document.getElementsByClassName("cat_update");
    const catDeleteButtons = document.getElementsByClassName("cat_delete");

    //Add eventlisteners to buttons with for-loops, one for each table.
    for (let i = 0; i < foodUpdateButtons.length; i++) {
        foodUpdateButtons[i].addEventListener("click", updateFood);
        foodDeleteButtons[i].addEventListener("click", deleteFood);
    }

    for (let i = 0; i < lunchUpdateButtons.length; i++) {
        lunchUpdateButtons[i].addEventListener("click", updateLunch);
        lunchDeleteButtons[i].addEventListener("click", deleteLunch);
    }

    for (let i = 0; i < catUpdateButtons.length; i++) {
        catUpdateButtons[i].addEventListener("click", updateCategory);
        catDeleteButtons[i].addEventListener("click", deleteCategory);
    }
}

//Function to get update-button to work for fooditems.
function updateFood(event) {
    //Stop link from getting page.
    event.preventDefault();

    //Variables
    let id = event.target.dataset.id;
    let food_cat = document.getElementById("food_cat" + id).innerHTML;
    let food_name = document.getElementById("food_name" + id).innerHTML;
    let food_price = document.getElementById("food_price" + id).innerHTML;
    let food_desc = document.getElementById("food_desc" + id).innerHTML;
    let food_allergens = document.getElementById("food_allergens" + id).innerHTML;
    let jsonString = JSON.stringify({
        item_id: id,
        category_id: food_cat,
        name: food_name,
        price: food_price,
        description: food_desc,
        allergens: food_allergens
    });

    fetch(url + "/updatefood/" + id, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "authorization": token
        },
        body: jsonString
    })
        .then(response => {
            if (!response.ok) {
                let message = document.getElementById("food_message" + id);
                message.innerHTML = "Något gick fel, rätten har inte uppdaterats.";
                throw Error(response.statusText);
            }
            return response.json()
        })
        .then(data => {
            //Show success-message.
            let message = document.getElementById("food_message" + id);
            message.innerHTML = "Rätten uppdaterades.";
        })
        .catch(err => console.log(err))
}

//Function to get delete-button to work for fooditems.
function deleteFood(event) {
    //Stop link from getting page.
    event.preventDefault();

    //Variable
    let id = event.target.dataset.id;

    fetch(url + "/deletefood/" + id, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "authorization": token
        }
    })
        .then(response => {
            if (!response.ok) {
                let message = document.getElementById("food_message" + id);
                message.innerHTML = "Något gick fel, rätten har inte raderats.";
                throw Error(response.statusText);
            }
            return response.json()
        })
        .then(data => {
            //Show success-message.
            let message = document.getElementById("food_message" + id);
            message.innerHTML = "Rätten har raderats.";
        })
        .catch(err => console.log(err))
}

//Function to get update-button to work for lunchitems.
function updateLunch(event) {
    //Stop link from getting page.
    event.preventDefault();

    //Variable
    let id = event.target.dataset.id;
    let lunch_name = document.getElementById("lunch_name" + id).innerHTML;
    let lunch_desc = document.getElementById("lunch_desc" + id).innerHTML;
    let lunch_allergens = document.getElementById("lunch_allergens" + id).innerHTML;
    let lunch_day = document.getElementById("lunch_day" + id).innerHTML;
    let lunch_prio = document.getElementById("lunch_prio" + id).innerHTML;
    let jsonString = JSON.stringify({
        item_id: id,
        name: lunch_name,
        description: lunch_desc,
        allergens: lunch_allergens,
        lunchday: lunch_day,
        lunchprio: lunch_prio
    });

    fetch(url + "/updatelunch/" + id, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "authorization": token
        },
        body: jsonString
    })
        .then(response => {
            if (!response.ok) {
                let message = document.getElementById("lunch_message" + id);
                message.innerHTML = "Något gick fel, lunchen har inte uppdaterats.";
                throw Error(response.statusText);
            }
            return response.json()
        })
        .then(data => {
            //Show success-message.
            let message = document.getElementById("lunch_message" + id);
            message.innerHTML = "Lunchen har uppdaterats.";
        })
        .catch(err => console.log(err))
}

//Function to get delete-button to work for lunchitems.
function deleteLunch(event) {
    //Stop link from getting page.
    event.preventDefault();

    //Variable
    let id = event.target.dataset.id;

    fetch(url + "/deletelunch/" + id, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "authorization": token
        }
    })
        .then(response => {
            if (!response.ok) {
                let message = document.getElementById("lunch_message" + id);
                message.innerHTML = "Något gick fel, lunchen har inte raderats.";
                throw Error(response.statusText);
            }
            return response.json()
        })
        .then(data => {
            //Show success-message.
            let message = document.getElementById("lunch_message" + id);
            message.innerHTML = "Lunch raderad.";
            return;
        })
        .catch(err => console.log(err))
}

//Function to get update-button to work for categories.
function updateCategory(event) {
    //Stop link from getting page.
    event.preventDefault();

    //Variable
    let id = event.target.dataset.id;    
    let cat_name = document.getElementById("cat_name" + id).innerHTML;
    let cat_desc = document.getElementById("cat_desc" + id).innerHTML;
    let jsonString = JSON.stringify({
        item_id: id,
        name: cat_name,
        description: cat_desc
    });

    fetch(url + "/updatecat/" + id, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "authorization": token
        },
        body: jsonString
    })
        .then(response => {
            if (!response.ok) {
                let message = document.getElementById("cat_message" + id);
                message.innerHTML = "Något gick fel, kategorin har inte uppdaterats.";

                throw Error(response.statusText);
            }
            return response.json()
        })
        .then(data => {
            //Show success-message.
            let message = document.getElementById("cat_message" + id);
            message.innerHTML = "Kategorin uppdaterad.";
        })
        .catch(err => console.log(err))
}

//Function to get delete-button to work for categories.
function deleteCategory(event) {
    //Stop link from getting page.
    event.preventDefault();

    //Variable
    let id = event.target.dataset.id;

    fetch(url + "/deletecat/" + id, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "authorization": token
        }
    })
        .then(response => {
            console.log(response);
            if (!response.ok) {
                let message = document.getElementById("cat_message" + id);
                message.innerHTML = "Något gick fel, kategorin har inte raderats.";

                throw Error(response.statusText);
            }
            return response.json()
        })
        .then(data => {
            //Show success-message.
            let message = document.getElementById("cat_message" + id);
            message.innerHTML = "Kategorin raderad.";
        })
        .catch(err => console.log(err))
}

//Function for checking cookies.
function checkCookie(cookieName) {
    //Variables
    let name = cookieName + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookieArray = decodedCookie.split(";");

    //Looping through array to search for name.
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];

        while (cookie.charAt(0) == " ") {
            cookie = cookie.substring(1);
        }

        //If cookie is found, return cookie.
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }

    return "";
}