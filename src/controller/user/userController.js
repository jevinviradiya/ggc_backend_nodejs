const models = require('../../model/index');
const helper = require('../../helper/helper-function');
const { send_email } = require('../../helper/sendEmail');
// const { sendSMS } = require('../../helper/sendSms');
const { checkIdentity } = require('../../helper/helper-function');
const { HasPass } = require('../../helper/HasPass');
const { genOtp } = require('../../helper/generateOtp');
const responseData = require('../../helper/response');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userValidation } = require('../../validations/userValidation');
const User = models.user;
const Otp = models.otp;
const Role = models.role;
const Chapter = models.chapter;
const Wallet = models.wallet;
const excelJS = require('exceljs');
const path = require('path');
const { mongoose } = require('../../config/dbConnection');
const { sendSMS } = require('../../helper/sendSms');



// add user api 
const createUser = async (req, res) => {
    try {

        const { first_name, last_name, birth_date, address, city_id, state_id, postalcode_id, country_id, gender, profile_picture, mobile_number, phone_code, role_id, email, chapterId_refferalType, password, confirm_password } = req.body;

        const userValidate = await userValidation.createUserValidation(req.body);

        if (userValidate.error) {
            return responseData.errorResponse(res, userValidate.error.details[0].message);
        }

        if (password !== confirm_password) {
            return responseData.errorResponse(res, 'Password and confirm password does not match!');
        }

        const emailExistence = await User.findOne({ email: email, is_deleted: false });

        if (emailExistence) {
            return responseData.sendMessage(
                res,
                'User already exist with this email!',
            );
        }

        const mobileExistence = await User.findOne({ mobile_number: mobile_number, is_deleted: false });

        if (mobileExistence) {
            return responseData.sendMessage(
                res,
                'User already exist with this mobile number!',
            );
        }
        let bodyData = {};

        bodyData.created_by = req.user._id;
        bodyData.password = await HasPass(confirm_password);
        bodyData.otp = await genOtp();
        bodyData.mobile_number = mobile_number;
        bodyData.first_name = first_name;
        bodyData.last_name = last_name;
        bodyData.birth_date = birth_date;
        bodyData.address = address;
        bodyData.city_id = city_id;
        bodyData.state_id = state_id;
        bodyData.postalcode_id = postalcode_id;
        bodyData.country_id = country_id;
        bodyData.gender = gender;
        bodyData.email = email;
        bodyData.chapterId_refferalType = chapterId_refferalType;
        bodyData.phone_code = phone_code;
        bodyData.role_id = role_id;

        if (req.file) {
            bodyData.profile_picture = `${process.env.IMG_PATH}public/images/${req.file}`;
        }
        const addedUser = await User.create(bodyData)
        addedUser.save();

        if (addedUser) {

            await Chapter.findByIdAndUpdate({_id: req.body.chapterId_refferalType}, {
                $push: {members : addedUser._id }})

            let userWallet = await Wallet.create({ user_id: addedUser._id })
            await User.findByIdAndUpdate({ _id: userWallet.user_id }, { wallet_id: userWallet._id })
            let updatedUser = await User.findByIdAndUpdate({ _id: userWallet.user_id }, { wallet_id: userWallet._id })

            if (updatedUser) {
                const userData = await User.aggregate([

                    {
                        '$match': {
                            '_id': new mongoose.Types.ObjectId(addedUser._id)
                        }
                    },{
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
                    },{
                        '$unwind': {
                            'path': '$postalcode'
                        }
                    },
                    {
                        '$lookup': {
                            'from': 'roles',
                            'localField': 'role_id',
                            'foreignField': '_id',
                            'as': 'role'
                        }
                    }, {
                        '$unwind': {
                            'path': '$role'
                        }
                    },{
                        '$lookup': {
                            'from': 'chapters',
                            'localField': 'chapterId_refferalType',
                            'foreignField': '_id',
                            'as': 'chapter'
                        }
                    }, {
                        '$unwind': {
                            'path': '$chapter'
                        }
                    }, {
                        '$addFields': {
                            'country_name': '$country.country_name',
                            'state_name': '$state.state_name',
                            'city_name': '$city.city_name',
                            'postal_code': '$postalcode.postal_code',
                            'role': '$role.role',
                            'chapter_name': '$chapter.chapter_name'
                        }
                    },
                    {
                        '$project': {
                            'country': 0,
                            'state': 0,
                            'city': 0,
                            'postalcode': 0,
                            'chapter': 0,
                            // 'role': 0,
                        }
                    }
                ])
                responseData.sendResponse(res, 'User created successfully!', userData)
            }
        } else {
            responseData.sendMessage(res, 'User create failed!')
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const memberRegistration = async (req, res) => {
    try {

        const { first_name, last_name, phone_code, mobile_number, gender, email,  birth_date, address, city_id, state_id, postalcode_id, country_id, chapterId_refferalType,refferal_code, password, confirm_password , company_name, pan_number, gst_number} = req.body;

        // const userValidate = await userValidation.memberRegisterValidation(req.body);

        // if (userValidate.error) {
        //     return responseData.errorResponse(res, userValidate.error.details[0].message);
        // }

        let bodyData = {};
        if(password && confirm_password){
            if ( password !== confirm_password) {
                return responseData.errorResponse(res, 'Password and confirm password does not match!');
            }
                bodyData.password = await HasPass(confirm_password);
        }

        const emailExistence = await User.findOne({ email: email, is_deleted: false });

        if (emailExistence) {
            return responseData.sendMessage(
                res,
                'User already exist with this email!',
            );
        }

        const mobileExistence = await User.findOne({ mobile_number: mobile_number, is_deleted: false });

        if (mobileExistence) {
            return responseData.sendMessage(
                res,
                'User already exist with this mobile number!',
            );
        }


        bodyData.first_name = first_name;
        bodyData.last_name = last_name;
        bodyData.chapterId_refferalType = chapterId_refferalType;
        bodyData.refferal_code = refferal_code;
        bodyData.phone_code = phone_code;
        // bodyData.otp = await genOtp();
        bodyData.mobile_number = mobile_number;
        bodyData.birth_date = birth_date;
        bodyData.gender = gender;
        bodyData.email = email;
        bodyData.address = address;
        bodyData.city_id = city_id;
        bodyData.state_id = state_id;
        bodyData.postalcode_id = postalcode_id;
        bodyData.country_id = country_id;
        bodyData.company_name = company_name;
        bodyData.pan_number = pan_number;
        bodyData.gst_number = gst_number;

        // const send_sms = await sendSMS(mobile_number)

        // if(send_sms){
            const addedUser = await User.create(bodyData)
            addedUser.save();
    
            if (addedUser) {
    
                await Chapter.findByIdAndUpdate({_id: req.body.chapterId_refferalType}, {
                    $push: {members : addedUser._id }})
    
                let userWallet = await Wallet.create({ user_id: addedUser._id })
                await User.findByIdAndUpdate({ _id: userWallet.user_id }, { wallet_id: userWallet._id })
                let updatedUser = await User.findByIdAndUpdate({ _id: userWallet.user_id }, { wallet_id: userWallet._id })
    
                if (updatedUser) {
                    const userData = await User.aggregate([
    
                        {
                            '$match': {
                                '_id': new mongoose.Types.ObjectId(addedUser._id)
                            }
                        },{
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
                        },{
                            '$unwind': {
                                'path': '$postalcode'
                            }
                        },
                        {
                            '$lookup': {
                                'from': 'roles',
                                'localField': 'role_id',
                                'foreignField': '_id',
                                'as': 'role'
                            }
                        }, {
                            '$unwind': {
                                'path': '$role'
                            }
                        }, {
                            '$lookup': {
                                'from': 'chapters',
                                'localField': 'chapterId_refferalType',
                                'foreignField': '_id',
                                'as': 'chapter'
                            }
                        }, {
                            '$unwind': {
                                'path': '$chapter'
                            }
                        }, {
                            '$addFields': {
                                'country_name': '$country.country_name',
                                'state_name': '$state.state_name',
                                'city_name': '$city.city_name',
                                'postal_code': '$postalcode.postal_code',
                                'role': '$role.role',
                                'chapter_name': '$chapter.chapter_name'
                            }
                        },
                        {
                            '$project': {
                                'country': 0,
                                'state': 0,
                                'city': 0,
                                'postalcode': 0,
                                'chapter': 0,
                                // 'role': 0,
                            }
                        }
                    ])
                    responseData.sendResponse(res, 'Community member registration successfully!', userData)
                }
            } else {
                responseData.sendMessage(res, 'Community member registration failed!')
            }
        // }else{
        //  responseData.errorResponse(res, 'Cannot send OTP to provided number!');
        // }
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}


//update user image
const updateUserImage = async (req, res) => {
    try {
        const userExist = await User.findOne({
            _id: req.user._id,
            is_deleted: false,
        });

        if (!userExist) {
            return responseData.errorResponse(res, 'User does not exist');
        } else {
            const userImage = await User.findByIdAndUpdate(
                { _id: req.params.userId },
                {
                    profile_image: `${process.env.IMG_PATH}public/images/${req.file}`,
                },
            );

            if (userImage) {
                responseData.sendResponse(
                    res,
                    'User profile image uploaded successfully',
                );
            } else {
                helper.logger.error('Something went wrong');
                responseData.errorResponse(res, 'Something went wrong');
            }
        }
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// get All users
const getAllUsers = async (req, res) => {
    try {

        let userQuery = { is_deleted: false, verified_admin: {$ne: "true"} } 

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let userData;
        let userDataCount;
        let totalPages;
        let currentPage;
        let successData = {};


        if (req.query.active) {
            let activeStatus = req.query.active
            if (activeStatus == 'true') {
                userQuery = Object.assign(userQuery, { is_active: true })
            } else if (activeStatus == 'false') {
                userQuery = Object.assign(userQuery, { is_active: false })
            }
        }

        if (req.query.search) {
            const searchItem = req.query.search;

            const emailQuery = { email: { $regex: searchItem, $options: 'i' } || {}, is_deleted: false };

            const mobileNumberPattern = /^\d+$/;
            const isMobileNumber = mobileNumberPattern.test(searchItem);

            const mobileQuery = isMobileNumber ? { mobile_number: Number(searchItem), is_deleted: false } : {};
            if (isMobileNumber) {
                userQuery = Object.assign({userQuery, mobileQuery});
            } else if (searchItem) {
                userQuery = Object.assign(userQuery, { $or: [emailQuery] });
            }
            
        }

        userData = await User.aggregate([

            {
                '$match': userQuery
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
                    'from': 'roles',
                    'localField': 'role_id',
                    'foreignField': '_id',
                    'as': 'role'
                }
            }, {
                '$unwind': {
                    'path': '$role'
                }
            }, {
                '$lookup': {
                    'from': 'chapters',
                    'localField': 'chapterId_refferalType',
                    'foreignField': '_id',
                    'as': 'chapter'
                }
            }, {
                '$unwind': {
                    'path': '$chapter'
                }
            },
             {
                '$addFields': {
                    'country_name': '$country.country_name',
                    'state_name': '$state.state_name',
                    'city_name': '$city.city_name',
                    'postal_code': '$postalcode.postal_code',
                    'role': '$role.role',
                    'chapter_name': '$chapter_name.chapter_name'
                }
            },
            {
                '$project': {
                    'country': 0,
                    'state': 0,
                    'city': 0,
                    'postalcode': 0,
                    'chapter': 0,
                    // 'role': 0,
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

        userDataCount = await User.find(userQuery).count()


        totalPages = Math.ceil(userDataCount / limit);
        successData.userData = userData;
        successData.userDataCount = userDataCount;
        successData.currentPage = page;
        successData.limit = limit;
        successData.totalPages = totalPages;


        if (userData.length > 0) {
            responseData.sendResponse(
                res,
                'User Details',
                successData
            );
        } else {
            responseData.sendMessage(res, 'User Details not found!', userData);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, error.message || 'An error occurred');
    }
}

// get logged-in user Details
const getUserDetails = async (req, res) => {
    try {
        const user = await User.aggregate([

            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(req.user._id)
                }
            },{
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
            },{
                '$unwind': {
                    'path': '$postalcode'
                }
            },
            {
                '$lookup': {
                    'from': 'roles',
                    'localField': 'role_id',
                    'foreignField': '_id',
                    'as': 'role'
                }
            }, {
                '$unwind': {
                    'path': '$role'
                }
            }, {
                '$lookup': {
                    'from': 'chapters',
                    'localField': 'chapterId_refferalType',
                    'foreignField': '_id',
                    'as': 'chapter'
                }
            }, {
                '$unwind': {
                    'path': '$chapter'
                }
            }, {
                '$addFields': {
                    'country_name': '$country.country_name',
                    'state_name': '$state.state_name',
                    'city_name': '$city.city_name',
                    'postal_code': '$postalcode.postal_code',
                    'role': '$role.role',
                    'chapter_name': '$chapter.chapter_name'
                }
            },
            {
                '$project': {
                    'country': 0,
                    'state': 0,
                    'city': 0,
                    'postalcode': 0,
                    'chapter': 0,
                    // 'role': 0,
                }
            }
        ])

        if (user) {
            responseData.sendResponse(
                res,
                'User Details',
                user
            );
        } else {
            responseData.sendMessage(res, 'User not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// purchase a membership

// get Users by their memberships

//Get user by id
const getUserById = async (req, res) => {
    try {
        const user =  await User.aggregate([

            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(req.params.userId)
                }
            },{
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
            },{
                '$unwind': {
                    'path': '$postalcode'
                }
            },
            {
                '$lookup': {
                    'from': 'roles',
                    'localField': 'role_id',
                    'foreignField': '_id',
                    'as': 'role'
                }
            }, {
                '$unwind': {
                    'path': '$role'
                }
            }, {
                '$lookup': {
                    'from': 'chapters',
                    'localField': 'chapterId_refferalType',
                    'foreignField': '_id',
                    'as': 'chapter'
                }
            }, {
                '$unwind': {
                    'path': '$chapter'
                }
            },{
                '$addFields': {
                    'country_name': '$country.country_name',
                    'state_name': '$state.state_name',
                    'city_name': '$city.city_name',
                    'postal_code': '$postalcode.postal_code',
                    'role': '$role.role',
                    'chapter_name': '$chapter.chapter_name'
                }
            },
            {
                '$project': {
                    'country': 0,
                    'state': 0,
                    'city': 0,
                    'postalcode': 0,
                    'chapter': 0,
                    // 'role': 0,
                }
            }
        ])
        if (user.length > 0) {
            responseData.sendResponse(
                res,
                'User Details',
                user
            );
        } else {
            responseData.sendMessage(res, 'User not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// get user by roles
const getUserByRoleId = async (req, res) => {
    try {
        const user =  await User.aggregate([

            {
                '$match': {
                    'role_id': new mongoose.Types.ObjectId(req.params.roleId),
                    is_deleted: false
                }
            },{
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
            },{
                '$unwind': {
                    'path': '$postalcode'
                }
            }, {
                '$lookup': {
                    'from': 'roles',
                    'localField': 'role_id',
                    'foreignField': '_id',
                    'as': 'role'
                }
            }, {
                '$unwind': {
                    'path': '$role'
                }
            }, {
                '$lookup': {
                    'from': 'chapters',
                    'localField': 'chapterId_refferalType',
                    'foreignField': '_id',
                    'as': 'chapter'
                }
            }, {
                '$unwind': {
                    'path': '$chapter'
                }
            }, {
                '$addFields': {
                    'country_name': '$country.country_name',
                    'state_name': '$state.state_name',
                    'city_name': '$city.city_name',
                    'postal_code': '$postalcode.postal_code',
                    'role': '$role.role',
                    'chapter_name': '$chapter.chapter_name'
                }
            }, {
                '$project': {
                    'country': 0,
                    'state': 0,
                    'city': 0,
                    'postalcode': 0,
                    'chapter': 0,
                    // 'role': 0,
                }
            }
        ])
        if (user.length > 0) {
            responseData.sendResponse(
                res,
                'User Details',
                user
            );
        } else {
            responseData.sendMessage(res, 'User not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// get user by chapterId
const getUserByChapterId = async (req, res) => {
    try {
        const user =  await User.aggregate([

            {
                '$match': {
                    'chapterId_refferalType': new mongoose.Types.ObjectId(req.params.chapterId),
                    is_deleted: false
                }
            },{
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
            },{
                '$unwind': {
                    'path': '$postalcode'
                }
            }, {
                '$lookup': {
                    'from': 'roles',
                    'localField': 'role_id',
                    'foreignField': '_id',
                    'as': 'role'
                }
            }, {
                '$unwind': {
                    'path': '$role'
                }
            }, {
                '$addFields': {
                    'country_name': '$country.country_name',
                    'state_name': '$state.state_name',
                    'city_name': '$city.city_name',
                    'postal_code': '$postalcode.postal_code',
                    'role': '$role.role'
                }
            }, {
                '$project': {
                    'country': 0,
                    'state': 0,
                    'city': 0,
                    'postalcode': 0,
                    // 'role': 0,
                }
            }
        ])
        if (user.length > 0) {
            responseData.sendResponse(
                res,
                'User Details',
                user
            );
        } else {
            responseData.sendMessage(res, 'User not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//update user by id
const updateUserById = async (req, res) => {
    try {

        const userValidate = await userValidation.updateUserValidation(req.body);

        if (userValidate.error) {
            return responseData.errorResponse(res, userValidate.error.details[0].message);
        }

        const userExist = await User.findOne({_id: req.params.userId})

        if (!userExist) {
            responseData.sendMessage(res, 'User not found!', []);
        } else {

            let updateBody = req.body;

            if (req.body.email && req.body.email !== userExist.email) {

                const emailExist = await User.findOne({ email: req.body.email, is_deleted: false })

                if (emailExist) {
                    return responseData.errorResponse(res, 'User email already Exist');
                }

            }

            if (req.body.mobile_number && req.body.mobile_number != userExist.mobile_number) {

                const mNumberExist = await User.findOne({ mobile_number: req.body.mobile_number, is_deleted: false })

                if (mNumberExist) {
                    return responseData.errorResponse(res, 'User mobile number already Exist');
                }

            }

            if(req.file){
                updateBody.profile_picture = `${process.env.IMG_PATH}public/images/${req.file}`
            }
            
            const updateUser = await User.findByIdAndUpdate({ _id: req.params.userId }, updateBody)

            if (updateUser) {
                const user =  await User.aggregate([

                    {
                        '$match': {
                            '_id': new mongoose.Types.ObjectId(req.params.userId)
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
                            'from': 'roles',
                            'localField': 'role_id',
                            'foreignField': '_id',
                            'as': 'role'
                        }
                    }, {
                        '$unwind': {
                            'path': '$role'
                        }
                    },{
                        '$lookup': {
                            'from': 'chapters',
                            'localField': 'chapterId_refferalType',
                            'foreignField': '_id',
                            'as': 'chapter'
                        }
                    }, {
                        '$unwind': {
                            'path': '$chapter'
                        }
                    }, {
                        '$addFields': {
                            'country_name': '$country.country_name',
                            'state_name': '$state.state_name',
                            'city_name': '$city.city_name',
                            'postal_code': '$postalcode.postal_code',
                            'role': '$role.role',
                            'chapter_name': '$chapter.chapter_name',
                        }
                    },
                    {
                        '$project': {
                            'country': 0,
                            'state': 0,
                            'city': 0,
                            'postalcode': 0,
                            'chapter': 0,
                            // 'role': 0,
                        }
                    }
                ])

                responseData.sendResponse(
                    res,
                    'User updated successfully!',
                    user
                );

            } else {
                responseData.errorResponse(res, 'User update failed!');

            }

        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//delete user by id
const deleteUserById = async (req, res) => {
    try {

        const userExist = await User.findOne({ _id: req.params.userId, is_deleted: false })

        if (userExist) {

            const deleteUser = await User.findByIdAndUpdate({ _id: req.params.userId }, { is_deleted: true, deletedAt: new Date() })

            if (deleteUser) {
                responseData.sendResponse(
                    res,
                    'User deleted successfully!',
                )
            } else {
                responseData.sendMessage(
                    res,
                    'User delete failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'User not found!', []);
        }



    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//get users by chapter id

//download user data
const downloadUserData = async (req, res) => {
    try {

        let userQuery = { is_deleted: false, verified_admin: {$ne: "true"} } 

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let userData;
        let userDataCount;
        let totalPages;
        let currentPage;
        let successData = {};


        if (req.query.active) {
            let activeStatus = req.query.active
            if (activeStatus == 'true') {
                userQuery = Object.assign(userQuery, { is_active: true })
            } else if (activeStatus == 'false') {
                userQuery = Object.assign(userQuery, { is_active: false })
            }
        }

        if (req.query.search) {
            const searchItem = req.query.search;

            const emailQuery = { email: { $regex: searchItem, $options: 'i' } || {}, is_deleted: false };

            const mobileNumberPattern = /^\d+$/;
            const isMobileNumber = mobileNumberPattern.test(searchItem);

            const mobileQuery = isMobileNumber ? { mobile_number: Number(searchItem), is_deleted: false } : {};
            if (isMobileNumber) {
                userQuery = Object.assign(userQuery, mobileQuery);
            } else if (searchItem) {
                userQuery = Object.assign(userQuery, { $or: [emailQuery] });
            }

        }

        userData = await User.aggregate([

            {
                '$match': userQuery
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
                    'from': 'roles',
                    'localField': 'role_id',
                    'foreignField': '_id',
                    'as': 'role'
                }
            }, {
                '$unwind': {
                    'path': '$role'
                }
            },
            {
                '$lookup': {
                    'from': 'chapters',
                    'localField': 'chapterId_refferalType',
                    'foreignField': '_id',
                    'as': 'chapter'
                }
            }, {
                '$unwind': {
                    'path': '$chapter'
                }
            }, {
                '$addFields': {
                    'country_name': '$country.country_name',
                    'state_name': '$state.state_name',
                    'city_name': '$city.city_name',
                    'postal_code': '$postalcode.postal_code',
                    'role': '$role.role',
                    'chapter_name': '$chapter.chapter_name',
                }
            },
            {
                '$project': {
                    'country': 0,
                    'state': 0,
                    'city': 0,
                    'postalcode': 0,
                    'chapter': 0,
                    // 'role': 0,
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

        userDataCount = await User.find(userQuery).count()


        totalPages = Math.ceil(userDataCount / limit);
        successData.userData = userData;
        successData.userDataCount = userDataCount;
        successData.currentPage = page;
        successData.limit = limit;
        successData.totalPages = totalPages;


        if (userData.length == 0) {
            responseData.sendMessage(res, 'User Details not found!', userData);
        } else {

            const workbook = new excelJS.Workbook();
            const sheetName = 'User Data';
            const worksheet = workbook.addWorksheet(sheetName); // New Worksheet


            worksheet.columns = [
                { header: '_id', key: '_id', width: 30, horizontalCentered: true, verticalCentered: true },
                { header: 'first_name', key: 'first_name', width: 30, horizontalCentered: true, verticalCentered: true },
                { header: 'last_name', key: 'last_name', width: 30, horizontalCentered: true, verticalCentered: true },
                { header: 'birth_date', key: 'birth_date', width: 30, horizontalCentered: true, verticalCentered: true },
                { header: 'address', key: 'address', width: 20, horizontalCentered: true, verticalCentered: true },
                { header: 'country_name', key: 'country_name', width: 20, horizontalCentered: true, verticalCentered: true },
                { header: 'state_name', key: 'state_name', width: 20, horizontalCentered: true, verticalCentered: true },
                { header: 'city_name', key: 'city_name', width: 20, horizontalCentered: true, verticalCentered: true },
                { header: 'postal_code', key: 'postal_code', width: 20, horizontalCentered: true, verticalCentered: true },
                { header: 'gender', key: 'gender', width: 20, horizontalCentered: true, verticalCentered: true },
                { header: 'email', key: 'email', width: 20, horizontalCentered: true, verticalCentered: true },
                { header: 'phone_code', key: 'phone_code', width: 20, horizontalCentered: true, verticalCentered: true },
                { header: 'mobile_number', key: 'mobile_number', width: 30, horizontalCentered: true, verticalCentered: true },
                { header: 'role', key: 'role', width: 30, horizontalCentered: true, verticalCentered: true },
                { header: 'chapter_name', key: 'chapter_name', width: 30, horizontalCentered: true, verticalCentered: true },
                { header: 'social_id', key: 'social_id', width: 30, horizontalCentered: true, verticalCentered: true },
                { header: 'wallet_id', key: 'wallet_id', width: 30, horizontalCentered: true, verticalCentered: true },
            ];

            // eslint-disable-next-line guard-for-in
            for (i in userData) {
                worksheet.addRow(userData[i]);
            }

            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
            });

            const filePath = path.join(__dirname, '../../../public/files', 'User_Data.xlsx');

            workbook.xlsx.writeFile(filePath).then(() => {
                const downloadUrl = `${process.env.IMG_PATH}public/files/User_Data.xlsx`;

                responseData.sendResponse(res, 'Url for download data', downloadUrl);
            })
                .catch((err) => {
                    responseData.sendMessage(res, 'Error creating Excel file:', err);
                });

        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, error.message || 'An error occurred');
    }
}

module.exports = { createUser, getUserDetails, getUserById, updateUserById, updateUserImage, deleteUserById, getAllUsers, downloadUserData , memberRegistration, getUserByRoleId}
