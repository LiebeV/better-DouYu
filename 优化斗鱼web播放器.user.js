// ==UserScript==
// @name         优化斗鱼web播放器
// @namespace    https://www.liebev.site
// @version      1.8.1
// @description  douyu优化斗鱼web播放器，通过关闭直播间全屏时的背景虚化效果以及定时清除弹幕DOM来解决闪屏卡顿的问题，屏蔽独立直播间的弹幕显示，移除文字水印，添加了一些快捷键
// @author       LiebeV
// @license      MIT: Copyright (c) 2023 LiebeV
// @match        https://www.douyu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

"use strict";

//更新日志，v1.8.1， 现在可以通过插件设置面板（在房间号设置旁边）开启/关闭自动清空弹幕的功能（默认关闭）
//**NOTE**:之于页面上其他不想要看到的东西，请搭配其他例如AdBlock之类的专业广告屏蔽器使用，本脚本不提供长久的css更新维护
//已知问题，无
//更新计划，为清除右侧弹幕的功能添加相关自定义功能（请关注主页新项目--“全等级弹幕屏蔽”，“优化斗鱼web鱼吧”）

// 定义一些let变量
let roomIds = GM_getValue("roomIds", []);
const userRoomIds = roomIds;
let isFull = 0;
let isWide = 0;
var IntervalId;
let IntervalRun = false;

// 屏蔽虚化背景以及文字水印的css
async function blur() {
    console.log("已经创建blur样式表");
    return `._1Osm4fzGmcuRK9M8IVy3u6,.watermark-442a18,.is-ybHotDebate,.view-67255d.zoomIn-0f4645{visibility: hidden !important;}`;
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

// 用于合并其他本人制作的脚本中生成的css
async function addStyle(css) {
    const liebev = document.getElementById("LiebeV");
    // console.log(liebev);
    if (liebev) {
        liebev.innerHTML = css;
        console.log("原css已更新");
    } else {
        // 此脚本单独运作时创建liebev标签
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

// DMbye和back是setting修改时调用的函数
async function DMbye() {
    const css = `._1Osm4fzGmcuRK9M8IVy3u6,.watermark-442a18,.is-ybHotDebate.view-67255d.zoomIn-0f4645{visibility: hidden !important;}.Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: hidden !important;}`;
    addStyle(css);
}

async function DMback() {
    const css = `._1Osm4fzGmcuRK9M8IVy3u6,.watermark-442a18,.is-ybHotDebate.view-67255d.zoomIn-0f4645{visibility: hidden !important;}.Barrage-main,.Barrage-topFloater,.comment-37342a {visibility: unset !important;}`;
    addStyle(css);
}

async function listener() {
    // console.log("快捷键监听设置完毕");
    document.addEventListener("keydown", function (event) {
        if (event.altKey && event.key.toLocaleLowerCase() === "l") {
            // console.log("L快捷键触发");
            rewrite();
        }
    });
    document.addEventListener("keydown", function (event) {
        if (event.altKey && event.key.toLocaleLowerCase() === "u") {
            // console.log("U快捷键触发");
            full();
        }
    });
    document.addEventListener("keydown", function (event) {
        if (event.altKey && event.key.toLocaleLowerCase() === "w") {
            // console.log("W快捷键触发");
            wide();
        }
    });
    document.addEventListener("keydown", function (event) {
        if (event.altKey && event.key >= "1" && event.key <= "5") {
            // console.log("RES快捷键触发");
            res(parseInt(event.key));
        }
    });
}

// 类似DMbye和back，但是由快捷键触发
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

// 点击原播放器控件来切换全屏
// 因为控件会变化，所以可以不通过0/1判断
// 因为在点击原播放器控件，所以需要等待其加载
async function full() {
    if (isFull == 0) {
        document.querySelector(".fs-781153").click();
        isFull = 1;
    } else if (isFull == 1) {
        document.querySelector(".fs-exit-b6e6a7").click();
        isFull = 0;
    }
}

// 点击原播放器控件来切换宽屏
// 因为控件会变化，所以可以不通过0/1判断
async function wide() {
    if (isWide == 0) {
        document.querySelector(".wfs-2a8e83").click();
        isWide = 1;
    } else if (isWide == 1) {
        document.querySelector(".wfs-exit-180268").click();
        isWide = 0;
    }
}

// 点击原播放器控件来调整清晰度
// 最多只见过5个选项。原画/8M/4M/超清/高清。溢出也不会影响
// 因为清晰度控件display为none，所以可以直接点击
// 但线路选项是js插入的，无法静态点击
async function res(numberkey) {
    const resinput = document.querySelector(".tipItem-898596 input[value='画质 ']");
    const resul = resinput.nextSibling;
    let reslist = [];
    resul.childNodes.forEach(function (li) {
        reslist.push(li);
    });
    // console.log(reslist);
    const choice = numberkey - 1;
    reslist[choice].click();
}

// 点击原弹幕区控件来清除DOM节点（网页默认DOM上限为200）
async function rightdomremove() {
    var clearbtn = document.querySelector(".Barrage-toolbarClear");
    clearbtn.click();
    console.log("doms been removed");
}

async function ifintervalrun() {
    if (IntervalRun == true) {
        // 定时触发清屏（60s）
        IntervalId = setInterval(rightdomremove, 60 * 1000);
        IntervalRun = false;
        console.log("已设置定时清屏");
    } else {
        clearInterval(IntervalId);
        IntervalRun = true;
        console.log("已关闭定时清屏");
    }
}

GM_registerMenuCommand("定时清屏右侧弹幕", function () {
    const isConfirm = confirm(
        // 因为初始化调用时更改了IntervalRun的值，所以表达式逻辑相反
        `当前定时器状态：${IntervalRun ? "禁用" : "启用"}\n是否切换定时器状态？`
    );
    if (isConfirm) {
        ifintervalrun();
    }
});

(async function () {
    const blurcss = await blur();
    const danmucss = await danmu();
    const css = blurcss + danmucss;
    console.log("样式表已合并" + css);
    addStyle(css);
    // 添加全部eventlistener
    listener();
    ifintervalrun();
})();
