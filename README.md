# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Incluye power-ups especiales y tipos de asteroides únicos como la estrella fugaz.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |
| `S`       | Cambiar skin |
| `Shift`   | Escudo     |

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up **Velocidad**: un ítem flotante (rayo cian) aparece cada cierto tiempo; si lo atrapas, tu propulsión es el doble de potente durante 5 segundos
- **Triple Shot**: durante los primeros 5 segundos de cada vida/nivel, la nave dispara 3 balas en abanico (centro y ±15°) en lugar de una sola
- **Skins de nave**: 4 apariencias (Clásica, Neón, Cazador, Fantasma) que cambian silueta, color y llama; pulsa `S` durante la partida y tu elección se recuerda en el navegador
- **Escudo**: mantén `Shift` para desplegar un campo de energía que absorbe las estrellas fugaces (proyectiles enemigos). Consume energía mientras lo usas y se regenera al soltarlo; la barra se muestra en el HUD. No protege de los asteroides
