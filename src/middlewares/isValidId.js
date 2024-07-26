// src/middlewares/isValidId.js 

import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';

export const isValidId = (req, res, next) => {
  const { studentId } = req.params;
  if (!isValidObjectId(studentId)) {
    next(createHttpError(404, 'Not found'))
  }
  next()
};
