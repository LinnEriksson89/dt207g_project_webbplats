/* DT207G - Backend-baserad webbutveckling
 * Projekt
 * Linn Eriksson, VT24
 */

"use strict";

//Variables and dependecies
require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const url = process.env.API_ACCOUNTS;
let foodUrl = "";
let catUrl = "";
let lunchUrl = "";
let foodsArray = [];
let lunchesArray = [];
let categoriesArray = [];
let weekdays = [];
let prio = [];

//Views, public files and beeing able to use form-data.
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//Use JSON in API-calls.
app.use(express.json());

//All routes.
//Public routes.
app.get("/", (req, res) => {
    res.render("index", {
        title: " - Start",
        current: "start",
        loggedin: false,
        script: false
    });
});

app.get("/index", (req, res) => {
    res.redirect("/");
});

app.get("/about", (req, res) => {
    res.render("about", {
        title: " - Om oss",
        current: "about",
        loggedin: false,
        script: false
    });
});

app.get("/menu", (req, res) => {
    res.render("menu", {
        title: " - Meny",
        current: "menu",
        loggedin: false,
        script: true,
        scriptfile: "menu.js"
    });
});

//Admin-routes
app.get("/login", (req, res) => {
    res.render("login", {
        title: " - Logga in",
        current: "login",
        loggedin: false,
        script: false,
        loginmessage: "",
        registermessage: ""
    });
});

app.get("/admin", (req, res) => {
    //Variables.
    let token = "";
    let i = 0;

    //Variable for raw headers as array.
    let headersArray = req.rawHeaders;

    //For-loop to find the header that is used to set the cookie access_token.
    //Here one might wonder why cookie-parser isn't used. The answer is that trying to install it broke the whole site.
    for (i = 0; i < headersArray.length; i++) {
        //Let check to se if string starts with "access_token".
        const header = headersArray[i];
        let test = header.includes("access_token");

        //If it does, set variable and break loop.
        if (test) {
            //The full header looks something like "access_token=Bearer%20-very long JWT here-; username=Test2024".
            //Therefor, take the whole header, split on "; ", loop throug array to get only access_token-part,
            //then slice away the "access_token=Bearer%20".
            let fullheader = headersArray[i];
            let array = fullheader.split("; ");

            //Loop through the array as cookies are not always set in the same order.
            array.forEach(element => {

                //Test if element includes access_token.
                let test = element.includes("access_token");

                //When test is true, set token.
                if (test) {

                    //And with this slice we should have only the access_token-value.
                    let tokendata = element;
                    token = tokendata.slice(22);

                    //Break loop by setting "i" to a number way above the likely number of headers.
                    i = 1447;
                }
            });
        }

        //If the header isn't the one with access_token nothing happens and loop continues.
    }

    //If the for-loop has ran out of headers.
    if (i >= headersArray.length) {
        //If token is empty
        if (!token) {
            //Logout and redirect to login.
            res.clearCookie("access_token");
            res.clearCookie("username");
            res.redirect("/login");
        } else {
            //If token exists we can authorize user.
            fetch(url + "/protected", {
                headers: {
                    "authorization": "Bearer " + token
                }
            })
                .then(response => {
                    if (response.status != 200) {

                        //If authorization is not okay the cookies are deleted and the user is sent to login-page.
                        res.clearCookie("access_token");
                        res.clearCookie("username");
                        res.redirect("/login")
                    }
                    return response.json()
                        .then(data => {
                            //Variables

                            foodUrl = data.food;
                            lunchUrl = data.lunch;
                            catUrl = data.categories;
                            weekdays = data.weekdays;
                            prio = data.prio;

                            //Fetch all data wrapped in promises.
                            Promise.all([
                                //Fetches with the URLs we got.
                                fetch(foodUrl + "/all"),
                                fetch(lunchUrl + "/all"),
                                fetch(catUrl + "/all")
                            ])
                                .then(responses => {
                                    //Response wrapped in Promises too as it otherwise just returns the first one.
                                    return Promise.all(responses.map(response => {
                                        if (response.status != 200) {
                                            return;
                                        }
                                        return response.json();
                                    }));
                                })
                                .then(data => {
                                    //Get arrays from the data.
                                    foodsArray = data[0];
                                    lunchesArray = data[1];
                                    categoriesArray = data[2];

                                    //If arrays are empty, render page with error. Otherwise render page with info.
                                    if (foodsArray == null || lunchesArray == null || categoriesArray == null) {
                                        res.render("admin", {
                                            title: "- Adminsida",
                                            current: "admin",
                                            loggedin: "admin",
                                            script: false,
                                            admin: "undefined",
                                            foods: foodsArray,
                                            lunches: lunchesArray,
                                            categories: categoriesArray,
                                            weekdays: weekdays,
                                            prio: prio,
                                            food_message: "",
                                            lunch_message: "",
                                            cat_message: ""
                                        });
                                    } else {
                                        res.render("admin", {
                                            title: "- Adminsida",
                                            current: "admin",
                                            loggedin: "admin",
                                            script: true,
                                            scriptfile: "admin.js",
                                            admin: "ok",
                                            foods: foodsArray,
                                            lunches: lunchesArray,
                                            categories: categoriesArray,
                                            weekdays: weekdays,
                                            prio: prio,
                                            food_message: "",
                                            lunch_message: "",
                                            cat_message: ""
                                        });
                                    }
                                })
                        })
                })
                .catch(err => console.log(err))
        }
    } else {
        //Shouldn't be possible to end up here, but if you do you should probably be redirected to 404.
        res.redirect("/404");
    }

});

//Make login-form work.
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let jsonString = JSON.stringify({
        username: username,
        password: password
    })

    //Fetch with post to login.
    fetch(url + "/login", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: jsonString
    })
        .then(response => {
            if (response.status != 200) {
                res.clearCookie("access_token");
                res.clearCookie("username");

                //Re-render page with loginmessage.
                res.render("login", {
                    title: " - Logga in",
                    current: "login",
                    loggedin: false,
                    script: false,
                    loginmessage: "Misslyckades med inloggning",
                    registermessage: ""
                });
                return;
            }
            return response.json()
                .then(data => {
                    //Set cookie with token.
                    res.cookie("access_token", "Bearer " + data.token, {
                        //Cookie expires in 1h.
                        maxAge: 3600000
                    });
                    //Set cookie with username.
                    res.cookie("username", username);

                    //Re-render page with loginmessage as I couldn't figure out how to do it any other way.
                    res.render("login", {
                        title: " - Logga in",
                        current: "login",
                        loggedin: "admin",
                        script: false,
                        loginmessage: "Inloggningen lyckades!",
                        registermessage: ""
                    });
                    return;
                })
                .catch(err => console.log(err))
        })
});

//Make create account-form work.
app.post("/create", (req, res) => {
    const username = req.body.create_username;
    const password = req.body.create_password;
    let jsonString = JSON.stringify({
        username: username,
        password: password
    })

    //Fetch with post to register
    fetch(url + "/register", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: jsonString
    })
        .then(response => {
            if (response.status != 201) {
                //Re-render page with loginmessage.
                res.render("login", {
                    title: " - Logga in",
                    current: "login",
                    loggedin: false,
                    script: false,
                    loginmessage: "",
                    registermessage: "Misslyckades med att skapa konto."
                });
                return;
            }
            return response.json()
                .then(data => {

                    //Re-render page with loginmessage as I couldn't figure out how to do it any other way.
                    res.render("login", {
                        title: " - Logga in",
                        current: "login",
                        loggedin: false,
                        script: false,
                        loginmessage: "",
                        registermessage: "Kontot har skapats, välkommen att logga in!"
                    });
                    return;
                })
                .catch(err => console.log(err))
        })
});

//Make logout work
app.get("/logout", (req, res) => {
    //Clear cookies and send to login-page.
    res.clearCookie("access_token");
    res.clearCookie("username");

    res.redirect("/login");
});


app.post("/admin", (req, res) => {
    //Variables
    let token = "";
    let i = 0;
    let form = req.body.formId;
    let body = req.body;

    //Variable for raw headers as array.
    let headersArray = req.rawHeaders;

    //For-loop to find the header that is used to set the cookie access_token.
    //Here one might wonder why cookie-parser isn't used. The answer is that trying to install it broke the whole site.
    for (i = 0; i < headersArray.length; i++) {
        //Let check to se if string starts with "access_token".
        const header = headersArray[i];
        let test = header.includes("access_token");

        //If it does, set variable and break loop.
        if (test) {
            //The full header looks something like "access_token=Bearer%20-very long JWT here-; username=Test2024".
            //Therefor, take the whole header, split on "; ", loop throug array to get only access_token-part,
            //then slice away the "access_token=Bearer%20".
            let fullheader = headersArray[i];
            let array = fullheader.split("; ");

            //Loop through the array as cookies are not always set in the same order.
            array.forEach(element => {

                //Test if element includes access_token.
                let test = element.includes("access_token");

                //When test is true, set token.
                if (test) {

                    //And with this slice we should have only the access_token-value.
                    let tokendata = element;
                    token = tokendata.slice(22);

                    //Break loop by setting "i" to a number way above the likely number of headers.
                    i = 1447;
                }
            });
        }

        //If the header isn't the one with access_token nothing happens and loop continues.
    }

    //If the for-loop has ran out of headers.
    if (i >= headersArray.length) {
        //If token is empty
        if (!token) {
            //Logout and redirect to login.
            res.clearCookie("access_token");
            res.clearCookie("username");
            res.redirect("/login");
        } else {
            //If token exists we can authorize user.
            fetch(url + "/protected", {
                headers: {
                    "authorization": "Bearer " + token
                }
            })
                .then(response => {
                    if (response.status != 200) {

                        //If authorization is not okay the cookies are deleted and the user is sent to login-page.
                        res.clearCookie("access_token");
                        res.clearCookie("username");
                        res.redirect("/login")
                    }
                    return response.json()
                        .then(data => {
                            //Variables that may or may not be needed.
                            let jsonString = "";
                            let food_cat = body.food_cat;
                            let food_name = body.food_name;
                            let food_price = body.food_price;
                            let food_desc = body.food_desc;
                            let food_allergens = body.food_allergens;
                            let lunch_name = body.lunch_name;
                            let lunch_desc = body.lunch_desc;
                            let lunch_allergens = body.lunch_allergens;
                            let lunch_day = body.lunch_day;
                            let lunch_prio = body.lunch_prio;
                            let cat_name = body.cat_name;
                            let cat_desc = body.cat_desc;

                            //Asign variables based on data.
                            foodUrl = data.food;
                            lunchUrl = data.lunch;
                            catUrl = data.categories;

                            //Switch used to see what's supposed to happen.
                            //1=food, 2=lunch, 3=categories.
                            switch (form) {
                                case "1":
                                    //Variables
                                    jsonString = JSON.stringify({
                                        category_id: food_cat,
                                        name: food_name,
                                        price: food_price,
                                        description: food_desc,
                                        allergens: food_allergens
                                    });

                                    fetch(foodUrl + "/add/", {
                                        method: "POST",
                                        headers: {
                                            "content-type": "application/json"
                                        },
                                        body: jsonString
                                    }
                                    )
                                        .then(response => {
                                            if (response.status != 201) {
                                                return;
                                            }
                                            return response.json()
                                                .then(data => {
                                                    if (response.status != 201) {
                                                        res.render("admin", {
                                                            title: "- Adminsida",
                                                            current: "admin",
                                                            loggedin: "admin",
                                                            script: true,
                                                            scriptfile: "admin.js",
                                                            admin: "ok",
                                                            foods: foodsArray,
                                                            lunches: lunchesArray,
                                                            categories: categoriesArray,
                                                            weekdays: weekdays,
                                                            prio: prio,
                                                            food_message: "Maträtten kunde inte läggas till!",
                                                            lunch_message: "",
                                                            cat_message: ""
                                                        });
                                                    } else {
                                                        res.render("admin", {
                                                            title: "- Adminsida",
                                                            current: "admin",
                                                            loggedin: "admin",
                                                            script: true,
                                                            scriptfile: "admin.js",
                                                            admin: "ok",
                                                            foods: foodsArray,
                                                            lunches: lunchesArray,
                                                            categories: categoriesArray,
                                                            weekdays: weekdays,
                                                            prio: prio,
                                                            food_message: "Maträtten tillagd!",
                                                            lunch_message: "",
                                                            cat_message: ""
                                                        });
                                                    }
                                                })
                                                .catch(err => console.log(err))
                                        })
                                    break;

                                case "2":
                                    //Variables
                                    jsonString = JSON.stringify({
                                        name: lunch_name,
                                        description: lunch_desc,
                                        allergens: lunch_allergens,
                                        lunchday: lunch_day,
                                        lunchprio: lunch_prio
                                    });

                                    fetch(lunchUrl + "/add/", {
                                        method: "POST",
                                        headers: {
                                            "content-type": "application/json"
                                        },
                                        body: jsonString
                                    }
                                    )
                                        .then(response => {
                                            if (response.status != 201) {
                                                return;
                                            }
                                            return response.json()
                                                .then(data => {
                                                    if (response.status != 201) {
                                                        res.render("admin", {
                                                            title: "- Adminsida",
                                                            current: "admin",
                                                            loggedin: "admin",
                                                            script: true,
                                                            scriptfile: "admin.js",
                                                            admin: "ok",
                                                            foods: foodsArray,
                                                            lunches: lunchesArray,
                                                            categories: categoriesArray,
                                                            weekdays: weekdays,
                                                            prio: prio,
                                                            food_message: "",
                                                            lunch_message: "Lunchen kunde inte läggas till!",
                                                            cat_message: ""
                                                        });
                                                    } else {
                                                        res.render("admin", {
                                                            title: "- Adminsida",
                                                            current: "admin",
                                                            loggedin: "admin",
                                                            script: true,
                                                            scriptfile: "admin.js",
                                                            admin: "ok",
                                                            foods: foodsArray,
                                                            lunches: lunchesArray,
                                                            categories: categoriesArray,
                                                            weekdays: weekdays,
                                                            prio: prio,
                                                            food_message: "",
                                                            lunch_message: "Lunch tillagd!",
                                                            cat_message: ""
                                                        });
                                                    }
                                                })
                                                .catch(err => console.log(err))
                                        })
                                    break;

                                case "3":
                                    //Variables.
                                    jsonString = JSON.stringify({
                                        name: cat_name,
                                        description: cat_desc
                                    });
                                    fetch(catUrl + "/add/", {
                                        method: "POST",
                                        headers: {
                                            "content-type": "application/json"
                                        },
                                        body: jsonString
                                    }
                                    )
                                        .then(response => {
                                            if (response.status != 201) {
                                                return;
                                            }
                                            return response.json()
                                                .then(data => {
                                                    if (response.status != 201) {
                                                        res.render("admin", {
                                                            title: "- Adminsida",
                                                            current: "admin",
                                                            loggedin: "admin",
                                                            script: true,
                                                            scriptfile: "admin.js",
                                                            admin: "ok",
                                                            foods: foodsArray,
                                                            lunches: lunchesArray,
                                                            categories: categoriesArray,
                                                            weekdays: weekdays,
                                                            prio: prio,
                                                            food_message: "",
                                                            lunch_message: "",
                                                            cat_message: "Kategorin kunde inte läggas till!"
                                                        });
                                                    } else {
                                                        res.render("admin", {
                                                            title: "- Adminsida",
                                                            current: "admin",
                                                            loggedin: "admin",
                                                            script: true,
                                                            scriptfile: "admin.js",
                                                            admin: "ok",
                                                            foods: foodsArray,
                                                            lunches: lunchesArray,
                                                            categories: categoriesArray,
                                                            weekdays: weekdays,
                                                            prio: prio,
                                                            food_message: "",
                                                            lunch_message: "",
                                                            cat_message: "Kategori tillagd!"
                                                        });
                                                    }
                                                })
                                                .catch(err => console.log(err))
                                        })
                                    break;
                                default:
                                    //Shouldn't be possible to end up here, seems suspicious but lets redirect to 404.
                                    res.redirect("404");
                            }
                        })
                        .catch(err => console.log(err))
                })
        }
    }
});

//Updating food
app.post("/admin/updatefood/:id", (req, res) => {
    let id = req.params.id;
    let token = req.headers.authorization;
    let jsonString = JSON.stringify(req.body);

    //If token is empty
    if (!token) {
        //Logout and redirect to login.
        res.clearCookie("access_token");
        res.clearCookie("username");
        res.redirect("/login");
    } else {
        //If token exists we can authorize user.
        fetch(url + "/protected", {
            headers: {
                "authorization": token
            }
        })
            .then(response => {
                if (response.status != 200) {

                    //If authorization is not okay the cookies are deleted and the user is sent to login-page.
                    res.clearCookie("access_token");
                    res.clearCookie("username");
                    res.redirect("/login")
                }
                return response.json()
                    .then(data => {
                        //Asign variable based on data.
                        foodUrl = data.food;

                        //Update with fetch.
                        fetch(foodUrl + "/update/" + id, {
                            method: "PUT",
                            headers: {
                                "content-type": "application/json"
                            },
                            body: jsonString
                        }
                        )
                            .then(response => {
                                if (response.status != 200) {
                                    return;
                                }
                                return response.json()
                                    .then(data => {
                                        return "ok";
                                    })
                                    .catch(err => console.log(err))
                            })
                    })
                    .catch(err => console.log(err))
            })
    }
});

//Updating lunch
app.post("/admin/updatelunch/:id", (req, res) => {
    let id = req.params.id;
    let token = req.headers.authorization;
    let jsonString = JSON.stringify(req.body);

    //If token is empty
    if (!token) {
        //Logout and redirect to login.
        res.clearCookie("access_token");
        res.clearCookie("username");
        res.redirect("/login");
    } else {
        //If token exists we can authorize user.
        fetch(url + "/protected", {
            headers: {
                "authorization": token
            }
        })
            .then(response => {
                if (response.status != 200) {

                    //If authorization is not okay the cookies are deleted and the user is sent to login-page.
                    res.clearCookie("access_token");
                    res.clearCookie("username");
                    res.redirect("/login")
                }
                return response.json()
                    .then(data => {
                        //Asign variable based on data.
                        lunchUrl = data.lunch;

                        //Update with fetch.
                        fetch(lunchUrl + "/update/" + id, {
                            method: "PUT",
                            headers: {
                                "content-type": "application/json"
                            },
                            body: jsonString
                        })
                            .then(response => {
                                if (response.status != 200) {
                                    console.log(response);
                                    return;
                                }
                                return response.json()
                                    .then(data => {
                                        return "ok";
                                    })
                                    .catch(err => console.log(err))
                            })
                    })
                    .catch(err => console.log(err))
            })
    }
});

//Updating category
app.post("/admin/updatecat/:id", (req, res) => {
    let id = req.params.id;
    let token = req.headers.authorization;
    let jsonString = JSON.stringify(req.body);

    //If token is empty
    if (!token) {
        //Logout and redirect to login.
        res.clearCookie("access_token");
        res.clearCookie("username");
        res.redirect("/login");
    } else {
        //If token exists we can authorize user.
        fetch(url + "/protected", {
            headers: {
                "authorization": token
            }
        })
            .then(response => {
                if (response.status != 200) {

                    //If authorization is not okay the cookies are deleted and the user is sent to login-page.
                    res.clearCookie("access_token");
                    res.clearCookie("username");
                    res.redirect("/login")
                }
                return response.json()
                    .then(data => {
                        //Asign variable based on data.
                        catUrl = data.categories;

                        //update with fetch.
                        fetch(catUrl + "/update/" + id, {
                            method: "PUT",
                            headers: {
                                "content-type": "application/json"
                            },
                            body: jsonString
                        })
                            .then(response => {
                                if (response.status != 200) {
                                    return;
                                }
                                return response.json()
                                    .then(data => {
                                        return "ok";
                                    })
                                    .catch(err => console.log(err))
                            })
                    })
                    .catch(err => console.log(err))
            })
    }
});

//Deleteing food
app.post("/admin/deletefood/:id", (req, res) => {
    let id = req.params.id;
    let token = req.headers.authorization;

    //If token is empty
    if (!token) {
        //Logout and redirect to login.
        res.clearCookie("access_token");
        res.clearCookie("username");
        res.redirect("/login");
    } else {
        //If token exists we can authorize user.
        fetch(url + "/protected", {
            headers: {
                "authorization": token
            }
        })
            .then(response => {
                if (response.status != 200) {

                    //If authorization is not okay the cookies are deleted and the user is sent to login-page.
                    res.clearCookie("access_token");
                    res.clearCookie("username");
                    res.redirect("/login")
                }
                return response.json()
                    .then(data => {
                        //Asign variable based on data.
                        foodUrl = data.food;

                        //Delete with fetch.
                        fetch(foodUrl + "/delete/" + id, {
                            method: "DELETE"
                        })
                            .then(response => {
                                if (response.status != 200) {
                                    return;
                                }
                                return response.json()
                                    .then(data => {
                                        return "ok";
                                    })
                                    .catch(err => console.log(err))
                            })
                    })
                    .catch(err => console.log(err))
            })
    }


});

//Deleteing lunch
app.post("/admin/deletelunch/:id", (req, res) => {
    let id = req.params.id;
    let token = req.headers.authorization;

    //If token is empty
    if (!token) {
        //Logout and redirect to login.
        res.clearCookie("access_token");
        res.clearCookie("username");
        res.redirect("/login");
    } else {
        //If token exists we can authorize user.
        fetch(url + "/protected", {
            headers: {
                "authorization": token
            }
        })
            .then(response => {
                if (response.status != 200) {

                    //If authorization is not okay the cookies are deleted and the user is sent to login-page.
                    res.clearCookie("access_token");
                    res.clearCookie("username");
                    res.redirect("/login")
                }
                return response.json()
                    .then(data => {
                        //Asign variable based on data.
                        lunchUrl = data.lunch;

                        //Delete with fetch.
                        fetch(lunchUrl + "/delete/" + id, {
                            method: "DELETE"
                        })
                            .then(response => {
                                if (response.status != 200) {
                                    return;
                                }
                                return response.json()
                                    .then(data => {
                                        return "ok";
                                    })
                                    .catch(err => console.log(err))
                            })
                    })
                    .catch(err => console.log(err))
            })
    }


});

//Deleteing categories.
app.post("/admin/deletecat/:id", (req, res) => {
    let id = req.params.id;
    let token = req.headers.authorization;

    //If token is empty
    if (!token) {
        //Logout and redirect to login.
        res.clearCookie("access_token");
        res.clearCookie("username");
        res.redirect("/login");
    } else {
        //If token exists we can authorize user.
        fetch(url + "/protected", {
            headers: {
                "authorization": token
            }
        })
            .then(response => {
                if (response.status != 200) {

                    //If authorization is not okay the cookies are deleted and the user is sent to login-page.
                    res.clearCookie("access_token");
                    res.clearCookie("username");
                    res.redirect("/login")
                }
                return response.json()
                    .then(data => {
                        //Asign variable based on data.
                        catUrl = data.categories;

                        //Delete with fetch.
                        fetch(catUrl + "/delete/" + id, {
                            method: "DELETE"
                        })
                            .then(response => {
                                if (response.status != 200) {
                                    return;
                                }
                                return response.json()
                                    .then(data => {
                                        return "ok";
                                    })
                                    .catch(err => console.log(err))
                            })
                    })
                    .catch(err => console.log(err))
            })
    }


});

//Route not found.
app.all("*", (req, res) => {
    res.status(404).render("404", {
        title: " - Mjau",
        current: "404",
        script: false,
        loggedin: false
    });
});

//Running server.
app.listen(port, () => {
    console.log("Server started on port: " + port);
});