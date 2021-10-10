const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var empleadoDB = mongoose.connection.useDb("oneid_inbox");

const story_messages_schema = new Schema({
    story_id: { type: Schema.Types.ObjectId, ref: "story"  },
    one_id: { type: String, required: true, default: '' },
    app_id: { type: String, required: true, default: '' },
    type: {type: String, default: "GENERAL", enum: ["GENERAL", "SYSTEM"] },
    entry_time: { type: Date, default: Date.now },
    message: { type: String, default: '' },
}/* , { timestamps: true }  */);

module.exports = empleadoDB.model("story_message", story_messages_schema);

