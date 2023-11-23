const sendResponse = (res, msg, data) => {
    res.status(200).send({
      status: true,
      message: msg,
      data: data,
    });
  };
  
  const errorResponse = (res, msg) => {
    res.status(400).send({
      status: false,
      message: msg,
    });
  };
  
  const sendMessage = (res, msg, data) => {
    res.status(200).send({
      status: false,
      message: msg,
      data: data
    });
  };
  
  
  
  module.exports = {sendResponse, errorResponse, sendMessage};
  