const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);


const validate = (req, res, next) => {
    const JoiSchema = Joi.object({

        name: Joi.string()
            .min(5)
            .max(50)
            .required(),

        email: Joi.string()
            .email()
            .min(5)
            .max(50)
            .lowercase()
            .required(),

        password: joiPassword
            .string()
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .noWhiteSpaces()
            .onlyLatinCharacters()
            .required(),
    });

    const { error } = JoiSchema.validate(req.body);
    if (error) {
        return res.json({success:false, msg:error.details[0].message});
    }
    else {
        next();
    }
}


module.exports = {  validate };