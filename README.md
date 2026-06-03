# Back End
## Diagrama de Estructura Corregida
```md
. backFinalProgramacionWeb/demo/src/main/java/com/exampleback/demo
├── config
│   ├── CorsConfig.java
│   └── SecurityConfig.java
├── controller
│   └── MetricsController.java
├── DemoApplication.java
├── dto
│   └── MetricResponseDTO.java
├── model
│   └── DeveloperMetric.java
├── repository
│   └── DeveloperMetricRepository.java
└── service
    └── MetricsService.java
```
## Capas del Backend

### Controller

El archivo principal es `MetricsController.java`.

Su función es exponer el endpoint:

```java
GET /metrics/{metric}
```

Que recibe:
```
/metrics/commits
/metrics/bugs
/metrics/tasks
/metrics/storyPoints
```
### Service
El archivo MetricsService.java contiene la lógica principal.

### Repository
El archivo DeveloperMetricRepository.java funciona como fuente de datos.

### DTO
El DTO principal es MetricResponseDTO.java.

### Model / Entity
El modelo principal es DeveloperMetric.java.

## Flujo de una petición
```
Frontend React
     ↓
GET http://localhost:8080/metrics/commits
     ↓
MetricsController
     ↓
MetricsService
     ↓
DeveloperMetricRepository
     ↓
Lista de DeveloperMetric
     ↓
MetricResponseDTO
     ↓
Respuesta JSON al Frontend
```
## Seguridad y CORS

El Backend tiene dos archivos de configuración:
#### SecurityConfig.java

- Permite todas las peticiones
#### CorsConfig.
Permite solicitudes desde:
http://localhost:5173

## Mejoras Sugeridas
1. `MetricRequestDTO` no utilizado

Durante la revisión del código se identificó que la clase `MetricRequestDTO` no está siendo utilizada por ningún controlador o servicio dentro de la aplicación. Además, la clase carece de métodos de acceso (getters y setters), lo que sugiere que se encuentra incompleta o corresponde a una implementación que fue descartada; por ello, se recomienda eliminarla o integrarla adecuadamente según los requerimientos del sistema.

2. Duplicidad de `MetricResponseDTO`

Se detectó una duplicación de la clase `MetricResponseDTO`, ya que existe una definición adicional dentro del paquete repository. Esta situación puede generar inconsistencias durante el mantenimiento del proyecto, aumentar la complejidad del código y provocar confusión respecto a cuál implementación debe utilizarse, por lo que se recomienda consolidar la clase en una única ubicación dentro del paquete dto.

3. Base de datos hardcodeada

La persistencia de datos actualmente se encuentra implementada mediante información definida directamente en el código fuente, lo que limita significativamente la escalabilidad, mantenibilidad y capacidad de almacenamiento del sistema. Como mejora, se recomienda migrar a una base de datos NoSQL, preferentemente Firebase Firestore, debido a su facilidad de integración, escalabilidad automática y soporte para aplicaciones modernas basadas en la nube.

4. Mejora en la seguridad.
Actualmente la seguridad del proyecto permite el acceso a todo, lo que afecta la seguridad de la aplicación, por lo que deberia de serr limitada esta parrte para contar con una mejor seguridad.

# Front End
## Estructura de carpetas
#### El frontend esta desarrollado en react + vite.
```
src/
├── App.jsx
├── main.jsx
├── component/
│   └── Dashboard.jsx
├── services/
│   └── metricsService.js
├── App.css
└── index.css
```
## Componentes principales
#### App.jsx
##### Es el componente principal de la aplicación.
Su función es cargar el componente Dashboard.

#### Dashboard.jsx
##### Sus funciones son:
- Consultar datos del Backend.
- Guardar los datos en estado.
- Calcular total, promedio y máximo.
- Mostrar tarjetas de resumen.
- Mostrar una gráfica de líneas.

#### MetricCard
Es un componente interno que muestra los datos de un metrica en forma de tarjeta.

## Manejo del estado con Hooks
El proyecto utiliza useState para guardar los datos recibidos del Backend:
```
const [data, setData] = useState([]);
```
Utiliza useEffect para cargar los datos cuando se abre el dashboard
```
useEffect(() => {
  loadData();
}, []);
```

## Consumo de APIs
#### Para el consumo de APIs el proyecto usa el archivo metrics.js, en donde le pasa la URL del servidor del backend:
```
const API_URL = "http://localhost:8080/metrics";
```
#### Y la función principal es una petición GET al backend para las metricas:
```
getMetricData(metric)
```
## Flujo de datos 
```
Dashboard.jsx
     ↓
getMetricData("commits")
     ↓
metricsService.js
     ↓
Backend Spring Boot
     ↓
Respuesta JSON
     ↓
setData(result)
     ↓
Cálculo de total, promedio y máximo
     ↓
Renderizado de tarjetas y gráfica
```
## Graficas y visualización
Las graficas estan implmentadas mediante chart.js y react-chartjs-2.

## Mejoras sugeridas
1. Incorporar gráficas comparativas entre tipos de datos

Actualmente, la aplicación presenta la información de manera aislada, lo que dificulta la comparación directa entre las distintas métricas disponibles. Se recomienda implementar gráficas comparativas que permitan visualizar simultáneamente múltiples tipos de datos, facilitando el análisis de tendencias, diferencias y relaciones entre los indicadores mostrados.

2. Mejorar el diseño visual de la interfaz

La interfaz actual cumple con los requisitos funcionales básicos, pero presenta oportunidades de mejora en términos de experiencia de usuario y atractivo visual. Se recomienda adoptar un diseño más moderno e intuitivo mediante el uso de componentes visuales más elaborados, una mejor distribución de la información, estilos consistentes y elementos gráficos que faciliten la interpretación de los datos.

3. Implementar gráficas individuales para cada métrica

Además de las visualizaciones generales, sería conveniente incorporar gráficas específicas para cada tipo de dato o métrica registrada en el sistema. Esto permitiría a los usuarios analizar el comportamiento histórico y las tendencias particulares de cada indicador de forma más detallada, mejorando la capacidad de monitoreo y toma de decisiones.
