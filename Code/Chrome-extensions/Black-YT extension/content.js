
//<--------------- Replace Video Titles ------------- >s

const replacementText = "ERROR: DON'T WATCH THIS";
// Function to replace video titles in a given element
function replaceVideoTitles(rootElement = document) {
    // Updated selectors to target regular videos, ads, and shorts
    const selectors = [
        "yt-formatted-string#video-title", // Regular videos
        "span.ytd-display-ad-renderer", // Ad titles
        "span.ytd-in-feed-ad-layout-renderer", // In-feed ad titles
        "span.ytp-ad-preview-text", // Ad preview text
        ".ytd-rich-grid-slim-media #video-title", // Shorts in grid
        ".ytd-rich-section-renderer #video-title", // Shorts section
        ".ytd-shorts #video-title", // Shorts-specific titles
        ".ytd-shorts-video-renderer #video-title", // Another shorts selector
        "h3.shortsLockupViewModelHostMetadataTitle a span", // Shorts titles in new format
        "h3.shortsLockupViewModelHostMetadataTitle a", // Shorts titles alternative
        ".yt-core-attributed-string" // Core attributed strings (often used in shorts)
    ].join(", ");
    
    const titleElements = rootElement.querySelectorAll(selectors);

    titleElements.forEach(titleEl => {
        // For elements with title attribute (tooltips)
        if (titleEl.hasAttribute("title")) {
            titleEl.setAttribute("title", replacementText);
        }
        
        // For aria-label attributes (accessibility)
        if (titleEl.hasAttribute("aria-label")) {
            titleEl.setAttribute("aria-label", replacementText);
        }
        
        // Replace the text content
        titleEl.textContent = replacementText;
        
        // For elements with role="text" that might have special handling
        if (titleEl.getAttribute("role") === "text") {
            // Ensure the text is replaced even if it has special rendering
            setTimeout(() => {
                titleEl.textContent = replacementText;
            }, 0);
        }
    });
    
    // Specifically target shorts section headers
    const shortsHeaders = rootElement.querySelectorAll("h3.shortsLockupViewModelHostMetadataTitle");
    shortsHeaders.forEach(header => {
        const links = header.querySelectorAll("a");
        links.forEach(link => {
            link.textContent = replacementText;
            if (link.hasAttribute("title")) {
                link.setAttribute("title", replacementText);
            }
            
            // Target spans inside links
            const spans = link.querySelectorAll("span");
            spans.forEach(span => {
                span.textContent = replacementText;
            });
        });
    });
}

// Initial replacement for video titles
replaceVideoTitles();

// Set up MutationObserver to handle dynamic content for titles
const textObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                replaceVideoTitles(node);
            }
        });
    });
});

textObserver.observe(document.body, { childList: true, subtree: true });

//<--------------- Replace Channel Names ------------- >s

const channelReplacementText = "UNKNOWN CHANNEL";
// Function to replace channel names in a given element
function replaceChannelNames(rootElement = document) {
    // Target channel name elements - these selectors target channel names on homepage and video pages
    const channelSelectors = [
        "a.yt-simple-endpoint.style-scope.yt-formatted-string", // Channel links in video descriptions
        "yt-formatted-string#channel-name", // Channel name on video pages
        "a#channel-name", // Channel links on thumbnails
        "a.yt-simple-endpoint.style-scope.ytd-channel-name" // Channel links in various places
    ].join(", ");
    
    const channelElements = rootElement.querySelectorAll(channelSelectors);

    channelElements.forEach(channelEl => {
        // Only replace if it's actually a channel element (some links might match but not be channels)
        if (channelEl.href && channelEl.href.includes("/channel/") || 
            channelEl.href && channelEl.href.includes("/user/") ||
            channelEl.href && channelEl.href.includes("/@")) {
            
            // Replace the text content
            if (channelEl.textContent && channelEl.textContent.trim() !== "") {
                channelEl.textContent = channelReplacementText;
            }
            
            // Update the title attribute if it exists
            if (channelEl.hasAttribute("title")) {
                channelEl.setAttribute("title", channelReplacementText);
            }
            
            // If it has child elements that might contain the channel name
            const childTexts = channelEl.querySelectorAll("yt-formatted-string, span");
            childTexts.forEach(child => {
                child.textContent = channelReplacementText;
            });
        }
    });
}

// Initial replacement for channel names
replaceChannelNames();

// Set up MutationObserver to handle dynamic content for channel names
const channelObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                replaceChannelNames(node);
            }
        });
    });
});

channelObserver.observe(document.body, { childList: true, subtree: true });

//<--------------- Replace View Count ----------------->

// Function to replace view counts with "0 views"
function replaceViewCounts(rootElement = document) {
    const viewCountSelectors = [
        "span.style-scope.ytd-video-view-count-renderer", // View count on video pages
        "span.style-scope.ytd-video-meta-block", // View count on thumbnails
        "span.ytd-video-view-count-renderer" // View count in various places
    ].join(", ");
    
    const viewCountElements = rootElement.querySelectorAll(viewCountSelectors);

    viewCountElements.forEach(viewEl => {
        // Check if this is actually a view count element
        if (viewEl.textContent && 
            (viewEl.textContent.includes("views") || 
             viewEl.textContent.includes("view") || 
             viewEl.textContent.match(/\d+\s*(K|M|B)?\s*views?/i))) {
            
            // Replace the text content
            viewEl.textContent = "0 views";
            
            // Update the title attribute if it exists
            if (viewEl.hasAttribute("title")) {
                viewEl.setAttribute("title", "0 views");
            }
            
            // If it has child elements that might contain the view count
            const childTexts = viewEl.querySelectorAll("span, yt-formatted-string");
            childTexts.forEach(child => {
                child.textContent = "0 views";
            });
        }
    });
}

// Initial replacement for view counts
replaceViewCounts();

// Set up MutationObserver to handle dynamic content for view counts
const viewCountObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                replaceViewCounts(node);
            }
        });
    });
});

viewCountObserver.observe(document.body, { childList: true, subtree: true });

//<------------------ Replace Channel Profile Pictures ----------------->
// ... existing code ...

//<--------------- Replace Channel Avatars ----------------->

// Function to replace channel avatars with black image
function replaceChannelAvatars(rootElement = document) {
    const avatarSelectors = [
        "yt-img-shadow img", // General avatar images
        ".yt-spec-avatar-shape__image", // New avatar shape images
        "ytd-channel-avatar img", // Channel avatars
        "#avatar img", // Avatar images
        ".style-scope.yt-img-shadow", // Avatar image containers
    ].join(", ");
    
    const avatarElements = rootElement.querySelectorAll(avatarSelectors);

    avatarElements.forEach(avatarEl => {
        // Create a black background
        avatarEl.style.backgroundColor = "#000000";
        
        // Remove any background images
        avatarEl.style.backgroundImage = "none";
        
        // If it's an actual image element, replace the source
        if (avatarEl.tagName.toLowerCase() === "img") {
            // Set src to a 1x1 black pixel data URL
            avatarEl.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
        }
        
        // Remove any background styling from parent elements
        if (avatarEl.parentElement) {
            avatarEl.parentElement.style.backgroundColor = "#000000";
            avatarEl.parentElement.style.backgroundImage = "none";
        }
    });
}

// Initial replacement for avatars
replaceChannelAvatars();

// Set up MutationObserver to handle dynamic content for avatars
const avatarObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                replaceChannelAvatars(node);
            }
        });
    });
});

avatarObserver.observe(document.body, { childList: true, subtree: true });

//<--------------- Replace Shorts Thumbnails ----------------->

// Function to replace shorts thumbnails with black images
function replaceShortsThumbnails(rootElement = document) {
    const shortsSelectors = [
        "ytd-rich-grid-slim-media[is-short] #thumbnail", // Shorts in grid view
        "ytd-rich-item-renderer[is-short] #thumbnail", // Another shorts grid variant
        "ytd-reel-item-renderer #thumbnail", // Shorts shelf items
        ".ytd-shorts-video-renderer #thumbnail", // General shorts thumbnails
        "ytd-reel-video-renderer #thumbnail", // Shorts player thumbnails
        ".reel-video-in-sequence #thumbnail", // Shorts in sequence
        ".ytd-rich-shelf-renderer[is-shorts] #thumbnail", // Shorts in rich shelf
        "#shorts-container img", // Direct shorts images
        ".ytd-shorts img", // All images within shorts containers
        "video.video-stream.html5-main-video", // Main video element for shorts
    ].join(", ");
    
    const shortsThumbnails = rootElement.querySelectorAll(shortsSelectors);

    shortsThumbnails.forEach(thumbnail => {
        // Handle the thumbnail container
        thumbnail.style.backgroundColor = "#000000";
        thumbnail.style.backgroundImage = "none";
        
        // If it's a video element, handle it specifically
        if (thumbnail.tagName.toLowerCase() === "video") {
            // Hide the video content
            thumbnail.style.opacity = "0";
            thumbnail.style.visibility = "hidden";
            
            // Create a black overlay if it doesn't exist
            let overlay = thumbnail.parentElement.querySelector('.black-yt-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'black-yt-overlay';
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = '#000000';
                overlay.style.zIndex = '10';
                if (thumbnail.parentElement) {
                    thumbnail.parentElement.style.position = 'relative';
                    thumbnail.parentElement.appendChild(overlay);
                }
            }
            return;
        }
        
        // Handle any images within the thumbnail
        const images = thumbnail.querySelectorAll("img");
        images.forEach(img => {
            img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
            img.style.backgroundColor = "#000000";
        });
        
        // Handle the thumbnail overlay
        const overlays = thumbnail.querySelectorAll(".thumbnail-overlay");
        overlays.forEach(overlay => {
            overlay.style.backgroundColor = "#000000";
            overlay.style.backgroundImage = "none";
        });

        // Remove any preview animations or hover effects
        thumbnail.style.transition = "none";
        thumbnail.style.transform = "none";
        
        // Ensure the black background covers the entire area
        thumbnail.style.width = "100%";
        thumbnail.style.height = "100%";
        thumbnail.style.position = "relative";
    });
}

// Initial replacement for shorts thumbnails
replaceShortsThumbnails();

// Set up MutationObserver to handle dynamic content for shorts thumbnails
const shortsThumbnailObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                replaceShortsThumbnails(node);
            }
        });
    });
});

shortsThumbnailObserver.observe(document.body, { childList: true, subtree: true });

// Additional function to specifically target and replace video elements
function replaceVideoElements() {
    const videoElements = document.querySelectorAll("video.video-stream.html5-main-video");
    
    videoElements.forEach(video => {
        // Create a black overlay for the video
        const videoContainer = video.parentElement;
        if (videoContainer) {
            videoContainer.style.backgroundColor = "#000000";
            
            // Hide the actual video
            video.style.opacity = "0";
            video.style.visibility = "hidden";
            
            // Prevent video from playing
            video.pause();
            video.currentTime = 0;
            
            // Add event listener to keep pausing if it tries to play
            video.addEventListener('play', function() {
                this.pause();
            });
        }
    });
}

// Run video replacement initially and set interval to catch dynamically loaded videos
replaceVideoElements();
setInterval(replaceVideoElements, 1000);
