const models = require('../../model/index');
const Chapter = models.chapter;
const PostalCode = models.postalcode
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const { chapterValidation } = require('../../validations/chapterValidation');
const { mongoose } = require('../../config/dbConnection');
const excelJS = require('exceljs');
const path = require('path');



//create-chapter
const createChapter = async (req, res) => {
try {

    const { chapter_name, country_id, state_id, city_id, postalcode_id, chapter_desc, chapter_image } = req.body ;
 
    const chapterValidate = await chapterValidation.createChapter(req.body);

        if(chapterValidate.error){
            return responseData.errorResponse(res, chapterValidate.error.details[0].message);
        }

        const nameExist = await Chapter.findOne({ chapter_name: { $regex: chapter_name, $options: 'i' }, is_deleted: false });
        if (nameExist) {
          return responseData.errorResponse(
            res,
            'Chapter with this name already exist',
          );
        }
          const chapterExistence = await Chapter.findOne({ postalcode_id: new mongoose.Types.ObjectId(postalcode_id), is_deleted: false, is_active: true });

          if (chapterExistence) {
            return responseData.errorResponse(
              res,
              'Chapter for this pincode is already created!',
            );
          }

          function generateRandomNumber(min, max) {             // generated otp
            return Math.floor(Math.random() * (max - min) + min);
          }

          let refferal_code = generateRandomNumber(10000000, 99999999);

          const codeExist = await Chapter.findOne({refferal_code: refferal_code, is_deleted: false} )

          if(codeExist){
           refferal_code = generateRandomNumber(10000000, 99999999);
          }

          let chapterData = {};

        chapterData.chapter_name = chapter_name,
        chapterData.chapter_desc = chapter_desc,
        chapterData.created_by = req.user._id,
        chapterData.country_id = country_id
        chapterData.state_id = state_id
        chapterData.city_id = city_id
        chapterData.postalcode_id = postalcode_id
        chapterData.refferal_code = refferal_code

    if (req.file) {
        chapterData.chapter_image = `${process.env.IMG_PATH}public/images/${req.file}`;
      }

    const createChapter = await Chapter.create(chapterData)

    createChapter.save();

    if(createChapter){


      let chapterData =  await Chapter.aggregate([

        {
            '$match': {
                '_id': new mongoose.Types.ObjectId(createChapter._id)
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
            'user.role': '$user_role.role'                     // user role who created the chapter
          }
        },
        {
            '$project':{
                'country': 0,
                'state':0,
                'city':0,
                'user_role':0,
                'user._id':0,
                'user.password':0,
                'user.verified_admin':0,
                'user.last_logIn':0,
                'user.is_deleted':0,
                'user.deletedAt':0,
                'user.createdAt':0,
                'user.updatedAt':0,
                'user.is_active':0,
                'user.profile_picture':0,
                'user.__v':0,
            }
        }
    ])

        responseData.sendResponse(res, 'Chapter created successfully!', chapterData)
    }else{
        responseData.errorResponse(res, 'Chapter creation failed!')
    }


} catch (error) {
    helper.logger.error(error);
    responseData.errorResponse(res, 'Something went wrong!');
}
}

//get-all-chapters
const getAllChapter = async(req, res) => {
    try {

        let chapterQuery = { is_deleted: false } ;
        
        if(req.query.is_deleted && req.query.is_deleted == 'true' ){
          chapterQuery = { is_deleted : true } ;
        }
        const page = parseInt(req.query.page) ;
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let chapterData;
        let chapterDataCount;
        let totalPages;
        let currentPage;
        let successData = {};

        if(req.query.status && req.query.status == 'approved'){
          chapterQuery = Object.assign(chapterQuery, {status : 'approved'})
        } else if(req.query.status == 'pending'){
          chapterQuery = Object.assign(chapterQuery, {status : 'pending'})
        }else if(req.query.status == 'rejected'){
          chapterQuery = Object.assign(chapterQuery, {status : 'rejected'})
        }

        if(req.query.search){

          const searchItem = req.query.search;
          let fromCode

          let postalcodeQuery;

          const codePattern = /^[1-9][0-9]{5}$/ ;
          const validCode = codePattern.test(searchItem);
          const codeQuery = validCode ? { postal_code: Number (searchItem) } : {};
          const nameQuery = { chapter_name: { $regex: searchItem, $options: 'i' } || {}};
          
          if(validCode){
          fromCode = await PostalCode.findOne(codeQuery)
          if(fromCode == undefined){
            return responseData.sendMessage(res, 'Chapter with this Pincode not found', [])
          }

            postalcodeQuery = validCode ? { postalcode_id: fromCode._id } : {};
            chapterQuery = Object.assign(chapterQuery, postalcodeQuery)
          }else if(nameQuery){
            chapterQuery = Object.assign(chapterQuery, nameQuery)
          }
          
        } 

        chapterPipeline = [

            {
                '$match': chapterQuery
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
              '$addFields': {
                'country_name': '$country.country_name', 
                'state_name': '$state.state_name', 
                'city_name': '$city.city_name', 
                'postalcode': '$postalcode.postal_code'
              }
            },
            {
                '$project':{
                    'country': 0,
                    'state':0,
                    'city':0,
                    // 'postalcode':0,
                }
            }
          ]
          if (page) {
            chapterPipeline.push({
                '$skip': skip
            })
        }
          if (limit) {
            chapterPipeline.push({
                '$limit': limit
            })
        }

        chapterData = await Chapter.aggregate(chapterPipeline)
        chapterDataCount = await Chapter.find(chapterQuery).count()
        

        totalPages = Math.ceil(chapterDataCount / limit);
        successData.chapterData = chapterData;
        successData.chapterDataCount = chapterDataCount;
        successData.currentPage = page;
        successData.limit = limit;
        successData.totalPages = totalPages;
        // successData.search = searchItem;

        if(chapterData.length > 0){
            responseData.sendResponse(res, 'Chapter details available', successData)
        }else{
            responseData.sendMessage(res, 'Chapter not found', successData.chapterData)
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// get chapter-by-chapter-id
const getChapterByChapterId = async (req, res) => {
    try {
        const chapterExist = await Chapter.aggregate([

            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(req.params.chapterId),
                    'is_deleted': false
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
              '$addFields': {
                'country_name': '$country.country_name', 
                'state_name': '$state.state_name', 
                'city_name': '$city.city_name', 
                'postalcode': '$postalcode.postal_code'
              }
            },
            {
                '$project':{
                    'country': 0,
                    'state':0,
                    'city':0,
                    // 'postalcode':0,
                }
            }
          ])
    
        if(chapterExist){
            responseData.sendResponse(res, 'Chapter details available', chapterExist)
        }else{
            responseData.sendMessage(res, 'Chapter details not found', [])
        }
    
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// get chapter-by-postalcode-id
const getChapterBypcId = async (req, res) => {
    try {
    
        const chapterByPc = await Chapter.aggregate([

            {
                '$match': {
                    'postalcode_id': new mongoose.Types.ObjectId(req.params.postalcodeId),
                    'is_deleted': false
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
              '$addFields': {
                'country_name': '$country.country_name', 
                'state_name': '$state.state_name', 
                'city_name': '$city.city_name', 
                'postalcode': '$postalcode.postal_code'
              }
            },
            {
                '$project':{
                    'country': 0,
                    'state':0,
                    'city':0,
                    // 'postalcode':0,
                }
            }
          ])
    
        if(chapterByPc){
            responseData.sendResponse(res, 'Chapter details available', chapterByPc)
        }else{
            responseData.sendMessage(res, 'Chapter not found', [])
        }
    
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//update chapter by chapterId
const updateChapterById = async (req, res) => {
    try {

      let updateBody = req.body;
        
        // const chapterValidate = await chapterValidation.updateChapter(req.body);

        // if(chapterValidate.error){
        //     return responseData.errorResponse(res, chapterValidate.error.details[0].message);
        // }

        const chapterExist = await Chapter.findOne({_id : req.params.chapterId, is_active: true, is_deleted: false})
        
        if(chapterExist){

          if(req.body.chapter_name && req.body.chapter_name !=  chapterExist.chapter_name){
            const nameExist = await Chapter.findOne({ chapter_name: { $regex: req.body.chapter_name, $options: 'i' }, is_deleted: false });
          if (nameExist) {
            return responseData.errorResponse(
              res,
              'Chapter with this name already exist',
            );
          }
        }

            if(req.body.postalcode_id && req.body.postalcode_id != chapterExist.postalcode_id){
                const postalcodeExist = await Chapter.findOne({postalcode_id: req.body.postalcode_id})

                if(postalcodeExist){
                  return responseData.errorResponse(res, 'Chapter for this pincode is already created!');
                }
            }

            if(req.file){
              updateBody.chapter_image = `${process.env.IMG_PATH}public/images/${req.file}`
            }
            const updatedChapter = await Chapter.findByIdAndUpdate({_id:req.params.chapterId}, updateBody)

            if(updatedChapter){

                const chapterInfo = await Chapter.aggregate([

                    {
                        '$match': {
                            '_id': new mongoose.Types.ObjectId(req.params.chapterId)
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
                      '$addFields': {
                        'country_name': '$country.country_name', 
                        'state_name': '$state.state_name', 
                        'city_name': '$city.city_name', 
                        'postalcode': '$postalcode.postal_code'
                      }
                    },
                    {
                        '$project':{
                            'country': 0,
                            'state':0,
                            'city':0,
                            // 'postalcode':0,
                        }
                    }
                  ])

                if(chapterInfo){
                    responseData.sendResponse(res, 'Chapter updated successfully!', chapterInfo )
                }

            }else{
                responseData.errorResponse(res, 'Chapter update failed!')
            }

        }else{
            responseData.sendMessage(res, 'Chapter not found!', [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//update chapter image
const updateChapterImage = async (req, res) => {
    try {
      const chapterExist = await Chapter.findOne({
        _id: req.params.chapterId,
        is_active:true,
        is_deleted: false,
      });

      if (!chapterExist) {
        return responseData.sendMessage(res, 'Chapter not found', []);
      } else {
        const chapterImage = await Chapter.findByIdAndUpdate(
            {_id: req.params.chapterId},
            {
              chapter_image: `${process.env.IMG_PATH}public/images/${req.file}`,
            },
        );

        if (chapterImage) {
          responseData.sendResponse(
              res,
              'Chapter image updated successfully',
          );
        } else {
          helper.logger.error('Chapter image update failed!');
          responseData.errorResponse(res, 'Chapter image update failed!');
        }
      }
    } catch (error) {
      helper.logger.error(error);
      responseData.errorResponse(res, 'Something went wrong!');
    }
}

//delete chapter by chapterId
const deleteChapterById = async (req, res) => {
    try {

        const chapterExist = await Chapter.findOne({_id : req.params.chapterId, is_deleted : false})
      
        if (chapterExist) {

            const deleteChapter = await Chapter.findByIdAndUpdate({ _id: req.params.chapterId }, { is_deleted: true, is_active: false, deletedAt: new Date() })

            if (deleteChapter) {
                responseData.sendResponse(
                    res,
                    'Chapter deleted successfully!',
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Chapter delete failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Chapter not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//restore chapter
const restoreChapters = async (req, res) => {
    try {

        const chapterExist = await Chapter.findOne({_id : req.params.chapterId, is_deleted: true})
      
        if (chapterExist) {

            const restoreChapter = await Chapter.findByIdAndUpdate({ _id: req.params.chapterId }, {is_deleted:false, deletedAt: null, is_active: true})

            if (restoreChapter) {

                responseData.sendResponse(
                    res,
                    'Chapter restored successfully!',
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Chapter restore failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Chapter not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// permenentaly delete chapter by chapterId
const finalDeleteChapterById = async (req, res) => {
  try {

      const chapterExist = await Chapter.findOne({_id : req.params.chapterId, is_deleted: true})
    
      if (chapterExist) {

          const deleteChapter = await Chapter.findByIdAndDelete({ _id: req.params.chapterId })

          if (deleteChapter) {
              responseData.sendResponse(
                  res,
                  'Chapter deleted successfully!',
              )
          } else {
              responseData.sendMessage(
                  res,
                  'Chapter delete failed!'
              )
          }
      } else {
          responseData.sendMessage(res, 'Chapter not found!', []);
      }

  } catch (error) {
      helper.logger.error(error);
      responseData.errorResponse(res, 'Something went wrong!');
  }
}

//get chapter by user_id
const getUserChapter = async (req, res) => {
    try {
        
        const userChapter = await Chapter.find({ members : {$in :[req.user._id]}, is_active: true, is_deleted: false})
    
        if(userChapter.length > 0){
            responseData.sendResponse(res, 'User Chapter details', userChapter)
        }else{
            responseData.sendMessage(res, 'Chapter not found', userChapter)
        }
        } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// status update of chapter - pending/approved/rejected
const chapterStatusUpdate = async (req, res) => {
    try {

        const chapterExist = await Chapter.find({ _id: req.params.chapterId, is_deleted: false, is_active: true })

        if (!chapterExist) {
            responseData.sendMessage(res, 'Chapter not found', chapterExist)
        }
        let approveReq;

        if(req.body.status == 'approved'){
            if(req.user.role_id == 1){
                approveReq =  await Chapter.findByIdAndUpdate({ _id: req.params.chapterId }, { status: 'approved', approved_at : new Date(), approved_by: req.user._id, approved_by_collection: 'admin' })
            }else{
                approveReq =  await Chapter.findByIdAndUpdate({ _id: req.params.chapterId }, { status: 'approved', approved_at : new Date(), approved_by: req.user._id, approved_by_collection: 'user' })
            }

        }else{

            approveReq = await Chapter.findByIdAndUpdate({ _id: req.params.chapterId }, { status: req.body.status })
        }



        if (approveReq) {
            const getReq = await Chapter.aggregate([

                {
                    '$match': {
                        '_id': new mongoose.Types.ObjectId(req.params.chapterId)
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
                  '$addFields': {
                    'country_name': '$country.country_name', 
                    'state_name': '$state.state_name', 
                    'city_name': '$city.city_name', 
                    'postalcode': '$postalcode.postal_code'
                  }
                },
                {
                    '$project':{
                        'country': 0,
                        'state':0,
                        'city':0,
                        // 'postalcode':0,
                    }
                }
              ])

            if (getReq) {
                responseData.sendResponse(res, 'Chapter status updated successfully!', getReq)
            } else {
                responseData.errorResponse(res, 'Chapter status update failed!')
            }
        } else {
            responseData.errorResponse(res, 'Chapter status update failed!')
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//download data
const downloadChapter = async (req, res) => {
  try {
    
    let chapterQuery = {is_deleted : false};
     
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    let chapterData;
    let chapterDataCount;
    let totalPages;
    let currentPage;
    let successData = {};


    if (req.query.status && req.query.status == 'approved') {
      chapterQuery = { status: 'approved', is_deleted: false }
    } else if (req.query.status == 'pending') {
      chapterQuery = { status: 'pending', is_deleted: false }
    } else if (req.query.status == 'rejected') {
      chapterQuery = { status: 'rejected', is_deleted: false }
    }

  
    if(req.query.search){

      const searchItem = req.query.search;
      let fromCode

      let postalcodeQuery;

      const codePattern = /^[1-9][0-9]{5}$/ ;
      const validCode = codePattern.test(searchItem);
      const codeQuery = validCode ? { postal_code: Number (searchItem) } : {};
      const nameQuery = { chapter_name: { $regex: searchItem, $options: 'i' } || {}, is_deleted: false };
      
      if(validCode){
      fromCode = await PostalCode.findOne(codeQuery)
      if(fromCode == undefined){
        return responseData.sendMessage(res, 'Chapter with this Pincode not found', [])
      }

        postalcodeQuery = isPincode ? { postalcode_id: fromCode._id } : {is_deleted:false};
        chapterQuery = postalcodeQuery
      }else if(nameQuery){
        chapterQuery = nameQuery
      }
          
  }

    chapterData = await Chapter.aggregate([

        {
            '$match': chapterQuery
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
          '$addFields': {
            'country_name': '$country.country_name', 
            'state_name': '$state.state_name', 
            'city_name': '$city.city_name', 
            'postalcode': '$postalcode.postal_code'
          }
        },
        {
            '$project':{
                'country': 0,
                'state':0,
                'city':0,
                // 'postalcode':0,
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
      ])

    chapterDataCount = await Chapter.find(chapterQuery).count()
    
    totalPages = Math.ceil(chapterDataCount / limit);
    successData.chapterData = chapterData;
    successData.chapterDataCount = chapterDataCount;
    successData.currentPage = page;
    successData.limit = limit;
    successData.totalPages = totalPages;

    if (chapterData.length == 0) {
      responseData.sendMessage(res, 'Chapter not found', chapterData);
    } else {
      const workbook = new excelJS.Workbook();
      const sheetName = 'Chapter Data';
      const worksheet = workbook.addWorksheet(sheetName); // New Worksheet
    

      worksheet.columns = [
        {header: '_id', key: '_id', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'chapter_name', key: 'chapter_name', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'chapter_desc', key: 'chapter_desc', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'status', key: 'status', width: 20, horizontalCentered : true, verticalCentered: true},
        {header: 'postalcode', key: 'postalcode', width: 20, horizontalCentered : true, verticalCentered: true},
        {header: 'country_name', key: 'country_name', width: 20, horizontalCentered : true, verticalCentered: true},
        {header: 'state_name', key: 'state_name', width: 20, horizontalCentered : true, verticalCentered: true},
        {header: 'city_name', key: 'city_name', width: 20, horizontalCentered : true, verticalCentered: true}
      ];

      // eslint-disable-next-line guard-for-in
      for (i in chapterData) {
        worksheet.addRow(chapterData[i]);
      }

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = {bold: true};
      });

      const filePath = path.join(__dirname,'../../../public/files', 'Chapter_Data.xlsx');
 
      workbook.xlsx.writeFile(filePath).then(() => {
        const downloadUrl = `${process.env.IMG_PATH}public/files/Chapter_Data.xlsx`;

        responseData.sendResponse(res, 'Url for download data', downloadUrl);
      })
          .catch((err) => {
            responseData.sendMessage(res, 'Error creating Excel file:', err);
          });
    }
  } catch (error) {
    helper.logger.error(error);
    responseData.errorResponse(res, error);
  }
}

//verify reffreal code
const verifyRefferalCode = async (req, res) => {
  try {
    const { refferal_code, chapterId_refferalType } = req.body;


  const validCode = await Chapter.findOne({_id: chapterId_refferalType, refferal_code : refferal_code})

  if(validCode){
    responseData.sendResponse(res, 'Refferal code verified successfully!');
  }else{
    responseData.errorResponse(res, 'Invalid Reffreal code!');
  }

  } catch (error) {
    helper.logger.error(error);
    responseData.errorResponse(res, error);
  }
}

module.exports = {createChapter, getAllChapter, getChapterBypcId, getChapterByChapterId, updateChapterById, deleteChapterById, updateChapterImage, restoreChapters, chapterStatusUpdate, getUserChapter, downloadChapter, finalDeleteChapterById, verifyRefferalCode}
