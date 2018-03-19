const checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({
      message: 'User is not authorized.',
    });
  }
};

export default checkAuth;
