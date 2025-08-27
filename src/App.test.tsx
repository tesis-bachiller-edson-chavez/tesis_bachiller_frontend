import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { describe, test, expect } from 'vitest';

describe('App Routing', () => {
  describe('dado que el usuario no está autenticado', () => {
    test('debe renderizar la página de bienvenida en la ruta raíz', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      // Verifica que el título principal de la página de bienvenida esté presente.
      const mainHeading = screen.getByRole('heading', {
        name: /Plataforma de Métricas DORA/i,
      });
      expect(mainHeading).toBeInTheDocument();

      // Verifica que el botón de llamado a la acción exista.
      const loginButton = screen.getByRole('button', {
        name: /Iniciar Sesión con GitHub/i,
      });
      expect(loginButton).toBeInTheDocument();
    });
  });

  describe('dado que el usuario está autenticado', () => {
    test('debe renderizar la HomePage y el Layout para una ruta protegida', () => {
      // Para este test, asumimos que el usuario está autenticado y navega a /home
      render(
        <MemoryRouter initialEntries={['/home']}>
          <App />
        </MemoryRouter>
      );

      // Buscamos un elemento distintivo de la página de inicio
      const homeHeading = screen.getByRole('heading', { name: /Dashboard Principal/i });
      expect(homeHeading).toBeInTheDocument();

      // También verificamos que un elemento del layout persistente esté presente.
      // El tag <header> tiene el rol implícito de "banner".
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });
  });
});
