import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { UsersTable } from './UsersTable';

// Datos de prueba
const mockUsers = [
  {
    githubUsername: 'user1',
    name: 'Usuario Uno',
    avatarUrl: 'https://example.com/avatar1.png',
  },
  {
    githubUsername: 'user2',
    name: null, // Este usuario no tiene nombre
    avatarUrl: 'https://example.com/avatar2.png',
  },
  {
    githubUsername: 'user3',
    name: 'Usuario Tres',
    avatarUrl: 'https://example.com/avatar3.png',
  },
];

describe('UsersTable', () => {
  test('debe renderizar las cabeceras de la tabla correctamente', () => {
    render(<UsersTable users={[]} />);

    expect(screen.getByRole('columnheader', { name: /Avatar/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Username/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Nombre/i })).toBeInTheDocument();
  });

  test('debe renderizar una fila por cada usuario en la lista', () => {
    render(<UsersTable users={mockUsers} />);

    const rows = screen.getAllByRole('row');
    // Se espera 1 fila de cabecera + 3 filas de datos
    expect(rows).toHaveLength(4);
  });

  test('debe mostrar los datos correctos para un usuario con nombre', () => {
    render(<UsersTable users={[mockUsers[0]]} />);

    expect(screen.getByRole('cell', { name: 'user1' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Usuario Uno' })).toBeInTheDocument();

    // En el entorno de prueba (jsdom), la imagen no se carga, por lo que se muestra el fallback.
    // Verificamos que el fallback (la inicial del nombre) esté presente.
    const fallback = screen.getByText('U');
    expect(fallback).toBeInTheDocument();
  });

  test('debe manejar correctamente a un usuario sin nombre', () => {
    render(<UsersTable users={[mockUsers[1]]} />);

    // Debe mostrar el username
    expect(screen.getByRole('cell', { name: 'user2' })).toBeInTheDocument();
    // Debe mostrar un guion en lugar del nombre
    expect(screen.getByRole('cell', { name: '-' })).toBeInTheDocument();
    // El fallback del avatar debe ser la inicial del USERNAME
    const fallback = screen.getByText('U');
    expect(fallback).toBeInTheDocument();
  });

  test('debe renderizar solo las cabeceras si la lista de usuarios está vacía', () => {
    render(<UsersTable users={[]} />);

    const rows = screen.getAllByRole('row');
    // Solo se espera la fila de la cabecera
    expect(rows).toHaveLength(1);
    // Verificamos que no hay celdas de datos (que no sean de cabecera)
    const dataCells = screen.queryByRole('cell');
    expect(dataCells).not.toBeInTheDocument();
  });
});
