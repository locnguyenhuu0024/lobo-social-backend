const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

module.exports = {
    bcryptHashPass: function(passInput){
        const password = bcrypt.hashSync(passInput, salt);
        return password;
    },
    comparePass: function(passInput, passFromDB){
        return bcrypt.compareSync(passInput, passFromDB);
    }
}