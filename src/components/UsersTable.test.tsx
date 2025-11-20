import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { UsersTable } from './UsersTable';
import { RoleName } from '@/types/user.types';

// Mock function for onUpdateRoles
const mockOnUpdateRoles = vi.fn().mockResolvedValue(true);

// Datos de prueba
const mockUsers = [
  {
    id: 1,
    githubUsername: 'user1',
    name: 'Usuario Uno',
    avatarUrl: 'https://example.com/avatar1.png',
    roles: [RoleName.DEVELOPER],
  },
  {
    id: 2,
    githubUsername: 'user2',
    name: null, // Este usuario no tiene nombre
    avatarUrl: 'https://example.com/avatar2.png',
    roles: [RoleName.DEVELOPER, RoleName.TECH_LEAD],
  },
  {
    id: 3,
    githubUsername: 'user3',
    name: 'Usuario Tres',
    avatarUrl: 'https://example.com/avatar3.png',
    roles: [RoleName.ADMIN],
  },
];

describe('UsersTable', () => {
  test('debe renderizar las cabeceras de la tabla correctamente', () => {
    render(<UsersTable users={[]} onUpdateRoles={mockOnUpdateRoles} />);

    expect(screen.getByRole('columnheader', { name: /Avatar/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Username/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Nombre/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Roles/i })).toBeInTheDocument();
  });

  test('debe renderizar una fila por cada usuario en la lista', () => {
    render(<UsersTable users={mockUsers} onUpdateRoles={mockOnUpdateRoles} />);

    const rows = screen.getAllByRole('row');
    // Se espera 1 fila de cabecera + 3 filas de datos
    expect(rows).toHaveLength(4);
  });

  test('debe mostrar los datos correctos para un usuario con nombre', () => {
    render(<UsersTable users={[mockUsers[0]]} onUpdateRoles={mockOnUpdateRoles} />);

    expect(screen.getByRole('cell', { name: 'user1' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Usuario Uno' })).toBeInTheDocument();

    // En el entorno de prueba (jsdom), la imagen no se carga, por lo que se muestra el fallback.
    // Verificamos que el fallback (la inicial del nombre) esté presente.
    const fallback = screen.getByText('U');
    expect(fallback).toBeInTheDocument();
  });

  test('debe manejar correctamente a un usuario sin nombre', () => {
    render(<UsersTable users={[mockUsers[1]]} onUpdateRoles={mockOnUpdateRoles} />);

    // Debe mostrar el username
    expect(screen.getByRole('cell', { name: 'user2' })).toBeInTheDocument();
    // Debe mostrar un guion en lugar del nombre
    expect(screen.getByRole('cell', { name: '-' })).toBeInTheDocument();
    // El fallback del avatar debe ser la inicial del USERNAME
    const fallback = screen.getByText('U');
    expect(fallback).toBeInTheDocument();
  });

  test('debe renderizar solo las cabeceras si la lista de usuarios está vacía', () => {
    render(<UsersTable users={[]} onUpdateRoles={mockOnUpdateRoles} />);

    const rows = screen.getAllByRole('row');
    // Solo se espera la fila de la cabecera
    expect(rows).toHaveLength(1);
    // Verificamos que no hay celdas de datos (que no sean de cabecera)
    const dataCells = screen.queryByRole('cell');
    expect(dataCells).not.toBeInTheDocument();
  });

  // ========== Tests para roles (AC 5.2) ==========

  test('debe mostrar un badge por cada rol del usuario', () => {
    render(<UsersTable users={[mockUsers[0]]} onUpdateRoles={mockOnUpdateRoles} />);

    // Usuario con un solo rol
    expect(screen.getByText('DEVELOPER')).toBeInTheDocument();
  });

  test('debe mostrar múltiples badges para usuario con varios roles', () => {
    render(<UsersTable users={[mockUsers[1]]} onUpdateRoles={mockOnUpdateRoles} />);

    // Usuario con dos roles
    expect(screen.getByText('DEVELOPER')).toBeInTheDocument();
    expect(screen.getByText('TECH_LEAD')).toBeInTheDocument();
  });

  test('debe mostrar badge de ADMIN con color rojo', () => {
    const { container } = render(<UsersTable users={[mockUsers[2]]} onUpdateRoles={mockOnUpdateRoles} />);

    // Verificamos que el badge de ADMIN está presente
    expect(screen.getByText('ADMIN')).toBeInTheDocument();

    // Verificamos que tiene la clase de color rojo
    const adminBadge = container.querySelector('.bg-red-500');
    expect(adminBadge).toBeInTheDocument();
  });

  test('debe mostrar indicador de error para usuario sin roles (caso anómalo)', () => {
    const userWithoutRoles = {
      id: 99,
      githubUsername: 'user_error',
      name: 'Usuario Error',
      avatarUrl: 'https://example.com/avatar.png',
      roles: [],
    };

    render(<UsersTable users={[userWithoutRoles]} onUpdateRoles={mockOnUpdateRoles} />);

    // Debe mostrar advertencia visual
    expect(screen.getByText(/Sin rol/i)).toBeInTheDocument();
  });
});
