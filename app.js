var express = require("express"),
app = express(),
axios = require("axios").default,
async = require('async'),
getUser = require("./helpers/getUserInfo"),
Memcached = require('memcached'),
ObjectId = require("mongoose").Types.ObjectId;
const mongoose = require("mongoose"),
  Admin = mongoose.mongo.Admin;
require("dotenv").config();
var port = 5016;
var hash = "inbox123";
var memcached = new Memcached('172.18.0.71:11211');
// memcached.add('9107015', 'bar', 60, function (err) { if (err) console.log(err) });
// memcached.del('9107015', function (err) { /* stuff */ });
// memcached.get('foo', function (err, data) {
//     console.log(data);
// });

// let users = ['9107015', '9107016'];
// let memdata = ['9107015'];
// let result = users.every(function (e) {
//     return memdata.indexOf(e) > -1;
// });
// console.log(result);

mongoose
  .connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("> Connected to mongodb");
  })
  .catch((err) => {
    console.log("Error :" + err);
  });

//Models
const Story = require("./models/story");
const StoryMessage = require("./models/story_messages");
const StoryUser = require("./models/story_user_links");

app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '100mb', extended: true})); 

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
    next();
});

app.use(function (req, res, next) {
    console.log(req.socket.remoteAddress);
    var ip = req.headers['x-forwarded-for'] ||
     req.socket.remoteAddress ||
     null;
    // res.json(req.socket.remoteAddress)
    if (req.method === "POST") {
        console.log(req.body);
        if (req.body.backend_verify && JSON.parse(req.body.backend_verify) == true) {
            console.log("Checking", req.body.hash);
            if (req.body.hash == hash) {
                console.log("Hash valid");
                if (verify_ip(ip) === true) {
                    console.log("IP valid", ip);
                    res.locals.isBackend = true;
    
                }
            }
        } else {
            res.locals.isBackend = false;
        }
    }
    next();
});
app.use(function (req, res, next) {
    if (req.method === "POST") {
        if (res.locals.isBackend) {
            // res.json("Yes");
            next();
        } else {
                var b = req.body;
                // res.json("No");
                if (b.app_id && b.one_id && b.org_id && b.app_id.length > 0 && b.one_id.length > 0 && b.org_id.length > 0) next()
                else res.json("Not authenticated");
        }

    } else next();
});


app.post("/create_story", (req,res) => {
    var body = req.body;
    var story = {
        initiator_oneid: body.one_id,
        initiator_orgid: body.org_id,
        app_id: body.app_id,
        title: body.title,
        type: body.type,
        type_ref: body.type_ref,
        type_base_info: body.type_base_info,
        deletable: body.deletable,
        status: body.status,
    };

    Story.create(story, (err, result) => {
        if (err) return res.json(err);
        else {
            // console.log("result", result);
            var stry_msg = {};
            stry_msg["story_id"] = result._id;
            stry_msg["one_id"] = result.initiator_oneid;
            stry_msg["app_id"] = result.app_id;
            stry_msg["type"] = body.type_message;
            stry_msg["message"] = body.message;

            StoryMessage.create(stry_msg, (err, stry_msg_result) => {
                if (err) return res.json(err)
                else {
                    // console.log("stry_msg_result", stry_msg_result);
                    var links = {};
                    links["org_id"] = body.org_id;
                    links["app_id"] = body.app_id;
                    links["story_id"] = result._id;
                    var {adv_receivers_list } = req.body;
                    var receivers = receivers_looper(adv_receivers_list );
                    if (Array.isArray(receivers)) {
                        var inputs = [];
                        receivers.forEach((receiver, i) => {
                            let input = {};
                            input["org_id"] = links.org_id;
                            input["app_id"] = links.app_id;
                            input["story_id"] = links.story_id;
                            input["receiver"] = receiver;
                            inputs.push(input);
                        });
                        StoryUser.create(inputs, (err, stry_link_result) => {
                            if (err) return res.json(err)
                            else {
                                // console.log("stry_link_result", stry_link_result);
                                res.json("Created multiple");
                            }
                        });
                    }
                }
            });
        }
    })
})

app.post("/share_story", (req,res) => {
    // res.json(res.locals);
    var body = req.body;
    var {story_id, read_status, type, type_ref, one_id, org_id, app_id, adv_receivers_list} = req.body;
    read_status = read_status ? read_status: 0;
    var query = {app_id};
    if (story_id) {
        query["_id"] = story_id;
    }
    else {
        if (!type) return res.json("Enter type");
        if (!type_ref) return res.json("Enter type_ref");
        query = {
            type: type || undefined,
            type_ref: type_ref || undefined
        }
    }
    Story.find(query, (err, result) => {
        if (result != undefined) {
            var receivers = receivers_looper(adv_receivers_list );
            // console.log("Receivers", receivers);
            if (Array.isArray(receivers)) {
                var inputs = [];
                receivers.forEach((receiver, i) => {
                    let input = {};
                    input["org_id"] = org_id;
                    input["app_id"] = app_id;
                    input["story_id"] = story_id;
                    input["receiver"] = receiver;
                    inputs.push(input);
                });
                var q = {receiver: receivers};
                if (story_id) {
                    q["_id"] = story_id;
                } else {
                    q = {
                        type: type || undefined,
                        type_ref: type_ref || undefined
                    }
                }
                StoryUser.create(inputs, (err, stry_link_result) => {
                    if (err) return res.json(err)
                    else {
                        // console.log("stry_link_result", stry_link_result);
                        return res.json({status: "SUCCESS", msg: "Shared"});
                    }
                });
            }
        }
        else {
            res.json({status: "SUCCESS", msg: "No story found"});
        }
    })
});

app.post("/send_message", (req,res) => {
    var body = req.body;
    var {one_id, app_id, read_status, story_id} = body;
    var stry_msg = {};
    stry_msg["story_id"] = story_id;
    stry_msg["one_id"] = one_id;
    stry_msg["app_id"] = app_id;
    stry_msg["type"] = body.type_message || "GENERAL";
    stry_msg["message"] = body.message;
    Story.find({_id: story_id}, (err, result) => {
        if (result != undefined && result.length > 0) {
            StoryMessage.create(stry_msg, (err, stry_msg_result) => {
                if (err) return res.json(err)
                else {
                    var read_status = req.body.read_status;
                    if (read_status) {
                        var res_status_ids = Object.keys(req.body.read_status);
                        async.eachSeries(res_status_ids, function updateObject (obj, done) {
                            // console.log(obj, read_status[obj]);
                            // done();
                            // Model.update(condition, doc, callback)
                            StoryUser.updateOne({ story_id: body.story_id, receiver: obj }, { $set : { read_status: read_status[obj] }}, done);
                        }, function allDone (err) {
                            // if (!err) console.log("Done");
                            if (err) console.log(err);
                            // this will be called when all the updates are done or an error occurred during the iteration
                        });
                    } else {
                        StoryUser.updateMany({ story_id: body.story_id }, { $set : { read_status: 0 }}, function(err, doc) {

                        });
                    }
                    res.json({status: "SUCCESS"});
                    // var updateUserLink = {};
                    // StoryUser.findOneAndUpdate({story_id: body.story_id}, body, {upsert: true}, function(err, doc) {
                    //     if (err) return res.send(500, {error: err});
                    //     // return res.json('Succesfully updated.');
                    //     res.json({"send_message": stry_msg_result});
                    // });
                }
            });
        }
        else {
            res.json("No story found");
        }
    });
    
});

app.post("/list_stories", async (req,res) => {
    var users_to_search = [];
    req.body.designation ? users_to_search.push(`DS${req.body.designation}`) : null;
    req.body.department ? users_to_search.push(`DP${req.body.department}`) : null;
    req.body.branch ? users_to_search.push(`BR${req.body.branch}`) : null;
    req.body.one_id ? users_to_search.push(`ID${req.body.one_id}`) : null;
    req.body.employee_level ? users_to_search.push(`EL${req.body.employee_level}`) : null;
    // return res.json(users_to_search);
    var aggregate = [
        {
          '$sort': {
            'entry_time': -1
          }
        }, 
        // {
        //   '$match': {
        //     '$expr': {
        //       '$and': [
        //         {
        //           '$eq': [
        //             '$app_id', '10'
        //           ]
        //         }
        //       ]
        //     }
        //   }
        // },
         {
          '$lookup': {
            'from': 'story_user_links', 
            'localField': '_id', 
            'foreignField': 'story_id', 
            'as': 'users'
          }
        }, {
          '$unwind': {
            'path': '$users', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$match': {
            '$expr': {
              '$or': {
                '$in': [
                  '$users.receiver', users_to_search //['DP12', 'DS113']
                ]
              }
            }
          }
        }, {
          '$group': {
            '_id': {
              'story_id': '$_id'
            }, 
            'story_id': {
                '$first': '$_id'
            },
            'initiator_oneid': {
              '$first': '$initiator_oneid'
            }, 
            'initiator_orgid': {
              '$first': '$initiator_orgid'
            }, 
            'app_id': {
              '$first': '$app_id'
            }, 
            'title': {
              '$first': '$title'
            }, 
            'type': {
              '$first': '$type'
            }, 
            'type_ref': {
              '$first': '$type_ref'
            }, 
            'type_base_info': {
              '$first': '$type_base_info'
            }, 
            'deletable': {
              '$first': '$deletable'
            }, 
            'status': {
              '$first': '$status'
            }, 
            'entry_time': {
              '$first': '$entry_time'
            }, 
            'users': {
              '$push': '$users'
            }
          }
        }
      ];
      if (req.body.story_id) {
          aggregate.push({
            '$match': {
              '$expr': {
                '$and': [
                  {
                    '$eq': [
                      '$story_id', ObjectId(req.body.story_id)
                    ]
                  }
                ]
              }
            }
          })
      }
      Story.aggregate(aggregate, async (err, stories) => {
          if (err) return res.json(err);
          if (stories.length > 0) {
              var users = stories.map((story, i) => story.initiator_oneid);
              var userInfo;
              memcached.getMulti(users, async function (err, data) {
                // console.log("From cache", data);
                let memkeys = Object.keys(data);
                let result = users.every(function (e) {
                    return memkeys.indexOf(e) > -1;
                });
                if (result === true) userInfo = data
                else {
                    var response = await getUser(users);
                    userInfo = response.DB_DATA;
                    let userInfoKeys = Object.keys(userInfo);
                    console.log("userInfoKeys", userInfoKeys);
                    userInfoKeys.forEach((userKey, i) => {
                        memcached.add(userKey, userInfo[userKey], 15, function (err) { if (err) console.log(err) });
                        // console.log (users.indexOf(user))
                    })
                }
                var user_detailed_stories = stories.map((story, i) => {
                    let user = userInfo[story.initiator_oneid];
                    let newObject = Object.assign({}, story, {user_info: user});
                    return newObject;
                });
                res.json({status: "SUCCESS", stories: user_detailed_stories});
            });
          } else {
              res.json ({status: "SUCCESS", stories: []})
          }
        //   var response = await getUser(users); //[...users, "8871632", "03069879925"]
        //   var userInfo = response.DB_DATA;
        //   var user_detailed_stories = stories.map((story, i) => {
        //     let user = userInfo[story.initiator_oneid];
        //     // console.log(user);
        //       let newObject = Object.assign({}, story, {user_info: user});
        //       return newObject;
        //   });
        // //   var user_detail_info = 
        //   res.json(user_detailed_stories);
        // //   res.json({success: true, stories});
      })
});

app.post("/list_stories1", async (req,res) => {
    
    var aggregate = [
        {
          '$sort': {
            'entry_time': -1
          }
        }, {
          '$lookup': {
            'from': 'story_user_links', 
            'localField': '_id', 
            'foreignField': 'story_id', 
            'as': 'users'
          }
        }
      ];
      if (req.body.story_id) {
          aggregate.push({
            '$match': {
              '$expr': {
                '$and': [
                  {
                    '$eq': [
                      '$_id', ObjectId(req.body.story_id)
                    ]
                  }
                ]
              }
            }
          })
      }
      Story.aggregate(aggregate, async (err, stories) => {
        if (err) return res.json(err);
        if (stories.length > 0) {
            var users = stories.map((story, i) => story.initiator_oneid);
            var userInfo;
            memcached.getMulti(users, async function (err, data) {
              // console.log("From cache", data);
              let memkeys = Object.keys(data);
              let result = users.every(function (e) {
                  return memkeys.indexOf(e) > -1;
              });
              if (result === true) userInfo = data
              else {
                  var response = await getUser(users);
                  userInfo = response.DB_DATA;
                  let userInfoKeys = Object.keys(userInfo);
                  console.log("userInfoKeys", userInfoKeys);
                  userInfoKeys.forEach((userKey, i) => {
                      memcached.add(userKey, userInfo[userKey], 15, function (err) { if (err) console.log(err) });
                      // console.log (users.indexOf(user))
                  })
              }
              var user_detailed_stories = stories.map((story, i) => {
                  let user = userInfo[story.initiator_oneid];
                  let newObject = Object.assign({}, story, {user_info: user});
                  return newObject;
              });
              res.json({status: "SUCCESS", stories: user_detailed_stories});
          });
        } else res.json({status: "SUCCESS", stories: []});
        //   var response = await getUser(users); //[...users, "8871632", "03069879925"]
        //   var userInfo = response.DB_DATA;
        //   var user_detailed_stories = stories.map((story, i) => {
        //     let user = userInfo[story.initiator_oneid];
        //     // console.log(user);
        //       let newObject = Object.assign({}, story, {user_info: user});
        //       return newObject;
        //   });
        // //   var user_detail_info = 
        //   res.json(user_detailed_stories);
        // //   res.json({success: true, stories});
      })
});

app.post("/list_story_messages", async (req,res) => {
    var query = req.body;
    var {org_id, story_id, app_id, one_id} = query;
    var q = {
        // receiver: one_id,
        // org_id: org_id,
        // app_id: app_id,
        story_id: story_id
    };
    StoryMessage.find(q).sort({entry_time: -1}).exec(async (err, stories) => {
        if (err) return res.json(err);
        if (stories.length > 0) {
            var users = stories.map((story, i) => story.one_id);
            var userInfo;
            memcached.getMulti(users, async function (err, data) {
                // console.log("From cache", data);
                let memkeys = Object.keys(data);
                let result = users.every(function (e) {
                    return memkeys.indexOf(e) > -1;
                });
                if (result === true) userInfo = data
                else {
                    var response = await getUser(users);
                    userInfo = response.DB_DATA;
                    let userInfoKeys = Object.keys(userInfo);
                    console.log("userInfoKeys", userInfoKeys);
                    userInfoKeys.forEach((userKey, i) => {
                        memcached.add(userKey, userInfo[userKey], 15, function (err) { if (err) console.log(err) });
                        // console.log (users.indexOf(user))
                    })
                }
                var user_detailed_stories = stories.map((story, i) => {
                  let user = userInfo[story.one_id];
                  // console.log(user);
                    let newObject = Object.assign({}, story._doc, {user_info: user});
                    return newObject;
                });
                res.json({status: "SUCCESS", stories: user_detailed_stories});
            });
        } else {
            return res.json({status: "SUCCESS", stories: []});

        }
        //   var response = await getUser(users);
          
        // res.json(result);
    })
    
});

app.post("/update_story", (req,res) => {
    var body = req.body;
    Story.findOneAndUpdate({_id: body.story_id}, body, {upsert: true}, function(err, doc) {
        if (err) return res.send(500, {error: err});
        return res.json('Succesfully updated.');
    });
    
});

app.get("/", (req,res) => {
    res.json("Inbox");
})



var server = app.listen(port, () =>
  console.log("Inbox service Server is up and running on port : " + port)
);


function verify_ip(ip) {
    var term = ip;
    var re = new RegExp("^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");
    if (re.test(term)) {
        return false;
        // console.log("Valid");
    } else {
        return true
        // console.log("Invalid");
    }
}

function receivers_looper(receivers) {
    // var receivers = {"DEPARTMENT":[12,19,299],"DESIGNATION":[113,191,1299],"ONEID":[9281234,9233191]};
    if (typeof receivers == "string" || receivers instanceof String || Number.isInteger(receivers)) {
        var receivers = {"ONEID":[receivers]};
        var keys = Object.keys(receivers);
        var inputs = [];
        keys.forEach((key, i) => {
            let arr = receivers[key];
            let AC = receivers_type_mapper(key);
            arr.forEach((user) => {
                inputs.push( AC + user );
            });
        });
        return inputs;
    } else if (typeof receivers === 'object' &&
    !Array.isArray(receivers)) {
        // console.log("is object");
        var keys = Object.keys(receivers);
        var inputs = [];
        keys.forEach((key, i) => {
            let arr = receivers[key];
            let AC = receivers_type_mapper(key);
            arr.forEach((user) => {
                inputs.push( AC + user );
            });
        });
        return inputs;
    } else if (Array.isArray(receivers)) {
        var key = "ONEID";
        var inputs = [];
        receivers.forEach((user, i) => {
            let AC = receivers_type_mapper(key);
                inputs.push( AC + user );
        });
        return inputs;
    }
};



function receivers_type_mapper(key) {
    switch(key) {
        case "DESIGNATION": return "DS"; break;
        case "DEPARTMENT": return "DP"; break;
        case "BRANCH": return "BR"; break;
        case "ONEID": return "ID"; break;
        case "EMPLOYEE_LEVEL": return "EL"; break;
    }
}
