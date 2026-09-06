# Detailed reference

This material was moved from `SKILL.md` to keep the loaded workflow focused.

## Testing

### Pruebas unitarias del componente
```typescript
// ChatbotOpenAI.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatbotOpenAI from './ChatbotOpenAI';

test('abre y cierra el chat', () => {
  render(<ChatbotOpenAI />);
  const btn = screen.getByLabelText(/abrir chat/i);
  
  fireEvent.click(btn);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeVisible();
});

test('envía mensaje y recibe respuesta', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ 
              done: false, 
              value: new TextEncoder().encode('data: {"content":"Hola"}\n\n') 
            })
            .mockResolvedValueOnce({ done: true }),
        }),
      },
    })
  );
  
  render(<ChatbotOpenAI />);
  fireEvent.click(screen.getByLabelText(/abrir chat/i));
  
  const input = screen.getByPlaceholderText(/escribe tu pregunta/i);
  fireEvent.change(input, { target: { value: '¿Qué servicios ofrecen?' } });
  fireEvent.click(screen.getByLabelText(/enviar mensaje/i));
  
  await waitFor(() => {
    expect(screen.getByText(/Hola/i)).toBeInTheDocument();
  });
});
```

### Pruebas de accesibilidad
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('no tiene violaciones de accesibilidad', async () => {
  const { container } = render(<ChatbotOpenAI />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Pruebas de la API
```typescript
// api-openai.test.ts
import { POST } from './api-openai';

test('rechaza origen no permitido', async () => {
  const request = new Request('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'origin': 'http://malicious.com' },
  });
  
  const response = await POST(request);
  expect(response.status).toBe(403);
});

test('rate limit funciona', async () => {
  const requests = Array(10).fill(null).map(() => 
    POST(createMockRequest({ ip: '1.2.3.4' }))
  );
  
  const responses = await Promise.all(requests);
  const tooMany = responses.filter(r => r.status === 429);
  expect(tooMany.length).toBeGreaterThan(0);
});
```
