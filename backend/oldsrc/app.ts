import mongoose from 'mongoose';
import Koa from '../oldsrc/koa';
import Router from '../oldsrc/koa-router';
import bodyParser from '../oldsrc/koa-bodyparser';
import allRouter from '../oldsrc/router/index';
import cors from '../oldsrc/@koa/cors';
import dotenv from '../oldsrc/dotenv';

dotenv.config();

const corsOptions = {
  origin: (ctx: Koa.Context) => ctx.request.header.origin,
  credentials: true,
};

const app = new Koa();
app.use(cors(corsOptions));
app.use(bodyParser());
const router = new Router();

mongoose.Promise = global.Promise;
mongoose
  .connect(`${process.env.MONGO_URI!}/${process.env.MONGO_DBNAME}`, {
    useNewUrlParser: true,
  })
  .then((res) => {
    console.log('success connected to mongo');
  })
  .catch((err) => {
    console.log(err);
  });

router.use(allRouter.routes());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err;
  }
});
app.use(router.routes()).use(router.allowedMethods());
app.use(async (ctx: Koa.Context) => {
  ctx.body = "<Button onclick=(function() {alert('하이')})>하이</Button>";
});

app.listen(3000);
