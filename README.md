# Pulparindo's Club

Primera entrega del sitio independiente **Pulparindo's Club**, publicado desde este repositorio.

## Incluido
- Pantalla de bienvenida con entrada manual.
- Diseño adaptable a teléfono y computadora.
- Frases de visión y mentalidad empresarial.
- Reproductor discreto con canción actual y canción siguiente.
- Panel de administración con inicio de sesión de Firebase.
- Alta y consulta de productos en Cloud Firestore.
- Reglas iniciales de Firestore para restringir operaciones administrativas.

## Música
El reproductor está preparado para estos archivos locales:
- `assets/audio/francia.mp3`
- `assets/audio/4x4.mp3`
- `assets/audio/el-lokeron.mp3`
- `assets/audio/suzuki.mp3`

La carpeta `assets/audio` debe contener archivos que tengas derecho a publicar. No se subieron canciones comerciales al repositorio. La reproducción comienza después de pulsar el botón de entrada porque los navegadores bloquean normalmente el autoplay.

## Conectar Firebase
1. Crea un proyecto en https://console.firebase.google.com/.
2. Registra una aplicación web y copia su configuración.
3. Sustituye los valores `PEGA_AQUI` en `firebase-config.js`.
4. En Authentication, activa el proveedor **Email/Password**.
5. Crea la cuenta administradora en Authentication > Users. No compartas la contraseña.
6. Crea Firestore Database en modo producción.
7. Copia el UID de la cuenta administradora y sustituye `UID_ADMIN` en `firestore.rules`.
8. Publica las reglas desde Firestore > Rules.

## Publicar con GitHub Pages
En este repositorio, abre Settings > Pages. En Build and deployment elige **Deploy from a branch**, selecciona `main` y `/(root)`, y guarda. GitHub mostrará la dirección cuando termine el despliegue.

## Estado de esta entrega
Esta es la base visual y técnica, no la plataforma completa. Todavía faltan el registro de ventas, perfiles con apodos, inventario por venta, rachas por días efectivos de actividad, misiones, insignias, premios y clasificación. No se debe presentar esas funciones como activas hasta implementarlas y probarlas.

La clasificación planeada no debe premiar cuánto dinero gasta una persona. Los días sin actividad comercial no deben romper rachas. Para perfiles de compañeros, usa solo apodos y datos mínimos, con permiso antes de publicar información sobre otras personas.

Nunca publiques contraseñas, claves privadas ni credenciales de cuentas de servicio.