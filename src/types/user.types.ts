/**
 * Roles del sistema
 * Basado en el enum RoleName del backend (module_domain)
 * Usando const object en lugar de enum para compatibilidad con erasableSyntaxOnly
 */
export const RoleName = {
  ADMIN: 'ADMIN',
  ENGINEERING_MANAGER: 'ENGINEERING_MANAGER',
  TECH_LEAD: 'TECH_LEAD',
  DEVELOPER: 'DEVELOPER',
} as const;

/**
 * Tipo derivado de RoleName para type safety
 */
export type RoleName = typeof RoleName[keyof typeof RoleName];

/**
 * Información resumida de un usuario activo de la organización
 * Basado en UserSummaryDto del OpenAPI (components.schemas.UserSummaryDto)
 */
export interface UserSummaryDto {
  /** Nombre de usuario de GitHub */
  githubUsername: string;

  /** Nombre completo del usuario */
  name: string;

  /** URL del avatar del usuario en GitHub */
  avatarUrl: string;

  /**
   * Roles asignados al usuario en el sistema
   * Según reglas de negocio: Todos los usuarios tienen al menos DEVELOPER
   * Si este array está vacío, es un error del backend
   */
  roles: string[];
}
