const {UserDetails} = require('../models/index')
async function isUserExist(req) {
    const {email} = req.body
    const commonIsUserExist = await UserDetails.findOne({
        where: {
            email,
            is_deleted: false
        },
        raw: true
    })
    
    return commonIsUserExist

}
module.exports = {
    isUserExist
}
