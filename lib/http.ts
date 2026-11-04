import {NextResponse} from 'next/server';
export const json=(data:any,status=200)=>NextResponse.json(data,{status});
export const fail=(e:any)=>json({error:e?.message||'Unexpected server error'},500);
