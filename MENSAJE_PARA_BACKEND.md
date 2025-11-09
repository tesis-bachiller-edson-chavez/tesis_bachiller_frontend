# 🔴 PROBLEMA URGENTE: Error 403 en Endpoints Protegidos

## Síntomas
Usuario con rol **ADMIN** en la base de datos recibe **403 Forbidden** al intentar acceder a estos endpoints:

```
GET /api/v1/datadog/services → 403 Forbidden
PUT /api/v1/repositories/{id} → 403 Forbidden
POST /api/v1/repositories/sync → 403 Forbidden
```

### Verificación del Usuario
```
Usuario: Grubhart
Roles en BD: ['DEVELOPER', 'ADMIN'] ✓
Frontend detecta: isAdmin = true ✓
Backend rechaza: 403 Forbidden ✗
```

---

## 🔍 Causa del Problema

Los controladores tienen **sintaxis incorrecta** en las anotaciones `@PreAuthorize`:

### ❌ Código Actual (INCORRECTO)
```java
@PreAuthorize("ADMIN")  // ❌ Esta sintaxis NO es válida en Spring Security
```

### ✅ Código Correcto
```java
@PreAuthorize("hasRole('ADMIN')")  // ✅ Sintaxis válida con SpEL
```

---

## 🛠️ Solución: Cambios Requeridos

### 1. RepositoryController.java

**Ubicación**: Probablemente en `module-api/src/main/java/.../controller/`

**Cambios a realizar:**

```java
@RestController
@RequestMapping("/api/v1/repositories")
public class RepositoryController {

    // CAMBIO 1: Endpoint de sincronización
    @PostMapping("/sync")
    @PreAuthorize("hasRole('ADMIN')")  // ← CAMBIAR ESTA LÍNEA
    public ResponseEntity<RepositorySyncResultDto> syncRepositories() {
        // ...
    }

    // CAMBIO 2: Endpoint de actualización
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")  // ← CAMBIAR ESTA LÍNEA
    public ResponseEntity<RepositoryDto> updateRepository(
        @PathVariable Long id,
        @RequestBody UpdateRepositoryRequest request
    ) {
        // ...
    }
}
```

### 2. DatadogController.java

**Ubicación**: Probablemente en `module-api/src/main/java/.../controller/`

**Cambios a realizar:**

```java
@RestController
@RequestMapping("/api/v1/datadog")
public class DatadogController {

    // CAMBIO 3: Endpoint de servicios
    @GetMapping("/services")
    @PreAuthorize("hasRole('ADMIN')")  // ← CAMBIAR ESTA LÍNEA
    public ResponseEntity<List<DatadogServiceDto>> getServices() {
        // ...
    }
}
```

---

## ⚙️ Verificación Adicional

### Paso 1: Verificar SecurityConfig

Asegúrate de que `@EnableMethodSecurity` esté habilitado:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)  // ← Debe estar presente
public class SecurityConfig {
    // ...
}
```

### Paso 2: Verificar Formato de Roles en BD

Ejecuta esta query para confirmar el formato:

```sql
SELECT r.name FROM roles r;
```

**Resultado esperado:**
```
name
----------
ADMIN
DEVELOPER
TECH_LEAD
ENGINEERING_MANAGER
```

Si los roles tienen prefijo `ROLE_` (ejemplo: `ROLE_ADMIN`), entonces usa:
```java
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
```

### Paso 3: Verificar que los Roles se Cargan Correctamente

En el `Oauth2LoginSuccessHandler` o donde se crea el objeto `Authentication`, verifica:

```java
List<GrantedAuthority> authorities = user.getRoles().stream()
    .map(role -> new SimpleGrantedAuthority(role.getName())) // Debe ser "ADMIN", no "ROLE_ADMIN"
    .collect(Collectors.toList());
```

---

## 🧪 Cómo Probar la Solución

1. **Hacer los cambios** en los controladores
2. **Reiniciar el servidor** del backend
3. **Desde el frontend**, probar:
   - Ir a `/repositories`
   - Click en botón "Sincronizar desde GitHub"
   - Debe retornar datos, no 403

4. **Verificar en logs**:
```bash
# Habilitar logs de Spring Security (opcional para debug)
logging.level.org.springframework.security=DEBUG
```

---

## 📋 Checklist de Implementación

- [ ] Cambiar `@PreAuthorize` en `RepositoryController.syncRepositories()`
- [ ] Cambiar `@PreAuthorize` en `RepositoryController.updateRepository()`
- [ ] Cambiar `@PreAuthorize` en `DatadogController.getServices()`
- [ ] Verificar `@EnableMethodSecurity(prePostEnabled = true)` en `SecurityConfig`
- [ ] Verificar formato de roles en la base de datos
- [ ] Reiniciar servidor backend
- [ ] Probar endpoints desde el frontend
- [ ] Confirmar que retorna 200 OK y no 403

---

## 📖 Referencia

**Documentación oficial de Spring Security:**
- https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html

**Diferencia entre `hasRole()` y `hasAuthority()`:**
- `hasRole('ADMIN')` → Busca automáticamente `ROLE_ADMIN` en authorities
- `hasAuthority('ADMIN')` → Busca exactamente `ADMIN` en authorities

---

## ❓ Dudas o Problemas

Si después de hacer estos cambios siguen los errores 403, comparte:

1. El código actual de `SecurityConfig.java` (método `securityFilterChain`)
2. El código donde se crea el objeto `Authentication` (probablemente en `Oauth2LoginSuccessHandler`)
3. Los logs del servidor cuando se intenta acceder a los endpoints
