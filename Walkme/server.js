const express = require("express")
const mongoose = require("mongoose");
const User = require("./models/users")
const cache = require("./middleware/routeCache")

const app = express()

app.use(express.json());

const dbURI = "mongodb+srv://JKatzDDS:123123123@cluster0.xsnhl.mongodb.net/WalkMe?retryWrites=true&w=majority";
mongoose.connect(dbURI)
    .then(() => {
        app.listen(3000)
        console.log("Listening on port 3000...")})
    .catch((error) => console.log(error))

app.post("/api/users", (req, res) => {
    const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        department : req.body.department});

    user.save()
        .then((result) => {
            res.send(result)
        })
        .catch((error) => {
            console.log(error)
        })
    })

app.get("/api/user/:uid", cache(300), (req, res) => {
    User.findById(req.params.uid)
    .then((result) => {
        res.send(result)
    })
    .catch((error) => {
        console.log(error)
    })
}) 

app.get("/api/usersByDepartment", cache(300),  (req, res) => {
    User.find({department: req.query.department})
    .then((result) => {
        res.send(result)
    })
    .catch((error) => {
        console.log(error)
    })
})


app.get("/api/users", cache(300), async (req, res) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page* limit

    const results = {}

    const users = await User.find()
    .catch((error) => {
        console.log(error)
    })

    if (endIndex < users.length)
    results.next = {
        page: page + 1,
        limit: limit
    }

    if (startIndex > 0)
    results.previous = {
        page: page - 1,
        limit: limit
    }

    results.results = users.slice(startIndex, endIndex)
    res.json(results)
})
