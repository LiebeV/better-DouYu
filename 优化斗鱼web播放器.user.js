// ==UserScript==
// @name         优化斗鱼web播放器
// @namespace    https://www.liebev.site
// @version      1.6
// @description  douyu优化斗鱼web播放器，通过关闭直播间全屏时的背景虚化效果来解决闪屏的问题，屏蔽独立直播间的弹幕显示，移除文字水印
// @author       LiebeV
// @license      MIT: Copyright (c) 2023 LiebeV
// @match        https://www.douyu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

"use strict";

//更新日志，v1.6，修改了全屏快捷键 "F" >>> "ALT + U"（避免触发浏览器级快捷键）； 添加了快捷键"ALF + W", 用于切换宽屏模式； 添加了屏蔽鱼吧热议飘屏的功能（默认永久开启）
//**NOTE**:之于页面上其他不想要看到的东西，请搭配其他例如AdBlock之类的专业广告屏蔽器使用，本脚本不提供长久的css更新维护
//已知问题，无
//更新计划，无（请关注主页新项目--“全等级弹幕屏蔽”，“优化斗鱼web鱼吧”）

let roomIds = GM_getValue("roomIds", []);
const userRoomIds = roomIds;
let isFull = 0;
let isWide = 0;

// 屏蔽虚化背景以及文字水印的css
async function blur() {
    console.log("已经创建blur样式表");
    return `._1Osm4fzGmcuRK9M8IVy3u6,.watermark-442a18,.is-ybHotDebate{visibility: hidden !important;}`;
}

// 屏蔽右侧弹幕区及飘屏弹幕区的css
// 保留礼物展示
async function danmu() {
    const url = window.location.href;

    if (userRoomIds.some((roomId) => url.includes(roomId))) {
        console.log("已经创建danmu样式表");
        return `.Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: hidden !important;}`;
    } else {
        console.log("无需更新danmu样式表");
        return `.Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: unset !important;}`;
    }
}

async function addStyle(css) {
    const liebev = document.getElementById("LiebeV");
    // console.log(liebev);
    if (liebev) {
        liebev.innerHTML = css;
        console.log("原css已更新");
    } else {
        const style = document.createElement("style");
        style.id = "LiebeV";
        style.type = "text/css";

        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
        console.log("新css已插入");
    }
}

async function showSettings() {
    let message = "当前设置的房间号列表：\n";
    const idList = GM_getValue("roomIds", []);
    for (let i = 0; i < idList.length; i++) {
        message += `${i + 1}. ${idList[i]}\n`;
    }
    const roomIdInput = prompt(`${message}\n请输入要移除（恢复）弹幕的房间号房间号：`);
    if (roomIdInput) {
        updateRoomId(roomIdInput);
    }
}

GM_registerMenuCommand("房间号设置", showSettings);

// 接受用户输入，进入判断分支
async function updateRoomId(roomId) {
    if (!roomIds.includes(roomId)) {
        roomIds.push(roomId);
        console.log(`已添加房间号 ${roomId}`);
        GM_setValue("roomIds", roomIds);
        await DMbye();
    } else {
        const index = roomIds.indexOf(roomId);
        if (index !== -1) {
            roomIds.splice(index, 1);
            console.log(`已移除房间号 ${roomId}`);
            GM_setValue("roomIds", roomIds);
            await DMback();
        } else {
            console.log(`输入不合法`);
        }
    }
}

async function DMbye() {
    const css = `._1Osm4fzGmcuRK9M8IVy3u6,.watermark-442a18,.is-ybHotDebate{visibility: hidden !important;}.Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: hidden !important;}`;
    addStyle(css);
}

async function DMback() {
    const css = `._1Osm4fzGmcuRK9M8IVy3u6,.watermark-442a18,.is-ybHotDebate{visibility: hidden !important;}.Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: unset !important;}`;
    addStyle(css);
}

async function listener() {
    // console.log("快捷键监听设置完毕");
    document.addEventListener("keydown", function (event) {
        if (event.altKey && event.key.toLocaleLowerCase() === "l") {
            // console.log("快捷键触发");
            rewrite();
        }
    });
    document.addEventListener("keydown", function (event) {
        if (event.altKey && event.key.toLocaleLowerCase() === "u") {
            // console.log("快捷键触发");
            full();
        }
    });
        document.addEventListener("keydown", function (event) {
        if (event.altKey && event.key.toLocaleLowerCase() === "w") {
            // console.log("快捷键触发");
            wide();
        }
    });
}

async function rewrite() {
    const liebev = document.getElementById("LiebeV");
    const checker = liebev.innerHTML;
    var css;
    if (
        checker.indexOf(
            ".Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: unset !important;}"
        ) !== -1
    ) {
        css = checker.replace(
            ".Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: unset !important;}",
            ".Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: hidden !important;}"
        );
    } else {
        css = checker.replace(
            ".Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: hidden !important;}",
            ".Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: unset !important;}"
        );
    }
    // console.log(css);
    addStyle(css);
}

async function full() {
    if (isFull == 0) {
        document.querySelector(".fs-781153").click();
        isFull = 1;
    } else if (isFull == 1) {
        document.querySelector(".fs-exit-b6e6a7").click();
        isFull = 0;
    }
}

async function wide() {
    if (isWide == 0) {
        document.querySelector(".wfs-2a8e83").click();
        isWide = 1;
    } else if (isWide == 1) {
        document.querySelector(".wfs-exit-180268").click();
        isWide = 0;
    }
}

(async function () {
    const blurcss = await blur();
    const danmucss = await danmu();
    const css = blurcss + danmucss;
    console.log("样式表已合并" + css);
    addStyle(css);
    listener();
})();
