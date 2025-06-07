const isAuthenticated = (req,res,next) => {
    if(req.session && req.session.user){
        console.log('User is in session')
        return next()
    }
    return res.status(401).json({error : 'Unauthorized'})
}

module.exports = {
    isAuthenticated
}