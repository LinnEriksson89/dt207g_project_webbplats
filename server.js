/* DT207G - Backend-baserad webbutveckling
 * Projekt
 * Linn Eriksson, VT24
 */

"use strict";

//Variables and dependecies
require("dotenv").config();
const express = require("express");
const route = express();
const port = process.env.PORT || 4000;

//Views, public files and beeing able to use form-data.
route.set("view engine", "ejs");
route.use(express.static("public"));
route.use(express.urlencoded({extended: true}));

//All routes.
route.get("/", (req, res) => {
    res.render("index", {
        title: "test"
    });
});

route.get("/index", (req, res) => {
    res.redirect("/");
});

route.get("/about", (req, res) => {
    res.render("about", {
        title: " "
    });
});

route.get("/login", (req, res) => {
    res.render("login", {
        title: " "
    });
});

route.get("/admin", (req, res) => {
    res.render("admin", {
        title: " "
    });
});

route.get("/menu", (req, res) => {
    res.render("menu", {
        title: " "
    });
});

//Running server.
route.listen(port, () => {
    console.log("Server started on port: " + port);
});