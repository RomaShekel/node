// src/services/auth.js

import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersCollection } from '../db/models/users.js';
import createHttpError from 'http-errors';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';
import { SessionsCollection } from '../db/models/session.js';
import { SMTP } from '../constants/index.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendMail.js';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { TEMPLATES_DIR } from '../constants/index.js';
import { getFullNameFromGoogleTokenPayload, validateCode } from '../utils/googleOAuth2.js';


const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};


export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use');
  
  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async (payload) => {
    const user = await UsersCollection.findOne({email: payload.email});

    if(!user) {
        throw createHttpError(404, 'User not found!')
    }

    const isEqual = await bcrypt.compare(payload.password, user.password);

    if (!isEqual) {
        throw createHttpError(401, 'Unauthorized');
    }

    await SessionsCollection.deleteOne({userId: user._id});

    const newSession = createSession()

    return await SessionsCollection.create({
      userId: user._id,
      ...newSession,
    });
};

export const logout = async (sessionId) => {
  await SessionsCollection.findByIdAndDelete(sessionId)
}

export const refreshUsersSession = async (sessionId, refreshToken) => {
  const session = await SessionsCollection.findOne({
    _id:sessionId,
    refreshToken:refreshToken,
  });

  if(!session){
    throw createHttpError(401, 'Not found a session2')
  };

  const isSessionTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);

  if(isSessionTokenExpired) {
    throw createHttpError(401, 'Session token has expired');
  }

  const newSession = createSession();
  
  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken:refreshToken });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
 
  const JWT_SECRET = process.env.JWT_SECRET;

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    JWT_SECRET, 
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  )

  const templateSource = (await fs.readFile(resetPasswordTemplatePath)).toString();
  const template = handlebars.compile(templateSource);
  const html =  template({
    name: user.name,
    link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: env(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  })
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, env('JWT_SECRET'));
  } catch (err) {
    if(err instanceof Error) throw createHttpError(401, err.message);
    throw err
  }

  const user = await UsersCollection.findOne({
    email:entries.email,
    _id:entries.sub,
  })

  if (!user) throw createHttpError(404, 'User not found');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UsersCollection.findOneAndUpdate(
    {email:user.email},
    {password:encryptedPassword}
  )
}

export const loginOrSignupWithGoogle = async (code) => {
  const loginTicket = await validateCode(code);
  const payload = loginTicket.getPayload();
  if(!payload) createHttpError(401);

  let user = await UsersCollection.findOne({email:payload.email});
  if(!user) {
    const password = await bcrypt.hash(randomBytes(10), 10);
    user = await UsersCollection.create({
      email:payload.email,
      password: password,
      name:getFullNameFromGoogleTokenPayload(payload),
      password,
      role: 'parent',
    });
  };

  const session = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...session,
  });
}