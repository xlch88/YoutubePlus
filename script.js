// ==UserScript==
// @name         YoutubePlus - 100%音量增强/一键倍速按钮/自动切换Premium画质/删除迷你播放器按钮
// @namespace    https://github.com/xlch88/YoutubePlus
// @author       Dark495 (https://dark495.me/)
// @version      2025-01-19
// @license      WTFPL
// @description  增强Youtube使用体验
// @author       Dark495
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// ==/UserScript==

(function () {
	"use strict";

	let player;
	let volumePanel;
	let volumeSlider;

	const functions = {
		maxVolume: {
			name: "真正100%音量",
			enable: true,
		},
		speedButton: {
			name: "一键倍速按钮",
			enable: true,
		},
		premiumQuality: {
			name: "自动切换会员画质",
			enable: true,
		},
		hidePiPButton: {
			name: "隐藏画中画/迷你播放器按钮",
			enable: true,
		},
	};
	let menuIds = [];
	for (const key of Object.keys(functions)) {
		functions[key].enable = GM_getValue(`function_${key}_enable`, functions[key].enable);
	}

	function registerMenu() {
		menuIds.forEach((v) => {
			GM_unregisterMenuCommand(v);
		});
		menuIds = [];

		menuIds.push(
			GM_registerMenuCommand(`😘 当前版本 ${GM_info.script.version}`, function () {
				window.GM_openInTab("https://greasyfork.org/zh-CN/scripts/486375", {
					active: true,
					insert: true,
					setParent: true,
				});
			})
		);

		for (const [key, info] of Object.entries(functions)) {
			menuIds.push(GM_registerMenuCommand(`${info.enable ? "✅" : "❌"} ${info.name}`, () => menuEvent(key)));
		}
	}

	function menuEvent(key) {
		functions[key].enable = !functions[key].enable;
		GM_setValue(`function_${key}_enable`, functions[key].enable);

		switch (key) {
			case "maxVolume":
				if (functions.maxVolume.enable) {
					setVolume();
				} else {
					volumeSlider.style.backgroundColor = "white";
					document.querySelector("#movie_player").setVolume(document.querySelector("#movie_player").getVolume());
				}
				break;

			case "speedButton":
				if (functions.speedButton.enable) {
					addSpeedButton();
				} else {
					document.querySelector(".ytp-speed-button").remove();
				}
				break;

			case "premiumQuality":
				if (functions.premiumQuality.enable) {
					switchToPremiumQuality();
				}
				break;

			case "hidePiPButton":
				if (functions.hidePiPButton.enable) {
					hidePiPButton();
				} else {
					document.querySelector(".ytp-pip-button").style.display = "";
					document.querySelector(".ytp-miniplayer-button").style.display = "";
					document.querySelector(".ytp-size-button").style.display = "";
				}
				break;
		}

		registerMenu();
	}

	function hidePiPButton() {
		document.querySelector(".ytp-pip-button").style.display = "none";
		document.querySelector(".ytp-miniplayer-button").style.display = "none";
		document.querySelector(".ytp-size-button").style.display = "none";
	}

	function setVolume() {
		if (!functions.maxVolume.enable) return;

		if (parseInt(volumePanel.getAttribute("aria-valuenow")) === 100) {
			volumeSlider.style.backgroundColor = "red";
			if (player.volume !== 1) {
				player.volume = 1;
				console.log("[Youtube真正100%音量] 设置成功！", player, parseInt(volumePanel.getAttribute("aria-valuenow")));
			}
		} else {
			volumeSlider.style.backgroundColor = "white";
		}
	}

	function switchToPremiumQuality() {
		function openQualityList() {
			if (document.querySelector(".ytp-settings-shown")) {
				document.querySelector(".ytp-settings-button").click();
				document.querySelector(".ytp-settings-button").click();
			} else {
				document.querySelector(".ytp-settings-button").click();
			}

			if (!document.querySelector(".ytp-quality-menu")) {
				document.querySelector(".ytp-panel-menu .ytp-menuitem:last-of-type").click();
			}
		}

		openQualityList();
		const qualityList = {};
		document.querySelector(".ytp-quality-menu .ytp-panel-menu").childNodes.forEach((v, i) => {
			const name = v.querySelector("span").firstChild.textContent.trim();

			qualityList[name] = i;
		});

		const nowQuality = document.querySelector("#movie_player").getPlaybackQualityLabel();
		if (!nowQuality.includes("Premium") && Object.keys(qualityList).includes(`${nowQuality} Premium`)) {
			openQualityList();
			document.querySelector(".ytp-quality-menu .ytp-panel-menu").childNodes[qualityList[`${nowQuality} Premium`]].click();
		}
	}

	function addSpeedButton() {
		if (document.querySelector(".ytp-speed-button")) return;

		const speedButtonSvg = `<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1737240990275" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4235" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><path d="M512 512a53.44 53.44 0 0 1-17.4 39.413333L131.933333 882a52.833333 52.833333 0 0 1-35.713333 14 53.84 53.84 0 0 1-21.76-4.666667A52.666667 52.666667 0 0 1 42.666667 842.593333V181.406667A53.333333 53.333333 0 0 1 131.926667 142l362.666666 330.6A53.44 53.44 0 0 1 512 512z m451.933333-39.413333L601.26 142A53.333333 53.333333 0 0 0 512 181.406667v661.186666a52.666667 52.666667 0 0 0 31.793333 48.793334 53.84 53.84 0 0 0 21.76 4.666666 52.833333 52.833333 0 0 0 35.713334-14l362.666666-330.6a53.333333 53.333333 0 0 0 0-78.826666z" fill="#ffffff" p-id="4236"></path></svg>`;

		const controls = document.getElementsByClassName("ytp-left-controls")[0];

		let speedButtonActive = 0;
		try {
			speedButtonActive = parseFloat(JSON.parse(sessionStorage.getItem("yt-player-playback-rate")).data);
		} catch {}

		const speedButtonDiv = document.createElement("div");
		speedButtonDiv.className = "ytp-speed-button";
		const speedButtons = [];
		for (let speed of [0.5, 1, 1.5, 2]) {
			const speedButton = document.createElement("span");
			speedButton.className = `ytp-speed-button ytp-speed-button-${speed.toString().replace(".", "")}x`;
			speedButtonDiv.appendChild(speedButton);
			speedButton.onclick = () => {
				document.querySelector("#movie_player").setPlaybackRate(speed);
				sessionStorage.setItem(
					"yt-player-playback-rate",
					JSON.stringify({
						data: speed.toString(),
						creation: new Date().getTime(),
					})
				);
				speedButtons.forEach((v) => {
					v.classList.remove("ytp-speed-button-active");
				});
				speedButton.classList.add("ytp-speed-button-active");
			};
			if (speedButtonActive === speed) speedButton.classList.add("ytp-speed-button-active");
			speedButtons.push(speedButton);
		}
		controls.parentNode.insertBefore(speedButtonDiv, controls.nextSibling);

		const style = document.createElement("style");
		style.className = "speed-button";
		style.textContent = `
			div.ytp-speed-button{
				display:flex;
			}
			span.ytp-speed-button{
				width: 48px;
				height: 48px;
				display: flex;
				justify-content: center;
				align-items: center;
				position: relative;
				cursor: pointer;
			}

			span.ytp-speed-button::before{
				content: "";
				background:url('data:image/svg+xml;utf8,${encodeURIComponent(speedButtonSvg)}');
				width: 20px;
				height: 20px;
				background-size: contain;
			}
			span.ytp-speed-button::after{
				content: "1x";
				position: absolute;
				top: -7px;
				left: 28px;
				font-size: 12px;
				transform: scale(0.8);
				color: white;
				pointer-events: none;
				text-align: left;
			}
			span.ytp-speed-button-active::after{
				color: red;
			}
			span.ytp-speed-button-05x::after{
				content: "0.5x";
			}
			span.ytp-speed-button-1x::after{
				content: "1x";
			}
			span.ytp-speed-button-15x::after{
				content: "1.5x";
			}
			span.ytp-speed-button-2x::after{
				content: "2x";
			}
		`;
		document.head.appendChild(style);
	}

	setInterval(() => {
		player = document.getElementsByClassName("video-stream")[0];
		volumePanel = document.getElementsByClassName("ytp-volume-panel")[0];
		volumeSlider = document.getElementsByClassName("ytp-volume-slider-handle")[0];

		if (player && volumePanel && volumeSlider) {
			if (!player.isHookYoutubePlus) {
				player.addEventListener("volumechange", () => {
					setVolume();
				});
				player.isHookYoutubePlus = true;

				if (functions.speedButton.enable) {
					addSpeedButton();
				}
				if (functions.premiumQuality.enable) {
					switchToPremiumQuality();
				}
				if (functions.hidePiPButton.enable) {
					hidePiPButton();
				}
			}

			setVolume();
		}
	}, 300);

	registerMenu();
})();
