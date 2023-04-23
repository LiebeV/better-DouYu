// ==UserScript==
// @name         优化斗鱼web鱼吧
// @namespace    https://www.liebev.site
// @version      0.1
// @description  douyu，优化斗鱼web鱼吧，自动展开所有overflow内容，不给小黑子贡献阅读量
// @author       LiebeV
// @match        https://yuba.douyu.com/group/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @grant        none
// ==/UserScript==

'use strict';

async function yuba() {
    console.log("已经创建yuba样式表");
    return `.index-listDesc-02cUw,.index-listTitle-+WMpi{height:auto!important;white-space:normal!important;}`;
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

(async function() {
    const css = await yuba();
    addStyle(css);
})();