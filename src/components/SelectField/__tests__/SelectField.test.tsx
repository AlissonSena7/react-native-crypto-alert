import { fireEvent, render, screen } from "@testing-library/react-native";
import { SelectField } from "@components/SelectField/SelectField";

const options = [
  { value: "bitcoin", title: "Bitcoin", subtitle: "BTC" },
  { value: "ethereum", title: "Ethereum", subtitle: "ETH" },
  { value: "solana", title: "Solana" },
];

describe("SelectField", () => {
  it("exibe o rótulo do campo", async () => {
    await render(
      <SelectField
        label="Cryptocurrency"
        options={options}
        value=""
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText("Cryptocurrency")).toBeOnTheScreen();
  });

  it("exibe o placeholder padrão quando não há valor selecionado", async () => {
    await render(
      <SelectField
        label="Cryptocurrency"
        options={options}
        value=""
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText("Select")).toBeOnTheScreen();
  });

  it("exibe o placeholder customizado quando informado", async () => {
    await render(
      <SelectField
        label="Cryptocurrency"
        placeholder="Select cryptocurrency"
        options={options}
        value=""
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText("Select cryptocurrency")).toBeOnTheScreen();
    expect(screen.queryByText("Select")).toBeNull();
  });

  it("exibe o título e o subtítulo da opção selecionada", async () => {
    await render(
      <SelectField
        label="Cryptocurrency"
        options={options}
        value="bitcoin"
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText("Bitcoin (BTC)")).toBeOnTheScreen();
  });

  it("exibe apenas o título quando a opção selecionada não tem subtítulo", async () => {
    await render(
      <SelectField
        label="Cryptocurrency"
        options={options}
        value="solana"
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText("Solana")).toBeOnTheScreen();
  });

  it("não exibe as opções antes de o campo ser pressionado", async () => {
    await render(
      <SelectField
        label="Cryptocurrency"
        options={options}
        value=""
        onChange={jest.fn()}
      />,
    );

    expect(screen.queryByText("Ethereum")).toBeNull();
  });

  it("abre o modal com as opções ao pressionar o campo", async () => {
    await render(
      <SelectField
        label="Cryptocurrency"
        options={options}
        value=""
        onChange={jest.fn()}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Cryptocurrency" }));

    expect(await screen.findByText("Ethereum")).toBeOnTheScreen();
    expect(screen.getByText("ETH")).toBeOnTheScreen();
  });

  it("chama onChange com o valor da opção escolhida", async () => {
    const onChange = jest.fn();
    await render(
      <SelectField
        label="Cryptocurrency"
        options={options}
        value=""
        onChange={onChange}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Cryptocurrency" }));
    await fireEvent.press(await screen.findByText("Ethereum"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("ethereum");
  });

  it("fecha o modal depois de escolher uma opção", async () => {
    await render(
      <SelectField
        label="Cryptocurrency"
        options={options}
        value=""
        onChange={jest.fn()}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Cryptocurrency" }));
    await fireEvent.press(await screen.findByText("Ethereum"));

    expect(screen.queryByText("Solana")).toBeNull();
  });

  it("fecha o modal sem chamar onChange ao pressionar o backdrop", async () => {
    const onChange = jest.fn();
    await render(
      <SelectField
        label="Cryptocurrency"
        options={options}
        value=""
        onChange={onChange}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Cryptocurrency" }));
    await fireEvent.press(await screen.findByLabelText("Close"));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByText("Solana")).toBeNull();
  });

  it("permite trocar a opção selecionada mantendo a modal com as demais opções", async () => {
    const onChange = jest.fn();
    await render(
      <SelectField
        label="Cryptocurrency"
        options={options}
        value="bitcoin"
        onChange={onChange}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Cryptocurrency" }));
    await fireEvent.press(await screen.findByText("Solana"));

    expect(onChange).toHaveBeenCalledWith("solana");
  });
});
