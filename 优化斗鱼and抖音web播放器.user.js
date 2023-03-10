// ==UserScript==
// @name         优化斗鱼/抖音web播放器
// @namespace    https://www.liebev.site
// @version      0.3.1
// @description  通过关闭直播间全屏时的背景虚化效果来解决闪屏的问题
// @author       LiebeV
// @match        https://www.douyu.com/*
// @match        https://live.douyin.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const css = `
    ._1Osm4fzGmcuRK9M8IVy3u6 {
      visibility: hidden !important;
    }
    .watermark-442a18 {
      display: none !important;
    }
    .xgplayer-dynamic-bg {
      visibility: hidden !important;
    }
    `;

    const style = document.createElement('style');
    style.id = 'LiebeV';
    style.type = 'text/css';

    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
})();
// 关闭角落处文字水印，图片水印来自后台推流端，无法通过css定位
