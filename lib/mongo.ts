import { MongoClient } from 'mongodb';
const uri=process.env.MONGODB_URI||'mongodb://127.0.0.1:27017';
let client:MongoClient; let clientPromise:Promise<MongoClient>;
if(!globalThis.__mongoPromise){client=new MongoClient(uri);globalThis.__mongoPromise=client.connect();}
clientPromise=globalThis.__mongoPromise;
declare global { var __mongoPromise: Promise<MongoClient>|undefined }
export async function activityLog(event:string,details:Record<string,any>={}){try{const c=await clientPromise;await c.db(process.env.MONGODB_DATABASE||'restaurant_activity').collection('activity_logs').insertOne({event,details,createdAt:new Date()});}catch(e){console.error('MongoDB activity log unavailable:',e)}}
export async function getMongo(){const c=await clientPromise;return c.db(process.env.MONGODB_DATABASE||'restaurant_activity')}
