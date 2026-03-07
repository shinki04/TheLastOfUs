# The Last - Hướng Dẫn Tổ Chức & Cài Đặt Hệ Thống

Dự án **The Last** là một hệ thống mạng xã hội/chia sẻ nội dung hiện đại, được xây dựng theo kiến trúc **Monorepo** với **Turborepo**. Hệ thống sử dụng Next.js (App Router) cho phần Giao diện, Supabase cho quản trị CSDL & Backend Service, cùng với các thành phần caching/messaging mạnh mẽ như Redis và RabbitMQ.

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

- **Ngôn ngữ:** TypeScript (Node.js >= 20.x)
- **Kiến trúc:** Turborepo (Monorepo)
- **Quản lý Package:** `pnpm` (v10.x)
- **Frontend / Client App:** Next.js 16 (React 19), Tailwind CSS v4, Framer Motion, GSAP, Radix UI.
- **State & Data Fetching:** Zustand, TanStack Query.
- **Backend & Cơ sở dữ liệu:** Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Message Broker & Caching:** RabbitMQ, Redis.

---

## 📋 Yêu Cầu Hệ Thống Trước Khi Cài Đặt (Prerequisites)

Hãy đảm bảo máy tính của bạn đã được cài đặt các công cụ sau:
1. **Node.js** (Phiên bản `>= 20.x` được khuyên dùng).
2. **pnpm** (Phiên bản `10.27.0`): `npm install -g pnpm@10.27.0`
3. **Turborepo CLI** (Quản lý các Package trong kiến trúc Monorepo): `npm install -g turbo`
4. **Môi trường Database & Caching**: 
   - Hệ thống được thiết kế linh hoạt. Đối với thiết lập qua dịch vụ Cloud: Bạn cần chuẩn bị sẵn tài khoản **Supabase Cloud** (Database), **Upstash** (Redis) và **CloudAMQP** (RabbitMQ).
   - *Hoặc nếu muốn chạy dự án Local hoàn toàn giả lập:* Bạn sẽ cần cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/) và công cụ dòng lệnh [Supabase CLI](https://supabase.com/docs/guides/cli): `npm install -g supabase`.

---

## ⚙️ Hướng Dẫn Cài Đặt (Step-by-Step Installation)

### Bước 1: Clone dự án và cài đặt Dependencies

Mở Terminal và thực thi các lệnh sau:

```bash
# Clone dự án từ Github (thay thế URL git của bạn)
git clone <repository-url>

# Truy cập vào thư mục dự án
cd the-last

# Cài đặt toàn bộ các packages cho workspace (sử dụng pnpm)
pnpm install
```

### Bước 2: Cấu Hình Biến Môi Trường (Environment Variables)

Hệ thống cung cấp sẵn file `env.local.example`. Bạn cần tạo một bản sao để ứng dụng có thể đọc cấu hình.

```bash
# Copy file mẫu thành file cấu hình môi trường thực tế
cp env.local.example .env.local
```

👉 **Sau đó, mở file `.env.local` và tiến hành thêm URL/Key:**

- **Thiết lập với Cloud (Upstash, CloudAMQP, Supabase Cloud):** 
  Lấy URL kết nối của Redis (`REDIS_URL`) từ **Upstash** và AMQP (`RABBITMQ_URL`) từ **CloudAMQP**, cùng với key cấu hình lấy từ Project API Settings của **Supabase** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) dán vào cấu hình file môi trường của bạn.
- *Thiết lập với Docker Local:* 
  Giữ nguyên các giá trị ban đầu, dự án được set sẵn kết nối qua Docker Local (`redis://localhost:6379`, `amqp://guest:guest@localhost:5672`).

### Bước 3: Đẩy cấu trúc Database lên Supabase Cloud

Bởi vì Redis và RabbitMQ đã chạy trực tiếp trên Upstash và CloudAMQP dưới dạng serverless, bạn không cần cài đặt chúng về máy nữa. Điều cần thiết duy nhất là đẩy cấu trúc DB vào trong Supabase Cloud.

**Trường hợp dùng Docker (Local)**

```bash
# 1. Liên kết dự án lấy cấu hình thông qua Reference ID trên Supabase Cloud của bạn
npx supabase link --project-ref <mã-project-trên-supabase-của-bạn>

# 2. Đồng bộ/Đẩy cấu trúc Database Schema từ máy lên Cloud
npx supabase db push
```

#### Tùy chọn giả lập khi chạy bằng Local Docker:
*Lưu ý: Bạn được quyền bỏ qua bước này nếu bạn đã dùng Upstash và CloudAMQP.*

Chỉ thực hiện khi dùng Docker Desktop cho RabbitMQ và Caching.

```bash
# 1. Khởi chạy RabbitMQ và Redis
docker-compose up -d

# 2. Khởi tạo Database Supabase và bảng vào local
npx supabase start
```
> **Lưu ý**: Lệnh `start` của Supabase giúp mô phỏng Table/RPC và tự đưa vào dữ liệu mồi (`supabase/seed.sql`). Nếu dùng Cloud ở phía trên, bạn có thể tự mình chạy thủ công seed data thông qua SQL Editor trên Dashboard web của Supabase.

### Bước 4: Thiết lập Microsoft Entra ID (Dùng cho Supabase Auth)

Hệ thống có tích hợp đăng nhập qua Microsoft. Bạn cần thiết lập Microsoft Entra ID (trước đây là Azure AD) để có thể xác thực người dùng.

1. **Đăng nhập vào Azure Portal** ([https://portal.azure.com/](https://portal.azure.com/)).
2. Mở dịch vụ **Microsoft Entra ID** và chọn **App registrations** > **New registration**.
3. Đặt tên hiển thị cho ứng dụng. Tại phần **Redirect URI**, chọn loại **Web** và nhập địa chỉ callback của Supabase:
   - Nếu chạy Local/Docker: `http://localhost:54321/auth/v1/callback`
   - Nếu chạy qua Supabase Cloud: `https://<mã-project-trên-supabase-của-bạn>.supabase.co/auth/v1/callback`
4. Lấy **Application (client) ID** tại màn hình Overview của app vừa tạo.
5. Vào menu **Certificates & secrets**, tạo một **New client secret** mới và copy lại `Value` (đây là Secret Key, chỉ hiện một lần).
6. **Mở Supabase Dashboard** (Local Studio hoặc Cloud), vào **Authentication** > **Providers** > Bật **Azure** và dán Client ID cùng Client Secret vào, sau đó Save lại.

---

## 💻 Chạy Ứng Dụng (Running the Application)

Với hệ thống Turborepo, bạn chỉ cần thực hiện 1 lệnh đơn giản ở thư mục gốc (root) để khởi động toàn bộ môi trường phát triển:

```bash
pnpm dev
```
- Lệnh này sẽ kích hoạt `next dev` tại `apps/web`.
- Giao diện của Next.js sẽ khởi chạy mặc định tại: **http://localhost:3000**
- Trong lúc code, bạn có thể chỉnh sửa tại `apps/web/app/`. Hệ thống sẽ tự động Hot Reload.

### 🛠 Các Lệnh Khác Trong Root (Useful Commands)

| Lệnh | Mô tả |
| :--- | :--- |
| `pnpm build` | Build toàn bộ các app và packages để chuẩn bị production. |
| `pnpm dev` | Khởi chạy môi trường Dev cho tất cả ứng dụng. |
| `pnpm lint` | Kiểm tra cú pháp, lỗi code với ESLint trên toàn hệ thống. |
| `pnpm format` | Tự động fix lỗi format cho các file `.ts, .tsx, .md`. |
| `pnpm check-types` | Kiểm tra lỗi TypeScript trên toàn bộ các workspace. |
| `pnpm --filter @repo/web dev:all` | Khởi chạy Next.js cùng với Post Worker (nằm ở apps/web). |

---

## 📁 Cấu Trúc Thư Mục (Folder Structure)

Kiến trúc monorepo phân tách chức năng thành các phần rõ ràng:

```text
the-last/
├── apps/
│   ├── web/           # Ứng dụng Frontend chính dành cho người dùng (Next.js 16)
│   ├── admin/         # Ứng dụng Quản trị nội bộ / Dashboard (Next.js)
│   └── workers/       # Background Worker xử lý hàng đợi (RabbitMQ, HF_TOKEN...)
├── packages/          # Các thư viện dùng chung cho toàn bộ dự án
│   ├── eslint-config/ # Cấu hình ESLint chung
│   ├── rabbitmq/      # Cấu hình & Client RabbitMQ
│   ├── redis/         # Cấu hình & Client Redis
│   ├── shared/        # Nơi chứa Types (TypeScript), Interface dùng chung
│   ├── supabase/      # Cấu hình Database Supabase Client/Server
│   ├── typescript-config/ # Cấu hình TS config
│   ├── ui/            # UI Component Library (Tailwind, Radix UI)
│   └── utils/         # Các utility helper functions
├── supabase/          # Backend configuration: Migrations, Seed, Edge Functions
├── docker-compose.yml # File chạy RabbitMQ & Redis nội bộ
└── turbo.json         # Cấu hình orchestration của Turborepo
```

---

## 📚 Tác Giả & Hỗ Trợ

Nếu gặp sự cố trong lúc cài đặt môi trường, vui lòng kiểm tra lại cấu hình Docker và tham khảo trực tiếp [Tài liệu Turborepo](https://turborepo.dev/docs), [Tài liệu Next.js](https://nextjs.org/docs) và [Tài liệu Supabase](https://supabase.com/docs). Mọi đóng góp xin vui lòng tạo Pull Request vào nhánh chính! 🎉
