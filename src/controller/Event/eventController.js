const models = require('../../model/index')
const Event = models.events;
const PostalCode = models.postalcode;
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const { eventValidation } = require('../../validations/eventValidation');
const { mongoose } = require('../../config/dbConnection');
const QRCode = require('qrcode');
const path = require('path');
const util = require('util');




//create busniess
const createEvent = async (req, res) => {
  try {

    const { event_name, event_description, event_type, event_image, chapter_id, venue, venue_link, price, start_time, end_time, city_id, state_id, country_id, postalcode_id } = req.body

    const eventValidate = await eventValidation.createEventValidation(req.body)

    if (eventValidate.error) {
      return responseData.errorResponse(res, eventValidate.error.details[0].message);
    }

    //check if event is already exist or not && no 2 events on same location on same time

    const eventExist = await Event.findOne({ start_time: start_time, venue: venue, is_deleted: false, is_active: true })

    if (eventExist) {
      responseData.errorResponse(res, 'An event is already scheduled for this venue at this time');
    } else {

      let eventData = {};

      eventData.created_by = req.user._id;
      eventData.chapter_id = chapter_id;
      eventData.event_name = event_name;
      eventData.event_description = event_description;
      eventData.event_type = event_type;
      eventData.venue = venue;
      eventData.venue_link = venue_link;
      eventData.price = price;
      eventData.start_time = start_time;
      eventData.end_time = end_time;
      eventData.city_id = city_id;
      eventData.state_id = state_id;
      eventData.country_id = country_id;
      eventData.postalcode_id = postalcode_id;


      const generateQRCode = async (data, name) => {
        const toFileAsync = util.promisify(QRCode.toFile);

        let qrName = name.replace(/[^a-zA-Z0-9.]+/g, '')
        try {
          const outputPath = path.join(__dirname, '../../../public/images', `${qrName}-qr.png`);
          await toFileAsync(outputPath, JSON.stringify(data));
          eventData.qr_code = `${process.env.IMG_PATH}public/images/${qrName}-qr.png`;

          // let event_url = await toUrlAsync(JSON.stringify(data));
          // console.log('event_url :', event_url);
          // eventData.attendee_link = event_url

        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      };

      //   const generateQrLink = async (data) => {

      //     const toUrlAsync = (data) => {
      //       QRCode.toDataURL(data, (err, url)=>{
      //         if(err) console.error(err, "error");
      //        return url;
      //       })
      //     };

      //   try{
      //  let event_url = await toUrlAsync(JSON.stringify(data))
      //  console.log('event_url :', event_url);
      //   eventData.attendee_link = event_url
      //   }catch(err) {
      //     console.error('Error generating QR code:', err);
      //   }
      //   }

      await generateQRCode(eventData, event_name);
      // await generateQrLink(eventData);

      if (req.file) {
        eventData.event_image = `${process.env.IMG_PATH}public/images/${req.file}`;
      }

      let createEvent = await Event.create(eventData);
      createEvent.save();

      let eventInfo = await Event.aggregate([

        {
          '$match': {
            '_id': new mongoose.Types.ObjectId(createEvent._id)
          }
        },
        {
          '$lookup': {
            'from': 'countries',
            'localField': 'country_id',
            'foreignField': '_id',
            'as': 'country'
          }
        }, {
          '$unwind': {
            'path': '$country'
          }
        }, {
          '$lookup': {
            'from': 'states',
            'localField': 'state_id',
            'foreignField': '_id',
            'as': 'state'
          }
        }, {
          '$unwind': {
            'path': '$state'
          }
        }, {
          '$lookup': {
            'from': 'cities',
            'localField': 'city_id',
            'foreignField': '_id',
            'as': 'city'
          }
        }, {
          '$unwind': {
            'path': '$city'
          }
        }, {
          '$lookup': {
            'from': 'postalcodes',
            'localField': 'postalcode_id',
            'foreignField': '_id',
            'as': 'postalcode'
          }
        }, {
          '$unwind': {
            'path': '$postalcode'
          }
        }, {
          '$lookup': {
            'from': 'users',                 // user who created chapter
            'localField': 'created_by',
            'foreignField': '_id',
            'as': 'user'
          }
        }, {
          '$unwind': {
            'path': '$user'
          }
        }, {
          '$lookup': {
            'from': 'roles',
            'localField': 'user.role_id',
            'foreignField': '_id',
            'as': 'user_role'
          }
        }, {
          '$unwind': {
            'path': '$user_role'
          }
        }, {
          '$lookup': {
            'from': 'chapters',
            'localField': 'chapter_id',
            'foreignField': '_id',
            'as': 'chapter_data'
          }
        },
        {
          '$addFields': {
            'country_name': '$country.country_name',
            'state_name': '$state.state_name',
            'city_name': '$city.city_name',
            'postalcode': '$postalcode.postal_code',
            'user.role': '$user_role.role',                   // user role who created the chapter
            'chapter_name': {
              '$cond': {
                if: { $gt: [{ $size: "$chapter_data" }, 0] },
                then: { $arrayElemAt: ["$chapter_data.chapter_name", 0] },
                else: null
              }
            }
          }
        }, {
          '$project': {
            'country': 0,
            'state': 0,
            'city': 0,
            'user_role': 0,
            'user._id': 0,
            'user.password': 0,
            'user.verified_admin': 0,
            'user.last_logIn': 0,
            'user.is_deleted': 0,
            'user.deletedAt': 0,
            'user.createdAt': 0,
            'user.updatedAt': 0,
            'user.is_active': 0,
            'user.profile_picture': 0,
            'user.__v': 0,
            'chapter_data': 0

          }
        }
      ])

      if (createEvent) {
        responseData.sendResponse(res, 'Event created successfully!', eventInfo)
      } else {
        responseData.sendMessage(res, 'Event creation failed!')
      }
    }

  } catch (error) {
    helper.logger.error(error);
    responseData.errorResponse(res, 'Something went wrong!');
  }
}

//get all eventes
const getAllEvents = async (req, res) => {
  try {

    let eventQuery = { is_deleted: false };

    if (req.query.search) {
      const searchItem = req.query.search;

      const codePattern = /^[1-9][0-9]{5}$/;
      const validCode = codePattern.test(searchItem);
      const codeQuery = validCode ? { postal_code: Number(searchItem) } : {};
      const nameQuery = { event_name: { $regex: searchItem, $options: 'i' } || {}, is_active: true };
      const venueQuery = { venue: { $regex: searchItem, $options: 'i' } || {}, is_active: true };


      if (validCode) {
        fromCode = await PostalCode.findOne(codeQuery)
        if (fromCode == undefined) {
          return responseData.sendMessage(res, 'Event of this Pincode not found', [])
        }
        let postalcodeQuery = validCode ? { postalcode_id: fromCode._id } : {};
        eventQuery = Object.assign(eventQuery, postalcodeQuery)
      } else if (nameQuery) {
        eventQuery = Object.assign(eventQuery, nameQuery)
      } else if (venueQuery) {
        eventQuery = Object.assign(eventQuery, venueQuery)
      }
    }

    if (req.query.schedule_status && req.query.schedule_status == 'completed') {
      eventQuery = Object.assign(eventQuery, { schedule_status: 'completed' })
    } else if (req.query.schedule_status == 'scheduled') {
      eventQuery = Object.assign(eventQuery, { schedule_status: 'scheduled' })
    } else if (req.query.schedule_status == 'cancelled') {
      eventQuery = Object.assign(eventQuery, { schedule_status: 'cancelled' })
    } else if (req.query.schedule_status == 'rescheduled') {
      eventQuery = Object.assign(eventQuery, { schedule_status: 'rescheduled' })
    }

    if (req.query.approval_status && req.query.approval_status == 'pending') {
      eventQuery = Object.assign(eventQuery, { approval_status: 'pending' })
    } else if (req.query.approval_status == 'approved') {
      eventQuery = Object.assign(eventQuery, { approval_status: 'approved' })
    } else if (req.query.approval_status == 'rejected') {
      eventQuery = Object.assign(eventQuery, { approval_status: 'rejected' })
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;;
    let eventData;
    let eventDataCount;
    let totalPages;
    let currentPage;
    let successData = {};



    let eventPipeline = [

      {
        '$match': eventQuery
      },
      {
        '$lookup': {
          'from': 'countries',
          'localField': 'country_id',
          'foreignField': '_id',
          'as': 'country'
        }
      }, {
        '$unwind': {
          'path': '$country'
        }
      }, {
        '$lookup': {
          'from': 'states',
          'localField': 'state_id',
          'foreignField': '_id',
          'as': 'state'
        }
      }, {
        '$unwind': {
          'path': '$state'
        }
      }, {
        '$lookup': {
          'from': 'cities',
          'localField': 'city_id',
          'foreignField': '_id',
          'as': 'city'
        }
      }, {
        '$unwind': {
          'path': '$city'
        }
      }, {
        '$lookup': {
          'from': 'postalcodes',
          'localField': 'postalcode_id',
          'foreignField': '_id',
          'as': 'postalcode'
        }
      }, {
        '$unwind': {
          'path': '$postalcode'
        }
      }, {
        '$lookup': {
          'from': 'users',                 // user who created chapter
          'localField': 'created_by',
          'foreignField': '_id',
          'as': 'user'
        }
      }, {
        '$unwind': {
          'path': '$user'
        }
      }, {
        '$lookup': {
          'from': 'roles',
          'localField': 'user.role_id',
          'foreignField': '_id',
          'as': 'user_role'
        }
      }, {
        '$unwind': {
          'path': '$user_role'
        }
      }, {
        '$lookup': {
          'from': 'chapters',
          'localField': 'chapter_id',
          'foreignField': '_id',
          'as': 'chapter_data'
        }
      },
      {
        '$addFields': {
          'country_name': '$country.country_name',
          'state_name': '$state.state_name',
          'city_name': '$city.city_name',
          'postalcode': '$postalcode.postal_code',
          'user.role': '$user_role.role',                   // user role who created the chapter
          'chapter_name': {
            '$cond': {
              if: { $gt: [{ $size: "$chapter_data" }, 0] },
              then: { $arrayElemAt: ["$chapter_data.chapter_name", 0] },
              else: null
            }
          }
        }
      }, {
        '$project': {
          'country': 0,
          'state': 0,
          'city': 0,
          'user_role': 0,
          'user._id': 0,
          'user.password': 0,
          'user.verified_admin': 0,
          'user.last_logIn': 0,
          'user.is_deleted': 0,
          'user.deletedAt': 0,
          'user.createdAt': 0,
          'user.updatedAt': 0,
          'user.is_active': 0,
          'user.profile_picture': 0,
          'user.__v': 0,
          'chapter_data': 0

        }
      },
      {
        '$sort': {
          createdAt: -1
        }
      },
      {
        '$skip': skip
      },
      {
        '$limit': limit
      }
    ]

    eventData = await Event.aggregate(eventPipeline);
    eventDataCount = await Event.countDocuments(eventQuery);

    totalPages = Math.ceil(eventDataCount / limit);
    successData.eventData = eventData;
    successData.eventDataCount = eventDataCount;
    successData.currentPage = page;
    successData.limit = limit;
    successData.totalPages = totalPages;

    if (eventData.length > 0) {
      responseData.sendResponse(res, 'event details available', successData)
    } else {
      responseData.sendMessage(res, 'event data not found', [])
    }

  } catch (error) {
    helper.logger.error(error);
    responseData.errorResponse(res, 'Something went wrong!');
  }
}

//get all events by chapter_id
const getAllEventsOfChapter = async (req, res) => {
  try {

    let eventQuery = { chapter_id: new mongoose.Types.ObjectId(req.params.chapterId), is_deleted: false };

    if (req.query.search) {
      const searchItem = req.query.search;

      const nameQuery = { event_name: { $regex: searchItem, $options: 'i' } || {}, is_active: true, is_deleted: false };
      const venueQuery = { venue: { $regex: searchItem, $options: 'i' } || {}, is_active: true, is_deleted: false };

      if (searchItem) {
        eventQuery = Object.assign(eventQuery, { $or: [nameQuery, venueQuery] });
      }
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;;
    let eventData;
    let eventDataCount;
    let totalPages;
    let currentPage;
    let successData = {};


    if (req.query.schedule_status && req.query.schedule_status == 'completed') {
      eventQuery = Object.assign(eventQuery, { schedule_status: 'completed' })
    } else if (req.query.schedule_status == 'scheduled') {
      eventQuery = Object.assign(eventQuery, { schedule_status: 'scheduled' })
    } else if (req.query.schedule_status == 'cancelled') {
      eventQuery = Object.assign(eventQuery, { schedule_status: 'cancelled' })
    } else if (req.query.schedule_status == 'rescheduled') {
      eventQuery = Object.assign(eventQuery, { schedule_status: 'rescheduled' })
    }

    if (req.query.approval_status && req.query.approval_status == 'pending') {
      eventQuery = Object.assign(eventQuery, { approval_status: 'pending' })
    } else if (req.query.approval_status == 'approved') {
      eventQuery = Object.assign(eventQuery, { approval_status: 'approved' })
    } else if (req.query.approval_status == 'rejected') {
      eventQuery = Object.assign(eventQuery, { approval_status: 'rejected' })
    }

    let eventPipeline = [

      {
        '$match': eventQuery
      },
      {
        '$lookup': {
          'from': 'countries',
          'localField': 'country_id',
          'foreignField': '_id',
          'as': 'country'
        }
      }, {
        '$unwind': {
          'path': '$country'
        }
      }, {
        '$lookup': {
          'from': 'states',
          'localField': 'state_id',
          'foreignField': '_id',
          'as': 'state'
        }
      }, {
        '$unwind': {
          'path': '$state'
        }
      }, {
        '$lookup': {
          'from': 'cities',
          'localField': 'city_id',
          'foreignField': '_id',
          'as': 'city'
        }
      }, {
        '$unwind': {
          'path': '$city'
        }
      }, {
        '$lookup': {
          'from': 'postalcodes',
          'localField': 'postalcode_id',
          'foreignField': '_id',
          'as': 'postalcode'
        }
      }, {
        '$unwind': {
          'path': '$postalcode'
        }
      }, {
        '$lookup': {
          'from': 'users',                 // user who created chapter
          'localField': 'created_by',
          'foreignField': '_id',
          'as': 'user'
        }
      }, {
        '$unwind': {
          'path': '$user'
        }
      }, {
        '$lookup': {
          'from': 'roles',
          'localField': 'user.role_id',
          'foreignField': '_id',
          'as': 'user_role'
        }
      }, {
        '$unwind': {
          'path': '$user_role'
        }
      }, {
        '$lookup': {
          'from': 'chapters',
          'localField': 'chapter_id',
          'foreignField': '_id',
          'as': 'chapter_data'
        }
      },
      {
        '$unwind': {
          'path': '$chapter_data'
        }
      },
      {
        '$addFields': {
          'country_name': '$country.country_name',
          'state_name': '$state.state_name',
          'city_name': '$city.city_name',
          'postalcode': '$postalcode.postal_code',
          'user.role': '$user_role.role',                   // user role who created the chapter
          'chapter_name': '$chapter_data.chapter_name'
        }
      }, {
        '$project': {
          'country': 0,
          'state': 0,
          'city': 0,
          'user_role': 0,
          'user._id': 0,
          'user.password': 0,
          'user.verified_admin': 0,
          'user.last_logIn': 0,
          'user.is_deleted': 0,
          'user.deletedAt': 0,
          'user.createdAt': 0,
          'user.updatedAt': 0,
          'user.is_active': 0,
          'user.profile_picture': 0,
          'user.__v': 0,
          'chapter_data': 0
        }
      },
      {
        '$sort': {
          createdAt: -1
        }
      },
      {
        '$skip': skip
      },
      {
        '$limit': limit
      }
    ]

    eventData = await Event.aggregate(eventPipeline);
    eventDataCount = await Event.countDocuments(eventQuery);

    totalPages = Math.ceil(eventDataCount / limit);
    successData.eventData = eventData;
    successData.eventDataCount = eventDataCount;
    successData.currentPage = page;
    successData.limit = limit;
    successData.totalPages = totalPages;


    if (eventData.length > 0) {
      responseData.sendResponse(res, 'event details available', successData)
    } else {
      responseData.sendMessage(res, 'event data not available')
    }


  } catch (error) {
    helper.logger.error(error);
    responseData.errorResponse(res, 'Something went wrong!');
  }
}


// get event Details of logged-in user
// const geteventOfUser = async (req, res) => {
//     try {
//         const userevent = await event.find({user_id : req.user._id, is_deleted:false})

//         if(userevent){
//             responseData.sendResponse(res, 'event details available', userevent)
//         }else{
//             responseData.sendMessage(res, 'event not available')
//         }

//     } catch (error) {
//         helper.logger.error(error);
//         responseData.errorResponse(res, 'Something went wrong!');
//     }
// }

// get event-by-event_id

const getEventById = async (req, res) => {
  try {

    let chapterData = await Event.aggregate([
      {
        $match: {
          '_id': new mongoose.Types.ObjectId(req.params.eventId),
          'chapter_id': { $ne: null },
          'is_deleted': false
        }
      },
      {
        $lookup: {
          from: "chapters",
          localField: 'chapter_id',
          foreignField: "_id",
          as: "chapter_data"
        }
      },
      {
        $unwind: "$chapter_data"
      },
      {
        $project: {
          "chapter_name": "$chapter_data.chapter_name",
          "_id": 0
        }
      }
    ])

    const eventData = await Event.aggregate([

      {
        '$match': {
          '_id': new mongoose.Types.ObjectId(req.params.eventId),
          is_deleted: false
        }
      },
      {
        '$lookup': {
          'from': 'countries',
          'localField': 'country_id',
          'foreignField': '_id',
          'as': 'country'
        }
      }, {
        '$unwind': {
          'path': '$country'
        }
      }, {
        '$lookup': {
          'from': 'states',
          'localField': 'state_id',
          'foreignField': '_id',
          'as': 'state'
        }
      }, {
        '$unwind': {
          'path': '$state'
        }
      }, {
        '$lookup': {
          'from': 'cities',
          'localField': 'city_id',
          'foreignField': '_id',
          'as': 'city'
        }
      }, {
        '$unwind': {
          'path': '$city'
        }
      }, {
        '$lookup': {
          'from': 'postalcodes',
          'localField': 'postalcode_id',
          'foreignField': '_id',
          'as': 'postalcode'
        }
      }, {
        '$unwind': {
          'path': '$postalcode'
        }
      },
      {
        '$lookup': {
          'from': 'users',                 // user who created chapter
          'localField': 'created_by',
          'foreignField': '_id',
          'as': 'user'
        }
      }, {
        '$unwind': {
          'path': '$user'
        }
      },
      {
        '$lookup': {
          'from': 'roles',
          'localField': 'user.role_id',
          'foreignField': '_id',
          'as': 'user_role'
        }
      }, {
        '$unwind': {
          'path': '$user_role'
        }
      }, {
        '$addFields': {
          'country_name': '$country.country_name',
          'state_name': '$state.state_name',
          'city_name': '$city.city_name',
          'postalcode': '$postalcode.postal_code',
          'user.role': '$user_role.role',                // user role who created the chapter
          'chapter_name': {
            $ifNull: [
              { $arrayElemAt: [chapterData.chapter_name, 0] },
              null
            ]
          }

        }
      },
      {
        '$project': {
          'country': 0,
          'state': 0,
          'city': 0,
          'user_role': 0,
          'user._id': 0,
          'user.password': 0,
          'user.verified_admin': 0,
          'user.last_logIn': 0,
          'user.is_deleted': 0,
          'user.deletedAt': 0,
          'user.createdAt': 0,
          'user.updatedAt': 0,
          'user.is_active': 0,
          'user.profile_picture': 0,
          'user.__v': 0,
        }
      }
    ])

    if (eventData) {
      responseData.sendResponse(res, 'event details available', eventData)
    } else {
      responseData.sendMessage(res, 'event not available')
    }

  } catch (error) {
    helper.logger.error(error);
    responseData.errorResponse(res, 'Something went wrong!');
  }
}

//update event by eventId
const updateEventById = async (req, res) => {
  try {

    let eventBody = req.body;

    const eventExist = await Event.findOne({ _id: req.params.eventId, is_deleted: false })

    if (eventExist) {
      if (req.file) {
        eventBody.event_image = `${process.env.IMG_PATH}public/images/${req.file}`;
      }

      // if (req.body.start_time && req.body.end_time) {
      //   eventBody.schedule_status = 'rescheduled'
      // }

      //check if event is already happening on same time

      let startTime = JSON.stringify(eventExist.start_time).replace(/^"|"$/g, '')

      if (req.body.start_time && startTime !== req.body.start_time) {
        let eventHappening ;
       
        eventHappening = await Event.findOne({
          start_time: req.body.start_time,
          venue: eventExist.venue,
          $or: [{ schedule_status: 'scheduled' }, { schedule_status: 'rescheduled' }],
          is_deleted: false,
          is_active: true
        }) 

        if(req.body.venue){
          eventHappening = await Event.findOne({
            start_time: eventExist.start_time,
            venue: req.body.venue,
            $or: [{ schedule_status: 'scheduled' }, { schedule_status: 'rescheduled' }],
            is_deleted: false,
            is_active: true
          }) 
        }

        if(req.body.venue && req.body.start_time){
          eventHappening = await Event.findOne({
            start_time: req.body.start_time,
            venue: req.body.venue,
            $or: [{ schedule_status: 'scheduled' }, { schedule_status: 'rescheduled' }],
            is_deleted: false,
            is_active: true
          }) 
        }

        if (eventHappening && eventHappening._id.toString() !== eventExist._id) {
          return responseData.errorResponse(res, 'An Event is already happening on this time at this location');
        }
      
      }

      eventBody.updated_by = req.user._id;
      let updatedevent = await Event.findByIdAndUpdate({ _id: req.params.eventId }, eventBody)


      if (updatedevent) {

        const resultEvent = await Event.aggregate([

          {
            '$match': {
              '_id': new mongoose.Types.ObjectId(req.params.eventId),
              is_deleted: false
            }
          },
          {
            '$lookup': {
              'from': 'countries',
              'localField': 'country_id',
              'foreignField': '_id',
              'as': 'country'
            }
          }, {
            '$unwind': {
              'path': '$country'
            }
          }, {
            '$lookup': {
              'from': 'states',
              'localField': 'state_id',
              'foreignField': '_id',
              'as': 'state'
            }
          }, {
            '$unwind': {
              'path': '$state'
            }
          }, {
            '$lookup': {
              'from': 'cities',
              'localField': 'city_id',
              'foreignField': '_id',
              'as': 'city'
            }
          }, {
            '$unwind': {
              'path': '$city'
            }
          }, {
            '$lookup': {
              'from': 'postalcodes',
              'localField': 'postalcode_id',
              'foreignField': '_id',
              'as': 'postalcode'
            }
          }, {
            '$unwind': {
              'path': '$postalcode'
            }
          },
          {
            '$lookup': {
              'from': 'users',                 // user who created chapter
              'localField': 'created_by',
              'foreignField': '_id',
              'as': 'user'
            }
          }, {
            '$unwind': {
              'path': '$user'
            }
          },
          {
            '$lookup': {
              'from': 'roles',
              'localField': 'user.role_id',
              'foreignField': '_id',
              'as': 'user_role'
            }
          }, {
            '$unwind': {
              'path': '$user_role'
            }
          }, {
            '$lookup': {
              'from': 'chapters',
              'localField': 'chapter_id',
              'foreignField': '_id',
              'as': 'chapter_data'
            }
          },
          {
            '$unwind': {
              'path': '$chapter_data'
            }
          }, {
            '$addFields': {
              'country_name': '$country.country_name',
              'state_name': '$state.state_name',
              'city_name': '$city.city_name',
              'postalcode': '$postalcode.postal_code',
              'user.role': '$user_role.role',              // user role who created the chapter
              'chapter_name': '$chapter_data.chapter_name'

            }
          },
          {
            '$project': {
              'country': 0,
              'state': 0,
              'city': 0,
              'user_role': 0,
              'user._id': 0,
              'user.password': 0,
              'user.verified_admin': 0,
              'user.last_logIn': 0,
              'user.is_deleted': 0,
              'user.deletedAt': 0,
              'user.createdAt': 0,
              'user.updatedAt': 0,
              'user.is_active': 0,
              'user.profile_picture': 0,
              'user.__v': 0,
              'chapter_data': 0
            }
          }
        ])
        responseData.sendResponse(res, 'Event updated successfully!', resultEvent)

      } else {
        responseData.errorResponse(res, 'Event update failed!')
      }

    } else {
      responseData.sendMessage(res, 'Event not found!')
    }

  } catch (error) {
    helper.logger.error(error);
    responseData.errorResponse(res, 'Something went wrong!');
  }
}

//delete event by eventId
const deleteEventById = async (req, res) => {
  try {

    const eventExist = await Event.findOne({ _id: req.params.eventId, is_deleted: false })

    if (eventExist) {

      const deleteEvent = await Event.findByIdAndUpdate({ _id: req.params.eventId }, { is_deleted: true, is_active: false, deletedAt: new Date() })

      if (deleteEvent) {
        responseData.sendResponse(
          res,
          'Event deleted successfully!',
        )
      } else {
        responseData.sendMessage(
          res,
          'Event not found!'
        )
      }
    } else {
      responseData.sendMessage(res, 'event not found!');
    }

  } catch (error) {
    helper.logger.error(error);
    responseData.errorResponse(res, 'Something went wrong!');
  }
}



module.exports = { createEvent, getAllEvents, getEventById, updateEventById, deleteEventById, getAllEventsOfChapter }
