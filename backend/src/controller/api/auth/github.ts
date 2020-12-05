import Koa from 'koa';
import env from 'dotenv';
import qs from 'qs';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../../config';

env.config();

const getOAuthUrl = (ctx: Koa.Context) => {
  ctx.body = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URL}&scope=user:email`;
};

const getAccessTokenFromGitHub = async (code: string) => {
  const host = 'https://github.com/login/oauth/access_token?';
  return axios.post(
    host,
    {
      code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
    },
    {
      headers: {
        accept: 'application/json',
      },
    },
  );
};

const getUserProfile = (accessToken: string) => axios.get('https://api.github.com/user', {
  headers: {
    Authorization: `token ${accessToken}`,
  },
});

const getToken = async (ctx: Koa.Context) => {
  try {
    const { code } = ctx.request.query;
    const {
      data: { access_token: accessToken },
    } = await getAccessTokenFromGitHub(code);

    const { data: profile } = await getUserProfile(accessToken);
    const { id, login } = profile;
    const token = jwt.sign(id, jwtConfig.jwtSecret);
    ctx.body = { id, token };
  } catch (err) {
    console.log(err);
  }
};

const getUsername = async (ctx: Koa.Context) => {
  const config = {
    headers: {
      Authorization: `${ctx.request.header.authorization}`,
      'User-Agent': 'Login-App',
    },
  };
  try {
    const resp = await axios.get(
      'https://api.github.com/user/public_emails',
      config,
    );
    ctx.body = resp.data[0].email;
  } catch (err) {
    console.log(err);
  }
};

export default { getOAuthUrl, getToken, getUsername };
