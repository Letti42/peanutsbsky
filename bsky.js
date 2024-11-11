import { AtpAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import fetch from 'cross-fetch';
dotenv.config();


const agent = new AtpAgent({
    service: 'https://bsky.social',
});

export async function login(){
    await agent.login({
        identifier: process.env.BLUESKY_USERNAME,
        password: process.env.BLUESKY_PASSWORD //no peeking
    });

    return agent;
}

export async function createPost(postData){
    await agent.post(postData);
}

export async function uploadImage(bytes){
    let response = await fetch("https://bsky.social/xrpc/com.atproto.repo.uploadBlob", {
        headers:{
            "Content-Type":"image/jpeg",
            "Authorization":"Bearer "+agent.session.accessJwt
        },
        method:"POST",
        body:bytes
    });

    if(response.status != 200)throw new Error("Upload Blob failed @");

    let json = await response.json();
    return json;
}
