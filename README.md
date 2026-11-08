# 練習簿｜私人健身紀錄 PWA

一個 local-first、適合 iPhone 使用的繁體中文健身紀錄工具。

日常選單設有 10 套健身室器械 Programme，涵蓋全身及指定部位。動作附中英文名稱和訓練部位，可按器械使用情況切換同部位替代動作，組數紀錄會保留。舊計劃的歷史紀錄仍可在月曆查看及編輯。介面採用 After Hours 深色設計。

## 私隱

- 訓練紀錄只會儲存在目前裝置的瀏覽器 `localStorage`。
- 專案沒有帳戶、後端、分析追蹤或自動雲端同步。
- Repository 只包含程式碼與預設訓練計劃，不包含個人訓練紀錄。
- 清除 Safari 網站資料、移除 App 或更換裝置可能令資料遺失，請定期在「設定」匯出 JSON 備份。

## 本機測試

```bash
npm test
```

可用任何靜態 HTTP server 預覽；Service Worker 不會在 `file://` 下註冊。

## GitHub Pages

Repository 的 Pages 設定使用 `main` branch 的 `/(root)`。預計網址：

<https://kakakevin91-eng.github.io/My-fitness/>

在 iPhone Safari 開啟網址，按「分享」→「加入主畫面」。
