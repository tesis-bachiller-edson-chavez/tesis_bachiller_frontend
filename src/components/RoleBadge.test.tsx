import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { RoleBadge } from './RoleBadge';
import { RoleName } from '@/types/user.types';

describe('RoleBadge', () => {
  test('debe renderizar el badge con el nombre del rol ADMIN', () => {
    render(<RoleBadge role={RoleName.ADMIN} />);
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  test('debe renderizar el badge con el nombre del rol ENGINEERING_MANAGER', () => {
    render(<RoleBadge role={RoleName.ENGINEERING_MANAGER} />);
    expect(screen.getByText('ENGINEERING_MANAGER')).toBeInTheDocument();
  });

  test('debe renderizar el badge con el nombre del rol TECH_LEAD', () => {
    render(<RoleBadge role={RoleName.TECH_LEAD} />);
    expect(screen.getByText('TECH_LEAD')).toBeInTheDocument();
  });

  test('debe renderizar el badge con el nombre del rol DEVELOPER', () => {
    render(<RoleBadge role={RoleName.DEVELOPER} />);
    expect(screen.getByText('DEVELOPER')).toBeInTheDocument();
  });

  test('debe aplicar la clase de color rojo para ADMIN', () => {
    const { container } = render(<RoleBadge role={RoleName.ADMIN} />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-red-500');
  });

  test('debe aplicar la clase de color púrpura para ENGINEERING_MANAGER', () => {
    const { container } = render(<RoleBadge role={RoleName.ENGINEERING_MANAGER} />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-purple-500');
  });

  test('debe aplicar la clase de color azul para TECH_LEAD', () => {
    const { container } = render(<RoleBadge role={RoleName.TECH_LEAD} />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-blue-500');
  });

  test('debe aplicar la clase de color gris para DEVELOPER', () => {
    const { container } = render(<RoleBadge role={RoleName.DEVELOPER} />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-gray-500');
  });

  test('debe manejar roles desconocidos mostrando badge genérico', () => {
    const { container } = render(<RoleBadge role={'UNKNOWN_ROLE' as RoleName} />);
    const badge = container.querySelector('span');

    // Debe mostrar el rol tal cual
    expect(screen.getByText('UNKNOWN_ROLE')).toBeInTheDocument();

    // Debe usar un color por defecto (gris más oscuro para diferenciar)
    expect(badge).toHaveClass('bg-gray-400');
  });

  test('debe tener estilos base de badge (texto blanco, padding, redondeado)', () => {
    const { container } = render(<RoleBadge role={RoleName.DEVELOPER} />);
    const badge = container.querySelector('span');

    expect(badge).toHaveClass('text-white');
    expect(badge).toHaveClass('px-2');
    expect(badge).toHaveClass('py-1');
    expect(badge).toHaveClass('rounded');
  });
});
