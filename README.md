# Donatay Client

Локальный frontend для проверки MVP-сценариев Donatay.

## Требования

- Node.js 20+
- npm 10+
- запущенные backend-сервисы:
  - `auth-service` на `http://localhost:8081`
  - `user-data-service` на `http://localhost:8080`

## Установка

```bash
npm install
```

## Локальный запуск

```bash
npm run dev
```

Приложение будет доступно на:

```text
http://localhost:5173
```

## Переменные окружения

```text
VITE_AUTH_API_URL=http://localhost:8081
VITE_USER_DATA_API_URL=http://localhost:8080
```

Можно создать локальный `.env` по примеру `.env.example`.

## Проверки

```bash
npm test
npm run build
```

## Что сейчас поддерживает UI

- регистрация через `auth-service`;
- логин через `auth-service`;
- MFA challenge flow через `challengeId`;
- получение профиля из `user-data-service`;
- редактирование профильных полей:
  - nickname;
  - avatarUrl;
  - headerUrl;
  - phoneNumber.

Auth/MFA и user-data API разделены по разным base URL.
