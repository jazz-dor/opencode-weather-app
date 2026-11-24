---
description: Crea un git worktree en .worktrees/ con el nombre derivado del argumento.
agent: build
---

El usuario invocó `/worktree` con este argumento (puede tener o no espacios):

$ARGUMENTS

Tu única tarea es ejecutar, en el directorio de trabajo actual (no cambies de directorio):

```
git worktree add .worktrees/<nombre-del-worktree>
```

Cómo derivar `<nombre-del-worktree>` a partir del argumento:

1. Toma el argumento tal cual llegó (recuerda que puede contener espacios).
2. Normalízalo para que sea un nombre de carpeta/ruta válido: recorta espacios al inicio y al final, pasa a minúsculas, convierte cualquier espacio en `-`, y elimina o reemplaza caracteres inválidos (`\ / : * ? " < > |`) por `-`. Colapsa guiones repetidos y quita guiones al inicio/fin.
3. Si el resultado queda vacío, usa `worktree`.

Reglas estrictas:

- Ejecuta únicamente el comando `git worktree add .worktrees/<nombre-del-worktree>` (con el nombre entre comillas si aplica).
- No te cambies de directorio.
- No hagas nada adicional: no instales dependencias, no copiar archivos, no editar nada, no crear commits.
- Si el comando falla, muestra el error tal cual y no intentes alternativas.
- Termina con una línea indicando la ruta creada.
