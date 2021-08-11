module.exports = function (req, res, next){
    //This method is called after the authorization middleware function
    //It must have set req.user
    //401 Unauthorized
    //403 Forbidden
    if(!req.user.isAdmin) return res.status(403).send('Access Denied');

    next();
}