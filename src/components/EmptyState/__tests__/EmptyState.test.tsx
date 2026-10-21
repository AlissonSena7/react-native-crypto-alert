import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { EmptyState } from "@components/EmptyState/EmptyState";

describe("EmptyState", () => {
  it("exibe o título do estado vazio", async () => {
    await render(
      <EmptyState icon={<Text>★</Text>} title="No alerts yet" />,
    );

    expect(screen.getByText("No alerts yet")).toBeOnTheScreen();
  });

  it("exibe o título como cabeçalho para acessibilidade", async () => {
    await render(
      <EmptyState icon={<Text>★</Text>} title="No alerts yet" />,
    );

    expect(screen.getByRole("header", { name: "No alerts yet" })).toBeOnTheScreen();
  });

  it("exibe a descrição quando informada", async () => {
    await render(
      <EmptyState
        icon={<Text>★</Text>}
        title="No alerts yet"
        description="Crie o seu primeiro alerta de preço."
      />,
    );

    expect(
      screen.getByText("Crie o seu primeiro alerta de preço."),
    ).toBeOnTheScreen();
  });

  it("não exibe a descrição quando ela não é informada", async () => {
    await render(
      <EmptyState icon={<Text>★</Text>} title="No alerts yet" />,
    );

    expect(screen.queryByText(/Crie o seu primeiro/)).toBeNull();
  });

  it("exibe o ícone informado", async () => {
    await render(
      <EmptyState icon={<Text>★</Text>} title="No alerts yet" />,
    );

    expect(screen.getByText("★")).toBeOnTheScreen();
  });

  it("exibe a ação quando informada", async () => {
    await render(
      <EmptyState
        icon={<Text>★</Text>}
        title="No alerts yet"
        action={<Text>Create Alert</Text>}
      />,
    );

    expect(screen.getByText("Create Alert")).toBeOnTheScreen();
  });

  it("não exibe a ação quando ela não é informada", async () => {
    await render(
      <EmptyState icon={<Text>★</Text>} title="No alerts yet" />,
    );

    expect(screen.queryByText("Create Alert")).toBeNull();
  });
});
