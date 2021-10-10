const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var empleadoDB = mongoose.connection.useDb("oneid_inbox");

const story_user_link_schema = new Schema({
    org_id: { type: String, required: true, default: '' },
    receiver: { type: String, required: true, default: '' },
    app_id: { type: String, required: true, default: '' },
    story_id: { type: Schema.Types.ObjectId, ref: "story"  },
    read_status: { type: Number, default: 0 }, //r, this is 0 to mark it as unread while 1 to mark it as read.
    status: { type: Number, default: 1 }, //The story if deleted shouldn't be removed temporarily from DB for record purposes, this is set to 1 by default which represents active story, if deleted this should be set to 2.
    entry_time: { type: Date, default: Date.now },
} );

module.exports = empleadoDB.model("story_user_link", story_user_link_schema);

