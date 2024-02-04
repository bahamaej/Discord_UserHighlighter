// ==UserScript==
// @name         UserHighlighter
// @namespace    BDPlugins
// @version      0.1
// @description  Highlights specified user mentions in Discord channels.
// @author       EasusJ
// @updateURL    <YOUR_UPDATE_URL>
// @downloadURL  <YOUR_DOWNLOAD_URL>
// ==/UserScript==

const { Plugin } = window.BdApi;

class UserHighlighter extends Plugin {
    onStart() {
        this.loadSettings();
        this.patchMessageComponent();
    }

    onStop() {
        BdApi.Patcher.unpatchAll();
    }

    get defaultSettings() {
        return {
            userIds: []
        };
    }

    loadSettings() {
        this.settings = BdApi.loadData("UserHighlighter", "settings") || this.defaultSettings;
    }

    saveSettings() {
        BdApi.saveData("UserHighlighter", "settings", this.settings);
    }

    patchMessageComponent() {
        const MessageComponent = BdApi.findModuleByDisplayName("Message");
        BdApi.Patcher.after("UserHighlighter", MessageComponent.prototype, "render", (that, args, value) => {
            const userIds = this.settings.userIds;
            if (!value.props || !value.props.children || !userIds.length) return value;

            const messageContent = value.props.children;
            // Assuming messageContent is an array of message parts
            messageContent.forEach(part => {
                if (part.props && part.props.className && part.props.className.includes("mention")) {
                    const userId = part.props.href && part.props.href.split("/").pop();
                    if (userIds.includes(userId)) {
                        part.props.style = { ...part.props.style, color: "red", fontWeight: "bold" }; // Customize your highlight style here
                    }
                }
            });

            return value;
        });
    }

    getSettingsPanel() {
        const panel = document.createElement("div");
        const userIdInput = document.createElement("input");
        userIdInput.type = "text";
        userIdInput.placeholder = "User ID to highlight";
        const addButton = document.createElement("button");
        addButton.innerText = "Add User";
        addButton.onclick = () => {
            if (userIdInput.value && !this.settings.userIds.includes(userIdInput.value)) {
                this.settings.userIds.push(userIdInput.value);
                this.saveSettings();
                userIdInput.value = "";
                alert("User added.");
            }
        };
        panel.appendChild(userIdInput);
        panel.appendChild(addButton);
        return panel;
    }
}

module.exports = UserHighlighter;
