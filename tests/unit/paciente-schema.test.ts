import { pacienteSchema } from '@/lib/validations/paciente';

describe('Paciente schema', () => {
  it('aceita dados válidos', () => {
    const parsed = pacienteSchema.parse({
      nome: 'João Silva',
      cpf: '12345678901',
      nascimento: '1990-01-01',
      sexo: 'MASCULINO'
    });
    expect(parsed.cpf).toBe('12345678901');
  });

  it('recusa CPF inválido', () => {
    expect(() =>
      pacienteSchema.parse({
        nome: 'Maria',
        cpf: '123',
        nascimento: '1990-01-01',
        sexo: 'FEMININO'
      })
    ).toThrow();
  });
});
