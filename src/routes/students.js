import { Router } from "express";
import { 
    getAllStudentsController,
    getStudentByIdController,
    createStudentController,
    deleteStudentController,
    upsertStudentController,
    patchStudentController
} from "../controllers/students.js";

import { validateBody } from "../middlewares/validateBody.js";
import { createStudentSchema, updateStudentSchema } from "../validation/students.js";
import { isValidId } from "../middlewares/isValidId.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { authenticate } from "../middlewares/authenticate.js";
import { checkRoles } from "../middlewares/checkRoles.js";
import { ROLES } from "../constants/index.js";
import { upload } from '../middlewares/multer.js';

const router = Router();

router.use(authenticate);

router.get(
    '/', 
    checkRoles(ROLES.TEACHER),
    ctrlWrapper(getAllStudentsController));

router.get(
    '/:studentId', 
    checkRoles(ROLES.TEACHER, ROLES.PARENT), 
    isValidId,
    ctrlWrapper(getStudentByIdController));

router.post(
    '/', 
    checkRoles(ROLES.TEACHER), 
    upload.single('photo'),
    validateBody(createStudentSchema), 
    ctrlWrapper(createStudentController));

router.delete(
    '/:studentId', 
    checkRoles(ROLES.TEACHER), 
    isValidId, 
    ctrlWrapper(deleteStudentController));

router.put(
    '/:studentId', 
    checkRoles(ROLES.TEACHER),
    upload.single('photo'),
    isValidId, 
    validateBody(updateStudentSchema), 
    ctrlWrapper(upsertStudentController));

router.patch(
    '/:studentId', 
    checkRoles(ROLES.TEACHER),
    upload.single('photo'),
    isValidId, 
    validateBody(updateStudentSchema), 
    ctrlWrapper(patchStudentController))

export default router