const mongoose = require('../config/dbConnection')

const eventModelSchema = new mongoose.Schema(
    {
        chapter_id: {
            type: mongoose.Types.ObjectId,
            ref: 'chapter',
            default: null
        },
        created_by : {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            // required: true
        },
        updated_by : {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            // required: true
        },
        event_image : {
            type: String,
            default: process.env.DEFAULT_EVENT_PICTURE
        }, 
        event_description : {
            type: String,
            // required: true
        },
        event_name : {
            type: String,
            // required: true
        },
        event_type : {
            type: String,          // GGC / Chapter
            // required: true
        },
        venue : {
            type: String,         // event location
            // required: true
        },
        venue_link : {
            type: String,         // event location map link
            // required: true
        },
        attendee_link : {
            type: String,         // event location attendance link
            // required: true
        },
        price : {
            type: Number,
            // required: true
        },
        qr_code : {
            type : String
        },
        start_time : {
            type: Date,
            required: true
        },
        end_time : {
            type: Date,
            required: true
        },
        city_id: {
            type: mongoose.Types.ObjectId,
            ref: 'city',
        },
        state_id: {
            type: mongoose.Types.ObjectId,
            ref: 'state',
        },
        country_id: {
            type: mongoose.Types.ObjectId,
            ref: 'country',
        },
        postalcode_id: {
            type: mongoose.Types.ObjectId,
            ref: 'postalcode',
        },
        schedule_status: {
            type: String,
            default: "scheduled"           // scheduled, cancelled, completed, rescheduled
        },
        approval_status: {
            type: String,
            default: "pending"           // pending, approved, rejected
        },
        is_active : {
            type: Boolean,
            default: true
        },
        is_deleted : {
            type: Boolean,
            default: false
        },
        deletedAt : {
            type: Date,
            default:null
        }
    },
    {
        timestamps: true
    }
)

module.exports = new mongoose.model('event', eventModelSchema)