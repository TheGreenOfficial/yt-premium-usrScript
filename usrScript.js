// ==UserScript==
// @name         YouTube Premium Userscript :made by::TheGreen:
// @namespace    http://tampermonkey.net/
// @version      v1.4
// @description  usrScript for toggling auto-play, dialog blocking, ad blocking, video quality, and night mode on YouTube.
// @author       TheGreen
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let isMusicModeOn = false;
    let isAdBlockerOn = false;
    let isHigherQualityOn = false;
    let isNightModeOn = false;


    // Function to show a notification on screen
    function showNotification(message) {
        if (document.querySelector("#autoPlayNotification")) {
            return;
        }

        const notification = document.createElement('div');
        notification.id = "autoPlayNotification";
        notification.textContent = message;

        Object.assign(notification.style, {
            'position': "fixed",
            'top': "50%",
            'left': "40%",
            'transform': "translate(-50%, -50%)",
            'backgroundColor': '#87CEEB',
            'color': '#ffffff',
            'padding': "8px 16px",
            'borderRadius': "8px",
            'fontSize': "14px",
            'fontWeight': "bold",
            'boxShadow': "0 2px 6px rgba(0, 0, 0, 0.2)",
            'zIndex': '999999999',
            'opacity': '0',
            'transition': "opacity 0.2s ease, transform 0.2s ease"
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = "translate(-50%, -50%)";
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = "translate(-50%, -56%)";
            setTimeout(() => notification.remove(), 500);
        }, 1000);
    }

    // Function to block confirmation dialogs
    function blockConfirmationDialog() {
        if (!isMusicModeOn) {
            return;
        }

        const dialog = document.querySelector('yt-confirm-dialog-renderer');
        if (dialog && !dialog.hasAttribute('data-blocked')) {
            dialog.style.display = "none"; // Hide the dialog
            showNotification("Blocked YouTube confirmation dialog."); // Show notification once
            dialog.setAttribute('data-blocked', 'true'); // Mark it as blocked
        } else if (dialog) {
            dialog.style.display = "none"; // Keep blocking the dialog without showing the notification
        }
    }

    // Function to keep the video playing in Music Mode
    function keepPlayingVideo() {
        if (!isMusicModeOn) {
            return;
        }

        const video = document.querySelector("video");
        if (video && video.paused) {
            video.play();
            showNotification("Music mode is on?");
        }
    }

    // Toggle Music Mode on and off
    function toggleMusicMode() {
        isMusicModeOn = !isMusicModeOn;
        showNotification(isMusicModeOn ? "Music Mode is on." : "Music Mode is off.");
    }

    // Toggle Ad Blocker on and off
    function toggleAdBlocker() {
        isAdBlockerOn = !isAdBlockerOn;
        showNotification(isAdBlockerOn ? "Ad Blocker is on." : "Ad Blocker is off.");
    }

    // Toggle Higher Quality setting
    function toggleHigherQuality() {
        isHigherQualityOn = !isHigherQualityOn;
        showNotification(isHigherQualityOn ? "Higher Quality is on." : "Higher Quality is off.");
        if (isHigherQualityOn) {
            setHighestVideoQuality();
            monitorVideoPlayback();
        } else {
    alert("Page will be reloaded to turn off this function. You can re-enable those functions you were using after a reload. Do you want to proceed?");
    window.location.href = window.location.href;
        }
}

// Function to open the settings menu, wait for quality options to appear, and select the highest available quality
function setHighestVideoQuality() {
    const settingsButton = document.querySelector('.ytp-settings-button'); // Button for settings (gear icon)
    if (settingsButton) {
        settingsButton.click(); // Open the settings menu

        // Wait for the "Quality" option to appear
        const qualityButtonInterval = setInterval(() => {
            const qualityButton = Array.from(document.querySelectorAll('.ytp-menuitem'))
                .find(item => item.textContent.toLowerCase().includes('quality')); // Find the "Quality" option
            if (qualityButton) {
                qualityButton.click(); // Click to open the quality options

                // Now wait for the list of quality options to appear
                const qualityLevelsInterval = setInterval(() => {
                    const qualityOptions = Array.from(document.querySelectorAll('.ytp-menuitem'))
                        .filter(item => item.textContent.match(/\d+p/)); // Filter for options with "p" (720p, 1080p, etc.)

                    if (qualityOptions.length > 0) {
                        // Sort the options by resolution in descending order (highest quality first)
                        qualityOptions.sort((a, b) => {
                            const resA = parseInt(a.textContent.match(/\d+/)[0]); // Extract the resolution number (e.g., 720, 1080)
                            const resB = parseInt(b.textContent.match(/\d+/)[0]);
                            return resB - resA; // Sort in descending order
                        });

                        // Click the highest quality option
                        qualityOptions[0].click();
                        clearInterval(qualityLevelsInterval); // Stop checking for quality options
                    }
                }, 100); // Check for quality options every 100ms
                clearInterval(qualityButtonInterval); // Stop checking for "Quality" button
            }
        }, 100); // Check for "Quality" button every 100ms
    }

    // After selecting the quality, wait for 1 second and check if the quality menu is still open
    setTimeout(() => {
        const qualityMenu = document.querySelector('.ytp-quality-menu'); // Check if the quality menu is open
        if (qualityMenu && qualityMenu.style.display !== 'none') {
            // If the menu is still open, click outside to close it by clicking the settings button again
            settingsButton.click();
        }
    }, 1000); // Wait 1 second before checking the menu
}
        // Monitor video playback and trigger the quality selection when video starts playing
function monitorVideoPlayback() {
    const video = document.querySelector('video');
    if (video) {
        video.addEventListener('play', () => {
            // Add a delay of 1 second after video starts playing
            setTimeout(() => {
                setHighestVideoQuality(); // Trigger quality selection after 1 second delay
            }, 1000); // 1 second delay
        });
    }
}



    // Toggle Night Mode on and off
    function toggleNightMode() {
        isNightModeOn = !isNightModeOn;
        if (isNightModeOn) {
            showNotification("Night Mode is on.");
            document.body.style.opacity = "0.5";

        } else {
            showNotification("Night Mode is off.");
            document.body.style.opacity = "1";
        }
    }

    // Block ad elements on the page
    function blockAds() {
        if (!isAdBlockerOn) {
            return;
        }

        const adSelectors = [
            'ytd-display-ad',
            'ytd-player-legacy-desktop-watch-ads',
            'ytd-ad-overlay-slot',
            'ytd-promoted-sparkles-web-renderer'
        ];

        adSelectors.forEach(selector => {
            const adElements = document.querySelectorAll(selector);
            adElements.forEach(ad => ad.style.display = 'none');
        });
    }
    function show(msg) {
    // Check if a notification already exists
    if (document.querySelector("#Notification")) {
        return;
    }

    // Create the notification element
    const no = document.createElement('div');
    no.id = "Notification"; // Use "Notification" as ID
    no.textContent = msg;

    // Apply styles to the notification
    Object.assign(no.style, {
        'position': "fixed",
        'top': "50%",
        'left': "50%",
        'transform': "translate(-50%, -50%)",
        'backgroundColor': '#ff0000',
        'color': '#00ff00',
        'padding': "8px 16px",
        'borderRadius': "8px",
        'fontSize': "14px",
        'fontWeight': "bold",
        'boxShadow': "0 2px 6px rgba(0, 0, 0, 0.2)",
        'zIndex': '999999999',
        'opacity': '0',
        'transition': "opacity 0.2s ease, transform 0.2s ease"
    });

    // Append notification to the body
    document.body.appendChild(no);

    // Trigger the fade-in effect
    setTimeout(() => {
        no.style.opacity = '1';
        no.style.transform = 'translate(-50%, -50%) scale(1.05)';
    }, 100);

    // Fade out after 3 seconds
    setTimeout(() => {
        no.style.opacity = '0';
        no.style.transform = 'translate(-50%, -50%) scale(0.95)';
    }, 3000);

    // Remove the notification after fade out
    setTimeout(() => {
        no.remove();
    }, 3500);
}



    window.onload = function(){
    // Call the show function to display the notification
show("msg: usrScript working... | Dev: </>TheGreen");
    }

    // Create a draggable UI for controlling Music Mode, Higher Quality, Ad Blocker, and Night Mode
    function createDraggableUI() {
        const draggableUI = document.createElement('div');
        Object.assign(draggableUI.style, {
            'position': "fixed",
            'top': "420px", // Reduced top distance
            'left': "5px",
            'width': '50px', // Reduced width
            'height': "50px", // Reduced height
            'borderRadius': "50%",
            'backgroundImage': 'url(https://yt3.ggpht.com/JxYa_OFnEjU1DRimYqOau_nnhSw6zY_jJoAZ68X6GO3lWjfd5VasbRXRiYTt9ZuDQ5FU3K7GpA=s600-c-k-c0x00ffffff-no-rj-rp-mo)',
            'backgroundRepeat': "no-repeat",
            'backgroundPosition': 'center',
            'backgroundSize': "cover",
            'backgroundColor': "#ffffff",
            'zIndex': "9999999999",
            'cursor': "pointer",
            'boxShadow': "0 4px 8px rgba(0, 0, 0, 0.3)"
        });

        draggableUI.id = "draggableUI";
        const popupUI = createPopupUI();
        document.body.appendChild(draggableUI);
        document.body.appendChild(popupUI);

        let offsetX = 0;
        let offsetY = 0;

        draggableUI.onmousedown = (event) => {
            offsetX = event.clientX - draggableUI.getBoundingClientRect().left;
            offsetY = event.clientY - draggableUI.getBoundingClientRect().top;

            const moveElement = (x, y) => {
                draggableUI.style.left = `${x - offsetX}px`;
                draggableUI.style.top = `${y - offsetY}px`;
                popupUI.style.left = `${parseInt(draggableUI.style.left)}px`;
                popupUI.style.top = `${parseInt(draggableUI.style.top)}px`;
            };

            const onMouseMove = (event) => moveElement(event.pageX, event.pageY);
            document.addEventListener("mousemove", onMouseMove);

            document.onmouseup = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.onmouseup = null;
            };
        };

        draggableUI.ondragstart = () => false;
        draggableUI.onclick = () => {
            popupUI.style.display = popupUI.style.display === "none" ? 'block' : "none";
        };
    }

    // Create the popup UI for toggling modes and settings
    function createPopupUI() {
        const popup = document.createElement("div");
        Object.assign(popup.style, {
            'position': "fixed",
            'top': "420px", // Reduced top distance
            'left': "7px",
            'width': "180px", // Reduced width
            'backgroundColor': '#F5F5F5',
            'color': "#333333",
            'borderRadius': "12px", // Slightly smaller border radius
            'padding': "16px", // Reduced padding
            'fontSize': "14px", // Smaller font
            'fontWeight': "bold",
            'boxShadow': "0 8px 16px rgba(0, 0, 0, 0.2)",
            'zIndex': '999999999',
            'display': "none"
        });

        const title = document.createElement("div");
        title.textContent = " </>TheGreen";
        Object.assign(title.style, {
            'fontSize': '20px',
            'fontWeight': "bold",
            'marginBottom': '16px',
            'textAlign': "center",
            'color': "#00ff00"
        });
        popup.appendChild(title);

        // Music Mode toggle (1)
        const musicModeSection = document.createElement("div");
        musicModeSection.style.display = "flex";
        musicModeSection.style.marginTop = "4px";
        musicModeSection.style.justifyContent = "space-between";
        musicModeSection.style.alignItems = "center";

        const musicLabel = document.createElement("span");
        musicLabel.textContent = "1) Music Mode";
        musicModeSection.appendChild(musicLabel);

        const musicToggle = document.createElement('label');
        Object.assign(musicToggle.style, {
            'position': "relative",
            'display': "inline-block",
            'width': '40px',
            'height': "20px"
        });

        const musicCheckbox = document.createElement("input");
        musicCheckbox.type = "checkbox";
        musicCheckbox.checked = isMusicModeOn;
        Object.assign(musicCheckbox.style, {
            'opacity': '0',
            'width': '0',
            'height': '0'
        });
        musicCheckbox.onchange = toggleMusicMode;

        const musicSlider = document.createElement("span");
        Object.assign(musicSlider.style, {
            'position': "absolute",
            'cursor': "pointer",
            'top': '0',
            'left': '0',
            'right': '0',
            'bottom': '0',
            'backgroundColor': '#ccc',
            'transition': ".4s",
            'borderRadius': "24px"
        });

        const musicSliderCircle = document.createElement('span');
        Object.assign(musicSliderCircle.style, {
            'position': "absolute",
            'height': '14px', // Slightly smaller circle
            'width': "14px", // Slightly smaller circle
            'left': "3px",
            'bottom': "3px",
            'backgroundColor': "#ffffff",
            'transition': '.4s',
            'borderRadius': '50%'
        });

        musicCheckbox.onchange = () => {
            toggleMusicMode();
            musicSlider.style.backgroundColor = musicCheckbox.checked ? "#32CD32" : "#ccc";
            musicSliderCircle.style.transform = musicCheckbox.checked ? "translateX(20px)" : 'translateX(0)';
        };

        musicToggle.appendChild(musicCheckbox);
        musicSlider.appendChild(musicSliderCircle);
        musicToggle.appendChild(musicSlider);
        musicModeSection.appendChild(musicToggle);
        popup.appendChild(musicModeSection);

        // Higher Quality toggle (2)
        const higherQualitySection = document.createElement("div");
        higherQualitySection.style.display = "flex";
        higherQualitySection.style.marginTop = "14px";
        higherQualitySection.style.justifyContent = "space-between";
        higherQualitySection.style.alignItems = "center";

        const higherQualityLabel = document.createElement("span");
        higherQualityLabel.textContent = "2) Auto 2 |ʜᴅ|";
        higherQualitySection.appendChild(higherQualityLabel);

        const higherQualityToggle = document.createElement('label');
        Object.assign(higherQualityToggle.style, {
            'position': "relative",
            'display': "inline-block",
            'width': '40px',
            'height': "20px"
        });

        const qualityCheckbox = document.createElement("input");
        qualityCheckbox.type = "checkbox";
        qualityCheckbox.checked = isHigherQualityOn;
        Object.assign(qualityCheckbox.style, {
            'opacity': '0',
            'width': '0',
            'height': '0'
        });
        qualityCheckbox.onchange = toggleHigherQuality;

        const qualitySlider = document.createElement("span");
        Object.assign(qualitySlider.style, {
            'position': "absolute",
            'cursor': "pointer",
            'top': '0',
            'left': '0',
            'right': '0',
            'bottom': '0',
            'backgroundColor': '#ccc',
            'transition': ".4s",
            'borderRadius': "24px"
        });

        const qualitySliderCircle = document.createElement('span');
        Object.assign(qualitySliderCircle.style, {
            'position': "absolute",
            'height': '14px', // Slightly smaller circle
            'width': "14px", // Slightly smaller circle
            'left': "3px",
            'bottom': "3px",
            'backgroundColor': "#ffffff",
            'transition': '.4s',
            'borderRadius': '50%'
        });

        qualityCheckbox.onchange = () => {
            toggleHigherQuality();
            qualitySlider.style.backgroundColor = qualityCheckbox.checked ? "#32CD32" : "#ccc";
            qualitySliderCircle.style.transform = qualityCheckbox.checked ? "translateX(20px)" : 'translateX(0)';
        };

        higherQualityToggle.appendChild(qualityCheckbox);
        qualitySlider.appendChild(qualitySliderCircle);
        higherQualityToggle.appendChild(qualitySlider);
        higherQualitySection.appendChild(higherQualityToggle);
        popup.appendChild(higherQualitySection);

        // Ad Blocker toggle (3)
        const adBlockerSection = document.createElement("div");
        adBlockerSection.style.display = "flex";
        adBlockerSection.style.marginTop = "14px";
        adBlockerSection.style.justifyContent = "space-between";
        adBlockerSection.style.alignItems = "center";

        const adBlockerLabel = document.createElement("span");
        adBlockerLabel.textContent = "3) Ad Blocker";
        adBlockerSection.appendChild(adBlockerLabel);

        const adBlockerToggle = document.createElement('label');
        Object.assign(adBlockerToggle.style, {
            'position': "relative",
            'display': "inline-block",
            'width': '40px',
            'height': "20px"
        });

        const adBlockerCheckbox = document.createElement("input");
        adBlockerCheckbox.type = "checkbox";
        adBlockerCheckbox.checked = isAdBlockerOn;
        Object.assign(adBlockerCheckbox.style, {
            'opacity': '0',
            'width': '0',
            'height': '0'
        });
        adBlockerCheckbox.onchange = toggleAdBlocker;

        const adBlockerSlider = document.createElement("span");
        Object.assign(adBlockerSlider.style, {
            'position': "absolute",
            'cursor': "pointer",
            'top': '0',
            'left': '0',
            'right': '0',
            'bottom': '0',
            'backgroundColor': '#ccc',
            'transition': ".4s",
            'borderRadius': "24px"
        });

        const adBlockerSliderCircle = document.createElement('span');
        Object.assign(adBlockerSliderCircle.style, {
            'position': "absolute",
            'height': '14px',
            'width': "14px",
            'left': "3px",
            'bottom': "3px",
            'backgroundColor': "#ffffff",
            'transition': '.4s',
            'borderRadius': '50%'
        });

        adBlockerCheckbox.onchange = () => {
            toggleAdBlocker();
            adBlockerSlider.style.backgroundColor = adBlockerCheckbox.checked ? "#32CD32" : "#ccc";
            adBlockerSliderCircle.style.transform = adBlockerCheckbox.checked ? "translateX(20px)" : 'translateX(0)';
        };

        adBlockerToggle.appendChild(adBlockerCheckbox);
        adBlockerSlider.appendChild(adBlockerSliderCircle);
        adBlockerToggle.appendChild(adBlockerSlider);
        adBlockerSection.appendChild(adBlockerToggle);
        popup.appendChild(adBlockerSection);

        // Night Mode toggle (4)
        const nightModeSection = document.createElement("div");
        nightModeSection.style.display = "flex";
        nightModeSection.style.marginTop = "14px";
        nightModeSection.style.justifyContent = "space-between";
        nightModeSection.style.alignItems = "center";

        const nightModeLabel = document.createElement("span");
        nightModeLabel.textContent = "4) Night Mode";
        nightModeSection.appendChild(nightModeLabel);

        const nightModeToggle = document.createElement('label');
        Object.assign(nightModeToggle.style, {
            'position': "relative",
            'display': "inline-block",
            'width': '40px',
            'height': "20px"
        });

        const nightModeCheckbox = document.createElement("input");
        nightModeCheckbox.type = "checkbox";
        nightModeCheckbox.checked = isNightModeOn;
        Object.assign(nightModeCheckbox.style, {
            'opacity': '0',
            'width': '0',
            'height': '0'
        });
        nightModeCheckbox.onchange = toggleNightMode;

        const nightModeSlider = document.createElement("span");
        Object.assign(nightModeSlider.style, {
            'position': "absolute",
            'cursor': "pointer",
            'top': '0',
            'left': '0',
            'right': '0',
            'bottom': '0',
            'backgroundColor': '#ccc',
            'transition': ".4s",
            'borderRadius': "24px"
        });

        const nightModeSliderCircle = document.createElement('span');
        Object.assign(nightModeSliderCircle.style, {
            'position': "absolute",
            'height': '14px',
            'width': "14px",
            'left': "3px",
            'bottom': "3px",
            'backgroundColor': "#ffffff",
            'transition': '.4s',
            'borderRadius': '50%'
        });

        nightModeCheckbox.onchange = () => {
            toggleNightMode();
            nightModeSlider.style.backgroundColor = nightModeCheckbox.checked ? "#32CD32" : "#ccc";
            nightModeSliderCircle.style.transform = nightModeCheckbox.checked ? "translateX(20px)" : 'translateX(0)';
        };

        nightModeToggle.appendChild(nightModeCheckbox);
        nightModeSlider.appendChild(nightModeSliderCircle);
        nightModeToggle.appendChild(nightModeSlider);
        nightModeSection.appendChild(nightModeToggle);
        popup.appendChild(nightModeSection);

        return popup;
    }

    createDraggableUI();

    // Block any ads initially
    blockAds();

    // Block confirmation dialogs on page load
    setInterval(() => {
        blockConfirmationDialog();
        keepPlayingVideo();
        blockAds();
    }, 444);

    // Function to check and hide the 'tp-yt-iron-overlay-backdrop' and popup elements
function hideBackdropIfExists() {
    const backdrop = document.querySelector('tp-yt-iron-overlay-backdrop');
    const po = document.querySelector('tp-yt-paper-dialog');

        if (po) {
        po.style.display = "none"; // Hide the popup
    }

    if (backdrop) {
        backdrop.style.display = "none"; // Hide the backdrop
    }
}

// Check every 1 second (1000 milliseconds)
setInterval(hideBackdropIfExists, 1000);

})();
