import { fireEvent, render, screen } from "@testing-library/react-native";
import { ConditionOptionRow } from "@components/ConditionOptionRow/ConditionOptionRow";

describe("ConditionOptionRow", () => {
  it("exibe o título e a subtítulo da opção", async () => {
    await render(
      <ConditionOptionRow
        value="above"
        selected={false}
        title="Above target price"
        subtitle="Alert when price goes above"
        variant="above"
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText("Above target price")).toBeOnTheScreen();
    expect(screen.getByText("Alert when price goes above")).toBeOnTheScreen();
  });

  it("expõe o papel de opção de rádio", async () => {
    await render(
      <ConditionOptionRow
        value="below"
        selected={false}
        title="Below target price"
        subtitle="Alert when price goes below"
        variant="below"
        onSelect={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("radio", { name: "Below target price" }),
    ).toBeOnTheScreen();
  });

  it("marca a opção como selecionada quando ela é a condição ativa", async () => {
    await render(
      <ConditionOptionRow
        value="above"
        selected
        title="Above target price"
        subtitle="Alert when price goes above"
        variant="above"
        onSelect={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("radio", { name: "Above target price" }),
    ).toBeSelected();
  });

  it("não marca a opção como selecionada quando ela não é a condição ativa", async () => {
    await render(
      <ConditionOptionRow
        value="above"
        selected={false}
        title="Above target price"
        subtitle="Alert when price goes above"
        variant="above"
        onSelect={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("radio", { name: "Above target price" }),
    ).not.toBeSelected();
  });

  it("chama onSelect com o valor da opção ao pressionar", async () => {
    const onSelect = jest.fn();
    await render(
      <ConditionOptionRow
        value="below"
        selected={false}
        title="Below target price"
        subtitle="Alert when price goes below"
        variant="below"
        onSelect={onSelect}
      />,
    );

    await fireEvent.press(screen.getByRole("radio", { name: "Below target price" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("below");
  });
});
