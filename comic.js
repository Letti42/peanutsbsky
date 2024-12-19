import fs from 'fs';
import fetch from 'cross-fetch';
import request from 'request';
import {Jimp} from "jimp";
import { getAllUsedDates } from './posts.js';

const host = "https://gocomics.com/peanuts/";
const leapYears = [1960, 1964, 1968, 1972, 1976, 1980, 1984, 1988, 1992, 1996];
var retries = 0;

function getCurrentDate() {
    var date = new Date();
    return new Date(date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
}


//main
export async function getComic() {
    if (retries > 3) throw new Error("enough retries damn");

    let date = getCurrentDate();
    let day = date.getDate(), month = date.getMonth() + 1, currentYear = date.getFullYear();

    let parsedMonth = `${"0".repeat(2 - month.toString().length)}${month}`;
    let parsedDay = `${"0".repeat(2 - day.toString().length)}${day}`;
    let year = await getValidYear(parsedDay, parsedMonth);

    let fullDate = `${year}/${parsedMonth}/${parsedDay}`;

    let bytes = await getImage(fullDate);
    if (bytes.length < 1000) fs.writeFileSync("error.txt", bytes), new Error("error with comic! error log saved");

    fs.writeFileSync('today.jpg', bytes);
    let size = await getImageSize();
    bytes = await convertToJpg();


    let response = {
        bytes: bytes,
        date: fullDate,
        currentYear: currentYear,
        yearReleased: year,
        dimensions:size
    };

    return response;
}



async function getImage(fullDate) {
    return new Promise(async(r) => {
        let content = await fetch(host + fullDate);
        if (content.status != 200) return getComic(), retries++, r(Buffer.alloc(0)); //return empty buffer to retry getcomic
        let text = await content.text();
        let url;

        try {
            url = "https://assets.amuniversal.com/" + text.split("https://assets.amuniversal.com/")[1].split('"')[0];
            //let comicPath = `./comics/${fullDate.replace(/[\/]/g, "-")}.png`;
            request(url, {encoding: null}, (e, response, body) => {
                if(e)throw new Error("request error: \n\n"+e);
                r(body);
            });
        } catch (e) {
            throw new Error("couldn't get image @ " + fullDate + "\n\n" + e);
        }

    });
}

async function getValidYear(day, month) {
    let usedComics = await getAllUsedDates();
    let count = 0;

    var randYear = Math.floor(Math.random() * 40 + 1960);
    if (day == "29" && month == "02") randYear = leapYears[Math.floor(Math.random() * leapYears.length)];


    while (usedComics.indexOf(`${randYear}/${month}/${day}`) != -1 && count < 50) {
        randYear = Math.floor(Math.random() * 40 + 1960);
        if (day == "29" && month == "02") randYear = leapYears[Math.floor(Math.random() * leapYears.length)];
        count++;
    }

    if (count >= 50) throw new Error("couldn't find a valid year for this date!");

    return randYear;
}

async function getImageSize(){
    let img = await Jimp.read("today.jpg");
    return [img.width, img.height];
}

async function convertToJpg(){
    let img = await Jimp.read("today.jpg");
    await img.write("today_jpg_real.jpg");
    return fs.readFileSync("today_jpg_real.jpg");
}
