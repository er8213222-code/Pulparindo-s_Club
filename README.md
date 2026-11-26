# Pulparindo's Club

Sitio web móvil del club: catálogo de dulces, juegos gratuitos y panel privado para administrar productos, ventas y deudas.

## Interfaz
- Diseño amarillo, rojo y verde inspirado en empaques de dulces.
- Perfil con apodo local, puntos de minijuegos e insignias.
- Catálogo público alimentado por Firebase.
- Minijuego de memoria y reto de cuentas.
- No se necesita comprar para jugar.

## Panel de administración
En el botón ADMIN:
- Productos: agregar, editar y eliminar dulces; definir precio y existencias.
- Registrar venta: elegir producto, cantidad y cliente; calcula el total y descuenta existencias.
- Si una venta queda fiada, crea también una deuda.
- Deudas: registrar préstamos o conceptos pendientes, consultar saldos, anotar abonos y marcar como pagado.
- Ventas y deudas solo son visibles para la cuenta administradora.

## Conectar Firebase
1. Crea un proyecto en https://console.firebase.google.com/ y registra una aplicación web.
2. Copia la configuración web y sustituye los valores PEGA_AQUI en firebase-config.js. Esa configuración web no es una contraseña; nunca compartas claves privadas ni archivos de cuenta de servicio.
3. En Authentication, activa Email/Password y crea la cuenta administradora.
4. Crea Firestore Database.
5. En Authentication, abre la cuenta administradora y copia su UID.
6. Sustituye UID_ADMIN en firestore.rules por ese UID y publica las reglas desde Firestore > Rules.

Las reglas permiten leer el catálogo públicamente, pero reservan ventas, deudas y cambios de productos para el administrador.

## Datos que todavía requieren conexión
Sin Firebase configurado, el sitio público y los minijuegos pueden mostrarse, pero el catálogo, las ventas y las deudas no se guardan en la nube. El apodo, puntos e insignias del navegador se guardan localmente en ese dispositivo.

La racha de compras y la sincronización del perfil entre teléfonos todavía requieren completar la vinculación segura de perfiles de clientes. No se debe permitir que un visitante se asigne compras o rachas a sí mismo.

## Publicación
En GitHub abre Settings > Pages y selecciona GitHub Actions en Build and deployment. Revisa Actions para confirmar que el flujo de publicación termine correctamente.

No publiques contraseñas, claves privadas ni credenciales de cuentas de servicio.
