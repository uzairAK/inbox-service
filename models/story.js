const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var empleadoDB = mongoose.connection.useDb("oneid_inbox");

const story_schema = new Schema({
    initiator_oneid: { type: String, required: true, default: '' },
    initiator_orgid: { type: String, required: true, default: '' },
    app_id: { type: String, required: true, default: '' },
    title: {type: String, default: ''},
    type: {type: String, default: "GENERAL", enum: ["DEFAULT", "GENERAL","LEAVE_REQUEST", "EXPENSE_APPROVAL", "GENERAL_CUSTOM_FORM", "ATT_TIME_ADJUSTMENT"] }, //String value in upper case, no space only A-Z, _ , 1-9 are allowed to be used. Max 20 characters, this is used to render the story accordingly suppose if it's general messaging we would use DEFAULT but if this story is generated in connection to a leave approval then we would leave it as LEAVE_REQUEST, this can help us build customized UI for the user to provide the features as required for doing this operation.
    type_ref: {type: Number, required: true, default: 0}, // 1
    type_base_info: {type: String, default: '0'}, //ACCEPTED, REJECTED etc
    deletable: {type: Number, default: 1}, // where 1 stands for yes & 0 for no
    status: { type: Number, default: 1 }, //The story if deleted shouldn't be removed temporarily from DB for record purposes, this is set to 1 by default which represents active story, if deleted this should be set to 2.
    // status: { type: Schema.Types.ObjectId, ref: "performance_review_cycle" },
    entry_time: { type: Date, default: Date.now },
} );

module.exports = empleadoDB.model("story", story_schema);

