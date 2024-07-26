
import { ONE_DAY } from "../constants/index.js";
import { 
    registerUser,
    loginUser,
    logout,
    refreshUsersSession,
    requestResetToken,
    resetPassword,
    loginOrSignupWithGoogle,
} from "../services/auth.js";
import { generateAuthUrl } from '../utils/googleOAuth2.js';

const setupSession = (res, session) => {
    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + ONE_DAY),
    });

    res.cookie('sessionId', session._id.toString(), {
        httpOnly: true,
        expire: new Date(Date.now() + ONE_DAY),
    });
}

export const registerUserController = async (req, res) => {
    const user = await registerUser(req.body);

    res.json({
        status:201,
        message: 'Successfully registered a user!',
        data: user,
    })
}

export const loginUserController = async (req, res) => {
    const session = await loginUser(req.body);

    setupSession(res, session);

    res.json({
        status: 200,
        message: 'Successfully logged in an user!',
        data: { accessToken: session.accessToken, },
    });
};

export const logoutUserController = async (req, res) => {
    if(req.cookies.sessionId){
        await logout(req.cookies.sessionId)
    }

    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');
    res.status(204).send();
}

export const refreshUsersSessionController = async (req, res) => {
    const sessionId = req.cookies.sessionId;
    const refreshToken = req.cookies.refreshToken

    const session = await refreshUsersSession(sessionId, refreshToken);

    setupSession(res, session);

    res.json({
        status: 200,
        message: 'Successfully refreshed a session!',
        data: {
          accessToken: session.accessToken,
        },
      });
};

export const requestResetTokenController = async (req, res) => {
    await requestResetToken(req.body.email);

    res.json({
        message: 'Reset password email was successfully sent!',
        status: 200,
        data: {},
      });
}

export const resetPasswordController = async (req, res) => {
    await resetPassword(req.body);
    
    res.json({
        status:200,
        message:'Password was successfully reset!',
        data:{},
    })
}

export const getGoogleOAuthUrlController = async (req, res) => {
    const url = generateAuthUrl();
    res.json({
        status: 200,
        message: 'Successfully get Google OAuth url!',
        data: {
          url,
        },
    })
}

export const loginOrSignupWithGoogleController = async (req, res) => {
    const session = await loginOrSignupWithGoogle(req.body.code);
    setupSession(res, session)

    res.json({
        status: 200,
        message: 'Successfully logged in via Google OAuth!',
        data: {
          accessToken: session.accessToken,
        },
      });
}