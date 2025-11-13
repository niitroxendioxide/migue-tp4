# MIGUE EVENTOS

## Instalacion
```bash
npm i
```

# Backend:
En la carpeta backend crear un archivo .env con un valor de 

```env
DATABASE_URL="link_de_base_de_datos"
```

Configurar prisma:

```bash
cd backend/
npx prisma migrate dev
npx prisma generate
```

Correr en el backend:

```bash
npm run dev
```

# Frontend:

En otra terminal, en la carpeta frontend del proyecto ejecutar:

```bash
npm run dev
```
## Integrantes

- Benicio Verdun
- Juan Ignacio Dragan
