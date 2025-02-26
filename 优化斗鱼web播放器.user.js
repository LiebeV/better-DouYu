// ==UserScript==
// @name         优化斗鱼web播放器
// @namespace    https://www.liebev.site/monkey/better-douyu
// @version      2.3.1
// @description  douyu优化斗鱼web播放器(douyu.com)，通过关闭直播间全屏时的背景虚化效果来解决闪屏卡顿的问题，屏蔽独立直播间的弹幕显示，移除文字水印，添加了一些快捷键。暴力隐藏页面元素，获得纯净观看体验
// @author       LiebeV
// @license      MIT: Copyright (c) 2023-2025 LiebeV
// @match        https://www.douyu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @downloadURL https://update.greasyfork.org/scripts/461630/%E4%BC%98%E5%8C%96%E6%96%97%E9%B1%BCweb%E6%92%AD%E6%94%BE%E5%99%A8.user.js
// @updateURL https://update.greasyfork.org/scripts/461630/%E4%BC%98%E5%8C%96%E6%96%97%E9%B1%BCweb%E6%92%AD%E6%94%BE%E5%99%A8.meta.js
// ==/UserScript==

"use strict";

//更新日志，v2.3.1，提高了弹幕屏蔽css优先级
//**NOTE**:之于页面上其他不想要看到的东西，请搭配其他例如AdBlock之类的专业广告屏蔽器使用，本脚本仅提供暴力隐藏的功能
//**NOTE**:暴力隐藏无法撤销，请刷新网页以恢复
//已知问题，暴力重写导致的各种问题
//更新计划，无

// ********************一些有的没的的变量*************************
const roomIds = GM_getValue("roomIds", []);
const userRoomIds = roomIds;
const listenerMap = new Map([
    ["l", () => Danmu_control.rewrite_danmu_css()],
    ["u", () => Player_control.switch_full_mode()],
    ["w", () => Player_control.switch_wide_mode()],
    ["k", () => Force_hide.force_clean_hide()],
    ["m", () => Better_multi.better_multi_mode()],
]);
const target_xpath = "/html/body/section/main/div[4]/div[1]/div[4]";

const TBN = "疑似金色悬停骑士团开播提醒：div.broadcastDiv-af5699/疑似周活跃榜提醒：div.DanmuEffectDom-container#douyu_room_normal_player_danmuDom></div>";
// <div class="ani-broadcast ConfigBroadcast" style="top: 0%; animation: 10000ms linear 0ms 1 normal forwards running dy-ani3;"><img class="ConfigBroadcast-constructor ConfigBroadcast-header" src="https://sta-op.douyucdn.cn/dygev/2024/02/26/1722bef6da6ee637efff9f6878eb25b6.png">
//                <div class="ConfigBroadcast-midCont ConfigBroadcast-constructor ConfigBroadcast-middle" style="color:#FFFFFF;background:url(https://sta-op.douyucdn.cn/dygev/2024/02/26/392595fc4b8f81f3dec13b313a4b6df2.png) left center;background-repeat:repeat-x;background-size:auto 100%;"><span style="color:#e1f7fe;">本房勇士团完成勇士团补给任务，获得</span><span style="color:#ffbe78;">1.2万流量卡（1天）X1</span><span style="color:#e1f7fe;">，额外</span><span style="color:#ffbe78;">4500</span><span style="color:#e1f7fe;">点战力点</span></div>
//                <img class="ConfigBroadcast-constructor ConfigBroadcast-footer" src="https://sta-op.douyucdn.cn/dygev/2024/02/26/2e30de374b9689d7834be8b1c2336841.png"></div>
// <div class="broadcastDiv-af5699" style="visibility: visible;"><div></div><div><div style="white-space: nowrap; cursor: pointer; pointer-events: auto; top: 104px; position: absolute; left: 3822px; transition: transform 7.5s linear 0s; transform: translateX(-4574px);"><img src="https://sta-op.douyucdn.cn/dygev/2023/05/06/6ea4e1741606a07b64c1c7f7c1190f51.png" style="position: absolute; width: 524px; height: 47px; left: 153px; top: 58px; pointer-events: auto;"><img src="https://sta-op.douyucdn.cn/dygev/2023/05/06/eaf16e082d3368d8f376d92294aaf281.png" style="position: absolute; pointer-events: auto;"><img src="https://sta-op.douyucdn.cn/dygev/2023/05/06/e9a35c04e66f934d2072a4e795628750.png" style="position: absolute; left: 677px; top: 40px; pointer-events: auto;"><span style="white-space: nowrap; font: 17px &quot;Arial Black&quot;; width: 494px; position: absolute; top: 69.5px; left: 183px; pointer-events: none;"><font color="#ffffff">最强勇士团礼物冠名主播</font><font color="#ffd967">过载十五岁的涛妹</font><font color="#ffffff">开播了！点击围观吧！</font></span><img src="https://apic.douyucdn.cn/upload/avatar_v3/202310/f19c12c917634989a4f61574230423d8_middle.jpg?rltime" style="position: absolute; top: 55px; left: 59px; width: 50px; height: 50px; border-radius: 25px; pointer-events: auto;"></div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
// **************************************************************

// 弹幕相关操作
class DanmuControl {
    constructor() {
        this.liebev = document.querySelector("#LiebeV");
    }

    // 创建新的去背景虚化css（似乎现在只在某些分区保留了这个效果）
    with_danmu_css = () => {
        // 没有隐藏弹幕相关
        return `
            ._1Osm4fzGmcuRK9M8IVy3u6,
            .watermark-442a18,
            .is-ybHotDebate,
            .view-67255d.zoomIn-0f4645 {
                visibility: hidden !important;
            }

            .Barrage-main,
            .Barrage-topFloater,
            .comment-37342a {
                display: unset !important;
            }
        `;
    };

    without_danmu_css = () => {
        // 隐藏了弹幕相关
        return `
            ._1Osm4fzGmcuRK9M8IVy3u6,
            .watermark-442a18,
            .is-ybHotDebate,
            .view-67255d.zoomIn-0f4645 {
                visibility: hidden !important;
            }

            .Barrage-main,
            .Barrage-topFloater,
            .comment-37342a {
                display: none !important;
            }
        `;
    };

    /**
     * 将传入的 CSS 字符串解析后，直接以行内样式的方式应用到匹配到的元素上
     * @param {string} cssText - 完整的 CSS 文本，例如：".foo{color:red !important} .bar{display:none !important}"
     */
    applyInlineCss = (cssText) => {
        // 简易切分：先按 } 分割成多个规则片段
        let ruleSegments = cssText.split("}");
        ruleSegments.forEach(segment => {
            // 去掉首尾多余空白
            segment = segment.trim();
            if (!segment) return;

            // 再按 { 分割，前半部分是选择器(可能逗号分隔多组)，后半部分是具体样式
            let [selectorPart, stylePart] = segment.split("{");
            if (!selectorPart || !stylePart) return;

            // 处理选择器，可能是多选择器逗号分隔
            let selectors = selectorPart.split(",");
            // 处理style声明，可能有多条用 ; 分隔
            let styleStr = stylePart.trim().replace(/;$/, "");
            let styleArr = styleStr.split(";");

            // 存储解析后的 [属性, 值, 是否important]
            let styleList = [];
            styleArr.forEach(s => {
                s = s.trim();
                if (!s) return;
                // 以冒号切分
                let [prop, val] = s.split(":");
                if (!prop || !val) return;

                prop = prop.trim();
                val = val.trim();

                // 如果带了 !important 标记，就分离出来
                let important = false;
                if (val.includes("!important")) {
                    important = true;
                    // 去除 !important
                    val = val.replace(/!important\s*/i, "").trim();
                }

                styleList.push({ prop, val, important });
            });

            // 将解析好的样式列表应用到匹配的每个元素的行内样式上
            selectors.forEach(sel => {
                sel = sel.trim();
                if (!sel) return;

                // querySelectorAll 找到该选择器对应的所有元素
                let elements = document.querySelectorAll(sel);
                elements.forEach(el => {
                    styleList.forEach(styleObj => {
                        // 这里利用 style.setProperty(prop, val, priority) 来支持 !important
                        el.style.setProperty(styleObj.prop, styleObj.val, styleObj.important ? "important" : "");
                    });
                });
            });
        });
    };

    // 插入新的css（现改为调用 applyInlineCss，以提升优先级到行内样式）
    update_css = (tobe_css) => {
        // 可以保留或移除原有 <style> 的逻辑，这里演示保留它供参考/调试
        // --------------------------------------------------------------------
        if (this.liebev) {
            // 如果页面上有其他先置css，则更新内容
            // 仅仅更新文本以保留 debug，实际不起主导覆盖作用
            this.liebev.textContent = tobe_css;
            console.debug("来自**优化斗鱼web播放器**: liebev样式表已更新 - 但主要覆盖由行内样式完成");
        } else {
            // 否则创建新的style标签
            const stlye_element = document.createElement("style");
            stlye_element.id = "LiebeV";
            stlye_element.type = "text/css";
            stlye_element.appendChild(document.createTextNode(tobe_css));
            document.head.appendChild(stlye_element);
            console.debug("来自**优化斗鱼web播放器**: 新deBlur_css已插入 - 但主要覆盖由行内样式完成");

            this.liebev = document.querySelector("#LiebeV");
        }
        // --------------------------------------------------------------------

        // 新增的行内样式覆盖调用
        this.applyInlineCss(tobe_css);
    };

    rewrite_danmu_css = () => {
        if (this.liebev) {
            // 若已是显示弹幕，则切换到隐藏弹幕；反之亦然
            if (this.liebev.textContent == this.with_danmu_css()) {
                this.update_css(this.without_danmu_css());
                console.debug("来自**优化斗鱼web播放器**: liebev样式表已更新为*隐藏弹幕*(行内样式优先)");
            } else {
                this.update_css(this.with_danmu_css());
                console.debug("来自**优化斗鱼web播放器**: liebev样式表已更新为*显示弹幕*(行内样式优先)");
            }
        } else {
            console.debug("来自**优化斗鱼web播放器**: Error Code [danmu-0]---liebev样式表不存在, 请尝试*刷新网页*或*重装脚本*");
        }
    };
}


// 播放器相关操作
class PlayerControl {
    // 发送浏览器全屏/退出全屏事件,无需等待控件加载完成
    switch_full_mode = () => {
        if (!document.fullscreenElement) {
            document.querySelector("#js-player-video-case").requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    // 模拟双击".video-container-dbc7dc", 因为网页原本就提供了双击播放器来切换的功能，故不做修改
    switch_wide_mode = () => {
        let evt = new MouseEvent("dblclick", {
            bubbles: true,
            cancelable: true,
        });
        document.querySelector(".video-container-dbc7dc").dispatchEvent(evt);
    };

    // 点击原播放器控件来调整清晰度
    // 最多只见过5个选项。原画/8M/4M/超清/高清
    switch_res = (numberkey) => {
        const resinput = document.querySelector(".tipItem-898596 input[value='画质 ']");
        const resul = resinput.nextSibling;
        let reslist = [];
        resul.childNodes.forEach((li) => {
            reslist.push(li);
        });
        // console.debug(reslist);
        const choice = numberkey - 1;
        reslist[choice].click();
    };

    // 找到了可以用于切换线路可点击的标签
    // 最多只见过4个选项
    switch_line = (numberkey) => {
        const lineinput = document.querySelectorAll("ul.menu-da2a9e li");
        const alllines = Array.from(lineinput).filter((li) => li.textContent.includes("线路"));
        let linelist = [];
        alllines.forEach((li) => {
            linelist.push(li);
        });
        const choice = numberkey - 6;
        linelist[choice].click();
    };
}

class ForceHide {
    constructor() {
        // 播放器的核心xpath（包着video的div）
        this.target_xpath = "/html/body/section/main/div[4]/div[1]/div[4]";
        // 上面这个元素的className，用于核查页面变动后导致xpath改变
        this.className_checker = "layout-Player-video";
    }

    // 判断一个元素是否是另一个元素的后代
    is_descendant = (parent, child) => {
        let node = child.parentNode;
        while (node != null) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    };

    // 获取目标元素的祖先
    get_protected = () => {
        const xpath_parts = this.target_xpath.split("/");
        let xpaths = [];
        for (let i = 1; i < xpath_parts.length; i++) {
            xpaths.push("/" + xpath_parts.slice(1, i + 1).join("/"));
        }
        let protected_elements = [];
        xpaths.forEach((xpath) => {
            var element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            protected_elements.push(element);
        });
        return protected_elements;
    };

    // 获取目标元素
    get_target = () => {
        const target_element = document.evaluate(this.target_xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        let checker;
        try {
            checker = target_element.className;
        } catch (TypeError) {
            console.debug("来自**优化斗鱼web播放器**: Error Code [hide-0]---页面上没有找到播放器");
            return;
        }

        if (checker === this.className_checker) {
            return target_element;
        } else {
            console.debug("来自**优化斗鱼web播放器**: Error Code [hide-1]---Xpath描述的元素与预期不符");
        }
    };

    // 强制隐藏保护元素及其祖先之外的所有内容
    force_clean_hide = () => {
        const protected_elements = this.get_protected();
        const target_element = this.get_target();

        document.querySelectorAll("body *").forEach((node) => {
            let is_protected = protected_elements.includes(node) || this.is_descendant(target_element, node);
            if (!is_protected) {
                node.style.display = "none";
            }
        });
    };
}

class BetterMulti {
    mainVideo = () => {
        return document.querySelector("#js-player-video-case").querySelector("video");
    };
    secondVideo = () => {
        return document.querySelector(".web-double-player");
    };
    videos = () => {
        return [this.mainVideo(), this.secondVideo()];
    };
    container = () => {
        return document.querySelector(".liebev-multi");
    };
    controllBar = () => {
        return document.querySelector(".controlbar-f41e38")
    };

    // 监听滚轮，调整height/width
    adjust_size = (target) => {
        let isIn = false;

        target.addEventListener("mouseover", (event) => {
            isIn = true;
        });
        target.addEventListener("mouseout", (event) => {
            isIn = false;
        });

        target.addEventListener("wheel", (event) => {
            if (event.deltaY && isIn) {
                // 方向调整，上为增大
                const adjustment = event.deltaY / -10;
                const currentWidth = target.offsetWidth;
                const currentHeight = target.offsetHeight;

                target.style.width = `${currentWidth + adjustment}px`;
                target.style.height = `${currentHeight + adjustment}px`;

                // 防止滚动页面
                // 因为行为进入全屏，所以注释掉了
                event.preventDefault();
            }
        });
    };

    adjust_position = (target) => {
        let isDragging = false;
        let startX = 0;
        let startY = 0;

        const moveAt = (pageX, pageY) => {
            const deltaX = pageX - startX;
            const deltaY = pageY - startY;
            const rect = target.getBoundingClientRect();

            target.style.left = rect.left + deltaX + "px";
            target.style.top = rect.top + deltaY + "px";

            startX = pageX;
            startY = pageY;
        };

        const onMouseMove = (event) => {
            if (isDragging) {
                moveAt(event.pageX, event.pageY);
            }
        };

        target.addEventListener("mousedown", (event) => {
            isDragging = true;
            target.style.cursor = "move";

            startX = event.pageX;
            startY = event.pageY;

            document.addEventListener("mousemove", onMouseMove);
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
            target.style.cursor = "default";

            document.removeEventListener("mousemove", onMouseMove);
        });
    };

    add_listeners = (target) => {
        this.adjust_size(target);
        this.adjust_position(target);
    };

    // 创建一个新的div并移动所有video元素
    // 这里要带着播放器控件
    create_videos_container = () => {
        const container = document.createElement("div");
        container.classList.add("liebev-multi");
        const mainplayer = document.createElement("div");
        mainplayer.classList.add("liebev-multi-main");

        mainplayer.appendChild(this.mainVideo());
        mainplayer.appendChild(this.controllBar());
        container.appendChild(mainplayer);
        container.appendChild(this.secondVideo());

        document.body.appendChild(container);
    };

    // 入口
    // 将新的盒子全屏，并且洗掉原有的css，防止布局问题
    better_multi_mode = () => {
        if (!this.container()) {
            this.create_videos_container();
        }
        const new_container = document.querySelector(".liebev-multi");
        new_container.requestFullscreen();
        this.videos().forEach((video) => {
            video.classList.remove("_3kBBGV3-d-EIxmN6JRZPar");

            video.style.setProperty("position", "absolute", "important");
            video.style.setProperty("left", "0", "important");
            video.style.setProperty("top", "0", "important");
            video.style.setProperty("width", "960px", "important");
            video.style.setProperty("height", "540px", "important");

            this.add_listeners(video);
        });
    };
}

function listener() {
    for (const [key, func] of listenerMap) {
        document.addEventListener("keydown", (event) => {
            if ((event.getModifierState("Alt") || event.getModifierState("AltGraph")) && event.key.toLowerCase() === key) {
                func();
            }
        });
    }
    document.addEventListener("keydown", (event) => {
        if ((event.getModifierState("Alt") || event.getModifierState("AltGraph")) && event.key >= "1" && event.key <= "5") {
            // console.debug("RES快捷键触发");
            Player_control.switch_res(parseInt(event.key));
        }
    });
    document.addEventListener("keydown", (event) => {
        if ((event.getModifierState("Alt") || event.getModifierState("AltGraph")) && event.key >= "6" && event.key <= "9") {
            // console.debug("LINE快捷键触发");
            Player_control.switch_line(parseInt(event.key));
        }
    });
    console.debug("来自**优化斗鱼web播放器**: 监听已启动");
}

// *******************Tempermonkey插件菜单********************
function show_settings() {
    let message = "当前设置的房间号列表：\n";
    const id_list = GM_getValue("roomIds", []);
    for (let i = 0; i < id_list.length; i++) {
        message += `${i + 1}. ${id_list[i]}\n`;
    }
    const Input = prompt(`${message}\n请输入要移除或恢复弹幕的房间号房间号:`);
    if (Input) {
        update_roomIds(Input);
    }
}

function update_roomIds(Input) {
    // 接收一个房间号输入，判断是否存在在GM中
    const index = roomIds.indexOf(Input);
    if (index === -1) {
        // 不存在则添加，并执行隐藏弹幕
        roomIds.push(Input);
        console.debug(`来自**优化斗鱼web播放器**: 已添加房间号 ${Input}`);
        Danmu_control.update_css(Danmu_control.without_danmu_css());
    } else {
        // 存在则删除，并执行恢复
        roomIds.splice(index, 1);
        console.debug(`来自**优化斗鱼web播放器**: 已移除房间号 ${Input}`);
        Danmu_control.update_css(Danmu_control.with_danmu_css());
    }
    GM_setValue("roomIds", roomIds);
}

GM_registerMenuCommand("房间号设置", show_settings);
// *************************************************************

// 全局实例化类
const Danmu_control = new DanmuControl();
const Player_control = new PlayerControl();
const Force_hide = new ForceHide();
const Better_multi = new BetterMulti();

(function () {
    console.debug("来自**优化斗鱼web播放器**: 已启动");
    const url = window.location.href;
    console.debug("来自**优化斗鱼web播放器**: 类实例化成功");
    if (userRoomIds.some((roomId) => url.includes(roomId))) {
        Danmu_control.update_css(Danmu_control.without_danmu_css());
    } else {
        Danmu_control.update_css(Danmu_control.with_danmu_css());
    }
    listener();
})();
