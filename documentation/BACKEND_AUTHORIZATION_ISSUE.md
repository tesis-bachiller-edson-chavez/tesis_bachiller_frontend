# Problema de Autorización 403 - Análisis y Soluciones

## 🔴 Problema Identificado

Los usuarios con rol **ADMIN** en la base de datos están recibiendo **403 Forbidden** al intentar acceder a endpoints protegidos:

- `GET /api/v1/datadog/services` → 403 Forbidden
- `PUT /api/v1/repositories/{id}` → 403 Forbidden
- `POST /api/v1/repositories/sync` → 403 Forbidden

### Estado Actual

✅ **Frontend**: Detecta correctamente el rol ADMIN
```javascript
// Usuario en frontend
{
  id: 1,
  githubUsername: 'Grubhart',
  email: null,
  roles: ['DEVELOPER', 'ADMIN']
}
// isAdmin: true ✓
```

❌ **Backend**: Rechaza las peticiones con 403

## 🔍 Causa Raíz

Según la documentación del backend (`design.md:2489-2490`), los endpoints están protegidos con:

```java
@PreAuthorize("ADMIN")  // ❌ INCORRECTO
```

### Problema con la Sintaxis

La anotación `@PreAuthorize("ADMIN")` **no es válida** en Spring Security. La sintaxis correcta debe usar **expresiones SpEL** (Spring Expression Language):

```java
@PreAuthorize("hasRole('ADMIN')")      // ✅ CORRECTO - opción 1
@PreAuthorize("hasAuthority('ADMIN')")  // ✅ CORRECTO - opción 2
```

## 📋 Soluciones Propuestas

### Solución 1: Usar `hasRole()` (Recomendada)

Spring Security agrega automáticamente el prefijo `ROLE_` cuando se usa `hasRole()`.

**Si los roles en la BD tienen el formato**: `ADMIN`, `DEVELOPER`, etc.

```java
@PreAuthorize("hasRole('ADMIN')")
```

**Si los roles en la BD tienen el formato**: `ROLE_ADMIN`, `ROLE_DEVELOPER`, etc.

```java
@PreAuthorize("hasRole('ADMIN')")  // Spring Security busca 'ROLE_ADMIN' automáticamente
```

### Solución 2: Usar `hasAuthority()` (Más Explícita)

Esta opción busca exactamente el nombre que especificas sin agregar prefijos.

**Si los roles en la BD son**: `ADMIN`, `DEVELOPER`

```java
@PreAuthorize("hasAuthority('ADMIN')")
```

**Si los roles en la BD son**: `ROLE_ADMIN`, `ROLE_DEVELOPER`

```java
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
```

## 🛠️ Cambios Requeridos en el Backend

### Archivo: `RepositoryController.java` (probablemente en `module_api`)

**ANTES:**
```java
@RestController
@RequestMapping("/api/v1/repositories")
public class RepositoryController {

    @PostMapping("/sync")
    @PreAuthorize("ADMIN")  // ❌ INCORRECTO
    public ResponseEntity<RepositorySyncResultDto> syncRepositories() {
        // ...
    }

    @PutMapping("/{id}")
    @PreAuthorize("ADMIN")  // ❌ INCORRECTO
    public ResponseEntity<RepositoryDto> updateRepository(
        @PathVariable Long id,
        @RequestBody UpdateRepositoryRequest request
    ) {
        // ...
    }
}
```

**DESPUÉS:**
```java
@RestController
@RequestMapping("/api/v1/repositories")
public class RepositoryController {

    @PostMapping("/sync")
    @PreAuthorize("hasRole('ADMIN')")  // ✅ CORRECTO
    public ResponseEntity<RepositorySyncResultDto> syncRepositories() {
        // ...
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")  // ✅ CORRECTO
    public ResponseEntity<RepositoryDto> updateRepository(
        @PathVariable Long id,
        @RequestBody UpdateRepositoryRequest request
    ) {
        // ...
    }
}
```

### Archivo: `DatadogController.java` (probablemente en `module_api`)

**ANTES:**
```java
@RestController
@RequestMapping("/api/v1/datadog")
public class DatadogController {

    @GetMapping("/services")
    @PreAuthorize("ADMIN")  // ❌ INCORRECTO
    public ResponseEntity<List<DatadogServiceDto>> getServices() {
        // ...
    }
}
```

**DESPUÉS:**
```java
@RestController
@RequestMapping("/api/v1/datadog")
public class DatadogController {

    @GetMapping("/services")
    @PreAuthorize("hasRole('ADMIN')")  // ✅ CORRECTO
    public ResponseEntity<List<DatadogServiceDto>> getServices() {
        // ...
    }
}
```

## ⚙️ Verificación de Configuración

### 1. Verificar `SecurityConfig.java`

Asegúrate de que la configuración de Spring Security tenga habilitado `@PreAuthorize`:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)  // ✅ Debe estar habilitado
public class SecurityConfig {
    // ...
}
```

### 2. Verificar formato de Roles en la Base de Datos

Ejecuta esta query en tu base de datos:

```sql
SELECT u.github_username, r.name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.github_username = 'Grubhart';
```

**Resultado esperado:**
```
github_username | name
----------------|----------
Grubhart        | DEVELOPER
Grubhart        | ADMIN
```

Si los nombres incluyen `ROLE_` como prefijo, ajusta el código en consecuencia.

### 3. Verificar que los Roles se cargan en el Authentication

En el `Oauth2LoginSuccessHandler` o donde se crea el `Authentication` object, verifica que los roles se están agregando como `GrantedAuthority`:

```java
List<GrantedAuthority> authorities = user.getRoles().stream()
    .map(role -> new SimpleGrantedAuthority(role.getName())) // Asegura que sea "ADMIN" o "ROLE_ADMIN"
    .collect(Collectors.toList());
```

## 🧪 Pruebas para Verificar la Solución

Después de hacer los cambios en el backend:

1. **Reinicia el servidor del backend**
2. **Recarga la página del frontend** (Ctrl+F5)
3. **Usa el componente de debug** que agregué en el frontend:
   - Verás un panel en la esquina inferior derecha
   - Haz clic en "Test GET /datadog/services"
   - Debería retornar 200 OK con la lista de servicios

4. **Verifica en los logs del backend** que los roles se están cargando correctamente

## 📊 Diagnóstico Adicional

### Opción A: Habilitar Logs de Seguridad

En `application.yml` o `application.properties` del backend:

```yaml
logging:
  level:
    org.springframework.security: DEBUG
```

Esto mostrará en los logs qué roles tiene el usuario al hacer la petición.

### Opción B: Endpoint de Debug (Temporal)

Agrega este endpoint temporal para verificar qué roles tiene el usuario autenticado:

```java
@RestController
@RequestMapping("/api/v1/debug")
public class DebugController {

    @GetMapping("/current-user-authorities")
    public ResponseEntity<?> getCurrentUserAuthorities(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok("No authentication found");
        }

        Map<String, Object> info = new HashMap<>();
        info.put("name", authentication.getName());
        info.put("authorities", authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList()));
        info.put("authenticated", authentication.isAuthenticated());

        return ResponseEntity.ok(info);
    }
}
```

Luego desde el frontend haz una petición a `/api/v1/debug/current-user-authorities` para ver exactamente qué autoridades tiene el usuario.

## 📝 Resumen

| Problema | Causa | Solución |
|----------|-------|----------|
| 403 Forbidden en endpoints ADMIN | `@PreAuthorize("ADMIN")` sintaxis incorrecta | Cambiar a `@PreAuthorize("hasRole('ADMIN')")` |
| Servicios de Datadog no cargan | Mismo problema de autorización | Aplicar mismo fix |
| No se puede actualizar repositorios | Mismo problema de autorización | Aplicar mismo fix |

## ✅ Checklist de Implementación

- [ ] Cambiar `@PreAuthorize("ADMIN")` a `@PreAuthorize("hasRole('ADMIN')")` en `RepositoryController`
- [ ] Cambiar `@PreAuthorize("ADMIN")` a `@PreAuthorize("hasRole('ADMIN')")` en `DatadogController`
- [ ] Verificar que `@EnableMethodSecurity(prePostEnabled = true)` está en `SecurityConfig`
- [ ] Verificar formato de roles en la base de datos
- [ ] Verificar que los roles se cargan como `GrantedAuthority` en el `Authentication`
- [ ] Reiniciar backend
- [ ] Probar endpoints desde el frontend
- [ ] Eliminar componente de debug del frontend una vez solucionado

---

**Nota**: Este es un problema del **BACKEND**, no del frontend. El frontend está funcionando correctamente y enviando las credenciales apropiadamente.
