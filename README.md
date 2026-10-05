# Freedom Agent Kit

<!-- freedom-repository-guide:start -->
## 在自由工坊的位置

[自由工坊](https://freetwai.com) 讓會員先選擇公會並領取 Repo 技能書（定位測驗可稍後補做），再以供貨、商店、開源作品、行銷與小隊共同完成成果。

讓不同 AI 工具使用同一份平台協定與會員狀態入口。 已提供 pinned client/protocol 匯出、本機示範狀態 CLI 及 adapter 說明。

候選 device CLI 已接共用記憶體內 bootstrap SDK，等待真人另外批准後可讀裝置狀態；短效 ExecutionGrant、可執行 MCP server、持久重連及正式雲端驗收仍未完成。會員讀取與 bootstrap 狀態權限都不等同 Agent 執行權。

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

上例只允許明確的本機示範帳號。會讀取會員狀態後登出；不輸出 cookie／CSRF、不认領工作、不發出付款或外部動作。不能拿此 demo 登入方法繞過 Cloudflare Access。新的 sessionless device bootstrap 請見下節；ExecutionGrant、MCP server 與持久重連仍待實作。

`packages/client`／`packages/protocol` 只重新匯出 `vendor/freedom-platform` 的固定版本。`contracts.lock.json` 記錄來源 SHA 與 bundle digest；用 `node scripts/verify-contracts.mjs --remote` 核對。

供應協定與變更都在 [freedom-platform](https://github.com/FreeTWAI-AI/freedom-platform)；不要在此手改 vendor。不同 AI 工具消費相同 DTO，不各建任務真相。

程式碼授權尚未指定（manifest 為 NOASSERTION）；公開 source 不代表已授予額外授權。

## Shared member workspace

`src/index.mjs` now imports the central member-workspace implementation from `vendor/freedom-libraries`. It executes the existing five preview read operations and excludes the session envelope. The preview contract pin and bundle remain unchanged. `consumer-libraries.lock.json` records the separate exact source commit and bytes; this lock does not approve a release or prove runtime coverage.

Verify against an independently selected source commit before publishing:

```sh
node scripts/verify-consumer-libraries.mjs FreeTWAI-AI/freedom-agent-kit EXPECTED_PLATFORM_SHA --source-root /path/to/freedom-platform --profile agent-kit-device-v1
```

Once that exact source is publicly available, `--remote` can replace `--source-root /path/to/freedom-platform`. Local source checks use committed Git objects, not uncommitted working-tree files.

## Device bootstrap candidate

```sh
npm run device:status -- https://platform.example.invalid local registered-client-id
```

Use an operator-provided exact HTTPS origin, environment (`local`, `staging-next`, or `next`) and registered client ID; the example host is synthetic. The CLI displays a public user code and verification URI for separate member approval, pairs, rotates once and reads `bootstrap.status.read`. It does not log in as a member, run a model or change Work/Result. Never pass member cookies, tokens or provider credentials as arguments.

The canonical `agent-kit-device-v1` export adds the shared device SDK while retaining member-workspace and the separate preview contract pin. Library source `491a0d5321b1a23d186778862a799f5048224ce8` is a review candidate, not an installed trust approval. Existing native hosts intentionally require a reviewed source/profile upgrade before accepting this consumer.

Keys and bootstrap credentials live only in memory. Closing or restarting requires fresh pairing; an uncertain enrollment or refresh response is not retried. Cloud rollout, a packaged executable runtime gate, durable custody/reconnect, ExecutionGrant/Attempt and full private execution remain open.
