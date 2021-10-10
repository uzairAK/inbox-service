// app.post("/create_story", (req,res) => {
//     var body = req.body;
//     Story.create(body, (err, result) => {
//         if (err)
//           return res.json({ status: "fail", msg: "Server Error! cannot create" });
//         else {
//             StoryMessage.create(body, (err, result) => {
//                 if (err)
//                   return res.json({ status: "fail", msg: "Server Error! cannot create" });
//                 else {
//                     StoryUser.create(body, (err, result) => {
//                         if (err)
//                           return res.json({ status: "fail", msg: "Server Error! cannot create" });
//                         else {
                
//                         }
//                     });
//                 }
//             });
//         }
//     });
//     res.json("Test");
// });

// app.post("/test_story", (req,res) => {
//     // res.json(res.locals);
//     var body = req.body;
//     var story = {
//         initiator_oneid: body.one_id,
//         initiator_orgid: body.org_id,
//         app_id: body.app_id,
//         title: body.title,
//         type: body.type,
//         type_ref: body.type_ref,
//         type_base_info: body.type_base_info,
//         deletable: body.deletable,
//         status: body.status,
//     };
//     Story.create(story, (err, result) => {
//         if (err) return res.json(err);
//         else {
//             console.log("result", result);
//             var stry_msg = {};
//             stry_msg["story_id"] = result._id;
//             stry_msg["oneid"] = result.initiator_oneid;
//             stry_msg["app_id"] = result.app_id;
//             stry_msg["type_message"] = body.type_message;
//             stry_msg["message"] = body.message;
//             console.log("1");
//             StoryMessage.create(stry_msg, (err, stry_msg_result) => {
//                 if (err) return res.json(err)
//                 else {
//                     console.log("stry_msg_result", stry_msg_result);
//                     var links = {};
//                     links["org_id"] = body.org_id;
//                     links["app_id"] = body.app_id;
//                     links["receiver"] = body.receiver;
//                     links["story_id"] = result._id;
//                     StoryUser.create(links, (err, stry_link_result) => {
//                         if (err) return res.json(err)
//                         else {
//                             console.log("stry_link_result", stry_link_result);
//                             res.json("Created");
//                         }
//                     });
//                 }

//                 // links["read_status"] = result._id;
//                 // links["status"] = result._id;
//             });
//         }
//     })
// })

// app.post("/test_frontend", (req,res) => {
//     // res.json(res.locals);
//     var body = req.body;
//     var story = {
//         initiator_oneid: body.one_id,
//         initiator_orgid: body.org_id,
//         app_id: body.app_id,
//         title: body.title,
//         type: body.type,
//         type_ref: body.type_ref,
//         type_base_info: body.type_base_info,
//         deletable: body.deletable,
//         status: body.status,
//     };

//     Story.create(story, (err, result) => {
//         if (err) return res.json(err);
//         else {
//             console.log("result", result);
//             var stry_msg = {};
//             stry_msg["story_id"] = result._id;
//             stry_msg["oneid"] = result.initiator_oneid;
//             stry_msg["app_id"] = result.app_id;
//             stry_msg["type_message"] = body.type_message;
//             stry_msg["message"] = body.message;

//             StoryMessage.create(stry_msg, (err, stry_msg_result) => {
//                 if (err) return res.json(err)
//                 else {
//                     console.log("stry_msg_result", stry_msg_result);
//                     var links = {};
//                     links["org_id"] = body.org_id;
//                     links["app_id"] = body.app_id;
//                     links["story_id"] = result._id;
//                     var {adv_receivers_list } = req.body;
//                     var receivers = receivers_looper(adv_receivers_list );
//                     if (Array.isArray(receivers)) {
//                         var inputs = [];
//                         receivers.forEach((receiver, i) => {
//                             let input = {};
//                             input["org_id"] = links.org_id;
//                             input["app_id"] = links.app_id;
//                             input["story_id"] = links.story_id;
//                             input["receiver"] = receiver;
//                             inputs.push(input);
//                         });
//                         StoryUser.create(inputs, (err, stry_link_result) => {
//                             if (err) return res.json(err)
//                             else {
//                                 console.log("stry_link_result", stry_link_result);
//                                 res.json("Created multiple");
//                             }
//                         });
//                     }
//                     // if (Array.isArray(receivers)) {
//                     //     console.log(receivers);
//                     //     var inputs = [];
//                     //     receivers.forEach((receiver, i) => {
//                     //         let input = {};
//                     //         input["org_id"] = links.org_id;
//                     //         input["app_id"] = links.app_id;
//                     //         input["story_id"] = links.story_id;
//                     //         input["receiver"] = receiver;
//                     //         inputs.push(input);
//                     //     });

                    
//                     //     StoryUser.create(inputs, (err, stry_link_result) => {
//                     //         if (err) return res.json(err)
//                     //         else {
//                     //             console.log("stry_link_result", stry_link_result);
//                     //             res.json("Created multiple");
//                     //         }
//                     //     });
//                     // } else if (receivers instanceof String) {
//                     //     links["receivers"] = body.receivers;
                        
//                     //     StoryUser.create(links, (err, stry_link_result) => {
//                     //         if (err) return res.json(err)
//                     //         else {
//                     //             console.log("stry_link_result", stry_link_result);
//                     //             res.json("Created");
//                     //         }
//                     //     });
//                     // }
//                 }

//                 // links["read_status"] = result._id;
//                 // links["status"] = result._id;
//             });
//         }
//     })
// })


// receivers_looper({"DEPARTMENT":[12,19,299],"DESIGNATION":[113,191,1299],"ONEID":[9281234,9233191]});
// receivers_looper(12);
// receivers_looper([12]);

// console.log(receivers_type_mapper("DEPARTMENT"));

// StoryUser.find({receiver: ["ID910701", "ID9107015"], story_id: "615c1000640c4a53af8fda19"}, (err, stry_link_result) => {
//     console.log(stry_link_result);
// });
// ?username_array=[8871632,8806224,9107015]

// axios.get('https://oneid.veevotech.com/service_api/find_users', {
//     params: {
//         "username_array": JSON.stringify([8871632])
//     }
//   })
//   .then(function (response) {
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     console.log(error);
//   })
//   .then(function () {
//     // always executed
//   });


// async function test() {
//     var k = await getUser([8871632]);
//     console.log(k);
// }

// test();







// ----------------------------------------

// var users = ['8871632'];
// var test = async () => {
//     return memcached.getMulti(users, async function (err, data) {
//         console.log("From cache", data);
//         let memkeys = Object.keys(data);
//         let result = users.every(function (e) {
//             return memkeys.indexOf(e) > -1;
//         });
//         if (result === true) userInfo = data
//         else {
//             var response = await getUser(users);
//             userInfo = response.DB_DATA;
//             let userInfoKeys = Object.keys(userInfo);
//             console.log("userInfoKeys", userInfoKeys);
//             userInfoKeys.forEach((userKey, i) => {
//                 memcached.add(userKey, userInfo[userKey], 10, function (err) { if (err) console.log(err) });
//                 // console.log (users.indexOf(user))
//             })
//         }
//         return "test";
//     })
// };
// var k = test().then(a => console.log(a));
// console.log(k);

// async function test() {
//     var k = await getUser([8871632]);
//     console.log(k);
// }

// test();





// var read_status= {
//     "ID9107015": 1,
//     "DS113": 0
// };
// var res_status_ids = Object.keys(read_status);
// async.eachSeries(res_status_ids, function updateObject (obj, done) {
//     console.log(obj, read_status[obj]);
//     done();
//     // Model.update(condition, doc, callback)
//     // StoryUser.update({ story_id: body.story_id, receiver: obj }, { $set : { read_status: read_status[obj] }}, done);
// }, function allDone (err) {
//     if (!err) console.log("Done");
//     // this will be called when all the updates are done or an error occurred during the iteration
// });