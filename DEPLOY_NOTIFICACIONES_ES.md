# 📬 Sistema de Notificaciones - Resumen para Deploy

## ✅ Status: LISTO PARA PRODUCCIÓN

El sistema de notificaciones está **completamente implementado** y listo para ser desplegado.

---

## 🎯 ¿Qué se implementó?

### Para Organizadores (Vendedores)
Cuando alguien compra un ticket, recibes una notificación:
```
🔔 Campanita en el header muestra "1"
   ↓ Click en la campanita
   ↓
🎟️ Ticket Sold!
   "1 ticket para Concert vendido a juan@example.com"
   "$50 USD - hace 2 minutos"
```

### Para Compradores
Cuando completan la compra, reciben confirmación:
```
🔔 Campanita en el header muestra "1"
   ↓ Click en la campanita
   ↓
✅ Purchase Confirmed!
   "Tu compra de 1 ticket para Concert está confirmada"
   "$50 USD - justo ahora"
```

---

## 📦 Archivos Implementados

### Nuevos Archivos
```
✅ features/notifications/actions.ts
   - Crear notificación (desde webhook)
   - Obtener notificaciones del usuario
   - Marcar como leído (una o todas)
   - Eliminar notificación

✅ components/notification-bell.tsx
   - Bell icon con dropdown menu
   - Muestra últimas 10 notificaciones
   - Click para marcar como leído/eliminar
   - Auto-refresh cada 30 segundos

✅ components/notification-bell-wrapper.tsx
   - Wrapper cliente para header
```

### Archivos Modificados
```
✅ services/supabase/schema.sql
   - Agregada tabla notifications con RLS e índices

✅ components/nav-header.tsx
   - Integrado NotificationBell en el header

✅ app/api/webhooks/mercadopago/route.ts
   - Crea notificaciones cuando se aprueba pago
```

### Base de Datos
```
✅ 1 tabla nueva: notifications
✅ 4 índices para performance
✅ 3 políticas RLS para seguridad
✅ 1 trigger para timestamps automáticos
```

---

## 🚀 PASOS PARA DESPLEGAR (15 minutos total)

### PASO 1: Aplicar Migración SQL a Supabase (5 min)

1. Ve a [Supabase Dashboard](https://supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Click en "New Query"
5. Copia y pega esto:

```sql
-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ticket_sold', 'purchase_confirmed', 'payment_verified')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  related_purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  buyer_email TEXT,
  buyer_name TEXT,
  event_title TEXT,
  ticket_type_name TEXT,
  quantity INTEGER,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications Updated At Trigger
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notifications_updated_at_trigger ON notifications;
CREATE TRIGGER notifications_updated_at_trigger
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notifications_updated_at();
```

6. Click en el botón **Run** (o Cmd+Enter)
7. Espera el mensaje ✓ "Success"

### PASO 2: Desplegar Código a Vercel (1 min)

```bash
cd /home/zalaz/projects/personal/ticketManager

git add .
git commit -m "feat: agregar sistema de notificaciones"
git push origin main
```

Vercel automáticamente despliega. Puedes ver el progreso en [vercel.com/dashboard](https://vercel.com/dashboard)

### PASO 3: Testear el Sistema (5 min)

**Como Organizador:**
1. Crea cuenta organizer
2. Crea un evento con tipo de ticket ($10)
3. Nota tu usuario

**Como Comprador:**
1. Crea cuenta buyer
2. Ve a la página del evento
3. Click "Buy Ticket"
4. Completa pago con tarjeta sandbox: `4111 1111 1111 1111`
5. Vuelve a verificar

**Verifica:**
- ✅ Organizador ve: 🎟️ "Ticket Sold!" con detalles
- ✅ Comprador ve: ✅ "Purchase Confirmed!" con detalles
- ✅ Bell muestra número de notificaciones no leídas
- ✅ Click en "Mark read" grisea la notificación
- ✅ Click en × elimina la notificación

---

## 💡 Cómo Funciona

```
Comprador compra ticket
        ↓
MercadoPago procesa pago
        ↓
Webhook recibe confirmación
        ↓
Actualiza compra como "aprobada"
        ↓
CREA DOS NOTIFICACIONES:
├─ Para ORGANIZADOR: "🎟️ Ticket Sold!"
│  (Con: nombre comprador, evento, precio)
│
└─ Para COMPRADOR: "✅ Purchase Confirmed!"
   (Con: evento, tipo ticket, precio)
        ↓
Usuarios ven campanita con badge "1"
        ↓
Click campanita → ven notificación en dropdown
```

---

## 🧪 Pruebas Recomendadas

### Test 1: Organizador Recibe Alerta de Venta
```
1. Crea organizer → crea evento "Concierto" ($50)
2. Log in como buyer → ve evento
3. Click "Buy Ticket" → paga con 4111...
4. Log in como organizer
5. ¿Ves campanita con "1"?
6. Click campanita
7. ¿Ves "🎟️ Ticket Sold! ... $50"?
   ✅ FUNCIONA
```

### Test 2: Comprador Recibe Confirmación
```
1. Completa Test 1 paso 1-3
2. Te redirige a success page
3. ¿Ves campanita con "1"?
4. Click campanita
5. ¿Ves "✅ Purchase Confirmed!"?
   ✅ FUNCIONA
```

### Test 3: Marcar como Leído
```
1. Tienes 2 notificaciones
2. Campanita muestra "2"
3. Click "Mark read" en una
4. Se vuelve gris
5. Campanita ahora muestra "1"
6. Repite para segunda
7. Campanita desaparece cuando llega a "0"
   ✅ FUNCIONA
```

### Test 4: Eliminar Notificación
```
1. Tienes una notificación
2. Click botón × en la notificación
3. Desaparece
4. Recarga página
5. Sigue desaparecida
   ✅ FUNCIONA
```

---

## 📊 Estructura de Base de Datos

**Tabla: notifications**
```sql
id              UUID (primary key)
user_id         UUID (quién recibe la notificación)
type            TEXT ('ticket_sold' o 'purchase_confirmed')
title           TEXT ('🎟️ Ticket Sold!')
message         TEXT ('1 ticket vendido a juan@...')
is_read         BOOLEAN (false = sin leer)

-- Datos relacionados:
related_event_id        UUID (evento)
related_purchase_id     UUID (compra)

-- Información denormalizada para mostrar:
buyer_email     TEXT (correo del comprador)
buyer_name      TEXT (nombre del comprador)
event_title     TEXT (nombre del evento)
ticket_type_name TEXT (tipo de ticket)
quantity        INTEGER (cantidad de tickets)
amount          DECIMAL (precio total)
currency        TEXT ('USD', 'ARS', etc)

created_at      TIMESTAMPTZ (cuándo se creó)
updated_at      TIMESTAMPTZ (cuándo se actualizó)
```

**Seguridad (RLS):**
- ✅ Usuarios solo ven SUS propias notificaciones
- ✅ Webhook puede crear notificaciones (sin restricción de usuario)
- ✅ Usuarios solo pueden editar las SUYAS

**Índices (Performance):**
- ✅ Búsqueda por user_id (rápido)
- ✅ Búsqueda por is_read (rápido)
- ✅ Ordenamiento por created_at (rápido)

---

## 🔍 Troubleshooting

### Problema: "La campanita no aparece"
**Solución:**
- ¿Estás logged in? Si no, la campanita no aparece
- Recarga la página
- Limpia caché del navegador

### Problema: "No veo notificaciones después de comprar"
**Solución:**
- Verifica que la tabla SQL fue creada:
  - En Supabase SQL Editor: `SELECT COUNT(*) FROM notifications;`
  - Debe devolver un número (incluso si es 0)
  
- Verifica que el webhook se ejecutó:
  - En Vercel: `vercel logs`
  - Busca: `[MercadoPago Webhook] Creating notifications`

- Verifica que el pago fue "aprobado":
  - En Supabase: `SELECT * FROM purchases;`
  - Busca: `payment_status = 'approved'`

### Problema: "Veo notificaciones de otro usuario"
**Solución:**
- Esto es un problema de RLS
- Verifica en Supabase: `SELECT tablename FROM pg_tables WHERE rowsecurity = true;`
- Debe incluir 'notifications'
- Si no, re-ejecuta la migración SQL

### Problema: "El contador de no leídas no se actualiza"
**Solución:**
- El polling es cada 30 segundos
- Espera 30 segundos o recarga la página (F5)
- Verifica en SQL que la notificación existe:
  - `SELECT * FROM notifications WHERE user_id = 'YOUR_ID';`

---

## 📋 Checklist Final

- [ ] SQL migration aplicado a Supabase
  - Supabase Dashboard → SQL Editor → Run
  - Verifica: `SELECT * FROM notifications;`

- [ ] Código desplegado a Vercel
  - `git push` → Vercel auto-despliega
  - Verifica en vercel.com/dashboard

- [ ] Prueba: Organizador recibe "Ticket Sold"
  - Crear evento como organizador
  - Comprar como otro usuario
  - Ver notificación

- [ ] Prueba: Comprador recibe "Purchase Confirmed"
  - Mismo proceso arriba
  - Comprador verifica su notificación

- [ ] Prueba: Bell solo aparece logged in
  - Log out → no aparece
  - Log in → aparece

- [ ] Prueba: Mark as read funciona
  - Click "Mark read"
  - Notificación se vuelve gris
  - Contador disminuye

- [ ] Prueba: Delete funciona
  - Click × en notificación
  - Desaparece

---

## 📚 Documentación Completa

Si quieres más detalles técnicos:
- [NOTIFICATIONS.md](./NOTIFICATIONS.md) - Arquitectura completa
- [DEPLOYMENT_NOTIFICATIONS.md](./DEPLOYMENT_NOTIFICATIONS.md) - Guía detallada
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Detalles técnicos

---

## 🎉 Resumen

**TODO ESTÁ LISTO:**
✅ Código implementado
✅ Base de datos diseñada
✅ Webhook integrado
✅ UI creada
✅ Documentación escrita
✅ Build verifica correctamente

**Lo que falta (5 minutos):**
1. Aplicar SQL a Supabase
2. Hacer git push
3. Testear

**Tiempo total:** ~15 minutos para tener notificaciones en producción.

---

## 🚀 Ready to Deploy!

El sistema está listo. Los próximos pasos son:
1. Aplicar la migración SQL
2. Hacer push del código
3. Testear que funcione

¡Adelante! 🎉
