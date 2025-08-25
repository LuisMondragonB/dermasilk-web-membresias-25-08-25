# Guía de Configuración de Supabase en Netlify

## 🚨 Error: "ERROR DE CONEXIÓN" en Login

Este error indica que las variables de entorno de Supabase no están configuradas correctamente en Netlify.

## 🔧 Paso 1: Obtener las Credenciales Reales de Supabase

### 1. Acceder a tu Dashboard de Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto de Dermasilk

### 2. Obtener las Variables de Entorno
1. En el dashboard de tu proyecto, ve a **Settings** (Configuración)
2. Haz clic en **API** en el menú lateral
3. Encontrarás dos valores importantes:

#### 📋 Copia estos valores exactos:

**Project URL:**
```
https://[tu-project-ref].supabase.co
```

**Anon Key (public):**
```
eyJ... (una clave muy larga que empieza con eyJ)
```

## 🔧 Paso 2: Configurar Variables en Netlify

### 1. Acceder al Panel de Netlify
1. Ve a [netlify.com](https://netlify.com)
2. Inicia sesión en tu cuenta
3. Selecciona el sitio **dermasilk.mx**

### 2. Configurar Variables de Entorno
1. Ve a **Site settings** (Configuración del sitio)
2. Haz clic en **Environment variables** (Variables de entorno)
3. Haz clic en **Add variable** (Agregar variable)

### 3. Agregar las Variables Requeridas

#### Variable 1:
- **Key (Clave)**: `VITE_SUPABASE_URL`
- **Value (Valor)**: `https://[tu-project-ref].supabase.co` (el que copiaste de Supabase)

#### Variable 2:
- **Key (Clave)**: `VITE_SUPABASE_ANON_KEY`
- **Value (Valor)**: `eyJ...` (la clave anon que copiaste de Supabase)

### 4. Guardar y Redesplegar
1. Haz clic en **Save** para cada variable
2. Ve a **Deploys** (Despliegues)
3. Haz clic en **Trigger deploy** → **Deploy site**
4. Espera a que termine el despliegue (2-3 minutos)

## 🔍 Verificar la Configuración

### 1. Probar la Conexión
1. Ve a `https://dermasilk.mx/login`
2. Intenta iniciar sesión
3. Si aún hay error, revisa que las variables estén correctas

### 2. Credenciales de Login
- **Email**: `admin@dermasilk.mx`
- **Contraseña**: `dermasilk2024`

## 🚨 Problemas Comunes

### Error: "Supabase no está configurado"
- **Causa**: Variables de entorno incorrectas o faltantes
- **Solución**: Verifica que las variables estén exactamente como se muestran arriba

### Error: "Invalid API key"
- **Causa**: La ANON_KEY es incorrecta
- **Solución**: Copia nuevamente la clave desde Supabase → Settings → API

### Error: "Project not found"
- **Causa**: La URL del proyecto es incorrecta
- **Solución**: Verifica que la URL sea exactamente la de tu proyecto

## 📞 Contacto para Soporte

Si sigues teniendo problemas:
1. Verifica que tu proyecto de Supabase esté activo
2. Confirma que las tablas de la base de datos existan
3. Revisa que el usuario admin esté creado en Supabase Auth

## 🔐 Crear Usuario Admin (si no existe)

Si necesitas crear el usuario admin en Supabase:

1. Ve a tu proyecto en Supabase
2. Ve a **Authentication** → **Users**
3. Haz clic en **Add user**
4. Agrega:
   - **Email**: `admin@dermasilk.mx`
   - **Password**: `dermasilk2024`
   - **Email Confirm**: ✅ (marcado)

---

**© 2024 Dermasilk® - Configuración de Base de Datos**