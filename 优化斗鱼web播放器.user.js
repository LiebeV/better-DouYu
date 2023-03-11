// ==UserScript==
// @name         优化斗鱼web播放器_test
// @namespace    https://www.liebev.site
// @version      1.0
// @description  通过关闭直播间全屏时的背景虚化效果来解决闪屏的问题
// @author       LiebeV
// @match        https://www.douyu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

'use strict';

let roomIds = [];
const userRoomIds = GM_getValue('roomIds', '[]');

async function blur() {
    console.log('已经创建blur样式表');
    return `
    ._1Osm4fzGmcuRK9M8IVy3u6,
    .watermark-442a18{
      visibility: hidden !important;
    }
    `;
}

async function danmu() {
    const url = window.location.href;

    if (userRoomIds.some(roomId => url.includes(roomId))) {
        console.log('已经创建danmu样式表');
        return `
        .Barrage-main,
        .comment-37342a {
          visibility: hidden !important;
        }
        `;
    } else {
        console.log('无需创建danmu样式表');
        return '';
    }
}

async function addRoomId(roomId) {
    if (!roomIds.includes(roomId)) {
        roomIds.push(roomId);
        console.log(`已添加房间号 ${roomId}`);
        GM_setValue('roomIds', roomIds);
    } else {
        console.log(`房间号 ${roomId} 已存在`);
    }
}

async function showSettings() {
    let message = "当前设置的房间号列表：\n";
    for (let i = 0; i < roomIds.length; i++) {
        message += `${i + 1}. ${roomIds[i]}\n`;
    }
    
    const roomIdInput = prompt(`${message}\n请输入要清除弹幕的房间号：`);
    if (roomIdInput) {
        addRoomId(roomIdInput);
    }
}

GM_registerMenuCommand('房间号设置', showSettings);

async function addStyle(css) {
    const style = document.createElement('style');
    style.id = 'LiebeV';
    style.type = 'text/css';

    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    console.log('css已插入');
}

(async function () {
    const blurcss = await blur();
    const danmucss = await danmu();
    const css = blurcss + danmucss;
    console.log('样式表已合并' + css);
    addStyle(css);
})();

//已知问题：setValue存储的数组初始化异常
