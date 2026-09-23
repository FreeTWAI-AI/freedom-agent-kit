# Freedom Agent Kit

共用 Platform protocol 與可供不同 AI CLI 呼叫的會員狀態工具。中央會員、工作、定位、公會都由 `freedom-platform` 保存；此 repo 沒有另一個資料庫。

```sh
npm ci
npm test
node src/cli.mjs http://127.0.0.1:4310/api/v1 maker
```

上例只允許明確的本機示範帳號。會讀取會員狀態後登出；不輸出 cookie／CSRF、不认領工作、不發出付款或外部動作。不能拿此 demo 登入方法繞過 Cloudflare Access。真實 Agent device flow、短效 ExecutionGrant、MCP server 仍待實作。

`packages/client`／`packages/protocol` 只重新匯出 `vendor/freedom-platform` 的固定版本。`contracts.lock.json` 記錄來源 SHA 與 bundle digest；用 `node scripts/verify-contracts.mjs --remote` 核對。

供應協定與變更都在 [freedom-platform](https://github.com/FreeTWAI-AI/freedom-platform)；不要在此手改 vendor。不同 AI 工具消費相同 DTO，不各建任務真相。

程式碼授權尚未指定（manifest 為 NOASSERTION）；公開 source 不代表已授予額外授權。
