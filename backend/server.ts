import express, { type Request, type Response } from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDb from './config/db.js';
import session from 'express-session'
import MongoStore from 'connect-mongo';
import AuthRouter from './routes/AuthRoutes.js';

declare module 'express-session' {
    interface SessionData{
        isLoggedIn:boolean;
        userId:string;
    }
}

const app = express();

app.use(cors({
    origin:['http://localhost:5173', 'http://localhost:3000'],
    credentials:true
}))
app.use(session({
    secret:process.env.SESSION_SECRET as string,
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:1000*60*60*24*7},
    store:MongoStore.create({
        mongoUrl:process.env.MONGODB_URI as string,
        collectionName:'sessions'
    })
}))
app.use(express.json());


app.use('/api/auth',AuthRouter)

const port = process.env.PORT || 3000;

app.get('/',(req:Request,res:Response)=>{
    res.send('server is live')
})

connectDb().then(()=>{
    app.listen(port,()=>{
        console.log(`server is running at http://localhost:${port}`)
    })
})