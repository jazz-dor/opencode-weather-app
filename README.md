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
index.ts              Entrypoint delgado: arranca src/index.ts
src/
  index.ts            Bucle principal del menú y dispatch a features
  weather/            Feature clima: getWeather, showDailyForecast, api, format, types
  cities/             Feature ciudades: addCity, removeCity, setDefaultCity,
                      listCities, geocoding, storage, label, types
  settings/           Feature ajustes: toggleUnit, storage (config), types
  cli/                Interacción CLI: menu, input, output
  shared/             Utilidades transversales: colors, constants
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

## Pronóstico de 7 días

La opción **7. Pronóstico 7 días (todas)** muestra el pronóstico diario para todas las ciudades guardadas: máximo/mínimo de temperatura, condición y probabilidad de lluvia. Usa los datos diarios de OpenMeteo (`forecast_days=7`, `timezone=auto`) en la unidad activa.

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
  7. Pronóstico 7 días (todas)
  8. Ajustes (°C)
  9. Salir
════════════════════════════════════════
  Selecciona una opción: 5
```