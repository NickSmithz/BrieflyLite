# Briefly Crew

Mobile-first PWA/Web App для внутренней работы маленькой контент-команды: проекты, участники, контент-план, задачи, дедлайны и статусы.

## Стек

- React + Vite + TypeScript
- Tailwind CSS
- Zustand
- Vercel Functions через единый `/api`
- Prisma
- Supabase Postgres

## Первый запуск

1. Создайте проект в Supabase.
2. Скопируйте `DATABASE_URL` и `DIRECT_URL` из настроек базы.
3. Создайте `.env.local`:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
TEAM_PASSWORD="change-me"
JWT_SECRET="change-me"
```

4. Установите зависимости:

```bash
npm install
```

5. Создайте миграцию и таблицы:

```bash
npx prisma migrate dev --name init
```

6. Запустите локально:

```bash
npm run dev
```

7. Откройте приложение, введите `TEAM_PASSWORD`, выберите участника.

При первом успешном входе backend автоматически создает команду `Briefly Crew` и участников:

- Николай — Project Manager
- Дизайнер — Designer
- Рилсмейкер — Reels Maker
- Сторисмейкер — Stories Maker

## Vercel deploy

1. Создайте новый проект на Vercel из папки `briefly-crew`.
2. Добавьте env vars:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
TEAM_PASSWORD="your-password"
JWT_SECRET="long-random-secret"
```

3. Build command:

```bash
npm run build
```

4. Output directory:

```bash
dist
```

`vercel.json` уже настроен: все `/api/*` идут в единую serverless function, остальное переписывается на SPA.

## Проверка MVP v0.2

1. Войти по командному паролю.
2. Выбрать участника.
3. Создать проект.
4. Добавить или отключить участника.
5. Импортировать тестовый контент-план.
6. Проверить, что появились `ContentItem` и `Task`.
7. Открыть “Мои задачи”.
8. Проверить фильтры: мои, сегодня, неделя, просроченные, готовые.
9. Изменить статус задачи.
10. Обновить страницу и убедиться, что данные сохранились.
