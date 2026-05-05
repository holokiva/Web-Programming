/** Сопоставь с DTO пользователя с бэкенда (role / roles / isAdmin). */
export function isAdminUser(user) {
  if (!user || typeof user !== 'object') return false
  if (user.isAdmin === true || user.IsAdmin === true) return true
  const role = user.role ?? user.Role
  if (typeof role === 'string' && role.toLowerCase() === 'admin') return true
  const roles = user.roles ?? user.Roles
  if (Array.isArray(roles)) {
    return roles.some((r) => String(r).toLowerCase() === 'admin')
  }
  return false
}
