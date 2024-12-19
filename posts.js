import { login } from "./bsky.js";
import * as dotenv from 'dotenv';
dotenv.config();

async function getAllPosts() {
    const agent = await login();
    let did = (await agent.resolveHandle({ handle: process.env.BLUESKY_USERNAME })).data.did;

    let cursor = (new Date()).toISOString();
    var posts = Array();
    
    while(cursor){
        let p = await agent.getAuthorFeed({
            actor: did,
            limit: 100,
            filter: "posts_with_media",
            includePins: false,
            cursor: cursor
        });
        
        posts = posts.concat(p.data.feed);
        cursor = p.data?.cursor;
    }

    return posts;
}

export async function getAllUsedDates(){
    let posts = await getAllPosts();

    var usedDates = Array();

    posts.forEach(p=>{
        let alt_text = p.post.embed.images[0].alt.split(" ");
        let date = alt_text[alt_text.length - 1].split("/");
        date = [date[2]].concat(date.splice(0,2)).join("/");

        usedDates.push(date);
    });

    return usedDates;
}

