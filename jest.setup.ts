/**
 * Configuração global do Jest.
 *
 * Aqui só são mockados *limites externos* do projeto (rede é mockada nos
 * testes que precisam dela, armazenamento local e bibliotecas nativas).
 * Nenhum componente, hook ou utilitário do app é mockado.
 */
import "@testing-library/jest-native/extend-expect";
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);
