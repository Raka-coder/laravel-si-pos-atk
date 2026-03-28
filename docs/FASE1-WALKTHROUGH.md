# FASE 1: Foundation - Walkthrough

## Overview

FASE 1 bertujuan untuk membangun fondasi aplikasi dengan fitur dasar:

- ✅ Authentication (Fortify)
- ✅ CRUD Categories
- ✅ CRUD Units
- ✅ CRUD Products
- ✅ Dashboard dengan statistik

---

## Tech Stack yang Digunakan

| Layer    | Technology               |
| -------- | ------------------------ |
| Backend  | Laravel 13               |
| Frontend | React 19 + Inertia.js v3 |
| Styling  | Tailwind CSS v4          |
| Auth     | Laravel Fortify          |
| Database | MySQL/MariaDB            |

---

## Struktur Project

```
example-app/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Category/
│   │   │   │   └── CategoryController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── Product/
│   │   │   │   └── ProductController.php
│   │   │   └── Unit/
│   │   │       └── UnitController.php
│   │   └── Requests/
│   │       ├── Category/
│   │       ├── Product/
│   │       └── Unit/
│   └── Models/
│       ├── Category.php
│       ├── Product.php
│       └── Unit.php
├── database/
│   ├── factories/
│   └── migrations/
├── resources/
│   └── js/
│       └── pages/
│           ├── category/index.tsx
│           ├── product/index.tsx
│           ├── unit/index.tsx
│           └── dashboard.tsx
└── routes/web.php
```

---

## Cara Menjalankan Project

### 1. Setup Awal

```bash
# Clone atau navigasi ke project
cd example-app

# Install dependencies
composer install
npm install
```

### 2. Konfigurasi Database

Edit file `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Setup Database

```bash
# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate
```

### 4. Jalankan Development Server

```bash
# Terminal 1 - Backend
php artisan serve

# Terminal 2 - Frontend
npm run dev
```

### 5. Akses Aplikasi

Buka browser: `http://localhost:8000`

1. Register akun baru atau login
2. Setelah login, akan redirect ke `/dashboard`
3. Akses menu sidebar untuk:
    - **Products** - `/products`
    - **Categories** - `/categories`
    - **Units** - `/units`

---

## Fitur yang Diimplementasikan

### 1. Authentication (Fortify)

- Login/Register dengan email & password
- Email verification
- Two-factor authentication (opsional)
- Password reset

**Routes:**

- `GET /login` - Login page
- `POST /login` - Handle login
- `GET /register` - Registration page
- `POST /register` - Handle registration
- `POST /logout` - Logout

### 2. Categories Management

**Database Table:** `categories`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar(100) | Category name |
| created_at | timestamp | Created timestamp |
| updated_at | timestamp | Updated timestamp |

**Routes:**
| Method | URI | Action |
|--------|-----|--------|
| GET | /categories | categories.index |
| POST | /categories | categories.store |
| PUT/PATCH | /categories/{category} | categories.update |
| DELETE | /categories/{category} | categories.destroy |

**Features:**

- List all categories
- Add new category (modal)
- Edit category (modal)
- Delete category (modal)

### 3. Units Management

**Database Table:** `units`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar(50) | Unit name (e.g., Pieces) |
| short_name | varchar(10) | Short name (e.g., pcs) |
| created_at | timestamp | Created timestamp |
| updated_at | timestamp | Updated timestamp |

**Routes:**
| Method | URI | Action |
|--------|-----|--------|
| GET | /units | units.index |
| POST | /units | units.store |
| PUT/PATCH | /units/{unit} | units.update |
| DELETE | /units/{unit} | units.destroy |

### 4. Products Management

**Database Table:** `products`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| barcode | varchar(50) | Unique product barcode |
| name | varchar(255) | Product name |
| buy_price | decimal(12,2) | Purchase price |
| sell_price | decimal(12,2) | Selling price |
| stock | int | Current stock quantity |
| min_stock | int | Minimum stock threshold |
| image | varchar(255) | Product image path |
| is_active | boolean | Active status |
| category_id | bigint | Foreign key to categories |
| unit_id | bigint | Foreign key to units |
| created_at | timestamp | Created timestamp |
| updated_at | timestamp | Updated timestamp |

**Indexes:**

- `barcode` (unique)
- `category_id`
- `is_active`
- `name`

**Routes:**
| Method | URI | Action |
|--------|-----|--------|
| GET | /products | products.index |
| POST | /products | products.store |
| GET | /products/barcode/{barcode} | products.byBarcode |
| PUT/PATCH | /products/{product} | products.update |
| DELETE | /products/{product} | products.destroy |

### 5. Dashboard

Menampilkan statistik:

- Total Products
- Total Categories
- Total Units
- Low Stock Products (di bawah min_stock)
- Active Products

Quick actions untuk navigasi cepat ke masing-masing halaman.

---

## Frontend Patterns

### Modal CRUD

Semua halaman menggunakan pattern modal CRUD dengan:

1. **Dialog component** dari Radix UI
2. **useForm** dari @inertiajs/react untuk form handling
3. **State management** lokal dengan useState

```tsx
const [isOpen, setIsOpen] = useState(false);
const [editItem, setEditItem] = useState<Item | null>(null);

const form = useForm({ name: '' });

const handleCreate = () => {
    form.post('/items', {
        onSuccess: () => {
            form.reset();
            setIsOpen(false);
        },
    });
};
```

### Breadcrumbs

Setiap page mendefinisikan breadcrumbs:

```tsx
PageName.layout = {
    breadcrumbs: [
        {
            title: 'Page Title',
            href: '/page-url',
        },
    ],
} satisfies BreadcrumbItem[];
```

---

## API Reference

### Product by Barcode

```http
GET /products/barcode/{barcode}
```

**Response:**

```json
{
    "id": 1,
    "barcode": "1234567890123",
    "name": "Product Name",
    "buy_price": "5000.00",
    "sell_price": "7500.00",
    "stock": 100,
    "min_stock": 10,
    "is_active": true,
    "category": { "id": 1, "name": "Category Name" },
    "unit": { "id": 1, "name": "Pieces", "short_name": "pcs" }
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (show error)
- [ ] Create new category
- [ ] Edit existing category
- [ ] Delete category
- [ ] Create new unit
- [ ] Edit existing unit
- [ ] Delete unit
- [ ] Create new product
- [ ] Edit existing product
- [ ] Delete product
- [ ] View dashboard stats
- [ ] Low stock warning display

---

## Next Steps

FASE 1 selesai. Lanjut ke **FASE 2: Core Transaction**:

- POS Interface (kasir)
- Cart functionality
- Cash checkout
- Receipt generation
- Transaction history

---

## Catatan

- TypeScript errors di IDE tidak 影响 fungsi - hanya type constraint warning
- Image upload sudah di-setup tapi belum diimplementasi di UI
- Untuk testing, bisa gunakan seeding:
    ```bash
    php artisan db:seed
    ```
