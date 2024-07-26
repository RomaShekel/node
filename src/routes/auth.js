
import { 
    getGoogleOAuthUrlController, 
    registerUserController, 
    resetPasswordController,
    loginOrSignupWithGoogleController
 } from "../controllers/auth.js";
import { Router } from "express";
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema, resetPasswordSchema } from "../validation/auth.js";
import { loginUserController } from "../controllers/auth.js";
import { loginUserSchema } from "../validation/auth.js";
import { logoutUserController } from "../controllers/auth.js";
import { refreshUsersSessionController } from "../controllers/auth.js";
import { 
    requestResetEmailSchema,
    loginWithGoogleOAuthSchema,
} from "../validation/auth.js";
import { requestResetTokenController } from "../controllers/auth.js";

const router = Router();

router.post(
    '/register', 
    validateBody(registerUserSchema), 
    ctrlWrapper(registerUserController));

router.post(
    '/login', 
    validateBody(loginUserSchema), 
    ctrlWrapper(loginUserController));

router.post(
    '/logout', 
    ctrlWrapper(logoutUserController));

router.post(
    '/refresh', 
    ctrlWrapper(refreshUsersSessionController));

router.post(
    '/request-reset-email',
    validateBody(requestResetEmailSchema),
    ctrlWrapper(requestResetTokenController));

router.post(
    '/reset-password',
    validateBody(resetPasswordSchema), 
    ctrlWrapper(resetPasswordController));

router.post(
    '/get-oauth-url', 
    ctrlWrapper(getGoogleOAuthUrlController));

router.post(
    '/confirm-oauth', 
    validateBody(loginWithGoogleOAuthSchema),
    ctrlWrapper(loginOrSignupWithGoogleController));

export default router;