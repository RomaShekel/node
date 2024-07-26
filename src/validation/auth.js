
import Joi from 'joi'

export const registerUserSchema = Joi.object({
    name: Joi.string().min(3).max(30).required().messages({
        'string.base': 'Name must be a string!',
        'any.required': 'Name is required!'
    }),
    email: Joi.string().email().required().messages({
        'string.base':'Email is must be a string!',
        'any.required': 'Email is required!'
    }),
    password: Joi.string().min(8).max(30).required().messages({
        'string.base': 'Password must be string',
        'any.required':'Password is required!'
    })
})

export const loginUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  export const requestResetEmailSchema = Joi.object({
    email: Joi.string().email().required(),
  });

  export const resetPasswordSchema = Joi.object({
    password: Joi.string().required(),
    token: Joi.string().required(),
  });

  export const loginWithGoogleOAuthSchema = Joi.object({
    code: Joi.string().required(),
  });