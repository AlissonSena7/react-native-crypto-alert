import { formatChange, formatPrice } from "@utils/index";

describe("formatPrice", () => {
  it("retorna '0.00' quando o preço é zero", () => {
    expect(formatPrice(0)).toBe("0.00");
  });

  it("formata o preço com duas casas decimais por padrão", () => {
    expect(formatPrice(67999.5)).toBe("67,999.50");
  });

  it("separa os milhares com vírgula", () => {
    expect(formatPrice(1234567.89)).toBe("1,234,567.89");
  });

  it("mantém o sinal negativo no preço", () => {
    expect(formatPrice(-1234.5)).toBe("-1,234.50");
  });

  it("arredonda o preço para o número de casas decimais informado", () => {
    expect(formatPrice(1.23456, 4)).toBe("1.2346");
  });

  it("não usa casas decimais quando o parâmetro decimals é zero", () => {
    expect(formatPrice(67999.5, 0)).toBe("68,000");
  });

  it("expande com zeros quando decimals é maior que as casas do valor", () => {
    expect(formatPrice(1, 4)).toBe("1.0000");
  });

  it("arredonda para zero valores muito pequenos", () => {
    expect(formatPrice(0.0001)).toBe("0.00");
  });

  it("formata com uma casa decimal quando decimals é 1", () => {
    expect(formatPrice(1234.56, 1)).toBe("1,234.6");
  });

  it("formata com três casas decimais quando decimals é 3", () => {
    expect(formatPrice(1.23456, 3)).toBe("1.235");
  });

  it("arredonda a soma de 0.1 + 0.2 para '0.30'", () => {
    expect(formatPrice(0.1 + 0.2)).toBe("0.30");
  });

  it("mantém o sinal de zero negativo", () => {
    expect(formatPrice(-0)).toBe("-0.00");
  });

  it("preserva o sinal negativo em valores que arredondam para zero", () => {
    expect(formatPrice(-0.0001)).toBe("-0.00");
  });

  it("trunca um número de casas decimais fracionário", () => {
    expect(formatPrice(10, 2.5)).toBe("10.00");
  });

  it("formata valores muito grandes com separadores de milhar", () => {
    expect(formatPrice(1e21)).toBe("1,000,000,000,000,000,000,000.00");
  });

  it("retorna 'NaN' quando o preço não é um número válido", () => {
    expect(formatPrice(Number.NaN)).toBe("NaN");
  });

  it("retorna '∞' quando o preço é infinito", () => {
    expect(formatPrice(Number.POSITIVE_INFINITY)).toBe("∞");
  });

  it("lança RangeError quando decimals é negativo", () => {
    expect(() => formatPrice(10, -1)).toThrow(RangeError);
  });

  it("lança RangeError quando decimals é maior que 100", () => {
    expect(() => formatPrice(10, 101)).toThrow(RangeError);
  });

  it("lança TypeError quando o preço é undefined", () => {
    expect(() => formatPrice(undefined as unknown as number)).toThrow(TypeError);
  });
});

describe("formatChange", () => {
  it("prefixa com '+' quando a variação é positiva", () => {
    expect(formatChange(2.45)).toBe("+2.45%");
  });

  it("mantém o sinal negativo quando a variação é negativa", () => {
    expect(formatChange(-1.23)).toBe("-1.23%");
  });

  it("trata variação zero como positiva", () => {
    expect(formatChange(0)).toBe("+0.00%");
  });

  it("arredonda a variação para duas casas decimais", () => {
    expect(formatChange(2.456)).toBe("+2.46%");
  });

  it("formata variação muito pequena como zero positivo", () => {
    expect(formatChange(1e-9)).toBe("+0.00%");
  });

  it("mantém o sinal negativo quando a variação arredonda para zero", () => {
    expect(formatChange(-0.001)).toBe("-0.00%");
  });

  it("retorna 'NaN%' quando a variação não é um número válido", () => {
    expect(formatChange(Number.NaN)).toBe("NaN%");
  });

  it("retorna '+Infinity%' quando a variação é infinita", () => {
    expect(formatChange(Number.POSITIVE_INFINITY)).toBe("+Infinity%");
  });

  it("retorna '-Infinity%' quando a variação é negativa infinita", () => {
    expect(formatChange(Number.NEGATIVE_INFINITY)).toBe("-Infinity%");
  });

  it("trata zero negativo como variação positiva", () => {
    expect(formatChange(-0)).toBe("+0.00%");
  });

  it("não separa milhares na variação", () => {
    expect(formatChange(1234.5)).toBe("+1234.50%");
  });

  it("arredonda a soma de 0.1 + 0.2 para '+0.30%'", () => {
    expect(formatChange(0.1 + 0.2)).toBe("+0.30%");
  });

  it("lança TypeError quando a variação é undefined", () => {
    expect(() => formatChange(undefined as unknown as number)).toThrow(TypeError);
  });

  it("lança TypeError quando a variação é null", () => {
    expect(() => formatChange(null as unknown as number)).toThrow(TypeError);
  });
});
