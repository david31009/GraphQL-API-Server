# GraphQL-API-Server

1. 請使用 Node.js + Typescript + apollo-server (`https://github.com/apollographql/apollo-server`) 架設 GraphQL Server
   1. 使用 Typescript 撰寫時必須使用精確的型別名稱，不可用 `any` 型別
2. 建立使用者資料。直接儲存成 `.json` 格式即可不需要使用資料庫。使用者欄位如下:
   1. 帳號
   2. 密碼 (不可以用明碼儲存)
   3. 姓名
   4. 生日
3. 實作兩支 GraphQL API
   1. `login()`: 以使用者帳號及密碼進行登入並取得 JWT token
   2. `me()`: 從 HTTP 標頭 `Authorization` 取得 JWT token 確認使用者身份後，回傳當前的使用者資料
   3. 可以利用 `apollo-server` 提供的 playground 進行 API 測試

## Table of Contents

- [程式啟動方式](#程式啟動方式)
- [程式架構](#程式架構)
- [api 的規格與範例](#api的規格與範例)
- [整個過程的研究心得](#整個過程的研究心得)

## 程式啟動方式

- 於 terminal 輸入 `npm start`，即可啟動 server，程式首先會 compile index.ts 檔，接著利用 nodemon 監控 index.js 的變動。

## 程式架構

- 後端 Schema 定義 GraphQL API 的輪廓及規範，供前端查詢
- 後端 Resolver 負責資料取得的實作
- 後端於 Node.js 環境架設 apollo-server
- 前端根據 GraphQL Schema 中的定義，查詢、修改所需要的資料，其 API 只有一個 endpoint

<div align="center">
<img width="90%" alt="System Architecture" src="https://i.imgur.com/oy7TMAH.png"/>
</div>

## api 的規格與範例

1. login() API

   - Schema: 當有 login request 時，參數正確輸入帳號、密碼，登入成功後回傳 JWT Token

     ```
     type Token {
        token: String!
     }

     type Mutation {
         login(account: String, password: String): Token
     }
     ```

   - playground 測試

     (1) mutation

     ```
     mutation ($account: String, $password: String) {
       login(account: $account, password: $password) {
         token
       }
     }
     ```

     (2) variables: 正確輸入參數，包含帳號、密碼

     ```
     {
        "account": "lisa@gmail.com",
        "password": "......"
     }
     ```

     (3) 正確回覆

     ```
     {
        "data": {
            "login": {
                "token": "..."
            }
        }
     }
     ```

     (4) 錯誤處理 1: account 不存在

     ```
     "errors": [
         {
             "message": "Account Not Exists"
         },
     ]
     ```

     (5) 錯誤處理 2: 密碼錯誤

     ```
     "errors": [
         {
             "message": "Wrong Password"
         },
     ]
     ```

2. me() API

   - Schema: 從 HTTP 標頭 `Authorization` 取得 JWT token 確認使用者身份，當有 me request 時，回傳當前使用者資料 (type me)，可包含帳號、姓名、生日

     ```
     type me {
        account: String
        name: String
        birthday: String
     }

     type Query {
        me: me
     }
     ```

   - playground 測試

     (1) query

     ```
     query {
        me {
            account
            name
            birthday
        }
     }
     ```

     (2) headers

     ```
     "Authorization": "...(JWT Token)"
     ```

     (3) 正確回覆

     ```
     {
        "data": {
            "me": {
                "account": "lisa@gmail.com",
                "name": "Lisa",
                "birthday": "840101"
            }
        }
     }
     ```

     (4) 錯誤處理 1: Wrong Token

     ```
     "errors": [
        {
            "message": "Context creation failed: Wrong Token."
        },...
     ]
     ```

     (5) 錯誤處理 2: No Token，回傳空 {}

     ```
     {
        "data": {
            "me": {
            "account": null,
            "name": null,
            "birthday": null
            }
        }
     }
     ```

## 整個過程的研究心得

- 了解如何使用 Node.js 環境架設 apollo-server (參考官方文件)。
  - 安裝 `graphql` 套件: 操作 GraphQL 的規範架構、演算法等。
  - 安裝 `@apollo/server` 套件: 控制 apollo-server，快速建立 GraphQl API 的工具，可將 http request 轉換為 GraphQL 的請求
- 使用 TypeScript 來撰寫，且由 tsconfig.json 定義如何將 ts 檔編譯成 js 檔。
- 監控 ts 及 js 的變動: 編輯 package.json 中的 scripts，新增 "start": "tsc -w & nodemon -q -w dist dist/index.js"，可以監控 ts 檔的變動，即時編譯，且用 nodemon 監控 js 檔的變動。
  - tsc -w: 當儲存 ts 檔時，即時編譯
  - -q: run in quiet mode
  - -w: 用 nodemon 監控 (watch) index.js 檔
- 拆出 schema, resolver, 及 json 檔: 利用 fs 套件，讀取 schema.graphql 及 data.json，並將 resolvers.js 由 index.ts 引入。
- 了解何謂 GraphQL?
  - 是一種為 API 設計的資料查詢 (新增、修改、刪除) 的語言，
    使得 client 端可以使用更彈性的語法來取得或修改資料。
  - 可透過 Query 的語法，取得資料，且只需要一個 API endpoint。
  - Schema: 定義 GraphQL API 的輪廓及規範，Client Side 只要輸入合法的 Query，就可以獲得所需的資料。
    - Object Type: 是 GraphQL 的基本元件，定義 Front End 可以從 Server 得到什麼類型的資料。
    - 特殊型別: Query, Mutation: 定義了 Entry Point，也就是前端請求的接口。
      - Query: 對資料進行讀的接口，應用於讀取資料時。
      - Mutation: 對資料進行寫的接口，當需要對資料進行新增、修改等操作。
  - Resolver: 基於 Schema 的設計來完成資料取得和計算的任務。
