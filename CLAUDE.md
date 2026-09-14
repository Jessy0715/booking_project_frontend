# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案定位

自然光攝影棚預約系統（前端）。使用者可瀏覽場地、預約時段、查看自己的預約紀錄；管理員可審核預約申請。後端為獨立的 Spring Boot 專案，API 文件見 `src/docs/api-contract.md`（gitignored）。

## 常用指令

```bash
npm start              # 啟動開發伺服器 http://localhost:3000
npm run build          # 生產版本打包
npm test               # 執行測試（watch mode）
npm run generate-api   # 從 openapi.yaml 重新生成 RTK Query hooks
npx tsc --noEmit       # TypeScript 型別檢查（不輸出檔案）
```

### 重新生成 API hooks
後端 API 有變動時執行（需後端在 port 8088 運行中）：
```bash
npm run generate-api
```
此指令從 `http://localhost:8088/v3/api-docs` 抓最新 spec，輸出至 `src/services/bookingApi.generated.ts`。**不要手動編輯 generated 檔案**。

## 模組化目錄結構

```
src/
├── assets/                        # 靜態圖片、頭像
├── components/                    # 跨頁面共用 UI 元件（多頁面才搬來）
│   ├── Header/
│   └── RentCalendar/
├── constants/                     # 全域共用常數
├── features/                      # Redux Toolkit slice（純 client-side 狀態）
│   └── auth/
│       └── authSlice.ts           # token / userId / role / isLoggedIn
├── hooks/                         # 共用 custom hooks
│   └── useBreakpoint.js
├── pages/                         # 路由頁面元件（薄層，只負責組合）
│   ├── login/
│   ├── register/
│   ├── roomInfo/
│   │   └── components/            # roomInfo 專屬子元件（不跨頁使用）
│   ├── roomReserve/
│   ├── myBookings/
│   └── admin/
├── services/                      # RTK Query API 層（server state）
│   ├── emptyApi.ts                # base createApi，含 JWT Bearer header
│   └── bookingApi.generated.ts    # codegen 自動產生，禁止手動編輯
├── styles/                        # 全域樣式與 design tokens
├── types/                         # 全域共用型別（補充 generated types 之外）
├── utils/                         # 共用工具函式（純函式，不依賴 React）
├── App.js                         # useRoutes 掛載路由
├── routes.js                      # 路由表
├── store.ts                       # Redux store（含 RTK Query middleware）
└── index.js                       # 入口，<Provider> 包在最外層
```

**分層規則：**
- `services/` 只管 API 呼叫與 server state cache，不放 UI 或 client state
- `features/auth/` 是唯一管理 JWT token 和 user role 的地方
- `pages/*/components/` 只放該頁面專屬的子元件；會被多頁共用才移至 `components/`
- `hooks/` 封裝可重用的狀態邏輯（可包裝 RTK Query hooks）

## 檔案命名規則

**核心原則：只有「會輸出 JSX 的 React 元件」用 PascalCase，其餘一律 camelCase。**

| 檔案類型 | 命名格式 | 範例 |
|---------|---------|------|
| React 元件（含 styled-components） | PascalCase | `RoomCard.js`、`BookingModal.js` |
| 頁面 / 資料夾入口 | 固定為 `index.js` | `pages/login/index.js` |
| 資料夾名稱 | camelCase | `roomInfo/`、`myBookings/` |
| Custom hook | camelCase，`use` 開頭 | `useAuth.ts`、`useBreakpoint.js` |
| Redux slice | camelCase + `Slice` 結尾 | `authSlice.ts` |
| RTK Query base API | camelCase + `Api` 結尾 | `emptyApi.ts` |
| Codegen 產生的 API | camelCase + `.generated.ts` | `bookingApi.generated.ts` |
| Constants 檔案 | camelCase，描述所屬領域 | `bookingStatus.ts`、`timeSlots.ts` |
| Types 檔案 | camelCase + `.types.ts` 結尾 | `auth.types.ts`、`room.types.ts` |
| Utils 檔案 | camelCase，描述用途 | `formatDate.ts`、`storageUtils.ts` |
| CSS 檔案 | camelCase | `tokens.css`、`index.css` |
| 測試檔案 | 與被測檔案同名 + `.test.js` | `RoomCard.test.js` |

Feature / page 資料夾內的 co-located 檔案，用**簡短的通用名**即可（資料夾已提供 context）：

```
pages/roomInfo/
├── index.js
├── constants.js        ← 不用 roomInfoConstants.js
├── utils.js            ← 不用 roomInfoUtils.js
└── components/
    └── RoomCard.js
```

頂層 `src/constants/`、`src/utils/`、`src/types/` 的檔案因為失去資料夾 context，**必須在名稱中帶入領域語意**（如 `bookingStatus.ts`，而非 `status.ts`）。

**constants / types / utils 歸類原則：**

先共置（co-locate），只有「跨功能共用」才升到頂層目錄。

| 情境 | 放哪裡 |
|------|--------|
| 某個常數只在 `roomInfo` 頁面用 | `pages/roomInfo/constants.js` |
| 多個頁面都用到同一組 enum 值 | `src/constants/` |
| 某個型別只在 auth feature 用 | `features/auth/types.ts` |
| 多個 feature 共用的型別（非 generated） | `src/types/` |
| 某個格式化函式只在 myBookings 用 | `pages/myBookings/utils.js` |
| 多個頁面都用到的日期、格式化工具 | `src/utils/` |

**注意**：`services/bookingApi.generated.ts` 已匯出完整的 API response 型別（`Room`、`Booking`、`Pagination` 等），這些直接從 generated 檔案 import，**不要重複定義到 `src/types/`**。

## 技術棧

- **框架**: React 18 + Create React App（透過 `react-app-rewired` 擴充）
- **UI**: MUI v5（主要）、Ant Design v5（部分元件）、styled-components v6
- **狀態管理**: Redux Toolkit + RTK Query
- **路由**: React Router DOM v6（`useRoutes` 風格）
- **日期**: dayjs（優先使用）、react-big-calendar
- **語言**: 既有元件為 JS；`services/`、`features/` 新檔案用 TS
- **Webpack alias**: `@` 對應 `src/`（可用 `@/components/...`）

## 後端 API

- **Base URL**: `http://localhost:8088`（設定於 `.env.local` 的 `REACT_APP_API_URL`）
- **認證**: JWT，token 存於 `localStorage('token')`，由 `emptyApi.ts` 自動加入 `Authorization: Bearer` header
- **回應格式**: 所有端點統一包裝為 `{ success: boolean, data: ... }`；列表另有 `pagination` 欄位

### API 合約重要細節（串接時注意）

| 欄位 | 說明 |
|------|------|
| `booking_date` | Bookings 的日期欄位（非 `date`，PostgreSQL 保留字） |
| `price.morning/afternoon/night` | 型別為 **String**（如 `"2000"`），非 number |
| `facilities` | Array of strings（後端從 DB 逗號字串轉換） |
| `timeSlot` | `"morning"` \| `"afternoon"` \| `"night"` |
| `status` | `"pending"` \| `"approved"` \| `"rejected"` |

### 狀態機限制（前端需對應）

- `DELETE /api/bookings/{id}`（取消）：後端有 owner check，非本人取消 → 403
- `PATCH /api/bookings/{id}`（審核）：後端只允許審核 `pending` 狀態的預約；admin 頁面需 disable 非 pending 的操作

## RTK Query 使用方式

```js
import {
  useGetRoomsQuery,
  useLoginMutation,
  useCreateBookingMutation,
  // ... 其他 hooks
} from '@/services/bookingApi.generated'

// Query
const { data, isLoading, isError } = useGetRoomsQuery({ page: 1, pageSize: 5 })
// data 的型別為 { success: boolean, data: Room[], pagination: Pagination }

// Mutation
const [login, { isLoading }] = useLoginMutation()
await login({ account, password }).unwrap()
```

