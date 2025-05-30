# 龍舟慶功宴感言牆

這是一個簡單的網頁應用，專為龍舟慶功宴設計，讓團隊成員可以用自己的母語分享比賽感言，並自動翻譯成中文、英文和日文三種語言。所有人都可以瀏覽和點讚感言。

## 功能

- 使用者可以輸入姓名和感言
- 感言會自動翻譯成中文、英文和日文
- 所有感言以卡片形式顯示，可切換語言查看
- 使用者可以為感言點讚
- 不需要註冊登入
- 完全免費使用

## 如何使用

### 本地瀏覽

1. 下載這個專案的所有檔案
2. 在瀏覽器中開啟 `index.html` 檔案

### 在線部署 (使用 GitHub Pages)

1. 在 GitHub 上創建一個新倉庫
2. 上傳所有檔案到該倉庫
3. 前往倉庫設定 > Pages > 選擇 main 分支作為來源 > Save
4. 幾分鐘後，您的網站將在 `https://[您的用戶名].github.io/[倉庫名]` 上線

## 技術說明

- 前端：HTML, CSS, JavaScript
- 資料庫：Firebase Realtime Database
- 翻譯：LibreTranslate API

## 注意事項

- Firebase 配置已經包含在 `app.js` 檔案中，可直接使用
- LibreTranslate API 有使用限制，如果遇到翻譯問題，可能需要等待一段時間或考慮使用其他翻譯 API

## 離線使用說明

如果活動場地沒有網絡連接，您可以：

1. 預先在有網絡的環境下載入網頁
2. 進入活動場地後，創建臨時 Wi-Fi 熱點連接所有設備
3. 一個設備運行網頁伺服器，其他設備通過熱點連接

## 授權

MIT 授權 - 歡迎自由使用和修改 