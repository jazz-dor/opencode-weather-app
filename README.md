## Weather CLI APP

El objetivo de esta aplicación es que creemos una aplicación de consola que pida que ingresemos la ciudad, Al final, generaremos un binario ejecutable.

### Opciones:

- Ingresar el nombre de una ciudad.
- Guardar la ciudad por defecto.
- Registrar varias otras ciudades para buscar el clima en esas otras ciudades.

## Stack

- Bun.js
- OpenMeteo

## Ejemplo de petición http:

1. Paso 1: Geocoding API.
2. Paso 2: OpenMeteo API.

```
https://geocoding-api.open-meteo.com/v1/search?name=Ottawa&count=1&language=es&format=json
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&current=temperature_2m
```

## Inicializar proyecto

```bash
bun install
```

## Uso

```bash
bun run index.ts
```

Compilar un binario ejecutable:

```bash
bun build --compile index.ts --outfile weather
```

## Estructura

```
index.ts        Entrypoint delgado: arranca src/main.ts
src/
  main.ts       Bucle principal del menú
  api.ts        Tipos (City/Config/Unit) y llamadas a OpenMeteo
  config.ts     Carga y guardado de la configuración
  weather.ts    Descripción de códigos WMO (español) y formato del clima
  ui.ts         Menú, entrada de usuario y utilidades de consola
```

## Configuración

La configuración se guarda en `weather-config.json`, en el **directorio de trabajo actual (cwd)** del proyecto donde se ejecuta la app:

```json
{
  "cities": [{ "name": "Ottawa", "country": "Canadá", "admin1": "Ontario", "latitude": 45.41117, "longitude": -75.69812 }],
  "defaultCity": "Ottawa",
  "unit": "celsius"
}
```

## Unidades de temperatura

La opción **8. Ajustes** alterna entre **°C** y **°F**. La unidad activa se muestra en el menú (`Ajustes (°C)` / `Ajustes (°F)`) y se persiste en la configuración.

### Ejemplo del menú
Esta es la apariencia que deseamos crear

```bash
════════════════════════════════════════
         WEATHER CLI
════════════════════════════════════════
  1. Clima de ciudad default
  2. Clima de todas las ciudades (1)
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  8. Ajustes (°C)
  9. Salir
════════════════════════════════════════
  Selecciona una opción: 5
```