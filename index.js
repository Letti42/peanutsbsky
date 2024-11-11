import { getComic } from "./comic.js";
import { login, uploadImage, createPost } from "./bsky.js";
import fs from 'fs';

const agent = await login();
let data = await getComic();
let embed = await uploadImage(data.bytes);
let post = constructPost(data, embed);

if(post)
    createPost(post);









function constructPost(data, embed){
    if(!embed)throw new Error("embed undefined @ constructPost");

    let date = reformatFullDate(data.date);
    let text = getRandomTextTemplate();

    text = text.replace("{date}", date).replace("{years}", data.currentYear - data.yearReleased);
    text += getRandomEmojis();

    let post = {
        "$type": "app.bsky.feed.post",
        "text": text,
        "createdAt": new Date().toISOString(),
        
        "embed":{
            "$type": "app.bsky.embed.images",
            "images":[
                {
                    "alt":"Peanuts comic from "+data.date,
                    "image":embed.blob
                }
            ]
        }

    }

    return post;
}


function getRandomTextTemplate(){
    var texts = fs.readFileSync("text_templates", "utf-8").split("\r").join("").split('\n'); //fck yall idk regex!!
    let randText = texts[Math.floor(Math.random() * texts.length)];

    return randText;
}

function getRandomEmojis(){
    var emojis = fs.readFileSync("emojis", "utf-8").split("\r").join("").split('\n'); //no regex merchant
    var emojiText = String();

    for(let i = 0; i < 2; i++){
        let index = Math.floor(Math.random() * emojis.length);
        emojiText += emojis[index] + " ";
        emojis.splice(index, 1);
    }
    return emojiText;
}

function reformatFullDate(d){
    let date = d.split('/');
    date.push(date[0]);
    date.splice(0, 1);
    return date.join("/");
}