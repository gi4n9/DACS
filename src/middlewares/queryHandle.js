const queryHandle = (req, res, next) => {
  req.query.limit = req.query.limit ? +req.query.limit : 10;
  req.query.page = req.query.page ? +req.query.page : 1;
  next();
};

module.exports = queryHandle;
