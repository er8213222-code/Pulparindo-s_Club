# Pulparindo's Club

Club web con identidad visual inspirada en un empaque amarillo y rojo de dulce de tamarindo.

## Lo que ya funciona en esta versión
- Entrada al club y diseño adaptable a celular.
- Identidad visual amarilla, roja y verde, con empaque ilustrado.
- Música original tipo videojuego generada en el navegador; comienza cuando el visitante entra o pulsa reproducir.
- Racha de participación manual, con fines de semana excluidos del conteo.
- Misiones gratuitas, apodo local, puntos e insignias.
- Minijuego de memoria de parejas.
- Pregunta interactiva de costos y precio.
- Panel de administración para productos, preparado para Firebase.

## Importante sobre los datos
El apodo, puntos, racha, misiones e insignias de esta primera versión se guardan en el navegador del dispositivo mediante almacenamiento local. No se sincronizan entre teléfonos ni constituyen un registro central de clientes. Si se borra el almacenamiento del navegador, esos datos pueden perderse. No se solicitan nombres completos, teléfonos, direcciones ni datos escolares.

La racha se registra manualmente. Los sábados y domingos no rompen la continuidad. Los días festivos o suspensiones escolares todavía deben administrarse con una regla acordada; esta versión no tiene calendario escolar conectado.

Los puntos e insignias son reconocimiento por participar, no dinero ni garantía de premios. No hace falta comprar para jugar o completar misiones.

## Música
La melodía actual es original y se sintetiza en el navegador; no requiere MP3. Para reproducir canciones específicas, añade únicamente archivos de audio que tengas derecho a publicar y configura la lista del reproductor.

## Conectar Firebase para administración
1. Crea un proyecto en https://console.firebase.google.com/.
2. Registra una aplicación web y copia su configuración.
3. Sustituye los valores `PEGA_AQUI` en `firebase-config.js`.
4. En Authentication, activa Email/Password y crea la cuenta administradora.
5. Crea Firestore Database en modo producción.
6. Sustituye `UID_ADMIN` en `firestore.rules` por el UID real del administrador y publica las reglas.

## Publicar
En GitHub abre Settings > Pages y selecciona **GitHub Actions** en Build and deployment. Después revisa la pestaña Actions para confirmar que el flujo Deploy Pulparindo's Club to GitHub Pages termine correctamente.

## Próximas mejoras
- Sincronización de perfiles y rachas con Firebase.
- Registro de ventas e inventario.
- Calendario escolar editable para días festivos y suspensiones.
- Clasificación por participación, sin premiar el dinero gastado.
- Más minijuegos y catálogo público de productos.

Nunca publiques contraseñas, claves privadas ni credenciales de cuentas de servicio.
