# Freedom Agent Kit

<!-- freedom-repository-guide:start -->
## 在自由工坊的位置

[自由工坊](https://freetwai.com) 讓會員先完成定位、選擇公會並領取 Repo 技能書，再以供貨、商店、開源作品、行銷與小隊共同完成成果。

讓不同 AI 工具使用同一份平台協定與會員狀態入口。 已提供 pinned client/protocol 匯出、本機示範狀態 CLI 及 adapter 說明。

真正的 Agent device flow、ExecutionGrant 與可執行 MCP server 尚未實作；會員客戶端的讀取授權不等同 Agent 執行權。

本 repo 的維護者負責「讓不同 AI 工具使用同一份平台協定與會員狀態入口。」這個模組；公會職稱與自填 GitHub slug 不授予寫入權。

程式／內容入口：[src/cli.mjs](src/cli.mjs)、[packages/client/](packages/client/)、[packages/protocol/](packages/protocol/)、[adapters/](adapters/)、[mcp/freedom-work-server/](mcp/freedom-work-server/)。協作先讀 [CONTRIBUTING.md](CONTRIBUTING.md)，讓 Agent 讀 [AGENTS.md](AGENTS.md)；從[本倉 Issues](https://github.com/FreeTWAI-AI/freedom-agent-kit/issues)認領、[查看既有 PR](https://github.com/FreeTWAI-AI/freedom-agent-kit/pulls)避免重工。

只消費 freedom-platform 的固定協定，不建立第二份任務／會員資料庫。不把本機 demo 登入拿到公開站，也不讓 agent 取得使用者 cookie 或擴權。 跨 repo 的協定由[中央平台](https://github.com/FreeTWAI-AI/freedom-platform)維護。
<!-- freedom-repository-guide:end -->

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
